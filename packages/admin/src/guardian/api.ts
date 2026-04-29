import { api } from '@repo/core/api';

import type {
  GuardianDashboardData,
  GuardianIdentity,
  GuardianPermissionConfig,
  RelationshipType,
  StudentGuardianRelationship,
  VerificationDocument,
} from './types';

export interface GuardianAPI {
  // Identity management
  createGuardianProfile(
    data: Omit<GuardianIdentity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<GuardianIdentity>;
  verifyGuardian(guardianId: string, documents: VerificationDocument[]): Promise<void>;
  updateGuardianProfile(
    guardianId: string,
    updates: Partial<GuardianIdentity>,
  ): Promise<GuardianIdentity>;
  getGuardianProfile(guardianId: string): Promise<GuardianIdentity | null>;

  // Relationship management
  linkGuardianToStudent(
    guardianId: string,
    studentId: string,
    relationship: RelationshipType,
  ): Promise<StudentGuardianRelationship>;
  updatePermissions(
    guardianId: string,
    studentId: string,
    permissions: GuardianPermissionConfig[],
  ): Promise<void>;
  terminateRelationship(guardianId: string, studentId: string): Promise<void>;

  // Access and visibility
  getGuardianStudents(guardianId: string): Promise<any[]>; // Student[] from core
  getStudentGuardians(studentId: string): Promise<GuardianIdentity[]>;

  // Dashboard and data
  getGuardianDashboard(guardianId: string): Promise<GuardianDashboardData>;
  updateNotificationSettings(guardianId: string, settings: any): Promise<void>;
}

export const guardianAPI: GuardianAPI = {
  // Identity management
  async createGuardianProfile(
    data: Omit<GuardianIdentity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<GuardianIdentity> {
    return api.guardian.createProfile(data as any) as unknown as Promise<GuardianIdentity>;
  },

  async verifyGuardian(guardianId: string, documents: VerificationDocument[]): Promise<void> {
    await api.guardian.verifyGuardian(guardianId, documents as any);
  },

  async updateGuardianProfile(
    guardianId: string,
    updates: Partial<GuardianIdentity>,
  ): Promise<GuardianIdentity> {
    return api.guardian.updateProfile(
      guardianId,
      updates as any,
    ) as unknown as Promise<GuardianIdentity>;
  },

  async getGuardianProfile(guardianId: string): Promise<GuardianIdentity | null> {
    try {
      return (await api.guardian.getProfile(guardianId)) as GuardianIdentity;
    } catch {
      return null;
    }
  },

  // Relationship management
  async linkGuardianToStudent(
    guardianId: string,
    studentId: string,
    relationship: RelationshipType,
  ): Promise<StudentGuardianRelationship> {
    return api.guardian.linkGuardianToStudent(
      guardianId,
      studentId,
      relationship,
    ) as unknown as Promise<StudentGuardianRelationship>;
  },

  async updatePermissions(
    guardianId: string,
    studentId: string,
    permissions: GuardianPermissionConfig[],
  ): Promise<void> {
    await api.guardian.updatePermissions(guardianId, studentId, permissions as any);
  },

  async terminateRelationship(guardianId: string, studentId: string): Promise<void> {
    await api.guardian.terminateRelationship(guardianId, studentId);
  },

  // Access and visibility
  async getGuardianStudents(guardianId: string): Promise<any[]> {
    return api.guardian.getStudents(guardianId);
  },

  async getStudentGuardians(studentId: string): Promise<GuardianIdentity[]> {
    return api.guardian.getStudentGuardians(studentId) as unknown as Promise<GuardianIdentity[]>;
  },

  // Dashboard and data
  async getGuardianDashboard(guardianId: string): Promise<GuardianDashboardData> {
    return api.guardian.getDashboard(guardianId) as unknown as Promise<GuardianDashboardData>;
  },

  async updateNotificationSettings(guardianId: string, settings: any): Promise<void> {
    await api.guardian.updateNotificationSettings(guardianId, settings);
  },
};
