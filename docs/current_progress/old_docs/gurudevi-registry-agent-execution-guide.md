# Gurudevi — Unified Domain Registry & Citizenship Refactor: Agent Execution Guide
> Draft 1 — June 2026
> Read before starting:
>   gurudevi-sanctuary-permission-architecture.md
>   gurudevi-sanctuary-agent-execution-guide.md
>   gurudevi-data-state-lifecycle.md

---

## 0. Mental Model — Read This First

This refactor has two connected parts:

**Part A — Citizenship rename and number model.**
WANDERER is gone. It is now THIRD_CLASS. The numbering is:
- FIRST_CLASS  = 1  (highest access — in a school)
- SECOND_CLASS = 2  (middle — signed up, personal use)
- THIRD_CLASS  = 3  (lowest access — guest, anonymous)

Lower number = more access. The comparison is wrapped in
`meetsCitizenship(user, required)` which evaluates
`user.citizenship <= required`. Nobody writes this comparison
inline — ever. Always call the function.

**Part B — Unified domain registry.**
Every domain/tab in the app is defined once as a `DomainEntry`.
Each domain package keeps its own registry file but all entries
conform to the canonical `DomainEntry` type. One boot-time
call assembles all registries into a single `AppCatalog`.
Everything that needs to know about a domain reads from the
catalog. Nothing evaluates access inline — it calls
`useDomainFeature(id)` which routes through `useSanctuaryFeature`.

**What the old code was doing (do not replicate):**
- `feature-registry.schema.ts` used `CORE | PRO | EXPERIMENTAL`
  kinds and `CITIZENSHIP_REQUIRED | PAYMENT_REQUIRED | GLOBAL_OFF`
  lock reasons. These collapse the three gates into flat enums.
  This is the old mental model. Delete it entirely.
- `useFeatureRegistry.ts` checked `isPro`, `citizenship >= N`,
  and `can()` inline. These evaluations now live in
  `useSanctuaryFeature`. Delete the internal logic.
- `citizenshipRequired: 0` in existing registries used 0-based
  numbering. The new model uses 1|2|3. Update every registry entry.
- `capabilityKey: 'TeacherDashboard'` (string) is the old CASL
  vocabulary. Replace with `capabilityRequirement: { action, subject }`.
- WANDERER anywhere in the codebase becomes THIRD_CLASS.

**The three gates are not in the registry.**
The registry declares *requirements*. The gates evaluate them.
Never put gate logic inside a registry file.

---

## 1. Pre-Flight — Blast Radius Search

Run these before touching any file. Record every result.

```bash
# Find WANDERER references
grep -r "WANDERER\|wanderer" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules -l

# Find old citizenship numbers (0, 1, 2 in citizenshipRequired context)
grep -r "citizenshipRequired" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules -n

# Find capabilityKey (old CASL string pattern)
grep -r "capabilityKey" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules -n

# Find isPro / isProMember in registry files
grep -r "isPro\|isProMember\|traitRequirement" \
  --include="*.ts" --include="*.tsx" --exclude-dir=node_modules -n

# Find imports of feature-registry.schema.ts
grep -r "feature-registry.schema\|FeatureKindSchema\|FeatureStateSchema\|DomainRegistrySchema" \
  --include="*.ts" --include="*.tsx" --exclude-dir=node_modules -n

# Find all registry files to update
grep -r "citizenshipRequired: 0\|citizenshipRequired: 1\|citizenshipRequired: 2" \
  --include="*.ts" --include="*.tsx" --exclude-dir=node_modules -n
```

Record all output. This is your completion checklist.

---

## 2. Step 1 — Create Citizenship Model

**New file:**
`packages/core/src/logic/registry/citizenship.ts`

