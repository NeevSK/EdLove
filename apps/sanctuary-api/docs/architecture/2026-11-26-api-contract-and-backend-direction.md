---
title: "API contract and backend direction: what survives, what stays TypeScript, when Rust"
status: "draft"
created: 2026-11-26
updated: 2026-11-26
author: "Naveen"
scribe: "Claude"
tags: [api, contract, orpc, openapi, typespec, protobuf, connect, rust, python, decision-brief]
---

# API contract and backend direction

A decision brief. It proposes; the owner decides. It starts from the code on
`integrate/worlds-and-upstream` (commit `58e4e779`), then checks the outside options against
current sources, then gives one reversible default and a small first step.

The question Neev asked: Python or Rust behind the API, Protobuf / Smithy / TypeSpec for the
contract, with Rust compile times and the trustworthiness of LLM-written code as real concerns.
A ChatGPT analysis was pasted as input; every claim from it is checked here against the repo or a
source, not taken as given.

## 1. What actually exists today

| Piece | Where | Fact |
| --- | --- | --- |
| The v1 API | `packages/core/src/api/v1/contract.ts` | 6 capabilities: `identity.session`, `identity.scopes`, `identity.entry`, `identity.createInitialBond`, `identity.syncCredentials`, `authority.refreshSnapshot`. Declared with oRPC `oc` + Zod 4. |
| Server | `apps/sanctuary-api/src/core/app.ts`, `router.ts` | Hono `5.0.0-rc.1` + oRPC `2.0.0-beta.49` `RPCHandler`, mounted at `/api/v1`, on Node (Bun optional). |
| Wire protocol | `packages/core/src/api/v1/client.ts` | **RPC only.** Clients use `RPCLink`; the server uses `RPCHandler` and `RPCSerializer` for errors. `@orpc/openapi` is not installed in any workspace. No `OpenAPILink` anywhere. |
| Clients | `apps/gurudevi-mobile/src/lib/v1Client.ts`, `apps/gurudevi-web/lib/sanctuary/v1Entry.ts` | Both TypeScript. Both import the contract type from `@repo/core`; nothing is generated. |
| Offline data | `powersync/sync-config.yaml` | Most reading happens through PowerSync (Postgres to SQLite on the device). The API only hands out a short-lived sync grant (`identity.syncCredentials`). |
| Offline authority | `packages/policies`, `packages/core` | A signed permission snapshot from `authority.refreshSnapshot`, checked on the device with `@cedar-policy/cedar-wasm` 4.14.0. |
| Capability catalog | `apps/sanctuary-api/src/modules/catalog.ts` | `CapabilityManifest` per capability: module, `kind` (query/command), `channels`, `assurance`, `status`, `requiredEvidence`. Fitness tests keep it equal to the contract. |
| Conformance gate | `scripts/capability-conformance.ts`, `pnpm audit:conformance` | Joins intent (subdomain cards), contract, router, Cedar, tests and client call sites per capability; a ratchet stops gaps from rising. |
| OpenAPI file | `apps/sanctuary-api/docs/api/openapi.json` | **Stale.** Lists retired `self.*` paths with empty schemas. Not generated from the v1 contract; nothing reads it. |
| Legacy surface | `packages/core/src/api/*contract*.ts` (71 files), legacy `RPCLink` calls to `/api` (e.g. `apps/gurudevi-web/lib/community/posts.ts`) | No server on this branch serves `/api` outside `/api/v1`. Meaning lives here but is not served. |

Three things in the repo answer parts of the question before any research:

1. **Gurudevi already runs Rust, without writing Rust.** Cedar is a Rust engine; Gurudevi
   uses it as Wasm in the browser, in React Native and on the server. PowerSync's client core is
   also Rust. The "same computation locally and on the server" idea is already real, through a
   maintained Rust library compiled to Wasm, with no Rust toolchain in this repo.
2. **Rust was decided twice and never landed.** The 2026-07-28 authorization record decided a
   Rust local PDP (`gurudevi-cedar-core`, `jni` crate, no ubrn). The 2026-10-25 v2 assessment
   proposed a Rust Cedar sidecar. No `Cargo.toml` exists on any of the 35 branches. Both times,
   the Wasm build of Cedar was enough. That is evidence about where Rust pays here, not a failure.
