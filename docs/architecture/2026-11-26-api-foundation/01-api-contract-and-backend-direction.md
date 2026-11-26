---
title: "Gurudevi API contract and backend direction"
status: "superseded"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/KvqhmF93ANKxqsAk4KxGG1"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/KvqhmF93ANKxqsAk4KxGG1 (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Gurudevi API contract and backend direction

Nov 26, 2026 · @Neev

Stay TypeScript, keep the oRPC contract as the one source, and add a generated OpenAPI projection plus plain-HTTP behaviour fixtures. Rust enters later only as a small Wasm library, the way Cedar already does, when one computation must match offline and online.

## What exists today

The v1 API is six small calls over oRPC's own RPC wire, used only by two TypeScript apps. Checked on `integrate/worlds-and-upstream` at `58e4e779` .

|Piece|Where|Fact|
|---|---|---|
|v1 contract|`packages/core/src/api/v1/contract.ts`|6 capabilities ( `identity.session`, `scopes`, `entry`, `createInitialBond`, `syncCredentials`, `authority.refreshSnapshot`), oRPC `oc`+ Zod 4|
|Server|`apps/sanctuary-api/src/core/app.ts`|Hono 5.0.0-rc.1 + oRPC 2.0.0- beta.49 `RPCHandler`at `/api/v1`, Node (Bun optional)|
|Wire|`packages/core/src/api/v1/client.ts`|RPC only: `RPCLink`and `RPCSerializer`. `@orpc/openapi`is installed nowhere; no `OpenAPILink`|
|Clients|mobile `src/lib/v1Client.ts`, web `lib/sanctuary/v1Entry.ts`|Both TypeScript; both import the contract type, nothing generated|
|Offline data|`powersync/sync-config.yaml`|Most reads come through PowerSync; the API only hands out a sync grant|
|Offline authority|`packages/policies`|Signed snapshot checked on the device with `@cedar-` `policy/cedar-wasm`4.14.0|
|Capability|`apps/sanctuary-`|`CapabilityManifest`: kind,|
|list|`api/src/modules/catalog.ts`|channels, assurance, status, required evidence|
|Gate|`pnpm audit:conformance`|Joins cards, contract, router, Cedar, tests, callers; ratchet stops gaps rising|
|OpenAPI file|`apps/sanctuary-` `api/docs/api/openapi.json`|Stale: retired `self.*`paths, empty schemas, not generated from v1|
|Legacy|71 `*contract*.ts`in `packages/core/src/api`|No server on this branch serves `/api`outside `/api/v1`|

Three things the repo already answers:

1. **Gurudevi already runs Rust without writing Rust.** Cedar is a Rust engine used as Wasm on web, React Native and server. PowerSync's client core is Rust too.

2. **Rust was decided twice and never landed.** The 2026-07-28 authorization record chose a Rust local PDP; the 2026-10-25 v2 assessment proposed a Rust Cedar sidecar. No `Cargo.toml` exists on any of the 35 branches. Both times the Wasm library was enough.

3. **The "what survives" ladder is already yours.** The 2026-10-13 roadmap's _stable meaning, replaceable placement_ puts capability meaning above transport adapters and keeps Hono + oRPC. This doc keeps the repo's words: capability, contract, channel.

## The ChatGPT claims, checked

Most of the analysis holds; its first question is now answered, and its capability spec would duplicate what the repo has.

|Claim|Verdict|
|---|---|
|Check whether Gurudevi uses RPCLink, OpenAPILink or both|RPC only|
|`OpenAPILink`can talk to a server not written in oRPC|Plausible with conditions: the link needs the contract with method and path on every procedure, and the server must match oRPC's error body or the link needs a custom decoder. Not tested yet|
|Existing clients won't automatically work with a Rust server|True. The RPC wire is oRPC's own and changes with oRPC: our own notes say "a v1 client cannot communicate with a v2 server"|
|Generating OpenAPI alone is not enough|True. The stale `openapi.json`proves it: an unchecked document drifts|
|A Rust ConnectRPC implementation exists|True. `connectrpc`0.9.1, Tower-based, Axum supported, passes the full Connect conformance suite, but pre-1.0|
|A capability spec with bindings could drive an architecture compiler|It already exists as `catalog.ts`+ cards + `audit:conformance`. A new YAML would be a second system|

## Contract format

Keep `contract.ts` as the one source and generate OpenAPI from it; every other format adds a second contract file beside it.

|Option|Source of truth|Fit today|Cost|Gives|
|---|---|---|---|---|
|oRPC|`contract.ts`,|Exact: both|Small: add|A standard|
|contract +|as now|apps import|`@orpc/openapi`,|document any|
|generated||it|generate, gate|language can|
|OpenAPI||||read, derived and checked|
|TypeSpec|`.tsp`files|Apps would use generated Zod|Build step, second language; refinements like `isEdloveAccountId` are lost|OpenAPI 3 and JSON Schema emitters are stable; protobuf and client/server emitters still preview|
|Protobuf + Connect|`.proto`|Both apps change transport|High: new wire and clients; Rust side pre- 1.0|Best multi- language and streaming story|
|Smithy|`.smithy`|Poor|Java/Gradle toolchain, AWS-centred (not re- checked)|Rust server SDK|

