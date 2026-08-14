import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

/**
 * LIBRARY API (Sovereign RPC Proxy)
 *
 * Siphons Global Library & Media access to the Sanctuary API.
 * [BREAKING] Purged legacy Supabase library managers.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const libraryAPI = {
  async fetchLibraryCounts() {
    const res = await (client.api as any).library.counts.$get({ query: {} });
    if (!res.ok) throw new APIError('Failed to fetch Library counts', res.status.toString());
    return await res.json();
  },

  /**
   * Fetches global resources with filtering.
   */
  async fetchSovereignResources(filters: {
    type?: string;
    subject?: string;
    topic?: string;
    subjects?: string[];
    topics?: string[];
    grades?: number[];
    difficulty?: string;
    languages?: string[];
    visibility?: string;
    source?: 'core' | 'community';
    verified_only?: boolean;
    tags?: string[];
    sort_by?: string;
    view_date?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const res = await (client.api as any).library.resources.$get({
      query: {
        type: filters.type,
        subject: filters.subject,
        topic: filters.topic,
        subjects: filters.subjects?.join(','),
        topics: filters.topics?.join(','),
        grades: filters.grades?.join(','),
        difficulty: filters.difficulty,
        languages: filters.languages?.join(','),
        visibility: filters.visibility,
        source: filters.source,
        verified_only: filters.verified_only?.toString(),
        tags: filters.tags?.join(','),
        sort_by: filters.sort_by,
        view_date: filters.view_date,
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

  async searchLibrary(params: {
    query: string;
    embedding?: number[];
    type?: string;
    subject?: string;
    limit?: number;
  }) {
    const res = await (client.api as any).library.resources.search.$post({ json: params });
    if (!res.ok) throw new APIError('Failed to search library resources', res.status.toString());
    return await res.json();
  },

  async fetchBookmarkedResources(
    filters: { limit?: number; offset?: number; view_date?: string } = {},
  ) {
    const res = await (client.api as any).library.resources.bookmarked.$get({
      query: {
        limit: filters.limit?.toString(),
        offset: filters.offset?.toString(),
        view_date: filters.view_date,
      },
    });
    if (!res.ok) throw new APIError('Failed to fetch bookmarked resources', res.status.toString());
    return await res.json();
  },

  async createResource(input: {
    title: string;
    description?: string | null;
    type: string;
    format: string;
    url?: string | null;
    file_path?: string | null;
    subjects: string[];
    topics: string[];
    grades: number[];
    difficulty?: string | null;
    language: string[];
    visibility: string;
    is_community: boolean;
  }) {
    const res = await (client.api as any).library.resources.$post({ json: input });
    if (!res.ok) throw new APIError('Failed to create library resource', res.status.toString());
    return await res.json();
  },

  async createCollection(input: {
    name: string;
    description?: string | null;
    visibility: string;
    subjects: string[];
    topics: string[];
    grades: number[];
    resource_ids: string[];
  }) {
    const res = await (client.api as any).library.collections.$post({ json: input });
    if (!res.ok) throw new APIError('Failed to create library collection', res.status.toString());
    return await res.json();
  },

  async updateResource(id: string, updates: Record<string, unknown>) {
    const res = await (client.api as any).library.resources[':id'].$put({
      param: { id },
      json: updates,
    });
    if (!res.ok) throw new APIError('Failed to update library resource', res.status.toString());
    return await res.json();
  },

  async deleteResource(id: string) {
    const res = await (client.api as any).library.resources[':id'].$delete({ param: { id } });
    if (!res.ok) throw new APIError('Failed to delete library resource', res.status.toString());
    return await res.json();
  },

  async verifyResource(id: string) {
    const res = await (client.api as any).library.resources[':id'].verify.$post({
      param: { id },
    });
    if (!res.ok) throw new APIError('Failed to verify library resource', res.status.toString());
    return await res.json();
  },

  async reportBrokenLink(id: string) {
    const res = await (client.api as any).library.resources[':id']['broken-link'].$post({
      param: { id },
    });
    if (!res.ok) throw new APIError('Failed to report broken link', res.status.toString());
    return await res.json();
  },

  async addToCollection(collectionId: string, resourceId: string) {
    const res = await (client.api as any).library.collections[':id'].resources.$post({
      param: { id: collectionId },
      json: { resource_id: resourceId },
    });
    if (!res.ok) throw new APIError('Failed to add resource to collection', res.status.toString());
    return await res.json();
  },

  async removeFromCollection(collectionId: string, resourceId: string) {
    const res = await (client.api as any).library.collections[':id'].resources[
      ':resourceId'
    ].$delete({
      param: { id: collectionId, resourceId },
    });
    if (!res.ok)
      throw new APIError('Failed to remove resource from collection', res.status.toString());
    return await res.json();
  },

  async updateCollection(id: string, updates: Record<string, unknown>) {
    const res = await (client.api as any).library.collections[':id'].$put({
      param: { id },
      json: updates,
    });
    if (!res.ok) throw new APIError('Failed to update library collection', res.status.toString());
    return await res.json();
  },

  async deleteCollection(id: string) {
    const res = await (client.api as any).library.collections[':id'].$delete({ param: { id } });
    if (!res.ok) throw new APIError('Failed to delete library collection', res.status.toString());
    return await res.json();
  },

  async forkCollection(id: string) {
    const res = await (client.api as any).library.collections[':id'].fork.$post({
      param: { id },
    });
    if (!res.ok) throw new APIError('Failed to fork library collection', res.status.toString());
    return await res.json();
  },

  /**
   * Records user engagement with a resource.
   */
  async recordEngagement(
    resourceId: string,
    engagementType: 'view' | 'use' | 'endorse' | 'bookmark',
    classroomId?: string,
    toggle = false,
  ) {
    const res = await (client.api as any).library.resources[':id'].engage.$post({
      param: { id: resourceId },
      json: {
        engagement_type: engagementType,
        classroom_id: classroomId,
        toggle,
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
    visibility?: string;
    grades?: number[];
    limit?: number;
    offset?: number;
    only_virtual?: boolean;
    exclude_virtual?: boolean;
    view_date?: string;
  }) {
    const res = await (client.api as any).library.collections.$get({
      query: {
        ...filters,
        limit: filters.limit?.toString(),
        offset: filters.offset?.toString(),
        only_virtual: filters.only_virtual?.toString(),
        exclude_virtual: filters.exclude_virtual?.toString(),
        visibility: filters.visibility,
        grades: filters.grades?.join(','),
        view_date: filters.view_date,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch collections', res.status.toString());
    }

    return await res.json();
  },

  async identifyCollection(id: string, viewDate?: string) {
    const res = await (client.api as any).library.collections[':id'].$get({
      param: { id },
      query: { view_date: viewDate },
    });
    if (!res.ok) throw new APIError('Collection not found', res.status.toString());
    return await res.json();
  },

  async fetchMapTopology() {
    const res = await (client.api as any).library.map.topology.$get({ query: {} });
    if (!res.ok) throw new APIError('Failed to fetch Library map topology', res.status.toString());
    return await res.json();
  },
};
