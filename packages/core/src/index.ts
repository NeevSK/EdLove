/* eslint-disable import-x/export */
// 1. Foundation (No relative dependencies)

export {
  type DeviceAccountProfile,
  type DeviceAccountRecord,
  deviceAccounts,
} from './accounts/deviceAccounts';
export { isDemo } from './api/demo';
// 4. API & Business Logic (Named exports for better tree-shaking)
export { deviceTrustAPI } from './api/deviceTrust';
export { accountPin, validateAccountPin } from './lib/accountPin';
export { marksToGPA } from './lib/grading';
export {
  CLASSROOM_RESOURCE_SCOPE,
  INSTITUTIONAL_RESOURCE_SCOPE,
  RESOURCE_OWNER_CONTEXT,
  resolveResourceOwnerContext,
} from './lib/inventoryScope';
export {
  formatDuration,
  formatFileSize,
  getMediaThumbnail,
  getMediaUrl,
} from './lib/mediaUtils';
export type { IPostHog } from './lib/monitoring/posthog';
export {
  identifyUser,
  initPostHog,
  injectPostHog,
  trackEvent,
} from './lib/monitoring/posthog';
export {
  captureException,
  clearSentryUser,
  initSentry,
  logBreadcrumb,
  setSentryUser,
} from './lib/monitoring/sentry';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from './lib/pendingGateAction';
export {
  getCapacityLabel,
  getSchoolCapacityForUser,
  getWorkCapacitiesForUser,
} from './lib/permissions';
export { StorageKeys, storage } from './lib/storage';
export { SafeZustandStorage } from './lib/storageWrapper';
export type { SanctuaryAPIError } from './logic/apiInterceptor';
export { handleAPIError, withErrorHandling } from './logic/apiInterceptor';
export {
  createDomainServices,
  type DomainServices,
} from './logic/domains/factory';
export type {
  PlatformEvents,
  SchoolAttendanceRecordedPayload,
  SchoolClassroomCreatedPayload,
  SchoolGradePublishedPayload,
  StudentOnboardedPayload,
  StudentSupportRequestedPayload,
  SyncMutationQueuedPayload,
  TeacherSummaryRequestedPayload,
  UserCreatedPayload,
  UserUpdatedPayload,
  WellbeingMoodLoggedPayload,
  WorkflowCorrelationMetadata,
} from './logic/events/bus';
export {
  injectWorkflowEventBridge,
  schemas,
  schoolAttendanceRecordedEvent,
  schoolClassroomCreatedEvent,
  schoolGradePublishedEvent,
  sendSchoolAttendanceRecorded,
  sendSchoolClassroomCreated,
  sendSchoolGradePublished,
  sendStudentOnboarded,
  sendStudentSupportRequested,
  sendSyncMutationQueued,
  sendTeacherSummaryRequested,
  sendUserCreated,
  sendUserUpdated,
  sendWellbeingMoodLogged,
  studentOnboardedEvent,
  studentSupportRequestedEvent,
  studentSupportRequestedPayloadSchema,
  syncMutationQueuedEvent,
  systemAuditLogEvent,
  teacherSummaryRequestedEvent,
  teacherSummaryRequestedPayloadSchema,
  userCreatedEvent,
  userUpdatedEvent,
  wellbeingMoodLoggedEvent,
} from './logic/events/bus';
export {
  ActivityPulseProvider,
  useActivityPulse,
} from './logic/experience/ActivityPulseContext';
export { default as i18n } from './logic/i18n/config';
export { mediaInitialState, mediaReducer } from './logic/mediaReducer';
export { coreRuntime } from './logic/runtimeRegistry';
export { LanguageUtils } from './logic/utils/LanguageUtils';
export { buildQRString, QRBuilder } from './logic/utils/QRBuilder';
export type { QRResolveResult } from './logic/utils/QRResolver';
export { resolveQR } from './logic/utils/QRResolver';
export {
  applyTemporalFilter,
  getTemporalRange,
  getTransactionRange,
  type TemporalRange,
} from './logic/utils/temporalUtils';
export { v4, v7, v7 as uuidv7 } from './logic/utils/uuid';
export {
  FlowResolver,
  type FlowResult,
} from './native/flows/FlowResolver';
export { GuestDataManager } from './native/guestDataManager';
export { GuestDataSync } from './native/guestDataSync';
export { Runtime } from './native/runtime';
export {
  invalidateResilience,
  type ResilienceOptions,
  withResilience,
} from './offline/resilience';
export { AssetsProvider } from './providers/AssetsProvider';
export { AuthorityLifecycleProvider } from './providers/AuthorityLifecycleProvider';
// 3. Auth & Context
export { AuthProvider, useAuth } from './providers/AuthProvider';
export { GlobalProvider } from './providers/GlobalProvider';
export type { FeatureSlice } from './store/slices/feature.slice';
export { useAuthStore } from './store/useAuthStore';
export { useFeatureStore } from './store/useFeatureStore';
export { usePermissionStore } from './store/usePermissionStore';
// 2. Logic State & Storage (Zustand & Supabase)
export { type TotalState, useStore } from './store/useStore';
export { type TemporalScale, useTemporalStore } from './store/useTemporalStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export * from './types';