```typescript
/**
 * Citizenship model — registration depth, not pricing.
 *
 * FIRST_CLASS  = 1  Highest access. In a school. Intended primary user.
 * SECOND_CLASS = 2  Signed up. Personal use. Not yet in a school.
 * THIRD_CLASS  = 3  Lowest access. Guest / anonymous session.
 *
 * Lower number = more access.
 * Never write the comparison inline — always call meetsCitizenship().
 */

export const CITIZENSHIP = {
  FIRST_CLASS:  1,
  SECOND_CLASS: 2,
  THIRD_CLASS:  3,
} as const

export type CitizenshipLevel = typeof CITIZENSHIP[keyof typeof CITIZENSHIP]
// resolves to: 1 | 2 | 3

export type CitizenshipName = keyof typeof CITIZENSHIP
// resolves to: 'FIRST_CLASS' | 'SECOND_CLASS' | 'THIRD_CLASS'

/**
 * meetsCitizenship — the only place the comparison is written.
 *
 * Returns true if the user's citizenship level is sufficient
 * for the required level.
 *
 * Examples:
 *   meetsCitizenship(1, 1) → true   (First Class meets First Class req)
 *   meetsCitizenship(2, 1) → false  (Second Class does not meet First Class req)
 *   meetsCitizenship(3, 3) → true   (Third Class meets Third Class req)
 *   meetsCitizenship(1, 3) → true   (First Class meets any requirement)
 */
export function meetsCitizenship(
  userCitizenship: CitizenshipLevel,
  required: CitizenshipLevel,
): boolean {
  return userCitizenship <= required
}

/**
 * citizenshipName — readable name for display and logging.
 */
export function citizenshipName(level: CitizenshipLevel): CitizenshipName {
  const entry = Object.entries(CITIZENSHIP).find(([, v]) => v === level)
  if (!entry) throw new Error(`Unknown citizenship level: ${level}`)
  return entry[0] as CitizenshipName
}
```

---

## 3. Step 2 — Create Canonical DomainEntry Type

**Delete:**
`packages/core/src/logic/schemas/feature-registry.schema.ts`

Delete the file entirely. Do not keep any of its types.
It will cause TSC failures — that is expected and intended.
Record all failures for Step 6.

**New file:**
`packages/core/src/logic/registry/domainEntry.ts`

```typescript
import { z } from 'zod'
import { CITIZENSHIP } from './citizenship'

/**
 * DomainEntry — the canonical definition of one domain/tab/surface
 * in the Gurudevi app.
 *
 * Each domain package defines its own entries conforming to this type.
 * The AppCatalog assembles them all at boot.
 *
 * Rules:
 * - Never put gate logic here. Declare requirements only.
 * - Never check isPro, pricing_tier, or capacity here.
 * - Never import from ports or store here. Pure data.
 */

export const FeatureStateSchema = z.enum([
  'development',   // not shipped to any user
  'beta',          // early access, opt-in rollout
  'live',          // fully shipped and stable
  'deprecated',    // being phased out
])

export const CitizenshipLevelSchema = z.union([
  z.literal(CITIZENSHIP.FIRST_CLASS),
  z.literal(CITIZENSHIP.SECOND_CLASS),
  z.literal(CITIZENSHIP.THIRD_CLASS),
])

export const TabDomainSchema = z.enum([
  'self',
  'workspace',
  'community',
  'library',
  'profile',
])

export const DomainEntrySchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  ownerPackage: z.string(),

  // ── Platform support ──────────────────────────────────────────────
  mobileSupport: z.boolean(),
  webSupport: z.boolean(),

  // ── Deployment state ──────────────────────────────────────────────
  // What IFeatureRolloutPort / GrowthBook reads.
  // 'development' domains are never shown to any user.
  // 'deprecated' domains are hidden and being removed.
  state: FeatureStateSchema,
  flagKey: z.string().optional(),

  // ── Gate requirements ─────────────────────────────────────────────
  // What useSanctuaryFeature evaluates.
  // Never put the evaluation logic here — only the requirements.
  citizenshipRequired: CitizenshipLevelSchema,
  capabilityRequirement: z.object({
    action: z.string(),
    subject: z.string(),
  }),
  entitlementModule: z.string().optional(),
  entitlementTier: z.enum(['FREE', 'PRO', 'INSTITUTIONAL']).optional(),

  // ── UI / routing ──────────────────────────────────────────────────
  tabDomain: TabDomainSchema,
  surfaceId: z.string(),
  defaultOrder: z.number(),

  // ── Analytics ─────────────────────────────────────────────────────
  // Scoped key for domain-level usage tracking.
  // Format: 'tabDomain.domainId' e.g. 'workspace.teacher_dashboard'
  analyticsKey: z.string(),
})

export type DomainEntry = z.infer<typeof DomainEntrySchema>
export type FeatureState = z.infer<typeof FeatureStateSchema>
export type TabDomain = z.infer<typeof TabDomainSchema>
```

---

## 4. Step 3 — Create AppCatalog

**New file:**
`packages/core/src/logic/registry/appCatalog.ts`

