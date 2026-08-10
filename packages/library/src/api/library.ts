import { assertContractCoverage, createTemporalProxy, defineContractCoverage, growthSignalsAPI, identityAPI, impactRipplesAPI, libraryContract } from '@repo/core/api';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { applyTemporalFilter } from '@repo/core/logic';

import { APIError } from '@repo/core/types';
import type {
  CollectionFilters,
  CreateCollectionInput,
  CreateResourceInput,
  KnowledgeLink,
  KnowledgeNode,
  KnowledgeTopology,
  LibraryCollection,
  LibraryResource,
  ResourceFilters,
} from '@repo/library/types';
import { knowledgeDB } from '@repo/library/api/database';

// ============================================================================
// HELPERS
// ============================================================================
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
type LibraryAbilityCapacity =
  | 'admin'
  | 'founder'
  | 'developer'
  | 'teacher'
  | 'student'
  | 'principal'
  | 'assistantPrincipal'
  | 'gradeHead'
  | 'parent'
  | 'guardian'
  | 'librarian'
  | 'nurse'
  | 'staff'
  | 'member';

const toLibraryBondCapacity = (role: string): LibraryAbilityCapacity => {
  switch (role) {
    case 'student':
    case 'teacher':
    case 'gradeHead':
    case 'principal':
    case 'assistantPrincipal':
    case 'admin':
    case 'developer':
    case 'founder':
    case 'librarian':
    case 'nurse':
    case 'staff':
    case 'member':
      return role;
    case 'parent':
    case 'guardian':
      return 'guardian';
    default:
      return 'member';
  }
};

const VERIFIED_LIBRARY_CAPACITIES = new Set<LibraryAbilityCapacity>([
  'admin',
  'founder',
  'developer',
  'teacher',
  'principal',
  'assistantPrincipal',
  'gradeHead',
  'parent',
  'guardian',
  'librarian',
  'nurse',
  'staff',
]);

