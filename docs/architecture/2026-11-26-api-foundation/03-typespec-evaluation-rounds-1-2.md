---
title: "Gurudevi API: does TypeSpec make functional development cheaper?"
status: "active"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/JUWZ4zHGP1t2XyKqfckUyo"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/JUWZ4zHGP1t2XyKqfckUyo (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Gurudevi API: does TypeSpec make functional development cheaper?

Nov 26, 2026 · @Neev

## Round 2: the real repository

Round 1 used a toy domain I designed. Round 2 ran inside the real repo on `ops.institutions` , with hidden behaviour tests calling the real router against a real Postgres (no mocks). There were 4 tasks: two new capabilities ( `getInviteCode` , `setInviteCodeLimit` ) and two changes to existing ones ( `revokeInviteCode` gains `NOT_FOUND` / `CONFLICT` ; invite codes gain `expiresAt` through contract, SQL and `schema.zmodel` ). Each ran twice in two layouts, giving 16 Haiku runs in separate copies of the repo.

- **Today's layout:** one capability spread over the contract, catalog, router, handler module, handler test, contract-paths test and module card.

- **Capability files:** a contract file in `packages/core/src/api/v1/ops/institutions/` and a server file in `apps/sanctuary-api/src/institutions/capabilities/` . The router branch, contract index and card lists are generated, and the catalog reads the kind from the contract's `.meta` .

|Mean of 8 runs|Today's layout|Capability files|
|---|---|---|
|Hidden behaviour tests|116/116|116/116|
|Agent tokens|79.9k|77.1k|
|Tool calls|14.5|11.6|
|Hand-edited files, new capability|7|3.75|
|Hand-edited files, change to existing|3.5|4.25|
|Failed checks before passing|2 in 8 runs|2 in 8 runs|
|Wall time|196 s|199 s|

### **What this says.**

   - Low-cost agents already get real Gurudevi capabilities right in both layouts. Correctness is not where cost is going.

   - Capability files halve the files touched for a new capability and cut tool calls by a fifth, but save only 3.5% of tokens.

   - About 55k of every run is the agent's own fixed setup, the same in any layout. The part a layout or spec format can change is roughly 15k to 35k tokens per task.

   - No spec language, generator or layout gives a large saving here. The 65–70% of functional surface still to build costs about the same per capability whichever of these we pick.

- **What was actually missing.** These turned up in the real code and in what the agents did:

1. **Errors are not in the contract.** `provision` and `update` throw `CONFLICT` without declaring it, so clients cannot see it. The agents declared errors on new capabilities, but nothing enforces it.

2. **Authorization is decided in three places that disagree.** The `InviteCode` model's `@@allow` lets a `section_head` create codes, the handler SQL allows only `principal` , `founder` and `admin` , and the Cedar `ops` namespace permits nothing.

3. **A model change does not flow anywhere by itself.** In T4 one agent hand-edited the generated ORM file because nothing regenerates it. No check runs `zenstack generate` , and nothing produces the migration.

4. **More hand-kept lists exist.** Agents in both layouts also edited the capability list in `docs/architecture/domains/README.md` . The generator did not cover it.

5. **Shapes from the model need model work first.** `makeModelSchema('InviteCode')` gives snake_case fields, free-text roles, a nullable `uses_count` and ids without UUID checks. It can feed the contract only after the model gains `@map` names, enums and UUID types.

6. **Effect HttpApi** (in Effect 4.1.5 as `effect/http-api` ) would need Effect Schema instead of Zod and would replace the oRPC procedures. That is a second system, so it was not run.

### **Recommendation after round 2.**

Keep oRPC + Zod.

- Adopt capability files, since they are measured as a modest gain with no loss, and extend the generator to the domain index.

- Spend the effort that would have gone into a spec layer on the four consistency gaps: a check that every error a handler throws is declared in its contract;

one place for authorization rules;

`zenstack generate` and the migration diff run in CI;

OpenAPI + oasdiff, as in round 1.

Kit and every run's diff: `gurudevi-api/spec-eval-round2-2026-11-26.tgz` in the project files.

## Answer

**No-go on a contract migration for now.** At our exact pins the TypeSpec → OpenAPI → Hey API → oRPC v2 + Zod pipeline works and every agent run was correct, but it did not make functional development cheaper. Low-cost agents wrote about 60% more hand code per operation, used about 7% more tokens, needed one extra compile round every time, and waited 1.3 s per check instead of 0.2 s. The raw generated contract also lost strictness, typed errors and Cedar metadata, which we had to put back with our own glue.

