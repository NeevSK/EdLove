---
title: "Sovereign Resilience & Hybrid Sync Architecture (May 2026)"
status: "active"
created: 2026-05-06
updated: 2026-07-26
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Sovereign Resilience & Hybrid Sync Architecture (May 2026)

> **Status**: Living Document — Updated 2026-05-05
> **Scope**: `apps/gurudevi-mobile` and its workspace packages

---

## 1. Executive Summary

Gurudevi-Mobile operates in **intermittent network environments** (Sri Lanka). The 2026 architecture answer is a **Hybrid Resilience Path**: a two-lane system where a premium replication service (PowerSync) and a handcrafted Message Bus (Outbox) coexist, with the bus acting as the permanent fallback and Intent Engine.

The platform does **not** follow "Online-First with Caching." It is **Action-First**: user intents are persisted the moment they are created, independent of the network. The network is a background concern.

---

## 2. Architecture Map

```
┌──────────────────────────── Mobile Device ─────────────────────────────────┐
│                                                                             │
│   ┌─────────────────────────────────────────────────────┐                 │
│   │              Hexagonal Domain Layer                  │                 │
│   │  (Domain Logic / Ports / ReBAC Guards)               │                 │
│   │                                                       │                 │
│   │  User Action  →  Domain Intent  →  Port              │                 │
│   └────────────────────┬────────────────────────────────┘                 │
│                         │ emits to                                         │
│          ┌──────────────▼──────────────────┐                              │
│          │     Sovereign Event Bus           │  ◄── Network events        │
│          │   (eventBus.ts — in-process)      │  ◄── Sync lifecycle        │
│          │   SovereignEventMap — typed       │  ◄── Conflict events       │
│          └──┬─────────────┬─────────────────┘                             │
│             │             │                                                 │
│    ┌────────▼─────┐  ┌────▼────────────────────────────────┐             │
│    │  Foreground  │  │        Infrastructure Adapters        │             │
│    │  UI Hooks    │  │                                       │             │
│    │ useSyncStatus│  │  ┌─────────────────────────────────┐ │             │
│    │              │  │  │  🟢 Path 1: PowerSync Adapter   │ │             │
│    └──────────────┘  │  │  (future — feature-flagged)     │ │             │
│                       │  │  Mirrors Postgres → SQLite       │ │             │
│                       │  └──────────────┬──────────────────┘ │             │
│                       │                 │                      │             │
│                       │  ┌─────────────▼──────────────────┐  │             │
│                       │  │  🟡 Path 2: Mutation Queue     │  │             │
│                       │  │  (useMutationQueue — Zustand)  │  │             │
│                       │  │  Idempotent · DLQ · Backoff    │  │             │
│                       │  └──────────────┬──────────────────┘  │             │
│                       │                 │                       │             │
│                       │  ┌─────────────▼──────────────────┐   │             │
│                       │  │  SyncManager (Foreground)      │   │             │
│                       │  │  + Background Task (OS-level)  │   │             │
│                       │  │  expo-background-task (SDK 55) │   │             │
│                       │  └──────────────┬──────────────────┘   │             │
│                       └─────────────────┼────────────────────────┘             │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                           │
                    ┌──────────────────────▼──────────────────────┐
                    │               Cloud Layer                    │
                    │                                              │
                    │  ┌───────────────┐   ┌──────────────────┐  │
                    │  │  Supabase     │   │  Inngest         │  │
                    │  │  (Postgres)   │   │  (Workflows)     │  │
                    │  └───────────────┘   └──────────────────┘  │
                    └──────────────────────────────────────────────┘
```

---

## 3. The Two Paths

### 🟢 Path 1 — Resonant Sync (PowerSync, In Transition)
| Attribute | Detail |
| :--- | :--- |
| **When active** | `isPowerSyncEnabled` evaluates `true` from the GrowthBook snapshot |
| **What it syncs** | Standard CRUD — Attendance rows, Mood logs, Profile data |
| **Mechanism** | Postgres logical replication → local SQLite encrypted via SQLCipher (`op-sqlite` JSI C++ engine) |
| **Cost** | $0 free (50 concurrent) / $50/mo (1,000 concurrent) |
| **Status** | **In Transition (May 2026)** — Upgrading native driver from deprecated `quick-sqlite` to active `op-sqlite` under PowerSync, wrapped in Drizzle ORM. See [local-first-transition-spec.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/local-first-transition-spec.md). |

