---
title: "Mutation Foundation Change Comparison"
status: "review_required"
created: 2026-09-21
author: "Naveen"
scribe: "Codex"
tags: [mutation, offline, comparison, review, ingress, powersync]
---

# Mutation Foundation Change Comparison

## Scope and baseline

This compares the mutation/offline workstream against `HEAD` at the start of
the work. It does **not** claim ownership of the concurrent auth, route-intent,
QR, scanner, or web callback edits visible in the working tree. Those changed
files are listed in the repository status but are outside this comparison.

For each tracked file, the exact raw comparison is available locally with:

```powershell
git diff HEAD -- <path>
```

New files have no `HEAD` baseline and are marked **new**.

## Executive result

The first implementation temporarily removed important existing behavior from
the mobile background scheduler and Inngest bridge. That removal was reverted.
The current version preserves the original efficiency policy, task
registration, batching, jitter, DLQ UI, and workflow bridge while layering
principal/lifecycle checks around them.

The first comparison found two material gaps: `eventId` was not reaching the
Inngest transport, and the standalone drainers did not skip an unexpired lease.
Both are corrected in the current working tree. `isSyncing` cleanup is now in
`finally` in both drainers and the legacy DLQ is migration-backed into the core
DLQ. The remaining promotion risks are atomic durable server receipts for
direct registry success, deployed receipt-schema/actor-isolation proof,
persistence/restart and lease-contention proof, recovery UX, and the absent
Next.js browser adapter.

## File-by-file comparison

| File | Baseline behavior retained | Additions/improvements | Removed behavior | Review status |
| --- | --- | --- | --- | --- |
| `apps/gurudevi-mobile/src/lib/backgroundSync.ts` | Efficiency decision, battery/network sampling, batch size 10, retry jitter, Expo task registration, foreground trigger, persistent legacy DLQ, status events, newest-first DLQ ordering, and `failedAt` recovery metadata. | Exact-account filter, lifecycle state guard, atomic lease acquisition/exclusion, `finally` state cleanup, unknown registry key to DLQ, and migration of valid legacy DLQ records into core recovery before use. | Old unscoped replay is deliberately unavailable: a legacy record is never rebound to whichever account happens to be active. | Add runtime lease-contention and persistence/restart coverage. |
| `apps/gurudevi-mobile/src/lib/inngestEvents.ts` | Selected remote mutation set, authenticated actor check, original event payload/correlation data, mobile event bridge installation. | Receipt poll after event submission; `pending` rather than premature queue removal; worker failure mapped to error; stable command ID reaches Inngest; receipt lookup now uses canonical typed oRPC-over-Hono client. | None intentionally after restoration. | Add bridge/receipt contract tests. |
| `apps/gurudevi-mobile/src/entry/AuthenticatedSyncService.tsx` | Active-session gate and workflow dispatcher wiring. | No semantic change; a trailing blank line is the only current diff. | None. | Remove whitespace-only diff. |
| `apps/sanctuary-api/src/core/handlers/sync.ts` | Existing PowerSync upload handler. | Authenticated receipt lookup restricted to the requesting actor, returning pending/completed/failed. | None. | Focused pending/completed/failed handler tests exist; prove deployed `platform_worker_events` schema and actor isolation under the real DB. |
| `packages/core/src/api/sync.orpc.contract.ts` | Existing upload contract. | New typed receipt route contract. | None. | Client bridge uses this endpoint; add a transport integration test. |
| `packages/core/src/lib/sync/SyncManager.tsx` | FIFO/logical-clock ordering, version gate, retry classification, conflict UI, DLQ, audit/event emission. | Fails closed for unbound work; lifecycle states; account-paused/conflict guard; pending workflow receipt keeps command retryable. | Legacy unbound commands no longer replay. This is deliberate quarantine, not deletion. | **Review:** command removal still follows direct registry success, which is not a generic durable receipt. |
| `packages/core/src/lib/sync/types.ts` | Existing queue metadata/capacity constants. | Lifecycle state/error code, capacity error, explicit pending dispatcher result, restore/resume methods. | None. | **Review:** `variables: any` and string registry remain legacy escape hatches. |
| `packages/core/src/lib/sync/useMutationQueue.ts` | Persistence, deterministic key calculation, same-user deduplication, bounded DLQ. | Account defaulting, atomic capacity refusal, lifecycle initialization, DLQ restoration, principal-scoped auth resume. | FIFO main-queue eviction replaced with refusal. This is a deliberate policy change: accepted user work is no longer silently deleted. | Decide product UX for overflow and add an accessible recovery surface. |
| `packages/core/src/lib/sync/commandLifecycle.ts` **new** | N/A. | Legal state-transition table and assertion helper. | N/A. | Add coverage for pending workflow retry. |
| `packages/core/src/lib/sync/__tests__/commandLifecycle.test.ts` **new** | N/A. | Lifecycle contracts including rejected-to-queued recovery. | N/A. | Extend for pending workflow retry. |
| `packages/core/src/lib/sync/__tests__/useMutationQueue.test.ts` | Account partition/dedup/DLQ coverage. | Overflow refusal, concurrent insertion capacity, account attribution, scoped resume coverage. | Eviction assertion removed because production behavior changed to refusal. | Good G0 scope; does not prove persistence/restart. |
| `packages/core/src/store/resetScopedStores.ts` | Auth, tenant, UI, growth, and feature reset. | Queue/DLQ are preserved to avoid silent loss on account transition. | Global queue/DLQ clear. Deliberate, but not a true persisted partition. | Auth lifecycle must explicitly resolve preserve/quarantine/discard. |
| Mobile architecture/entry tests | Existing tests retained. | Static assertions for background account/lifecycle usage. | No semantic test behavior removed. | Add runtime background race coverage. |
| Planning/ledger documents | Existing foundation plan and ledger. | Updated to describe restored behavior, oRPC-over-Hono receipt boundary, account transition, and evidence limits. | Earlier inaccurate claim that the background drainer was retired was corrected. | Keep records aligned with final code. |