The v1 contract is already plain JSON: dates are ISO strings, times are integers, no `Date` , `BigInt` , `Map` or `Set` . So an OpenAPI projection loses nothing today.

## Where response time goes

Almost all of a call's time is network and hosting, not code: about 12 sequential database round trips across Singapore and Mumbai, on a free instance that sleeps. Read from the code; RTT figures are estimates until measured.

|Cost|Where in the code|Rough size|
|---|---|---|
|API in Singapore, database in Mumbai|`render.yaml`( `region:` `singapore`); production pooler `aws-` `1-ap-south-1`|~60 ms per database round trip (estimate)|
|Identity check|`security.authenticate`|1 round trip|
|Per-minute budget|`platform.consumeBudget`(begin, insert, commit)|3 round trips|
|Handler transaction|`withAccountData`: begin, timeouts, identity re-check (2), claims, role, query, commit|~8 round trips|
|Free Render plan|`render.yaml`( `plan: free`)|Sleeps after ~15 min idle, ~1 min to wake, 0.1 CPU|
|Node + Hono + oRPC|`app.ts`, `router.ts`|A few ms: all Rust could|
|work||save|

Standard fixes, in order: measure each phase with a `Server-Timing` header; put the API and the database in the same city; use an always-on instance; fold identity, budget and claims into one database call (12 round trips to 2 or 3).

**Decided by Neev (2026-11-26):** the production database moves to Singapore, next to the API. Not done yet. Standing rule: the API host and the database share a region, and any new host, worker or database is checked against that first.

**Where to refine, in order, before Rust is even a question.** Each step is measured before and after; the next starts only when the numbers say so.

- Measure: `Server-Timing` per phase (auth, budget, db, handler) and a probe from Sri Lanka

- Database to Singapore (decided): round trips drop from tens of ms to a few ms Always-on instance: leave the free plan, no sleep or minute-long wake

- Fewer round trips per call: identity, budget and claims in one transaction or SQL function, ~12 down to 2 or 3

- Fewer calls per screen: reads stay on PowerSync; the API carries commands and grants

- Payload and connection reuse: small responses, compression, keep-alive

- Only then profile server CPU: a capability still slow and CPU-bound is the Rust candidate, bake-off first

**If Rust were adopted:** the server, middleware, contract types, Cedar, JSON and tracing come from crates or generation, and cheap models handle that glue reasonably. JWT/JWKS, signing, transaction setup, error mapping and the operations store are handwritten and security-critical. Timeouts, draining and cancellation are hand-written async, where LLMs do worst in Rust. There is no published data on Gemini Flash-class models in

Rust, so the proposal is a bake-off: the same small task ( `identity.session` + auth) in TypeScript and Rust by a cheap model, checked by the same HTTP fixtures, counting attempts, compile time and pass rate.

## Backend language

TypeScript stays: a Rust or Python server would cost a second toolchain and a reimplemented wire for six calls, with no gain a phone can feel.

- **The low-end phone does not see the server's language.** The A24/A52 feels payload size, request count and offline behaviour. PowerSync and the signed snapshot already carry offline.

- **No measured server bottleneck.** The admission limit in `app.ts` (32 in flight) protects Postgres and the host; Rust would not change that.

- **Rust compile times are still a real cost.** In the Rust project's 2025 survey (3,700+ answers), incremental rebuilds were "by far the most common complaint" and 55% wait over 10 s per rebuild. The 2026 Fast Builds goals (parallel front end, Cranelift, relink-don't-rebuild) are in progress, not done.

- **LLM-written Rust fails more, and the compiler doesn't close the gap.** An ISSRE 2026 study of 86,726 failures found Rust had the most compile errors (23,416 vs 9,953 for C++ and 6,996 for Java). PROBE (2026) found models do better in Python, C++ and Java than in C and Rust. SafeTrans (2025) found compiler-guided repair lifted success from 54% to 80% but was "insufficient" alone.

- **What makes LLM code trustworthy in any language** is a typed boundary (the contract), behaviour tests pinning inputs to outputs, and Cedar tests for authority. Gurudevi already has all three in TypeScript.

- **Python** fits AI and data jobs, behind the existing `workers` channel, not as a second API server.

|Choice|Verdict for now|
|---|---|
|Stay TypeScript (Hono + oRPC)|Default|
|Hybrid TypeScript + Rust service|Not now|
|Rust-first|No|
|Python for jobs|Later, when a named job needs a Python library|

**When Rust is right:** one computation must run identically on the device and the server, fast or exact, and no maintained library does it. Then write a small Rust library compiled to Wasm first (one build for web, React Native and Node), with the same JSON fixtures as the TypeScript version. Native FFI only if Wasm is measured too slow on the A24. Never a Rust server to get there.

## Capability with bindings

The idea is right and already in the code; the YAML spec and architecture compiler are premature.

A local calculation and an authoritative server command are different things, even with shared code: a fee preview on the phone does not authorise a payment. The repo already says this with `kind: query | command` , `assurance` , signed snapshots, and "every command re-checks the bond it names".

