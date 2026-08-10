---
title: "Gurudevi — Sanctuary Permission System: Agent Execution Guide"
status: "superseded"
created: 2026-06-01
updated: 2026-08-11
author: "Naveen"
tags: [gurudevi, historical, execution-guide]
superseded_by: "../../../apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md"
---

> **SUPERSEDED — REFACTOR COMPLETE (August 2026).** The permission refactor this guide describes is
> shipped: `sanctuaryFeature()` (gate order **citizenship → Cedar → entitlement → lifecycle/flag**),
> `useSanctuaryFeature`, `SanctuaryGuard`, and the CASL shim is deleted. Note: this guide's gate order
> (entitlement before Cedar) is outdated — Cedar evaluates before entitlement per
> [ADR-005](../../../apps/gurudevi-mobile/docs/decisions/005-feature-gate-order-and-context-ownership.md).
> For the current model see
> [feature-lifecycle-management](../../../apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md)
> and the [permission refactor review report](../../architecture/2026-07-24-permission-refactor-review-report.md).
> Do not execute this guide.

# Gurudevi — Sanctuary Permission System: Agent Execution Guide
> Draft 1 — June 2026
> Execute this when permission system refactor is prioritized.
> Read before starting: gurudevi-sanctuary-permission-architecture.md
> Read before starting: gurudevi-data-state-lifecycle.md (Section 8 — Cedar flows)
> Read before starting: gurudevi-architecture-draft-1.md (ADR-004, ADR-005, ADR-006)

---

## 0. Principles for This Refactor

**Break loudly, build cleanly.** No compatibility bridges. No safe fallbacks that mask the old system still running. Delete the old thing, let the failures surface — TSC errors, ESLint violations, runtime throws — then build the replacement. Only move to the next step when the current step compiles and passes.

**One source of truth.** After this refactor, `useSanctuaryFeature` is the only place permission decisions are made. If you find yourself checking `user.pricing_tier` or `activeBond.capacity` directly in a component, stop — that logic belongs in the evaluation pipeline.

**No pricing in Cedar. No Cedar in flags. No flags in entitlement.** The three gates are strictly separated. See architecture doc Section 3.

**The data lifecycle is the authority on storage.** All Cedar snapshots, policy versions, and pricing manifests live in Zone A SQLite tables. See gurudevi-data-state-lifecycle.md Section 11 (State Ownership Map) before touching any storage call.

---

## 1. Pre-Flight — Map the Blast Radius First

Before deleting anything, run this search pass and record every result. This is your work surface.

```bash
# Every file importing from abilities/base.ts
grep -r "from.*abilities/base" --include="*.ts" --include="*.tsx" -l

# Every call to can() or cannot() — with action/subject pairs
grep -r "can(" --include="*.tsx" --include="*.ts" -n | grep -v "cannot\|scan\|ican\|ocean\|pelican"
grep -r "cannot(" --include="*.tsx" --include="*.ts" -n

# Every reference to permissionsMap
grep -r "permissionsMap" --include="*.ts" --include="*.tsx" -n

# Every reference to isPro / isProMember in feature engine
grep -r "isPro\|isProMember" --include="*.ts" --include="*.tsx" -n

# Every reference to pricing_tier in feature-engine
grep -r "pricing_tier" packages/core/src/logic/permissions/feature-engine.ts

# Every import of FeatureGuard or CapabilityGuard
grep -r "FeatureGuard\|CapabilityGuard\|CitizenGate" --include="*.tsx" -l

# Every useFeatureRegistry call
grep -r "useFeatureRegistry" --include="*.ts" --include="*.tsx" -n
```

Record the output before touching any file. This is your completion checklist.

---

## 2. Step 1 — Delete the CASL Shim and Types

**Target files:**
- `packages/core/src/logic/permissions/abilities/base.ts`
- `packages/core/src/store/usePermissionStore.ts` (permissionsMap specifically)
- `packages/core/src/logic/permissions/hooks/usePermissions.ts` (permissionsMap read)

**What to delete:**

In `abilities/base.ts`:
- Delete `Actions` type
- Delete `SubjectType` type
- Delete any CASL `defineAbility` or `createMongoAbility` calls
- Keep the file if other non-CASL types live there, otherwise delete entirely

