import { founderServices } from '../domains/founder/runtime';
import type { School } from '../types';

/**
 * Founder API
 * Ecosystem-wide management for Founders and Admins.
 */
export const founderAPI = {
  /**
   * Get aggregate ecosystem statistics
   */
  async getEcosystemStats(): Promise<any> {
    return founderServices.getEcosystemStats();
  },

  /**
   * Get all schools in the ecosystem
   */
  async getAllSchools(): Promise<School[]> {
    return founderServices.getAllSchools() as unknown as School[];
  },

  /**
   * Create a school globally (Founder bypass)
   */
  async createSchool(data: { name: string; type: string; created_by: string }): Promise<School> {
    return founderServices.createSchool(data) as unknown as School;
  },

  /**
   * Create a classroom globally (Tracks creator as Owner)
   */
  async createClassroom(data: {
    school_id: string;
    name: string;
    grade_number: number;
    created_by: string;
  }): Promise<any> {
    return founderServices.createClassroom(data);
  },

  /**
   * Create a community group globally
   */
  async createGroup(data: { name: string; description: string; school_id: string }): Promise<any> {
    return founderServices.createGroup(data);
  },

  /**
   * Get all users across the entire ecosystem (Founder/Admin only)
   */
  async listAllUsers(): Promise<any[]> {
    return founderServices.listAllUsers();
  },

  /**
   * Update school metadata globally
   */
  async updateSchoolMetadata(schoolId: string, metadata: any): Promise<School> {
    return founderServices.updateSchoolMetadata(schoolId, metadata) as unknown as School;
  },

  /**
   * Get Ecosystem Pulse  aggregate "weather" across all institutions.
   * High-level resonance for Founders.
   */
  async getEcosystemPulse(): Promise<any> {
    return founderServices.getEcosystemPulse();
  },

  /**
   * Get Sentinel Governance  non-repudiable audit logs for critical actions.
   */
  async getSentinelGovernance(): Promise<any[]> {
    return founderServices.getSentinelGovernance();
  },
};
