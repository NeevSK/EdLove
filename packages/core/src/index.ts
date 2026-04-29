// 1. Foundation (No relative dependencies)
import { v7 } from 'uuid';

export {
  type DeviceAccountProfile,
  type DeviceAccountRecord,
  deviceAccounts,
} from './accounts/deviceAccounts';
export { isDemo } from './api/demo';

// 4. API & Business Logic (Named exports for better tree-shaking)
export { deviceTrustAPI } from './api/deviceTrust';
export * from './constants/SriLankanSchools';
export * from './hooks';
export type { DownloadState } from './hooks/useMediaDownloader';
export { accountPin, validateAccountPin } from './lib/accountPin';
export {
  type CloudinaryUploadResponse,
  uploadToCloudinary,
} from './lib/cloudinary';
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
  getAuthorityLabel,
  getSchoolRoleForUser,
  getWorkRolesForUser,
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
export type { Role as AuthorityTier } from './logic/schemas/role.schema';
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
export {
  FlowResolver,
  type FlowResult,
} from './native/flows/FlowResolver';
export { GuestDataManager } from './native/guestDataManager';
export { GuestDataSync } from './native/guestDataSync';
export { Runtime } from './native/runtime';
export { authAPI, identityAPI, supabase } from './api';
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
// 2. Logic State & Storage (Zustand & Supabase)
export { type TotalState, useStore } from './store/useStore';
export { type TemporalScale, useTemporalStore } from './store/useTemporalStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export * from './types';
export { v7, v7 as uuidv7 };

import { z } from 'zod';

export * from './api';
export {
  useStudentAssignmentsQuery,
  useStudentClassroomsQuery,
  useStudentStatsQuery,
  useTeacherClassroomsQuery,
  useTeacherStatsQuery,
} from './api/hooks/classroom.hooks';
export * from './api/hooks/founder.hooks';
export { useEntity } from './hooks/useEntity';
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
export type {
  EntityDefinition,
  EntityMode,
  EntityType,
} from './logic/entities/entity-protocol';
export { type FieldAnalytics, formAnalytics } from './logic/forms/analytics';
export { FormHydrator } from './logic/forms/dynamic-loader';
export type { FormState } from './logic/forms/form-manager';
export { FormManager } from './logic/forms/form-manager';
export { GPACalculator } from './logic/grading/GPACalculator';
export * from './logic/permissions';
export { usePermissions } from './logic/permissions/hooks/usePermissions';
export type {
  Attendance,
  AttendanceStatus,
  StudentAttendance,
} from './logic/schemas/attendance.schema';
export {
  type AttendanceReport,
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from './logic/schemas/attendance.schema';
export type {
  Assignment,
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
export type {
  MappingTopologyZod,
  PulseMetricsZod,
} from './logic/schemas/dashboard.schema';
export {
  KnowledgeTopologySchema,
  PulseMetricsSchema,
} from './logic/schemas/dashboard.schema';
export type {
  Assessment,
  ClassroomGradingSettings,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  SchoolGradingCompletion,
  StudentGrade,
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
export type { Lesson } from './logic/schemas/lesson.schema';
export type { Material as LessonMaterial } from './logic/schemas/material.schema';
export type {
  InviteCodeZod,
  PrincipalInviteRole,
} from './logic/schemas/principal-workspace.schema';
export type { Role } from './logic/schemas/role.schema';
export { RoleSchema } from './logic/schemas/role.schema';
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
export {
  resolveWorkspaceSwitcherTargets,
  type WorkspaceSwitcherTarget,
} from './logic/workspace/workspaceSwitcher';
export { useWorkspaceLayoutSync } from './native/useWorkspaceLayoutSync';
export * from './types/Grading';
export * from './types/Inventory';
export * from './types/School';
export * from './types/StaffAttendance';
export * from './types/StaffLeave';
export * from './types/topology';
export * from './types/visualization';
export * from './types/Workspace';
export { z };