## Detailed behavioral deltas

### Main queue capacity

| Before | Current | Consequence |
| --- | --- | --- |
| When over 500 commands, evict oldest commands silently. | Reject the new enqueue with `MutationQueueCapacityError`; accepted work remains. | Safer for user intent, but requires a visible recovery/overflow UX. |

### Account transition

| Before | Current | Consequence |
| --- | --- | --- |
| Global queue and DLQ were cleared during scoped-store reset. | Commands remain, are bound to their original principal where known, and replay filters exact account equality. | Prevents deletion/cross-account replay; legacy unbound commands are quarantined until migration/discard. |

### Inngest settlement

| Before | Current | Consequence |
| --- | --- | --- |
| Event accepted by Inngest returned `dispatched`, so local command was removed before worker completion. | Event is sent, receipt route is polled, `pending` schedules retry, `completed` permits removal. | Correct local settlement model, pending final transport-idempotency fix described above. |

### Background replay

| Before | Current | Consequence |
| --- | --- | --- |
| Direct registry replay ignored account ownership and lifecycle state; retry could detach account metadata. | Exact account filter, lifecycle updates, lease exclusion, `finally` cleanup, preserved retry metadata, unknown mutation DLQ. | Retains useful scheduler behavior; runtime concurrent-drainer proof remains. |

## Files changed outside this workstream

The following are concurrent edits and have not been judged by this document:

- `apps/gurudevi-web/app/(sanctuary)/auth/CallbackHandler.tsx`
- route-intent policy/spec/checker files
- `packages/core/src/logic/managers/DeepLinkManager.ts`
- `packages/scanner-kit/src/hooks/useQRDeepLink.ts`
- auth callback/session files under `packages/core/src/logic/auth/`
- new web deployment/auth-plan documents and `apps/gurudevi-web/vercel.json`

## Required next correction order

1. Add G1 tests for actor isolation, event-id/receipt transport, and simultaneous
   foreground/background lease contention.
2. Prove migration-backed DLQ recovery across restart and give users an
   accessible overflow/DLQ recovery surface.
3. Replace legacy string-registry/direct-success semantics with a typed command
   envelope and atomic server receipt before migrating more domains.
