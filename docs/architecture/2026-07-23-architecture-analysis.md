---
title: "Architecture Analysis: Permissions, Feature Flags & Entitlements"
status: "active"
created: 2026-07-23
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture, historical]
---

# Architecture Analysis: Permissions, Feature Flags & Entitlements

**Date:** 2026-07-23
**Scope:** `packages/core` — permission system, feature flag system, entitlement system
**Goal:** Map what exists, compare to a coherent target, identify quality issues, and chart a fix path.

---

## 1. The Target Architecture — What We *Should* Have

```
                     ┌─────────────────────────────┐
                     │      UI Layer (Hooks)        │
                     │  useSanctuaryFeature         │
                     │  useDomainFeature            │
                     │  (no direct store reads)     │
                     └──────────┬──────────────────┘
                                │ calls
                                ▼
                     ┌─────────────────────────────┐
                     │  sanctuaryFeature()          │
                     │  Pure function, 4 gates:     │
                     │  1. Citizenship              │
                     │  2. Entitlement (port)       │
                     │  3. Cedar Authz (port)       │
                     │  4. Feature Flag (port)      │
                     └──────────┬──────────────────┘
                                │ delegates to ports
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ IEntitlementPort│    │IAuthorizationPort│     │IFeatureRolloutPort│
│ Supabase       │    │ CedarAdapter     │     │ GrowthBookAdapter │
│ (Supabase +    │    │                  │     │                   │
│  Drizzle)      │    │ Server Cedar     │     │ GrowthBook SDK    │
│                │    │   ↓ fail         │     └──────────────────┘
│ pricing_tier   │    │ Local WASM       │
│ pricing_manifest│   │   ↓ fail         │
└────────────────┘    │ Signed Snapshot  │
                      └──────────────────┘
```

**The intended fallback chain for permissions (server → local):**

```
CedarAuthorizationAdapter.isAuthorized()
  → 1. Server-side Cedar (future: calls policies package API)
       → if online + server reachable
  → 2. Local Cedar WASM (cedarClientEvaluator, singleton)
       → policies from cedarPolicies SQLite table
       → evaluateShape2() for instance-level checks
       → device trust context
  → 3. Signed permission snapshot (permissionSnapshots table)
       → HMAC verification
       → expiry check
       → only if WASM fails or no policies
```

**Feature flags and entitlements are *separate gates* checked by sanctuaryFeature():**
- **Entitlements** answer: "Does this user's pricing plan include this module?" (port → DB)
- **Feature flags** answer: "Is this feature rolled out to this user?" (port → GrowthBook)
- **Permissions** answer: "Is this user authorized for this action on this resource?" (port → Cedar)
- **Citizenship** answers: "Is this user's persona type allowed?" (enum → registry)

These four gates are *independent* and checked in sequence. None should depend on the others' data sources.

---

## 2. What Actually Exists — Full Map

### 2.1 Permission Evaluation — 4 Parallel Paths

| Path | Entry Point | Data Source | Status |
|------|------------|-------------|--------|
| **A — UI Hook** | `useSanctuaryFeature()` → `getDecision()` | `permissionSnapshots` table (pre-computed, NO signature check) | **Live, security gap** |
| **B — Drizzle Proxy** | `createSecureDrizzleProxy` → `_permissionValidator` | `checkLocalPermission()` (variant depends on platform) | **Live** |
| **C — Port Adapter** | `authz.isAuthorized()` → `evaluateShape2()` | `cedarPolicies` table + live WASM evaluation | **Live, but disconnected** |
| **D — Server API** | `requireClassroomAccess()` → `checkLocalPermission()` | `cedarPolicies` table + per-call WASM import | **Live** |

**Problem:** Four paths, four slightly different evaluation logics, no shared code.

### 2.2 Entitlement Evaluation

| Piece | Status | Notes |
|-------|--------|-------|
| `IEntitlementPort` interface | ✅ Defined | Clean, minimal |
| `SupabaseEntitlementAdapter` | ✅ Implemented | Reads Supabase `users.pricing_tier` + local `pricing_manifest` |
| `useEntitlementStore` | ✅ Implemented | Zustand store wrapping adapter, wired into boot |
| `pricing_manifest` table | ✅ Schema + migration | Drizzle table, AppSchema export |
| Wired into `sanctuaryFeature()` | ✅ Done | Gate 2 reads `ctx.entitlement.activeEntitlements` |

