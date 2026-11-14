---
title: "Role-Journey Contracts & Sovereign Feature Catalog: End-to-End Implementation Record"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Naveen"
scribe: "Antigravity"
tags: [role-journey, feature-catalog, workspace, onboarding, verification, architecture]
---

# Role-Journey Contracts & Sovereign Feature Catalog: End-to-End Implementation Record

> **Executive Summary:**  
> This document records the architectural specification and end-to-end implementation of the Role-Journey Contracts and Sovereign Feature Catalog across the Polymath monorepo. It establishes strict role-based capability boundaries, time-phased user onboarding (Day 0 $\rightarrow$ Day 1 $\rightarrow$ Day N), mascot guidance via Tutii (`FireflyMascot`), automatic scaffold dismissal via reactive storage hooks, and monorepo-wide verification across all domain packages.

---

## 1. Problem Context & Architectural Intent

Prior to this implementation:
1. **Role Leakage on Unlinked Workspaces**: On unlinked or Day 0 states, students saw teacher authoring options (e.g. "+ New Classroom" modal) instead of an invitation-claiming flow.
2. **Missing Time-Phased Guidance**: Users lacked explicit onboarding scaffolding that guides first-time setup (Day 0) and smoothly fades away once initial setup completes, leaving clean operational views for daily use (Day 1+).
3. **Implicit Catalog Assumptions**: Feature catalogs lacked formal role persona mappings, screen sequences, and sensory feedback profiles, risking ad-hoc UI divergences across native mobile (`apps/gurudevi-mobile`) and browser web (`apps/gurudevi-web`).

---

## 2. Implemented Architecture & Domain Changes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              @repo/core                                     │
│  - WorkspaceRolePersona ('principal' | 'guardian' | 'teacher' | 'student')  │
│  - FeatureLifecycleStage ('day0_scaffold' | 'day1_operational' | ...)       │
│  - FeatureJourneySpec & FeatureJourneySchema (Zod v4 with z.iso.date)       │
│  - useScaffoldDismissal(key, threshold) backed by IStorage                  │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
                        ▼                             ▼
┌───────────────────────────────────┐   ┌─────────────────────────────────────┐
│          @repo/classroom          │   │             @repo/admin             │
│ - StudentClassroomList: Day 0     │   │ - PrincipalDashboard: Scaffold      │
│   claim flow + Tutii guide mascot │   │   auto-dismisses on first school    │
│ - StudentOnboardingView (native   │   │ - GuardianStudentsScreen: Scaffold  │
│   & web): Glowing guide mascot    │   │   auto-dismisses on first linked    │
│ - ClassroomList: Role-partitioned │   │ - SchoolCreationScreen: Mascot      │
│   demo & real classroom retrieval │   │   mode="glowing" state="complete"   │
└───────────────────────────────────┘   └─────────────────────────────────────┘
                        │                             │
                        ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       @repo/ui & Apps Performance                           │