```typescript
import type { DomainEntry, TabDomain } from './domainEntry'

/**
 * AppCatalog — the single assembled registry of all domains.
 *
 * Rules:
 * - registerDomains() is called exactly once at app boot.
 * - All reads go through getAppCatalog() or getDomainEntry().
 * - Throws loudly if accessed before registration.
 * - Throws loudly if a requested domain does not exist.
 * - No silent failures.
 */

export type AppCatalog = Record<string, DomainEntry>

let _catalog: AppCatalog | null = null

export function registerDomains(entries: AppCatalog): void {
  if (_catalog !== null) {
    throw new Error(
      'AppCatalog: registerDomains() called more than once. ' +
      'Call it exactly once during boot before any screen renders.'
    )
  }
  _catalog = entries
}

export function getAppCatalog(): AppCatalog {
  if (_catalog === null) {
    throw new Error(
      'AppCatalog: getAppCatalog() called before registerDomains(). ' +
      'Ensure registerAppCatalog() runs during boot hydration step.'
    )
  }
  return _catalog
}

export function getDomainEntry(id: string): DomainEntry {
  const catalog = getAppCatalog()
  const entry = catalog[id]
  if (!entry) {
    throw new Error(
      `AppCatalog: domain entry not found: "${id}". ` +
      `Registered domains: ${Object.keys(catalog).join(', ')}`
    )
  }
  return entry
}

export function getDomainsByTab(tab: TabDomain): DomainEntry[] {
  return Object.values(getAppCatalog())
    .filter(entry => entry.tabDomain === tab)
    .sort((a, b) => a.defaultOrder - b.defaultOrder)
}

export function getAllDomains(): DomainEntry[] {
  return Object.values(getAppCatalog())
    .sort((a, b) => a.defaultOrder - b.defaultOrder)
}

// Reset for testing only — never call in app code
export function _resetCatalogForTesting(): void {
  _catalog = null
}
```

---

## 5. Step 4 — Create useDomainFeature Hook

**New file:**
`packages/core/src/logic/registry/useDomainFeature.ts`

```typescript
import { getDomainEntry } from './appCatalog'
import { useSanctuaryFeature } from '../permissions/hooks/useSanctuaryFeature'
import type { DomainEntry } from './domainEntry'
import type { SanctuaryFeatureResult } from '../permissions/sanctuaryFeature'

export interface DomainFeatureResult {
  entry: DomainEntry
  result: SanctuaryFeatureResult
}

/**
 * useDomainFeature — reads a domain entry from the AppCatalog
 * and evaluates it through useSanctuaryFeature.
 *
 * This is the primary way components and hooks determine whether
 * a domain is accessible to the current user.
 *
 * Never call useSanctuaryFeature directly with inline requirements
 * for a domain — always go through useDomainFeature so requirements
 * stay in sync with the registry.
 */
export function useDomainFeature(domainId: string): DomainFeatureResult {
  const entry = getDomainEntry(domainId)

  const result = useSanctuaryFeature(
    entry.capabilityRequirement.action,
    entry.capabilityRequirement.subject,
    {
      citizenshipRequired: entry.citizenshipRequired,
      entitlementModule: entry.entitlementModule,
      entitlementTier: entry.entitlementTier,
      flagKey: entry.flagKey,
    },
  )

  return { entry, result }
}

/**
 * useDomainFeatures — evaluate multiple domains at once.
 * Useful for tab bars that need to know which tabs to show.
 */
export function useDomainFeatures(
  domainIds: string[]
): Record<string, DomainFeatureResult> {
  return Object.fromEntries(
    domainIds.map(id => [id, useDomainFeature(id)])
  )
}
```

---

## 6. Step 5 — Update All Domain Registry Files

For each registry file, update every entry to conform to `DomainEntry`.
The changes per entry are:

```
citizenshipRequired: 0  → 3  (THIRD_CLASS — open to all)
citizenshipRequired: 1  → 2  (SECOND_CLASS) or 3 depending on intent
citizenshipRequired: 2  → 1  (FIRST_CLASS — school required)
capabilityKey: 'Foo'    → capabilityRequirement: { action: 'read', subject: 'Foo' }
isPro: true             → entitlementModule: 'module_name'
traitRequirement: '...' → remove (Cedar handles this via capabilityRequirement)
workspaceId: '...'      → remove (replaced by tabDomain + surfaceId)
```

Add these fields to every entry:
```
state: 'live' | 'beta' | 'development' | 'deprecated'
analyticsKey: 'tabDomain.domainId'
flagKey: optional GrowthBook flag key
tabDomain: 'self' | 'workspace' | 'community' | 'library' | 'profile'
```

