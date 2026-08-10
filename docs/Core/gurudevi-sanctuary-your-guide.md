---
title: "Gurudevi — Your Guide"
status: "active"
created: 2026-06-01
updated: 2026-08-11
author: "Naveen"
tags: [gurudevi, permissions, mental-model]
---

# Gurudevi — Your Guide
> August 2026 — updated gate order (Cedar before entitlement) and current state
> Not for agents. For you — what to hold, what to watch, what to question.

---

## The Shape to Hold

One function. One guard. One registry. Four gates.

```
citizenship → Cedar → entitlement → feature flag
```

That order is the architecture. If you ever see permission logic
that doesn't fit this sequence — something checking pricing inside
Cedar, something checking role inside feature flags, something
checking citizenship inside the entitlement port — that's drift.
Name it immediately.

Cedar is the authoritative security boundary. It evaluates **before**
entitlement so a Cedar denial never leaks commercial failure reasons,
and entitlement never grants authorization. (ADR-005)

The four axes are independent. A feature can be:
- beta: true AND require PRO entitlement
- Available to THIRD_CLASS AND require a Cedar structural check
- Require FIRST_CLASS citizenship AND be in development state

They never imply each other. When something feels tangled,
ask: which axis does this belong to?

---

## The Citizenship Model — Hold This Precisely

```
FIRST_CLASS  = 1   Highest access. In a school. Intended primary user.
SECOND_CLASS = 2   Signed up. Personal use. Not yet in a school.
THIRD_CLASS  = 3   Lowest access. Guest / anonymous session.
                   (was WANDERER — renamed; WANDERER only survives as a
                    legacy alias normalized to THIRD_CLASS at read time)
```

Lower number = more access.
Higher number = more open (fewer requirements).

The comparison is ALWAYS through meetsCitizenship(user, required).
Never write <= or >= inline anywhere. The function is the only
place the comparison operator exists.

```typescript
meetsCitizenship(1, 1) → true   // First Class meets First Class req
meetsCitizenship(2, 1) → false  // Second Class cannot meet First Class req
meetsCitizenship(3, 3) → true   // Third Class meets Third Class req
meetsCitizenship(1, 3) → true   // First Class meets any requirement
```

Always use CITIZENSHIP.FIRST_CLASS etc in code — never raw numbers.

Citizenship is NOT pricing. Independent axes.

The citizenship → prompt mapping for UI:
- THIRD_CLASS failing → "Create an account" (SignupPrompt)
- SECOND_CLASS failing → "Join a school" (SchoolJoinPrompt)
- Never show an upgrade/pricing prompt for citizenship failure.

ZenStack schema.zmodel is the SSOT for citizenship values:
`THIRD_CLASS` (default), `SECOND_CLASS`, `FIRST_CLASS`; `WANDERER`
survives only as a legacy data alias. New data and code must use
`THIRD_CLASS`. Do not write a manual migration for this — ZenStack
generates Supabase migrations from zmodel.

---

## The Registry Model

Every domain/tab in the app is defined once as a DomainEntry.
Each domain package owns its registry file. The AppCatalog
assembles them all at boot. Nothing evaluates access inline —
everything goes through useDomainFeature(id).

```
appCatalog.ts         → assembled once at boot, sources the tab registries
domainEntry.ts        → DomainEntry type (requirements, not logic)
citizenship.ts        → CitizenshipLevel + meetsCitizenship (only comparison)
featureLifecycleManifest.ts → feature lifecycle + flag resolution
featureLifecyclePolicy.ts   → lifecycle state transitions
useDomainFeature(id)  → reads entry + evaluates through gates
useFeatureRegistry(tab)→ all domains for a tab, gated
SanctuaryGuard        → renders based on result
```

The registry declares requirements. The gates evaluate them.
Never put gate logic inside a registry file.

When you add a new domain:
1. Add its entry to the relevant registry source
2. Add it to the AppCatalog (registerAppCatalog.ts at boot)
3. Done — everything else picks it up automatically

---

## What SanctuaryFeature Does

```
sanctuaryFeature()       pure function, testable, no React
useSanctuaryFeature()    hook, reads Zustand + Cedar snapshot
useDomainFeature(id)     reads registry entry + calls useSanctuaryFeature
can()                    boolean shorthand, calls useSanctuaryFeature
SanctuaryGuard           component, renders by reason
```

One entry point for all permission questions in the UI.

---

## Honest State of the Codebase — August 2026

The refactor is shipped. The gates, registry, and hooks below are
live code — not design docs.

