---
title: "Superseded — Attendance Mutation Hardening Slice"
status: "superseded"
created: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [mutations, idempotency, offline, reconciliation, sync, production-hardening]
---

# Superseded — Attendance Mutation Hardening Slice

> **Superseded 2026-09-20.** This document incorrectly chose attendance as
> the starting point. The required prior work is the shared primitive audit
> and foundation contract in
> [Mutation Foundation Primitives Audit](2026-09-20-mutation-foundation-primitives-audit.md).
> Attendance remains a future adopter; it must not define the substrate.

## Outcome

For the first real cross-client mutation, a teacher can save an attendance
register once despite duplicate taps, a lost response, restart, reconnect, or
retry. The user can always distinguish **saved**, **queued**, **retrying**,
**needs attention**, and **reconciled**. A queued intent can never replay
under another account, tenant, classroom, or altered payload.

This establishes the reusable contract for future high-value mutations; it
does **not** claim that every existing write path has been migrated.

## Blast Zone

**RED:** `packages/core/src/logic/`, sync persistence, identity/tenant
boundaries, API contracts/handlers, and database idempotency storage.

**AMBER:** `packages/core/src/lib/sync/`, PowerSync adapter, classroom
attendance screens, and web Workspace attendance boundary.

No implementation code may be generated until Naveen explicitly says
**"proceed"** for this RED slice. This is required by the Gurudevi quality
gate.

## First bounded slice

**Attendance batch for one classroom and date.** It is the highest-leverage
candidate already exposed by both clients:

| Client | Current write path | Material gap |
| --- | --- | --- |
| Mobile | `AttendanceScreen.tsx` writes directly through `api.attendance.batchRecord`; its offline fallback writes SQLite with `INSERT OR REPLACE`. | The visible idempotency key is generated per attempt, is not durably bound to the queued intent, and the direct SQLite write bypasses the stated secure Drizzle mutation boundary. Server acknowledgement/reconciliation is not proven. |
| Web | Workspace `saveAccountAttendance` calls `orpcClient.attendance.batchRecord`. | Account-scoped local drafts exist, but no idempotency envelope is supplied, no offline queue replays it, and timeout-after-commit cannot be reconciled. |
| Shared core | `useSafeMutation`, `useMutationQueue`, `SyncManager`, and the PowerSync connector offer partial queue, retry, lease, DLQ, and durable-ledger primitives. | The registry replay receives only `variables`, so it cannot deliver a queued item’s idempotency key, subject/tenant scope, or reconciliation receipt to a command transport. |

## Target files

- `packages/core/src/lib/sync/types.ts`
- `packages/core/src/lib/sync/useMutationQueue.ts`
- `packages/core/src/lib/sync/sync/SyncManager.tsx`
- `packages/core/src/lib/sync/registry.ts`
- `packages/core/src/hooks/useSafeMutation.ts`
- `packages/core/src/api/attendance.orpc.contract.ts`
- attendance command handler/runtime and the durable server idempotency-ledger
  migration discovered during implementation
- `packages/classroom/src/screens/AttendanceScreen.tsx`
- `apps/gurudevi-web/lib/workspace/attendance.ts`
- focused tests adjacent to each owner above

The implementation must not edit `android/` or `ios/`, put sync business logic
in the Expo root shell, or add a second client queue beside `useMutationQueue`.

## Reuses

- `useMutationQueue` for persisted account-attributed intents and bounded DLQ.
- `SyncManager` for backoff, auth pause, schema migration, logical ordering,
  lease recovery, and conflict presentation.
- `classifyError` for a single retryability decision.
- `generateIdempotencyKey` only where it meets the immutable-intent requirement;
  the existing generated queue key must be passed unchanged on every replay.
- `createPersistenceIdentity` / `derivePersistenceKey` for web account-scoped
  local state; never a raw unscoped browser key.
- Existing attendance natural key (student, classroom, date) for record-level
  state, but not as a replacement for the batch-command receipt.

## Required command contract

The initial contract is a versioned `attendance.batch-record` command with:

- immutable `commandId` (UUIDv7) and `idempotencyKey` generated at intent
  creation, retained across all retries and restart recovery;
- canonical payload digest of the complete ordered logical batch; a key reused
  with a different digest is a conflict, never a retry;
- authenticated `subjectId`, `perspectiveId`, and `tenantId` captured at queue
  time and revalidated before dispatch; account switch quarantines rather than
  reassigns an intent;
- target `classroomId`, attendance `date`, client schema version, and enough
  local revision data to compare a server receipt;
- server response containing the same command/key, terminal disposition
  (`applied` or `already_applied`), and per-record canonical state/revision.

