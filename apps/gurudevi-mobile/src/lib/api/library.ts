import { supabase } from '../supabase';
import { APIError } from './types';
import {
  LibraryResource,
  ResourceCollection,
  ResourceFilters,
  CollectionFilters,
  CreateResourceInput,
  CreateCollectionInput,
} from '../../types/Community';
import {
  requireAuth,
  requireClassroomAccess,
  requireStudentAccess
} from '../../utils/authorization';
import { UserRole } from '../../types/User';
import { hasRole, STAFF_ROLES } from '../../utils/permissions';

// ============================================================================
// LIBRARY API - Resource Management for Educational Ecology
// ============================================================================

export const libraryAPI = {
  // ========================================================================
  // RESOURCES
  // ========================================================================

  /**
   * Get all resources with optional filtering
   */
  async getResources(filters: ResourceFilters = {}): Promise<LibraryResource[]> {
    let query = supabase
      .from('library_resources')
      .select(`
  *,
  creator: users!library_resources_creator_id_fkey(full_name),
    verified_by_user: users!library_resources_verified_by_fkey(full_name)
      `);

    // Apply filters
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.subject) query = query.eq('subject', filters.subject);
    if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters.language) query = query.eq('language', filters.language);
    if (filters.visibility) query = query.eq('visibility', filters.visibility);
    if (filters.verified_only) query = query.eq('verified', true);
    if (filters.creator_role) query = query.eq('creator_role', filters.creator_role);
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
      query = query.or(`title.ilike.% ${filters.search}%, description.ilike.% ${filters.search}% `);
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
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error } = await query;

    if (error) {
      throw new APIError('Failed to fetch resources', error.code, error);
    }

    return (data || []).map(resource => ({
      ...resource,
      creator_name: resource.creator?.full_name || 'Unknown',
      verified_by_name: resource.verified_by_user?.full_name,
    }));
  },

  /**
   * Get a single resource by ID
   */
  async getResourceById(id: string, userId?: string): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('library_resources')
      .select(`
  *,
  creator: users!library_resources_creator_id_fkey(full_name),
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
        has_endorsed = engagementData.some(e => e.engagement_type === 'endorse');
        has_bookmarked = engagementData.some(e => e.engagement_type === 'bookmark');
      }
    }

    return {
      ...data,
      creator_name: data.creator?.full_name || 'Unknown',
      verified_by_name: data.verified_by_user?.full_name,
      has_endorsed,
      has_bookmarked,
    };
  },

  /**
   * Create a new resource
   */
  async createResource(input: CreateResourceInput, creatorId: string, creatorRole: string): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('library_resources')
      .insert([
        {
          ...input,
          creator_id: creatorId,
          creator_role: creatorRole,
          views: 0,
          uses_count: 0,
          endorsements: 0,
          bookmarks: 0,
          verified: hasRole(creatorRole as UserRole, STAFF_ROLES), // Auto-verify for staff
        },
      ])
      .select(`
      *,
      creator: users!library_resources_creator_id_fkey(full_name)
        `)
      .single();

    if (error) {
      throw new APIError('Failed to create resource', error.code, error);
    }

    return {
      ...data,
      creator_name: data.creator?.full_name || 'Unknown',
    };
  },

  /**
   * Update an existing resource
   */
  async updateResource(id: string, updates: Partial<LibraryResource>): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('library_resources')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        creator: users!library_resources_creator_id_fkey(full_name),
          verified_by_user: users!library_resources_verified_by_fkey(full_name)
            `)
      .single();

    if (error) {
      throw new APIError('Failed to update resource', error.code, error);
    }

    return {
      ...data,
      creator_name: data.creator?.full_name || 'Unknown',
      verified_by_name: data.verified_by_user?.full_name,
    };
  },

  /**
   * Delete a resource
   */
  async deleteResource(id: string): Promise<void> {
    const { error } = await supabase
      .from('library_resources')
      .delete()
      .eq('id', id);

    if (error) {
      throw new APIError('Failed to delete resource', error.code, error);
    }
  },

  // ========================================================================
  // RESOURCE ENGAGEMENT
  // ========================================================================

  /**
   * Track a resource view
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
    }
  },

  /**
   * Track resource use (e.g., used in a class)
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
   * Endorse a resource
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
   * Bookmark a resource
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
    }
  },

  /**
   * Verify a resource (teachers/principals only)
   */
  async verifyResource(resourceId: string, verifiedBy: string): Promise<LibraryResource> {
    const { data, error } = await supabase
      .from('library_resources')
      .update({
        verified: true,
        verified_by: verifiedBy,
      })
      .eq('id', resourceId)
      .select(`
            *,
            creator: users!library_resources_creator_id_fkey(full_name),
              verified_by_user: users!library_resources_verified_by_fkey(full_name)
                `)
      .single();

    if (error) {
      throw new APIError('Failed to verify resource', error.code, error);
    }

    return {
      ...data,
      creator_name: data.creator?.full_name || 'Unknown',
      verified_by_name: data.verified_by_user?.full_name,
    };
  },

  /**
   * Get bookmarked resources for a user
   */
  async getBookmarkedResources(userId: string): Promise<LibraryResource[]> {
    const { data, error } = await supabase
      .from('resource_engagements')
      .select(`
resource: library_resources!resource_engagements_resource_id_fkey(
          *,
  creator: users!library_resources_creator_id_fkey(full_name)
)
  `)
      .eq('user_id', userId)
      .eq('engagement_type', 'bookmark')
      .order('created_at', { ascending: false });

    if (error) {
      throw new APIError('Failed to fetch bookmarked resources', error.code, error);
    }

    return (data || [])
      .map(item => {
        const resource = Array.isArray(item.resource) ? item.resource[0] : item.resource;
        if (!resource) return null;

        return {
          ...resource,
          creator_name: resource.creator?.full_name || 'Unknown',
          has_bookmarked: true,
        } as LibraryResource;
      })
      .filter((r): r is LibraryResource => r !== null);
  },

  // ========================================================================
  // COLLECTIONS
  // ========================================================================

  /**
   * Get all collections with optional filtering
   */
  async getCollections(filters: CollectionFilters = {}): Promise<ResourceCollection[]> {
    let query = supabase
      .from('resource_collections')
      .select(`
  *,
  creator: users!resource_collections_creator_id_fkey(full_name)
      `);

    if (filters.subject) query = query.eq('subject', filters.subject);
    if (filters.visibility) query = query.eq('visibility', filters.visibility);
    if (filters.creator_id) query = query.eq('creator_id', filters.creator_id);
    if (filters.grades && filters.grades.length > 0) {
      query = query.overlaps('grades', filters.grades);
    }
    if (filters.search) {
      query = query.or(`name.ilike.% ${filters.search}%, description.ilike.% ${filters.search}% `);
    }

    query = query.order('created_at', { ascending: false });

    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error } = await query;

    if (error) {
      throw new APIError('Failed to fetch collections', error.code, error);
    }

    // Fetch resources for each collection
    const collectionsWithResources = await Promise.all(
      (data || []).map(async collection => {
        if (collection.resource_ids && collection.resource_ids.length > 0) {
          const { data: resources } = await supabase
            .from('library_resources')
            .select('*')
            .in('id', collection.resource_ids);

          return {
            ...collection,
            creator_name: collection.creator?.full_name || 'Unknown',
            resources: resources || [],
          };
        }

        return {
          ...collection,
          creator_name: collection.creator?.full_name || 'Unknown',
          resources: [],
        };
      })
    );

    return collectionsWithResources;
  },

  /**
   * Get a single collection by ID
   */
  async getCollectionById(id: string, userId?: string): Promise<ResourceCollection> {
    const { data, error } = await supabase
      .from('resource_collections')
      .select(`
  *,
  creator: users!resource_collections_creator_id_fkey(full_name)
    `)
      .eq('id', id)
      .single();

    if (error) {
      throw new APIError('Failed to fetch collection', error.code, error);
    }

    // Fetch resources
    let resources: LibraryResource[] = [];
    if (data.resource_ids && data.resource_ids.length > 0) {
      const { data: resourcesData } = await supabase
        .from('library_resources')
        .select('*')
        .in('id', data.resource_ids);

      resources = resourcesData || [];
    }

    // Check if user has endorsed
    let has_endorsed = false;
    if (userId) {
      const { data: endorsementData } = await supabase
        .from('collection_endorsements')
        .select('id')
        .eq('collection_id', id)
        .eq('user_id', userId)
        .single();

      has_endorsed = !!endorsementData;
    }

    return {
      ...data,
      creator_name: data.creator?.full_name || 'Unknown',
      resources,
      has_endorsed,
    };
  },

  /**
   * Create a new collection
   */
  async createCollection(input: CreateCollectionInput, creatorId: string): Promise<ResourceCollection> {
    const { data, error } = await supabase
      .from('resource_collections')
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
        .from('library_resources')
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
      creator_name: data.creator?.full_name || 'Unknown',
      resources,
    };
  },

  /**
   * Add a resource to a collection
   */
  async addToCollection(collectionId: string, resourceId: string): Promise<void> {
    const { data: collection } = await supabase
      .from('resource_collections')
      .select('resource_ids, sequence_order')
      .eq('id', collectionId)
      .single();

    if (!collection) {
      throw new APIError('Collection not found');
    }

    const newResourceIds = [...(collection.resource_ids || []), resourceId];
    const newSequenceOrder = [...(collection.sequence_order || []), newResourceIds.length - 1];

    const { error } = await supabase
      .from('resource_collections')
      .update({
        resource_ids: newResourceIds,
        sequence_order: newSequenceOrder,
      })
      .eq('id', collectionId);

    if (error) {
      throw new APIError('Failed to add resource to collection', error.code, error);
    }
  },

  /**
   * Fork (duplicate) a collection
   */
  async forkCollection(collectionId: string, userId: string): Promise<ResourceCollection> {
    const original = await this.getCollectionById(collectionId);

    const { data, error } = await supabase
      .from('resource_collections')
      .insert([
        {
          name: `${original.name} (Fork)`,
          description: original.description,
          creator_id: userId,
          visibility: 'private', // Forks start as private
          resource_ids: original.resource_ids,
          sequence_order: original.sequence_order,
          subject: original.subject,
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
      creator_name: data.creator?.full_name || 'Unknown',
      resources: original.resources,
    };
  },

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('resource_collections')
      .delete()
      .eq('id', id);

    if (error) {
      throw new APIError('Failed to delete collection', error.code, error);
    }
  },
};
