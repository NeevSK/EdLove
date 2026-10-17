import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

/**
 * RESOURCES API (Sovereign RPC Proxy)
 *
 * Siphons classroom resources to the Sanctuary API.
 * [BREAKING] Purged direct Supabase access.
 * [BREAKING] Renamed getAll -> getClassroomResources.
 */

export const resourcesAPI = {
  /**
   * Fetches resources for a classroom.
   * [LOUD-FAILURE] Renamed from getAll.
   */
  async getClassroomResources(classroomId: string) {
    try {
      const res = await orpcClient.educational.getClassroomResources({
        params: { classroomId },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch resources',
        error.status?.toString() || error.code || 'RESOURCES_FETCH_FAILED',
      );
    }
  },

  /**
   * [LOUD-FAILURE] Method removed. Use Sanctuary API directly for creation.
   */
  async create(): Promise<never> {
    throw new Error('resourcesAPI.create is DEPRECATED. Use Sanctuary API directly.');
  },

  /**
   * [LOUD-FAILURE] Method removed.
   */
  async delete(): Promise<never> {
    throw new Error('resourcesAPI.delete is DEPRECATED.');
  },
};
