import { educational } from '@repo/core/logic/managers/factory';
import type { AcademicCycle } from '@repo/core/types';

/**
 * Academic Cycles API
 *
 * Manages school terms, semesters, and cycles.
 */
export const academicCyclesAPI = {
  /**
   * Get all academic cycles for a school
   */
  async getAll(schoolId: string): Promise<AcademicCycle[]> {
    return educational.institutions.getAcademicCycles(schoolId);
  },

  /**
   * Get the currently active academic cycle
   */
  async getCurrent(schoolId: string): Promise<AcademicCycle | null> {
    return educational.institutions.getCurrentAcademicCycle(schoolId);
  },

  /**
   * Create a new academic cycle
   */
  async create(data: Omit<AcademicCycle, 'id' | 'created_at'>): Promise<AcademicCycle> {
    return educational.institutions.createAcademicCycle(data);
  },

  /**
   * Update an academic cycle
   */
  async update(id: string, schoolId: string, data: Partial<AcademicCycle>): Promise<AcademicCycle> {
    return educational.institutions.updateAcademicCycle(id, schoolId, data);
  },

  /**
   * Delete an academic cycle
   */
  async delete(id: string): Promise<void> {
    return educational.institutions.deleteAcademicCycle(id);
  },
};
