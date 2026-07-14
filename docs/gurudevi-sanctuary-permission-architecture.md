# Gurudevi — Sanctuary Permission System Architecture
> Draft 1 — June 2026
> Companion to: gurudevi-architecture-draft-1.md, gurudevi-data-state-lifecycle.md
> This document covers the intended design of the permission system — the three gates, Cedar as unified authz, flag taxonomy, and intersection with the data/state lifecycle.

---

## 1. Core Philosophy

The permission system answers one question per gate, in order, cheapest first:

```
Gate 1 — Citizenship   "Is this user sufficiently in the system?"
Gate 2 — Entitlement   "Has the tenant paid for this capability?"
Gate 3 — Cedar (authz) "Does this principal have structural permission
                         for this action on this resource?"

Cross-cut — Feature flags  "Is this code path operationally active?"
                            (not a gate — a deployment state descriptor)
```

Three gates. One composed result. One evaluation function. One guard component.

Nothing else makes permission decisions.

---

## 2. The Citizenship Model

Citizenship describes registration depth — how far into the system a user has committed. It is not pricing. It is not role. It is independent of both.

```
Level 1 — WANDERER
  Supabase anonymous session.
  Guest access. Can read public content.
  Cannot write, cannot join structures, cannot have a bond.
  Prompt: "Create an account to continue."

Level 2 — SECOND_CLASS  
  Signed up with email or provider.
  Has an account. Can use app personally.
  Can have a personal workspace.
  Cannot join a school structure.
  Prompt: "Join a school to access this."

Level 3 — FIRST_CLASS
  Joined a school — either invited or created one.
  Full participant in the platform's intended use.
  Can hold bonds (teacher, student, parent, principal, founder, admin).
  No citizenship prompt — Cedar and entitlement gate from here.
```

Citizenship is stored as an integer: `1 | 2 | 3`. Higher = more access. Feature requirements use `citizenship >= feature.citizenshipRequired` for evaluation. The string enum (`WANDERER | SECOND_CLASS | FIRST_CLASS`) is the canonical type — the integer is the comparison value.

**Key invariant:** Citizenship is never checked inside Cedar policies. Cedar assumes a valid session. Citizenship is the pre-Cedar gate that confirms the session is sufficiently real to warrant Cedar evaluation.

---

## 3. The Three Gates in Detail

### Gate 1 — Citizenship Evaluator

```typescript
type CitizenshipLevel = 1 | 2 | 3  // WANDERER | SECOND_CLASS | FIRST_CLASS

// Evaluates: user.citizenship >= feature.citizenshipRequired
// Source: user record, read from Zustand useAuthStore
// Cost: synchronous integer comparison, no WASM, no network
// Failure response: SignupPrompt (citizenship 1→2) or SchoolJoinPrompt (2→3)
```

### Gate 2 — IEntitlementPort

```typescript
interface IEntitlementPort {
  getCapabilities(tenantId: string): Promise<TenantCapabilities>
  // local cache backed by pricing_manifest Zone A table
  // server-signed, version-invalidated same as Cedar snapshot
}

type PricingTier = 'FREE' | 'PRO' | 'INSTITUTIONAL'

// Evaluates: tenant pricing tier against feature requirement
// Source: pricing_manifest table (Zone A SQLite) — never a TS constant
// Cost: synchronous Drizzle read after initial cache load
// Failure response: UpgradePrompt with specific tier requirement
```

**Critical boundary:** `IEntitlementPort` never puts pricing tier attributes into Cedar context. Entitlement is resolved before Cedar is invoked. Cedar sees structural attributes only — bond capacity, tenant membership, resource ownership. Never `subscription_tier`.

### Gate 3 — IAuthzPort (Cedar, unified authz + capacity)

