# Data Highways Migration Checklist

## Use This When

You are adding a new feature, refactoring a flow, or deciding whether a call should go through:

- direct API
- PowerSync
- local-first queueing

## Quick Rule

If you cannot answer the question "which highway is this on?" in one sentence, the boundary is too fuzzy.

## Default Assignments

### Direct API

Use for:

- identity resolution
- onboarding gating
- route authorization
- session bootstrap
- link and QR resolution
- authoritative profile reads and writes

Fail loudly when:

- the route is missing
- the client tries to reach PowerSync before runtime is ready
- a browser bootstrap path depends on SQLite

### PowerSync

Use for:

- replicated classroom/workspace data
- offline-friendly reads
- client-visible records that should remain available while offline

Fail loudly when:

- the feature is not actually replicated
- the feature is only needed for bootstrap
- the data is not worth sync complexity

### Local-First Queue

Use for:

- optimistic writes
- deferred mutations
- background retries
- audit-style events that can safely queue

Fail loudly when:

- the write must be synchronous and authoritative
- the action would be unsafe if delayed
- the feature has no retry semantics

## Current Call-Site Audit

### Direct API Highway

These should stay direct unless a deliberate migration changes the boundary:

- `packages/core/src/hooks/useAuthorityLifecycle.ts`
- `packages/core/src/native/useAuthorityLifecycle.ts`
- `packages/core/src/lib/authorization.ts`
- `packages/core/src/hooks/useIdentity.ts`
- `packages/core/src/accounts/deviceAccounts.ts`
- `packages/core/src/native/deviceTrust.ts`
- `packages/core/src/logic/managers/AuthManager.ts`
- `packages/core/src/api/identity.ts`
- `packages/core/src/api/deviceTrust.ts`
- `packages/core/src/api/echo.ts`
- `packages/core/src/api/messaging.ts`
- `packages/core/src/api/privacy.ts`
- `packages/core/src/api/social.ts`
- `packages/core/src/api/studentObservations.ts`
- `packages/core/src/api/studentPotential.ts`
- `packages/core/src/api/warmMirror.ts`
- `packages/core/src/api/classroomNotes.ts`
- `packages/core/src/api/principalNotes.ts`
- `packages/core/src/api/circles.ts`
- `packages/core/src/api/hooks/community.hooks.ts`

### PowerSync Highway

These are the places most likely to grow into replicated/offline data flows:

- `packages/core/src/adapters/powersync/*`
- `packages/core/src/logic/permissions/localEvaluator.ts`
- `packages/core/src/logic/permissions/localEvaluator.native.ts`
- `apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx`
- `apps/gurudevi-mobile/src/services/FeatureSyncManager.tsx`
- `packages/core/src/api/orchestration/operations.ts`
- `packages/core/src/api/orchestration/identity.ts` if it starts serving replicated workspace context

### Local-First Queue Highway

These are mutation capture lanes or should become them:

- `packages/core/src/lib/sync/deviceSecurityIntents.ts`
- `packages/core/src/lib/sync/MutationAuditLog`
- `packages/core/src/lib/sync/useMutationQueue`
- any queued mutation handler in `packages/core/src/api/*` that retries when offline

## Migration Steps

1. Decide the authority level.
2. Decide whether the user must stay productive offline.
3. Decide whether the action is safe to queue.
4. Put the feature behind the matching highway helper or client.
5. Add a loud failure message for the wrong lane.
6. Write one test that proves the wrong highway throws.

## Example Decisions

- "Sign in and decide whether onboarding is complete" -> Direct API
- "Load classroom roster while offline" -> PowerSync
- "Queue a device audit event while offline" -> Local-first queue
- "Fetch a school summary before entering the app" -> Direct API
- "Keep a user-editable lesson draft and sync later" -> Local-first queue

## Red Flags

- a browser bootstrap path importing PowerSync directly
- identity logic reading SQLite during startup
- a feature mixing route gating and replicated workspace reads
- a sync queue doing work that should have been an immediate API call