In `usePermissionStore.ts`:
- Delete `permissionsMap` state field and its type
- Delete the hydration logic that populates `permissionsMap` from the snapshot
- Keep the store if it holds other state (snapshot itself, loading status)

In `usePermissions.ts`:
- Delete the `permissionsMap` import and read
- Delete the current `can()` implementation body (keep the function signature)
- Leave `can()` as a stub that throws: 
  ```typescript
  const can = () => { throw new Error('SanctuaryFeature not yet implemented — do not call can() until Step 4') }
  ```
- This makes the break loud at runtime, not just at compile time

**Expected failures after Step 1:**
- TSC errors everywhere `Actions` or `SubjectType` is imported
- TSC errors everywhere `permissionsMap` is read
- Runtime throw if `can()` is called before Step 4 replacement

Do not fix these yet. Record them. Move to Step 2.

---

## 3. Step 2 — Remove Entitlement Leakage from Feature Engine

**Target file:** `packages/core/src/logic/permissions/feature-engine.ts`

**What to delete:**
- All `pricing_tier === 'PRO'` / `pricing_tier === 'INSTITUTIONAL'` conditionals
- All `isPro` / `isProMember` flag assignments derived from pricing tier
- All `capacity === 'student'` or similar hardcoded capacity checks
- The `pricing_tier` field from whatever context shape `resolveFeatureFlags` receives — if it's the only usage of that field, remove it from the context type too

**What remains in feature-engine.ts:**
- Environment-based flags (`EXPO_PUBLIC_*`)
- Operational flags (maintenance, kill-switches)
- Development flags (WIP features)
- Beta / experiment flags (cohort targeting via GrowthBook)
- Nothing that reads pricing tier, capacity, or citizenship

**Update `FlagType` to be explicit:**
```typescript
type FlagType = 'operational' | 'development' | 'beta' | 'experiment'

interface FeatureFlag {
  key: string
  type: FlagType
  defaultValue: boolean
  // NO: isPro, pricingRequired, citizenshipRequired — those belong elsewhere
}
```

**Expected failures after Step 2:**
- Any component that relied on `flags.isPro` or `flags.isProMember` will now get `undefined`
- TSC errors if those flag keys were typed

Record them. Move to Step 3.

---

## 4. Step 3 — Create the Core Types and Pure Function

**New file:** `packages/core/src/logic/permissions/sanctuaryFeature.ts`

Create these types and the pure evaluation function. No React yet — pure TypeScript, fully testable.

```typescript
// ── Types ──────────────────────────────────────────────────────────

export type CitizenshipLevel = 1 | 2 | 3
export type CitizenshipName = 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS'

export const CITIZENSHIP: Record<CitizenshipName, CitizenshipLevel> = {
  WANDERER: 1,
  SECOND_CLASS: 2,
  FIRST_CLASS: 3,
}

export type PricingTier = 'FREE' | 'PRO' | 'INSTITUTIONAL'
export type FlagType = 'operational' | 'development' | 'beta' | 'experiment'

export type SanctuaryFeatureResult =
  | { permitted: true }
  | { permitted: false; reason: 'not_initialized' }
  | { permitted: false; reason: 'citizenship'; required: CitizenshipLevel; current: CitizenshipLevel }
  | { permitted: false; reason: 'entitlement'; required: PricingTier; current: PricingTier }
  | { permitted: false; reason: 'authz'; policy?: string }
  | { permitted: false; reason: 'feature'; flagKey: string; flagType: FlagType }

export interface SanctuaryEvaluationContext {
  // Initialization state
  cedarSnapshotLoaded: boolean
  entitlementManifestLoaded: boolean

  // Gate 1 — citizenship
  citizenship: CitizenshipLevel
  
  // Gate 2 — entitlement
  tenantPricingTier: PricingTier
  tenantEnabledModules: string[]

  // Gate 3 — Cedar (result already evaluated, passed in as decision)
  cedarDecision: 'allow' | 'deny' | 'no_decision'
  cedarPolicy?: string

  // Cross-cut — feature flags
  flagActive: boolean
  flagKey: string
  flagType: FlagType
}

export interface FeatureRequirement {
  citizenshipRequired: CitizenshipLevel
  entitlementModule?: string        // which module key in enabledModules
  entitlementTier?: PricingTier     // minimum tier required
  flagKey?: string                  // operational flag to check
}

// ── Pure evaluation function ────────────────────────────────────────

export function sanctuaryFeature(
  ctx: SanctuaryEvaluationContext,
  requirement: FeatureRequirement,
): SanctuaryFeatureResult {
  // Not initialized — Cedar snapshot or entitlement manifest not yet loaded
  if (!ctx.cedarSnapshotLoaded || !ctx.entitlementManifestLoaded) {
    return { permitted: false, reason: 'not_initialized' }
  }

  // Gate 1 — citizenship
  if (ctx.citizenship < requirement.citizenshipRequired) {
    return {
      permitted: false,
      reason: 'citizenship',
      required: requirement.citizenshipRequired,
      current: ctx.citizenship,
    }
  }

  // Gate 2 — entitlement
  if (requirement.entitlementModule) {
    if (!ctx.tenantEnabledModules.includes(requirement.entitlementModule)) {
      // Determine required tier from manifest — passed in via context
      const requiredTier = requirement.entitlementTier ?? 'PRO'
      return {
        permitted: false,
        reason: 'entitlement',
        required: requiredTier,
        current: ctx.tenantPricingTier,
      }
    }
  }

  // Gate 3 — Cedar (decision already evaluated before this call)
  if (ctx.cedarDecision === 'deny' || ctx.cedarDecision === 'no_decision') {
    return { permitted: false, reason: 'authz', policy: ctx.cedarPolicy }
  }

  // Cross-cut — feature flag
  if (ctx.flagKey && !ctx.flagActive) {
    return { permitted: false, reason: 'feature', flagKey: ctx.flagKey, flagType: ctx.flagType }
  }

  return { permitted: true }
}
```

