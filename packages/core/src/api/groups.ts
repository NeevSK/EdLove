import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

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
    const res = await (client.api as any).community.groups.$get({
      query: {
        school_id: filters.school_id,
        limit: filters.limit,
        offset: filters.offset,
        search: filters.search,
        is_public: filters.is_public,
        type: filters.type,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch groups', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Retrieves a specific group.
   */
  async get(groupId: string) {
    const res = await (client.api as any).community.groups[':groupId'].$get({
      param: { groupId },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new APIError('Failed to fetch group', res.status.toString());
    }

    return await res.json();
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
    const res = await (client.api as any).community.groups.$post({
      json: params,
    });

    if (!res.ok) {
      throw new APIError('Failed to create group', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Joins a group.
   */
  async join(groupId: string, userId: string, capacity: string) {
    const res = await (client.api as any).community.groups[':groupId'].join.$post({
      param: { groupId },
      json: { user_id: userId, capacity },
    });

    if (!res.ok) {
      throw new APIError('Failed to join group', res.status.toString());
    }

    return await res.json();
  },
};
