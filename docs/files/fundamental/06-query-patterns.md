# Query Patterns

Builds on `04-network-transport.md` (PowerSync vs. direct-API paths) and `05-storage-indexing.md` (index/partition toolbox). This doc covers *how queries are shaped and combined* once they reach either path — the layer that actually determines whether a screen feels instant or sluggish, independent of how well the underlying storage is indexed.

## What a query actually is, and why "patterns" matter

A query is a request for specific data, sent to wherever that data lives — Postgres directly, the Hono API, or PowerSync's local SQLite. The concept is simple; what makes it worth a whole doc is that **a screen almost never needs one query — it needs a specific combination, and *how* they're combined has real, felt cost**, independent of whether each individual query is well-indexed.

## N+1 — the core failure shape

Fetch a list (1 query), then fire one additional query *per item* in that list (N more queries). Example: "show this week's wellbeing entries, with the owner's name next to each" — done naively, that's 1 query for the list plus 7 more (one per entry) = 8 round-trips for one screen. Not wrong, just wasteful — and it gets linearly worse as the list grows. **The fix: ask for the list and its related data together, in one query**, not one-plus-many.

**Not paradigm-specific** — this happens in REST, GraphQL, and RPC alike; it's a query-*design* problem, not something any client library or API style automatically prevents. GraphQL makes it harder to *over-fetch* from the client's perspective, but a naive resolver can still do N+1 internally on the server side (the standard GraphQL fix for this is called dataloader batching). REST/RPC require the endpoint itself to be shaped correctly (a single `getWeeklyEntriesWithOwners`-style call, not `getWeeklyEntries` + N calls to `getOwner`).

**Where this connects to an already-made decision:** the generated-columns fix for hot `payload jsonb` fields (`01-data-architecture.md`) is partly an N+1 prevention move — if a list screen needs a field buried in jsonb, pulling it into a real column means it can be selected directly in the list query, avoiding a per-row follow-up fetch to unpack `payload`.

**Why this matters more on mobile than "in general":** each extra query that goes over the network (not local SQLite) costs a real round-trip — tens of milliseconds on good WiFi, potentially hundreds on a poor mobile connection. Eight sequential round-trips isn't just "eight times slower" in a rough sense — on bad connectivity it can make a screen feel broken rather than merely slow.

## Waterfalls — a related but distinct shape

Not "too many queries" — **queries waiting on each other when they didn't need to.** Query 1 fetches "which school does this user belong to"; only after it resolves does Query 2 fire, fetching that school's announcements — even though, if the school were already known, both could have started at the same time. The fix: **parallel fetching** for genuinely independent queries; accept sequential cost only where a real dependency exists, not as an accident of component structure. Directly relevant to Gurudevi's tab architecture (Self, Workspace, Community, Library, Profile) — switching tabs shouldn't wait on an unrelated parent query that happens to sit above it in the component tree.

## Where each failure mode actually bites, by path

- **PowerSync-backed screens** — data already lives in local SQLite on the device; "querying" it doesn't cross the network at all. N+1/waterfall costs are minimal here — largely already solved by the architecture.
- **Direct-API screens** — every query genuinely travels Hono ↔ Postgres and back. This is where N+1 and waterfalls are real, felt costs, and where the fixes above actually matter.

## Pagination — a real, concrete decision with a wrong-by-default trap

Any screen showing "more than fits on one screen" (event history, library catalog browsing, community feed) needs pagination — fetching results in pages rather than all at once. This is a genuinely separate concern from N+1/waterfalls, worth its own section since the *default*, most-obvious approach is the one that breaks at scale.

**Offset pagination (`LIMIT 10 OFFSET 100000`) is the intuitive default, and it's the wrong one for anything beyond a few thousand rows.** The mechanism: Postgres must actually scan and discard every row before the offset — the query gets linearly slower as the offset grows, regardless of indexing. Beyond the performance problem, there's a real **correctness** problem: if a row gets deleted between two page requests, every row after it shifts position, so a user paging through results can silently skip a row that shifted into a page they already viewed, or see a duplicate. For a wellbeing/reflection app, silently dropping a row from someone's own history is a real, meaningful bug, not just a performance nit.

