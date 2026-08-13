/* eslint-disable import-x/export */
// 1. Foundation (No relative dependencies)

export {
  type DeviceAccountProfile,
  type DeviceAccountRecord,
  deviceAccounts,
} from '@repo/core/accounts/deviceAccounts';
export { isDemo } from '@repo/core/api/demo';
// 4. API & Business Logic (Named exports for better tree-shaking)
export { deviceTrustAPI } from '@repo/core/api/deviceTrust';
export { accountPin, validateAccountPin } from '@repo/core/lib/accountPin';
export { marksToGPA } from '@repo/core/lib/grading';
export {
  CLASSROOM_RESOURCE_SCOPE,
  INSTITUTIONAL_RESOURCE_SCOPE,
  RESOURCE_OWNER_CONTEXT,
  resolveResourceOwnerContext,
} from '@repo/core/lib/inventoryScope';
export {
  formatDuration,
  formatFileSize,
  getMediaThumbnail,
  getMediaUrl,
} from '@repo/core/lib/mediaUtils';
export type { IPostHog } from '@repo/core/lib/monitoring/posthog';
export {
  identifyUser,
  initPostHog,
  injectPostHog,
  trackEvent,
} from '@repo/core/lib/monitoring/posthog';
export {
  captureException,
  clearSentryUser,
  initSentry,
  logBreadcrumb,
  setSentryUser,
} from '@repo/core/lib/monitoring/sentry';
export {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '@repo/core/lib/pendingGateAction';
export {
  getCapacityLabel,
  getSchoolCapacityForUser,
  getWorkCapacitiesForUser,
} from '@repo/core/lib/permissions';
export { StorageKeys, storage } from '@repo/core/lib/storage';
export { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
export type { SanctuaryAPIError } from '@repo/core/logic/apiInterceptor';
export { handleAPIError, withErrorHandling } from '@repo/core/logic/apiInterceptor';
export {
  createDomainServices,
  type DomainServices,
} from '@repo/core/logic/domains/factory';
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
} from '@repo/core/logic/events/bus';
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
} from '@repo/core/logic/events/bus';
export {
  ActivityPulseProvider,
  useActivityPulse,
} from '@repo/core/logic/experience/ActivityPulseContext';
export { default as i18n } from '@repo/core/logic/i18n/config';
export { mediaInitialState, mediaReducer } from '@repo/core/logic/mediaReducer';
export { coreRuntime } from '@repo/core/logic/runtimeRegistry';
export { LanguageUtils } from '@repo/core/logic/utils/LanguageUtils';
export { buildQRString, QRBuilder } from '@repo/core/logic/utils/QRBuilder';
export type { QRResolveResult } from '@repo/core/logic/utils/QRResolver';
export { resolveQR } from '@repo/core/logic/utils/QRResolver';
export {
  applyTemporalFilter,
  getTemporalRange,
  getTransactionRange,
  type TemporalRange,
} from '@repo/core/logic/utils/temporalUtils';
export { v4, v7, v7 as uuidv7 } from '@repo/core/logic/utils/uuid';
export {
  FlowResolver,
  type FlowResult,
} from '@repo/core/native/flows/FlowResolver';
export { GuestDataManager } from '@repo/core/native/guestDataManager';
export { GuestDataSync } from '@repo/core/native/guestDataSync';
export { Runtime } from '@repo/core/native/runtime';
export {
  invalidateResilience,
  type ResilienceOptions,
  withResilience,
} from '@repo/core/offline/resilience';
export { AssetsProvider } from '@repo/core/providers/AssetsProvider';
export { AuthorityLifecycleProvider } from '@repo/core/providers/AuthorityLifecycleProvider';
// 3. Auth & Context
export { AuthProvider, useAuth } from '@repo/core/providers/AuthProvider';
export { GlobalProvider } from '@repo/core/providers/GlobalProvider';
export type { FeatureSlice } from '@repo/core/store/slices/feature.slice';
export { useAuthStore } from '@repo/core/store/useAuthStore';
export { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
export { useFeatureStore } from '@repo/core/store/useFeatureStore';
// 2. Logic State & Storage (Zustand & Supabase)
export { type TotalState, useStore } from '@repo/core/store/useStore';
export { type TemporalScale, useTemporalStore } from '@repo/core/store/useTemporalStore';
export { useTenantStore } from '@repo/core/store/useTenantStore';
export { useUIStore } from '@repo/core/store/useUIStore';
export * from '@repo/core/types';

import { z } from 'zod';

export { AnalyticsEngine as formAnalytics } from '@intuitui-labs/form-builder-engine/analytics';
export type { FormState } from '@intuitui-labs/form-builder-engine/core';
export { FormManager } from '@intuitui-labs/form-builder-engine/core';
export {
  clearCustomValidators,
  FormHydrator,
  registerCustomValidator,
} from '@intuitui-labs/form-builder-engine/hydration';
export type { ValidatorRule } from '@intuitui-labs/form-builder-engine/schema';
export { applyRule, validateRules } from '@intuitui-labs/form-builder-engine/validation';
export { GrowthBookFeatureRolloutAdapter } from '@repo/core/adapters/feature-rollout/growthBookFeatureRollout.adapter';
// Hexagonal Adapters
export { SupabaseEntitlementAdapter } from '@repo/core/adapters/supabase/supabaseEntitlement.adapter';
export * from '@repo/core/api/client';
export {
  type POAMetadata,
  POAMetadataSchema,
  type SovereignContract,
  type SovereignRoute,
} from '@repo/core/api/contracts';
export * from '@repo/core/constants/SriLankanSchools';
export * from '@repo/core/hooks';
export {
  type InviteCodeData,
  incrementInviteCodeUsage,
  validateInviteCode,
} from '@repo/core/lib/inviteCodes';
export { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
export { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
export { default as SyncManager } from '@repo/core/lib/sync/sync/SyncManager';
export type {
  MutationOutcome,
  QueuedMutation,
  QueuedMutationDispatchResult,
} from '@repo/core/lib/sync/types';
export { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
// Hexagonal Ports
export type {
  AuthorizationDecision,
  AuthorizationRequest,
  EntitlementGrant,
  EntitlementScope,
  EntitlementScopeContext,
  EntitlementSnapshot,
  IAnalyticsPort,
  IAuthorizationPort,
  IEntitlementPort,
} from '@repo/core/logic';
export { cryptoManager } from '@repo/core/logic';
export type {
  EntityDefinition,
  EntityMode,
  EntityType,
} from '@repo/core/logic/entities/entity-protocol';
export { GPACalculator } from '@repo/core/logic/grading/GPACalculator';
export * from '@repo/core/logic/permissions';
export type { Attendance } from '@repo/core/logic/schemas/attendance.schema';
export {
  type AttendanceReport,
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from '@repo/core/logic/schemas/attendance.schema';
export { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
export {
  AcademicCycleLeadershipAssignmentSchema,
  AcademicCycleLeadershipAssignmentStatusSchema,
  AcademicCycleLeadershipRoleSchema,
  AcademicCycleWithTermsSchema,
  AttendanceSessionKindSchema,
  AttendanceSessionSchema,
  DailyAttendanceSchema,
  DailyAttendanceStatusSchema,
  GradeClassSubjectSchema,
  GradeClassSubjectContextSchema,
  GradeClassSubjectStatusSchema,
} from '@repo/core/logic/schemas/academic-lifecycle.schema';
export {
  AcademicCycleSchema,
  AcademicCycleStatusSchema,
  GradeMarkCollectionSchema,
  GradeMarkLetterGradeSchema,
  GradeMarkPublicationStateSchema,
  GradeMarkSchema,
  GradeClassSchema,
  GradeClassStatusSchema,
  GradeClassTeacherAssignmentSchema,
  GradeClassTeacherAssignmentStatusSchema,
  GradeLevelSchema,
  TermKindSchema,
  TermSchema,
  selectGuardianVisibleGradeMarks,
} from '@repo/core/logic/schemas/grade-domain.schema';
export type {
  Echo,
  TeacherStats,
} from '@repo/core/logic/schemas/classroom.schema';
export {
  AssignmentSchema,
  ClassroomSchema,
  EchoSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from '@repo/core/logic/schemas/classroom.schema';
export {
  KnowledgeTopologySchema,
  PulseMetricsSchema,
} from '@repo/core/logic/schemas/dashboard.schema';
export type {
  Assessment,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  SchoolGradingCompletion,
} from '@repo/core/logic/schemas/grading.schema';
export {
  AssessmentSchema,
  ClassroomGradingSettingsSchema,
  GradebookSnapshotSchema,
  PublishedSchoolGradingCompletionSchema,
  PublishedStudentGradesSnapshotSchema,
  SchoolGradingCompletionSchema,
  StudentGradeSchema,
} from '@repo/core/logic/schemas/grading.schema';
export type {
  InviteCodeZod,
  PrincipalInviteRole,
} from '@repo/core/logic/schemas/principal-workspace.schema';
export type {
  LongitudinalEntityType,
  StudentLongitudinalEvent,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '@repo/core/logic/schemas/temporal.schema';
export {
  LongitudinalEntityTypeSchema,
  StudentLongitudinalEventSchema,
  StudentLongitudinalSnapshotSchema,
  StudentLongitudinalTimelineSchema,
} from '@repo/core/logic/schemas/temporal.schema';
export type { TenantKind } from '@repo/core/logic/schemas/user.schema';
export { UserSchema } from '@repo/core/logic/schemas/user.schema';
// User and other types are already exported from ./types
export { validateForm, validators } from '@repo/core/logic/utils/validators';
export * from '@repo/core/logic/workspace/canvas';
export { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
export { useWorkspaceLayoutSync } from '@repo/core/native/useWorkspaceLayoutSync';
export { z };
