# Tier audit: packages/core/src

768 files. Rules: tooling/architecture-tiers.mjs.

| Tier | Files |
| --- | --- |
| Tier 0: Contracts | 131 |
| Tier 1: Ports | 34 |
| Tier 2: Domain | 183 |
| Tier 3: Adapters | 136 |
| Composition root | 3 |
| Tier 4: State | 30 |
| Tier 5: Application hooks | 48 |
| Tier 6: Presentation | 6 |

## upward-import (43)

- `core/accounts/accountTransition.adapter.ts` (Tier 3: Adapters) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters) → `core/store/resetScopedStores.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/syncData.adapter.ts` (Tier 3: Adapters) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/ai/platformManifest.ts` (Tier 2: Domain) → `core/ai/contextRegistry.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/api/v1/client.ts` (Tier 2: Domain) → `core/lib/security/transportSecurity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/effect/Runtime.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/effect/Runtime.ts` (Tier 2: Domain) → `core/effect/AppRuntime.ts` (Composition root): Tier 2: Domain imports Composition root, which sits above it
- `core/hooks/useSanctuaryVisitor.ts` (Tier 5: Application hooks) → `core/providers/AuthProvider.tsx` (Tier 6: Presentation): Tier 5: Application hooks imports Tier 6: Presentation, which sits above it
- `core/lib/authProfileStorage.adapter.ts` (Tier 3: Adapters) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/native/guestStorage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/feedback.ts` (Tier 2: Domain) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/monitoring/sentry.ts` (Tier 2: Domain) → `core/platform/drivers/telemetrySink.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/sync/deviceSecurityIntents.ts` (Tier 2: Domain) → `core/lib/sync/mutationAuditLog.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/deviceSecurityIntents.ts` (Tier 2: Domain) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/deviceSecurityIntents.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/agents/index.ts` (Tier 2: Domain) → `core/logic/agents/reliefAgent.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/agents/index.ts` (Tier 2: Domain) → `core/logic/agents/reliefAgent.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/apiInterceptor.adapter.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/modes/demo.ts` (Tier 2: Domain) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/modes/demo.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/modes/sandboxMode.ts` (Tier 2: Domain) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.adapter.ts` (Tier 3: Adapters) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/logic/utils/LanguageUtils.ts` (Tier 2: Domain) → `core/logic/i18n/i18n.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/utils/temporalUtils.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/workspace/index.ts` (Tier 2: Domain) → `core/logic/workspace/provisionalWorkspace.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useConflictStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it

## pass-through (2)

- `core/adapters/powersync/powersync-react-shim.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead
- `core/native/webSentryAdapter.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead

## tier-import (88)

- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/accounts/authenticatedAccountCapture.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/lib/accountScope.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/realtime/supabase.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/accounts/authenticatedAccountCapture.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useClassroomCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useDeviceAccounts.ts` (Tier 5: Application hooks) → `core/accounts/deviceAccounts.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useDeviceSecurity.ts` (Tier 5: Application hooks) → `core/adapters/supabaseDeviceSecurity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useGroupCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useJourneyHistory.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useLocalFirstQuery.ts` (Tier 5: Application hooks) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useManualSnapshot.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePendingActions.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePendingGateAction.ts` (Tier 5: Application hooks) → `core/lib/pendingGateAction.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePerspectiveSwitch.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePerspectiveSwitch.ts` (Tier 5: Application hooks) → `core/lib/tenantStorage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useQuerySnapshotHydration.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSafeMutation.ts` (Tier 5: Application hooks) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSanctuaryVisitor.ts` (Tier 5: Application hooks) → `core/native/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSchoolCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useScopedDeviceSecurity.ts` (Tier 5: Application hooks) → `core/adapters/supabaseDeviceSecurity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useScopedNotifications.ts` (Tier 5: Application hooks) → `core/adapters/supabaseNotification.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useStorageString.ts` (Tier 5: Application hooks) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useStudentGoals.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useTemporalHeatmap.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/lib/experienceState.store.ts` (Tier 4: State) → `core/lib/scopedStateStorage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/hooks/useSyncStatus.ts` (Tier 5: Application hooks) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/lib/sync/mutationAuditLog.store.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/mutationQueue.store.ts` (Tier 4: State) → `core/lib/accountScope.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/mutationQueue.store.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/feedback.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/errorClassifier.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/mutationAuditLog.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/outboxMigration.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/registry.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayAdmission.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayIdentity.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayPolicy.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/versionGating.store.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/monitoring/breadcrumbs.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useConflictStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/versionGating.store.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/versionGating.store.ts` (Tier 4: State) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/logic/deeplink/pendingIntent.store.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/logic/workspace/provisionalWorkspace.store.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/offline/useOfflineStatus.ts` (Tier 5: Application hooks) → `core/adapters/subscribeToNetwork.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/offline/useOfflineStatus.ts` (Tier 5: Application hooks) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/logic/utils/LanguageUtils.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/logic/auth/identityState.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/scopeSession.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/experienceState.store.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/scopedStateStorage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/sync/mutationQueue.store.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/scopeSession.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useActiveSubTabsStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useFeatureStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useTenantStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useUIStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/accountScope.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/store/scopeSession.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useActiveSubTabsStore.ts` (Tier 4: State) → `core/lib/scopedStateStorage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConflictStore.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConflictStore.ts` (Tier 4: State) → `core/lib/sync/eventBus.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConsentStore.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useDraftsStore.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useSensoryStore.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useTenantStore.ts` (Tier 4: State) → `core/lib/storageWrapper.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/scopedStateStorage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/accountScope.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/native/guestScope.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/storage.adapter.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root

## parse-above-boundary (3)

- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSession.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSync.ts` (Tier 2: Domain): 3 schema parse call(s); decode at the adapter and pass typed data up

## imports-retired (1)

- `core/logic/modes/noticeComposer.ts` (Tier 2: Domain) → `core/api/planBridge.orpc.contract.ts`: Live code depends on the retired pre-v1 client
