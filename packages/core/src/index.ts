// 1. Foundation (No relative dependencies)

export * from './accounts/deviceAccounts';
// 4. API & Business Logic
export * from './api';
export { isDemo } from './api/demo';
export * from './constants/SriLankanSchools';
export * from './logic/experience/ActivityPulseContext';
export * from './hooks';
export * from './lib/accountPin';
export * from './lib/cloudinary';
export * from './lib/inventoryScope';
export * from './lib/mediaUtils';
export * from './lib/monitoring/sentry';
export * from './lib/pendingGateAction';
export * from './logic/permissions/index';
export { Runtime } from './lib/runtime';
export { storage } from './lib/storage';
export { SafeZustandStorage } from './lib/storageWrapper';
export * from './logic/apiInterceptor';
export { default as i18n } from './logic/i18n/config';
export { LanguageUtils } from './logic/utils/LanguageUtils';
export { buildQRString, QRBuilder } from './logic/utils/QRBuilder';
export type { QRResolveResult } from './logic/utils/QRResolver';
export { resolveQR } from './logic/utils/QRResolver';
export * from './logic/utils/temporalUtils';
export * from './native/flows/FlowResolver';
export * from './native/guestDataManager';
export * from './native/guestDataSync';
export { supabase } from './native/supabase';
export * from './offline/resilience';
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

import { z } from 'zod';

export * from './api/hooks/classroom.hooks';
export * from './api/hooks/founder.hooks';
export * from './hooks/useEntity';
export * from './lib/inviteCodes';
export { default as SyncManager } from './lib/sync/sync/SyncManager';
export { useMutationQueue } from './lib/sync/useMutationQueue';
export * from './logic/entities/entity-protocol';
export * from './logic/forms/analytics';
export * from './logic/forms/dynamic-loader';
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
  Classroom,
  Echo,
  StudentStats,
  TeacherStats,
} from './logic/schemas/classroom.schema';
// Unified Schema Exports (Avoiding Clashes)
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
  Grade,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  PublishedStudentGradesSnapshot,
  SchoolGradingCompletion,
  StudentGrade,
  StudentGradebookSnapshot,
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
export * from './logic/schemas/role.schema';
export type { User } from './logic/schemas/user.schema';
export * from './logic/schemas/user.schema';
export { UserSchema } from './logic/schemas/user.schema';
export * from './logic/schemas/staff.schema';
export * from './logic/schemas/temporal.schema';
export * from './logic/utils/validators';
export * from './logic/workspace/canvas';
export * from './logic/workspace/workspaceSwitcher';
export * from './native/useWorkspaceLayoutSync';
export type { SchoolGrade, Section } from './types/School';
export { z };
