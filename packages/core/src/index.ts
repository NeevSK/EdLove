export * from './api';
export * from './offline/resilience';
export * from './hooks';
export * from './context/ActivityPulseContext';
export * from './store/useStore';
export { useAuthStore } from './store/useAuthStore';
export { useTenantStore } from './store/useTenantStore';
export { useUIStore } from './store/useUIStore';
export { AuthorityLifecycleProvider } from './providers/AuthorityLifecycleProvider';
export { AssetsProvider } from './providers/AssetsProvider';
export { LanguageUtils } from './utils/LanguageUtils';
export { default as i18n } from './i18n/config';
export { useGuardedNavigation } from './permissions/hooks/useGuardedNavigation';
export * from './providers/AuthProvider';
export { GlobalProvider } from './providers/GlobalProvider';
export * from './store/useTemporalStore';
export * from './utils/temporalUtils';


export * from './types';
export * from './constants/SriLankanSchools';
export * from './lib/supabase';
export * from './lib/mediaUtils';
export * from './lib/permissions';
export * from './lib/apiInterceptor';
export * from './lib/sync';
export * from './lib/grading';
export * from './lib/monitoring/sentry';
export * from './lib/monitoring/posthog';
export * from './lib/runtime';
export * from './lib/storage';
export * from './lib/storageWrapper';
export * from './lib/guestDataManager';
export * from './lib/cloudinary';
export * from './lib/pendingGateAction';
export * from './lib/inventoryScope';
export { isDemo } from './api/demo';
export * from './lib/flows/FlowResolver';
export * from './lib/guestDataSync';
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
// Resolving ambiguities for roles and tenancy types
export * from './permissions/schemas/role.schema';
export * from './permissions/schemas/user.schema';
export * from './api/schemas/dashboard.schema';
export * from './api/schemas/founder.schema';
// Exporting the schema as a whole, but avoid re-exporting the types if they clash
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
export { AssessmentSchema, GradeSchema } from './api/schemas/grading.schema';
export type { Assessment, Grade } from './api/schemas/grading.schema';
export { UserSchema } from './api/schemas/user.schema';
export type { User } from './api/schemas/user.schema';

export * from './api/hooks/founder.hooks';
export * from './api/hooks/classroom.hooks';

// Ensure consistent zod instance
export { z } from 'zod';