What is premature is new machinery (binding kinds, a compiler) for six capabilities, two TypeScript apps and no Rust. The 2026-10-13 _real options_ rule asks for a named trigger and a cheap experiment; neither exists yet. If a capability gets a local twin, `CapabilityManifest` gains one field for where it may run, and `audit:conformance` checks it.

## Recommendation and first step

A reversible default, proposed for Neev's decision:

1. The API server stays TypeScript (Hono + oRPC).

2. `contract.ts` stays the one contract; `catalog.ts` stays the one capability list.

3. RPC stays the wire for Gurudevi's own apps.

4. A generated, CI-checked OpenAPI projection of v1 replaces the stale `openapi.json` .

5. Plain-HTTP JSON fixtures per capability become the check any implementation, in any language, must pass.

6. No Rust, Python, TypeSpec, Protobuf or Connect now.

To reverse it, delete the generator and the fixtures; nothing else depends on them.

|Trigger|Then|
|---|---|
|A real non-TypeScript client (Flutter, native, partner)|Serve the OpenAPI projection as a second channel and generate that client|
|A computation that must match offline and online, measured slow or missing|Small Rust library compiled to Wasm, same fixtures|
|Many services in several languages, or heavy streaming|Reconsider Protobuf + Connect|
|oRPC 2.0 stalls or breaks its wire again|OpenAPI + fixtures are the exit path|
|A job needs a Python library|Python worker behind `workers`|

**First step this week** (about half a day, one PR, nothing the apps send changes; needs Neev's yes):

- Add `@orpc/openapi` (2.0.0-beta.49) to `apps/sanctuary-api` ; generate `docs/api/openapi.json` from `appContract` ; a gate fails on drift

- Fixtures (request, response, error codes) for `identity.session` and `identity.createInitialBond` , replayed with plain `fetch` against `createApp()`

- Record the raw RPC wire in those fixtures, so a non-oRPC client's cost is known from evidence

Open for Neev: does any non-TypeScript client have a date? Is there a computation you already know must match offline and online?

Repo copies: `apps/sanctuary-api/docs/architecture/2026-11-26-api-contract-andbackend-direction.md` and `docs/decisions/2026-11-26-api-contract-and-backenddirection.md` , in PR #158.

## Settled direction (final round, 2026-11-26)

TypeScript stays; what sits underneath changes where it pays. Each row was checked against `integrate/nov-convergence` ( `5a466cd5e` , 15 v1 capabilities).

|Area|Decision|What the branch shows|Before acting|
|---|---|---|---|
|Runtime|Bun is the candidate; Node stays in production until Bun passes the same suites|Bun entry `src/index.ts` throws "Authenticated foundation requires the Node entry point"; `Dockerfile`runs `node:24`|Parity = G1/G2 + security suites under Bun, with `Server-Timing` before/after. Gains are memory and tooling, not latency|
|oRPC v2|Continue|Pinned exactly at `2.0.0-` `beta.53`|Pin `@hono/node-` `server`, `effect`, `pg`too (still `^`)|
|Hono v5|Thin shell; oRPC owns procedures|Auth and budget run in Hono ( `app.all('/api/v1/*')`); oRPC only asserts identity|Move auth + budget into one oRPC middleware|
|OpenAPI|Generate and gate|`@orpc/openapi`not installed|First step unchanged|
|Cedar|Wasm behind one interface|Already one: `check()`from `@repo/policies`|No Rust Cedar integration exists to retain; sidecar only on a measured need|
|Serialization|JSON default; Protobuf where data shape justifies it|None present|Snapshots need canonical JSON|
|Zod / Standard Schema|Stays|`zod` `4.6.7`exact||
|Database driver|`pg`stays; Bun SQL after Bun parity|`pg` `^8.23.1`|Keep transaction, role, claims, cancellation behaviour|
|Effect|Bounded, not in handlers|API depends on it but no API source imports it|Candidate to drop from the API|
|Hosting|Always-on, same region as the database|`render.yaml`still `plan:` `free`|Paid Render or Cloud Run with min instances|
|Rust|Selective engine, Wasm first|No `Cargo.toml`anywhere|Bake-off first|

The PR now targets `integrate/nov-convergence` .

## Sources

Read 2026-11-26.

- <u>oRPC OpenAPI routing</u> and OpenAPI handler

- <u>Connect Rust joins the Connect project</u> and connectrpc crate

- <u>Rust 2026 Fast Builds roadmap</u> and Rust compiler performance survey 2025

- <u>TypeSpec 1.0 GA</u>

- <u>Errors in LLM-generated code (ISSRE 2026), PROBE, SafeTrans</u>

- Repo: `docs/decisions/2026-07-28-gurudevi-authz-decision-record.md` , `apps/sanctuary-api/docs/architecture/2026-10-13-layered-api-platform-`

- `roadmap-and-real-options.md` , `2026-10-25-sanctuary-api-v2-architectureassessment.md` , `2026-10-25-orpc-v2-beta-temporal-grounded-research.md`

Not re-checked: Smithy's current state, and `OpenAPILink` against a non-oRPC server (the fixtures will prove it).
