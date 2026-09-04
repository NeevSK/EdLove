// Logic Hooks & Utilities

export * from '@repo/core/api/history';
export { useAuthLifecycle } from '@repo/core/hooks/useAuthLifecycle';
export {
  type DeviceAccountRecord,
  useDeviceAccounts,
} from '@repo/core/hooks/useDeviceAccounts';
export { useDeviceSecurity } from '@repo/core/hooks/useDeviceSecurity';
export { useManualSnapshot } from '@repo/core/hooks/useManualSnapshot';
// Logic Hooks & Utilities
export { useNotifications } from '@repo/core/hooks/useNotifications';
export { useTemporalHeatmap } from '@repo/core/hooks/useTemporalHeatmap';
export { accountPin } from '@repo/core/lib/accountPin';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from '@repo/core/lib/inviteCodes';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '@repo/core/lib/pendingGateAction';
export { StorageKeys, storage } from '@repo/core/lib/storage';
export { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
export type {
  AccountLifecycleCommand,
  AccountLifecycleResult,
} from '@repo/core/logic/accountLifecycle';
export * from '@repo/core/logic/apiInterceptor';
export {
  getAuthRouteDecision,
  getAuthRouteTarget,
  isPublicBootstrapRoute,
} from '@repo/core/logic/auth/bootstrapRoutes';
export {
  getSessionIdentityMode,
  isActiveIdentityProfile,
  isAnonymousIdentity,
  isAnonymousSession,
  isDemoSession,
  isSandboxSession,
} from '@repo/core/logic/auth/identityState';
export * from '@repo/core/logic/domains';
export * from '@repo/core/logic/entities';
export * from '@repo/core/logic/events/bus';
export * from '@repo/core/logic/experience';
// Experience Logic (Moved from legacy context)
export * from '@repo/core/logic/experience/ActivityPulseContext';
export * from '@repo/core/logic/forms';
export * from '@repo/core/logic/grading';
export { default as i18n } from '@repo/core/logic/i18n/config';
export { cryptoManager } from '@repo/core/logic/managers/CryptoManager';
export { DeepLinkType } from '@repo/core/logic/managers/DeepLinkManager';
export {
  auth,
  authz,
  community,
  deepLink,
  deviceIdentity,
  educational,
  featureFlags,
  growth,
  identity,
  notification,
  profile,
  pushNotification,
} from '@repo/core/logic/managers/factory';
export * from '@repo/core/logic/mediaReducer';
export * from '@repo/core/logic/permissions/hooks/usePermissions';
export * from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
export * from '@repo/core/logic/permissions/sanctuaryFeature';
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
export {
  meetsSubscriptionTier,
  resolveScopedEntitlement,
  satisfiesEntitlementRequirement,
} from '@repo/core/logic/ports/entitlement.port';
export type { IEventBusPort } from '@repo/core/logic/ports/eventBus.port';
export type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@repo/core/logic/ports/featureRollout.port';
export {
  PRODUCT_ANALYTICS_EVENTS,
  type ProductAnalyticsContext,
  type ProductAnalyticsEntitlementScope,
  type ProductAnalyticsEvent,
  type ProductAnalyticsEventName,
  type ProductAnalyticsEventProperties,
  type ProductAnalyticsScalar,
} from '@repo/core/logic/ports/productAnalytics.port';
// sanctuaryFeature re-exports the four core citizenship symbols, so only the
// remaining helper is pulled from the registry to avoid duplicate exports.
export { citizenshipName } from '@repo/core/logic/registry/citizenship';
// registry/citizenship is re-exported selectively above (line ~72) because
// sanctuaryFeature already re-exports its four main symbols.
export * from '@repo/core/logic/registry/domainEntry';
export * from '@repo/core/logic/registry/featureLifecycleManifest';
export * from '@repo/core/logic/registry/featureLifecyclePolicy';
export * from '@repo/core/logic/registry/useDomainFeature';
export * from '@repo/core/logic/runtimeRegistry';
export * from '@repo/core/logic/schemas';
export * from '@repo/core/logic/store-slices';
export * from '@repo/core/logic/utils';
export * from '@repo/core/logic/workspace/index';
export { useAuth } from '@repo/core/providers/AuthProvider';
export { GlobalProvider } from '@repo/core/providers/GlobalProvider';
export { useAuthStore } from '@repo/core/store/useAuthStore';
export { useConsentStore } from '@repo/core/store/useConsentStore';
export { useFeatureStore } from '@repo/core/store/useFeatureStore';
export { type TotalState, useStore } from '@repo/core/store/useStore';
export { type TemporalScale, useTemporalStore } from '@repo/core/store/useTemporalStore';
// Types (Agnostic / logic-layer)
export type { Bond } from '@repo/core/types';
export type { APIError } from '@repo/core/types/API';
export type { LessonMaterial } from '@repo/core/types/LessonMaterial';