**Cursor/keyset pagination is the correct default, and it's what GitHub, Twitter, and Facebook actually use for exactly this reason.** Instead of "skip N rows," it fetches "rows after the last one I saw" — `WHERE (occurred_at, id) > (last_seen_timestamp, last_seen_id) ORDER BY occurred_at, id LIMIT 20`. This avoids the scan-and-discard cost entirely (an index on the cursor columns makes it a direct seek, not a scan) and is immune to the insert/delete-shifting problem, since each row is referenced by its own stable identity, not its position in a list. **The one real limitation, worth being upfront about:** you can't jump to an arbitrary page number with keyset pagination — only "next page" from wherever you are. For Gurudevi's actual UI shapes (infinite-scroll event history, feed-style browsing), this is a non-issue — nothing in the current tab architecture calls for "jump to page 47."

**The compound-cursor detail that actually matters for correctness:** the cursor must be built from a genuinely unique, stable ordering — `occurred_at` alone isn't safe if two events can share a timestamp (a real possibility per `01-data-architecture.md`'s millisecond-precision discussion); the cursor needs `(occurred_at, id)` together, exactly matching the composite-index pattern already planned in `05-storage-indexing.md`.

**Applied directly:** any `events`-backed list screen (Self history, Workspace activity, Community feed) should use keyset pagination on `(occurred_at, id)` from day one — this isn't a "revisit at scale" item like partitioning or Redis; pagination approach is cheap to get right from the start and genuinely painful to migrate later, since it changes the API contract (cursor token vs. page number) that clients depend on.

## Query planning as a discipline, not a one-time check

`05-storage-indexing.md` already says "always verify with `EXPLAIN ANALYZE`, never assumption" for individual indexes — worth generalizing that into an actual habit, not a one-off check. **The real workflow, restated as a repeatable practice:** measure first with `EXPLAIN ANALYZE` to find the actual bottleneck (not a guessed one), add indexes strategically for the specific columns appearing in `WHERE`/`JOIN`/`ORDER BY` for *that* query, rewrite the query to avoid named anti-patterns (`SELECT *` when only specific columns are needed, offset pagination, subqueries that could be joins), and only then consider configuration tuning. **The `EXPLAIN` cost number is a reliable relative metric even when absolute execution time varies with system load** — worth using cost comparisons during development even on a local machine that doesn't match production hardware.

**This is squarely an application-developer-level practice for Gurudevi's actual scale — not the query-plan-caching/distributed-rerouting research that shows up when searching "query optimization" broadly.** That tier of material (plan cache internals, distributed query rerouting, SharedDB-style multi-query batching) is genuinely enterprise/warehouse-scale territory — relevant to systems running thousands of queries per second across distributed nodes, not to an app at Gurudevi's current or near-future size. Worth naming explicitly so future-you (or an agent) doesn't over-engineer toward that tier prematurely — same "don't reach for it before a measured constraint" discipline as Redis and partitioning.

## Batching — combining what genuinely belongs together, without over-combining

A related but distinct technique from both N+1-avoidance and pagination: when multiple *independent* small requests are about to fire close together, combining them into one round-trip can help — but only when they're genuinely needed together, not as a blanket policy. The GraphQL-world "dataloader" pattern already named under N+1 is one specific instance of this: collect several individual lookups that would otherwise fire separately within one request cycle, and issue them as a single batched query instead. **Worth keeping this narrow and deliberate** — batching unrelated requests just to reduce round-trip count can introduce its own problems (one slow item in a batch delays everything else in it) — it's a targeted fix for a specific, identified N+1-shaped bottleneck, not a general-purpose default to reach for everywhere.

## API paradigm — open decision, not yet made