│ - Pressable: React 19 standard ref prop (React.forwardRef eliminated)       │
│ - SanctuaryFlashList: Migrated TabFeatureCatalogSheet & NotificationsScreen │
│ - AppSettingsScreen.shared: Extracted ChoiceChipRow preserving generic types│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Core Contracts & Schemas (`@repo/core`)
- **File:** [`packages/core/src/types/Workspace.ts`](file:///c:/x/packages/core/src/types/Workspace.ts)
  - `WorkspaceRolePersona`: Union of `'principal' | 'guardian' | 'teacher' | 'student' | 'founder' | 'admin' | 'guest'`.
  - `FeatureLifecycleStage`: `'day0_scaffold' | 'day1_operational' | 'advanced_specialist' | 'dormant' | 'deprecated'`.
  - `ScreenSequenceStep`: Encapsulates route, role, step title, mascot guidance prompt, and completion criteria.
  - `SensoryFeedbackProfile`: Audio-haptic orchestration profiles (`'subtle_snap' | 'affirmation_ripple' | 'alert_pulse' | 'silent'`).
  - `FeatureJourneySpec`: Complete journey specification mapping persona, lifecycle stage, sequence, and sensory feedback.
- **File:** [`packages/core/src/logic/registry/domainEntry.ts`](file:///c:/x/packages/core/src/logic/registry/domainEntry.ts)
  - Added `FeatureJourneySchema` to validate domain manifest additions.
  - Replaced deprecated `z.string().date()` calls with Zod v4 canonical `z.iso.date()` to conform to `reports/live-deprecations.json`.
- **File:** [`packages/core/src/hooks/useScaffoldDismissal.ts`](file:///c:/x/packages/core/src/hooks/useScaffoldDismissal.ts)
  - Provides reactive dismissal state: `isDismissed`, `dismiss()`, `reset()`, and `incrementAction()`.
  - Uses `StorageManager` proxy with fallback in-memory cache, enabling zero-native pollution on web and native.

### 2.2 Classroom Domain & Student Experience (`@repo/classroom`)
- **File:** [`packages/classroom/src/components/student/StudentClassroomList.tsx`](file:///c:/x/packages/classroom/src/components/student/StudentClassroomList.tsx)
  - Segregated student Day 0 experience from teacher authoring flows.
  - Rendered `FireflyMascot` with `mode="glowing"` and `role="guide"`.
  - Added `[ Enter Invitation Code ]` action opening `ClaimInviteModal`.
- **Files:** [`packages/classroom/src/components/onboarding/StudentOnboardingView.tsx`](file:///c:/x/packages/classroom/src/components/onboarding/StudentOnboardingView.tsx) & [`.web.tsx`](file:///c:/x/packages/classroom/src/components/onboarding/StudentOnboardingView.web.tsx)
  - Standardized mascot presence in welcome headers across native and web.
- **File:** [`packages/classroom/src/components/ClassroomList.tsx`](file:///c:/x/packages/classroom/src/components/ClassroomList.tsx)
  - Segregated sample classroom visibility based on capabilities (`can('manage', 'PrincipalDashboard')` vs `can('manage', 'TeacherDashboard')` vs `can('manage', 'StudentDashboard')`).
  - Safely guarded `dismissedSampleIds` against `undefined` via null-coalescing arrays.
- **File:** [`packages/classroom/src/screens/AttendanceScreen.tsx`](file:///c:/x/packages/classroom/src/screens/AttendanceScreen.tsx)
  - Aligned `useTenantStore` import to `@repo/core/store` barrel export for composite reference resolution.

### 2.3 Institutional Administration (`@repo/admin`)
- **File:** [`packages/admin/src/screens/PrincipalDashboard.tsx`](file:///c:/x/packages/admin/src/screens/PrincipalDashboard.tsx)
  - Integrated `useScaffoldDismissal('principal_first_school_scaffold', 1)`.
  - Automatically dismisses the initial setup banner when the principal establishes their first school.
- **File:** [`packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx`](file:///c:/x/packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx)
  - Integrated `useScaffoldDismissal('guardian_first_link_scaffold', 1)`.
  - Auto-dismisses the onboarding banner once the guardian links at least one student (`students.length > 0`).
- **File:** [`packages/admin/src/screens/SchoolCreationScreen.tsx`](file:///c:/x/packages/admin/src/screens/SchoolCreationScreen.tsx)
  - Aligned Tutii mascot props to `mode="glowing" state="complete" role="guide"`.
- **File:** [`packages/admin/src/__tests__/screens/DocumentListScreen.test.tsx`](file:///c:/x/packages/admin/src/__tests__/screens/DocumentListScreen.test.tsx)
  - Wrapped test renderer in `QueryClientProvider` and hoisted referentially stable `usePermissions` mocks to eliminate infinite re-render loops during unit testing.

### 2.4 Native Performance & React 19 Hardening (`@repo/ui`, `gurudevi-mobile`)
- **File:** [`packages/ui/src/components/ui/pressable/index.tsx`](file:///c:/x/packages/ui/src/components/ui/pressable/index.tsx)
  - Stripped deprecated `React.forwardRef` to comply with React 19 standard `ref` props.
- **File:** [`apps/gurudevi-mobile/src/components/navigation/TabFeatureCatalogSheet.tsx`](file:///c:/x/apps/gurudevi-mobile/src/components/navigation/TabFeatureCatalogSheet.tsx)
  - Replaced non-virtualized `<ScrollView>.map` with `SanctuaryFlashList` for optimal recycling and zero hermes thread stalls.
- **File:** [`packages/ui/src/screens/NotificationsScreen.tsx`](file:///c:/x/packages/ui/src/screens/NotificationsScreen.tsx)
  - Migrated notification feed from `<ScrollView>` to `SanctuaryFlashList` with native pull-to-refresh (`refreshing` and `onRefresh`).
- **File:** [`packages/ui/src/screens/AppSettingsScreen.shared.tsx`](file:///c:/x/packages/ui/src/screens/AppSettingsScreen.shared.tsx)
  - Extracted `ChoiceChipRow` and `SensoryOptionsSection` outside the render path, preserving generic `<T extends string>` TypeScript inference and satisfying the AST slop scanner.

### 2.5 Monorepo Domain Expansion (Self, Community, Library)
- **Self Domain (`@repo/self`)**:
  - **File:** [`packages/self/src/features/featureCatalog.ts`](file:///c:/x/packages/self/src/features/featureCatalog.ts)
    - Added `journey?: FeatureJourneySpec` to `SelfFeatureDefinition` interface, connecting Self domain features directly to sovereign `@repo/core/types` role-journey contracts.
  - **File:** [`packages/self/src/screens/SelfScreen.unified.tsx`](file:///c:/x/packages/self/src/screens/SelfScreen.unified.tsx)
    - Integrated `useScaffoldDismissal('self_day0_reflection_scaffold', 1)`.
    - Added role-tailored Day 0 Tutii mascot card (`FireflyMascot mode="glowing" role="guide"`) ushering users into mindful practice:
      - Student persona: *"Center your study rhythm, capture your thoughts, and nurture your joy jar."*
      - Teacher persona: *"Take a mindful pause between classes and cultivate peaceful presence."*
      - Principal persona: *"Contemplate your leadership vision with clarity and equanimity."*
    - Wired "Take a Mindful Breath" action to trigger the Somatic Sanctuary breathing space (`setBreathingOpen(true)`) while completing the scaffold.
- **Community Domain (`@repo/community`)**:
  - **File:** [`packages/community/package.json`](file:///c:/x/packages/community/package.json)
    - Pinned `"zod": "4.6.7"` to align with monorepo dependency cohorts.
  - **File:** [`packages/community/src/screens/CommunityScreen.tsx`](file:///c:/x/packages/community/src/screens/CommunityScreen.tsx)
    - Integrated `useScaffoldDismissal('community_day0_hearth_scaffold', 1)`.
    - In `renderHearthCard()`, rendered a Day 0 onboarding card featuring `FireflyMascot` when `sanctuaryGroups.length === 0` to guide new users to "Explore Circles" before falling back to the standard operational card.
- **Library Domain (`@repo/library`)**:
  - **File:** [`packages/library/src/screens/LibraryScreen.tsx`](file:///c:/x/packages/library/src/screens/LibraryScreen.tsx)
    - Integrated `useScaffoldDismissal('library_day0_explorer_scaffold', 1)`.
    - Added Day 0 living library discovery card with `FireflyMascot` under the header when `bookmarkedResources.length === 0`, guiding users to "Browse Shelves" via `handleSelectSection('browse')`.
- **Dialect Deprecations & Contract Hardening (`@repo/core/src/api`)**:
  - **Files:** [`packages/core/src/api/messaging.orpc.contract.ts`](file:///c:/x/packages/core/src/api/messaging.orpc.contract.ts) & [`packages/core/src/api/community.orpc.contract.ts`](file:///c:/x/packages/core/src/api/community.orpc.contract.ts)
    - Migrated all instances of deprecated `z.string().uuid()` to `z.uuid()` and `z.string().datetime()` to `z.iso.datetime()` across 38 contract procedures, guaranteeing zero version drift warnings.

---

## 3. Monorepo Quality Gate Verification Results

All gates and tests were executed using UTF-8 encoded PowerShell invocations per monorepo rules:

### 3.1 Static Analysis & Quality Sentinels

```bash
# 1. Continuous Native Generation (CNG) Firewall
pnpm run check:cng
# Result: ✔ Zero ephemeral native mutations. (Exit: 0)

# 2. Native Anti-Slop AST Sentinel
pnpm run check:native-slop
# Result: 0 BLOCK findings across 79 native files. (Exit: 0)

# 3. Anti-Hollow Stub Scanner
pnpm run check:hollow-stubs
# Result: ✔ Anti-Hollow Sentinel passed across 393 candidate files. (Exit: 0)

# 4. Anti-Slop Full CI Scanner
pnpm exec aislop ci --changes
# Result: Score 90 ("Healthy"), 0 errors across 3,987 files. (Exit: 0)

# 5. Ecosystem Radar & Version Drift Gate
node scripts/audit-version-drift.mjs --fail-on-unannotated --n-major=2
# Result: 0 deprecated framework dialects detected across source code. (Exit: 0)

# 6. Physical Seams Collision Auditor
node scripts/audit-seams.mjs
# Result: ZERO SEAM COLLISIONS DETECTED across 984 files in mobile & UI packages. (Exit: 0)

# 7. Dual-Engine Monorepo Typecheck (TSGO)
node scripts/typecheck-engine.mjs
# Result: Executing tsc (Go / tsgo v7.1.0-beta) with args: --build --noEmit. Elapsed: 2.4s. (Exit: 0)
```

### 3.2 Unit & Boundary Test Suites

| Target Package / App | Command | Results |
| :--- | :--- | :--- |
| `@repo/core` | `pnpm --filter @repo/core test appCatalog useScaffoldDismissal` | **13 passed (13)** (2 test suites) |
| `@repo/classroom` | `pnpm --filter @repo/classroom test` | **26 passed (26)** (7 test files) |
| `@repo/admin` | `pnpm --filter @repo/admin test` | **56 passed (56)** (4 test files) |
| `@repo/self` | `pnpm --filter @repo/self test` | **41 passed (41)** (12 test files) |
| `@repo/community` | `pnpm --filter @repo/community test` | **10 passed (10)** (5 test files) |
| `@repo/library` | `pnpm --filter @repo/library test` | **14 passed (14)** (3 test files) |
| `apps/gurudevi-web` | `pnpm --filter gurudevi-web test:g1:workspace-practice` | **21 passed (21)** (3 test files) |
| `apps/gurudevi-mobile` | `pnpm --filter gurudevi-mobile test src/__tests__/architecture/workspace-route-resolution.test.ts src/__tests__/entry/SessionRouteGate.test.tsx` | **27 passed (27)** (2 test files) |

---

## 4. Key Learnings & Guardrail Codifications

1. **`React.memo` Generic Parameter Erasure**: Wrapping generic components (`function Component<T>(...)`) inside `React.memo` erases generic type parameters to their base constraint (`string`). Avoid `React.memo` for small inline layout helpers where generic type discrimination is critical.
2. **Stable Hook Identity in React Testing Library**: When mocking hooks (`usePermissions()`) that supply callbacks (`can`) consumed in `useCallback` dependency arrays, always hoist mock functions (`const stableCan = vi.fn()`) outside the mock factory to prevent infinite re-render loops in Vitest.
3. **Zod v4 Dialect Enforcement**: Zod v4 deprecates `z.string().date()`, `z.string().uuid()`, and `z.string().datetime()` in favor of `z.iso.date()`, `z.uuid()`, and `z.iso.datetime()`. All schemas and oRPC contracts must conform to this dialect.
4. **`useScaffoldDismissal` Method Signatures**: `UseScaffoldDismissalResult` returns `completeScaffold` and `resetScaffold` (not `dismiss`). Invoking `completeScaffold()` writes directly to `useUIStore.scaffoldCompletions` and persists through `StorageManager`.
5. **Project References & `dist/` Synchronization**: When updating shared ports in `@repo/core` or `@repo/ui`, run `pnpm --filter <pkg> exec tsc --build` (without `--noEmit`) so declaration maps in `dist/` are refreshed for consuming packages using TypeScript composite project references.
