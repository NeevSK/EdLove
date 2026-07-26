import type {
  GuardianDashboard,
  GuardianIdentity,
  GuardianNotificationSettings,
  GuardianPermissionConfig,
  GuardianProfileCreate,
  GuardianStudentOverview,
  GuardianVerificationDocument,
  StudentGuardianRelationship,
} from '@/logic/schemas/guardian.schema';
import { guardianContract } from '@/api/guardian.contract';
import { guardianServices } from '@/api/runtimes/guardian.runtime';

export const guardianAPI = {
  /**
   * @policy create GuardianProfile
   */
  async createProfile(data: GuardianProfileCreate): Promise<GuardianIdentity> {
    return guardianServices.createProfile(data);
  },

  /**
   * @policy read GuardianProfile
   */
  async getProfile(guardianId: string): Promise<GuardianIdentity> {
    return guardianServices.getProfile(guardianId);
  },

  /**
   * @policy update GuardianProfile
   */
  async updateProfile(
    guardianId: string,
    updates: Partial<GuardianIdentity>,
  ): Promise<GuardianIdentity> {
    return guardianServices.updateProfile(guardianId, updates);
  },

  /**
   * @policy read GuardianDashboard
   */
  async getStudents(guardianId: string): Promise<GuardianStudentOverview[]> {
    return guardianServices.getStudents(guardianId);
  },

  /**
   * @policy read GuardianRelationship
   */
  async getStudentGuardians(studentId: string): Promise<GuardianIdentity[]> {
    return guardianServices.getStudentGuardians(studentId);
  },

  /**
   * @policy read GuardianDashboard
   */
  async getDashboard(guardianId: string): Promise<GuardianDashboard> {
    return guardianServices.getDashboard(guardianId);
  },

  /**
   * @policy update GuardianVerification
   */
  async verifyGuardian(
    guardianId: string,
    documents: GuardianVerificationDocument[],
  ): Promise<{ success: true }> {
    await guardianServices.verifyGuardian(guardianId, documents);
    return { success: true };
  },

  /**
   * @policy create GuardianRelationship
   */
  async linkGuardianToStudent(
    guardianId: string,
    studentId: string,
    relationshipType: GuardianIdentity['relationship_type'],
    schoolId?: string,
  ): Promise<StudentGuardianRelationship> {
    return guardianServices.linkGuardianToStudent(
      guardianId,
      studentId,
      relationshipType,
      schoolId,
    );
  },

  /**
   * @policy update GuardianRelationship
   */
  async updatePermissions(
    guardianId: string,
    studentId: string,
    permissions: GuardianPermissionConfig[],
  ): Promise<{ success: true }> {
    await guardianServices.updatePermissions(guardianId, studentId, permissions);
    return { success: true };
  },

  /**
   * @policy delete GuardianRelationship
   */
  async terminateRelationship(guardianId: string, studentId: string): Promise<{ success: true }> {
    await guardianServices.terminateRelationship(guardianId, studentId);
    return { success: true };
  },

  /**
   * @policy update GuardianNotificationSettings
   */
  async updateNotificationSettings(
    guardianId: string,
    settings: GuardianNotificationSettings,
  ): Promise<{ success: true }> {
    await guardianServices.updateNotificationSettings(guardianId, settings);
    return { success: true };
  },
};

void guardianContract;
