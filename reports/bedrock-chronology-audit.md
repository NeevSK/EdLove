# Comprehensive Historical Chronology & Layer Audit of the Sanctuary Subsystem

Generated: 2026-11-01T12:58:50.016Z
Total Files Audited: 74

## 1. Executive Summary & Evolutionary Eras

This archaeological analysis tracks the creation dates, git churn, and accretion patterns across all layers of the Sanctuary subsystem.

| Era | Time Window | Characteristics & Agentic Patterns |
| :--- | :--- | :--- |
| **Era 1: Legacy Bootstrap** | June 2026 | Initial prototypes, basic auth session wrappers, barebone PowerSync sync shims. |
| **Era 2: CASL & Permissions Accretion** | July–Aug 2026 | CASL rules (`defineRulesFor`), ability builders, and `usePermissions` ceremonies introduced. Cross-imports began tangling. |
| **Era 3: Agentic Race Accretion** | Sept 2026 | High churn (50+ commits/file). Generation race-condition counters, string heuristics (`suggestDisplayName`), and hybrid identity shims (`identityState.ts`) accreted. |
| **Era 4: Canonical ReBAC & Modernization** | Oct–Nov 2026 | Canonical UUIDv8 account cutover, pure ReBAC bond citizenship (`FIRST_CLASS`, `SECOND_CLASS`, `THIRD_CLASS`), deterministic Code-ERD graph mapping. |

## 2. Bedrock (Layer 0) Archaeological Analysis (0 Internal Dependencies)

Layer 0 files are foundational leaves that import nothing else within this subsystem. They define the data contracts, ports, utilities, and storage shims.