**Files to update:**

```
packages/self/src/constants/selfRegistry.ts
packages/classroom/src/constants/classroomRegistry.ts
packages/community/src/constants/communityRegistry.ts
packages/library/src/constants/libraryRegistry.ts
packages/admin/src/constants/adminRegistry.ts
```

**Example — classroom entry after update:**

```typescript
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry'
import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship'

export const CLASSROOM_REGISTRY: Record<string, DomainEntry> = {
  teacher_dashboard: {
    id: 'teacher_dashboard',
    label: 'Teacher Studio',
    description: 'Daily classroom authorship and student engagement',
    ownerPackage: 'classroom',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    flagKey: 'teacher-dashboard',
    citizenshipRequired: CITIZENSHIP.FIRST_CLASS,  // must be in a school
    capabilityRequirement: {
      action: 'read',
      subject: 'TeacherDashboard',
    },
    entitlementModule: undefined,
    tabDomain: 'workspace',
    surfaceId: 'teacher',
    defaultOrder: 40,
    analyticsKey: 'workspace.teacher_dashboard',
  },
}
```

Always use `CITIZENSHIP.FIRST_CLASS` etc — never the raw number.
This makes intent readable without needing to remember the mapping.

---

## 7. Step 6 — Create Boot Registration

**New file:**
`apps/gurudevi-mobile/src/boot/registerAppCatalog.ts`

```typescript
import { registerDomains } from '@repo/core/logic/registry/appCatalog'
import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry'
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry'
import { COMMUNITY_REGISTRY } from '@repo/community/constants/communityRegistry'
import { LIBRARY_REGISTRY } from '@repo/library/constants/libraryRegistry'
import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry'

/**
 * registerAppCatalog — assembles all domain registries into
 * the AppCatalog singleton.
 *
 * Call this once during boot hydration BEFORE any screen renders.
 * See: gurudevi-data-state-lifecycle.md boot sequence step 9.
 *
 * Adding a new domain package:
 * 1. Create its registry file conforming to DomainEntry
 * 2. Import and spread it here
 * 3. Done — the catalog picks it up automatically
 */
export function registerAppCatalog(): void {
  registerDomains({
    ...SELF_REGISTRY,
    ...CLASSROOM_REGISTRY,
    ...COMMUNITY_REGISTRY,
    ...LIBRARY_REGISTRY,
    ...ADMIN_REGISTRY,
  })
}
```

Wire into boot sequence in `app/index.tsx` or equivalent boot entry:

```typescript
import { registerAppCatalog } from '../src/boot/registerAppCatalog'

// Call before PowerSync boot and before any screen renders
registerAppCatalog()
```

---

## 8. Step 7 — Update useFeatureRegistry

**Target file:**
`packages/core/src/hooks/useFeatureRegistry.ts`

Remove all internal evaluation logic (isPro checks, citizenship
comparisons, capability array checks). Replace with calls to
`useDomainFeature`.

```typescript
import { useDomainFeature } from '../logic/registry/useDomainFeature'
import { getDomainsByTab } from '../logic/registry/appCatalog'
import type { TabDomain } from '../logic/registry/domainEntry'
import type { SanctuaryFeatureResult } from '../logic/permissions/sanctuaryFeature'
import type { DomainEntry } from '../logic/registry/domainEntry'

export interface FeatureGatingResult {
  entry: DomainEntry
  visible: boolean
  locked: boolean
  reason?: SanctuaryFeatureResult extends { reason: infer R } ? R : never
  upgradeTarget?: {
    citizenship?: number
    tier?: 'FREE' | 'PRO' | 'INSTITUTIONAL'
  }
}

export function useFeatureRegistry(
  tab: TabDomain
): Record<string, FeatureGatingResult> {
  const entries = getDomainsByTab(tab)

  return Object.fromEntries(
    entries.map(entry => {
      const { result } = useDomainFeature(entry.id)

      const gatingResult: FeatureGatingResult = {
        entry,
        visible: entry.state !== 'development' && entry.state !== 'deprecated',
        locked: !result.permitted,
        reason: result.permitted ? undefined : result.reason,
        upgradeTarget: resolveUpgradeTarget(result),
      }

      return [entry.id, gatingResult]
    })
  )
}

function resolveUpgradeTarget(
  result: SanctuaryFeatureResult
): FeatureGatingResult['upgradeTarget'] {
  if (!result.permitted) {
    if (result.reason === 'citizenship') return { citizenship: result.required }
    if (result.reason === 'entitlement') return { tier: result.required }
  }
  return undefined
}
```