3. **The "what survives" hierarchy is already Gurudevi's.** The 2026-10-13 roadmap
   (*stable meaning, replaceable placement*) puts capability semantics and authority above
   transport adapters (oRPC, OpenAPI, channels, AI, MCP), and recommends keeping Hono + oRPC.
   ChatGPT's "domain semantics, capability contract, implementation, binding, consumer" ladder is
   the same idea in new words. This brief keeps the repo's words: **capability**, **contract**,
   **channel** (the catalog already has `app`, `workers`, `bots`, `mcp`, `partners`, `operators`).

## 2. Checking the ChatGPT claims

| Claim | Verdict |
| --- | --- |
| "Check whether Gurudevi uses RPCLink, OpenAPILink or both" | Answered: RPC only (section 1). |
| `OpenAPILink` can talk to a server not written in oRPC | Plausible, with conditions. oRPC's docs say `OpenAPIHandler` serves "OpenAPI Link and other OpenAPI-compliant clients"; the link needs the contract up front, with method and path on every procedure (`.route({ method, path })` or `openapi()` meta), and the server must also match oRPC's error body or the link must be given a custom error decoder. Not tested here. |
| Existing oRPC clients won't automatically work with a Rust server | True. The RPC wire format is oRPC's own and versioned by oRPC: our own research notes "a v1 client cannot communicate with a v2 server" (`2026-10-25-orpc-v2-beta-temporal-grounded-research.md` §2.4). A Rust server would have to re-implement that format or the clients move to a public one. |
| Generating OpenAPI alone is not enough; the server must implement it | True, and the stale `openapi.json` is the proof: a document nobody checks drifts. |
| A Rust ConnectRPC implementation exists | True. `connectrpc` crate 0.9.1 (2026-09-21), Tower-based, Axum via `into_axum_service()`, passes the full Connect conformance suite (3,600 server and 6,872 client tests). Pre-1.0: "the API surface ... may shift in 0.x". Contributed to the Connect project on 2026-08-26. |
| A capability spec with bindings can drive an "architecture compiler" | The capability description already exists as `catalog.ts` + cards + `audit:conformance`. A new YAML spec would be a second system beside it. See section 5. |

## 3. Contract format

What matters for a solo developer with two TypeScript clients, one TypeScript server and six
capabilities:

| Option | Source of truth | Fit today | Cost | Gives |
| --- | --- | --- | --- | --- |
| **oRPC contract (Zod), plus a generated OpenAPI projection** | `contract.ts`, as now | Exact: both clients import it | Small: add `@orpc/openapi`, generate, gate | A portable, standard document any language can read, derived, never hand-edited |
| TypeSpec as source | `.tsp` files | Clients would consume generated Zod/types | A build step and a second language; refinements like `isEdloveAccountId` do not survive into generated Zod | Strong design-first tooling. OpenAPI 3 and JSON Schema emitters are stable; the protobuf emitter and the client/server emitters are still preview (TypeSpec 1.x, now 1.18) |
| Protobuf + Connect | `.proto` | Both apps change transport; PowerSync is unaffected | High: new wire, new clients, protobuf-JSON mapping rules; Rust side pre-1.0 | The best multi-language story and standard streaming |
| Smithy | `.smithy` | Poor | Java/Gradle toolchain; ecosystem centred on AWS-style services (not re-checked this session) | Rust server SDK (smithy-rs) |

**Reading.** The contract's *meaning* already lives in `contract.ts` and the catalog. What is
missing is only a **public, checked projection** of it, so a non-TypeScript consumer (or a
second implementation) has something standard to read. OpenAPI generated from the existing
contract gives that at the lowest cost and keeps one source. TypeSpec and Protobuf would each
make the contract a second file beside `contract.ts`, which the 2026-11-13 rule forbids unless one
replaces the other entirely.

A useful detail: the v1 contract is already plain-JSON-shaped. Dates are ISO strings
(`z.iso.datetime()`), times are integers, there are no `Date`, `BigInt`, `Map` or `Set` values.
So the RPC format's extra type metadata buys nothing today, and an OpenAPI projection is lossless.