| File | LOC | Churn | Born | Era | Verdict | Redundancy Assessment |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| `packages/core/src/lib/storage.ts` | 40 | 25 | 2026-02-05 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/ui/src/primitives.ts` | 71 | 14 | 2026-04-25 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/types/authorization.ts` | 93 | 13 | 2026-03-30 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/adapters/powersync/schema.ts` | 700 | 12 | 2026-05-06 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/constants/SriLankanSchools.ts` | 874 | 10 | 2026-02-04 | Unknown | **Massive Static Constant (874 LOC)** | Heavy hardcoded static data in core layer; should be loaded dynamically or kept strictly leaf-level. |
| `packages/core/src/types/Identity.ts` | 78 | 9 | 2026-05-06 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/types/runtime.ts` | 173 | 9 | 2026-04-25 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/types/Errors.ts` | 191 | 9 | 2026-05-08 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/ui/src/utils/haptics.ts` | 145 | 7 | 2026-02-03 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/auth/identityState.ts` | 156 | 6 | 2026-06-26 | Era 1 | **Orphaned Subsystem Node (0 in-degree callers)** | No internal files in this subsystem import this file. |
| `packages/ui/src/icons.ts` | 2 | 6 | 2026-04-27 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/lib/sync/eventBus.ts` | 169 | 6 | 2026-05-06 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/adapters/powersync/powersync-shim.ts` | 81 | 6 | 2026-05-06 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/schemas/capacity.schema.ts` | 24 | 5 | 2026-03-25 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/monitoring/index.ts` | 12 | 5 | 2026-08-29 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/permissions/signature.ts` | 123 | 4 | 2026-05-20 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/lib/accountScope.ts` | 27 | 4 | 2026-04-17 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/ports/entitlement.port.ts` | 99 | 3 | 2026-06-13 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/store/types/featureFlags.ts` | 34 | 3 | 2026-07-24 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/registry/citizenship.ts` | 54 | 3 | 2026-07-24 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/native/guestScope.ts` | 38 | 3 | 2026-07-28 | Era 2 | **Legacy Session Shim** | Used for guest mode scoping prior to canonical third-class citizenship. |
| `packages/core/src/logic/permissions/bondScope.ts` | 36 | 2 | 2026-07-28 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/utils/edloveUuidV8.ts` | 199 | 2 | 2026-10-23 | Era 4 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/adapters/powersync/singleActivePowerSyncRuntime.ts` | 125 | 2 | 2026-08-13 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/ui/src/utils/classNames.ts` | 10 | 2 | 2026-08-29 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/ports/authz.port.ts` | 42 | 2 | 2026-06-13 | Era 1 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/types/Social.ts` | 23 | 2 | 2026-02-28 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/logic/interfaces/network.port.ts` | 25 | 2 | 2026-04-26 | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/monitoring/breadcrumbs.ts` | 62 | 1 | 2026-08-29 | Era 2 | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |
| `packages/core/src/lib/security/transportSecurity.ts` | 71 | 0 | Uncommitted | Unknown | **Bedrock Invariant** | Foundational contract/port with 0 internal dependencies. |

## 3. Downstream & Higher Layer Chronology (Layers 1–13)

| Layer | File | LOC | Churn | Born | In-Degree | Out-Degree | Verdict |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| L1 | `packages/ui/src/components/SanctuaryButton.tsx` | 160 | 28 | 2026-02-05 | 1 | 2 | Essential Component |
| L1 | `packages/core/src/types/API.ts` | 42 | 13 | 2026-02-19 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/logic/schemas/identity.schema.ts` | 214 | 12 | 2026-05-06 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/logic/runtimeRegistry.ts` | 118 | 8 | 2026-04-25 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/logic/registry/domainEntry.ts` | 306 | 7 | 2026-07-24 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/logic/permissions/accessContext.ts` | 39 | 4 | 2026-07-28 | 1 | 2 | Essential Component |
| L1 | `packages/core/src/logic/managers/NetworkManager.ts` | 70 | 4 | 2026-04-26 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/lib/authStorage.ts` | 36 | 3 | 2026-06-26 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/types/Perspective.ts` | 83 | 2 | 2026-09-08 | 2 | 2 | Essential Component |
| L1 | `packages/core/src/logic/permissions/baselineCapabilities.ts` | 39 | 1 | 2026-09-12 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/adapters/powersync/databaseRegistry.ts` | 66 | 1 | 2026-10-27 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/lib/devicePreferences.ts` | 46 | 1 | 2026-10-27 | 1 | 1 | Essential Component |
| L1 | `packages/core/src/lib/scopedStateStorage.ts` | 69 | 1 | 2026-10-27 | 1 | 3 | Essential Component |
| L2 | `packages/core/src/logic/schemas/user.schema.ts` | 156 | 26 | 2026-03-25 | 5 | 1 | Essential Component |
| L2 | `packages/ui/src/components/PositiveInvitation.tsx` | 116 | 22 | 2026-02-18 | 3 | 4 | Essential Component |
| L2 | `packages/core/src/lib/storageWrapper.ts` | 37 | 9 | 2026-02-15 | 4 | 2 | Essential Component |
| L2 | `packages/core/src/logic/permissions/sanctuaryFeature.ts` | 179 | 7 | 2026-06-22 | 2 | 4 | Essential Component |
| L2 | `packages/core/src/logic/registry/featureLifecycleManifest.ts` | 350 | 6 | 2026-07-26 | 3 | 2 | Essential Component |
| L2 | `packages/core/src/adapters/supabaseClient.ts` | 89 | 6 | 2026-08-10 | 1 | 2 | Essential Component |
| L2 | `packages/core/src/store/scopeSession.ts` | 166 | 1 | 2026-10-27 | 2 | 2 | Essential Component |
| L2 | `packages/core/src/lib/experienceState.ts` | 83 | 1 | 2026-10-27 | 1 | 1 | Essential Component |
| L3 | `packages/core/src/types/Tenancy.ts` | 57 | 7 | 2026-03-25 | 1 | 2 | Essential Component |
| L3 | `packages/core/src/logic/ports/featureRollout.port.ts` | 20 | 5 | 2026-06-22 | 4 | 1 | Essential Component |
| L3 | `packages/ui/src/components/prompts/SchoolJoinPrompt.tsx` | 21 | 4 | 2026-07-24 | 1 | 2 | Essential Component |
| L3 | `packages/ui/src/components/prompts/SignupPrompt.tsx` | 21 | 4 | 2026-07-24 | 1 | 2 | Essential Component |
| L3 | `packages/ui/src/components/prompts/UpgradePrompt.tsx` | 26 | 4 | 2026-07-24 | 1 | 2 | Essential Component |
| L3 | `packages/core/src/native/localGuestSession.ts` | 96 | 2 | 2026-10-27 | 1 | 2 | Essential Component |
| L4 | `packages/core/src/types/User.ts` | 117 | 29 | 2026-02-03 | 1 | 3 | Essential Component |
| L4 | `packages/core/src/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts` | 233 | 12 | 2026-06-22 | 1 | 6 | Essential Component |
| L4 | `packages/core/src/lib/featureRolloutSnapshot.ts` | 43 | 1 | 2026-10-27 | 1 | 3 | Essential Component |
| L5 | `packages/core/src/types/index.ts` | 237 | 39 | 2026-02-19 | 2 | 3 | Essential Component |
| L5 | `packages/core/src/logic/managers/featureFlag.factory.ts` | 9 | 5 | 2026-06-13 | 1 | 2 | Essential Component |
| L6 | `packages/core/src/store/slices/auth.slice.ts` | 21 | 13 | 2026-03-30 | 1 | 2 | Essential Component |
| L6 | `packages/core/src/store/useFeatureStore.ts` | 126 | 9 | 2026-04-17 | 1 | 9 | Essential Component |
| L6 | `packages/core/src/lib/authProfileStorage.ts` | 114 | 1 | 2026-10-27 | 1 | 5 | Essential Component |
| L7 | `packages/core/src/store/useAuthStore.ts` | 28 | 9 | 2026-03-30 | 3 | 2 | Essential Component |
| L8 | `packages/core/src/adapters/powersync/secureDrizzleProxy.ts` | 194 | 11 | 2026-05-06 | 1 | 5 | Essential Component |
| L9 | `packages/core/src/adapters/powersync/database.ts` | 122 | 12 | 2026-05-06 | 2 | 6 | Essential Component |
| L10 | `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts` | 172 | 8 | 2026-06-13 | 1 | 4 | Essential Component |
| L10 | `packages/core/src/store/useCedarDecisionStore.ts` | 250 | 7 | 2026-07-24 | 2 | 4 | Essential Component |
| L11 | `packages/core/src/store/useEntitlementStore.ts` | 166 | 7 | 2026-07-24 | 1 | 3 | Essential Component |
| L11 | `packages/core/src/store/usePerspectiveStore.ts` | 207 | 3 | 2026-09-08 | 1 | 5 | Essential Component |
| L12 | `packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts` | 284 | 9 | 2026-06-22 | 1 | 15 | Essential Component |
| L13 | `packages/ui/src/components/SanctuaryGuard.tsx` | 58 | 5 | 2026-07-24 | 0 | 5 | Essential Component |

## 4. Deep-Dive on Accretive Ceremonies & Redundancy Findings

### A. `identityState.ts` - The Frankenstein Accretion Landmark
- **Original Purpose (2026-06-26, commit `b4a119db5`):** A minimal 43-line helper distinguishing `guest`, `authenticated`, `sandbox`, and `demo` from Supabase session metadata.
- **Accretion 1 (2026-07-28, commit `8b53a75c0`):** Renamed `guest` to `unauthenticated` / `anonymous`.
- **Accretion 2 (2026-09-04 / 2026-09-08, commits `75420cb08` & `c9648552b`):** Added race condition generation counters (`isCurrentAuthBootstrapGeneration`, `isCurrentIdentityResolutionGeneration`), soft deletion check (`isActiveIdentityProfile`), and email name extraction (`suggestDisplayName`).
- **Accretion 3 (2026-09-12, commit `ad9c59edd`):** Added `isLocalOnlyIdentity` checking `citizenship === 'THIRD_CLASS' || citizenship === 'WANDERER'`, creating a duplicate, competing source of truth with canonical ReBAC in `Identity.ts`.
- **Deconstruction & Refactoring Action:**
  1. `suggestDisplayName`: Belongs exclusively in onboarding/signup adapter where auth metadata is mapped to initial profile name.
  2. `isLocalOnlyIdentity`: Replaced by canonical `resolveBondCitizenship(activeBond) === 'THIRD_CLASS' || !user?.id`.
  3. Generation counters: Belong in local session bootstrap state machine, not global bedrock.

### B. Empty & Zombie Files Detected
- None detected.

### C. The Evolution of Permissions: From CASL to ReBAC
- **Old Way (Era 2):** CASL `defineRulesFor`, `usePermissions()`, imperative `ability.can(action, subject)` with 12-layer dynamic shims and race-prone async checks.
- **New Way (Era 4):** Synchronous O(1) ReBAC via `useSanctuaryFeature()` reading `activeBond` from `Identity.ts`, verified against `SanctuaryGuard.tsx` with 0 async overhead.