**Confirmed fact:** Hono is the backend framework. Hono is paradigm-agnostic — it can serve REST, RPC-style (Hono's own typed client, tRPC-like), or GraphQL equally well. **Nothing beyond Hono itself has been decided.** Current working assumption is REST, but this is explicitly not committed — treat any REST-specific advice below as applying only if that assumption holds, not as a settled architecture.

### The three real options, plain-language

- **REST** — resource-oriented (`/events/42`), standard HTTP verbs. Simplest, most universal, works through any proxy, debuggable with `curl`. Real cost: the server decides the response shape per endpoint — a screen needing 3 fields from a large object still gets the whole object (over-fetching); data from two resources needs two requests unless the endpoint is deliberately combined (under-fetching, i.e. N+1 baked into the basic shape).
- **RPC-style (Hono's native typed client, or tRPC)** — call backend functions directly, full TypeScript type inference end-to-end, no schema or code generation needed. Real cost, worth stating plainly: **not designed for external/third-party consumption** — type inference only works when client and server share the same TypeScript codebase. An OpenAPI spec can be generated from it, but that's a bolt-on, not the primary design.
- **GraphQL** — client specifies exactly which fields it needs, potentially spanning multiple resources, in one request — directly solves over/under-fetching. Costs real complexity: a schema, a resolver layer, and genuinely suits many-different-client-shapes scenarios (public APIs, large component-heavy UIs using Fragments to declare per-component data needs) more than it suits a single internal app.

### The offline caveat — verified, real, and path-dependent, not paradigm-dependent

RPC-style/tRPC has no built-in offline story — it's a request/response call assuming a live connection. Real developer reports (including one on almost this exact stack — Expo, tRPC, Hono, daily wellbeing-style tracking) describe offline mutation support as an open, unresolved problem, not a solved feature. **This risk applies to whichever paradigm is chosen for the direct-API path** — REST has the same fundamental issue (no built-in offline queue either); it's not an argument specifically against RPC. The actual mitigation already exists in the architecture: core, offline-critical, daily-use data (wellbeing, notes) already routes through **PowerSync**, not the direct API, specifically because PowerSync solves this problem natively. The direct-API path (whichever paradigm it ends up using) was only ever meant for agents, admin actions, and non-offline-critical features.

**Open, concrete question for future feature design:** any *new* feature that's both core/daily-use and currently planned for the direct-API path inherits this risk regardless of paradigm — the test is "does this need to work with no connection," and if yes, it belongs behind PowerSync's sync (or a deliberately-built local queue) rather than a bare direct-API call.

### Keeping the door open for external exposure, without deciding now

Given monorepo + possible-later external exposure is a real, stated possibility: the low-regret path, whichever paradigm is chosen internally, is a documented, named migration pattern — **build the internal API with clean, resource-shaped procedure/endpoint boundaries now** (one clear resource or action per procedure/endpoint, not ad-hoc mixed bags), and if external exposure becomes real later, **wrap a thin translation layer (REST or GraphQL) in front of the existing internal logic**, rather than rebuilding it. This costs nothing today and doesn't require committing to GraphQL or any specific external paradigm now. "Hybrid" (different paradigms for different surfaces — internal app vs. a future external-facing Library API, say) is a normal, common pattern, not a compromise.

## Open Questions / Not Yet Resolved

- **API paradigm itself** — REST vs. RPC-style vs. other, genuinely undecided; current assumption is REST but unconfirmed
- Whether any planned direct-API feature actually needs offline support (would force it toward PowerSync/local-queue regardless of paradigm chosen)
- Concrete N+1 audit of the five-tab screens (Self, Workspace, Community, Library, Profile) — not yet done, needs real screen-by-screen design, not assumed
- Whether any Gurudevi screen genuinely needs jump-to-page-number (would force offset pagination or a hybrid approach) — current assumption is no, unconfirmed against actual UI designs
- At what point (if ever) Gurudevi's actual query volume would justify the enterprise-tier techniques explicitly scoped out above (plan caching, distributed rerouting) — not a near-term concern, flagged for completeness only