Cedar is the single evaluator for all structural permission questions. This includes:
- Bond capacity (teacher, student, parent, principal, founder, admin)
- Relationship to resource (is this teacher bonded to this classroom?)
- Tenant boundary (does this resource belong to the user's tenant?)
- Device trust status
- Cross-tenant permissions (global circles)

Capacity/role is **not a separate gate**. Cedar already knows the principal's capacity from the entity attributes. A separate capacity check before Cedar would be redundant.

```typescript
interface IAuthzPort {
  issueCapabilityToken(
    principalId: string,
    operationContext: OperationContext
  ): Promise<CapabilityToken>
  
  isPermitted(
    token: CapabilityToken,
    action: string,
    resourceId: string
  ): boolean
}

// Capability token: issued once per operation context
// Covers all writes in that context without re-evaluation
// See: gurudevi-architecture-draft-1.md ADR-004
```

Cedar WASM is loaded once at module scope — never per-call. Policy snapshot is server-signed, stored in Zone A `permission_snapshots` table, invalidated via `policy_version` field synced through PowerSync.

### Feature Flags — Cross-Cutting, Not a Gate

Feature flags describe deployment state. They are evaluated after all three gates pass. They are never a substitute for citizenship, entitlement, or Cedar checks.

```
flag_type: operational   kill-switch, maintenance mode, infra ready
           development   WIP, not yet shipped to any user
           beta          early access, opt-in rollout
           experiment    A/B test, cohort targeting
```

**What flags must never contain:**
- `isPro`, `isProMember` — these are entitlement checks, not deployment state
- `pricing_tier === 'PRO'` — same
- `capacity === 'student'` — this is a Cedar structural check
- Any hardcoded persona or tier assumptions

Flags are resolved via `IFeatureRolloutPort` backed by GrowthBook (or equivalent). Local cache in `storage` (MMKV). Offline default: fail open unless flag is tagged `kill-switch`.

---

## 4. SanctuaryFeatureResult — The Composed Type

```typescript
type SanctuaryFeatureResult =
  | { permitted: true }
  | { permitted: false; reason: 'citizenship'; required: CitizenshipLevel; current: CitizenshipLevel }
  | { permitted: false; reason: 'entitlement'; required: PricingTier; current: PricingTier }
  | { permitted: false; reason: 'authz'; policy?: string }
  | { permitted: false; reason: 'feature'; flagKey: string; flagType: FlagType }
  | { permitted: false; reason: 'not_initialized' }
```

Every failure carries enough information for the UI to render the correct response without additional lookups. No implicit failures. No silent `false`.

The `not_initialized` case is critical — currently `can()` returns `false` silently when `permissionsMap` is null. This masks initialization failures as permission denials. The new system makes this explicit.

---

## 5. The Evaluation Function

```typescript
// Pure function — no React, fully testable
sanctuaryFeature(
  action: string,
  subject: string,
  context: SanctuaryEvaluationContext,
  resource?: ResourceRef
): SanctuaryFeatureResult

// Hook — reads from Zustand + Cedar snapshot + stores
useSanctuaryFeature(
  action: string,
  subject: string,
  resource?: ResourceRef
): SanctuaryFeatureResult
```

Evaluation order — short-circuits on first failure:

```
1. not_initialized check
   → Cedar snapshot loaded? Entitlement manifest loaded?
   → if no: return { permitted: false, reason: 'not_initialized' }

2. citizenship gate
   → user.citizenship >= subject.citizenshipRequired?
   → if no: return { permitted: false, reason: 'citizenship', required, current }

3. entitlement gate
   → IEntitlementPort.getCapabilities(tenantId)
   → feature in enabledModules?
   → if no: return { permitted: false, reason: 'entitlement', required, current }

4. Cedar gate
   → IAuthzPort: evaluate principal × action × resource
   → Cedar WASM runs against local snapshot
   → if deny: return { permitted: false, reason: 'authz', policy }

5. feature flag gate
   → IFeatureRolloutPort.isFeatureActive(flagKey)
   → if inactive: return { permitted: false, reason: 'feature', flagKey, flagType }

6. return { permitted: true }
```

### Backward compatibility — can()

```typescript
// Thin wrapper kept for call-site compatibility during migration
// After migration complete: assess whether to keep or remove
const can = (action: string, subject: string): boolean =>
  useSanctuaryFeature(action, subject).permitted
```

`can()` does not disappear immediately — the blast radius of changing every call site simultaneously is too large. It becomes a one-liner that calls the real thing. Call sites migrate incrementally to `useSanctuaryFeature` when they need the `reason` for UI decisions.

---

## 6. SanctuaryGuard — The UI Component

Single component. Replaces both `FeatureGuard` and `CapabilityGuard`. Renders different UI based on `result.reason`.

```typescript
interface SanctuaryGuardProps {
  action: string
  subject: string
  resource?: ResourceRef
  children: React.ReactNode
  fallback?: React.ReactNode  // override default gate UI
}

// Internal render logic:
// permitted: true          → render children
// reason: citizenship      → render SignupPrompt | SchoolJoinPrompt
// reason: entitlement      → render UpgradePrompt (with required tier)
// reason: authz            → render null (wrong role — no upgrade path)
// reason: feature          → render null (operational flag — invisible to user)
// reason: not_initialized  → render loading indicator
```

**Key design decision:** Wrong role (`authz` denial) renders `null` — not an upgrade prompt, not an error. A student who can't access the teacher dashboard should not see "upgrade to access this." The feature simply doesn't exist for them. Only citizenship and entitlement failures warrant user-facing prompts because those are actionable by the user.

---

## 7. useFeatureRegistry — After Refactor

`useFeatureRegistry` keeps its shape but its internals are replaced. It calls `useSanctuaryFeature` per domain feature rather than doing its own citizenship/isPro/capability evaluation.

```typescript
// Before (current):
const hasCitizenship = userContext.citizenship >= feature.citizenshipRequired
const isProLocked = Boolean(feature.isPro) && !userContext.isPro
const hasCapability = userContext.can('read', feature.capabilityKey)

// After:
const result = useSanctuaryFeature(
  feature.capabilityRequirement.action,
  feature.capabilityRequirement.subject
)
const locked = !result.permitted
const reason = result.permitted ? undefined : result.reason
```

`FeatureGatingResult` type gains a `upgradeTarget` field:

```typescript
interface FeatureGatingResult {
  visible: boolean          // always true — show to reveal potential
  locked: boolean
  reason?: 'citizenship' | 'entitlement' | 'authz' | 'feature'
  upgradeTarget?: {         // what would unlock this
    citizenship?: CitizenshipLevel
    tier?: PricingTier
  }
  feature: DomainFeature
}
```

`selfRegistry.ts` domain entries gain explicit `citizenshipRequired` field:

```typescript
growth: {
  id: 'growth',
  title: 'Growth Sanctuary',
  citizenshipRequired: 3,              // FIRST_CLASS — must be in a school
  capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
  features: ['study_rhythm', 'personal_goals', 'academic_grades'],
}
```

---

## 8. Intersection with Data/State Lifecycle

The permission system is not beside the data lifecycle — it is inside it. Every data flow touches the permission system at a specific point.

```
Boot hydration (step 4-5)
  → Cedar WASM warmed at module scope
  → Cedar snapshot loaded from permission_snapshots (Zone A)
  → Until snapshot ready: not_initialized state
  → Writes queue, reads in read-only safe mode

Zone A write flow
  → sanctuaryFeature evaluates before SecureDrizzleProxy
  → capability token issued by IAuthzPort
  → proxy validates token — does not re-invoke Cedar
  → all writes in operation context use same token

Zone B/C write flow
  → citizenship gate runs first
  → WANDERER cannot create outbox entry
  → SECOND_CLASS can queue personal posts
  → FIRST_CLASS can queue school-context posts
  → Cedar still gates what they can post to

PowerSync Zone A sync
  → policy_version change arrives
  → useLiveQuery fires
  → Cedar snapshot invalidated
  → all capability tokens cleared from Zustand
  → not_initialized state until fresh snapshot loaded
  → queued writes remain queued

Account swap
  → all capability tokens cleared
  → citizenship re-evaluated for new account
  → Cedar snapshot re-loaded for new account
  → feature flag cache may differ (different user cohort)

useFeatureRegistry
  → calls useSanctuaryFeature per domain feature
  → reads same Cedar snapshot that gates writes
  → same source of truth — UI visibility and write permission
    are never out of sync
```

**The key invariant:** If `SanctuaryGuard` shows a feature to a user, the write path will also permit it. They read from the same Cedar snapshot. This was not true in the old system — UI guards and write guards were separate systems that could diverge.

---

## 9. What Gets Deleted

No bridges. These are removed entirely.

```
permissionsMap                    — CASL shim, replaced by Cedar snapshot reads
Actions / SubjectType (CASL)      — replaced by Cedar action/subject strings  
isPro / isProMember in flags      — moved to IEntitlementPort
pricing_tier checks in feature-engine.ts — moved to IEntitlementPort
capacity checks in feature-engine.ts    — moved to Cedar
FeatureGuard (hybrid)             — replaced by SanctuaryGuard
CapabilityGuard                   — replaced by SanctuaryGuard
CitizenGate (current)             — replaced by SignupPrompt / SchoolJoinPrompt
                                    rendered by SanctuaryGuard on reason
```

---

*End of architecture reference. This document describes the target. The agent execution guide describes how to get there. Your guide describes what to watch for.*
