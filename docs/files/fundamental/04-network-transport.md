---
title: "Network & Transport Layer"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Network & Transport Layer

Two genuinely separate consumer paths sit on top of the same Postgres data, each with its own transport shape, cost model, and design levers. Don't conflate them — a PowerSync optimization does nothing for the direct-API path and vice versa.

**Decided:** AI agents and any MCP-server-style integration go through the direct API only — never direct-to-Postgres, never through PowerSync. This is a settled architectural fact, not an open question. The Hono API is the single enforcement point (Cedar policy checks live there) regardless of whether the caller is a human-driven UI action or an agent tool-call.

---

## Layer Model — where everything in this doc actually sits

Two real reference models exist, not one, and they disagree in a specific, useful way. **OSI** (7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application) is *prescriptive* — a theoretical ideal, valuable for making boundaries explicit even though no real stack implements it exactly. **TCP/IP** (4 layers: Network Access, Internet, Transport, Application) is *descriptive* — built from what actually got deployed. Real-world docs and tooling overwhelmingly use TCP/IP-model language. The mapping between them is a genuine collapse: TCP/IP's single **Application** layer merges OSI's Application + Presentation + Session; TCP/IP's **Network Access** merges OSI's Data Link + Physical.

**Why this matters here:** everything covered so far in this doc — HTTP, WebSockets-as-used-by-PowerSync, MCP, QUERY, the Postgres Wire Protocol — is entirely **Application layer** (TCP/IP sense), all riding on **TCP** (Transport layer) underneath. That's *why* they compose and swap so freely — same layer, different application-level protocols. Nothing in Gurudevi's stack currently reaches down into Transport-layer protocol choice (TCP vs. UDP) or lower as a live decision — those are given by the platform, not architected.

**TLS's real position — and why it didn't fit cleanly into the application-protocol list above.** TLS is OSI's Presentation layer, folded into TCP/IP's "Application" bucket — it's not one more item in the HTTP/WebSocket/MCP list, it's a cross-cutting layer that wraps *each* of them independently: HTTPS = HTTP+TLS, WSS = WebSocket+TLS, and Postgres's own wire protocol has its own separate TLS setting for the pooler connection. Three independent TLS configurations in this stack, not one.

**TLS vs. UDP — a real, structural incompatibility, not a missing feature.** TLS assumes reliable, ordered delivery (that's TCP's job) — if a handshake message is lost or arrives out of order, TLS just breaks the connection rather than recovering. It cannot run directly on UDP. Two real, separate protocols exist to bridge this gap, and they're genuinely different things, not TLS variants:
- **DTLS** (Datagram TLS) — TLS's handshake and cipher suites, re-engineered with its own retransmission/sequencing machinery to survive UDP's unreliability directly. Used for latency-sensitive, loss-tolerant traffic (WebRTC media, VPNs) — not used anywhere in Gurudevi's stack.
- **QUIC** — not TLS-on-UDP at all; a full new transport protocol built on UDP with TLS 1.3 integrated natively rather than layered on top. This is what makes HTTP/3 faster to establish than classic HTTPS: TCP+TLS layered sequentially costs two round trips, QUIC does the equivalent in one (or zero, on connection resumption).