const getTemporalAsOf = (viewDate?: string): string | undefined => {
  if (!viewDate) return undefined;
  return new Date(`${viewDate}T23:59:59.999Z`).toISOString();
};
// ============================================================================
// LIBRARY API - Resource Management for Educational Ecology
// ============================================================================
const rawLibraryAPI = {
  // ========================================================================
  // RESOURCES
  // ========================================================================
  /**
   * @authority read Library
   */
  async getResources(filters: ResourceFilters = {}): Promise<LibraryResource[]> {
    let query = supabase.from('nodes').select(`
                *,
                creator: users!library_items_uploader_id_fkey(full_name),
                verified_by_user: users!library_resources_verified_by_fkey(full_name)
      `);
    // Apply filters
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.subject) query = query.contains('subjects', [filters.subject]);
    if (filters.topic) query = query.contains('topics', [filters.topic]);
    if (filters.subjects && filters.subjects.length > 0) {
      query = query.overlaps('subjects', filters.subjects);
    }
    if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters.languages && filters.languages.length > 0) {
      query = query.overlaps('language', filters.languages);
    }
    if (filters.visibility) query = query.eq('visibility', filters.visibility);
    // Source filtering
    if (filters.source === 'core') query = query.eq('is_community', false);
    if (filters.source === 'community') query = query.eq('is_community', true);
    if (filters.verified_only) query = query.eq('verified', true);
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters.topics && filters.topics.length > 0) {
      query = query.overlaps('topics', filters.topics);
    }
    if (filters.grades && filters.grades.length > 0) {
      query = query.overlaps('grades', filters.grades);
    }
    if (filters.search) {
      // Trim and sanitize.
      // " Single-quotes are escaped to prevent breaking the PostgREST filter string.
      // " Curly braces are stripped because they have special meaning in Postgres
      //   array literals (used by the cs operator below).
      // " User-supplied % / _ wildcards are also stripped so callers cannot craft
      //   their own ilike patterns.
      // Note: the Supabase JS client URL-encodes the entire filter string, which
      // provides an additional layer of protection in transit.
      const term = filters.search
        .trim()
        .replace(/[%_]/g, '') // no user-supplied wildcards
        .replace(/[{}]/g, '') // safe for array cs operator
        .replace(/'/g, "''"); // escape single quotes
      if (term.length === 0) {
        // Nothing left after sanitisation  skip the filter entirely
      } else {
        // Robust case-insensitive search logic for Web/Guest
        query = query.or(
          [
            `title.ilike.%${term}%`,
            `description.ilike.%${term}%`,
            `subjects.cs.{${term.toLowerCase()}}`,
            `tags.cs.{${term.toLowerCase()}}`,
            `topics.cs.{${term.toLowerCase()}}`,
          ].join(','),
        );
      }
    }
    if (filters.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: filters.viewScale,
      });
    }
    // Sorting
    switch (filters.sort_by) {
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      case 'most_used':
        query = query.order('uses_count', { ascending: false });
        break;
      case 'most_endorsed':
        query = query.order('endorsements', { ascending: false });
        break;
      case 'most_bookmarked':
        query = query.order('bookmarks', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
    // Pagination
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset)
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    const { data, error } = await query;
    console.log("--> API fetched nodes count:", data?.length, "Error:", error);

    if (error) {
      throw new APIError('Failed to fetch resources', error.code, error);
    }
    return (data || []).map((resource: any) => ({
      ...resource,
      creator_name: resource.creator?.full_name || resource.creator_name || 'System',
      verified_by_name: resource.verified_by_user?.full_name,
    }));
  },
  async getResourcesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('nodes')
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error('Failed to fetch total resources count:', error);
      return 0;
    }
    return count || 0;
  },
  async getCollectionsCount(): Promise<number> {
    const { count: explicitCount } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true });

    const [{ data: subjects }, { data: topics }] = await Promise.all([
      supabase.rpc('get_node_subjects_count'),
      supabase.rpc('get_node_topics_count'),
    ]);

    const subjectsCount = subjects?.length || 0;
    const topicsCount = topics?.length || 0;

    return (explicitCount || 0) + subjectsCount + topicsCount;
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
    const { data, error } = await supabase.rpc('search_library', {
      query_text: params.query,
      query_embedding: params.embedding,
      filter_type: params.type === 'All' ? null : params.type,
      filter_subjects: params.subject ? [params.subject] : null,
      match_count: params.limit ?? 20,
    });
    if (error) {
      console.error('Search RPC error:', error);
      throw new APIError('Failed to search knowledge universe', error.code, error);
    }
    return (data || []).map((resource: any) => ({
      ...resource,
      creator_name: resource.creator_name || 'System',
      // Ensure subject/subjects mapping is consistent
      subjects: resource.subjects || (resource.subject ? [resource.subject] : []),
    }));
  },
  /**
   * @authority read Library
   */
  async getResourceById(id: string, userId?: string): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('nodes')
      .select(`
                *,
                creator: users!library_items_uploader_id_fkey(full_name),
                verified_by_user: users!library_resources_verified_by_fkey(full_name)
      `)
      .eq('id', id)
      .single();
    if (error) {
      throw new APIError('Failed to fetch resource', error.code, error);
    }
    // Check if user has endorsed or bookmarked (if userId provided)
    let has_endorsed = false;
    let has_bookmarked = false;
    if (userId) {
      const { data: engagementData } = await supabase
        .from('resource_engagements')
        .select('engagement_type')
        .eq('resource_id', id)
        .eq('user_id', userId)
        .in('engagement_type', ['endorse', 'bookmark']);
      if (engagementData) {
        has_endorsed = engagementData.some((e: any) => e.engagement_type === 'endorse');
        has_bookmarked = engagementData.some((e: any) => e.engagement_type === 'bookmark');
      }
    }
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
      verified_by_name: data.verified_by_user?.full_name,
      has_endorsed,
      has_bookmarked,
    };
  },
  /**
   * @authority create Library
   */
  async createResource(
    input: CreateResourceInput,
    creatorId: string,
    creatorRole: string,
  ): Promise<LibraryResource> {
    // Normalize input fields to match exact DB column types:
    //  - `language` in DB is TEXT[] but the TypeScript input type uses a single string
    //  - `subjects` in DB is TEXT[] — the input has both `subject` (string) and `subjects` (array)
    //  - Strip any key that is not a valid column (e.g. bare `subject`)
    const { subject, language, subjects, languages, ...restInput } = input;
    const dbLanguage: string[] = languages && languages.length > 0
      ? languages
      : Array.isArray(language)
        ? (language as string[])
        : language
          ? [language as string]
          : ['en'];
    const dbSubjects: string[] = subjects && subjects.length > 0
      ? subjects
      : subject
        ? [subject]
        : [];

    const { data, error } = await supabase
      .from('nodes')
      .insert([
        {
          ...restInput,
          language: dbLanguage,
          subjects: dbSubjects,
          creator_id: creatorId,
          creator_role: creatorRole,
          is_community: true, // User-contributed content
          views: 0,
          uses_count: 0,
          endorsements: 0,
          bookmarks: 0,
          verified: VERIFIED_LIBRARY_CAPACITIES.has(toLibraryBondCapacity(creatorRole)), // Auto-verify for trusted capacities
        },
      ])
      .select('id')   // Only fetch id; avoids SELECT RLS visibility gate blocking the creator's own new row
      .single();

    if (error) {
      throw new APIError('Failed to create resource', error.code, error);
    }

    // Re-fetch the full row separately — the SELECT policy allows creators to read their
    // own rows via `creator_id = auth.uid()`, even for non-public / non-verified resources.
    const { data: fullData } = await supabase
      .from('nodes')
      .select('*, creator: users(full_name)')
      .eq('id', data.id)
      .maybeSingle();

    const resourceData = fullData ?? { id: data.id, creator: null, creator_name: null };

    // Trigger Growth Signals (Whispered Moment & Nourishing dimension)
    growthSignalsAPI.emitSilent({
      user_id: creatorId,
      event_type: 'resource_uploaded',
      event_metadata: {
        resource_id: data.id,
        resource_type: input.type,
      },
    });
    // Direct Rewards: Add 50 points for contribution
    try {
      const { rewardsAPI } = await import('@repo/core/api');
      void rewardsAPI.addPoints(creatorId, 50).catch(() => { });
    } catch (e) {
      console.warn('Rewards API not available for points', e);
    }
    return {
      ...resourceData,
      creator_name:
        (fullData as typeof fullData & { creator?: { full_name?: string } | null })?.creator?.full_name
        ?? (resourceData as { creator_name?: string | null }).creator_name
        ?? 'System',
    };
  },
  /**
   * @authority update Library
   */
  async updateResource(id: string, updates: Partial<LibraryResource>): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('nodes')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        creator: users!library_items_uploader_id_fkey(full_name),
        verified_by_user: users!library_resources_verified_by_fkey(full_name)
            `)
      .single();
    if (error) {
      throw new APIError('Failed to update resource', error.code, error);
    }
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
      verified_by_name: data.verified_by_user?.full_name,
    };
  },
  /**
   * @authority delete Library
   */
  async deleteResource(id: string): Promise<void> {
    const { error } = await supabase.from('nodes').delete().eq('id', id);
    if (error) {
      throw new APIError('Failed to delete resource', error.code, error);
    }
  },
  // ========================================================================
  // RESOURCE ENGAGEMENT
  // ========================================================================
  /**
   * @authority create Library
   */
  async trackView(resourceId: string, userId?: string): Promise<void> {
    // Increment view count
    const { error: updateError } = await supabase.rpc('increment_resource_views', {
      resource_id: resourceId,
    });
    if (updateError) {
      console.error('Failed to track view:', updateError);
    }
    // Track engagement if user is logged in
    if (userId) {
      await supabase.from('resource_engagements').insert([
        {
          resource_id: resourceId,
          user_id: userId,
          engagement_type: 'view',
        },
      ]);
      // Growth signal: user explored a resource (Witnessing dimension  absorbing, growing inward)
      growthSignalsAPI.emitSilent({
        user_id: userId,
        event_type: 'resource_read',
        event_metadata: {
          resource_id: resourceId,
        },
      });
    }
  },
  /**
   * @authority create Library
   */
  async trackUse(resourceId: string, userId: string, classroomId?: string): Promise<void> {
    // Increment uses count
    const { error: updateError } = await supabase.rpc('increment_resource_uses', {
      resource_id: resourceId,
    });
    if (updateError) {
      console.error('Failed to track use:', updateError);
    }
    // Track engagement
    await supabase.from('resource_engagements').insert([
      {
        resource_id: resourceId,
        user_id: userId,
        engagement_type: 'use',
        classroom_id: classroomId,
      },
    ]);
  },
  /**
   * @authority create Library
   */
  async endorseResource(resourceId: string, userId: string): Promise<void> {
    // Check if already endorsed
    const { data: existing } = await supabase
      .from('resource_engagements')
      .select('id')
      .eq('resource_id', resourceId)
      .eq('user_id', userId)
      .eq('engagement_type', 'endorse')
      .single();
    if (existing) {
      // Un-endorse
      await supabase
        .from('resource_engagements')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .eq('engagement_type', 'endorse');
      await supabase.rpc('decrement_resource_endorsements', {
        resource_id: resourceId,
      });
    } else {
      // Endorse
      await supabase.from('resource_engagements').insert([
        {
          resource_id: resourceId,
          user_id: userId,
          engagement_type: 'endorse',
        },
      ]);
      await supabase.rpc('increment_resource_endorsements', {
        resource_id: resourceId,
      });
      // Track contribution
      await supabase.from('contributions').insert([
        {
          user_id: userId,
          contribution_type: 'resource_endorsed',
          reference_id: resourceId,
        },
      ]);
    }
  },
  /**
   * @authority create Library
   */
  async bookmarkResource(resourceId: string, userId: string): Promise<void> {
    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('resource_engagements')
      .select('id')
      .eq('resource_id', resourceId)
      .eq('user_id', userId)
      .eq('engagement_type', 'bookmark')
      .single();
    if (existing) {
      // Un-bookmark
      await supabase
        .from('resource_engagements')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', userId)
        .eq('engagement_type', 'bookmark');
      await supabase.rpc('decrement_resource_bookmarks', {
        resource_id: resourceId,
      });
    } else {
      // Bookmark
      await supabase.from('resource_engagements').insert([
        {
          resource_id: resourceId,
          user_id: userId,
          engagement_type: 'bookmark',
        },
      ]);
      await supabase.rpc('increment_resource_bookmarks', {
        resource_id: resourceId,
      });
      // Impact Ripple: the resource creator gets a warm echo
      // "a teacher in your school kept your resource close"
      const { data: resource } = await supabase
        .from('nodes')
        .select('creator_id')
        .eq('id', resourceId)
        .maybeSingle();
      if (resource?.creator_id) {
        void impactRipplesAPI
          .createRipple({
            recipientUserId: resource.creator_id,
            actorUserId: userId,
            rippleType: 'resource_saved',
            sourceEntityType: 'resource',
            sourceEntityId: resourceId,
          })
          .catch(() => { });
      }
    }
  },
  /**
   * @authority update Library
   */
  async verifyResource(resourceId: string, verifiedBy: string): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('nodes')
      .update({
        verified: true,
        verified_by: verifiedBy,
      })
      .eq('id', resourceId)
      .select(`
            *,
            creator: users!library_items_uploader_id_fkey(full_name),
            verified_by_user: users!library_resources_verified_by_fkey(full_name)
                `)
      .single();
    if (error) {
      throw new APIError('Failed to verify resource', error.code, error);
    }
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
      verified_by_name: data.verified_by_user?.full_name,
    };
  },
  /**
   * @authority read Library
   */
  async getBookmarkedResources(
    userId: string,
    options: Pick<ResourceFilters, 'viewDate' | 'viewScale'> = {},
  ): Promise<LibraryResource[]> {
    let query = supabase
      .from('resource_engagements')
      .select(`
