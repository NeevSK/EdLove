---
title: "Reliability + Performance Hardening Plan"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Reliability + Performance Hardening Plan
## polymath-platform — gurudevi-mobile (Audit items #4, #6, partial #3)

---

## Context

The app already has a solid offline foundation:
- **Persistent outbox** — `useMutationQueue` (Zustand + MMKV, `'gurudevi-mutation-queue'`)
- **Headless orchestrator** — `apps/gurudevi-mobile/src/lib/sync/SyncManager.tsx` (replay loop, 3 retries)
- **Safe mutation hook** — `packages/core/src/hooks/useSafeMutation.ts` (exponential backoff, offline detection, queueing)
- **Mutation registry** — `apps/gurudevi-mobile/src/lib/sync/registry.ts` (manual `mutationKey → async fn` map)

**Critical gaps (audit #4):**
1. No idempotency keys → duplicate inserts on retry
2. SyncManager retries immediately → retry storms on unstable networks
3. Permanent errors treated same as transient → auth/constraint failures retry until dropped
4. Failed mutations silently dropped (no dead letter queue, no user notification)
5. No persistent audit trail → impossible to debug sync failures in the field
6. No conflict resolution policy → multi-device edits undefined

**Priority map from audit:**
- **P0** #4 Reliability / offline — full implementation
- **P1** #6 Performance — targeted memoization
- **P2** #3 Security — partial (error classification prevents privilege escalation via retry)

---

## Phase 1 — Idempotency Key Generation

### CREATE: `packages/core/src/lib/sync/idempotency.ts`

Deterministic UUID-v5 key from `(scope, name, variables)`:
- Uses `uuid` v5 (already installed — used in `useMutationQueue.ts`)
- Keys are stable: same inputs → same key → identical mutations deduplicated
- Sorted JSON serialization of variables prevents key collisions from key-ordering differences

---

## Phase 2 — Extended Mutation Envelope

### MODIFY: `packages/core/src/lib/sync/types.ts`

Add to `QueuedMutation`:
```
idempotencyKey: string    // deterministic hash — prevents duplicate server writes on retry
backoffUntil?: number     // epoch ms — SyncManager skips this item until time passes
lastError?: string        // last error string — shown in DLQ + audit log
userId?: string           // who queued it — for conflict attribution
```

Add to `MutationQueueState`:
```
deadLetterQueue: QueuedMutation[]
moveToDeadLetter: (id, reason) => void
clearDeadLetterQueue: () => void
```

---

## Phase 3 — Upgraded useMutationQueue

### MODIFY: `packages/core/src/lib/sync/useMutationQueue.ts`

1. `addToQueue` auto-generates `idempotencyKey` and **deduplicates**: if identical key already in queue, skip instead of adding a duplicate
2. Add `deadLetterQueue: []` to initial state (persisted under same MMKV key `'gurudevi-mutation-queue'`)
3. Add `moveToDeadLetter(id, reason)` — moves item from active queue → DLQ, sets `lastError`
4. Add `clearDeadLetterQueue()` action

---

## Phase 4 — Persistent Audit Log (Ring Buffer)

### CREATE: `packages/core/src/lib/sync/MutationAuditLog.ts`

Zustand + persist — last **200 entries**, oldest removed when full (ring buffer). Zero hot-path overhead (write-only from sync, read from debug/admin screens).

```typescript
type MutationOutcome = 'queued' | 'syncing' | 'success' | 'retrying' | 'dead_letter' | 'discarded'

interface AuditEntry {
  id: string               // Same UUID as QueuedMutation.id
  idempotencyKey: string
  scope: string
  name: string
  status: MutationOutcome
  attempts: number
  queuedAt: number         // Unix ms
  updatedAt: number        // Last status change
  syncedAt?: number
  lastError?: string
}
```

Actions: `logEntry`, `updateEntry`, `getEntries`, `getFailedEntries`
MMKV key: `'gurudevi-mutation-audit-log'`

---

## Phase 5 — Conflict Resolution Policy

### CREATE: `packages/core/src/lib/sync/conflictResolution.ts`

```typescript
type ConflictPolicy = 'last_write_wins' | 'server_wins' | 'client_wins'

// Domain defaults
const DOMAIN_CONFLICT_POLICIES = {
  attendance: 'last_write_wins',  // Latest mark wins
  classroom:  'last_write_wins',
  community:  'server_wins',      // Community content: server authoritative
  self:       'client_wins',      // Personal journal/energy: device always wins
  school:     'last_write_wins',
  general:    'last_write_wins',
}

// Pure utilities (no side effects)
detectConflict(clientUpdatedAt, serverUpdatedAt): boolean
resolveConflict(policy, clientTs, serverTs): 'use_client' | 'use_server'
```

Utility layer — ready to use in UPDATE replay paths without mandating immediate API changes.

---

## Phase 6 — Hardened SyncManager

### MODIFY: `apps/gurudevi-mobile/src/lib/sync/SyncManager.tsx`

**Error classification (new helpers in same file):**
```typescript
isTransientError(err)  // network, timeout, 5xx, 429 rate-limit → retry
isPermanentError(err)  // 4xx (except 429), DB codes 23505/23503/42501, auth → dead letter
```

**Upgraded `processQueue` loop:**
1. Skip items where `Date.now() < item.backoffUntil` (backoff respected)
2. On **success**: `removeFromQueue(id)` + audit `success`
3. On **transient error**: set `backoffUntil = now + min(2^retryCount * 1000, 30_000)ms` + audit `retrying`
4. On **permanent error**: `moveToDeadLetter(id, err.message)` immediately + audit `dead_letter` + toast `"1 action needs review"`
5. On **max retries exceeded**: `moveToDeadLetter` (not silent drop as today) + audit `dead_letter`
6. On **unknown registry key**: `moveToDeadLetter` (not silent drop as today)

Toast: dead letter count → `"N offline actions couldn't sync — tap to review"` (error type)

---

## Phase 7 — useSafeMutation Wire-up

### MODIFY: `packages/core/src/hooks/useSafeMutation.ts`

Minimal changes — behavior unchanged, adds:
1. Import `generateIdempotencyKey` → computed before `addToQueue` call
2. Accept optional `mutationType?: MutationType` option (default `'CREATE'`) — passed to queue item
3. Write `'queued'` audit entry when item goes to outbox

---

## Phase 8 — Registry Expansion

### MODIFY: `apps/gurudevi-mobile/src/lib/sync/registry.ts`

Add high-frequency mutations that components use via `useSafeMutation` but aren't currently registered (would be silently dropped offline):
- `'createStudent'` → `api.students.create(vars)`
- `'updateAttendance'` → `api.attendance.record(vars.classroomId, vars.studentId, vars.status, vars.date)`
- `'updateStudent'` → `api.students.update(vars.id, vars.updates)`

---

## Phase 9 — Sync Barrel Export

### CREATE: `packages/core/src/lib/sync/index.ts`
```typescript
export * from './types'
export { useMutationQueue } from './useMutationQueue'
export { useMutationAuditLog } from './MutationAuditLog'
export * from './idempotency'
export * from './conflictResolution'
```

### MODIFY: `packages/core/src/hooks/index.ts`
Add: `export { useMutationAuditLog } from '../lib/sync/MutationAuditLog'`

---

## Phase 10 — Performance: Targeted Memoization

### MODIFY: `packages/classroom/src/components/TeacherDashboard.tsx`
- Wrap `handleClassroomsLoaded` in `useCallback([])` — recreated every render today → triggers ClassroomList re-renders
- Wrap `fetchPendingRequests` in `useCallback([userId])`
- Derive `stats` from `classrooms` via `useMemo([classrooms])` instead of separate state write

---

## Complete File Map

| File | Action |
|---|---|
| `packages/core/src/lib/sync/idempotency.ts` | **CREATE** |
| `packages/core/src/lib/sync/MutationAuditLog.ts` | **CREATE** |
| `packages/core/src/lib/sync/conflictResolution.ts` | **CREATE** |
| `packages/core/src/lib/sync/index.ts` | **CREATE** |
| `packages/core/src/lib/sync/types.ts` | MODIFY — extend QueuedMutation + MutationQueueState |
| `packages/core/src/lib/sync/useMutationQueue.ts` | MODIFY — DLQ + dedup by idempotency key |
| `packages/core/src/hooks/useSafeMutation.ts` | MODIFY — idempotency key + audit write + mutationType |
| `apps/gurudevi-mobile/src/lib/sync/SyncManager.tsx` | MODIFY — backoff + error classify + DLQ routing + audit |
| `apps/gurudevi-mobile/src/lib/sync/registry.ts` | MODIFY — add missing mutations |
| `packages/core/src/hooks/index.ts` | MODIFY — export audit log |
| `packages/classroom/src/components/TeacherDashboard.tsx` | MODIFY — memoize callbacks + derived stats |

---

## Verification

```bash
node_modules/.bin/tsc --project packages/core/tsconfig.json --noEmit
node_modules/.bin/tsc --project packages/classroom/tsconfig.json --noEmit
node_modules/.bin/tsc --project apps/gurudevi-mobile/tsconfig.json --noEmit
```

**Behavioral checks:**
1. Identical mutation queued twice → only 1 entry (idempotency dedup)
2. Transient error → `backoffUntil` set in future; next sync cycle skips item
3. Permanent error (403/23505) → `deadLetterQueue` populated immediately; not retried
4. Audit log → `useMutationAuditLog.getEntries()` shows full lifecycle per mutation
5. `resolveConflict('last_write_wins', olderClientTs, newerServerTs)` → `'use_server'`
