---
title: "Cleanup Plan: Permission Architecture, Feature Registry & Feature Flags"
status: "active"
created: 2026-07-23
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, current_progress, historical]
---

# Cleanup Plan: Permission Architecture, Feature Registry & Feature Flags

**Date:** 2026-07-23
**Focus:** Consolidate parallel systems, delete legacy, fix gaps

---

## Phase 0 — Map the Current State (done)

### Three systems coexist today

| System | Entry Point | Authz Source | Status |
|---|---|---|---|
| **Legacy CASL shim** | `usePermissions().can()` | `permissionsMap` (signed snapshot) | Being actively consumed |
| **Sanctuary (partial)** | `useSanctuaryFeature()` | `permissionsMap` + `sanctuaryFeature()` | New target, same data source |
| **Cedar direct** | `checkLocalPermission()` | Cedar WASM directly | Used by interceptor/proxy/adapters |

### The core problem

`permissionsMap` is the **shared dependency** that keeps the legacy alive. Both old and new hooks read from it. Until the new system has its own independent data path, you cannot delete the old one.

---

## Phase 1 — Make `sanctuaryFeature` the Single Truth Path

**Goal:** `useSanctuaryFeature` (and `useDomainFeature`) become the *only* way UI code asks permission questions. The old `permissionsMap` → `can()` path is replaced.

### Step 1.1 — Build a proper Cedar evaluation hook (replaces `permissionsMap` reads)

**Files to create:** `packages/core/src/logic/permissions/useCedarDecision.ts`

```typescript
// New hook that directly evaluates Cedar WASM instead of reading pre-computed permissionsMap
// Input: action, subject, resourceId? → Output: 'allow' | 'deny' | 'no_decision'
// Caches WASM instance at module scope
// Reads Cedar policy from permission_snapshots table (already synced via PowerSync)
```

**Why:** Currently `useSanctuaryFeature` reads `permissionsMap[subject][action]` which is the old Shape 1 CASL shim. Instead, it should evaluate Cedar directly against the local snapshot. This breaks the dependency on `permissionsMap`.

**Files to modify:**
- `useSanctuaryFeature.ts` — replace `permissionsMap` read with `useCedarDecision()`
- `useDomainFeature.ts` — no change needed (already delegates to useSanctuaryFeature)

### Step 1.2 — Collapse `usePermissions.ts` into `useSanctuaryFeature`

**Files to delete:**
- `usePermissions.ts` — move its `UserContext` builder into a dedicated factory
- `RouteGuard.tsx` — consumers migrate to `SanctuaryGuard`
- `useFeatureAccess.ts` — inline or delete
- `useAuthorityFeatures.ts` — inline or delete
- `useLocalPermission.ts` — migrate to `useSanctuaryFeature`

**Files to create:**
- `packages/core/src/logic/permissions/buildUserContext.ts` — extract the UserContext builder from `usePermissions` into a standalone memoized function

**Consumer migration (in order):**
1. `SanctuaryProvider.tsx` — stop calling `usePermissions()`, read stores directly
2. `AdminFeatureRegistry.tsx` — replace `usePermissions()` with `useFeatureStore` directly
3. `usePremiumStatus.ts` — replace `usePermissions()` with `useSanctuaryFeature` + direct store reads
4. Any remaining `can()` call sites → `useSanctuaryFeature().permitted`

### Step 1.3 — Delete `usePermissionStore` (the `permissionsMap` store)

**Files to delete:**
- `usePermissionStore.ts`
- `signature.ts` (moved to Cedar evaluator if still needed)

**Impact:** The snapshot is still loaded by the Cedar evaluator directly. The `permissionsMap` Record<string, Record<string, boolean>> type disappears entirely.

---

## Phase 2 — Fix the Known Gaps

### Step 2.1 — Implement `IEntitlementPort`

**Files to create:**
- `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`

The interface exists at `packages/core/src/logic/ports/entitlement.port.ts` but has **zero implementations**. This means the entitlement gate in `sanctuaryFeature()` always falls through (`tenantEnabledModules` is populated from `user.features` which is a band-aid).

