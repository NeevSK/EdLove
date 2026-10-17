---
title: "F5 Offline Ownership and Recovery Evidence Audit"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [f5, offline, account-isolation, restore, recovery, evidence]
---

# F5 Offline Ownership and Recovery Evidence Audit

## Substrate and scope

Inspected core account-transition adapter, single-active PowerSync runtime, browser account coordinator, connection lifecycle, their tests, API runbook template and repository release/environment runbooks. This pass checks implemented ownership mechanisms and distinguishes operational plans from restore proof. It does not inspect production backups, keys or private accounts.

| Boundary | Implemented control | Evidence still owed |
| --- | --- | --- |
| Account transition | Filters outgoing principal's queue/dead letters; preserve-and-quarantine or explicit discard; optional replicated-data clear | Verify all calling flows choose an appropriate policy and fail closed if clearing fails. Unbound legacy commands remain untouched; prove they cannot acquire the next user's identity silently. |
| Runtime ownership | Serial promise queue closes old database before activating next | Prove closed SDK handles stop callbacks/uploads and cannot update new account UI. Examine close failure: active reference is cleared before close resolves; do not infer successful disposal from activeAccountId alone. |
| Browser coordination | BroadcastChannel plus localStorage signal; sender filtering and unsubscribe | Parsed casts are not runtime validation or mutual exclusion. Test malformed/stale signals and actual multi-tab behavior. Same-origin script compromise is outside the assurance of this coordination helper. |
| Connection lifecycle | SDK listener, connect, first-sync timeout and unavailable event | withTimeout does not cancel wait/connect; listener unsubscriber is not retained in inspected function. Prove cleanup on account switch, repeated connect and late completion. |
| Local draft | Local-first storage and queue affordances | Distinguish persistence from backup. Lost/destroyed device can lose unsynced work; describe export and privacy limits honestly. |
| Revocation | Server revalidation is an intended protected-commit boundary | Cached copies can outlive permission revocation. Prove settlement denial and visibility controls; do not promise remote deletion of all offline bytes. |
| Database restore | General release runbooks refer to restore/migration procedures | No actual restore report was provided. Test isolated restore, schema compatibility, ledgers/outbox and replay reconciliation. Restored data must not resend acknowledged external effects blindly. |
| Operations | API runbook template provides placeholders and illustrative thresholds | A template is not staffed on-call, tested commands or a funded RTO. Its liveness endpoint is not proof of JWT/Cedar health. Replace claims through a real named operational packet before promotion. |

## Executed evidence

2026-10-13, installed Vitest 5.0.3 via `node node_modules/vitest/vitest.mjs run` in `packages/core`:

- `src/accounts/__tests__/accountTransition.test.ts`
- `src/adapters/powersync/__tests__/singleActivePowerSyncRuntime.test.ts`
- `src/adapters/powersync/__tests__/browserAccountCoordinator.test.ts`
- `src/adapters/powersync/__tests__/connectionLifecycle.test.ts`

G1 boundary / Vitest: 4 files, 10/10 assertions. Substitutions include database clearing/SDK handles, native storage shims and browser signal surfaces as configured by each test. Proves the tested queue filtering, serialized handoff, signal/lifecycle assertions. Does not prove real SQLite clearance, OS key deletion, physical device loss, concurrent live browser sessions, JWT revocation, server settlement, backup restore or production recovery.

## Remediation packets

- **F5-01 / account/client owner:** inventory every transition caller; test unbound commands, cache-clear rejection and in-flight upload/late callbacks.
- **F5-02 / client runtime owner:** define listener disposal and failed-close ownership; actual SDK lifecycle proof before cross-account assurance.
- **F5-03 / security owner:** define cached-data visibility and revocation lag; current authority on every protected replay. Never purge unrelated/private unsynced work without explicit policy.
- **F5-04 / database/operator:** create disposable test database and restore sanitized fixtures; record backup age, schema version, receipts/outbox and external reconciliation. No production reset or destructive commands are authorized here.
- **F5-05 / operator/product:** name primary/absence support, credential succession, and restoration communication; price operator time and reserve. Owner roles in a document are not assigned people.
- **F5-06 / independent challenger:** review isolation/privacy/restore residual risks and the selected capability's evidence matrix before external doors.

## Gate

F5 remains not passed. Useful ownership controls exist, but device, server-revocation, restore and operating-owner evidence is missing. Stop protected rollout when ownership becomes ambiguous, cache clearance fails, receipt/ledger restoration is inconsistent or no accountable recovery owner is available.

## Verification boundary

Only the named G1 suites were executed. Other findings are G0 source observations or explicitly unproven consequences. No real database, provider, personal device or backup was accessed.
