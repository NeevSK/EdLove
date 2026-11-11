# Tier audit: sanctuary-feature tree (reports/topological-layer-analysis.json)

76 files. Rules: tooling/architecture-tiers.mjs.

| Tier | Files |
| --- | --- |
| Tier 0: Contracts | 17 |
| Tier 1: Ports | 4 |
| Tier 2: Domain | 12 |
| Tier 3: Adapters | 23 |
| Tier 4: State | 8 |
| Tier 5: Application hooks | 2 |
| Tier 6: Presentation | 10 |

## parse-above-boundary (6)

- `core/logic/registry/featureLifecycleManifest.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/store/useEntitlementStore.ts` (Tier 4: State): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/permissions/authority.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/store/useFeatureStore.ts` (Tier 4: State): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/registry/domainEntry.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/lib/featureRolloutSnapshot.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up

## tier-import (18)

- `ui/components/SanctuaryGuard.tsx` (Tier 6: Presentation) → `core/logic/permissions/sanctuaryFeature.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useAuthStore.ts` (Tier 4: State) → `core/lib/authProfileStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useCedarDecisionStore.ts` (Tier 4: State) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useCedarDecisionStore.ts` (Tier 4: State) → `core/adapters/powersync/schema.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useCedarDecisionStore.ts` (Tier 4: State) → `core/logic/permissions/signature.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useCedarDecisionStore.ts` (Tier 4: State) → `core/native/localGuestSession.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useEntitlementStore.ts` (Tier 4: State) → `core/adapters/supabase/supabaseEntitlement.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useEntitlementStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useFeatureStore.ts` (Tier 4: State) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useFeatureStore.ts` (Tier 4: State) → `core/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useFeatureStore.ts` (Tier 4: State) → `core/monitoring/breadcrumbs.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useFeatureStore.ts` (Tier 4: State) → `core/native/guestScope.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/slices/auth.slice.ts` (Tier 4: State) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/experienceState.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root

## misplaced (13)

- `core/lib/storageWrapper.ts` (Tier 3: Adapters): Zustand persist storage over the storage adapter; belongs in packages/core/src/adapters/storage/
- `core/lib/sync/eventBus.ts` (Tier 3: Adapters): In-process pub/sub runtime; belongs in packages/core/src/adapters/events/
- `core/logic/permissions/signature.ts` (Tier 3: Adapters): Verifies signatures with the platform WebCrypto API, which is I/O; belongs in packages/core/src/platform/drivers/cryptoVault
- `core/lib/storage.ts` (Tier 3: Adapters): Wraps the platform storage driver; belongs in packages/core/src/adapters/storage/
- `core/lib/devicePreferences.ts` (Tier 3: Adapters): Device preference records in storage; belongs in packages/core/src/adapters/storage/
- `core/lib/authProfileStorage.ts` (Tier 3: Adapters): Persists the auth profile; belongs in packages/core/src/adapters/storage/
- `core/lib/accountScope.ts` (Tier 2: Domain): Pure derivation of account-scoped keys, no imports; belongs in packages/core/src/logic/accounts/
- `core/lib/featureRolloutSnapshot.ts` (Tier 2: Domain): Pure: turns a rollout port result into a flag snapshot; belongs in packages/core/src/logic/registry/
- `core/logic/utils/edloveUuidV8.ts` (Tier 0: Contracts): The account ID format check that identity.schema.ts is built on; a contract primitive; belongs in packages/core/src/logic/schemas/
- `core/lib/experienceState.ts` (Tier 4: State): A Zustand store with persistence; belongs in packages/core/src/store/
- `core/lib/authStorage.ts` (Tier 3: Adapters): Reads and writes auth records in storage; belongs in packages/core/src/adapters/storage/
- `core/lib/security/transportSecurity.ts` (Tier 3: Adapters): Guards and performs network fetches; belongs in packages/core/src/platform/drivers/
- `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Account-scoped persist storage; belongs in packages/core/src/adapters/storage/

## forbidden-package (1)

- `core/store/useCedarDecisionStore.ts` (Tier 4: State) → `drizzle-orm`: Tier 4: State may not use drizzle-orm

## upward-import (3)

- `core/lib/authProfileStorage.ts` (Tier 3: Adapters) → `core/lib/experienceState.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
