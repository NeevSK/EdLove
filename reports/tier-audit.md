# Tier audit: sanctuary-feature tree (reports/topological-layer-analysis.json)

68 files. Rules: tooling/architecture-tiers.mjs.

| Tier | Files |
| --- | --- |
| Tier 0: Contracts | 17 |
| Tier 1: Ports | 4 |
| Tier 2: Domain | 10 |
| Tier 3: Adapters | 14 |
| Composition root | 3 |
| Tier 4: State | 8 |
| Tier 5: Application hooks | 2 |
| Tier 6: Presentation | 10 |

## parse-above-boundary (3)

- `core/logic/registry/featureLifecycleManifest.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/permissions/authority.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/registry/domainEntry.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up

## tier-import (4)

- `ui/components/SanctuaryGuard.tsx` (Tier 6: Presentation) → `core/logic/permissions/sanctuaryFeature.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/experienceState.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root

## misplaced (10)

- `core/lib/accountScope.ts` (Tier 3: Adapters): The session register: active account and a revision for dropping stale work (with native/guestScope.ts); belongs in packages/core/src/adapters/session/
- `core/lib/authProfileStorage.ts` (Tier 3: Adapters): Persists the auth profile; belongs in packages/core/src/adapters/storage/
- `core/lib/storageWrapper.ts` (Tier 3: Adapters): Zustand persist storage over the storage adapter; belongs in packages/core/src/adapters/storage/
- `core/lib/sync/eventBus.ts` (Tier 3: Adapters): In-process pub/sub runtime; belongs in packages/core/src/adapters/events/
- `core/lib/featureRolloutSnapshot.ts` (Tier 2: Domain): Pure: turns a rollout port result into a flag snapshot; belongs in packages/core/src/logic/registry/
- `core/logic/utils/edloveUuidV8.ts` (Tier 0: Contracts): The account ID format check that identity.schema.ts is built on; a contract primitive; belongs in packages/core/src/logic/schemas/
- `core/lib/storage.ts` (Tier 3: Adapters): Wraps the platform storage driver; belongs in packages/core/src/adapters/storage/
- `core/lib/experienceState.ts` (Tier 4: State): A Zustand store with persistence; belongs in packages/core/src/store/
- `core/lib/devicePreferences.ts` (Tier 3: Adapters): Device preference records in storage; belongs in packages/core/src/adapters/storage/
- `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Account-scoped persist storage; belongs in packages/core/src/adapters/storage/

## upward-import (1)

- `core/lib/authProfileStorage.ts` (Tier 3: Adapters) → `core/lib/experienceState.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