**Implementation:** Read from `pricing_manifest` table (Zone A SQLite, synced via PowerSync). Return `{ pricingTier, activeEntitlements, expirationDate }`.

### Step 2.2 — Fix offline write resource ID gap

**Files to modify:**
- `database.ts` (`createSecureDrizzleProxy`) — use `.toSQL()` to extract the real `resourceId` from the `where` clause (per ADR Section 6.3, Option B)

**Known scope:** Insert is trivial (payload in `values`). Update/delete requires `SELECT` before write. Batch writes need handling.

### Step 2.3 — Wire `IEntitlementPort` into `sanctuaryFeature`

**Files to modify:**
- `sanctuaryFeature.ts` — Gate 2 currently checks `ctx.tenantEnabledModules.includes()`. Replace with `IEntitlementPort.getCapabilities()`.
- `useSanctuaryFeature.ts` — call `entitlementPort.getEntitlements()` during evaluation.
- `SanctuaryEvaluationContext` — replace `tenantEnabledModules: string[]` and `tenantPricingTier` with the full `EntitlementSnapshot`.

---

## Phase 3 — Delete Legacy Code

### Step 3.1 — Remove CASL

**Files to delete:**
- `packages/core/src/logic/permissions/abilities/base.ts` (entire directory)
- `@casl/ability` and `@casl/react` from `apps/gurudevi-mobile/package.json`

**Files to modify:**
- `cedarAuthorization.adapter.ts` — replace `Actions`/`SubjectType` imports with string types
- `localEvaluator.ts` — replace `Actions`/`SubjectType` with string types
- `permissions/index.ts` — remove `export * from './abilities/base'`
- `RouteGuard.tsx` (to be deleted in Phase 1 anyway)

**Files to create:**
- `packages/core/src/types/authorization.ts` — hand-defined `Action` and `Subject` string union types (interim) until Cedar codegen is in place

### Step 3.2 — Delete old hooks

**Files to delete:**
- `useFeatureAccess.ts`
- `useAuthorityFeatures.ts`
- `useLocalPermission.ts`

### Step 3.3 — Delete legacy adapters

**Files to delete:**
- `supabaseFeatureFlag.adapter.ts` (replaced by GrowthBook + local evaluator)
- `localFeatureRollout.adapter.ts` (replaced by GrowthBook)
- `feature-engine.ts` (the old `resolveFeatureFlags` is dead)
- `feature-rollout-cache.ts` (KV cache replaced by SQLite + store)
- `AuthorityInterceptor.ts` (replaced by sanctuary path in BFF)

### Step 3.4 — Clean old docs

**Files to delete:**
- Entire `apps/gurudevi-mobile/docs/old_docs/` directory (44 files)
- `apps/gurudevi-mobile/docs/decisions/002-sovereignty-grants-pattern.md` (superseded)
- `apps/gurudevi-mobile/docs/decisions/003-feature-flag-architecture.md` (superseded)
- `apps/gurudevi-mobile/docs/infra/FEATURE_FLAG_ROLLOUT.md` (superseded)

---

## Phase 4 — Clean Up Adapter Layer

**Goal:** One adapter per port. No bridging through old code.

### Step 4.1 — Refactor `CedarAuthorizationAdapter`

**Files to modify:**
- `cedarAuthorization.adapter.ts` — remove bridge to `checkLocalPermission`. Implement `IAuthorizationPort` by calling Cedar WASM directly (same pattern as the new `useCedarDecision`).

### Step 4.2 — Clean `localEvaluator.ts`

This file does too much. Split into:
- `packages/core/src/logic/permissions/cedarEvaluator.ts` — Cedar WASM evaluation (pure, no store)
- `packages/core/src/logic/permissions/permissionValidator.ts` — the Drizzle proxy validator
- `packages/core/src/logic/permissions/crypto.ts` — signature verification

### Step 4.3 — Clean `database.ts` `createSecureDrizzleProxy`

Extract the Proxy logic into its own file:
- `packages/core/src/adapters/powersync/secureDrizzleProxy.ts`

---

## Phase 5 — Feature Rollout Overhaul

### Step 5.1 — Wire GrowthBook as primary evaluator

