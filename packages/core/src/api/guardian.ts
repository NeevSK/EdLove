import { guardianContract } from '@repo/core/api/guardian.contract';
import { GuardianPublishedAssessmentSummarySchema } from '@repo/core/api/guardian-assessment.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import { guardianServices } from '@repo/core/api/runtimes/guardian.runtime';
import type {
  GuardianDashboard,
  GuardianIdentity,
  GuardianNotificationSettings,
  GuardianPermissionConfig,
  GuardianProfileCreate,
  GuardianStudentOverview,
  GuardianVerificationDocument,
  StudentGuardianRelationship,
} from '@repo/core/logic/schemas/guardian.schema';

export type GuardianAssessmentPage = {
  limit?: number;
  cursor?: string;
};

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
   * Published assessment results are intentionally read through Sanctuary.
   * This method must not be replaced with a Supabase table or RPC read.
   */
  async getPublishedAssessmentSummary(studentId: string, page: GuardianAssessmentPage = {}) {
    const response = await orpcClient.guardianAssessment.getPublishedAssessmentSummary({
      params: { studentId },
      query: {
        limit: page.limit ?? 25,
        ...(page.cursor ? { cursor: page.cursor } : {}),
      },
    });
    return GuardianPublishedAssessmentSummarySchema.parse(response);
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

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import {
  MOCK_GUARDIAN_ATTENDANCE_TIMELINE,
  MOCK_GUARDIAN_CHILDREN,
  MOCK_GUARDIAN_NOTICES,
} from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'guardian',
  ghostMethods: ['getChildren', 'getAttendanceTimeline', 'getNotices'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: (method) => {
    if (method === 'getChildren') return MOCK_GUARDIAN_CHILDREN;
    if (method === 'getAttendanceTimeline') return MOCK_GUARDIAN_ATTENDANCE_TIMELINE;
    return MOCK_GUARDIAN_NOTICES;
  },
});