**Verdict:** Cleanest part of the system. One port, one adapter, one store, no duplicates.

### 2.3 Feature Flag Evaluation

| Piece | Status | Notes |
|-------|--------|-------|
| `IFeatureRolloutPort` interface | ✅ Defined | Clean |
| `GrowthBookFeatureRolloutAdapter` | ✅ Implemented | Wraps GrowthBook SDK properly |
| `featureFlag.factory.ts` | ✅ Exports singleton | `featureFlags` as `IFeatureRolloutPort` |
| `feature.slice.ts` `recomputeFlags` | ❌ Dead | Just resets to defaults — GrowthBook does the real work |
| `feature-engine.ts` | 🗑️ Deleted | Was `resolveFeatureFlags` — removed |
| Connected to `sanctuaryFeature()` | ⚠️ Indirect | `flagActive` reads from `useFeatureStore`, not through the port |

**Verdict:** The port/adapter is clean, but the UI hook reads flags from a Zustand store (legacy pattern) instead of through the port interface.

### 2.4 Cedar WASM — Singleton vs Per-Call

| Approach | Location | Strategy |
|----------|----------|----------|
| **Singleton (correct)** | `cedarClientEvaluator.ts` | `getWasmEvaluator()` caches `import()` in module-level promise |
| **Per-call (wasteful)** | `localEvaluator.ts` | Every `checkLocalPermission()` re-imports the WASM module |
| **Per-call (wasteful)** | `localEvaluator.native.ts` | Same |

**Impact:** Every Drizzle proxy write triggers a fresh dynamic `import()` of a ~2MB WASM binary.

### 2.5 Stores — Duplicate Load

| Store | Loads from | Signature check | Loaded at boot? |
|-------|-----------|----------------|-----------------|
| `usePermissionStore` | `permissionSnapshots` | ✅ Yes | ✅ Yes |
| `useCedarDecisionStore` | `permissionSnapshots` | ❌ No | ✅ Yes |

Both are called from `_layout.tsx`:
```ts
void loadPermissions(session.user.id);      // usePermissionStore
void loadDecisions(session.user.id);        // useCedarDecisionStore
```

They query the same table. Only one has signature verification.

---

## 3. Gap Analysis

### 🔴 Security Gaps

| Gap | File | Detail |
|-----|------|--------|
| **No signature check on new store** | `useCedarDecisionStore.ts` | Loads from `permissionSnapshots` without verifying HMAC signature. A compromised SQLite DB can inject arbitrary permissions. |
| **Policy signature verification is dead code** | `crypto.ts` | `verifyLocalPolicySignature()` returns `true` when `signatureHex` is undefined. No caller passes a second arg. The `cedarPolicies` table has no `signature` column anyway. |
| **Dual evaluation paths** | — | The Drizzle proxy uses `checkLocalPermission` (no server fallback), but `CedarAuthorizationAdapter` uses `evaluateShape2` (also no server fallback). Neither calls the server first. |

### 🟡 Architecture Violations

| Issue | Detail |
|-------|--------|
| **`secureDrizzleProxy` imports `useStore`** | The proxy (`adapter` layer) imports a Zustand store (`ui` layer) to get user context. Architecture is inverted. |
| **`CedarAuthorizationAdapter` is disconnected** | The adapter calls `evaluateShape2()` directly, bypassing `checkLocalPermission` and the Drizzle proxy's validator. Two parallel permission evaluation paths. |
| **`localEvaluator.native.ts` depends on `localEvaluator.ts`** | Imports `getLocalResourceAttributes` from the default variant. Platform-resolution dependency chain is fragile. |
| **No server-side Cedar call anywhere** | The fallback chain starts at local WASM. No path ever attempts a server-side evaluation first. |

### 🟠 Dead Code & Waste

