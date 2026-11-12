# Tier audit: packages/core/src

792 files. Rules: tooling/architecture-tiers.mjs.

| Tier | Files |
| --- | --- |
| Tier 0: Contracts | 130 |
| Tier 1: Ports | 34 |
| Tier 2: Domain | 239 |
| Tier 3: Adapters | 109 |
| Composition root | 3 |
| Tier 4: State | 25 |
| Tier 5: Application hooks | 49 |
| Tier 6: Presentation | 6 |

## upward-import (83)

- `core/accounts/accountTransition.ts` (Tier 2: Domain) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/accounts/accountTransition.ts` (Tier 2: Domain) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/native/deviceTrust.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/lib/experienceState.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/accounts/deviceAccounts.ts` (Tier 2: Domain) → `core/store/resetScopedStores.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/secureDrizzleProxy.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/adapters/powersync/syncData.adapter.ts` (Tier 3: Adapters) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 3: Adapters imports Tier 5: Application hooks, which sits above it
- `core/api/v1/client.ts` (Tier 2: Domain) → `core/lib/security/transportSecurity.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/effect/Runtime.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/effect/Runtime.ts` (Tier 2: Domain) → `core/effect/AppRuntime.ts` (Composition root): Tier 2: Domain imports Composition root, which sits above it
- `core/hooks/useSanctuaryVisitor.ts` (Tier 5: Application hooks) → `core/providers/AuthProvider.tsx` (Tier 6: Presentation): Tier 5: Application hooks imports Tier 6: Presentation, which sits above it
- `core/lib/accountPin.ts` (Tier 2: Domain) → `core/platform/drivers/cryptoVault.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/authProfileStorage.ts` (Tier 3: Adapters) → `core/lib/experienceState.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/lib/authorization.ts` (Tier 2: Domain) → `core/adapters/supabaseClient.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/authorization.ts` (Tier 2: Domain) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/failureFeedback.ts` (Tier 2: Domain) → `core/native/guestStorage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/feedback.ts` (Tier 2: Domain) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/inviteCodes.ts` (Tier 2: Domain) → `core/adapters/supabaseClient.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/monitoring/index.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/monitoring/sentry.ts` (Tier 2: Domain) → `core/platform/drivers/telemetrySink.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/pendingGateAction.ts` (Tier 2: Domain) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/security/deviceTrust.ts` (Tier 2: Domain) → `core/native/deviceTrust.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/supabaseAuthStorage.ts` (Tier 2: Domain) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/supabaseAuthStorage.ts` (Tier 2: Domain) → `core/platform/drivers/cryptoVault.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/sync/MutationAuditLog.ts` (Tier 2: Domain) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/sync/deviceSecurityIntents.ts` (Tier 2: Domain) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/lib/sync/deviceSecurityIntents.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/replayIdentity.ts` (Tier 2: Domain) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/lib/sync/versionGating.ts` (Tier 2: Domain) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/sync/versionGating.ts` (Tier 2: Domain) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/lib/tenantStorage.ts` (Tier 2: Domain) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/agents/reliefAgent.ts` (Tier 2: Domain) → `core/adapters/supabaseClient.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/apiInterceptor.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/apiInterceptor.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/auth/AuthClient.ts` (Tier 2: Domain) → `core/native/deviceTrust.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/auth/AuthClient.ts` (Tier 2: Domain) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/deeplink/handleDeepLink.ts` (Tier 2: Domain) → `core/adapters/supabaseClient.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/deeplink/pendingIntentStore.ts` (Tier 2: Domain) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/journey/roleJourneyMachine.v6.ts` (Tier 2: Domain) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/modes/demo.ts` (Tier 2: Domain) → `core/lib/experienceState.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/modes/demo.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/modes/sandboxMode.ts` (Tier 2: Domain) → `core/lib/experienceState.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/permissions/index.ts` (Tier 2: Domain) → `core/logic/permissions/hooks/useAuthority.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/logic/permissions/index.ts` (Tier 2: Domain) → `core/logic/permissions/hooks/useSanctuaryFeature.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/logic/permissions/localEvaluator.native.ts` (Tier 2: Domain) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localEvaluator.native.ts` (Tier 2: Domain) → `core/adapters/powersync/schema.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localEvaluator.native.ts` (Tier 2: Domain) → `core/logic/permissions/signature.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localEvaluator.ts` (Tier 2: Domain) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localEvaluator.ts` (Tier 2: Domain) → `core/adapters/powersync/schema.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localEvaluator.ts` (Tier 2: Domain) → `core/native/deviceTrust.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localResourceAttributes.ts` (Tier 2: Domain) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/localResourceAttributes.ts` (Tier 2: Domain) → `core/adapters/powersync/schema.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `core/store/scopeSession.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/reflection/records.ts` (Tier 2: Domain) → `core/adapters/powersync/schema.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/store-slices/index.ts` (Tier 2: Domain) → `core/logic/store-slices/auth.slice.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/store-slices/index.ts` (Tier 2: Domain) → `core/logic/store-slices/tenant.slice.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/store-slices/index.ts` (Tier 2: Domain) → `core/logic/store-slices/ui.slice.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/utils/temporalUtils.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/logic/workspace/provisionalWorkspace.ts` (Tier 2: Domain) → `core/adapters/supabase/tuitionBatchRepository.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/logic/workspace/provisionalWorkspace.ts` (Tier 2: Domain) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSession.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/scopeSessionCoordinator.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/native/localGuestActivation.ts` (Tier 3: Adapters) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 3: Adapters imports Tier 4: State, which sits above it
- `core/spatial/index.ts` (Tier 2: Domain) → `core/spatial/spatial.adapter.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 4: State imports Tier 5: Application hooks, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks): Tier 2: Domain imports Tier 5: Application hooks, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 2: Domain imports Tier 3: Adapters, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useConflictStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it
- `core/testing/scenarioHarness.ts` (Tier 2: Domain) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 2: Domain imports Tier 4: State, which sits above it

## forbidden-package (21)

- `core/adapters/powersync/hooks.ts` (Tier 3: Adapters) → `react`: Tier 3: Adapters may not use react
- `core/adapters/powersync/todosHook.ts` (Tier 3: Adapters) → `react`: Tier 3: Adapters may not use react
- `core/adapters/supabase/todosHook.ts` (Tier 3: Adapters) → `react`: Tier 3: Adapters may not use react
- `core/ai/contextRegistry.ts` (Tier 2: Domain) → `react`: Tier 2: Domain may not use react
- `core/ai/contextRegistry.ts` (Tier 2: Domain) → `zustand`: Tier 2: Domain may not use zustand
- `core/lib/sync/MutationAuditLog.ts` (Tier 2: Domain) → `zustand`: Tier 2: Domain may not use zustand
- `core/lib/sync/MutationAuditLog.ts` (Tier 2: Domain) → `zustand/middleware`: Tier 2: Domain may not use zustand/middleware
- `core/lib/sync/versionGating.ts` (Tier 2: Domain) → `zustand`: Tier 2: Domain may not use zustand
- `core/lib/sync/versionGating.ts` (Tier 2: Domain) → `zustand/middleware`: Tier 2: Domain may not use zustand/middleware
- `core/logic/deeplink/pendingIntentStore.ts` (Tier 2: Domain) → `zustand`: Tier 2: Domain may not use zustand
- `core/logic/deeplink/pendingIntentStore.ts` (Tier 2: Domain) → `zustand/middleware`: Tier 2: Domain may not use zustand/middleware
- `core/logic/i18n/config.ts` (Tier 2: Domain) → `react-i18next`: Tier 2: Domain may not use react-i18next
- `core/logic/journey/roleJourneyMachine.v6.ts` (Tier 2: Domain) → `xstate`: Tier 2: Domain may not use xstate
- `core/logic/journey/roleJourneyMachine.v6.ts` (Tier 2: Domain) → `xstate/persist`: Tier 2: Domain may not use xstate/persist
- `core/logic/permissions/localEvaluator.native.ts` (Tier 2: Domain) → `drizzle-orm`: Tier 2: Domain may not use drizzle-orm
- `core/logic/permissions/localResourceAttributes.ts` (Tier 2: Domain) → `drizzle-orm`: Tier 2: Domain may not use drizzle-orm
- `core/logic/permissions/snapshotRefresh.ts` (Tier 2: Domain) → `drizzle-orm`: Tier 2: Domain may not use drizzle-orm
- `core/logic/reflection/records.ts` (Tier 2: Domain) → `drizzle-orm`: Tier 2: Domain may not use drizzle-orm
- `core/logic/workspace/provisionalWorkspace.ts` (Tier 2: Domain) → `zustand`: Tier 2: Domain may not use zustand
- `core/logic/workspace/provisionalWorkspace.ts` (Tier 2: Domain) → `zustand/middleware`: Tier 2: Domain may not use zustand/middleware
- `core/webAuth.ts` (Tier 2: Domain) → `@supabase/supabase-js`: Tier 2: Domain may not use @supabase/supabase-js

## pass-through (30)

- `core/adapters/powersync/powersync-react-shim.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead
- `core/educational/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/flows/pjc.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/lib/monitoring/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/attendanceProjection/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/classroomNotes/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/educational/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/founder/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/gradingProjection/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/guardian/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/principalWorkspace/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/profile/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/social/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/teacherInsights/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/domains/workspaceLayout/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/entities/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/experience/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/forms/analytics.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/forms/dynamic-loader.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/forms/form-engine.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/permissions/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/store-slices/auth.slice.ts` (Tier 4: State): Only re-exports or renames; import the source instead
- `core/logic/store-slices/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/logic/store-slices/tenant.slice.ts` (Tier 4: State): Only re-exports or renames; import the source instead
- `core/logic/store-slices/ui.slice.ts` (Tier 4: State): Only re-exports or renames; import the source instead
- `core/logic/utils/uuid.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/native/webSentryAdapter.ts` (Tier 3: Adapters): Only re-exports or renames; import the source instead
- `core/spatial/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead
- `core/thresholds/index.ts` (Tier 2: Domain): Only re-exports or renames; import the source instead

## parse-above-boundary (17)

- `core/flows/journeyPilot.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/flows/pjc/catalogLoader.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/flows/pjc/hierarchy.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/hooks/useGrowthQuery.ts` (Tier 5: Application hooks): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/lib/catalogPracticeRuntime.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/lib/practiceDocumentLifecycle.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/lib/sync/replayPolicy.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/agents/reliefAgent.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/auth/AuthClient.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/journey/roleJourneyMachine.v6.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/permissions/authority.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/permissions/cedarClientEvaluator.ts` (Tier 2: Domain): 3 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/registry/appCatalog.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/registry/featureLifecycleManifest.ts` (Tier 2: Domain): 1 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutPatch.ts` (Tier 2: Domain): 5 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSession.ts` (Tier 2: Domain): 2 schema parse call(s); decode at the adapter and pass typed data up
- `core/logic/workspace/layoutSync.ts` (Tier 2: Domain): 3 schema parse call(s); decode at the adapter and pass typed data up

## tier-import (78)

- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/powersync/database.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/supabaseIdentity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/adapters/realtime/supabase.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useAuthLifecycle.ts` (Tier 5: Application hooks) → `core/monitoring/index.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useClassroomCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useDeviceSecurity.ts` (Tier 5: Application hooks) → `core/adapters/supabaseDeviceSecurity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useGroupCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useGrowthQuery.ts` (Tier 5: Application hooks) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useGrowthQuery.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useGrowthQuery.ts` (Tier 5: Application hooks) → `core/adapters/supabase/growth.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useJourneyHistory.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useLocalFirstQuery.ts` (Tier 5: Application hooks) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useManualSnapshot.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePendingActions.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/usePerspectiveSwitch.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useQuerySnapshotHydration.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSafeMutation.ts` (Tier 5: Application hooks) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSanctuaryVisitor.ts` (Tier 5: Application hooks) → `core/native/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useSchoolCreation.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useScopedDeviceSecurity.ts` (Tier 5: Application hooks) → `core/adapters/supabaseDeviceSecurity.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useScopedNotifications.ts` (Tier 5: Application hooks) → `core/adapters/supabaseNotification.adapter.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useStorageString.ts` (Tier 5: Application hooks) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useStudentGoals.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/hooks/useTemporalHeatmap.ts` (Tier 5: Application hooks) → `core/adapters/supabase/uiExperienceRepository.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/lib/experienceState.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/lib/sync/hooks/useSyncStatus.ts` (Tier 5: Application hooks) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/feedback.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/errorClassifier.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/MutationAuditLog.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/outboxMigration.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/registry.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayAdmission.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayIdentity.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/replayPolicy.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/lib/sync/versionGating.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/monitoring/breadcrumbs.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useConflictStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/sync/SyncOrchestrator.tsx` (Tier 6: Presentation) → `core/store/useTemporalStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/lib/sync/useMutationQueue.ts` (Tier 5: Application hooks) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/offline/useOfflineStatus.ts` (Tier 5: Application hooks) → `core/adapters/subscribeToNetwork.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/offline/useOfflineStatus.ts` (Tier 5: Application hooks) → `core/platform/drivers/networkMonitor.ts` (Tier 3: Adapters): Tier 5: Application hooks may import only Tier 0: Contracts, Tier 2: Domain, Tier 4: State, Tier 5: Application hooks
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/AssetsProvider.tsx` (Tier 6: Presentation) → `core/logic/utils/LanguageUtils.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/logic/auth/identityState.ts` (Tier 2: Domain): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/scopeSession.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/providers/CapabilityHydrationProvider.tsx` (Tier 6: Presentation) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 6: Presentation may import only Tier 0: Contracts, Tier 5: Application hooks, Tier 6: Presentation
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/experienceState.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/scopeSession.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useActiveSubTabsStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useFeatureStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useTenantStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/resetScopedStores.ts` (Tier 4: State) → `core/store/useUIStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/store/scopeSession.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/scopeSessionCoordinator.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useActiveSubTabsStore.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConflictStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConflictStore.ts` (Tier 4: State) → `core/lib/sync/eventBus.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useConsentStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useDraftsStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useAuthStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/usePerspectiveStore.ts` (Tier 4: State) → `core/store/useCedarDecisionStore.ts` (Tier 4: State): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useSensoryStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useTenantStore.ts` (Tier 4: State) → `core/lib/storageWrapper.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/accountScope.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/native/guestScope.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root
- `core/store/useUIStore.ts` (Tier 4: State) → `core/lib/storage.ts` (Tier 3: Adapters): Tier 4: State may import only Tier 0: Contracts, Tier 1: Ports, Tier 2: Domain, Composition root

## misplaced (12)

- `core/lib/accountScope.ts` (Tier 3: Adapters): The session register: active account and a revision for dropping stale work (with native/guestScope.ts); belongs in packages/core/src/adapters/session/
- `core/lib/authProfileStorage.ts` (Tier 3: Adapters): Persists the auth profile; belongs in packages/core/src/adapters/storage/
- `core/lib/authStorage.ts` (Tier 3: Adapters): Reads and writes auth records in storage; belongs in packages/core/src/adapters/storage/
- `core/lib/devicePreferences.ts` (Tier 3: Adapters): Device preference records in storage; belongs in packages/core/src/adapters/storage/
- `core/lib/experienceState.ts` (Tier 4: State): A Zustand store with persistence; belongs in packages/core/src/store/
- `core/lib/featureRolloutSnapshot.ts` (Tier 2: Domain): Pure: turns a rollout port result into a flag snapshot; belongs in packages/core/src/logic/registry/
- `core/lib/scopedStateStorage.ts` (Tier 3: Adapters): Account-scoped persist storage; belongs in packages/core/src/adapters/storage/
- `core/lib/security/transportSecurity.ts` (Tier 3: Adapters): Guards and performs network fetches; belongs in packages/core/src/platform/drivers/
- `core/lib/storage.ts` (Tier 3: Adapters): Wraps the platform storage driver; belongs in packages/core/src/adapters/storage/
- `core/lib/storageWrapper.ts` (Tier 3: Adapters): Zustand persist storage over the storage adapter; belongs in packages/core/src/adapters/storage/
- `core/lib/sync/eventBus.ts` (Tier 3: Adapters): In-process pub/sub runtime; belongs in packages/core/src/adapters/events/
- `core/logic/permissions/signature.ts` (Tier 3: Adapters): Verifies signatures with the platform WebCrypto API, which is I/O; belongs in packages/core/src/platform/drivers/cryptoVault

## imports-retired (1)

- `core/logic/modes/noticeComposer.ts` (Tier 2: Domain) → `core/api/planBridge.orpc.contract.ts`: Live code depends on the retired pre-v1 client
