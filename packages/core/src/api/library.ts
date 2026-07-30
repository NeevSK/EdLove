import { APIError } from '@repo/core/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';

/**
 * LIBRARY API (Sovereign RPC Proxy)
 *
 * Siphons Global Library & Media access to the Sanctuary API.
 * [BREAKING] Purged legacy Supabase library managers.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const libraryAPI = {
  /**
   * Fetches global resources with filtering.
   */
  async fetchSovereignResources(filters: {
    type?: string;
    subject?: string;
    topic?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const res = await (client.api as any).library.resources.$get({
      query: {
        type: filters.type,
        subject: filters.subject,
        topic: filters.topic,
        limit: filters.limit?.toString(),
        offset: filters.offset?.toString(),
        search: filters.search,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch library resources', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Fetches a single resource by ID.
   */
  async identifyResource(id: string) {
    const res = await (client.api as any).library.resources[':id'].$get({
      param: { id },
    });

    if (!res.ok) {
      throw new APIError('Resource not found', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Records user engagement with a resource.
   */
  async recordEngagement(
    resourceId: string,
    engagementType: 'view' | 'use' | 'endorse' | 'bookmark',
    classroomId?: string,
  ) {
    const res = await (client.api as any).library.resources[':id'].engage.$post({
      param: { id: resourceId },
      json: {
        engagement_type: engagementType,
        classroom_id: classroomId,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to record engagement', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Fetches resource collections.
   */
  async fetchSovereignCollections(filters: {
    creator_id?: string;
    subject?: string;
    search?: string;
  }) {
    const res = await (client.api as any).library.collections.$get({
      query: filters,
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch collections', res.status.toString());
    }

    return await res.json();
  },
};
