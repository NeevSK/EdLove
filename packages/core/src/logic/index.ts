// Logic Hooks & Utilities

export { useAuthLifecycle } from '@repo/core/hooks/useAuthLifecycle';
export {
  type DeviceAccountRecord,
  useDeviceAccounts,
} from '@repo/core/hooks/useDeviceAccounts';
export { useDeviceSecurity } from '@repo/core/hooks/useDeviceSecurity';
export { useManualSnapshot } from '@repo/core/hooks/useManualSnapshot';
// Logic Hooks & Utilities
export { usePerspectiveSwitch } from '@repo/core/hooks/usePerspectiveSwitch';
export {
  type SanctuaryVisitorState,
  useSanctuaryVisitor,
} from '@repo/core/hooks/useSanctuaryVisitor';
export { useScopedDeviceSecurity } from '@repo/core/hooks/useScopedDeviceSecurity';
export { useTemporalHeatmap } from '@repo/core/hooks/useTemporalHeatmap';
export { accountPin } from '@repo/core/lib/accountPin.adapter';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from '@repo/core/lib/inviteCodes.adapter';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '@repo/core/lib/pendingGateAction.adapter';
export {
  buildPartitionedKey,
  type PartitionKeyOptions,
  StorageKeys,
  storage,
} from '@repo/core/lib/storage.adapter';
export { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
export type {
  AccountLifecycleCommand,
  AccountLifecycleResult,
} from '@repo/core/logic/accountLifecycle';
export * from '@repo/core/logic/apiInterceptor.adapter';
export {
  type AuthCallbackAttempt,
  type AuthCallbackPurpose,
  consumeAuthCallbackAttempt,
  issueAuthCallbackAttempt,
} from '@repo/core/logic/auth/authCallbackAttempt';
export {
  type AuthCallbackIntent,
  classifyAuthCallback,
} from '@repo/core/logic/auth/authCallbackPolicy';
export {
  getAuthRouteDecision,
  getAuthRouteTarget,
  isPublicBootstrapRoute,
} from '@repo/core/logic/auth/bootstrapRoutes';
export { DeepLinkStateGuard } from '@repo/core/logic/auth/deepLinkStateGuard';
export {
  getSessionIdentityMode,
  type IdentityAvailability,
  isActiveIdentityProfile,
  isAnonymousIdentity,
  isAnonymousSession,
  isDemoSession,
  isLocalOnlyIdentity,
  isResolvedAuthSubjectCurrent,
  isSandboxSession,
} from '@repo/core/logic/auth/identityState';
export * from '@repo/core/logic/capabilityDecision';
export {
  classifyRouteIntent,
  classifyRouteIntentEffect,
  decodeInstallReferrer,
  decodeInstallReferrerEffect,
  type RouteIntent,
  type ValidatedReferrerIntent,
} from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
export { DeepLinkType, handleDeepLink } from '@repo/core/logic/deeplink/handleDeepLink.adapter';
export {
  isPendingIntentExpired,
  type PendingDeepLinkIntent,
  type PendingIntentStoreState,
  pendingIntentStore,
  usePendingIntentStore,
} from '@repo/core/logic/deeplink/pendingIntent.store';
export type * from '@repo/core/logic/ports/attendanceProjection.port';
export type * from '@repo/core/logic/ports/classroomNotes.port';
export type * from '@repo/core/logic/ports/educational.port';
export type * from '@repo/core/logic/ports/founder.port';
export type * from '@repo/core/logic/ports/gradingProjection.port';
export * from '@repo/core/logic/domains/guardian/gradeVisibility';
export type * from '@repo/core/logic/ports/guardian.port';
export type * from '@repo/core/logic/ports/principalWorkspace.port';
export * from '@repo/core/logic/domains/profile/onboarding';
export type * from '@repo/core/logic/ports/profile.port';
export * from '@repo/core/logic/domains/social/composer.reducer';
export type * from '@repo/core/logic/ports/teacherInsights.port';
export type * from '@repo/core/logic/ports/workspaceLayout.port';
export * from '@repo/core/types/entityProtocol';
export * from '@repo/core/logic/events/bus';
export * from '@repo/core/logic/experience/mode';
// Experience Logic (Moved from legacy context)
export * from '@repo/core/logic/experience/ActivityPulseContext';
export * from '@repo/core/logic/forms';
export * from '@repo/core/logic/grading';
export { default as i18n } from '@repo/core/logic/i18n/i18n.adapter';
export * from '@repo/core/logic/mediaReducer';
export {
  meetsSubscriptionTier,
  resolveScopedEntitlement,
  satisfiesEntitlementRequirement,
} from '@repo/core/logic/permissions/entitlement';
export * from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
export * from '@repo/core/logic/permissions/sanctuaryFeature';
export * from '@repo/core/logic/permissions/sovereignty';
export type {
  AccountTransitionDisposition,
  AccountTransitionOutcome,
  AccountTransitionPort,
  AccountTransitionRequest,
} from '@repo/core/logic/ports/accountTransition.port';
export type { IAnalyticsPort } from '@repo/core/logic/ports/analytics.port';
export type {
  AuthorizationDecision,
  AuthorizationRequest,
  IAuthorizationPort,
} from '@repo/core/logic/ports/authz.port';
export type {
  EntitlementGrant,
  EntitlementReadiness,
  EntitlementRequirement,
  EntitlementScope,
  EntitlementScopeContext,
  EntitlementSnapshot,
  IEntitlementPort,
  SubscriptionTier,
} from '@repo/core/logic/ports/entitlement.port';
export type { IEventBusPort } from '@repo/core/logic/ports/eventBus.port';
export type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@repo/core/logic/ports/featureRollout.port';
export * from '@repo/core/logic/registry/featureLifecycleManifest';
export * from '@repo/core/logic/registry/featureLifecyclePolicy';
export * from '@repo/core/logic/registry/useDomainFeature';
export * from '@repo/core/logic/runtimeRegistry';
export * from '@repo/core/logic/schemas';
export * from '@repo/core/store/slices/auth.slice';
export * from '@repo/core/store/slices/tenant.slice';
export * from '@repo/core/store/slices/ui.slice';
export * from '@repo/core/logic/utils';
export * from '@repo/core/logic/workspace/index';
export { cryptoVault } from '@repo/core/platform/drivers/cryptoVault';
export { useAuth } from '@repo/core/hooks/useAuth';
export {
  CapabilityHydrationProvider,
  useCapabilityHydration,
} from '@repo/core/providers/CapabilityHydrationProvider';
export { GlobalProvider } from '@repo/core/providers/GlobalProvider';
export {
  type ActiveSubTabItem,
  type ActiveSubTabsState,
  type NavigationPreferences,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';
export { useAuthStore } from '@repo/core/store/useAuthStore';
export { useConsentStore } from '@repo/core/store/useConsentStore';
export { type DraftEntry, type DraftsState, useDraftsStore } from '@repo/core/store/useDraftsStore';
export { useFeatureStore } from '@repo/core/store/useFeatureStore';
export { useTemporalStore } from '@repo/core/store/useTemporalStore';
// Types (Agnostic / logic-layer)
export type { Bond } from '@repo/core/types';
export type { APIError } from '@repo/core/types/API';
// sanctuaryFeature re-exports the four core citizenship symbols, so only the
// remaining helper is pulled from the registry to avoid duplicate exports.
export { citizenshipName } from '@repo/core/types/citizenship';
// registry/citizenship is re-exported selectively above (line ~72) because
// sanctuaryFeature already re-exports its four main symbols.
export * from '@repo/core/types/domainEntry';
export type { LessonMaterial } from '@repo/core/types/LessonMaterial';
export {
  PRODUCT_ANALYTICS_EVENTS,
  type ProductAnalyticsContext,
  type ProductAnalyticsEntitlementScope,
  type ProductAnalyticsEvent,
  type ProductAnalyticsEventName,
  type ProductAnalyticsEventProperties,
  type ProductAnalyticsScalar,
} from '@repo/core/types/productAnalytics';
export type { TemporalScale } from '@repo/core/types/Temporal';

export {
  type ParsedInstitutionalQR,
  parseInstitutionalQR,
} from './utils/institutionalQrParser';
