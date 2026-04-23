// Unified exports for cross-package alignment
export { api } from '../api';
export { historyAPI, type AuditLogEntry } from '../api/history';
export { useAuthorityLifecycle } from '../native/useAuthorityLifecycle';
export { useAuth } from '../providers/AuthProvider';
export { useStore } from '../store/useStore';
export { useAuthStore } from '../store/useAuthStore';
export { useFeatureStore } from '../store/useFeatureStore';
export { useTemporalStore } from '../store/useTemporalStore';
export * from './apiInterceptor';
export * from './domains';
export * from './entities';
export * from './experience';
export * from './forms';
// ZENSTACK MODELS (Namespaced to avoid member collisions with Zod schemas)
export * as ZenModels from './generated';
export * from './i18n';
export { default as i18n } from './i18n/config';
export * from './schemas';
export * from './store-slices';
export * from './utils';
export * from './workspace/index';
export * from './events/bus';
export { handlers as inngestHandlers } from './events/handlers';

// Types (Agnostic / logic-layer)
export type { AuthorityTier } from '../types/Authority';
export type { APIError } from '../types/API';

// Protocol-Oriented Authority (POA)
export * from './permissions/composer';
export * from './permissions/guards/FeatureGuard';
export * from './permissions/guards/RouteGuard';
export * from './permissions/hooks/usePermissions';
export * from './permissions/feature-engine';
export * from './permissions/abilities/base';

// Experience Logic (Moved from legacy context)
export * from './experience/ActivityPulseContext';

// Logic Hooks & Utilities
export { useNotifications, type AppNotification } from '../hooks/useNotifications';
export { useDeviceAccounts, type DeviceAccountRecord } from '../hooks/useDeviceAccounts';
export { useManualSnapshot } from '../hooks/useManualSnapshot';
export { useTemporalHeatmap } from '../hooks/useTemporalHeatmap';
export { useMutationQueue } from '../lib/sync/useMutationQueue';
export { accountPin } from '../lib/accountPin';
