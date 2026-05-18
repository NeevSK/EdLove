/**
 * History API
 *
 * Fetches version history/audit logs for records.
 */

import { APIError } from '../types/API';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  changed_by: string | null;
  changed_at: string;
  author?: {
    full_name: string;
  };
}

export type CommunityHistoryEntityType =
  | 'community_post'
  | 'community_comment'
  | 'group_message'
  | 'direct_message';

export type LibraryHistoryEntityType = 'node' | 'collection';

export interface VersionHistoryEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: 'insert' | 'update' | 'delete';
  changed_at: string;
  changed_by: string | null;
  snapshot: Record<string, unknown>;
  author?: {
    full_name: string;
  };
}

export interface CollectionMembershipEvent {
  id: string;
  collection_id: string;
  node_id: string;
  event_type: 'added' | 'removed' | 'reordered';
  position: number | null;
  occurred_at: string;
  actor_id: string | null;
  actor?: {
    full_name: string;
  };
}

export interface CollectionMembershipAsOfEntry {
  node_id: string;
  position: number;
  added_at: string | null;
  removed_at: string | null;
}

export const historyAPI = {
  /**
   * Get the history for a specific record in a table.
   */
  async getForRecord(tableName: string, recordId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('audit_logs') // Assuming we create a view or use the audit schema directly
      .select(`
                *,
                author:users!changed_by (
                    full_name
                )
            `)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('changed_at', { ascending: false });

    if (error) {
      throw new APIError(`Failed to fetch history for ${tableName}:${recordId}`, error.code, error);
    }

    return (data || []) as AuditLogEntry[];
  },

  /**
   * Community entity history from the temporal version table.
   */
  async getCommunityEntityHistory(
    entityType: CommunityHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('community_entity_versions')
      .select(`
                *,
                author:users!changed_by (
                    full_name
                )
            `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('changed_at', { ascending: false });

    if (error) {
      throw new APIError(
        `Failed to fetch community history for ${entityType}:${entityId}`,
        error.code,
        error,
      );
    }

    return (data || []) as VersionHistoryEntry[];
  },

  /**
   * Library entity history from the temporal version table.
   */
  async getLibraryEntityHistory(
    entityType: LibraryHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('library_entity_versions')
      .select(`
                *,
                author:users!changed_by (
                    full_name
                )
            `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('changed_at', { ascending: false });

    if (error) {
      throw new APIError(
        `Failed to fetch library history for ${entityType}:${entityId}`,
        error.code,
        error,
      );
    }

    return (data || []) as VersionHistoryEntry[];
  },

  /**
   * Collection membership event stream.
   */
  async getCollectionMembershipTimeline(
    collectionId: string,
  ): Promise<CollectionMembershipEvent[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('collection_node_events')
      .select(`
                *,
                actor:users!actor_id (
                    full_name
                )
            `)
      .eq('collection_id', collectionId)
      .order('occurred_at', { ascending: false });

    if (error) {
      throw new APIError(
        `Failed to fetch collection membership timeline for ${collectionId}`,
        error.code,
        error,
      );
    }

    return (data || []) as CollectionMembershipEvent[];
  },

  /**
   * Collection membership reconstructed for a specific timestamp.
   */
  async getCollectionMembershipAsOf(
    collectionId: string,
    asOf: string,
  ): Promise<CollectionMembershipAsOfEntry[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc('get_collection_membership_as_of', {
      p_collection_id: collectionId,
      p_as_of: asOf,
    });

    if (error) {
      throw new APIError(
        `Failed to reconstruct collection membership for ${collectionId}`,
        error.code,
        error,
      );
    }

    return (data || []) as CollectionMembershipAsOfEntry[];
  },
};