### 🟡 Path 2 — Sovereign Message Bus (Active Now)
| Attribute | Detail |
| :--- | :--- |
| **When active** | Always. Falls back from Path 1 if PowerSync is disabled or unavailable |
| **What it handles** | Write intents + Inngest workflow triggers |
| **Mechanism** | Zustand + MMKV persistence → SyncManager → Supabase/Inngest |
| **Cost** | $0 — entirely in-house |
| **Status** | **Live** |

---

## 4. Key Components

### 4.1 `useMutationQueue` — The Outbox
- **Location**: `packages/core/src/lib/sync/useMutationQueue.ts`
- **Persistence**: MMKV via Zustand (survives app restart)
- **Idempotency**: SHA-256 hash of `scope + name + sortedVariables`
- **Dedup**: Prevents duplicate queue entries for identical intents
- **DLQ**: Permanent failures are moved to `deadLetterQueue` (not lost)

### 4.2 `SyncManager` — Foreground Drain Engine
- **Location**: `packages/core/src/lib/sync/sync/SyncManager.tsx`
- **Trigger**: `isOnline && queue.length > 0 && !isSyncing` (reactive `useEffect`)
- **Strategy**: Exponential backoff (2^retryCount * 1000ms, max 30s)
- **Error routing**: PERMANENT → DLQ, CONFLICT → ConflictStore, TRANSIENT → retry
- **Bus integration**: Emits `sync:started`, `sync:completed`, `sync:item_succeeded`, `sync:item_moved_to_dlq`, `conflict:detected`

### 4.3 `SovereignBus` — Internal Reactive Event Bus
- **Location**: `packages/core/src/lib/sync/eventBus.ts`
- **Pattern**: Map of Sets — O(1) subscribe/emit, typed via `SovereignEventMap`
- **Memory safety**: Every `on()` returns an unsubscribe function — no leaks
- **Events**: Sync lifecycle, conflict, network, background task, PowerSync signals

### 4.4 Background Task — The Heartbeat
- **Location**: `apps/gurudevi-mobile/src/lib/backgroundSync.ts`
- **Library**: `expo-background-task` (SDK 55 — replaces deprecated `expo-background-fetch`)
- **Native backend**: WorkManager (Android) / BGTaskScheduler (iOS)
- **Interval**: 15 minutes (OS may defer — suggestion, not a guarantee)
- **Task name**: `GURUDEVI_BACKGROUND_SYNC`
- **Behaviour**: Drains up to 10 items per pulse; emits `background:pulse` to bus
- **Fallback**: If OS restricts background tasks, foreground SyncManager remains active

### 4.5 `NetworkBusAdapter` — Network → Bus Bridge
- **Location**: `packages/core/src/adapters/NetworkBusAdapter.ts`
- **Purpose**: Translates NetInfo state changes into `network:online`/`network:offline` bus events
- **Call site**: `bootstrapPlatform()` (once at app startup)

### 4.6 `useSyncStatus` — UI Sync Hook
- **Location**: `packages/core/src/lib/sync/hooks/useSyncStatus.ts`
- **Returns**: `{ kind, pendingCount, lastSyncedAt, lastError, conflictCount }`
- **Use in**: Sync indicator badge, "3 pending" banner, conflict notification

---

## 5. Loophole Resolution Tracker

| # | Loophole | Status | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | Background sync dies when app is closed | ✅ Fixed | `expo-background-task` + WorkManager/BGTaskScheduler |
| 2 | Dual-path fragmentation (Supabase + Inngest) | ✅ Mitigated | PowerSync adapter (`SupabasePowerSyncConnector`) handles CRUD replication. Message Bus retains Intent/Workflow mutations. Paths are cleanly separated at the connector level. |
| 3 | No reactive "Event Bus" for UI | ✅ Fixed | `SovereignBus` + `useSyncStatus` hook |
| 4 | Read-Resilience disconnected from Write-Resilience | ✅ Fixed | `useOptimisticMerge` hook folds pending queue mutations into cached reads. Screens can now show speculative updates with `_optimistic: true` markers. |
| 5 | ConflictStore not persistent — crash loses conflict state | ✅ Fixed | Added Zustand `persist` middleware + `resolvedConflicts` ring buffer (last 50). Bus emissions now happen from inside store actions. |
| 6 | Network events not on the bus — UI/workers blind to transitions | ✅ Fixed | `NetworkBusAdapter` wired into `bootstrapPlatform()` — emits `network:online`/`network:offline` on every transition. |
| 7 | `UserContext` ReBAC fields missing from default empty contexts | ✅ Fixed | Added `bonds: []`, `primaryCapacity: null`, `activeBondStatus: 'active'` to both `feature.slice.ts` copies and `resetScopedStores.ts`. |
| 8 | Duplicate `feature.slice.ts` — `store/slices/` and `logic/store-slices/` | ✅ Fixed | `logic/store-slices/feature.slice.ts` now re-exports from `store/slices/feature.slice`. Single source of truth. |


