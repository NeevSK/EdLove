import { 
  createSovereignClient, 
  SOVEREIGN_API_URL, 
  type AppType 
} from './base';
import { APIError } from '../types/API';

/**
 * GROUPS API (Sovereign RPC Proxy)
 * 
 * This module siphons Group requests to the Sanctuary API.
 * PURGED: Direct Supabase access.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const groupsAPI = {
  /**
   * Retrieves all groups for a school.
   */
  async getAll(schoolId?: string) {
    const res = await client.api.community.groups.$get({
      query: { school_id: schoolId },
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
    const res = await client.api.community.groups[':groupId'].$get({
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
    const res = await client.api.community.groups.$post({
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
    const res = await client.api.community.groups[':groupId'].join.$post({
      param: { groupId },
      json: { user_id: userId, capacity },
    });

    if (!res.ok) {
      throw new APIError('Failed to join group', res.status.toString());
    }

    return await res.json();
  },
};
