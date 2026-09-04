import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

/**
 * RESOURCES API (Sovereign RPC Proxy)
 *
 * Siphons classroom resources to the Sanctuary API.
 * [BREAKING] Purged direct Supabase access.
 * [BREAKING] Renamed getAll -> getClassroomResources.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const resourcesAPI = {
  /**
   * Fetches resources for a classroom.
   * [LOUD-FAILURE] Renamed from getAll.
   */
  async getClassroomResources(classroomId: string) {
    const res = await (client.api as any).educational.classrooms[':classroomId'].resources.$get({
      param: { classroomId },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch resources', res.status.toString());
    }

    return await res.json();
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
