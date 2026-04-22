// 1. Foundation (No relative dependencies)

export * from './accounts/deviceAccounts';
// 4. API & Business Logic
export * from './api';
export { isDemo } from './api/demo';
export * from './constants/SriLankanSchools';
export * from './context/ActivityPulseContext';
export * from './hooks';
export { default as i18n } from './i18n/config';
export * from './lib/accountPin';
export * from './lib/apiInterceptor';
export * from './lib/cloudinary';
export * from './lib/flows/FlowResolver';
export * from './lib/guestDataManager';
export * from './lib/guestDataSync';
export * from './lib/inventoryScope';
export * from './lib/mediaUtils';
export * from './lib/monitoring/sentry';
export * from './lib/pendingGateAction';
export * from './lib/permissions';
export { Runtime } from './lib/runtime';
export { storage } from './lib/storage';
export { SafeZustandStorage } from './lib/storageWrapper';
export { supabase } from './lib/supabase';
export * from './offline/resilience';
export type { FeatureFlags } from './permissions/feature-engine';
export { useGuardedNavigation } from './permissions/hooks/useGuardedNavigation';
export { AssetsProvider } from './providers/AssetsProvider';
export { AuthorityLifecycleProvider } from './providers/AuthorityLifecycleProvider';
// 3. Auth & Context
export * from './providers/AuthProvider';
export { GlobalProvider } from './providers/GlobalProvider';
export type { FeatureSlice } from './store/slices/feature.slice';
export { useAuthStore } from './store/useAuthStore';
export { useFeatureStore } from './store/useFeatureStore';
// 2. Logic State & Storage (Zustand & Supabase)
export * from './store/useStore';
export * from './store/useTemporalStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export * from './types';
export { LanguageUtils } from './utils/LanguageUtils';
export { buildQRString, QRBuilder } from './utils/QRBuilder';
export type { QRResolveResult } from './utils/QRResolver';
export { resolveQR } from './utils/QRResolver';
export * from './utils/temporalUtils';

import { z } from 'zod';

export * from './api/hooks/classroom.hooks';
export * from './api/hooks/founder.hooks';
export type {
  Attendance,
  AttendanceStatus,
  StudentAttendance,
} from './api/schemas/attendance.schema';
export {
  AttendanceSchema,
  AttendanceStatusSchema,
  StudentAttendanceSchema,
} from './api/schemas/attendance.schema';
export type {
  Assignment,
  Classroom,
  Echo,
  StudentStats,
  TeacherStats,
} from './api/schemas/classroom.schema';
// Unified Schema Exports (Avoiding Clashes)
export {
  AssignmentSchema,
  ClassroomSchema,
  EchoSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from './api/schemas/classroom.schema';
export type { MappingTopologyZod, PulseMetricsZod } from './api/schemas/dashboard.schema';
export { KnowledgeTopologySchema, PulseMetricsSchema } from './api/schemas/dashboard.schema';
export type {
  Assessment,
  ClassroomGradingSettings,
  Grade,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  PublishedStudentGradesSnapshot,
  SchoolGradingCompletion,
  StudentGrade,
  StudentGradebookSnapshot,
} from './api/schemas/grading.schema';
export {
  AssessmentSchema,
  ClassroomGradingSettingsSchema,
  GradebookSnapshotSchema,
  GradeSchema,
  PublishedSchoolGradingCompletionSchema,
  PublishedStudentGradesSnapshotSchema,
  SchoolGradingCompletionSchema,
} from './api/schemas/grading.schema';
export type { Lesson } from './api/schemas/lesson.schema';
export type { Material as LessonMaterial } from './api/schemas/material.schema';
export type { InviteCodeZod, PrincipalInviteRole } from './api/schemas/principal-workspace.schema';
export type { User } from './api/schemas/user.schema';
export { UserSchema } from './api/schemas/user.schema';
export * from './entities/entity-protocol';
export * from './entities/useEntity';
export * from './forms/analytics';
export * from './forms/dynamic-loader';
export * from './forms/form-manager';
export * from './lib/inviteCodes';
export { default as SyncManager } from './lib/sync/sync/SyncManager';
export { useMutationQueue } from './lib/sync/useMutationQueue';
export * from './lib/workspace/canvas';
export * from './lib/workspace/useWorkspaceLayoutSync';
export * from './lib/workspace/workspaceSwitcher';
// Protocol-Oriented Authority (POA)
export * from './permissions/composer';
export * from './permissions/guards/FeatureGuard';
export * from './permissions/guards/RouteGuard';
export * from './permissions/hooks/usePermissions';
export * from './permissions/schemas/role.schema';
export * from './permissions/schemas/user.schema';
export type { SchoolGrade, Section } from './types/School';
export * from './utils/validators';
export { z };