## 3b. Where response time goes (added after Neev's latency concern)

Almost all of a call's time is network and hosting, not code. Read from the code; round-trip
times are estimates until measured with `Server-Timing`.

| Cost | Where | Rough size |
| --- | --- | --- |
| API in Singapore, database in Mumbai | `render.yaml` (`region: singapore`); production pooler `aws-1-ap-south-1` (per `docs/archive/.../oss-public-release-security-checklist.md`) | ~60 ms per database round trip (estimate) |
| Identity check | `security.authenticate` | 1 round trip |
| Per-minute budget | `platform.consumeBudget` (begin, insert, commit) | 3 round trips |
| Handler transaction | `withAccountData`: begin, timeouts, identity re-check (2), claims, role, query, commit | ~8 round trips |
| Free Render plan | `render.yaml` (`plan: free`) | Sleeps after ~15 min idle, ~1 min to wake, 0.1 CPU |
| Node + Hono + oRPC work | `app.ts`, `router.ts` | A few ms: the most Rust could save |

Standard fixes, in order: measure each phase with a `Server-Timing` header; put the API and the
database in the same city; use an always-on instance; fold identity, budget and claims into one
database call (about 12 round trips down to 2 or 3).

**Decided by Neev (2026-11-26):** the production database moves to Singapore, next to the API.
Standing rule from now on: the API host and the database must be in the same region, and any
new host, worker or database is checked against that before it is added.

### Where to refine, in order, before Rust is even a question

Each step is measured with `Server-Timing` before and after; the next step starts only when
the numbers say the previous one is done.

1. **Measure.** `Server-Timing` per phase (auth, budget, db, handler) and a small probe from
   Sri Lanka, so every later step has a before and after.
2. **Database to Singapore** (decided). Expected: each database round trip drops from tens of
   ms to a few ms.
3. **Always-on instance.** Leave the free plan; no sleep, no minute-long wake.
4. **Fewer round trips per call.** Identity check, budget and claims in one transaction or one
   SQL function: about 12 sequential round trips down to 2 or 3.
5. **Fewer calls per screen.** Reads the phone can get from PowerSync stay off the API; the
   API carries commands and grants only.
6. **Payload and connection reuse.** Small responses, compression, keep-alive from the apps.
7. **Only then, profile the server's own CPU time.** If one capability is still measured slow
   and CPU-bound, that capability is the Rust candidate (section 4), with the bake-off first.

If Rust were adopted: server, middleware, contract types, Cedar, JSON and tracing come from crates
or generation (glue cheap models handle reasonably). JWT/JWKS, signing, transaction setup, error
mapping and the operations store are hand-written and security-critical. Timeouts, draining and
cancellation are hand-written async, where LLMs do worst in Rust. No published data exists on
Gemini Flash-class models in Rust, so the proposal is a bake-off: the same small task
(`identity.session` + auth) in TypeScript and Rust by a cheap model, checked by the same HTTP
fixtures, counting attempts, compile time and pass rate.

## 4. Backend language

What decides it, in Gurudevi's case:

- **The low-end phone does not see the server's language.** What the A24/A52 feels is payload
  size, request count, and whether the screen works offline. PowerSync and the snapshot already
  carry the offline load; the API is six small calls. A faster server does not make a 2 GB Android
  phone faster.
- **The server is not the bottleneck.** There are no load measurements showing a CPU-bound
  path. The admission limits in `app.ts` (32 in flight) are about protecting Postgres and the
  host, which a Rust server would not change.