import { z } from 'zod';

export { AnalyticsEngine as formAnalytics } from '@intuitui-labs/form-builder-engine/analytics';
export type { FormState } from '@intuitui-labs/form-builder-engine/core';
export { FormManager } from '@intuitui-labs/form-builder-engine/core';
export { FormHydrator } from '@intuitui-labs/form-builder-engine/hydration';
// Hexagonal Adapters
export { SupabaseEntitlementAdapter } from './adapters/supabase/supabaseEntitlement.adapter';
export { SupabaseFeatureFlagAdapter } from './adapters/supabase/supabaseFeatureFlag.adapter';
export * from './api';
export {
  adaptToHono,
  type POAMetadata,
  POAMetadataSchema,
  type SovereignContract,
  type SovereignRoute,
} from './api/contract';
export * from './constants/SriLankanSchools';
export * from './hooks';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from './lib/inviteCodes';
export { generateIdempotencyKey } from './lib/sync/idempotency';
export { useMutationAuditLog } from './lib/sync/MutationAuditLog';
export { default as SyncManager } from './lib/sync/sync/SyncManager';
export type {
  MutationOutcome,
  QueuedMutation,
  QueuedMutationDispatchResult,
} from './lib/sync/types';
export { useMutationQueue } from './lib/sync/useMutationQueue';
// Hexagonal Ports
export type {
  AuthorizationDecision,
  AuthorizationRequest,
  EntitlementSnapshot,
  IAnalyticsPort,
  IAuthorizationPort,
  IEntitlementPort,
  IFeatureFlagPort,
} from './logic';
export { cryptoManager } from './logic';
export type {
  EntityDefinition,
  EntityMode,
  EntityType,
} from './logic/entities/entity-protocol';
export { GPACalculator } from './logic/grading/GPACalculator';
export * from './logic/permissions';
export type { Attendance } from './logic/schemas/attendance.schema';
export {
  type AttendanceReport,
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from './logic/schemas/attendance.schema';
export { CapacitySchema } from './logic/schemas/capacity.schema';
export type {
  Echo,
  TeacherStats,
} from './logic/schemas/classroom.schema';
export {
  AssignmentSchema,
  ClassroomSchema,
  EchoSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from './logic/schemas/classroom.schema';
export {
  KnowledgeTopologySchema,
  PulseMetricsSchema,
} from './logic/schemas/dashboard.schema';
export type {
  Assessment,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  SchoolGradingCompletion,
} from './logic/schemas/grading.schema';
export {
  AssessmentSchema,
  ClassroomGradingSettingsSchema,
  GradebookSnapshotSchema,
  PublishedSchoolGradingCompletionSchema,
  PublishedStudentGradesSnapshotSchema,
  SchoolGradingCompletionSchema,
  StudentGradeSchema,
} from './logic/schemas/grading.schema';
export type {
  InviteCodeZod,
  PrincipalInviteRole,
} from './logic/schemas/principal-workspace.schema';
export type {
  LongitudinalEntityType,
  StudentLongitudinalEvent,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from './logic/schemas/temporal.schema';
export {
  LongitudinalEntityTypeSchema,
  StudentLongitudinalEventSchema,
  StudentLongitudinalSnapshotSchema,
  StudentLongitudinalTimelineSchema,
} from './logic/schemas/temporal.schema';
export type { TenantKind } from './logic/schemas/user.schema';
export { UserSchema } from './logic/schemas/user.schema';
// User and other types are already exported from ./types
export { validateForm, validators } from './logic/utils/validators';
export * from './logic/workspace/canvas';
export { resolveWorkspaceSwitcherTargets } from './logic/workspace/workspaceSwitcher';
export { useWorkspaceLayoutSync } from './native/useWorkspaceLayoutSync';
export { z };