resource: nodes!resource_engagements_resource_id_fkey(
          *,
  creator: users!library_items_uploader_id_fkey(full_name)
)
  `)
      .eq('user_id', userId)
      .eq('engagement_type', 'bookmark');
    if (options.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: options.viewScale,
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) {
      throw new APIError('Failed to fetch bookmarked resources', error.code, error);
    }
    return (data || [])
      .map((item: any) => {
        const resource = Array.isArray(item.resource) ? item.resource[0] : item.resource;
        if (!resource) return null;
        return {
          ...resource,
          creator_name: resource.creator?.full_name || resource.creator_name || 'System',
          has_bookmarked: true,
        } as LibraryResource;
      })
      .filter((r: any): r is LibraryResource => r !== null);
  },
  // ========================================================================
  // COLLECTIONS
  // ========================================================================
  /**
   * @authority read Library
   */
  async getCollections(filters: CollectionFilters = {}): Promise<LibraryCollection[]> {
    const asOf = getTemporalAsOf(filters.viewDate);
    let explicitCollections: LibraryCollection[] = [];

    // 1. Fetch explicit collections from the DB
    if (!filters.only_virtual) {
      let query = supabase.from('collections').select(`
                  *,
                  creator: users!resource_collections_creator_id_fkey(full_name),
                  collection_nodes(node_id)
              `);
    // RLS alignment: For guests/unauthenticated users, allow public OR verified collections
    const userId = await identityAPI.getMyInternalId();
    if (!userId) {
      query = query.or('visibility.eq.public,verified.eq.true');
    } else {
      // Enhanced sharding:
      // - Personal: creator_id = userId & visibility = 'personal'
      // - Shared: (visibility = 'shared' AND school_id matches) OR (visibility = 'class' ...)
      // - Public: visibility = 'public'
      // For now, simpler OR for visibility logic
      if (!filters.creator_id) {
        query = query.or(
          // Public/shared collections visible to everyone
          // Plus ALL collections where the logged-in user is the creator (any visibility)
          `visibility.in.(public,shared),creator_id.eq.${userId}`,
        );
      }
    }
    if (filters.subject) query = query.eq('subject', filters.subject);
    if (filters.visibility) query = query.eq('visibility', filters.visibility);
    if (filters.creator_id) query = query.eq('creator_id', filters.creator_id);
    if (filters.search) {
      const term = filters.search.trim().replace(/'/g, "''");
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
    if (filters.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: filters.viewScale,
      });
    }
    query = query.order('created_at', { ascending: false });
    // Use a generous limit for explicit data if we're combining, but respect filter limit if provided
    const explicitLimit = filters.limit || 20;
    query = query.limit(explicitLimit);
    const { data: explicitData, error } = await query;
    if (error)
      throw new APIError(`Failed to fetch collections: ${error.message}`, error.code, error);
    // Map explicit collections with their resources
    explicitCollections = await Promise.all(
      (explicitData || []).map(async (col: any) => {
        let nodeIds = (col.collection_nodes || []).map((cn: any) => cn.node_id);
        if (asOf) {
          const { data: membershipData, error: membershipError } = await supabase.rpc(
            'get_collection_membership_as_of',
            {
              p_collection_id: col.id,
              p_as_of: asOf,
            },
          );
          if (membershipError) {
            throw new APIError(
              'Failed to reconstruct collection membership history',
              membershipError.code,
              membershipError,
            );
          }
          nodeIds = (membershipData || []).map((entry: any) => entry.node_id);
        }
        if (nodeIds.length === 0 && col.resource_ids?.length > 0) {
          nodeIds = col.resource_ids;
        }
        let resources: LibraryResource[] = [];
        if (nodeIds.length > 0) {
          const { data: resData } = await supabase
            .from('nodes')
            .select('*')
            .in('id', nodeIds.slice(0, 5));
          resources = resData || [];
        }
        return {
          ...col,
          creator_name: col.creator?.full_name || 'System',
          resources,
          resource_ids: nodeIds,
          used_by_count: nodeIds.length,
        };
      }),
    );
    }
    const activeExplicit = explicitCollections;
    // 2. Synthesize Virtual Collections from Subjects & Topics (Dynamic)
    // We only synthesize virtuals if we are not specifically looking for a single user's private collections
    let subjectVirtuals: LibraryCollection[] = [];
    let topicVirtuals: LibraryCollection[] = [];
    if (!filters.exclude_virtual && (!filters.creator_id || filters.visibility === 'public')) {
      const [{ data: subjectsData }, { data: topicsData }] = await Promise.all([
        supabase.rpc('get_node_subjects_count'),
        supabase.rpc('get_node_topics_count'),
      ]);
      const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
      // Search filtering for virtuals
      let filteredSubjects = subjectsData || [];
      let filteredTopics = topicsData || [];
      if (filters.search) {
        const term = filters.search.toLowerCase();
        filteredSubjects = filteredSubjects.filter((s: any) =>
          s.subject.toLowerCase().includes(term),
        );
        filteredTopics = filteredTopics.filter((t: any) => t.topic.toLowerCase().includes(term));
      }
      subjectVirtuals = filteredSubjects
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, filters.limit || 10)
        .map((s: any) => ({
          id: `subject:${s.subject}`,
          name: capitalize(s.subject),
          description: `Dynamic collection of ${s.count} resources in ${s.subject}`,
          creator_id: 'system',
          creator_name: 'Gurudevi',
          visibility: 'public',
          resources: [],
          resource_ids: [],
          sequence_order: [],
          subjects: [s.subject],
          topics: [],
          grades: [],
          school_id: explicitCollections[0]?.school_id || '',
          is_virtual: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          forks: 0,
          used_by_count: s.count,
          endorsements: 0,
        }));
      topicVirtuals = filteredTopics
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, filters.limit || 10)
        .map((t: any) => ({
          id: `topic:${t.topic}`,
          name: capitalize(t.topic),
          description: `Dynamic collection for ${t.topic}`,
          creator_id: 'system',
          creator_name: 'Gurudevi',
          visibility: 'public',
          resources: [],
          resource_ids: [],
          sequence_order: [],
          subjects: [],
          topics: [t.topic],
          grades: [],
          school_id: explicitCollections[0]?.school_id || '',
          is_virtual: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          forks: 0,
          used_by_count: t.count,
          endorsements: 0,
        }));
    }
    const combined = [...activeExplicit, ...subjectVirtuals, ...topicVirtuals];
    return filters.limit ? combined.slice(0, filters.limit) : combined;
  },
  /**
   * @authority read Library
   */
  async getCollectionById(
    id: string,
    userId?: string,
    options: Pick<ResourceFilters, 'viewDate' | 'viewScale'> = {},
  ): Promise<LibraryCollection> {
    const asOf = getTemporalAsOf(options.viewDate);
    // Handle Virtual Collections (Subjects or Topics)
    if (id.startsWith('subject:') || id.startsWith('topic:')) {
      const isSubject = id.startsWith('subject:');
      const term = id.split(':')[1] || '';
      const filters = isSubject ? { subject: term } : { topic: term };
      const resources = await this.getResources({
        ...filters,
        limit: 50,
        viewDate: options.viewDate,
        viewScale: options.viewScale,
      });
      return {
        id,
        name: capitalize(term),
        description: `Dynamic collection for ${term}`,
        creator_id: 'system',
        creator_name: 'Gurudevi',
        visibility: 'public',
        resources,
        resource_ids: resources.map((r) => r.id!),
        sequence_order: resources.map((_, i) => i),
        subjects: isSubject ? [term] : [],
        topics: !isSubject ? [term] : [],
        grades: [],
        school_id: '',
        is_virtual: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        forks: 0,
        used_by_count: resources.length,
        endorsements: 0,
        has_bookmarked: false,
      };
    }
    // We use a regex to ensure the userId is a valid UUID before passing to Supabase
    const isUUID =
      userId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[12345][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);

    // Step 1: Fetch the collection row + creator name (no fragile FK-hint joins on collection_nodes)
    let query = supabase
      .from('collections')
      .select('*, creator:users(full_name)')
      .eq('id', id);
    // For anonymous users or guests with local IDs, only fetch public/verified collections
    if (!isUUID) {
      query = query.or('is_public.eq.true,verified.eq.true');
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw new APIError('Failed to fetch collection', error.code, error);
    if (!data) throw new APIError('Collection not found', 'NOT_FOUND', null);

    // Step 2: Handle temporal membership (past view)
    let membershipNodeIds: string[] = [];
    if (asOf) {
      const { data: membershipData, error: membershipError } = await supabase.rpc(
        'get_collection_membership_as_of',
        { p_collection_id: id, p_as_of: asOf },
      );
      if (membershipError) {
        throw new APIError(
          'Failed to reconstruct collection membership history',
          membershipError.code,
          membershipError,
        );
      }
      membershipNodeIds = (membershipData || []).map((entry: any) => entry.node_id);
    }

    // Step 3: Fetch resources — try collection_nodes junction table first, fall back to resource_ids array
    let resources: LibraryResource[] = [];
    if (!asOf) {
      const { data: cnData } = await supabase
        .from('collection_nodes')
        .select('node_id')
        .eq('collection_id', id);
      const junctionNodeIds = (cnData || []).map((r: any) => r.node_id).filter(Boolean);
      const nodeIds = junctionNodeIds.length > 0 ? junctionNodeIds : (data.resource_ids || []);
      if (nodeIds.length > 0) {
        const { data: resData } = await supabase.from('nodes').select('*').in('id', nodeIds);
        resources = resData || [];
      }
    } else if (membershipNodeIds.length > 0) {
      const { data: resData } = await supabase.from('nodes').select('*').in('id', membershipNodeIds);
      resources = resData || [];
    } else if (data.resource_ids?.length > 0) {
      const { data: resData } = await supabase.from('nodes').select('*').in('id', data.resource_ids);
      resources = resData || [];
    }

    // Step 4: Check for endorsements
    let has_endorsed = false;
    if (userId) {
      const { data: endData } = await supabase
        .from('collection_endorsements')
        .select('id')
        .eq('collection_id', id)
        .eq('user_id', userId)
        .maybeSingle();
      has_endorsed = !!endData;
    }
    return {
      ...data,
      creator_name: (data.creator as any)?.full_name || data.creator_name || 'System',
      resources,
      resource_ids: resources.map((r) => r.id),
      used_by_count: resources.length,
      has_endorsed,
    };
  },
  /**
   * Create a new collection
   */
  async createCollection(
    input: CreateCollectionInput,
    creatorId: string,
  ): Promise<LibraryCollection> {
    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          ...input,
          creator_id: creatorId,
          sequence_order: input.resource_ids.map((_, index) => index),
          forks: 0,
          used_by_count: 0,
          endorsements: 0,
        },
      ])
      .select(`
    *,
    creator: users!resource_collections_creator_id_fkey(full_name)
      `)
      .single();
    if (error) {
      throw new APIError('Failed to create collection', error.code, error);
    }
    // Fetch resources
    let resources: LibraryResource[] = [];
    if (data.resource_ids && data.resource_ids.length > 0) {
      const { data: resourcesData } = await supabase
        .from('nodes')
        .select('*')
        .in('id', data.resource_ids);
      resources = resourcesData || [];
    }
    // Track contribution
    await supabase.from('contributions').insert([
      {
        user_id: creatorId,
        contribution_type: 'collection_created',
        reference_id: data.id,
      },
    ]);
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
      resources,
    };
  },
  /**
   * Add a resource to a collection
   */
  async addToCollection(collection_id: string, node_id: string): Promise<void> {
    const { error } = await supabase.from('collection_nodes').insert([{ collection_id, node_id }]);
    if (error && error.code !== '23505') {
      // Ignore unique constraint violation
      throw new APIError('Failed to add resource to collection junction', error.code, error);
    }
  },
  /**
   * Remove a resource from a collection
   */
  async removeFromCollection(collectionId: string, resourceId: string): Promise<void> {
    const { error } = await supabase
      .from('collection_nodes')
      .delete()
      .eq('collection_id', collectionId)
      .eq('node_id', resourceId);
    if (error) {
      throw new APIError('Failed to remove resource from collection', error.code, error);
    }
  },
  /**
   * Update collection metadata (CRUD)
   */
  async updateCollection(
    id: string,
    updates: Partial<LibraryCollection>,
  ): Promise<LibraryCollection> {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select(`
                *,
                creator: users!resource_collections_creator_id_fkey(full_name)
            `)
      .single();
    if (error) {
      throw new APIError('Failed to update collection', error.code, error);
    }
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
    };
  },
  /**
   * Fork (duplicate) a collection
   */
  async forkCollection(collectionId: string, userId: string): Promise<LibraryCollection> {
    const original = await this.getCollectionById(collectionId);
    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          name: `${original.name} (Fork)`,
          description: original.description,
          creator_id: userId,
          visibility: 'private', // Forks start as private
          resource_ids: original.resource_ids,
          sequence_order: original.sequence_order,
          subjects: original.subjects,
          topics: original.topics,
          grades: original.grades,
          estimated_duration: original.estimated_duration,
          original_collection_id: collectionId,
          forks: 0,
          used_by_count: 0,
          endorsements: 0,
        },
      ])
      .select(`
  *,
  creator: users!resource_collections_creator_id_fkey(full_name)
    `)
      .single();
    if (error) {
      throw new APIError('Failed to fork collection', error.code, error);
    }
    // Increment fork count on original
    await supabase.rpc('increment_collection_forks', {
      collection_id: collectionId,
    });
    return {
      ...data,
      creator_name: data.creator?.full_name || data.creator_name || 'System',
      resources: original.resources,
    };
  },
  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) {
      throw new APIError('Failed to delete collection', error.code, error);
    }
  },
  /**
   * Get the epistemic map topology (nodes and links)
   */
  async getMapTopology(): Promise<KnowledgeTopology> {
    // 1. Fetch Resources (Nodes)
    const { data: resources, error: resourceError } = await supabase
      .from('nodes')
      .select(
        'id, title, type, subjects, topics, tags, thumbnail_url, description, verified, is_ministry_official',
      );
    if (resourceError)
      throw new APIError('Failed to fetch resource topology', resourceError.code, resourceError);
    // 2. Fetch Semantic Edges
    const { data: edges, error: edgeError } = await supabase
      .from('edges')
      .select('from_node_id, to_node_id, relationship, weight');
    if (edgeError) throw new APIError('Failed to fetch semantic edges', edgeError.code, edgeError);
    // 3. Fetch Official Collections (Pathways)
    const { data: collections, error: collectionError } = await supabase
      .from('collections')
      .select('id, name, resource_ids, sequence_order')
      .eq('is_official', true);
    if (collectionError)
      throw new APIError(
        'Failed to fetch pathway collections',
        collectionError.code,
        collectionError,
      );
    const nodes: KnowledgeNode[] = [];
    const links: KnowledgeLink[] = [];
    const topicNodes = new Set<string>();
    // Process Resources
    resources.forEach((res) => {
      nodes.push({
        id: res.id,
        label: res.title,
        type: 'resource',
        group: res.type || 'unknown',
        thumbnail: res.thumbnail_url,
        metadata: {
          subjects: res.subjects,
          topics: res.topics,
          tags: res.tags,
          description: res.description,
          is_ministry_official: res.is_ministry_official,
        },
      });
      // Process Topics (Legacy auto-linking)
      const itemTopics = res.topics || [];
      itemTopics.forEach((topic: string) => {
        const topicId = `topic:${topic}`;
        if (!topicNodes.has(topicId)) {
          nodes.push({
            id: topicId,
            label: topic,
            type: 'topic',
            group: 'curiosity',
          });
          topicNodes.add(topicId);
        }
        links.push({
          source: res.id,
          target: topicId,
          value: 1,
          relationship: 'topic_association',
        });
      });
    });
    // Add Semantic Edges
    edges.forEach((edge) => {
      links.push({
        source: edge.from_node_id,
        target: edge.to_node_id,
        value: edge.weight || 1,
        relationship: edge.relationship as any,
      });
    });
    // Add Pathway Links from Collections
    collections.forEach((col) => {
      const resIds = col.resource_ids || [];
      for (let i = 0; i < resIds.length - 1; i++) {
        links.push({
          source: resIds[i],
          target: resIds[i + 1],
          value: 2, // Higher weight for pathways
          relationship: 'path',
          isPathway: true,
        });
      }
    });
    return { nodes, links };
  },
  /**
   * Report a broken link for a resource.
   * Triggers database failure count increment and status update.
   */
  async reportBrokenLink(resourceId: string): Promise<void> {
    const { error } = await supabase.rpc('report_broken_link', {
      resource_id: resourceId,
    });
    if (error) {
      console.error('Failed to report broken link:', error);
      throw new APIError('Failed to report broken link', error.code, error);
    }
  },
  /**
   * The Resonance Engine: Finds related "Knowledge Islands" (Map Layers)
   * for a given resource based on semantic similarity.
   */
  async getResonantKnowledge(resourceId: string): Promise<any[]> {
    try {
      // First fetch the resource to get subject/tags
      const { data: resource, error: fetchError } = await supabase
        .from('nodes')
        .select('subjects, tags')
        .eq('id', resourceId)
        .single();
      if (fetchError || !resource) return [];
      const query = `${resource.subjects?.[0] || ''} ${resource.tags?.join(' ') || ''}`;
      const { data } = await supabase.rpc('search_map_universe', {
        query_text: query,
        match_count: 3,
      });
      return data || [];
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
      'getMapTopology',
      'reportBrokenLink',
      'getResonantKnowledge',
      'getGeoTopology',
    ],
  }),
);
export const libraryAPI = createTemporalProxy('library', rawLibraryAPI);
void [libraryContract, libraryCoverage];