```
SHIPPED — implemented, tested, live:
  citizenship.ts               → CitizenshipLevel + meetsCitizenship
  domainEntry.ts               → DomainEntry type
  appCatalog.ts                → AppCatalog assembly
  featureLifecycleManifest.ts  → lifecycle + flag resolution
  featureLifecyclePolicy.ts    → lifecycle transitions
  useDomainFeature.ts          → registry + gate evaluation hook
  sanctuaryFeature.ts          → pure gate evaluator (no React)
  useSanctuaryFeature.ts       → hook, reads Zustand + Cedar snapshot
  SanctuaryGuard.tsx           → packages/ui/src/components/
  registerAppCatalog.ts        → apps/gurudevi-mobile/src/boot/
  useFeatureRegistry.ts        → modernized, delegates to sanctuaryFeature
```

```
DELETED — old era, removed:
  abilities/base.ts            → CASL shim
  FeatureGuard / CapabilityGuard / CitizenGate
  feature-engine.ts            → isPro era
  useSanctuaryRegistry / selfRegistry old shapes
  per-tab registries (self/classroom/community/library/admin)
    → consolidated into AppCatalog at boot
```

WANDERER survives in ~16 code spots as a legacy alias that maps to
THIRD_CLASS at read time (schema comment, hook mappers). It is not
a first-class value. New code and new data must use THIRD_CLASS.

Risk: an agent reading the codebase without the docs may still find
a stray WANDERER alias or an old hook and mistake it for intended
design. The guides in docs/Core are current; the execution guides
are archived in docs/current_progress/old_docs/ as historical.

---

## Warning Signs to Watch For in Agent Output

Pricing tier inside Cedar policies:
  when { context.subscription_tier == "PRO" }  RED FLAG

isPro or isProMember anywhere:
  { isPro: true }  RED FLAG
  resolveFeatureFlags({ pricing_tier: 'PRO' })  RED FLAG

WANDERER as a first-class value:
  citizenship === 'WANDERER'  RED FLAG (legacy alias only — normalize to THIRD_CLASS)
  CitizenLevel.WANDERER       RED FLAG (type does not exist)

New code introducing WANDERER:
  addCitizenship('WANDERER')  RED FLAG (new data must be THIRD_CLASS)

Raw citizenship numbers:
  citizenshipRequired: 1  RED FLAG (use CITIZENSHIP.FIRST_CLASS)

Inline citizenship comparison:
  user.citizenship <= feature.citizenshipRequired  RED FLAG
  (belongs only in meetsCitizenship())

permissionsMap anywhere:
  permissionsMap[subject][action]  RED FLAG (deleted CASL shim)

Silent false on initialization:
  if (!permissionsMap) return false  RED FLAG
  (should be not_initialized reason, never silent)

Gate logic inside registry files:
  if (user.isPro) inside any *Registry.ts  RED FLAG
  can(action, subject) inside any *Registry.ts  RED FLAG

Old FeatureKind vocabulary:
  FeatureKind.CORE / PRO / EXPERIMENTAL  RED FLAG
  (replaced by state: 'live' | 'beta' | 'development' | 'deprecated')

Old DomainFeature type:
  import type { DomainFeature } from '@repo/core/types'  RED FLAG
  (replaced by DomainEntry from @repo/core/logic/registry/domainEntry)

---

## What Is Intentionally Deferred

Route-level guards in Expo Router — component-level is fine now.
can() call site migration — migrate incrementally when reason is needed.
GrowthBook full integration — flagKey fields are ready in registry.
Zone table assignment in PowerSync — decide when data model is clear.
Encryption on web — verify ChaCha20 before any real data.
Per-resource Cedar evaluation in UI — capability tokens handle write path.

---

## The Document Set

Current living docs:

- apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md
  The living authority for feature lifecycle + gates. Read first.
- apps/gurudevi-mobile/docs/architecture/identity-app-device-lifecycle.md
  Identity / citizenship / device / account lifecycle.
- apps/gurudevi-mobile/docs/decisions/005-feature-gate-order-and-context-ownership.md
  The gate order: citizenship → Cedar → entitlement → lifecycle/flag.
- docs/architecture/gurudevi-data-state-lifecycle.md
  How data moves. Tool ownership map. Trigger map. (See correction note.)
- docs/architecture/2026-07-24-permission-refactor-review-report.md
  Review of the shipped refactor.

Historical (superseded / archived, do not use as authority):

- docs/architecture/gurudevi-sanctuary-permission-architecture.md (superseded)
- docs/architecture/gurudevi-architecture-draft-1.md (June draft; ADR-009 superseded)
- docs/current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md (archived)
- docs/current_progress/old_docs/gurudevi-registry-agent-execution-guide.md (archived)

Your guide: this file.

---

## The Two Questions to Ask When Something Feels Wrong

"Which gate does this belong to, and is it in the right place?"
Citizenship, entitlement, Cedar, or feature flag. One of four.

"Is this gate logic or requirement declaration?"
Gate logic belongs in ports and useSanctuaryFeature.
Requirement declaration belongs in registry entries.
Gate logic in a registry file is always wrong.
