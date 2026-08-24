import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import {
  assertContractCoverage,
  createTemporalProxy,
  defineContractCoverage,
  growthSignalsAPI,
  libraryContract,
} from '@repo/core/api/client';
import { libraryAPI as sanctuaryLibraryAPI } from '@repo/core/api/library';

import { APIError } from '@repo/core/types';
import { knowledgeDB } from '@repo/library/api/database';
import type {
  CollectionFilters,
  CreateCollectionInput,
  CreateResourceInput,
  KnowledgeTopology,
  LibraryCollection,
  LibraryResource,
  ResourceFilters,
} from '@repo/library/types';

const getTemporalAsOf = (viewDate?: string): string | undefined => {
  if (!viewDate) return undefined;
  return new Date(`${viewDate}T23:59:59.999Z`).toISOString();
};
const rawLibraryAPI = {
  async getResourcesCount(): Promise<number> {
    return Number((await sanctuaryLibraryAPI.fetchLibraryCounts()).resource_count ?? 0);
  },

  async getCollectionsCount(): Promise<number> {
    return Number((await sanctuaryLibraryAPI.fetchLibraryCounts()).collection_count ?? 0);
  },

  /**
   * @authority read Library
   */
  async getResources(filters: ResourceFilters = {}): Promise<LibraryResource[]> {
    return (await sanctuaryLibraryAPI.fetchSovereignResources({
      type: filters.type,
      subject: filters.subject,
      topic: filters.topic,
      subjects: filters.subjects,
      topics: filters.topics,
      grades: filters.grades,
      difficulty: filters.difficulty,
      languages: filters.languages,
      visibility: filters.visibility,
      source: filters.source,
      verified_only: filters.verified_only,
      tags: filters.tags,
      sort_by: filters.sort_by,
      view_date: filters.viewDate ? getTemporalAsOf(filters.viewDate) : undefined,
      search: filters.search,
      limit: filters.limit,
      offset: filters.offset,
    })) as LibraryResource[];
  },
  /**
   * Search resources locally using SQLite FTS5 index.
   */
  /**
   * @authority read Library
   */
  async searchMapUniverse(query: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase.rpc('search_map_universe', {
      query_text: query,
      match_count: limit,
    });
    if (error) {
      console.error('Map search error:', error);
      throw new APIError('Failed to search map universe', error.code, error);
    }
    return data || [];
  },
  /**
   * @authority read Library
   */
  async searchResourcesLocal(query: string, limit: number = 20): Promise<LibraryResource[]> {
    try {
      const ids = await knowledgeDB.search(query, limit);
      if (ids.length === 0) return [];
      // Fetch full resource details from Supabase (or eventually from local full-cache)
      const { data, error } = await supabase
        .from('nodes')
        .select(`
                    *,
                    creator: users!library_items_uploader_id_fkey(full_name),
                    verified_by_user: users!library_resources_verified_by_fkey(full_name)
                `)
        .in('id', ids);
      if (error) throw error;
      // Sort results by the order returned from SQLite
      const idMap = new Map((data || []).map((r: any) => [r.id, r]));
      return ids
        .map((id) => idMap.get(id))
        .filter((r) => !!r)
        .map((resource) => ({
          ...resource,
          creator_name: resource.creator?.full_name || resource.creator_name || 'System',
          verified_by_name: resource.verified_by_user?.full_name,
          has_endorsed: false,
          has_bookmarked: false,
        }));
    } catch (error) {
      console.error('Local search integration failed:', error);
      return [];
    }
  },
  /**
   * @authority read Library
   */
  async searchLibrary(params: {
    query: string;
    embedding?: number[];
    type?: string;
    subject?: string;
    limit?: number;
  }): Promise<LibraryResource[]> {
    return (await sanctuaryLibraryAPI.searchLibrary({
      ...params,
      type: params.type === 'All' ? undefined : params.type,
      limit: params.limit ?? 20,
    })) as LibraryResource[];
  },
  /**
   * @authority read Library
   */
  async getResourceById(id: string, userId?: string): Promise<LibraryResource> {
    // Engagement state is derived from the authenticated Sanctuary context;
    // the legacy userId argument remains for source compatibility only.
    void userId;
    return (await sanctuaryLibraryAPI.identifyResource(id)) as LibraryResource;
  },
  /**
   * @authority create Library
   */
  async createResource(
    input: CreateResourceInput,
    creatorId: string,
    creatorRole: string,
  ): Promise<LibraryResource> {
    // Normalize the legacy client shape into the server contract. Creator
    // identity and role are intentionally derived by Sanctuary.
    const { subject, language, subjects, languages } = input;
    const dbLanguage: string[] =
      languages && languages.length > 0
        ? languages
        : Array.isArray(language)
          ? (language as string[])
          : language
            ? [language as string]
            : ['en'];
    const dbSubjects: string[] =
      subjects && subjects.length > 0 ? subjects : subject ? [subject] : [];
    void creatorRole;
    const resourceData = (await sanctuaryLibraryAPI.createResource({
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      format: input.format,
      url: input.url ?? null,
      file_path: input.file_path ?? null,
      subjects: dbSubjects,
      topics: input.topics ?? [],
      grades: input.grades,
      difficulty: input.difficulty ?? null,
      language: dbLanguage,
      visibility: input.visibility,
      is_community: true,
    })) as LibraryResource;

    // Trigger Growth Signals (Whispered Moment & Nourishing dimension)
    growthSignalsAPI.emitSilent({
      user_id: creatorId,
      event_type: 'resource_uploaded',
      event_metadata: {
        resource_id: resourceData.id,
        resource_type: input.type,
      },
    });
    // Direct Rewards: Add 50 points for contribution
    try {
      const { rewardsAPI } = await import('@repo/core/api/client');
      void rewardsAPI.addPoints(creatorId, 50).catch(() => {});
    } catch (e) {
      console.warn('Rewards API not available for points', e);
    }
    return resourceData;
  },
  /**
   * @authority update Library
   */
  async updateResource(id: string, updates: Partial<LibraryResource>): Promise<LibraryResource> {
    return (await sanctuaryLibraryAPI.updateResource(id, updates)) as LibraryResource;
  },
  /**
   * @authority delete Library
   */
  async deleteResource(id: string): Promise<void> {
    await sanctuaryLibraryAPI.deleteResource(id);
  },
  /**
   * @authority create Library
   */
  async trackView(resourceId: string, userId?: string): Promise<void> {
    // The authenticated Sanctuary context is authoritative; retain userId for
    // source compatibility with callers that still pass it explicitly.
    void userId;
    try {
      await sanctuaryLibraryAPI.recordEngagement(resourceId, 'view');
      // Growth signal: user explored a resource (Witnessing dimension  absorbing, growing inward)
      if (userId) {
        growthSignalsAPI.emitSilent({
          user_id: userId,
          event_type: 'resource_read',
          event_metadata: { resource_id: resourceId },
        });
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  },
  /**
   * @authority create Library
   */
  async trackUse(resourceId: string, userId: string, classroomId?: string): Promise<void> {
    // The authenticated Sanctuary context is authoritative; retain userId only
    // for source compatibility while the server derives the actual actor.
    void userId;
    await sanctuaryLibraryAPI.recordEngagement(resourceId, 'use', classroomId);
  },
  /**
   * @authority create Library
   */
  async endorseResource(resourceId: string, userId: string): Promise<void> {
    void userId;
    await sanctuaryLibraryAPI.recordEngagement(resourceId, 'endorse', undefined, true);
  },
  /**
   * @authority create Library
   */
  async bookmarkResource(resourceId: string, userId: string): Promise<void> {
    void userId;
    await sanctuaryLibraryAPI.recordEngagement(resourceId, 'bookmark', undefined, true);
  },
  /**
   * @authority update Library
   */
  async verifyResource(resourceId: string, verifiedBy: string): Promise<LibraryResource> {
    void verifiedBy;
    return (await sanctuaryLibraryAPI.verifyResource(resourceId)) as LibraryResource;
  },
  /**
   * @authority read Library
   */
  async getBookmarkedResources(
    userId: string,
    options: Pick<ResourceFilters, 'viewDate' | 'viewScale'> = {},
  ): Promise<LibraryResource[]> {
    void userId;
    return (await sanctuaryLibraryAPI.fetchBookmarkedResources({
      view_date: options.viewDate ? getTemporalAsOf(options.viewDate) : undefined,
    })) as LibraryResource[];
  },
  /**
   * @authority read Library
   */
  async getCollections(filters: CollectionFilters = {}): Promise<LibraryCollection[]> {
    return (await sanctuaryLibraryAPI.fetchSovereignCollections({
      creator_id: filters.creator_id,
      subject: filters.subject,
      search: filters.search,
      visibility: filters.visibility,
      grades: filters.grades,
      limit: filters.limit,
      offset: filters.offset,
      only_virtual: filters.only_virtual,
      exclude_virtual: filters.exclude_virtual,
      view_date: filters.viewDate ? getTemporalAsOf(filters.viewDate) : undefined,
    })) as LibraryCollection[];
  },
  /**
   * @authority read Library
   */
  async getCollectionById(
    id: string,
    userId?: string,
    options: Pick<ResourceFilters, 'viewDate' | 'viewScale'> = {},
  ): Promise<LibraryCollection> {
    void userId;
    return (await sanctuaryLibraryAPI.identifyCollection(
      id,
      options.viewDate ? getTemporalAsOf(options.viewDate) : undefined,
    )) as LibraryCollection;
  },
  /**
   * Create a new collection
   */
  async createCollection(
    input: CreateCollectionInput,
    creatorId: string,
  ): Promise<LibraryCollection> {
    void creatorId;
    return (await sanctuaryLibraryAPI.createCollection({
      name: input.name,
      description: input.description ?? null,
      visibility: input.visibility,
      subjects: input.subjects ?? (input.subject ? [input.subject] : []),
      topics: input.topics ?? [],
      grades: input.grades,
      resource_ids: input.resource_ids,
    })) as LibraryCollection;
  },
  /**
   * Add a resource to a collection
   */
  async addToCollection(collection_id: string, node_id: string): Promise<void> {
    await sanctuaryLibraryAPI.addToCollection(collection_id, node_id);
  },
  /**
   * Remove a resource from a collection
   */
  async removeFromCollection(collectionId: string, resourceId: string): Promise<void> {
    await sanctuaryLibraryAPI.removeFromCollection(collectionId, resourceId);
  },
  /**
   * Update collection metadata (CRUD)
   */
  async updateCollection(
    id: string,
    updates: Partial<LibraryCollection>,
  ): Promise<LibraryCollection> {
    const allowed = {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.visibility !== undefined ? { visibility: updates.visibility } : {}),
      ...(updates.subjects !== undefined ? { subjects: updates.subjects } : {}),
      ...(updates.topics !== undefined ? { topics: updates.topics } : {}),
      ...(updates.grades !== undefined ? { grades: updates.grades } : {}),
    };
    return (await sanctuaryLibraryAPI.updateCollection(id, allowed)) as LibraryCollection;
  },
  /**
   * Fork (duplicate) a collection
   */
  async forkCollection(collectionId: string, userId: string): Promise<LibraryCollection> {
    void userId;
    return (await sanctuaryLibraryAPI.forkCollection(collectionId)) as LibraryCollection;
  },
  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    await sanctuaryLibraryAPI.deleteCollection(id);
  },
  /**
   * Get the epistemic map topology (nodes and links)
   */
  async getMapTopology(): Promise<KnowledgeTopology> {
    return (await sanctuaryLibraryAPI.fetchMapTopology()) as KnowledgeTopology;
  },
  /**
   * Report a broken link for a resource.
   * Triggers database failure count increment and status update.
   */
  async reportBrokenLink(resourceId: string): Promise<void> {
    await sanctuaryLibraryAPI.reportBrokenLink(resourceId);
  },
  /**
   * The Resonance Engine: Finds related "Knowledge Islands" (Map Layers)
   * for a given resource based on semantic similarity.
   */
  async getResonantKnowledge(resourceId: string): Promise<any[]> {
    try {
      const resource = (await sanctuaryLibraryAPI.identifyResource(resourceId)) as LibraryResource;
      const query = `${resource.subjects?.[0] || ''} ${resource.tags?.join(' ') || ''}`.trim();
      if (!query) return [];
      return (await sanctuaryLibraryAPI.searchLibrary({ query, limit: 3 })) as any[];
    } catch (error) {
      console.error('Resonance Engine failed:', error);
      return [];
    }
  },
  /**
   * Get Geographical Topology (Provinces -> Districts -> Schools)
   */
  async getGeoTopology(): Promise<any> {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name, province_id, district_id, student_count');
    if (error) throw new APIError('Failed to fetch school geo-data', error.code, error);
    return schools;
  },
};
const libraryCoverage = assertContractCoverage(
  rawLibraryAPI,
  defineContractCoverage({
    moduleName: 'library',
    contract: libraryContract,
    methodMapping: {
      getResourceById: 'getResource',
      trackView: 'engage',
      trackUse: 'engage',
      endorseResource: 'engage',
      bookmarkResource: 'engage',
      getCollectionById: 'getCollection',
    },
    internalMethods: [
      'getResourcesCount',
      'getCollectionsCount',
      'searchMapUniverse',
      'searchResourcesLocal',
      'createResource',
      'updateResource',
      'deleteResource',
      'verifyResource',
      'getBookmarkedResources',
      'createCollection',
      'addToCollection',
      'removeFromCollection',
      'updateCollection',
      'forkCollection',
      'deleteCollection',
      'reportBrokenLink',
      'getResonantKnowledge',
      'getGeoTopology',
    ],
  }),
);
export const libraryAPI = createTemporalProxy('library', rawLibraryAPI);
void [libraryContract, libraryCoverage];