The things TypeSpec was meant to bring are available without it. oRPC-first contracts already generate OpenAPI 3.1 (strict objects, error responses and discriminators included) in about 0.1 s, and oasdiff catches breaking changes on that output. Protobuf is worth it only for a small, named portable subset, and that subset can be authored in TypeSpec on its own.

**Recommendation:** keep oRPC-first (Zod, the same source of truth as ZenStack) as the way functional operations are written. Add the gates now: OpenAPI generated from the oRPC contract, oasdiff on every PR, and a behavioural conformance test per operation. Use TypeSpec + `@typespec/protobuf` + `buf breaking` only for capabilities that must leave TypeScript (device exchange, signed snapshots, a non-TS client). Look again when Hey API's oRPC v2 plugin leaves the `next` channel and keeps errors, metadata and strictness.

## What was tested

**Pins:** TypeSpec 1.18.0 ( `@typespec/protobuf` 0.88.0), `@hey-api/openapi-ts@0.0.0next-20260930190945` with the oRPC plugin at `compatibilityVersion: '2'` (latest 0.99.0 has no oRPC v2 option), `@orpc/*` 2.0.0-beta.53, Zod 4.6.7, TypeScript 7.1.0-beta, Bun 1.4.4, buf 1.75.0, oasdiff 1.41.0.

- **Three approaches, same 5 starting operations, same in-memory domain:** oRPC-first (hand-written Zod contract), the historical SovereignContract ( `as const satisfies` routes + a small runtime), and TypeSpec-generated.

- **Starting operations:** `lms.assignments.list` , `lms.submissions.grade` , `erp.invoices.create` (idempotency header, decimals, payment union), `people.profiles.update` (null vs omission), `authority.refreshSnapshot` (signed

- snapshot).

- **Agent tasks (one per domain):** T1 `lms.attendance.mark` (LMS), T2 `erp.payments.refund` (ERP: idempotency key, decimal money, over-refund 409), T3 `people.guardians.link` (People: discriminated relationship union, 403 for a locked

- student, 409 for a duplicate).

- **Agents:** Claude Haiku as the stand-in for Gemini Flash-class (no Gemini key here). Each agent got only its run folder, a `TASK.md` and the approach `README.md` , and had to run `./check.sh` until it passed. Every check run was logged, so repair rounds are counted from the log, not from the agent's word.

