import type {
  GuardianDashboard,
  GuardianIdentity,
  GuardianNotificationSettings,
  GuardianPermissionConfig,
  GuardianProfileCreate,
  GuardianStudentOverview,
  GuardianVerificationDocument,
  StudentGuardianRelationship,
} from '../logic/schemas/guardian.schema';
import { guardianServices } from '../native/runtimes/guardian.runtime';
import { guardianContract } from './guardian.contract';

export const guardianAPI = {
  /**
   * @authority create GuardianProfile
   */
  async createProfile(data: GuardianProfileCreate): Promise<GuardianIdentity> {
    return guardianServices.createProfile(data);
  },

  /**
   * @authority read GuardianProfile
   */
  async getProfile(guardianId: string): Promise<GuardianIdentity> {
    return guardianServices.getProfile(guardianId);
  },

  /**
   * @authority update GuardianProfile
   */
  async updateProfile(
    guardianId: string,
    updates: Partial<GuardianIdentity>,
  ): Promise<GuardianIdentity> {
    return guardianServices.updateProfile(guardianId, updates);
  },

  /**
   * @authority read GuardianDashboard
   */
  async getStudents(guardianId: string): Promise<GuardianStudentOverview[]> {
    return guardianServices.getStudents(guardianId);
  },

  /**
   * @authority read GuardianRelationship
   */
  async getStudentGuardians(studentId: string): Promise<GuardianIdentity[]> {
    return guardianServices.getStudentGuardians(studentId);
  },

  /**
   * @authority read GuardianDashboard
   */
  async getDashboard(guardianId: string): Promise<GuardianDashboard> {
    return guardianServices.getDashboard(guardianId);
  },

  /**
   * @authority update GuardianVerification
   */
  async verifyGuardian(
    guardianId: string,
    documents: GuardianVerificationDocument[],
  ): Promise<{ success: true }> {
    await guardianServices.verifyGuardian(guardianId, documents);
    return { success: true };
  },

  /**
   * @authority create GuardianRelationship
   */
  async linkGuardianToStudent(
    guardianId: string,
    studentId: string,
    relationshipType: GuardianIdentity['relationshipType'],
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
   * @authority update GuardianRelationship
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
   * @authority delete GuardianRelationship
   */
  async terminateRelationship(guardianId: string, studentId: string): Promise<{ success: true }> {
    await guardianServices.terminateRelationship(guardianId, studentId);
    return { success: true };
  },

  /**
   * @authority update GuardianNotificationSettings
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
