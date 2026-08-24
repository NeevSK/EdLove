---
title: "Permission Refactor Review Report"
status: "active"
created: 2026-07-24
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture, historical]
---

# Permission Refactor Review Report

## Objective
Migrate `usePermissionStore` + CASL → Cedar policy evaluation + capability tokens (ADR-013). Resolve feature flag bug, implement Quality Constellation rules.

## Commits (4 total, branch `expo-57-gluestack-v5-rngh-v3`)

| Commit | Files | +/- |
|--------|-------|-----|
| `refactor(permissions): migrate CASL → Cedar + capability tokens` | 71 | +2,352/-2,123 |
| `refactor(feature-flags): wire recomputeFlags to GrowthBook adapter` | 5 | +233/-73 |
| `chore(quality): add dep-cruiser rules, eslint import ban, jscpd fix` | 3 | +46/-1 |
| `fix(permissions): add policyVersionHash/operationContext checks` | 3 | +29/-8 |

**Total: 79 files, +2,652/-2,197**

## 1. secureDrizzleProxy.ts vs ADR-013 (Capability Token Design)

### ADR-013 Spec
Token validation must check: `expiresAt`, `policyVersionHash`, `operationContext`.

### Implementation

| Check | ADR-013 Spec | Implementation | Status |
|-------|-------------|---------------|--------|
| `expiresAt` | Must check | `isTokenValid()` checks `Date.now() > token.expiresAt` | ✅ |
| `policyVersionHash` | Must match current `policy_version` | `_currentPolicyHash` registered via `registerPolicyVersionHash()`, checked inside `isTokenValid()` | ✅ |
| `operationContext` | Must match write target | `_currentOperationContext` registered via `registerOperationContext()`, checked inside `isTokenValid()` | ✅ |

### Invalidation Matrix

| Event | Mechanism | Status |
|-------|-----------|--------|
| Policy version change | `usePolicyVersionInvalidation` hook + internal hash check in proxy | ✅ |
| Account swap | `useAuthLifecycle` calls `setActiveCapabilityToken(null)` | ✅ |
| Logout | `useAuthLifecycle` calls `setActiveCapabilityToken(null)` | ✅ |
| TTL expiry | `isTokenValid()` checks `expiresAt` | ✅ |
| Feature flag flip | Orthogonal — does NOT invalidate tokens per ADR-013 Q1 | ✅ |

### Token Flow
```
issueCapabilityToken(TokenContext)
  → CedarAuthorizationAdapter reads policy_version.hash from DB
  → evaluates via evaluateShape1()
  → returns CapabilityToken with UUID + 60s TTL + policyVersionHash

secureDrizzleProxy write interceptor:
  → if _activeToken set: isTokenValid(token) checks:
      1. expiresAt < now? → expired, fall back to per-write
      2. policyVersionHash != _currentPolicyHash? → stale, fall back
      3. operationContext != _currentOperationContext? → mismatch, fall back
  → if valid: skip per-write WASM evaluation (batch amortization)
  → if invalid: call _permissionValidator (fallback)
```

## 2. Citizenship Rename Verification

**What changed:**
- `logic/permissions/abilities/base.ts` → `types/authorization.ts` (R058 rename, CASL types stripped to plain unions)
- `CitizenGate.tsx` deleted → replaced by `SanctuaryGuard.tsx`
- `CITIZENSHIP` constants extracted to `logic/registry/citizenship.ts`
- `sanctuaryFeature.ts` re-exports `CITIZENSHIP` for convenience

**Consumers scanned (0 stale references):**
- `SanctuaryGuard.tsx` — imports `CITIZENSHIP` via `sanctuaryFeature` re-export ✅
- `domainEntry.ts` — imports directly from `citizenship.ts` ✅
- `useFeatureRegistry.ts` — imports directly from `citizenship.ts` ✅
- `useDomainFeature.ts` — uses `citizenshipRequired` from registry entry ✅
- `usePermissions.ts` — uses `citizenship` from UserContext ✅
- `Workspace.ts` — `DomainFeature` extends `DomainEntry` (replaces old `citizenshipRequired` number) ✅
- `useCedarDecisionStore.ts` — comment says "Replaces usePermissionStore" ✅
- No `usePermissionStore`, `CitizenGate`, `abilities/base`, `AppAbility`, or `createMongoAbility` references remain across `packages/core`, `packages/ui`, `apps/gurudevi-mobile`

**Result:** Citizenship rename consistent across all 79 changed files.

## 3. Deleted Permissions System (Clean Removal)

| Deleted File | Replacement |
|-------------|-------------|
| `usePermissionStore.ts/.web.ts` | `useCedarDecisionStore.ts` + `useEntitlementStore.ts` |
| `abilities/` (8 CASL files) | Cedar policies + `types/authorization.ts` unions |
| `feature-engine.ts` | `feature.slice.ts` + GrowthBook adapter |
| `feature-rollout-cache.ts` | Removed (no longer needed) |
| `AuthorityInterceptor.ts` | Removed (CASL-specific) |
| `FeatureGuard.tsx`, `RouteGuard.tsx` | `SanctuaryGuard.tsx` |
| `CapabilityGuard.tsx` | `SanctuaryGuard.tsx` |
| `CitizenGate.tsx` | `SanctuaryGuard.tsx` + prompt components |
| `localFeatureRollout.adapter.ts` | GrowthBook only |
| `supabaseFeatureFlag.adapter.ts` | GrowthBook only |
| `attendance.effect.ts` | `attendance.ts` (merged) |
| `feature-registry.schema.ts` | `domainEntry.ts` |

## 4. Test Results

All tests passing (excluding 3 pre-existing failures unchanged):

| Test file | Tests | Status |
|-----------|-------|--------|
| `secureDrizzleProxy.characterization.test.ts` | 14 | ✅ All pass |
| `cedarAuthorization.adapter.test.ts` | 5 | ✅ All pass |
| `featureSlice.test.ts` | 6 | ✅ All pass |
| `cedarClientEvaluator.test.ts` | * | ✅ existing |
| `sanctuaryFeature.test.ts` | * | ✅ existing |

## 5. Feature Flag Bugfix

**Problem:** `recomputeFlags()` in `feature.slice.ts` updated feature flag state but never actually resolved flags from GrowthBook.

**Fix:** `recomputeFlags()` now calls `featureFlags.resolveFlags(context)` via `GrowthBookFeatureRolloutAdapter`, maps response to typed `FeatureFlags`, applies global config overrides, falls back to `DEFAULT_FEATURE_FLAGS` on error.

## 6. Quality Constellation Enforcement

| Rule | File | What was added |
|------|------|---------------|
| Cross-domain imports | `.dependency-cruiser.cjs` | `no-cross-domain-feature-imports`, `domain-not-to-payments`, `no-store-imports-outside-core` |
| Icon import ban | `react-internal.js` | `no-restricted-imports` banning `lucide-react-native` → must use `@repo/ui/icons` |
| jscpd MCP path | `platform-mcp/src/index.ts` | Path corrected to root `node_modules` |
