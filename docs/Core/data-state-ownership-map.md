---
title: "Data & State Ownership Map"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [core, state, data, offline-first, agents, architecture]
---

# Data & State Ownership Map

Every piece of state in the platform has exactly one authoritative home. This map
tells developers AND agents which layer owns a domain, how to read it, and how to
write it. When an agent (or a human) writes to the wrong layer, we get drift,
conflicts, and silent data loss — so this map is a hard contract, not a guideline.

This is a per-domain inventory. The higher-level rules live in
`docs/architecture/gurudevi-data-state-lifecycle.md` (§11 State Ownership Map, §13
Decision Rule) and `docs/Core/local-first-architecture-principles.md`.

---

## 1. The Six Storage Layers

| Layer | Tool | Owns | Must never |
|---|---|---|---|
| Persistent structured data | PowerSync + OP-SQLite + Drizzle | All synced Zone A/B/C tables; one SQLCipher-encrypted DB per account | Be queried directly by UI — always via hooks |
| Sync replication | PowerSync connector | Zone A replication to Supabase via WAL; uploads via `POST /powersync/upload` | Touch Zone B/C network sync |
| Reactive SQLite reads | `useDrizzleQuery` / `usePowerSyncQuery` (wrap `@powersync/react` `useQuery`) | Re-render on SQLite change | Be used for remote REST data |
| Remote fetch + cache | TanStack Query (`@tanstack/react-query`) | All server (Hono API / Supabase) data | Read from SQLite |
| Fast KV operational state | `SafeZustandStorage` (MMKV `gurudevi-store` in prod native; AsyncStorage in Expo Go / web) | Auth snapshot, flags, tenant, UI prefs, growth, entitlements, mutation queue, audit log | Store sensitive credentials (use SecureStore) or relational data (use SQLite) |
| Sensitive credentials | `expo-secure-store` | SQLCipher key per account, Supabase session tokens | Non-sensitive data |

Persistence mapping: DB file `gurudevi-powersync-{accountId}.db`, SQLCipher key in
SecureStore `gurudevi-sqlite-cipher-key-{accountId}` (`packages/core/src/adapters/powersync/opsqlite.adapter.ts`).
Local writes are enforced via `secureDrizzleProxy` (capability-token / POA) and
throw `LOCAL_WRITE_VIOLATION` `SovereignError` when the offline Cedar snapshot blocks them.

---

## 2. Per-Domain Source of Truth

| Domain | Source of truth | Read layer | Write layer | Persistence |
|---|---|---|---|---|
| Auth / session / user | Zustand `useAuthStore` | Store selector | Store actions | `gurudevi-auth-storage`; Supabase session tokens in SecureStore (`lib/authStorage.ts`) |
| Tenant / school context | Zustand `useTenantStore` | Store | Store | `gurudevi-tenant-storage` |
| Feature flags | Zustand `useFeatureStore` | Store | Store (snapshot from `GrowthBookFeatureRolloutAdapter`) | `gurudevi-feature-storage` |
| UI prefs / theme / desk | Zustand `useUIStore` | Store | Store | `gurudevi-ui-storage` |
| Growth / wellbeing paths | Zustand `useGrowthStore` | Store | Store | `gurudevi-growth-storage` |
| Entitlements / pricing | Zustand `useEntitlementStore` + `SupabaseEntitlementAdapter` | Store | Adapter → Supabase | `gurudevi-entitlement-storage` (24h freshness) |
| Authorization (Cedar) | `useCedarDecisionStore` ← PowerSync `permission_snapshots` + `policy_version` | Store loads from SQLite via hooks | Server refresh via `permissionSnapshot.contract.ts` | SQLite |
| Classroom roster / attendance / students | PowerSync SQLite tables | `useDrizzleQuery` / `usePowerSyncQuery` (`adapters/powersync/hooks.ts`) | `secureDrizzleProxy` → PowerSync CRUD queue | SQLite |
| Community (posts / groups / polls) | Server (Hono API) via React Query | `communityKeys` / `pollKeys` / `COMMUNITY_KEYS` | Mutations → `communityAPI` / `circleAPI` / `socialAPI` | React Query cache (not SQLite) |
| Social (notifications / shield) | Server via React Query + Supabase Realtime | `notificationKeys`; `useNotificationStore` (in-memory) | `socialAPI` mutations | React Query cache + in-memory store |
| Library | Server via React Query + Supabase Realtime invalidation | `LIBRARY_KEYS` (`packages/library/src/hooks/useLibrary.ts`) | `libraryAPI` mutations | React Query cache |
| Profile / history | Server via React Query | `profile/hooks/*` | `profileAPI` | React Query cache |
| Self (mood / journal) | Repository layer + KV cache | `useMoodLogs` (`useState` + KV cache `gurudevi-mood-cache-{userId}-{viewDate}`) | `wellbeingRepository` → Supabase | KV cache — currently bypasses the PowerSync `mood_logs` table (see §4) |
| Offline mutations (outbox) | Zustand `useMutationQueue` | — | `addToQueue` → `SyncManager` / background task | `gurudevi-mutation-queue`; audit in `gurudevi-mutation-audit-log`; conflicts in `gurudevi-conflict-store` |
| Sync status / events | `sovereignBus` pub/sub (`lib/sync/eventBus.ts`) — NOT a Zustand store | `useSyncStatus` hook | `sovereignBus.emit` | In-memory |
| Temporal view | `useTemporalStore` | Store | Store | In-memory (ephemeral) |
| Device security | `useDeviceSecurityStore` | Store via `deviceSecurity` manager | Manager → Supabase adapter | In-memory (30s throttle) |
| Notifications store | `useNotificationStore` | Store via `notification` manager + Realtime | Manager → Supabase | In-memory |