- **Scoring:** an HTTP-level behavioural harness (not the agent's own tests): 14 baseline tests plus 10, 9 and 10 task tests.

## Agent results

|Measure (mean of 3 tasks)|oRPC-first|SovereignContract|TypeSpec|
|---|---|---|---|
|Behavioural tests passed|29/29, baseline 14/14|29/29, baseline 14/14|29/29, baseline 14/14|
|Hand-written lines added per operation|30|33|48 (spec + handler)|
|Generated lines|0|0|about 260 TS + OpenAPI JSON|
|Agent tokens|58.1k|59.4k|62.2k|
|Failed checks before passing|0|0|1 every time|
|One check (generate + type-check)|0.21 s|0.37 s|1.26 s|
|Agent wall time|29 s|31 s|42 s|

- **The TypeSpec repair round was structural.** Each agent edited the spec, regenerated, and then the type-checker said the router was missing the new handler. That is generation working as designed, but it is a guaranteed extra round per operation.

- **Tokens are mostly reading cost.** About 55k of each run is reading the task, README and existing files, so the differences come from the extra spec file and the extra round.

**All three agents in T2 made the same judgement call:** they restricted refunds to nonnegative amounts because the task did not say. The spec layer did not change how ambiguity was handled.

**Limits:** one run per cell, small operations with clear task text, Haiku not Gemini. The pattern is consistent across all three tasks, but a repeat round would tighten the numbers.

## Semantics: equivalent-looking is not equivalent

|Case|Raw TypeSpec pipeline|After our glue|oRPC-first|
|---|---|---|---|
|Null vs omission|kept (nullish)|kept|kept|
|Empty list, omitted cursor|`[]`, cursor omitted|same|same|
|Unknown fields|silently stripped ( `z.object`)|rejected (strict)|rejected|
|Discriminated union|plain `z.union`(works, weaker errors)|same|`z.discriminatedUnion`|
|Decimal as string|kept, numbers rejected|same|same|
|Typed errors (404, 409, 403)|dropped from the contract|restored from OpenAPI responses|in contract|
|Error body shape|oRPC `{defined,` `code, message}`, not the spec's `ApiError`|still differs|oRPC shape, by design|
|Cedar action metadata|dropped ( `x-cedar-` `action`ignored)|restored|in contract meta|
|Signed snapshot payload|arrives verbatim|same|same|

`x-` The glue is 29 lines ( `postgen.ts` ) that we would own. It reads error responses and `cedar-action` from the OpenAPI file and rewrites the generated code. It is tied to the output of a nightly Hey API build from 30 September 2026.

## Protobuf for a portable subset

One TypeSpec file emitted both `.proto` and OpenAPI 3.1 in under a second. Messages need `@field(n)` on every field. `@reserve(4, 5, "oldNote")` emits `reserved` numbers and names.

What the Protobuf emitter refuses, which is why most models should not be forced into this subset:

- `T | null` (nullable) and anonymous unions. Only a named union with `@field` on

- each variant becomes a `oneof` , and its JSON shape is `{"parent": {...}}` , not our `{"kind": "parent"}` discriminator.

- `decimal` (no Protobuf scalar). Money stays a string.

- `utcDateTime` (no mapping in this emitter version).

- `Record<string>` and literal types.

Proto3 JSON mapping changes meaning even when the schema looks the same. These were checked with `@bufbuild/protobuf` 2.10.1:

- `present: false` , `0` counts and an empty `marks: []` are all **omitted** on output,

- unless `alwaysEmitImplicit` is set.

- `note: null` is accepted and becomes **omission** , so "clear the note" and "keep the

- note" collapse into one.

- `"3"` is accepted for an int32. Unknown fields are rejected, which matches us.

## Breaking-change checks

|Change|buf (default rules)|buf (WIRE_JSON)|oasdiff|
|---|---|---|---|
|Renumber a field|breaking|breaking|**not seen**(JSON unchanged)|
|Remove a field, number + name reserved|breaking|passes|warning|
|Remove a field, not reserved|breaking|breaking|warning|
|Rename a field|breaking|breaking (JSON name)|breaking|
|Optional → required|breaking|not run|breaking|
|int32 → int64|breaking|not run|breaking|
|Add an optional field|passes|not run|passes|
|oRPC contract: `nullish`→ required string|n/a|n/a|breaking|

The two tools catch different things, so the portable subset needs both. `buf breaking` with WIRE_JSON rules is the field-number governance: removing a field passes only when its number and name are reserved. For the oRPC-first surface, oasdiff on the generated OpenAPI is enough.

## Payload (secondary)

Synthetic attendance roster, mark message as above:

|Marks|JSON|JSON + gzip|Protobuf|Protobuf + gzip|
|---|---|---|---|---|
|40|1,772 B|238 B|653 B|181 B|
|400|17,132 B|1,248 B|6,213 B|1,058 B|
|4,000|170,732 B|11,419 B|61,813 B|10,766 B|

Uncompressed, Protobuf is about 2.7 times smaller. With gzip, which every response already gets, the gap is 6% to 24%. That is not a reason to change formats on its own.

## What to do next

1. Generate OpenAPI 3.1 from the oRPC contracts in CI ( `OpenAPIGenerator` + `ZodToJsonSchemaConverter` ; about 0.1 s here) and run oasdiff against the base

branch.

2. Give every operation a behavioural conformance test at HTTP level, like the harness here. This is the gate that proved correctness; the schema checks did not.

3. Write an operation recipe for low-cost agents (contract shape, error map, Cedar meta, handler, conformance test). The README in each approach was enough for Haiku to get every task right first time on oRPC-first.

4. Keep a small TypeSpec spec only for named portable capabilities, with `@field` and `@reserve` , `buf breaking` on WIRE_JSON rules, and conformance tests for proto3

JSON mapping.

5. Re-run this evaluation (the kit is saved) when Hey API's oRPC v2 plugin is released outside `next` , or when a non-TypeScript client needs the spec.

The evaluation kit (specs, approaches, tasks, harness, agent run folders) is saved as `gurudevi-api/spec-eval-2026-11-26.tgz` in the project files.
