import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

export const groupsAPI = {
  /**
   * Retrieves all groups for a school.
   */
  async getAll(
    filters: {
      school_id?: string;
      limit?: number;
      offset?: number;
      search?: string;
      is_public?: boolean;
      type?: string;
    } = {},
  ) {
    try {
      return await orpcClient.community.getGroups({
        query: {
          schoolId: filters.school_id,
          limit: filters.limit,
          offset: filters.offset,
          search: filters.search,
          isPublic: filters.is_public,
          type: filters.type,
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch groups', error?.code || 'GROUPS_FETCH_FAILED');
    }
  },

  /**
   * Retrieves a specific group.
   */
  async get(groupId: string) {
    try {
      return await orpcClient.community.getGroup({
        params: { groupId },
      });
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NOT_FOUND') return null;
      throw new APIError(error?.message || 'Failed to fetch group', error?.code || 'GROUP_FETCH_FAILED');
    }
  },

  /**
   * Creates a new group.
   */
  async create(params: {
    name: string;
    description?: string;
    school_id?: string;
    type?: string;
    visibility?: string;
    is_public?: boolean;
  }) {
    try {
      return await orpcClient.community.createGroup({
        body: {
          name: params.name,
          description: params.description,
          schoolId: params.school_id,
          type: params.type,
          visibility: params.visibility,
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to create group', error?.code || 'GROUP_CREATE_FAILED');
    }
  },

  /**
   * Joins a group.
   */
  async join(groupId: string, _userId: string, _capacity: string) {
    try {
      return await orpcClient.community.joinGroup({
        params: { groupId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to join group', error?.code || 'GROUP_JOIN_FAILED');
    }
  },
};
