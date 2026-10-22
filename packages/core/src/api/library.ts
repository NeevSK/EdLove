import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

/**
 * LIBRARY API (Sovereign RPC Proxy)
 *
 * Siphons Global Library & Media access to the Sanctuary API.
 * [BREAKING] Purged legacy Supabase library managers.
 */


export const libraryAPI = {
  async fetchLibraryCounts() {
    return orpcClient.library.getCounts({ query: {} });
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
    return orpcClient.library.getResources({
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
        verified_only: filters.verified_only,
        tags: filters.tags?.join(','),
        sort_by: filters.sort_by as any,
        view_date: filters.view_date,
        limit: filters.limit,
        offset: filters.offset,
        search: filters.search,
      },
    });
  },

  /**
   * Fetches a single resource by ID.
   */
  async identifyResource(id: string) {
    return orpcClient.library.getResource({
      params: { id },
    });
  },

  async searchLibrary(params: {
    query: string;
    embedding?: number[];
    type?: string;
    subject?: string;
    limit?: number;
  }) {
    return orpcClient.library.searchLibrary({ body: params });
  },

  async fetchBookmarkedResources(
    filters: { limit?: number; offset?: number; view_date?: string } = {},
  ) {
    return orpcClient.library.getBookmarkedResources({
      query: {
        limit: filters.limit,
        offset: filters.offset,
        view_date: filters.view_date,
      },
    });
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
    return orpcClient.library.createResource({ body: input });
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
    return orpcClient.library.createCollection({ body: input });
  },

  async updateResource(id: string, updates: Record<string, unknown>) {
    return orpcClient.library.updateResource({
      params: { id },
      body: updates,
    });
  },

  async deleteResource(id: string) {
    return orpcClient.library.deleteResource({ params: { id } });
  },

  async verifyResource(id: string) {
    return orpcClient.library.verifyResource({ params: { id } });
  },

  async reportBrokenLink(id: string) {
    try {
      const res = await orpcClient.library.reportBrokenLink({
        params: { id },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to report broken link',
        error.status?.toString() || error.code || 'BROKEN_LINK_REPORT_FAILED',
      );
    }
  },

  async addToCollection(collectionId: string, resourceId: string) {
    return orpcClient.library.addToCollection({
      params: { id: collectionId },
      body: { resource_id: resourceId },
    });
  },

  async removeFromCollection(collectionId: string, resourceId: string) {
    return orpcClient.library.removeFromCollection({
      params: { id: collectionId, resourceId },
    });
  },

  async updateCollection(id: string, updates: Record<string, unknown>) {
    return orpcClient.library.updateCollection({ params: { id }, body: updates });
  },

  async deleteCollection(id: string) {
    return orpcClient.library.deleteCollection({ params: { id } });
  },

  async forkCollection(id: string) {
    return orpcClient.library.forkCollection({ params: { id } });
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
    return orpcClient.library.engage({
      params: { id: resourceId },
      body: {
        engagement_type: engagementType,
        classroom_id: classroomId,
        toggle,
      },
    });
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
    return orpcClient.library.getCollections({
      query: { ...filters, grades: filters.grades?.join(',') },
    });
  },

  async identifyCollection(id: string, viewDate?: string) {
    return orpcClient.library.getCollection({
      params: { id },
      query: { view_date: viewDate },
    });
  },

  async fetchMapTopology() {
    return orpcClient.library.getMapTopology({ query: {} });
  },
};
