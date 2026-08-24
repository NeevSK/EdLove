---
title: "Gurudevi â€” Unified Domain Registry Architecture"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture]
---

# Gurudevi — Unified Domain Registry Architecture
> Draft 1 — June 2026
> Companion to: gurudevi-sanctuary-permission-architecture.md
> This document covers the domain registry system — what it is,
> what it owns, how it connects to the permission system.

---

## 1. What the Registry Is

The AppCatalog is a single assembled map of every domain/tab/surface
in the Gurudevi app. It answers one question:

> "What features exist in this app, and what do they require?"

It does not answer "can this user access this feature?" — that is
useSanctuaryFeature's job. The registry declares requirements.
The permission system evaluates them.

---

## 2. Citizenship Model

Citizenship describes registration depth — how far into the system
a user has committed. It is not pricing. It is not role/capacity.

```
FIRST_CLASS  = 1   In a school. Full participant. Highest access.
SECOND_CLASS = 2   Signed up. Personal use. Not yet in a school.
THIRD_CLASS  = 3   Guest / anonymous session. Lowest access.
                   (renamed from WANDERER — WANDERER is fully removed)
```

Lower number = more access.
`meetsCitizenship(user, required)` is the only evaluation function.
It evaluates `user <= required` internally.
Never write the comparison inline anywhere else.

```typescript
// packages/core/src/logic/registry/citizenship.ts

export const CITIZENSHIP = {
  FIRST_CLASS:  1,
  SECOND_CLASS: 2,
  THIRD_CLASS:  3,
} as const

export type CitizenshipLevel = typeof CITIZENSHIP[keyof typeof CITIZENSHIP]

export function meetsCitizenship(
  userCitizenship: CitizenshipLevel,
  required: CitizenshipLevel,
): boolean {
  return userCitizenship <= required
}
```

ZenStack schema.zmodel is the SSOT for the citizenship enum.
The rename from WANDERER to THIRD_CLASS happens there.
ZenStack generates the Supabase migration.

---

## 3. DomainEntry — The Canonical Type

Every domain in the app is one DomainEntry. Fields are grouped
by concern so it is clear which system reads which field.

```typescript
// packages/core/src/logic/registry/domainEntry.ts

DomainEntry {
  // Identity
  id: string
  label: string
  description?: string
  ownerPackage: string

  // Platform support
  mobileSupport: boolean
  webSupport: boolean

  // Deployment state — read by IFeatureRolloutPort / GrowthBook
  state: 'development' | 'beta' | 'live' | 'deprecated'
  flagKey?: string

  // Gate requirements — read by useSanctuaryFeature
  citizenshipRequired: CitizenshipLevel   // 1 | 2 | 3
  capabilityRequirement: {
    action: string
    subject: string
  }
  entitlementModule?: string
  entitlementTier?: 'FREE' | 'PRO' | 'INSTITUTIONAL'

  // UI / routing
  tabDomain: 'self' | 'workspace' | 'community' | 'library' | 'profile'
  surfaceId: string
  defaultOrder: number

  // Analytics — domain-scoped tracking key
  analyticsKey: string   // format: 'tabDomain.domainId'
}
```

What was removed from the old DomainFeature type and why:

```
FeatureKind (CORE|PRO|EXPERIMENTAL)   → entitlement is IEntitlementPort
is_enabled, is_locked, lock_reason    → gate evaluation is useSanctuaryFeature
GLOBAL_OFF                            → kill-switch is IFeatureRolloutPort
capabilityKey (bare string)           → replaced by capabilityRequirement {action, subject}
citizenshipRequired: 0                → 0-based numbering gone, 1|2|3 with named constants
workspaceId                           → collapsed into tabDomain + surfaceId
isPro                                 → entitlementModule field
traitRequirement                      → Cedar capabilityRequirement handles this
```

---

## 4. AppCatalog — Assembly and Access

The AppCatalog is a module-level singleton assembled once at boot.
It throws loudly if accessed before registration or if a domain
is missing. No silent failures.

```
registerDomains(entries)    → called once at boot, throws if called twice
getAppCatalog()             → returns full catalog, throws if not registered
getDomainEntry(id)          → returns one entry, throws if not found
getDomainsByTab(tab)        → returns entries for one tab, sorted by order
getAllDomains()              → returns all entries sorted by order
```

Boot registration assembles all domain packages:

```
registerAppCatalog()
  → spreads SELF_REGISTRY
  → spreads CLASSROOM_REGISTRY
  → spreads COMMUNITY_REGISTRY
  → spreads LIBRARY_REGISTRY
  → spreads ADMIN_REGISTRY
  → passes to registerDomains()
```

Called once during boot hydration before any screen renders.
See gurudevi-data-state-lifecycle.md boot sequence.

---

