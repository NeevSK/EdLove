# Gurudevi — Your Guide
> June 2026 — updated with citizenship rename and registry model
> Not for agents. For you — what to hold, what to watch, what to question.

---

## The Shape to Hold

Three gates. One function. One guard. One registry.

```
citizenship → entitlement → Cedar → feature flag
```

That order is the architecture. If you ever see permission logic
that doesn't fit this sequence — something checking pricing inside
Cedar, something checking role inside feature flags, something
checking citizenship inside the entitlement port — that's drift.
Name it immediately.

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
                   (was WANDERER — fully renamed, WANDERER is gone)
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

ZenStack schema.zmodel is the SSOT for the citizenship enum.
WANDERER must be renamed to THIRD_CLASS there.
ZenStack generates Supabase migrations from zmodel.
Do not write a manual migration for this.

---

## The Registry Model

Every domain/tab in the app is defined once as a DomainEntry.
Each domain package owns its registry file. The AppCatalog
assembles them all at boot. Nothing evaluates access inline —
everything goes through useDomainFeature(id).

```
selfRegistry.ts        → self tab domains
classroomRegistry.ts   → workspace tab domains
communityRegistry.ts   → community tab domains
libraryRegistry.ts     → library tab domains
adminRegistry.ts       → admin/principal domains

AppCatalog             → assembled once at boot
useDomainFeature(id)   → reads entry + evaluates through gates
useFeatureRegistry(tab)→ all domains for a tab, gated
SanctuaryGuard         → renders based on result
```

The registry declares requirements. The gates evaluate them.
Never put gate logic inside a registry file.

When you add a new domain:
1. Add its entry to the relevant registry file
2. Add it to registerAppCatalog.ts
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

## Honest State of the Codebase — June 2026

The docs describe the target. The old code is still running.
Nothing has been papered over but nothing has been replaced yet.

```
DESIGNED — docs exist, not yet implemented:
  sanctuaryFeature.ts
  useSanctuaryFeature.ts
  SanctuaryGuard.tsx
  citizenship.ts
  domainEntry.ts
  appCatalog.ts
  useDomainFeature.ts
  registerAppCatalog.ts

PARTIALLY DONE:
  PowerSyncProvider.tsx     singleton fixed, web factory added
  database.ts               singleton leak fixed
  package.json              @powersync/web added, postinstall added

OLD ERA — still exists, runs fine, will be replaced:
  feature-registry.schema.ts
  permissionsMap in usePermissionStore
  CASL Actions/SubjectType in abilities/base.ts
  isPro in feature-engine.ts
  FeatureGuard (hybrid)
  CapabilityGuard
  CitizenGate
  useFeatureRegistry (old internal logic)
  useSanctuaryRegistry (old logic)
  selfRegistry.ts (old shape, wrong numbering)
  classroomRegistry.ts (old shape)
  communityRegistry.ts (old shape)
  WANDERER in codebase and zmodel
```

Risk: any agent reading the codebase without the docs will
see the old code and assume it is the intended design.
Always give agents the execution guides before they touch
permissions or registry. Never let them work from code alone.

---

## Warning Signs to Watch For in Agent Output

Pricing tier inside Cedar policies:
  when { context.subscription_tier == "PRO" }  RED FLAG

isPro or isProMember anywhere:
  { isPro: true }  RED FLAG
  resolveFeatureFlags({ pricing_tier: 'PRO' })  RED FLAG

WANDERER anywhere:
  CitizenshipLevel.WANDERER  RED FLAG
  citizenship === 'WANDERER'  RED FLAG

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

gurudevi-architecture-draft-1.md
  12 ADRs + solution spec. The why behind every decision.

gurudevi-data-state-lifecycle.md
  How data moves. Tool ownership map. Trigger map. Decision rule.

gurudevi-sanctuary-permission-architecture.md
  Three-gate permission system. SanctuaryFeature. Port interfaces.

gurudevi-powersync-web-plan.md
  Web integration. Platform factory. VFS matrix. Known risks.

gurudevi-registry-architecture.md
  Unified domain registry. DomainEntry. AppCatalog. Citizenship model.

gurudevi-sanctuary-agent-execution-guide.md
  Permission refactor steps for agent.
  Give with: permission architecture + lifecycle docs.

gurudevi-registry-agent-execution-guide.md
  Registry + citizenship refactor steps for agent.
  Give with: registry architecture + permission architecture.

gurudevi-sanctuary-your-guide.md  (this file)
  Your mental model. Warning signs. Deferred decisions.

---

## The Two Questions to Ask When Something Feels Wrong

"Which gate does this belong to, and is it in the right place?"
Citizenship, entitlement, Cedar, or feature flag. One of four.

"Is this gate logic or requirement declaration?"
Gate logic belongs in ports and useSanctuaryFeature.
Requirement declaration belongs in registry entries.
Gate logic in a registry file is always wrong.