Write unit tests for `sanctuaryFeature` before moving to Step 4. Test every branch. This function has no dependencies — it is trivially testable.

---

## 5. Step 4 — Create the Hook

**New file:** `packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts`

```typescript
import { useMemo } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { usePermissionStore } from '../../../store/usePermissionStore'
import { useFeatureStore } from '../../../store/useFeatureStore'
import { useTenantStore } from '../../../store/useTenantStore'
import { sanctuaryFeature, type SanctuaryFeatureResult, type FeatureRequirement } from '../sanctuaryFeature'
import { checkLocalPermission } from '../localEvaluator'

export function useSanctuaryFeature(
  action: string,
  subject: string,
  requirement: FeatureRequirement,
  resourceId?: string,
): SanctuaryFeatureResult {
  const citizenship = useAuthStore((s) => s.user?.citizenship ?? 1)
  const tenantId = useAuthStore((s) => s.activeBond?.entity_id ?? null)
  const cedarSnapshotLoaded = usePermissionStore((s) => s.snapshotLoaded)
  const entitlementManifestLoaded = useTenantStore((s) => s.manifestLoaded)
  const tenantPricingTier = useTenantStore((s) => s.pricingTier ?? 'FREE')
  const tenantEnabledModules = useTenantStore((s) => s.enabledModules ?? [])
  const flags = useFeatureStore((s) => s.flags)
  const principalId = useAuthStore((s) => s.user?.id ?? null)

  return useMemo(() => {
    // Cedar evaluation — synchronous against in-memory snapshot
    // checkLocalPermission uses the module-level WASM singleton
    let cedarDecision: 'allow' | 'deny' | 'no_decision' = 'no_decision'
    let cedarPolicy: string | undefined

    if (cedarSnapshotLoaded && principalId) {
      try {
        const cedarResult = checkLocalPermission(action, subject, resourceId ?? subject)
        cedarDecision = cedarResult.decision === 'Allow' ? 'allow' : 'deny'
        cedarPolicy = cedarResult.diagnostics?.reasons?.[0]
      } catch {
        cedarDecision = 'deny'
      }
    }

    // Flag resolution
    const flagKey = requirement.flagKey ?? `${subject}.${action}`
    const flagEntry = flags[flagKey]
    const flagActive = flagEntry?.value ?? true  // fail open unless explicit false
    const flagType = flagEntry?.type ?? 'operational'

    return sanctuaryFeature(
      {
        cedarSnapshotLoaded,
        entitlementManifestLoaded,
        citizenship: citizenship as 1 | 2 | 3,
        tenantPricingTier,
        tenantEnabledModules,
        cedarDecision,
        cedarPolicy,
        flagActive,
        flagKey,
        flagType,
      },
      requirement,
    )
  }, [
    action, subject, resourceId, requirement,
    citizenship, cedarSnapshotLoaded, entitlementManifestLoaded,
    tenantPricingTier, tenantEnabledModules, flags, principalId,
  ])
}
```

