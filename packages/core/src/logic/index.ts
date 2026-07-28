// Logic Hooks & Utilities

// ZENSTACK MODELS (Namespaced to avoid member collisions with Zod schemas)
export * as ZenModels from '@repo/schema';
export * from '@/api/history';
export {
  type DeviceAccountRecord,
  useDeviceAccounts,
} from '@/hooks/useDeviceAccounts';
export { useDeviceSecurity } from '@/hooks/useDeviceSecurity';
export { useManualSnapshot } from '@/hooks/useManualSnapshot';
// Logic Hooks & Utilities
export { useNotifications } from '@/hooks/useNotifications';
export { useTemporalHeatmap } from '@/hooks/useTemporalHeatmap';
export { accountPin } from '@/lib/accountPin';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from '@/lib/inviteCodes';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '@/lib/pendingGateAction';
export { StorageKeys, storage } from '@/lib/storage';
export { useMutationQueue } from '@/lib/sync/useMutationQueue';
export * from '@/logic/apiInterceptor';
export {
  getAuthRouteDecision,
  getAuthRouteTarget,
  isPublicBootstrapRoute,
} from '@/logic/auth/bootstrapRoutes';
export {
  getSessionIdentityMode,
  isAnonymousIdentity,
  isAnonymousSession,
  isDemoSession,
  isSandboxSession,
} from '@/logic/auth/identityState';
export * from '@/logic/domains';
export * from '@/logic/entities';
export * from '@/logic/events/bus';
export * from '@/logic/experience';
// Experience Logic (Moved from legacy context)
export * from '@/logic/experience/ActivityPulseContext';
export * from '@/logic/forms';
export * from '@/logic/grading';
export { default as i18n } from '@/logic/i18n/config';
export { cryptoManager } from '@/logic/managers/CryptoManager';
export { DeepLinkType } from '@/logic/managers/DeepLinkManager';
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
} from '@/logic/managers/factory';
export * from '@/logic/mediaReducer';
export * from '@/logic/permissions/hooks/usePermissions';
export * from '@/logic/permissions/hooks/useSanctuaryFeature';
export * from '@/logic/permissions/sanctuaryFeature';
export type { IAnalyticsPort } from '@/logic/ports/analytics.port';
export type {
  AuthorizationDecision,
  AuthorizationRequest,
  IAuthorizationPort,
} from '@/logic/ports/authz.port';
export type {
  EntitlementGrant,
  EntitlementReadiness,
  EntitlementRequirement,
  EntitlementScope,
  EntitlementScopeContext,
  EntitlementSnapshot,
  IEntitlementPort,
  SubscriptionTier,
} from '@/logic/ports/entitlement.port';
export {
  meetsSubscriptionTier,
  resolveScopedEntitlement,
  satisfiesEntitlementRequirement,
} from '@/logic/ports/entitlement.port';
export type { IEventBusPort } from '@/logic/ports/eventBus.port';
export type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@/logic/ports/featureRollout.port';
export {
  PRODUCT_ANALYTICS_EVENTS,
  type ProductAnalyticsContext,
  type ProductAnalyticsEntitlementScope,
  type ProductAnalyticsEvent,
  type ProductAnalyticsEventName,
  type ProductAnalyticsEventProperties,
  type ProductAnalyticsScalar,
} from '@/logic/ports/productAnalytics.port';
export * from '@/logic/registry/appCatalog';
export * from '@/logic/registry/citizenship';
export * from '@/logic/registry/domainEntry';
export * from '@/logic/registry/featureLifecycleManifest';
export * from '@/logic/registry/featureLifecyclePolicy';
export * from '@/logic/registry/useDomainFeature';
export * from '@/logic/runtimeRegistry';
export * from '@/logic/schemas';
export * from '@/logic/store-slices';
export * from '@/logic/utils';
export * from '@/logic/workspace/index';
export { useAuthLifecycle } from '@/native/useAuthLifecycle';
export { useAuth } from '@/providers/AuthProvider';
export { GlobalProvider } from '@/providers/GlobalProvider';
export { useAuthStore } from '@/store/useAuthStore';
export { useFeatureStore } from '@/store/useFeatureStore';
export { type TotalState, useStore } from '@/store/useStore';
export { type TemporalScale, useTemporalStore } from '@/store/useTemporalStore';
// Types (Agnostic / logic-layer)
export type { Bond } from '@/types';
export type { APIError } from '@/types/API';
export type { LessonMaterial } from '@/types/LessonMaterial';
