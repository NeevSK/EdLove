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
export * from '@repo/core/efficiency';
export { accountPin, validateAccountPin } from '@repo/core/lib/accountPin';
export {
  createPersistenceIdentity,
  derivePersistenceKey,
  derivePersistenceNamespace,
  PERSISTENCE_NAMESPACE_VERSION,
  requestGuestToAccountMigration,
  resolvePersistenceWriteDecision,
} from '@repo/core/lib/persistenceBoundary';
export type {
  ExplicitGuestToAccountMigration,
  PersistenceExperience,
  PersistenceIdentity,
  PersistenceIdentityInput,
  PersistencePrincipal,
  PersistenceWriteDecision,
  PersistenceWriteTarget,
  ProductionWriteBlockReason,
} from '@repo/core/lib/persistenceBoundary';
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
export * from '@repo/core/logic/capabilityDecision';
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
  invalidateResilience,
  type ResilienceOptions,
  withResilience,
} from '@repo/core/offline/resilience';
export { useResponsiveRenderer } from '@repo/core/platform/useResponsiveRenderer';
export { AssetsProvider } from '@repo/core/providers/AssetsProvider';
// 3. Auth & Context
export { AuthProvider, useAuth } from '@repo/core/providers/AuthProvider';
export {
  CapabilityHydrationProvider,
  useCapabilityHydration,
} from '@repo/core/providers/CapabilityHydrationProvider';
export { GlobalProvider } from '@repo/core/providers/GlobalProvider';
export type { FeatureSlice } from '@repo/core/store/slices/feature.slice';
// 2. Logic State & Storage (Zustand & Supabase)
export { type TotalState, useStore } from '@repo/core/store/useStore';
export { type TemporalScale, useTemporalStore } from '@repo/core/store/useTemporalStore';
export { useTenantStore } from '@repo/core/store/useTenantStore';
export { useUIStore } from '@repo/core/store/useUIStore';
export * from '@repo/core/types';
export type { IPostHog } from './monitoring';
export {
  captureException,
  clearSentryUser,
  identifyUser,
  initPostHog,
  initSentry,
  injectPostHog,
  logBreadcrumb,
  setSentryUser,
  trackEvent,
} from './monitoring';

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
export { useAccountDeletion } from '@repo/core/hooks/useAccountDeletion';
export {
  type AccountLifecycleExecutor,
  type AccountLifecycleState,
  accountLifecycleReducer,
  initialAccountLifecycleState,
  useAccountLifecycle,
} from '@repo/core/hooks/useAccountLifecycle';
export { useBanyanGrowth } from '@repo/core/hooks/useBanyanGrowth';
export { useClassroomCreation } from '@repo/core/hooks/useClassroomCreation';
export { useDeviceAccounts } from '@repo/core/hooks/useDeviceAccounts';
export { useDeviceSecurity } from '@repo/core/hooks/useDeviceSecurity';
export { useDomainRollout } from '@repo/core/hooks/useDomainRollout';
export {
  useClassroomNotes,
  useDomainServices,
  useEducational,
  useTeacherInsights,
} from '@repo/core/hooks/useDomainServices';
export { useEntity } from '@repo/core/hooks/useEntity';
export { useForm } from '@repo/core/hooks/useForm';
export { useGroupCreation } from '@repo/core/hooks/useGroupCreation';
export { useIdentity } from '@repo/core/hooks/useIdentity';
export { useIsGuest } from '@repo/core/hooks/useIsGuest';
export { useJourneyHistory } from '@repo/core/hooks/useJourneyHistory';
export {
  type LocalFirstQueryOptions,
  type LocalFirstQueryResult,
  useLocalFirstQuery,
} from '@repo/core/hooks/useLocalFirstQuery';
export { useManualSnapshot } from '@repo/core/hooks/useManualSnapshot';
export { type DownloadState, useMediaDownloader } from '@repo/core/hooks/useMediaDownloader';
export { useNaturePaths } from '@repo/core/hooks/useNaturePaths';
export { useNotifications } from '@repo/core/hooks/useNotifications';
export { usePendingActions } from '@repo/core/hooks/usePendingActions';
export { usePendingGateAction } from '@repo/core/hooks/usePendingGateAction';
export { useRewards } from '@repo/core/hooks/useRewards';
export { useSafeMutation } from '@repo/core/hooks/useSafeMutation';
export { useSchoolCreation } from '@repo/core/hooks/useSchoolCreation';
export { useStudentGoals } from '@repo/core/hooks/useStudentGoals';
export { useTaskActions } from '@repo/core/hooks/useTaskActions';
export { useTeacherClassroom } from '@repo/core/hooks/useTeacherClassroom';
export { useTemporalHeatmap } from '@repo/core/hooks/useTemporalHeatmap';
export { useTenantContext } from '@repo/core/hooks/useTenantContext';
export { useTracking } from '@repo/core/hooks/useTracking';
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
export {
  AcademicCycleLeadershipAssignmentSchema,
  AcademicCycleLeadershipAssignmentStatusSchema,
  AcademicCycleLeadershipRoleSchema,
  AcademicCycleWithTermsSchema,
  AttendanceSessionKindSchema,
  AttendanceSessionSchema,
  DailyAttendanceSchema,
  DailyAttendanceStatusSchema,
  GradeClassSubjectContextSchema,
  GradeClassSubjectSchema,
  GradeClassSubjectStatusSchema,
} from '@repo/core/logic/schemas/academic-lifecycle.schema';
export type { Attendance } from '@repo/core/logic/schemas/attendance.schema';
export {
  type AttendanceReport,
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from '@repo/core/logic/schemas/attendance.schema';
export { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
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
export {
  AcademicCycleSchema,
  AcademicCycleStatusSchema,
  GradeClassSchema,
  GradeClassStatusSchema,
  GradeClassTeacherAssignmentSchema,
  GradeClassTeacherAssignmentStatusSchema,
  GradeLevelSchema,
  GradeMarkCollectionSchema,
  GradeMarkLetterGradeSchema,
  GradeMarkPublicationStateSchema,
  GradeMarkSchema,
  selectGuardianVisibleGradeMarks,
  TermKindSchema,
  TermSchema,
} from '@repo/core/logic/schemas/grade-domain.schema';
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
export { z };