**Files to modify:**
- `featureFlag.factory.ts` — remove the conditional fallback to `SupabaseFeatureFlagAdapter`. Always use `GrowthBookFeatureRolloutAdapter` when configured.

### Step 5.2 — SQLite rollout cache

**Files to create:**
- SQLite table for rollout cache (instead of KV-only `feature-rollout-cache.ts`)

**Decision needed:** Whether this needs SQLite from day one or starts as KV. The current implementation plan doc leaves this open.

### Step 5.3 — Remove `resolveFeatureFlags`

After GrowthBook is wired and the entitlement port is implemented, `feature-engine.ts` has no consumers. Delete it entirely.

---

## Dependency Graph (Execution Order)

```
Phase 1.1 (useCedarDecision hook)
  └─ enables Phase 1.2 (collapse usePermissions)
       ├─ enables Phase 1.3 (delete usePermissionStore)
       └─ enables Phase 3.1 (remove CASL types)
            └─ enables Phase 3.2 (delete old hooks)
                 └─ enables Phase 3.3 (delete legacy adapters)
                      └─ enables Phase 5.3 (remove resolveFeatureFlags)

Phase 2.1 (IEntitlementPort impl)
  └─ enables Phase 2.3 (wire into sanctuaryFeature)

Phase 2.2 (fix offline write resource ID)
  └─ enables Phase 4.2 (clean localEvaluator)

Phase 4 (adapter cleanup) — parallel with Phase 3

Phase 5 (feature rollout) — depends on Phase 3.3
```

---

## Files Summary

### Files to create (7):
1. `packages/core/src/logic/permissions/useCedarDecision.ts`
2. `packages/core/src/logic/permissions/buildUserContext.ts`
3. `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`
4. `packages/core/src/types/authorization.ts`
5. `packages/core/src/logic/permissions/cedarEvaluator.ts`
6. `packages/core/src/logic/permissions/permissionValidator.ts`
7. `packages/core/src/adapters/powersync/secureDrizzleProxy.ts`

### Files to modify (10):
1. `useSanctuaryFeature.ts` — replace permissionsMap read with useCedarDecision
2. `sanctuaryFeature.ts` — wire IEntitlementPort properly
3. `database.ts` — fix resource ID; extract proxy
4. `cedarAuthorization.adapter.ts` — remove CASL types bridge
5. `localEvaluator.ts` — remove CASL types; split into 3 files
6. `permissions/index.ts` — update exports
7. `featureFlag.factory.ts` — remove legacy fallback
8. `useFeatureRegistry.ts` — update to read from new path
9. `SanctuaryProvider.tsx` — stop using usePermissions
10. `AdminFeatureRegistry.tsx` — stop using usePermissions

### Files to delete (18+):
1. `abilities/base.ts` + directory
2. `usePermissions.ts`
3. `useFeatureAccess.ts`
4. `useAuthorityFeatures.ts`
5. `useLocalPermission.ts`
6. `RouteGuard.tsx`
7. `usePermissionStore.ts`
8. `signature.ts`
9. `supabaseFeatureFlag.adapter.ts`
10. `localFeatureRollout.adapter.ts`
11. `feature-engine.ts`
12. `feature-rollout-cache.ts`
13. `AuthorityInterceptor.ts`
14. `@casl/ability`, `@casl/react` deps
15. 44 old doc files in `old_docs/`
16. 3 superseded doc files

---

## Risk Notes

- **Phase 1.1 is the critical path.** Until `useCedarDecision` works as a drop-in replacement for `permissionsMap`, nothing else can move. The hook must handle: WASM warmup, snapshot loading, error states, and the `not_initialized` case.
- **Phase 2.2 (offline write fix) is a security gap.** The ADR flags it as priority. It can run in parallel with Phase 1 but should not be deferred.
- **No test breakage guarantee.** Many POA tests (`*-poa.test.ts`) use `usePermissions`/`permissionsMap`. They need updating to the new path.
- **The entitlement port needs a DB schema.** `pricing_manifest` table must exist in the ZenStack schema and PowerSync sync rules before the adapter can read it.

---

*End of cleanup plan. Ready to start Phase 1.1 when you give the go.*
