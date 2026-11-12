# Tier audit: packages/core/src

785 files. Rules: tooling/architecture-tiers.mjs.

| Tier | Files |
| --- | --- |
| Tier 0: Contracts | 133 |
| Tier 1: Ports | 37 |
| Tier 2: Domain | 172 |
| Tier 3: Adapters | 141 |
| Composition root | 15 |
| Tier 4: State | 33 |
| Tier 5: Application hooks | 49 |
| Tier 5: Coordinators | 2 |
| Tier 6: Presentation | 6 |

## upward-import (16)

- `core/accounts/accountTransition.adapter.ts` (Tier 3: Adapters) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters) → `core/store/resetScopedStores.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/syncData.adapter.ts` (Tier 3: Adapters) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/api/v1/client.ts` (Tier 2: Domain) → `core/lib/security/transportSecurity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/authProfileStorage.adapter.ts` (Tier 3: Adapters) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/apiInterceptor.adapter.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/workspace/index.ts` (Tier 2: Domain) → `core/logic/workspace/provisionalWorkspace.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it

## pass-through (2)

- `core/adapters/powersync/powersync-react-shim.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead
- `core/native/webSentryAdapter.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead

## tier-import (21)

- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/accounts/authenticatedAccountCapture.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Composition root, Tier 5: Coordinators, Tier 5: Application hooks
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/feedback.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/errorClassifier.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/mutationAuditLog.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/outboxMigration.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/registry.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayAdmission.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayIdentity.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayPolicy.coordinator.ts` (Tier 5: Coordinators): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/versionGating.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/monitoring/breadcrumbs.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useConflictStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/logic/utils/LanguageUtils.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/logic/auth/identityState.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/scopeSession.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation

## parse-above-boundary (3)

- `core/lib/sync/replayPolicy.coordinator.ts` (Tier 5: Coordinators): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSession.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSync.ts` (Tier 2: Domain): 3 schema parse call(s); decode at the adapter and pass typed data up

## imports-retired (1)

- `core/logic/modes/noticeComposer.ts` (Tier 2: Domain) → `core/api/planBridge.orpc.contract.ts`: Live code depends on the retired pre-v1 client
