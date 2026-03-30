import type {
    GuardianDashboard,
    GuardianIdentity,
    GuardianNotificationSettings,
    GuardianPermissionConfig,
    GuardianProfileCreate,
    GuardianVerificationDocument,
    StudentGuardianRelationship,
} from '../../api/schemas/guardian.schema';

export interface GuardianRepository {
    createGuardianProfile(data: GuardianProfileCreate): Promise<GuardianIdentity>;
    getGuardianProfile(guardianId: string): Promise<GuardianIdentity | null>;
    verifyGuardian(guardianId: string, documents: GuardianVerificationDocument[]): Promise<void>;
    updateGuardianProfile(guardianId: string, updates: Partial<GuardianIdentity>): Promise<GuardianIdentity>;
    linkGuardianToStudent(guardianId: string, studentId: string, relationshipType: GuardianIdentity['relationshipType'], schoolId?: string): Promise<StudentGuardianRelationship>;
    getGuardianRelationships(guardianId: string): Promise<StudentGuardianRelationship[]>;
    updateGuardianPermissions(guardianId: string, studentId: string, permissions: GuardianPermissionConfig[]): Promise<void>;
    terminateGuardianRelationship(guardianId: string, studentId: string): Promise<void>;
    getGuardianStudents(guardianId: string): Promise<GuardianDashboard['students']>;
    getStudentGuardians(studentId: string): Promise<GuardianIdentity[]>;
    getGuardianDashboard(guardianId: string): Promise<GuardianDashboard>;
    updateGuardianNotificationSettings(guardianId: string, settings: GuardianNotificationSettings): Promise<void>;
}