**Relevance to Gurudevi, honestly: none of this is a live decision for this stack right now.** Everything here (Hono API, PowerSync's WebSocket transport, Postgres/Supabase pooler) runs over TCP+TLS (HTTPS/WSS), which is the default, correct, unremarkable choice. DTLS and QUIC solve problems (real-time media, ultra-latency-sensitive mobile handoffs) that Gurudevi doesn't currently have. Worth knowing the shape exists — not worth designing toward.

---

## Path 1 — PowerSync (device-bound, offline-first, pre-scoped)

### What it actually is

Not request/response. A persistent, long-lived stream — architecturally closer to database replication (WAL-following) than to an API. A client opens a sync session with a JWT (`user_id` + Sync Rule parameters) and a list of buckets it already has plus the last operation ID in each; the server responds with a continuous stream of **checkpoint available → data → checkpoint complete**, then waits for the next checkpoint and repeats. WebSocket streaming is now the default transport (HTTP streaming still available, no longer default) — moving further from conventional HTTP, not toward it.

### Buckets — the real unit of network cost

All synced data is grouped into buckets; a bucket is a collection of synced rows, scoped by parameter (e.g. `user_todo_lists["A"]` vs `user_todo_lists["B"]`, parameterized by `user_id` from the JWT). **Buckets always sync as a whole** — a client subscribed to a bucket gets the entire bucket's operation history, not a filtered subset. This means **bucket parameterization is your actual network-cost lever**, not row-level query optimization (which is a Postgres-side concern that never reaches this layer). Given multi-tenant + per-user + the coral-band recency window already in `01-data-architecture.md`, the natural parameterization is something like `(tenant_id, user_id, recency_bucket)` — not one global bucket, not one bucket per event.

### Integrity — checksums, not cryptographic verification

Client and server each compute a per-bucket checksum (hash-of-hashes over the bucket's operations) at each checkpoint. If they mismatch, the client **deletes the entire bucket locally and re-downloads it from scratch** — there's no partial-patch mechanism. Explicitly *not* cryptographically secure — designed to catch bugs/corruption, not tampering (tampering is out of scope for this layer; auth/authz is a separate concern, already handled by JWT + Sync Rules + Cedar).

### Compaction

Operation history (PUT/REMOVE, not just current state) grows unboundedly without maintenance — needed for offline-resume (a client back online after weeks replays from its last known operation ID). Compaction periodically replaces stale updates with marker entries, preserving checksums. Operational task, not yet solved for Gurudevi: who runs it, how often. **Directly analogous to Pattern 3 (decay as a tuned knob) from `00-biomimicry-principles.md`** — same idea, implemented as wire-protocol garbage collection instead of query-time weighting.

### Write checkpoints

Separate mechanism from read-sync: created only after a client's local upload queue is fully processed by the backend. Server tracks its own Postgres LSN (CDC position) and confirms replication back to the client inside the normal data stream. This — not "did I send it" — is the real mechanism behind any "synced ✓" UI indicator: it means the write has round-tripped through Postgres and come back confirmed.

### Schemaless wire protocol

Rows travel as raw JSON; the protocol itself carries no type information. The client SDK's type system (`text`/`integer`/`real` ceiling on web — see `01-data-architecture.md`) is the *only* place types are enforced client-side — there's no protocol-level validation layer underneath it to lean on.

### Why PowerSync is built this way — the rationale, not just the mechanism

Every tradeoff above derives from one constraint: **serving tens of thousands of concurrent long-lived connections per service instance, each holding a personalized data slice.** That's an "hold open many stateful streams cheaply, forever" problem, not a "answer one query fast" problem. The recurring pattern across every design choice: **do the expensive thing rarely and in bulk; do the cheap thing continuously.**
- Whole-bucket sync (not per-row diffing) → compute the change once per bucket, fan out to many clients, instead of O(clients × changes) work
- Non-cryptographic checksum → cheap enough to run continuously on every checkpoint; tampering is handled by a different layer entirely, so paying crypto-hash cost here would defend against a threat this layer was never responsible for
- Full-bucket redownload on mismatch (not fine-grained patching) → avoids maintaining rich per-operation verification state continuously for an event (corruption) that should be rare
- Scheduled compaction (not continuous minimality) → periodic bulk sweep is cheaper than perfectly-minimal history maintained in real time on every write

**This is the same optimization instinct as the biomimicry principles in `00-biomimicry-principles.md`** — Pattern 8 (collective, simultaneous resolution) and Pattern 3 (decay as tuned knob) are structurally identical to what PowerSync's engineers arrived at independently for entirely mechanical, scale-driven reasons. Worth treating as real convergent validation, not coincidence: two different domains (biology, distributed systems) hit the same shape when the underlying constraint (do the costly thing rarely, in bulk) is the same.

### What lives here vs. what doesn't

PowerSync is the path for: UI rendering, offline-capable device state, personalized per-user views. It is **not** the path for agents, cross-user/cross-tenant queries, or anything not pre-declared as a Sync Rule/Stream ahead of time.

---

## Path 2 — Direct API (Hono, request/response, all non-UI-render consumers)

Everything that isn't PowerSync goes here: AI agents, MCP-server-exposed tools, any future integration, and any conventional (non-offline) server-to-server call. Single enforcement point — Cedar policy checks live in this layer, applied uniformly whether the caller is a human action forwarded from the UI or an agent tool-call.

### RFC 10008 — the HTTP QUERY method (published June 2026, Proposed Standard)

Fills a real, long-standing gap: **safe and idempotent like GET, but carries a request body like POST.** Solves the specific problem of complex, structured, read-only requests — GET forces filters into a URL with uncoordinated proxy size limits (RFC 9110 only recommends 8000 octets as a floor) and awkward encoding for nested/structured data; POST carries a body fine but signals nothing about safety, so it can't be cached or safely retried. First new HTTP method since PATCH (2010) — a 16-year gap.

**Directly relevant to this path specifically:** an agent asking a complex, ad-hoc, structured, read-only question (cross-referencing wellbeing + attendance across a date range, for example) is exactly the shape QUERY was designed for — far more than typical UI-driven requests need. QUERY is explicitly cacheable (cache key must include the request body — a real risk if a cache implementation hashes/normalizes the body incorrectly, opening cache poisoning/deception) and requires CORS preflight (not safelisted).

**Adoption status:** Proposed Standard, IETF Standards Track, full formal approval — not a draft or vendor extension. Real adoption expected 2027–2028 as server/client tooling catches up (Node.js has parsed it natively since early 2024; browsers still evaluating as of publication). **Not an adopt-now decision** — track as a future option for the direct-API layer's complex read endpoints (agent queries, filtered rollup fetches), revisit in 6–12 months. Doesn't touch PowerSync at all — QUERY is a request/response primitive; PowerSync is a persistent stream, architecturally unrelated.

### The layer underneath this path — Postgres Wire Protocol

The Hono API's own connection to Postgres (via the connection pooler — see `01-data-architecture.md`) doesn't use HTTP at all. It uses the **Postgres Wire Protocol (PWP)** — a separate, TCP-based Application-layer protocol (same layer as HTTP, different protocol), purpose-built for query/result exchange rather than generic request/response. Worth naming explicitly: it's a second, independent Application-layer protocol already present in the architecture, distinct from every HTTP-family protocol discussed elsewhere in this doc.

### TLS is three independent settings here, not one

Given the layer-model section above, this path alone has TLS decisions at two separate points, worth confirming rather than assuming: (1) Hono API ↔ client, typically HTTPS by default on any real host; (2) Hono API ↔ Postgres pooler, PWP's own TLS mode — worth explicitly verifying Supabase's pooler is configured to require TLS, not merely support it. PowerSync's own client↔service connection (WSS) is the third, covered in Path 1 above.

### Open questions on this path — not yet explored

- Caching strategy for agent-facing read endpoints (once QUERY or an equivalent is viable)
- Rate-limiting/cost-control for ad-hoc agent queries vs. predictable UI traffic patterns
- Whether agent-facing endpoints need their own precomputed/denormalized views (a "digest" shaped for LLM consumption, distinct from UI-rollup tables) — flagged in `01-data-architecture.md` as an open question, unresolved
- Standard REST/JSON-RPC/other shape for the Hono API surface itself — not yet decided

---

## Discernment Framework — Sorting Any New Transport/Coordination Term

New tool and protocol names will keep surfacing (this list isn't closed). The recurring confusion is treating things from different axes as if they compete. Four separate questions, not one:

**Axis 1 — One question, one answer, no ongoing relationship.**
Plain HTTP request/response; RFC 10008 QUERY (a better-shaped version of this for complex, structured, cacheable reads). Answers "give me an answer right now."

**Axis 2 — Keep me updated continuously, ongoing relationship.**
WebSockets (generic: either side can push, anytime); PowerSync (a specific, opinionated product built on WebSockets, scoped to one job: keep one user's one device current, offline-capable). Answers "tell me when something changes, don't make me ask again."

**Axis 3 — Let an AI agent discover and call capabilities it wasn't hardcoded to know about.**
MCP. **Not a transport** — a discovery/invocation protocol that sits *above* whichever transport carries it (can run over plain HTTP or a persistent connection; MCP doesn't care). Answers "how does an agent find out what it's allowed to call, and call it." Comparing MCP to HTTP or WebSockets directly is a category error — the fair comparison is "plain REST vs. MCP-wrapped" as two shapes for the *same* direct-API path, not MCP vs. transport mechanisms.

**Axis 4 — Manage the lifecycle/pacing of calls a client makes, on top of whatever transport is chosen.**
React Query / TanStack Query (caching, dedup, staleness, background refetch, keeping components in sync without prop-drilling) and TanStack Pacer (debounce/throttle/batch — controlling *when* calls fire, not what carries them). Neither moves bytes; both coordinate calls that some other mechanism above already carries.

**The test to apply to any new name:** does it answer *how do bytes move* (Axis 1–2), *how does an agent discover/call things* (Axis 3), or *how does the client manage the calls it already knows how to make* (Axis 4)? Confusion almost always comes from comparing across axes as if they were alternatives.

### Applied to Gurudevi specifically

- **PowerSync** (Axis 2) — already decided, one job: UI rendering, offline-capable device state
- **Direct API / Hono** (Axis 1) — already decided, the only path for agents, MCP-wrapped tools if/when exposed, and any non-UI-render consumer
- **MCP** (Axis 3) — a possible *shape* for the direct-API path later, not a new pillar; doesn't change anything already architected
- **QUERY** (Axis 1 refinement) — a future option for the direct-API path's complex reads, not adopt-now
- **React Query** (Axis 4) — redundant where PowerSync already owns the data (its local SQLite + reactive `watch()` already gives cache/dedup/sync-across-components for free) — but the right tool for anything hitting the Hono API directly, outside PowerSync's scope (admin screens, agent-adjacent UI)
- **TanStack Pacer** (Axis 4) — relevant wherever the direct-API path has bursty/typed-input-driven calls (search-as-you-type against Hono, not against PowerSync-backed local data)
- **Raw WebSockets outside PowerSync** — no stated need currently; PowerSync already covers the one "keep it live" requirement in this architecture

---



| | PowerSync | Direct API |
|---|---|---|
| Shape | Persistent stream, push-based | Request/response |
| Consumer | Single device, one user, offline-capable | Server-side, agents, ad-hoc, online-only |
| Cost unit | Bucket (whole-sync) | Per-request |
| Scoping | Pre-declared (Sync Rules/Streams) | Decided per-request, enforced by Cedar at call time |
| Transport | WebSocket (default) / HTTP streaming | Conventional HTTP; QUERY a future option for complex reads |
| Type system | 3-type ceiling client-side (`text`/`integer`/`real`) | Whatever Postgres + Hono expose — no such ceiling |

Neither path replaces the other. The `events` table and Postgres remain the one underlying truth; both paths are just readers/writers of it through different, purpose-built mechanisms.
