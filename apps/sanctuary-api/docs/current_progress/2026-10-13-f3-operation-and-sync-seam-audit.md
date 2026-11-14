---
title: "F3 Operation Integrity and Sync Seam Audit"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [f3, sync, idempotency, transactions, outbox, receipts, audit]
---

# F3 Operation Integrity and Sync Seam Audit

## Current-state evidence

Inspected on 2026-10-13: `packages/core/src/api/handlers/sync.ts`, `packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts`, `packages/core/src/effect/Schedules.ts`, API `core/handlers/sync.ts`, `core/routes/orpc.ts`, `core/routes/nativeORPCPaths.ts`, `core/routes/durableAgents.ts`, and classroom-note writes in `core/handlers/educational.ts`. This is a bounded seam audit, not all-mutation coverage.

| Seam | Existing strength | Gap / evidence owed |
| --- | --- | --- |
| Server PowerSync batch | Transaction, actor/key ledger, payload hash, row lock, completed result replay | Durable ledger is conditional on raw-query methods; otherwise process-local fallback. Prove production adapter always uses durable branch, same-key concurrency, rollback, and restart. |
| Active PowerSync connector | Account-specific session acquisition; stable batch key; batch completion follows HTTP success; Effect used | Sends Hono client `$post` JSON `{crud,idempotencyKey}` to `/api/powersync/upload`; current mount routes through RPCHandler. Prove wire compatibility with native `{body: ...}` contract and path/encoding before claiming upload parity. |
| Client acknowledgement | Rejects non-2xx and leaves batch incomplete | Successful body is not parsed/validated before `batch.complete()`. Establish canonical acknowledgement and replay result; HTTP success alone must not prove batch settlement. |
| Client retry | Existing bounded Effect schedule | Retry applied without error-category predicate in inspected connector. Prove auth/permission/validation/conflict are not blindly repeated and account is revalidated during retries. |
| Classroom note | Server author + policy + lifecycle events | Note/event writes separate; no operation receipt or payload-bound idempotency in selected contract. Design atomic settlement before cross-door promotion. |
| Agent request | Run ledger, request fingerprint, replay branch, event table, scoped actor | Insert run → insert event → Inngest send are separate. Replay returns before send. Crash after first write may strand request; repair dispatcher not proven. |

## Required bounded investigations

- **F3-01 / wire contract:** extend the existing sync API/connector tests to execute the actual connector against the actual mounted API handler, substituting auth/DB only where declared. Compare Hono URL/body with RPC URL/body. Neither a cast nor a unit mock proves interoperability.
- **F3-02 / acknowledgement:** prove malformed/empty/partial-success HTTP 2xx does not remove the local batch; validate processed count or explicit full-batch receipt and stable operation identity.
- **F3-03 / durable ledger:** prove rollback includes ledger and writes, concurrent duplicates settle once, changed payload conflicts, restart returns original outcome. Use disposable owned DB; no production mutations.
- **F3-04 / retry ownership:** map SDK retry, Effect retry, client RPC retry and worker retry. Assign one budget per operation and predicate per failure class. Avoid multiplicative retry loops.
- **F3-05 / account switch:** switch active account between first attempt and retry/acknowledgement. Preserve old account's queue and prevent new-session upload or cross-account completion.
- **F3-06 / agent repair:** terminate after run insert and before/after dispatch. Demonstrate repair with the same event identity, not a fresh run. Define maximum pending age and operator query.
- **F3-07 / note settlement:** characterize current two-write behavior, then prepare transaction/idempotency/receipt plan preserving existing callers and deletion veto.

Each packet must record exact owner role, files, dependency impact, characterization test, rollback, and acceptance evidence before implementation. No new generic repository or queue is authorized by this audit.

## Architecture correction

Effect already exists in the active PowerSync connector and shared runtime/schedules. Earlier statements that Effect is merely a future adoption option were incomplete. The decision is whether and where to reuse its present failure/cancellation semantics; not whether to add another retry framework. A bounded retry count does not establish safe retry categories or cancellation of an external effect.

## Gate

### Wire characterization executed

`pnpm --filter @repo/sanctuary-api exec vitest run src/__tests__/sync.orpc.test.ts` on 2026-10-13: 1 file, 8/8 assertions. The added test sends the connector's inspected `/api/powersync/upload` URL, flat JSON and bearer/idempotency headers through the actual in-memory app. It receives 404 `Not Found`. The native `sync.uploadBatch({body: ...})` call succeeds with an empty batch in the same test context.

G1 boundary / Vitest: real Hono/RPC mounting, with shared suite substitutes for identity, policy/storage and native dependencies. Proves incompatibility of these two request shapes in the tested app. Does not mount the PowerSync connector, execute SQLite, prove database atomicity, or establish production deployment. The test characterizes the defect and must be revised to intended success assertions when an authorized compatibility repair is implemented; it is not the desired final contract.

F3 is not passed. Prioritize the actual connector→API wire/acknowledgement contract alongside server durability, rather than adding a capability registry above an unproven upload seam. Classroom-note work remains design-only. Existing durable ledger code is useful substrate, not universal operation assurance.

## Verification boundary

Source inspection establishes control flow; the G1 wire characterization above reproduces rejection at the mounted API. No live upload, concurrent DB operation, crash repair, account switch or physical-device test was executed here. Full connector interoperability and malformed-acknowledgement consequences still require F3-01/02 proof.