| Item | Detail |
|------|--------|
| `usePermissionStore` | No internal consumers. Only barrel-exported. Obsolete. |
| `usePermissionStore.web.ts` | Dead along with parent. |
| `useFeatureRegistry` | Defined, exported, but zero consumers found. |
| `useDomainFeature` / `useDomainFeatures` | Exported from barrel, zero consumers. |
| `feature.slice.ts` `recomputeFlags()` | Resets to defaults — does nothing useful. |
| `IFeatureFlagPort` | Deprecated interface, no implementer. |
| Duplicate WASM imports | `localEvaluator.ts` imports WASM per-call even though `cedarClientEvaluator.ts` has a singleton. |

### 🟢 What's Actually Good

| Item | Why |
|------|-----|
| `cedarClientEvaluator.ts` | Clean singleton WASM loader with typed shapes. Tested. This is the right pattern. |
| `SupabaseEntitlementAdapter` | Clean port/adapter. One job, well defined. |
| `useEntitlementStore` | Wraps adapter, no duplicate. |
| `sanctuaryFeature()` | Clean pure function, 4 gates, no side effects. Tested. |
| `sanctuaryFeature.test.ts` | 7 tests, clear coverage of all gates. |
| `secureDrizzleProxy.ts` | Clean proxy pattern. Well isolated. Tested. |
| `GrowthBookFeatureRolloutAdapter` | Proper GrowthBook SDK integration. |

---

## 4. Quality & Elegance Assessment

### 4.1 What's Wrong

**1. Too many abstractions doing the same thing.**
- `checkLocalPermission()` in 3 platform variants
- `evaluateShape1`/`evaluateShape2` in `cedarClientEvaluator`
- Both independently load Cedar WASM
- Both build entity objects with the same shape
- Both handle the same policy loading

**2. The fallback chain is imaginary.**
The docs describe a server → WASM → snapshot chain. The actual code skips the server step entirely. The snapshot fallback only exists in the `.native.ts` variant. The default variant just returns `false` on WASM failure.

**3. Inconsistent security.**
- `useCedarDecisionStore` (the primary UI data source) skips HMAC verification
- `usePermissionStore` (the legacy one) verifies
- `verifyLocalPolicySignature` is wired but always passes
- The `cedarPolicies` table has no signature column

**4. Platform resolution fragility.**
- `localEvaluator.native.ts` imports `getLocalResourceAttributes` from `localEvaluator.ts`
- Both call `registerPermissionValidator` at module scope — whichever loads last wins
- This is a race condition, not a deliberate strategy

**5. Two Zustand stores for the same data.**
`usePermissionStore` and `useCedarDecisionStore` load the same table on every boot. One is dead (no consumers), the other has a security gap (no signature check).

### 4.2 What's Elegant

- **`sanctuaryFeature()` as a pure function** — no hooks, no stores, no side effects. Takes context, returns result. Testable.
- **`secureDrizzleProxy`** — clean proxy intercepting writes without changing the Drizzle API. Well isolated.
- **`cedarClientEvaluator`** — lazy singleton with typed shapes. The `evaluateShape1`/`evaluateShape2` distinction is a good abstraction.
- **Port interfaces are minimal** — `IAuthorizationPort`, `IEntitlementPort`, `IFeatureRolloutPort` are 1-3 methods each. Clean.

### 4.3 Code Health

| Metric | Assessment |
|--------|-----------|
| File size | `sanctuaryFeature.ts` 107 lines ✅ `cedarClientEvaluator.ts` 145 lines ✅ `secureDrizzleProxy.ts` 89 lines ✅ But `localEvaluator.ts`/`.native.ts` are 150-185 lines each — doing too much |
| Test coverage | Permission system is well-tested: 10 + 8 + 7 + 7 + 185 + 405 + 141 lines of tests. Feature flag system is not tested. |
| Dependency direction | Ports → Adapters → Stores → Hooks direction is mostly correct. Exception: `secureDrizzleProxy` (adapter) imports `useStore` (ui layer) |
| Naming | `cedarClientEvaluator.ts` vs `localEvaluator.ts` — confusing. Both evaluate Cedar. Both are "local." |
| `@deprecated` markers | `usePermissions.ts` has one ✅ But no migration guide. No automated check for remaining consumers. |

---

