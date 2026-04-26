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
export {
  SRI_LANKAN_SCHOOL_TYPES,
  SCHOOL_SECTIONS,
  SRI_LANKAN_PROVINCES,
  SRI_LANKAN_DISTRICTS,
} from './constants/SriLankanSchools';

export {
  accountPin,
  validateAccountPin,
} from './lib/accountPin';
export { uploadToCloudinary, type CloudinaryUploadResponse } from './lib/cloudinary';
export {
  CLASSROOM_RESOURCE_SCOPE,
  INSTITUTIONAL_RESOURCE_SCOPE,
  RESOURCE_OWNER_CONTEXT,
  resolveResourceOwnerContext,
} from './lib/inventoryScope';
export {
  formatFileSize,
  formatDuration,
  getMediaUrl,
  getMediaThumbnail,
} from './lib/mediaUtils';
export { initPostHog, trackEvent, identifyUser, IPostHog } from './lib/monitoring/posthog';
export {
  captureException,
  clearSentryUser,
  initSentry,
  logBreadcrumb,
  setSentryUser,
} from './lib/monitoring/sentry';
export {
  type PendingGateAction,
  setPendingGateAction,
  getPendingGateAction,
  clearPendingGateAction,
} from './lib/pendingGateAction';
export {
  getAuthorityLabel,
  getSchoolRoleForUser,
  getWorkRolesForUser,
} from './lib/permissions';
export { StorageKeys, storage } from './lib/storage';
export { SafeZustandStorage } from './lib/storageWrapper';
export { handleAPIError, withErrorHandling, SanctuaryAPIError } from './logic/apiInterceptor';
export { createDomainServices, type DomainServices } from './logic/domains/factory';
export { type PlatformEvents } from './logic/events/bus';
export { ActivityPulseProvider, useActivityPulse } from './logic/experience/ActivityPulseContext';
export { default as i18n } from './logic/i18n/config';
export { LanguageUtils } from './logic/utils/LanguageUtils';
export { buildQRString, QRBuilder } from './logic/utils/QRBuilder';
export type { QRResolveResult } from './logic/utils/QRResolver';
export { resolveQR } from './logic/utils/QRResolver';
export {
  getTemporalRange,
  getTransactionRange,
  type TemporalRange,
} from './logic/utils/temporalUtils';
export { FlowResolver, type FlowResult, type FlowIntent, type FlowOutcome } from './native/flows/FlowResolver';
export { GuestDataManager } from './native/guestDataManager';
export { GuestDataSync } from './native/guestDataSync';
export { Runtime } from './native/runtime';
export { supabase } from './native/supabase';
export { withResilience, invalidateResilience, type ResilienceOptions } from './offline/resilience';
export { AssetsProvider } from './providers/AssetsProvider';
export { AuthorityLifecycleProvider } from './providers/AuthorityLifecycleProvider';
// 3. Auth & Context
export { AuthProvider, useAuth } from './providers/AuthProvider';
export { GlobalProvider } from './providers/GlobalProvider';
export type { FeatureSlice } from './store/slices/feature.slice';
export { useAuthStore } from './store/useAuthStore';
export { useFeatureStore } from './store/useFeatureStore';
// 2. Logic State & Storage (Zustand & Supabase)
export { useStore } from './store/useStore';
export { useTemporalStore } from './store/useTemporalStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export type {
  AppConfig,
  AppContext,
  DeviceInfo,
} from './types';
export { v7, v7 as uuidv7 };

import { z } from 'zod';

export { 
  useTeacherClassroomsQuery, 
  useStudentClassroomsQuery,
  useTeacherStatsQuery,
  useStudentStatsQuery,
} from './api/hooks/classroom.hooks';
export { 
  useEcosystemStatsQuery, 
  useEcosystemPulseQuery, 
  useSentinelGovernanceQuery 
} from './api/hooks/founder.hooks';
export { useEntity } from './hooks/useEntity';
export { validateInviteCode, incrementInviteCodeUsage, type InviteCodeData } from './lib/inviteCodes';
export { generateIdempotencyKey } from './lib/sync/idempotency';
export { useMutationAuditLog } from './lib/sync/MutationAuditLog';
export { default as SyncManager } from './lib/sync/sync/SyncManager';
export type { MutationOutcome } from './lib/sync/types';
export { useMutationQueue } from './lib/sync/useMutationQueue';
export { type EntityType, type EntityMode, type EntityDefinition } from './logic/entities/entity-protocol';
export { type FieldAnalytics, formAnalytics } from './logic/forms/analytics';
export { FormHydrator } from './logic/forms/dynamic-loader';
export type { FormState } from './logic/forms/form-manager';
export { FormManager } from './logic/forms/form-manager';
export type {
  Attendance,
  AttendanceStatus,
  StudentAttendance,
} from './logic/schemas/attendance.schema';
export {
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from './logic/schemas/attendance.schema';
export type {
  Assignment,
} from './logic/schemas/classroom.schema';
export {
  AssignmentSchema,
  ClassroomSchema,
  EchoSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from './logic/schemas/classroom.schema';
export type { MappingTopologyZod, PulseMetricsZod } from './logic/schemas/dashboard.schema';
export { KnowledgeTopologySchema, PulseMetricsSchema } from './logic/schemas/dashboard.schema';
export type {
  Assessment,
  ClassroomGradingSettings,
  GradebookSnapshot,
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
export { Role, RoleSchema } from './logic/schemas/role.schema';
export type { User } from './logic/schemas/user.schema';
export { UserSchema } from './logic/schemas/user.schema';
export { validators } from './logic/utils/validators';
export {
  type WorkspaceSwitcherTarget,
  resolveWorkspaceSwitcherTargets,
} from './logic/workspace/workspaceSwitcher';
export { useWorkspaceLayoutSync } from './native/useWorkspaceLayoutSync';
export type { SchoolGrade, Section } from './types/School';
export { z };