The server persists the receipt and its payload digest in the same transaction
as the batch write. A process-local cache is not acceptable production
authority: it fails on restart and across horizontally scaled instances.

## Lifecycle and recovery matrix

| Event | Required result |
| --- | --- |
| Double tap / concurrent submit | One intent; UI reports the existing pending command rather than making a second request. |
| Request times out after server commit | Retain the command; replay returns the durable `already_applied` receipt and reconciliation completes without a second write. |
| Offline before submit | Persist intent and permitted optimistic local state atomically; show **Queued — N pending**. |
| App kill during dispatch | Expired in-flight lease makes the unchanged command eligible for replay; a valid server receipt settles it. |
| Temporary transport/429/5xx | Bounded exponential backoff with visible retry state; no silent discard. |
| 401/expired session | Pause the account’s queue, require session recovery, and do not increment toward permanent failure. |
| 403/revoked role, tenant/scope mismatch | Stop replay and move to a user-visible resolution state; do not apply locally as success. |
| Payload/key collision | Fail closed into conflict/DLQ with no overwrite. |
| Server validation failure | Permanent user-visible failure with a safe discard/re-edit path; preserve error code, not sensitive payload. |
| Remote record changed | Compare receipt/revision. Attendance’s explicit policy must be selected: server-authoritative conflict, or a documented last-write-wins rule with trusted server time. No implicit `INSERT OR REPLACE` decision. |
| Account switch / logout | Quarantine scoped intents. Logout must not replay, delete, or expose another account’s queue; product decides retention/discard after re-authentication. |
| Reconciliation succeeds | Apply canonical receipt to local projection, clear only that command, retain unrelated drafts, and show **Synced**. |

## State model

`draft → queued → dispatching → retrying | auth_paused | conflict | failed → reconciled`

`failed`, `conflict`, and `auth_paused` are recoverable user-visible states;
they are not generic toast messages. Only `reconciled` clears the command.
The server may return `already_applied`, which is a successful reconciliation,
not an error.

## Does not

- Does not migrate money, entitlement, webhook, invitation, grade, or every
  generic CRUD mutation in this slice.
- Does not promise background execution after the operating system terminates
  the app; foreground/resume/reconnect is the initial supported replay trigger
  until a separately designed background-execution contract exists.
- Does not infer authorization from cached records or raw Supabase metadata.
- Does not silently evict unsynced high-value commands at a capacity limit.
  Overflow behavior requires an explicit user-facing decision before rollout.
- Does not call a mocked/browser PowerSync database proof of real mobile sync.

## Decisions required before implementation

1. For a teacher-role revocation or tenant change while attendance is queued:
   preserve as a recoverable draft for the original account after re-auth, or
   require explicit discard? **Recommended: preserve, quarantine, and require
   explicit discard.**
2. For a remote attendance change before replay: server-authoritative conflict
   requiring review, or last-write-wins using server-issued revision/time?
   **Recommended: server-authoritative conflict for the first slice.**
3. What user action is allowed after a durable permanent failure: edit and make
   a new command, retry unchanged only, or discard? **Recommended: edit creates
   a new command; unchanged retry is allowed only for transient/auth recovery.**

## Evidence plan

| Evidence | Required proof |
| --- | --- |
| G0 contract / Vitest | command identity remains stable across retries; duplicate suppression; key/payload collision; state transitions; account/tenant quarantine; receipt reconciliation. |
| G1 boundary / Vitest | oRPC/mobile transport carries immutable envelope; durable ledger returns applied/already-applied; 401/403/409/422/429/5xx classification; persistence failures. Explicit mocked Supabase, SQLite, PowerSync, and network substitutions. |
| G3 component runtime | Mobile and web attendance UI render queued/retrying/conflict/reconciled recovery states under explicit native/browser substitutes. |
| G4 browser | Real web offline/reconnect, refresh during dispatch, account switch, retry-after-timeout, and accessible error recovery. |
| G5 device | Android and iOS physical-device offline, process kill/resume, reconnect, role change, and server-receipt reconciliation. |
| Operations | Privacy-safe correlation from command to receipt, server ledger retention/cleanup, alert/runbook for DLQ growth and reconciliation failures. |

No G0/G1/G3 result establishes real browser, device, PowerSync service, or
production behavior.

## Rollout and rollback

Ship behind a narrowly scoped attendance-sync rollout control. Dual-write or
dual-dispatch is prohibited: one selected command path owns a save. Rollback
stops new queue dispatch and leaves existing commands visible/quarantined for
recovery; it must never delete or blindly replay them through the legacy path.