---

## 3. Read / Write Rules (Agents MUST follow)

1. **Never write to a layer you do not own.** If a domain's source of truth is a
   PowerSync table, write through `secureDrizzleProxy`. If it is a server API, call
   the API. If it is a Zustand slice, use the store actions.
2. **UI never queries SQLite directly.** Always use `useDrizzleQuery` /
   `usePowerSyncQuery`.
3. **Remote REST data never reads from SQLite.** Use TanStack Query keys.
4. **No raw Supabase calls outside approved adapters.** The following packages are
   known to call Supabase directly (`packages/analytics`, `packages/payments`,
   `packages/admin`, `packages/people`, `packages/ai`, `packages/library`,
   `packages/scanner-kit`) — flagged as tech debt. Do NOT add new direct request
   paths; route through the Sanctuary API contracts.
5. **Sensitive credentials** (SQLCipher keys, Supabase session tokens) live only in
   `expo-secure-store`. Never store them in Zustand, AsyncStorage, or logs.
6. **Resolve user context through the active bond** (`useStore.getState().activeBond`
   or `useAuth()`). Never read raw Supabase session metadata for business logic.
7. **If a layer is missing from this map, add it here before writing code.** A
   missing entry is a contract gap, not a license to improvise.

---

## 4. Known Anti-Patterns (drift to fix, not to copy)

- **Legacy duplicate slices**: `packages/core/src/logic/store-slices/*` duplicates
  `packages/core/src/store/slices/*`. Use the `packages/core/src/store/slices/*`
  set; legacy copies are being retired.
- **Self / mood KV bypass**: `useMoodLogs` caches in KV (`gurudevi-mood-cache-*`)
  instead of the PowerSync `mood_logs` table, breaking offline write-through.
- **Direct Supabase request paths** in the packages listed in §3.4.
- **Doc drift**: `gurudevi-data-state-lifecycle.md` still references `useLiveQuery`,
  a `useSyncStore` Zustand store, and GrowthBook-as-state; the code uses
  `useDrizzleQuery` wrappers, the `sovereignBus` event bus, and a persisted
  `useFeatureStore` snapshot. The code is authoritative; update the lifecycle doc.
- **Facade trap**: the old `useStore` facade subscribes to all four stores. Prefer
  the atomic stores listed in §2.
- **MMKV is prod-native only**: in Expo Go / web, `SafeZustandStorage` silently
  backs onto AsyncStorage (`native/bootstrap.ts` + `native/storage.ts`). Never
  assume a KV value survives process restart in Expo Go with the same guarantees
  as prod.

---

## 5. References

- `docs/architecture/gurudevi-data-state-lifecycle.md` — lifecycle rules, gate order (Cedar → entitlement)
- `docs/Core/local-first-architecture-principles.md` — event-sourcing source of truth, Cynefin classification
- `packages/core/src/adapters/powersync/schema.ts` — all 16 PowerSync tables
- `packages/core/src/adapters/powersync/hooks.ts` — `useDrizzleQuery` / `usePowerSyncQuery`
- `packages/core/src/store/slices/*` — canonical Zustand slices
- `packages/core/src/logic/sync/eventBus.ts` — `sovereignBus`
- `docs/current_progress/2026-08-10-gurudevi-edlove-exploration-integration-plan.md` — direct-Supabase audit