## 5. Path Forward — What to Actually Fix

### Step 1: Fix Security Gaps (1-2 days)

| Task | File(s) | Why |
|------|---------|-----|
| Add HMAC verification to `useCedarDecisionStore.loadDecisions()` | `useCedarDecisionStore.ts` | Currently trusts arbitrary SQLite data |
| Remove `usePermissionStore` from boot now that verification is ported | `_layout.tsx`, `usePermissionStore.ts` | Eliminates duplicate load |
| Either add `signature` column to `cedarPolicies` + wire it, or remove the dead code | `crypto.ts`, `schema.ts`, `localEvaluator.ts` | Stop pretending we have tamper detection |

### Step 2: Unify WASM Loading (1 day)

| Task | File(s) | Why |
|------|---------|-----|
| Have `localEvaluator.ts` use `cedarClientEvaluator` singleton instead of its own per-call import | `localEvaluator.ts`, `localEvaluator.native.ts` | Eliminates duplicate WASM loading |
| Remove the inline `import('@cedar-policy/cedar-wasm/web')` from `localEvaluator.*` | `localEvaluator.ts`, `localEvaluator.native.ts` | Single point of WASM management |

### Step 3: Implement Server-First Fallback (2-3 days)

| Task | File(s) | Why |
|------|---------|-----|
| Add server evaluation to `CedarAuthorizationAdapter` | `cedarAuthorization.adapter.ts` | Actually implement the documented fallback chain |
| Add a server Cedar endpoint or use existing `policies` package | New or `policies/src/engine/evaluator.ts` | Need a network-available evaluation endpoint |
| Make the fallback: server → local WASM → snapshot | `CedarAuthorizationAdapter` | Match documentation |

### Step 4: Clean Dead Code (0.5 day)

| Task | Action |
|------|--------|
| `usePermissionStore` + `.web.ts` | Delete |
| `useFeatureRegistry` | Either delete or re-export from barrel |
| `useDomainFeature` | Same decision |
| `IFeatureFlagPort` | Delete the deprecated interface |
| `feature.slice.ts` `recomputeFlags` | Simplify or remove |

### Step 5: Fix Architecture Inversion (1 day)

| Task | Action |
|------|--------|
| Extract user context building from `secureDrizzleProxy` | Pass context in, don't import `useStore` |
| Or: make the proxy accept a context factory | Inversion of Control pattern |

### Step 6: Unify Platform Variants (2 days)

| Task | Action |
|------|--------|
| Eliminate `localEvaluator.platform.ts` pattern | Have one evaluator that uses platform-appropriate fallbacks based on capability detection, not file extension |
| Move fallback logic into `CedarAuthorizationAdapter` | Per the original plan, the adapter should own the evaluation chain |

---

## 6. Summary of Files by Health

### Keep as-is (good shape)
- `cedarClientEvaluator.ts` — singleton, typed, tested
- `supabaseEntitlement.adapter.ts` — clean port/adapter
- `useEntitlementStore.ts` — clean
- `sanctuaryFeature.ts` — clean pure function, tested
- `secureDrizzleProxy.ts` — clean, well isolated
- `GrowthBookFeatureRolloutAdapter` — proper SDK wrapper
- `crypto.ts` — fine once `cedarPolicies` gets a signature column
- `signature.ts` — fine

### Fix (small changes)
- `useCedarDecisionStore.ts` — add HMAC verification
- `useSanctuaryFeature.ts` — already clean, minor
- `featureFlag.factory.ts` — already clean, minor
- `CedarAuthorizationAdapter.ts` — add server fallback step
- `sanctuaryFeature.test.ts` — already clean

### Consolidate/delete
- `usePermissionStore.ts` + `.web.ts` → delete
- `useFeatureRegistry` → decide: export or delete
- `useDomainFeature` → decide: export or delete
- `IFeatureFlagPort` → delete
- `feature.slice.ts` `recomputeFlags` → simplify

### Rewrite
- `localEvaluator.ts` → stop duplicating WASM load, use `cedarClientEvaluator`
- `localEvaluator.native.ts` → same, plus unify fallback logic
- `localEvaluator.web.ts` → becomes trivial pass-through
