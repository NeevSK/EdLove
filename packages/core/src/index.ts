// 1. Foundation (No relative dependencies)
export { Runtime } from './lib/runtime';
export * from './types';
export * from './lib/monitoring/sentry';

// 2. Logic State & Storage (Zustand & Supabase)
export * from './store/useStore';
export { useAuthStore } from './store/useAuthStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export { useFeatureStore } from './store/useFeatureStore';
export type { FeatureSlice } from './store/slices/feature.slice';
export type { FeatureFlags } from './permissions/feature-engine';
export * from './store/useTemporalStore';
export { supabase } from './lib/supabase';
export { storage } from './lib/storage';
export { SafeZustandStorage } from './lib/storageWrapper';
export * from './utils/temporalUtils';

// 3. Auth & Context
export * from './providers/AuthProvider';
export * from './context/ActivityPulseContext';
export { AuthorityLifecycleProvider } from './providers/AuthorityLifecycleProvider';
export { AssetsProvider } from './providers/AssetsProvider';
export { GlobalProvider } from './providers/GlobalProvider';

// 4. API & Business Logic
export * from './api';
export * from './offline/resilience';
export * from './hooks';
export { LanguageUtils } from './utils/LanguageUtils';
export { default as i18n } from './i18n/config';
export { useGuardedNavigation } from './permissions/hooks/useGuardedNavigation';
export * from './constants/SriLankanSchools';
export { resolveQR } from './utils/QRResolver';
export { buildQRString, QRBuilder } from './utils/QRBuilder';
export type { QRResolveResult } from './utils/QRResolver';

export * from './lib/mediaUtils';
export * from './lib/permissions';
export * from './lib/apiInterceptor';
export * from './lib/guestDataManager';
export * from './lib/cloudinary';
export * from './lib/pendingGateAction';
export * from './lib/inventoryScope';
export { isDemo } from './api/demo';
export * from './lib/flows/FlowResolver';
export * from './lib/guestDataSync';
import { z } from 'zod';
export { z };
export * from './lib/inviteCodes';
export * from './lib/workspace/canvas';
export * from './lib/workspace/useWorkspaceLayoutSync';
export * from './utils/validators';
export * from './forms/form-manager';
export * from './forms/dynamic-loader';
export * from './forms/analytics';
export * from './entities/entity-protocol';
export * from './entities/useEntity';

// Protocol-Oriented Authority (POA)
export * from './permissions/composer';
export * from './permissions/hooks/usePermissions';
export * from './permissions/guards/FeatureGuard';
export * from './permissions/guards/RouteGuard';
export * from './permissions/schemas/role.schema';
export * from './permissions/schemas/user.schema';

// Unified Schema Exports (Avoiding Clashes)
export {
    ClassroomSchema,
    AssignmentSchema,
    TeacherStatsSchema,
    StudentStatsSchema,
    EchoSchema,
} from './api/schemas/classroom.schema';

export type {
    Classroom,
    Assignment,
    TeacherStats,
    StudentStats,
    Echo
} from './api/schemas/classroom.schema';

export { AttendanceSchema, AttendanceStatusSchema, StudentAttendanceSchema } from './api/schemas/attendance.schema';
export type { Attendance, AttendanceStatus, StudentAttendance } from './api/schemas/attendance.schema';
export type { Section, SchoolGrade } from './types/School';
export { AssessmentSchema, GradeSchema, PublishedSchoolGradingCompletionSchema, ClassroomGradingSettingsSchema, GradebookSnapshotSchema, PublishedStudentGradesSnapshotSchema, SchoolGradingCompletionSchema } from './api/schemas/grading.schema';
export type { Assessment, Grade, PublishedSchoolGradingCompletion, ClassroomGradingSettings, GradebookSnapshot, PublishedStudentGradesSnapshot, SchoolGradingCompletion, StudentGrade, StudentGradebookSnapshot } from './api/schemas/grading.schema';
export { UserSchema } from './api/schemas/user.schema';
export type { User } from './api/schemas/user.schema';
export type { Lesson } from './api/schemas/lesson.schema';
export type { Material as LessonMaterial } from './api/schemas/material.schema';
export type { PrincipalInviteRole, InviteCodeZod } from './api/schemas/principal-workspace.schema';
export { KnowledgeTopologySchema, PulseMetricsSchema } from './api/schemas/dashboard.schema';
export type { MappingTopologyZod, PulseMetricsZod } from './api/schemas/dashboard.schema';

export { useMutationQueue } from './lib/sync/useMutationQueue';
export { default as SyncManager } from './lib/sync/sync/SyncManager';

export * from './api/hooks/founder.hooks';
export * from './api/hooks/classroom.hooks';
