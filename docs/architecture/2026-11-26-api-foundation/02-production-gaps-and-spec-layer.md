---
title: "Gurudevi API: production gaps and the spec layer"
status: "superseded"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/FFxmdk2cLVrTKmUQxEiU2d"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/FFxmdk2cLVrTKmUQxEiU2d (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Gurudevi API: production gaps and the spec layer

Nov 26, 2026 · @Neev

## Direction

Add one written API spec, in TypeSpec, beside the data model. Everything else is generated from those two sources and checked in CI. Today the API's shape exists only as TypeScript code. Nothing language-neutral describes it, and nothing stops a breaking change. That missing layer is what feels missing.

Your rule (26 Nov): generate, don't hand-write, and spot-check the output. Applied across the stack, each kind of fact gets exactly one source:

|Kind of fact|One source|Generated from it|
|---|---|---|
|Tables, columns, relations|`schema.zmodel`|SQL migrations, TypeScript types, Zod, phone (Drizzle) tables|
|Row-level security, functions, grants, cron|SQL files next to the migrations|Nothing; pgTAP tests check them|
|What the API offers: operations, errors, versions, paging|**API spec (new,** **TypeSpec)**|OpenAPI 3.1, the oRPC contract with its Zod, docs, test fixtures, later Protobuf|
|Who may do what|Cedar policies|Policy checks; spec operations name their Cedar action|
|What reaches the phone|`sync-config.yaml` streams|Checked against the model and the phone tables (built today)|

The API spec is the only new hand-written source, and it does not repeat the data model: its data shapes are generated from `schema.zmodel` .

## What a production API needs that ours lacks

The request core is strong; what's missing is around it. Admission limits, timeouts, idempotent commands, per-account budgets, an audit log with a verify function, health checks, request IDs and signed offline snapshots are all already in `sanctuary-api` . The gaps are what you need to see, change and operate the API safely. I checked each row below against `apps/sanctuary-api/src` , `render.yaml` and `.github/workflows` on this branch.

|Area|Today|Missing|Weight|
|---|---|---|---|
|Contract governance|Zod contract in TypeScript only; `docs/api/openapi.json` is stale|A written spec, a published OpenAPI, a breaking-change gate, a versioning and deprecation rule|High|
|Seeing production|Structured JSON logs with request IDs|Traces (OpenTelemetry), `Server-Timing`, metrics, error reporting (no Sentry in the API), latency targets with alerts|High|
|Hosting|Render free plan in Singapore, kept awake by a GitHub cron every 10 minutes; `autoDeploy:` `false`|An always-on instance, a staging API, deploy from CI with rollback, the database in the same region (decided)|High|
|Schema changes|222 hand-written SQL migrations; zmodel drifts from the database|`zen migrate`from the model, a shadow database in CI, Squawk on every generated migration, pgTAP for row- level security|High|
|Behaviour tests|Unit tests and G2 database suites|Plain-HTTP fixtures per operation, fuzzing from the spec (Schemathesis), a load test (k6) with a budget|Medium|
|Errors|`ORPCError`codes set by hand in each module|A per-operation error list in the spec (code, HTTP status, retryable, meaning) that clients can switch on|Medium|
|Lists and paging|No list operation pages yet (for example `listInviteCodes`)|One cursor-paging convention, declared once in the spec|Medium|
|Payload and caching|JSON, no compression, no ETag|Compression for large responses; ETag or `If-` `None-Match`on reads the phone repeats|Medium|
|Side effects|Operations store with an outbox table in the same transaction|A worker that delivers the outbox (push, email, webhooks) with retries and a dead-letter queue|Medium|
|Keys and secrets|Doppler; sync-grant keys carry a `kid`|A written rotation for the snapshot-signing and sync keys, and a key-set endpoint so old and new verify together|Low, until the first rotation|
|CI hygiene|DCO and Gitleaks fail on every PR (missing sign-offs, missing token); Vercel and Cloudflare builds red|Green required checks, so a red check means something again|High, and cheap|

The next section covers only the spec layer, because it's the one gap that changes how the rest are built.

## The spec layer: TypeSpec wins

TypeSpec fits our intent best: one readable spec, everything generated, a fast toolchain, and syntax that cheap models write well. Each option was judged on the same questions: can it be the one source, what can it generate, how fast is it to build, and how well can an LLM write it.