---

## 9. Step 8 — Update useSanctuaryRegistry

**Target file:**
`packages/self/src/hooks/useSanctuaryRegistry.ts`

This currently only handles self domains and has its own
evaluation logic. Replace with `useFeatureRegistry('self')`.

```typescript
import { useFeatureRegistry } from '@repo/core/hooks/useFeatureRegistry'

/**
 * useSanctuaryRegistry — feature gating for the Self tab domains.
 * Thin wrapper over useFeatureRegistry scoped to 'self'.
 */
export function useSanctuaryRegistry() {
  return useFeatureRegistry('self')
}
```

---

## 10. Step 9 — Update WANDERER References

Search results from pre-flight will have found all WANDERER
references. For each:

```typescript
// Before:
citizenship === 'WANDERER'
user.citizenship === CitizenshipLevel.WANDERER
CitizenshipLevel.WANDERER
'WANDERER'

// After:
citizenship === CITIZENSHIP.THIRD_CLASS
user.citizenship === CITIZENSHIP.THIRD_CLASS  
CITIZENSHIP.THIRD_CLASS
'THIRD_CLASS'
```

Also update the database enum if WANDERER exists in Supabase:
Check migration files and schema.zmodel for citizenship enum
values. If found, create a new migration renaming WANDERER to
THIRD_CLASS in the database enum. Do not do this silently —
report it as a required migration step.

---

## 11. Step 10 — Fix TSC Failures from Step 2 Deletion

After deleting `feature-registry.schema.ts`, TSC will report
errors for every import of the old types. For each failure:

```typescript
// Old import — will fail:
import { FeatureKindSchema, FeatureStateSchema, DomainRegistrySchema }
  from '@repo/core/logic/schemas/feature-registry.schema'

// Replace with new import:
import { DomainEntrySchema, FeatureStateSchema }
  from '@repo/core/logic/registry/domainEntry'

// Note: FeatureKind (CORE|PRO|EXPERIMENTAL) has no replacement.
// It was doing entitlement work. Remove usage entirely.
// FeatureState (is_enabled, is_locked etc) has no replacement.
// That was gate evaluation. Remove usage entirely.
```

---

## 12. Completion Checklist

Before marking this refactor done:

- [ ] `citizenship.ts` created with FIRST_CLASS=1, SECOND_CLASS=2, THIRD_CLASS=3
- [ ] `meetsCitizenship()` is the only place `<=` comparison is written
- [ ] `feature-registry.schema.ts` deleted — zero imports remain
- [ ] `domainEntry.ts` created — all registries import from it
- [ ] `appCatalog.ts` created — throws on unregistered access
- [ ] `useDomainFeature.ts` created — routes through useSanctuaryFeature
- [ ] `registerAppCatalog.ts` created — called at boot before screens render
- [ ] All five domain registry files updated to DomainEntry shape
- [ ] citizenshipRequired uses CITIZENSHIP.FIRST_CLASS etc — never raw numbers
- [ ] capabilityKey replaced by capabilityRequirement everywhere
- [ ] isPro / traitRequirement removed from all registry entries
- [ ] WANDERER replaced by THIRD_CLASS everywhere including DB enum
- [ ] useFeatureRegistry updated — no internal gate logic
- [ ] useSanctuaryRegistry updated — delegates to useFeatureRegistry
- [ ] TSC: zero errors
- [ ] adminRegistry entries updated and AdminFeatureRegistry.tsx reads from catalog
- [ ] registerAppCatalog called in boot sequence before any screen renders

---

## 13. What Does NOT Change

These files and systems are not touched in this refactor:

```
useSanctuaryFeature.ts      → untouched, registry feeds into it
SanctuaryGuard.tsx          → untouched
IEntitlementPort            → untouched
IAuthzPort / Cedar          → untouched
IFeatureRolloutPort         → untouched
PowerSync / database.ts     → untouched
SovereignBus Zustand slice  → untouched
Zone A/B/C schema           → untouched
```

The registry system is additive infrastructure that connects
to the permission system. It does not replace any port or gate.

---

*Give this doc to the agent along with:*
*- gurudevi-sanctuary-permission-architecture.md (gate model)*
*- gurudevi-sanctuary-agent-execution-guide.md (permission refactor steps)*
*- gurudevi-data-state-lifecycle.md (boot sequence for registration step)*
