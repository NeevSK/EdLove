import { readLocalFirst } from '@repo/core/api/dataGateway';
import { educational } from '@repo/core/logic/managers/factory';
import type { AcademicCycle } from '@repo/core/types';

/**
 * Academic Cycles API
 *
 * @deprecated Prefer direct domain hooks or Sanctuary oRPC educational router.
 * Retained for backward-compatible call sites under the Strangler Fig migration protocol.
 */
export const academicCyclesAPI = {
  /**
   * Get all academic cycles for a school
   */
  async getAll(schoolId: string): Promise<AcademicCycle[]> {
    return educational.institutions.getAcademicCycles(schoolId);
  },

  /**
   * Get the currently active academic cycle (cached with 24h TTL)
   */
  async getCurrent(schoolId: string): Promise<AcademicCycle | null> {
    const result = await readLocalFirst<AcademicCycle | null>({
      key: `academicCycle:current:${schoolId}`,
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: async () => educational.institutions.getCurrentAcademicCycle(schoolId),
    });
    return result ?? null;
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