|Option|What it is|For us|Against us|Verdict|
|---|---|---|---|---|
|TypeSpec (Microsoft)|A small language for API surfaces; 1.0 GA in 2025, now on 1.16|Emits OpenAPI 3.1, JSON Schema and Protobuf from one file; versioning library; runs on Node, compiles in seconds; TypeScript-like syntax LLMs write reliably|A new language to learn; no ready oRPC emitter, so we write a small one (or go through OpenAPI)|**Adopt as the** **API spec**|
|Smithy (AWS)|A protocol-agnostic model with code generators, including a TypeScript server SDK|Very rigorous: resources, traits, paging and errors are first-class|JVM and Gradle toolchain; the server SDK replaces Hono and oRPC instead of feeding them; built around AWS's own conventions|Skip: costs too much for one developer|
|Protobuf +|Binary schema;|Best for|Weak at HTTP|Generate it|
|Buf + Connect|services over HTTP/2 or HTTP/1.1|streaming and for non- TypeScript services; small payloads|JSON shapes, paging and error detail; Connect-ES is still pre-1.0 here; the phone gains little over JSON|from TypeSpec when a service needs it; don't author it|
|OpenAPI generated from oRPC|`@orpc/openapi` reads today's `contract.ts`|Smallest step; no new language|The source stays TypeScript code, so the spec is a by- product nobody reviews; the shapes still repeat the data model|Keep as the fallback|
|OpenAPI by hand|Write the YAML|Universal|Verbose; the reason TypeSpec exists|No|

**Why not Smithy, given it's the most complete?** We would trade Hono and oRPC for its server SDK and add a JVM build. That repeats the Rust worry about slow toolchains and code an LLM writes poorly.

**Why the spec is authored and not generated:** the API surface is a design decision (what to offer, what errors mean, what is versioned), not something derivable from code. It's the one place a person should write, and the model's shapes are imported into it, not retyped.

**Keeping Protobuf in play (Neev, 26 Nov):** the spec carries Protobuf field numbers from day one and emits `.proto` through `@typespec/protobuf` . CI runs `buf breaking` next to oasdiff, so Protobuf's compatibility rules apply without hand-written `.proto` . Whether the phone gets binary payloads is decided by measuring session, scopes and snapshot responses as JSON, gzipped JSON and Protobuf. Signed snapshots stay canonical JSON.

## The generation chain

Two files are written by hand: the data model and the API spec. Everything else is generated and gated in CI, so a hand edit to a generated file fails the build.

generation chain · 2 written sources

The model's shapes flow into the spec, so a column is never described twice. The spec's operations reference those shapes and add what the model can't say: the inputs, errors, paging and the version each operation belongs to.

How each generated piece is made, and the unknown in each:

- **Migrations:** `zen migrate` diffs `schema.zmodel` against a shadow database. Unknown: how it treats the 379 tables that exist in the database but not in the model (11 Nov ledger). Those need a baseline migration first.

- **Spec models from the model:** a small ZenStack generator that writes `.tsp` models. About 150 lines; ZenStack plugins read the same AST `zen generate` uses.

- **oRPC contract from the spec:** a TypeSpec emitter that writes `contract.ts` with Zod. Alternative: generate Zod from the OpenAPI output with an existing tool, plus a thin mapping. The phone bundle stays plain Zod, with no ZenStack runtime.

- **OpenAPI:** TypeSpec's own `@typespec/openapi3` emitter. That replaces the stale `docs/api/openapi.json` .

## Order of work

Cheap, high-value fixes first, then the spec, then the migration switch. The migration switch is last because it touches the live database.

1. **Green CI and visibility (days).** Fix DCO and Gitleaks so required checks mean something again. Add `Server-Timing` per phase, OpenTelemetry traces and error reporting to the API. This is the measurement the latency plan already called for.

2. **TypeSpec spec for today's 15 operations (about a week).** Write `api.tsp` by hand once, using the current contract as the reference. Emit OpenAPI 3.1. Add the oasdiff breaking-change gate and Spectral lint. The current `contract.ts` stays in place.

3. **Generate the contract from the spec.** Build the TypeSpec → oRPC emitter. CI fails if the generated `contract.ts` differs from what's committed. Then retire the handwritten file. Run the HTTP fixtures and Schemathesis against staging.

4. **Spec models from the model.** Add the ZenStack generator that writes `.tsp` models, so spec shapes come from `schema.zmodel` .

5. **Migrations from the model.** Build a baseline from the live database (the 379 tables only in the database get a ledger decision each). Then `zen migrate` with a shadow database and Squawk in CI. Row-level security and grants stay in SQL files with pgTAP.

6. **Operate.** Always-on hosting plus a staging API, the database moved to Singapore, an outbox worker, and a key-rotation runbook.

Needs your yes before it starts: step 5's baseline, because it changes how the production schema is changed. Steps 1 to 4 can be undone and touch no data.

## Sources

- <u>TypeSpec, 1.0 GA announcement, 1.16 release notes, emitters Smithy Server Generator for TypeScript, AWS blog</u>

- <u>oRPC OpenAPI generator</u>

- Repo, branch `claude/project-thread-avbdly` : `apps/sanctuary-api/src` , `render.yaml` , `.github/workflows/keep-alive-sanctuary.yml` , `packages/core/src/api/v1/contract.ts` , `docs/decisions/2026-11-11-layered-`

- `deterministic-pipeline.md`