## 5. Domain Registry Files

Each domain package keeps its own registry file. All entries
must conform to DomainEntry. The package owns its domain
metadata — core just assembles them.

```
packages/self/src/constants/selfRegistry.ts
  → SELF_REGISTRY: Record<string, DomainEntry>
  → domains: pulse, growth, care, reflection, working, leadership

packages/classroom/src/constants/classroomRegistry.ts
  → CLASSROOM_REGISTRY: Record<string, DomainEntry>
  → domains: teacher_dashboard, student_dashboard

packages/community/src/constants/communityRegistry.ts
  → COMMUNITY_REGISTRY: Record<string, DomainEntry>
  → domains: hearth, circles, messages

packages/library/src/constants/libraryRegistry.ts
  → LIBRARY_REGISTRY: Record<string, DomainEntry>
  → domains: archive, resource_hub, curator_studio

packages/admin/src/constants/adminRegistry.ts
  → ADMIN_REGISTRY: Record<string, DomainEntry>
  → domains: principal_dashboard, staff_management
```

Adding a new domain: add entry to the relevant registry file,
add it to registerAppCatalog.ts, done.

---

## 6. How Registry Connects to Permission System

The registry and the permission system are separate concerns
that connect at one point: useDomainFeature.

```
AppCatalog
  getDomainEntry(id)
       ↓
  entry.citizenshipRequired
  entry.capabilityRequirement
  entry.entitlementModule
  entry.flagKey
       ↓
  useSanctuaryFeature(action, subject, requirements)
       ↓
  Gate 1: meetsCitizenship(user.citizenship, entry.citizenshipRequired)
  Gate 2: IEntitlementPort.getCapabilities(tenantId)
  Gate 3: IAuthzPort — Cedar WASM evaluation
  Cross:  IFeatureRolloutPort.isFeatureActive(entry.flagKey)
       ↓
  SanctuaryFeatureResult
       ↓
  SanctuaryGuard renders or gates
```

useDomainFeature is the bridge. It reads from the registry
and calls the permission system. Components call useDomainFeature,
not useSanctuaryFeature directly, so requirements always stay
in sync with the registry definition.

---

## 7. Flag Taxonomy in Registry Context

The `state` field and `flagKey` field serve different purposes:

```
state: 'development'
  → Feature not yet ready for any user
  → useFeatureRegistry filters these out (visible: false)
  → No GrowthBook flag needed — just don't show it

state: 'beta'
  → Feature in early access
  → flagKey points to a GrowthBook beta rollout flag
  → IFeatureRolloutPort gates who sees it

state: 'live'
  → Fully shipped
  → flagKey optional — only set if a kill-switch exists

state: 'deprecated'
  → Being removed
  → useFeatureRegistry filters these out (visible: false)
```

Flag types in GrowthBook that connect to registry:

```
operational   → kill-switch for a live domain (flagKey on live entry)
beta          → rollout flag for a beta domain (flagKey on beta entry)
experiment    → A/B variant for a live domain (separate, not in flagKey)
development   → never in registry — just don't ship the entry as live
```

---

## 8. Analytics Connection

Every DomainEntry carries an analyticsKey in the format
`tabDomain.domainId`. This is the tracking key for
domain-level usage analytics.

```
workspace.teacher_dashboard
community.hearth
self.pulse
library.archive
```

When a domain is accessed, emit an analytics event with
this key. The registry is the SSOT for what these keys are —
analytics code reads from the entry, not from hardcoded strings.

---

## 9. useFeatureRegistry — After Refactor

useFeatureRegistry takes a tab domain and returns all entries
for that tab with their gating results. It no longer contains
any gate evaluation logic — that moved to useSanctuaryFeature.

```typescript
useFeatureRegistry('workspace')
→ returns Record<string, FeatureGatingResult> for all workspace entries
→ each entry: { entry, visible, locked, reason, upgradeTarget }
→ visible: false for development and deprecated entries
→ locked: true if any gate fails
→ reason: 'citizenship' | 'entitlement' | 'authz' | 'feature' | undefined
→ upgradeTarget: { citizenship? } or { tier? } for actionable failures
```

useSanctuaryRegistry becomes a one-liner:
→ useFeatureRegistry('self')

---

## 10. What This System Does NOT Own

The registry does not own:
- Gate evaluation logic (useSanctuaryFeature owns this)
- Pricing manifest (IEntitlementPort + Zone A pricing_manifest table)
- Cedar policies (IAuthzPort + permission_snapshots table)
- Feature flag values (IFeatureRolloutPort + GrowthBook + storage)
- Route/navigation logic (Expo Router owns this)
- Component rendering (SanctuaryGuard owns the gate UI)

The registry owns: what exists, what it requires, what state it is in.
Everything else is someone else's concern.