**Now fix `can()` in `usePermissions.ts`:**

```typescript
// Replace the stub from Step 1 with:
const can = useCallback(
  (action: Actions, subject: SubjectType) => {
    // Note: Actions and SubjectType will be replaced with string
    // after all call sites are migrated. Keep temporarily for TSC compatibility.
    return useSanctuaryFeature(action as string, subject as string, {
      citizenshipRequired: 1, // minimum — specific requirements set at call site
    }).permitted
  },
  []
)
```

After Step 4, the runtime throw from Step 1 is gone. `can()` returns a real value. Existing call sites work again.

---

## 6. Step 5 — Fix useFeatureRegistry

**Target file:** `packages/core/src/hooks/useFeatureRegistry.ts`

Replace the internal evaluation logic. Keep the external shape (`FeatureGatingResult`, the registry pattern) — only the internals change.

```typescript
import { useSanctuaryFeature } from '../logic/permissions/hooks/useSanctuaryFeature'
import type { DomainFeature } from '../types/Workspace'
import { CITIZENSHIP } from '../logic/permissions/sanctuaryFeature'

export interface FeatureGatingResult {
  visible: boolean
  locked: boolean
  reason?: 'citizenship' | 'entitlement' | 'authz' | 'feature'
  upgradeTarget?: {
    citizenship?: 1 | 2 | 3
    tier?: 'FREE' | 'PRO' | 'INSTITUTIONAL'
  }
  feature: DomainFeature
}

// Note: hook signature changes — userContext param removed
// The hook reads from Zustand directly via useSanctuaryFeature
export function useFeatureRegistry(
  registry: Record<string, DomainFeature>,
): Record<string, FeatureGatingResult> {
  // Each feature is evaluated independently
  // useSanctuaryFeature is called per entry
  return Object.fromEntries(
    Object.entries(registry).map(([key, feature]) => {
      const result = useSanctuaryFeature(
        feature.capabilityRequirement.action,
        feature.capabilityRequirement.subject,
        {
          citizenshipRequired: feature.citizenshipRequired ?? CITIZENSHIP.FIRST_CLASS,
          entitlementModule: feature.entitlementModule,
          entitlementTier: feature.entitlementTier,
          flagKey: feature.flagKey,
        },
      )

      const gatingResult: FeatureGatingResult = {
        visible: true,
        locked: !result.permitted,
        reason: result.permitted ? undefined : result.reason,
        upgradeTarget: !result.permitted ? resolveUpgradeTarget(result) : undefined,
        feature,
      }

      return [key, gatingResult]
    })
  )
}

function resolveUpgradeTarget(result: SanctuaryFeatureResult) {
  if (result.reason === 'citizenship') return { citizenship: result.required }
  if (result.reason === 'entitlement') return { tier: result.required }
  return undefined
}
```

**Update `DomainFeature` type** in `packages/core/src/types/Workspace.ts`:

```typescript
interface DomainFeature {
  // existing fields...
  citizenshipRequired: 1 | 2 | 3        // ADD — was implicit
  entitlementModule?: string             // ADD — replaces isPro
  entitlementTier?: PricingTier          // ADD
  flagKey?: string                       // ADD — explicit flag association
  capabilityRequirement: {
    action: string
    subject: string
  }
  // REMOVE: isPro, traitRequirement (move to citizenshipRequired + Cedar)
}
```

**Update `selfRegistry.ts`** — every domain entry needs `citizenshipRequired` and `entitlementModule` where applicable. Remove `traitRequirement` (Cedar handles this). Remove `isPro` (entitlementModule handles this).

---

## 7. Step 6 — Create SanctuaryGuard

**New file:** `packages/ui/src/components/SanctuaryGuard.tsx`