---

## 6. Feature Flags (Sync-Specific)

Feature rollout is managed by GrowthBook and locally cached snapshots. Supabase `global_configs` is not a feature-rollout authority. See [Feature Lifecycle Management](./feature-lifecycle-management.md).

| Flag Key | Default | Effect |
| :--- | :--- | :--- |
| `ENABLE_POWERSYNC` | `false` | Activates Path 1 — enables PowerSync adapter |
| `DISABLE_BACKGROUND_SYNC` | `false` | Kills the background heartbeat (for debugging) |

---

## 7. The PowerSync Convergence — **In Transition (op-sqlite & Drizzle)**

Path 1 (PowerSync / Resonant Sync) is currently in transition to a fully type-safe JSI-backed execution engine using **Drizzle ORM** and **op-sqlite**. 

For complete transition patterns, details on dual-database isolation, SQLCipher AES-256 local encryption, and compiled Drizzle AST query hooks, please refer to the primary specification:
👉 **[local-first-transition-spec.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/local-first-transition-spec.md)**

### Files in Transition / Scaffolding
| File | Role |
| :--- | :--- |
| `packages/core/src/adapters/powersync/schema.ts` | SQLite table definitions (attendance, students, classrooms, mood_logs, schools) |
| `packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts` | `fetchCredentials` (Supabase JWT) + `uploadData` (CRUD write-back) |
| `packages/core/src/adapters/powersync/database.ts` | `getPowerSyncDB()` lazy singleton |
| `packages/core/src/adapters/powersync/PowerSyncGate.tsx` | Feature-gated context provider |
| `packages/core/src/adapters/powersync/hooks.ts` | Typed reactive query hooks |

### To Activate (3 Steps)
1. **Get credentials**: Sign up at [app.powersync.com](https://app.powersync.com), create a project, connect to your Supabase instance.
2. **Set env var**: Add `EXPO_PUBLIC_POWERSYNC_URL=wss://your-instance.powersync.journeyapps.com` to your `.env`.
3. **Flip feature flag**: change the `isPowerSyncEnabled` rollout in GrowthBook. The mobile client receives the evaluated snapshot and never mutates the control plane.

### Sync Rules (Required on PowerSync Dashboard)
Create `sync-rules.yaml` in your PowerSync project:
```yaml
bucket_definitions:
  by_school:
    parameters: sql: SELECT school_id FROM bonds WHERE user_id = token_parameters.user_id
    data:
      - SELECT * FROM attendance WHERE classroom_id IN (SELECT id FROM classrooms WHERE school_id = bucket.school_id)
      - SELECT * FROM students WHERE school_id = bucket.school_id
      - SELECT * FROM classrooms WHERE school_id = bucket.school_id
      - SELECT * FROM mood_logs WHERE student_id IN (SELECT id FROM students WHERE school_id = bucket.school_id)
```

### What PowerSync Does NOT Replace
- Complex Inngest workflow triggers → still via Message Bus
- Audit log persistence → still Zustand/MMKV
- Background task draining → `expo-background-task` is complementary (PowerSync docs recommend this exact pattern)

---

## 8. Testing

```typescript
// Development: manually trigger the background task
import { triggerBackgroundSyncForTesting } from './src/lib/backgroundSync';
await triggerBackgroundSyncForTesting(); // __DEV__ only

// Subscribe to bus in any component or test
import { sovereignBus } from '@repo/core/sync';
const unsub = sovereignBus.on('sync:completed', (e) => console.log(e));
// ...
unsub(); // cleanup
```