- **Rust compile times are still a real cost.** The Rust project's 2025 survey (3,700+ answers):
  incremental rebuilds are "by far the most common complaint", and 55% wait more than ten seconds
  per rebuild. The 2026 *Fast Builds* goals (parallel front end, Cranelift, "relink don't
  rebuild") are in progress, not finished. Every Rust change also costs a cross-compile for
  Android/iOS/Wasm if it runs on the device.
- **LLM-written Rust is less reliable than LLM-written TypeScript or Python, and the
  compiler does not close the gap.** Three 2025–2026 studies agree:
  - ISSRE 2026 error study (86,726 failures, 7 models): Rust had the most compile errors of the
    four languages (23,416 vs 9,953 for C++ and 6,996 for Java), including ownership/lifetime
    (16.7%) and trait-bound errors no other language has.
  - PROBE (2026, 5 languages): "Models generally perform better in Python, C++, and Java than in
    C and Rust"; compiler feedback cut compile errors but did little for wrong answers.
  - SafeTrans (2025, C to Rust): compiler-guided repair raised successful translations from 54%
    to 80% for the best model, yet "just providing compiler error messages ... is insufficient".

  The honest reading: a strict compiler turns some wrong code into code that does not build,
  which is good, but it does not make code that builds *correct*. What makes LLM-written code
  verifiable in any language is the same set of things: a typed boundary (the contract),
  behaviour tests that pin inputs to outputs, and Cedar tests for authority. Gurudevi already
  has the tooling for all three in TypeScript.
- **Python** is strong for AI and data work, not for this API. If an AI or analysis job ever needs
  Python libraries, it belongs behind the existing `workers` channel as a job, reading the
  same contract, not as a second API server.

| Choice | Verdict for now |
| --- | --- |
| Stay TypeScript (Hono + oRPC) | **Default.** One language across server, web, mobile and contract; types flow by import. |
| Hybrid TypeScript + Rust service | Not now. Two deploys, two toolchains and a reimplemented wire format for six calls with no measured need. |
| Rust-first | No. All cost, no measured benefit to students or teachers. |
| Python for jobs | Allowed later, behind `workers`, when a named job needs a Python library. |

### When Rust is the right tool (the trigger)

Rust earns its place when **one computation must run identically on the device (offline) and on
the server, and must be fast or exact**, and no maintained library already does it. Cedar is the
model: one Rust engine, compiled to Wasm, used everywhere. If Gurudevi writes such a thing
itself (a marks/grade calculation that must agree offline and online, a scheduling solver), the
path is: a small Rust library, compiled to Wasm first (one build, runs on web, React Native and
Node), with the same JSON fixtures as the TypeScript version. Native FFI (`jni`, uniffi) only when
Wasm is measured too slow on the A24. Never a Rust *server* to get there.

## 5. "Capability with bindings": real idea, premature machinery

The idea is sound: a local calculation and the server's authoritative command are different
things, even when they share code. A fee preview on the phone does not authorise a payment. The
repo already says this in its own words: `kind: 'query' | 'command'`, `assurance`, signed
snapshots, and "every command re-checks the bond it names" (`contract.ts`).

What is premature is the machinery: a new YAML spec, binding kinds (HTTP / FFI / Wasm / CLI /
gRPC) and an architecture compiler, for six capabilities, two TypeScript clients and zero Rust.
By the repo's own *real options* rule (2026-10-13), an option needs a named trigger and a cheap
experiment; this one has neither yet. And it would be a second capability description beside
`catalog.ts`.

If the need arrives, it grows from what exists: `CapabilityManifest` gains one field for where a
capability may run (for example *device preview* vs *server authority*), and `audit:conformance`
checks it like the others. That is one field in one file, added on the day a capability actually
has a local twin.

## 6. Recommendation

**Reversible default (proposed):**

1. **TypeScript stays** for the API server, with Hono + oRPC, as the 2026-10-13 roadmap already
   says.
2. **`packages/core/src/api/v1/contract.ts` stays the one source** of the API contract, with
   `catalog.ts` as the one capability list.
3. **RPC stays the wire for Gurudevi's own apps.**
4. **Add a generated OpenAPI projection of v1**, checked in CI, replacing the stale
   `openapi.json`. It is a derived artifact: the portable description any other language (Dart,
   Kotlin, Swift, Rust, Python, partners, agents) can read.
5. **Write behaviour fixtures in plain JSON over plain HTTP** for the six capabilities, so they
   check *the API*, not the oRPC client. These are what would let a second implementation, in any
   language, prove it behaves the same. They are also the strongest guard on LLM-written code in
   any language.
6. **No Rust, Python, TypeSpec, Protobuf or Connect now.** Each has a trigger (below).

How to reverse it: delete the generator and the fixtures. Nothing else depends on them.

**Triggers to revisit:**

| Trigger | Then |
| --- | --- |
| A real non-TypeScript client (Flutter, native, partner) | Serve the OpenAPI projection as a second channel (`OpenAPIHandler`) and generate that client from it. |
| A computation that must match offline and online, measured slow or missing in TypeScript | A small Rust library compiled to Wasm, with the same fixtures (section 4). |
| Many services in several languages, or heavy streaming between them | Reconsider Protobuf + Connect; by then `connectrpc` may be 1.0. |
| oRPC 2.0 stalls or breaks its wire again | The OpenAPI projection and HTTP fixtures are the exit: any server that passes them can replace it. |
| A named job needs a Python library | A Python worker behind the `workers` channel. |

## 7. First step for this week (small, needs Neev's yes)

About half a day, one PR, no change to what the apps send:

1. Add `@orpc/openapi` (same `2.0.0-beta.49` channel) to `apps/sanctuary-api`; a script generates
   `docs/api/openapi.json` from `appContract` (Zod 4 converter); a gate fails if the committed
   file differs from the generated one.
2. One fixture file per capability (`request.json`, expected `response.json`, expected error
   codes), and one test that replays them with plain `fetch` against `createApp()`, with no oRPC
   client. Start with `identity.session` and `identity.createInitialBond`.
3. Record what the raw RPC wire looks like in the fixtures, so the cost of a non-oRPC client is
   known from evidence, not guessed.

Not in this step: a second handler, any Rust, any new spec format, deleting the legacy
contracts (that needs its own pass and Neev's yes).

## 8. Open for Neev

- Does any non-TypeScript client have a date? (Flutter, native, a partner.) If yes, item 1 of
  the triggers starts now.
- Is there a computation you already know must match offline and online? That is the only
  place Rust is likely to pay.

## 9. Final round (2026-11-26): settled direction

Neev settled the direction: keep TypeScript, change what is underneath where it pays (Bun
candidate, oRPC v2, Hono v5 thin shell, OpenAPI, Cedar Wasm behind `check()`, JSON default,
Zod, `pg`, bounded Effect, always-on hosting next to the database, Rust only as a selective
engine). The row-by-row check against `integrate/nov-convergence` is in
`docs/decisions/2026-11-26-api-contract-and-backend-direction.md`. Corrections found there:
the v1 contract now has 15 capabilities (not 6); the Bun entry still refuses authenticated mode;
Effect is a dependency of the API but not used in its code; there is no Rust Cedar integration
to "retain"; authentication lives in the Hono layer, not in oRPC middleware.

## Sources

Repo (all on `integrate/worlds-and-upstream`): files named in section 1;
`docs/decisions/2026-07-28-gurudevi-authz-decision-record.md`;
`apps/sanctuary-api/docs/architecture/2026-10-13-layered-api-platform-roadmap-and-real-options.md`;
`apps/sanctuary-api/docs/architecture/2026-10-25-sanctuary-api-v2-architecture-assessment.md`;
`apps/sanctuary-api/docs/architecture/2026-10-25-orpc-v2-beta-temporal-grounded-research.md`;
`apps/sanctuary-api/docs/implementation/2026-11-08-capability-conformance-plan.md`.

Outside (read 2026-11-26):
- oRPC OpenAPI routing and handler: https://orpc.dev/docs/openapi/routing , https://orpc.dev/docs/openapi/handler
- Connect Rust: https://buf.build/blog/connect-rust-joins-the-connect-project , https://docs.rs/crate/connectrpc/latest
- Rust builds: https://goals.rust-lang.org/2026/roadmap-fast-builds.html , https://blog.rust-lang.org/2025/09/10/rust-compiler-performance-survey-2025-results
- TypeSpec 1.0: https://typespec.io/blog/typespec-1-0-GA-release/
- LLM code errors: https://arxiv.org/abs/2608.00661 (ISSRE 2026), https://arxiv.org/abs/2607.13820 (PROBE), https://arxiv.org/abs/2505.10708 (SafeTrans)

Not re-checked this session: Smithy's current state; the exact `OpenAPILink` behaviour against a
non-oRPC server (to be proven by the fixtures in step 2, not assumed).