```typescript
import React from 'react'
import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature'
import type { FeatureRequirement } from '@repo/core/logic/permissions/sanctuaryFeature'
import { SignupPrompt } from './prompts/SignupPrompt'
import { SchoolJoinPrompt } from './prompts/SchoolJoinPrompt'
import { UpgradePrompt } from './prompts/UpgradePrompt'
import { CITIZENSHIP } from '@repo/core/logic/permissions/sanctuaryFeature'

interface SanctuaryGuardProps {
  action: string
  subject: string
  requirement: FeatureRequirement
  resource?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SanctuaryGuard({
  action,
  subject,
  requirement,
  resource,
  children,
  fallback,
}: SanctuaryGuardProps) {
  const result = useSanctuaryFeature(action, subject, requirement, resource)

  if (result.permitted) return <>{children}</>
  if (fallback !== undefined) return <>{fallback}</>

  switch (result.reason) {
    case 'not_initialized':
      return null  // or a loading indicator — decide per context

    case 'citizenship':
      if (result.current === CITIZENSHIP.WANDERER) {
        return <SignupPrompt requiredLevel={result.required} />
      }
      return <SchoolJoinPrompt />

    case 'entitlement':
      return <UpgradePrompt requiredTier={result.required} currentTier={result.current} />

    case 'authz':
      return null  // wrong role — feature doesn't exist for this user

    case 'feature':
      return null  // operational flag — invisible to user

    default:
      return null
  }
}
```

**Create prompt components** — these are new, simple components:
- `SignupPrompt` — "Create an account to access this"
- `SchoolJoinPrompt` — "Join a school to access this"  
- `UpgradePrompt` — "Your school needs PRO/INSTITUTIONAL to access this" (takes `requiredTier`)

These replace `CitizenGate` entirely.

---

## 8. Step 7 — Migrate Call Sites

Now that `SanctuaryGuard` exists and `can()` works via the new pipeline, migrate call sites incrementally.

**Priority order:**
1. Any component using `FeatureGuard` with both `feature` and `action/subject` — these are the hybrid ones, highest risk
2. Any component using `CapabilityGuard` — direct replacement with `SanctuaryGuard`
3. Any component using `CitizenGate` directly — replace with `SanctuaryGuard` (citizenship reason handles it)
4. Components using `can()` where they need the `reason` for UI decisions — migrate to `useSanctuaryFeature` directly

**Migration pattern for each:**

```tsx
// Before:
<FeatureGuard action="manage" subject="Attendance">
  <AttendanceButton />
</FeatureGuard>

// After:
<SanctuaryGuard
  action="manage"
  subject="Attendance"
  requirement={{ citizenshipRequired: 3, entitlementModule: 'attendance' }}
>
  <AttendanceButton />
</SanctuaryGuard>
```

---

## 9. Step 8 — Delete Old Guard Files

Only after Step 7 is complete and TSC passes:

```
DELETE: packages/core/src/logic/permissions/guards/FeatureGuard.tsx
DELETE: packages/ui/src/components/CapabilityGuard.tsx
DELETE: packages/ui/src/components/CitizenGate.tsx
```

If any imports remain after deletion: TSC will catch them. Fix before proceeding.

---

## 10. Completion Checklist

Before marking this refactor done:

- [ ] `permissionsMap` — zero references in codebase
- [ ] `Actions` / `SubjectType` from abilities/base — zero imports
- [ ] `isPro` / `isProMember` — zero references in feature-engine.ts
- [ ] `pricing_tier` conditionals — zero in feature-engine.ts
- [ ] `FeatureGuard` — deleted, zero imports
- [ ] `CapabilityGuard` — deleted, zero imports
- [ ] `CitizenGate` — deleted, zero imports
- [ ] `sanctuaryFeature` pure function — unit tests passing
- [ ] `useSanctuaryFeature` — integrated with Cedar snapshot, entitlement manifest, flags
- [ ] `useFeatureRegistry` — calls `useSanctuaryFeature`, no internal citizenship/isPro logic
- [ ] `SanctuaryGuard` — renders correct gate UI per reason
- [ ] `can()` — calls `useSanctuaryFeature`, not a shim read
- [ ] TSC: zero errors
- [ ] Full test pass before any new feature work

---

*This guide assumes the data/state lifecycle is implemented as specified in gurudevi-data-state-lifecycle.md. Specifically: Cedar snapshot in Zone A permission_snapshots table, entitlement manifest in Zone A pricing_manifest table, both loaded during boot hydration step 5-6.*
