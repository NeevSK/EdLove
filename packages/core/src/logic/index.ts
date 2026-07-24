// Logic Hooks & Utilities

// ZENSTACK MODELS (Namespaced to avoid member collisions with Zod schemas)
export * as ZenModels from '@repo/schema';
export * from '../api/history';
export {
  type DeviceAccountRecord,
  useDeviceAccounts,
} from '../hooks/useDeviceAccounts';
export { useDeviceSecurity } from '../hooks/useDeviceSecurity';
export { useManualSnapshot } from '../hooks/useManualSnapshot';
// Logic Hooks & Utilities
export { useNotifications } from '../hooks/useNotifications';
export { useTemporalHeatmap } from '../hooks/useTemporalHeatmap';
export { accountPin } from '../lib/accountPin';
export { getAuthRouteDecision, getAuthRouteTarget, isPublicBootstrapRoute } from './auth/bootstrapRoutes';
export {
  getSessionIdentityMode,
  isAnonymousIdentity,
  isAnonymousSession,
  isDemoSession,
  isSandboxSession,
} from './auth/identityState';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from '../lib/inviteCodes';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '../lib/pendingGateAction';
export { StorageKeys, storage } from '../lib/storage';
export { useMutationQueue } from '../lib/sync/useMutationQueue';
export { useAuthLifecycle } from '../native/useAuthLifecycle';
export { useAuth } from '../providers/AuthProvider';
export { GlobalProvider } from '../providers/GlobalProvider';
export { useAuthStore } from '../store/useAuthStore';
export { useFeatureStore } from '../store/useFeatureStore';
export { type TotalState, useStore } from '../store/useStore';
export { type TemporalScale, useTemporalStore } from '../store/useTemporalStore';
// Types (Agnostic / logic-layer)
export type { Bond } from '../types';
export type { APIError } from '../types/API';
export type { LessonMaterial } from '../types/LessonMaterial';
export * from './apiInterceptor';
export * from './domains';
export * from './entities';
export * from './events/bus';
export * from './experience';
// Experience Logic (Moved from legacy context)
export * from './experience/ActivityPulseContext';
export * from './forms';
export * from './grading';
export { default as i18n } from './i18n/config';
export { cryptoManager } from './managers/CryptoManager';
export { DeepLinkType } from './managers/DeepLinkManager';
export {
  auth,
  authz,
  community,
  deepLink,
  deviceIdentity,
  educational,
  featureFlags,
  globalConfig,
  growth,
  identity,
  notification,
  profile,
  pushNotification,
} from './managers/factory';
export * from './mediaReducer';
export * from './permissions/hooks/usePermissions';
export * from './permissions/hooks/useSanctuaryFeature';
export * from './permissions/sanctuaryFeature';
export type { IAnalyticsPort } from './ports/analytics.port';
export type {
  AuthorizationDecision,
  AuthorizationRequest,
  IAuthorizationPort,
} from './ports/authz.port';
export type { EntitlementSnapshot, IEntitlementPort } from './ports/entitlement.port';
export type { IEventBusPort } from './ports/eventBus.port';
export type { IFeatureFlagPort } from './ports/featureFlag.port';
export type { FeatureRolloutSnapshot, IFeatureRolloutPort } from './ports/featureRollout.port';
export * from './runtimeRegistry';
export * from './schemas';
export * from './store-slices';
export * from './utils';
export * from './workspace/index';
export * from './registry/citizenship';
export * from './registry/domainEntry';
export * from './registry/appCatalog';
export * from './registry/useDomainFeature';

