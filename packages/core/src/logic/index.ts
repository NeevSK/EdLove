// Unified exports for cross-package alignment
export { api } from '../api';
export { type AuditLogEntry, historyAPI } from '../api/history';
export { type DeviceAccountRecord, useDeviceAccounts } from '../hooks/useDeviceAccounts';
export { useManualSnapshot } from '../hooks/useManualSnapshot';
// Logic Hooks & Utilities
export { type AppNotification, useNotifications } from '../hooks/useNotifications';
export { useTemporalHeatmap } from '../hooks/useTemporalHeatmap';
export { accountPin } from '../lib/accountPin';
export { useMutationQueue } from '../lib/sync/useMutationQueue';
export { useAuthorityLifecycle } from '../native/useAuthorityLifecycle';
export { useAuth } from '../providers/AuthProvider';
export { useAuthStore } from '../store/useAuthStore';
export { useFeatureStore } from '../store/useFeatureStore';
export { useStore } from '../store/useStore';
export { useTemporalStore } from '../store/useTemporalStore';
export type { APIError } from '../types/API';
// Types (Agnostic / logic-layer)
export type { AuthorityTier } from '../types/Authority';
export * from './apiInterceptor';
export * from './domains';
export * from './entities';
export * from './events/bus';
export * from './experience';
// Experience Logic (Moved from legacy context)
export * from './experience/ActivityPulseContext';
export * from './forms';
// ZENSTACK MODELS (Namespaced to avoid member collisions with Zod schemas)
export * as ZenModels from './generated';
export * from './i18n';
export { default as i18n } from './i18n/config';
export * from './permissions/abilities/base';
// Protocol-Oriented Authority (POA)
export * from './permissions/composer';
export * from './permissions/feature-engine';
export * from './permissions/guards/FeatureGuard';
export * from './permissions/guards/RouteGuard';
export * from './permissions/hooks/usePermissions';
export * from './runtimeRegistry';
export * from './schemas';
export * from './store-slices';
export * from './utils';
export * from './workspace/index';
