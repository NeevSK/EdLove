/**
 * History API
 *
 * Fetches version history/audit logs for records.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import {
  auditLogEntry,
  collectionMembershipAsOfEntry,
  collectionMembershipEvent,
  historyContract,
  versionHistoryEntry,
} from '@repo/core/api/history.contract';
import { APIError } from '@repo/core/types/API';

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
    if (tableName !== 'classroom_notes')
      throw new APIError('History is not available for this table', 'UNSUPPORTED_HISTORY_TABLE');
    try {
      const res = await orpcClient.history.getClassroomNoteHistory({
        params: { recordId },
      });
      return (res as unknown[]).map((row: unknown) => auditLogEntry.parse(row)) as AuditLogEntry[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch record history',
        error.status?.toString() || error.code || 'HISTORY_FETCH_FAILED',
      );
    }
  },

  /**
   * Community entity history from the temporal version table.
   */
  async getCommunityEntityHistory(
    entityType: CommunityHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    try {
      const res = await orpcClient.history.getCommunityEntityHistory({
        params: { entityType, entityId },
      });
      return (res as unknown[]).map((row: unknown) =>
        versionHistoryEntry.parse(row),
      ) as VersionHistoryEntry[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch community history',
        error.status?.toString() || error.code || 'HISTORY_FETCH_FAILED',
      );
    }
  },

  /**
   * Library entity history from the temporal version table.
   */
  async getLibraryEntityHistory(
    entityType: LibraryHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    try {
      const res = await orpcClient.history.getLibraryEntityHistory({
        params: { entityType, entityId },
      });
      return (res as unknown[]).map((row: unknown) =>
        versionHistoryEntry.parse(row),
      ) as VersionHistoryEntry[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch library history',
        error.status?.toString() || error.code || 'HISTORY_FETCH_FAILED',
      );
    }
  },

  /**
   * Collection membership event stream.
   */
  async getCollectionMembershipTimeline(
    collectionId: string,
  ): Promise<CollectionMembershipEvent[]> {
    try {
      const res = await orpcClient.history.getCollectionMembershipTimeline({
        params: { collectionId },
      });
      return (res as unknown[]).map((row: unknown) =>
        collectionMembershipEvent.parse(row),
      ) as CollectionMembershipEvent[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch collection membership timeline',
        error.status?.toString() || error.code || 'HISTORY_FETCH_FAILED',
      );
    }
  },

  /**
   * Collection membership reconstructed for a specific timestamp.
   */
  async getCollectionMembershipAsOf(
    collectionId: string,
    asOf: string,
  ): Promise<CollectionMembershipAsOfEntry[]> {
    try {
      const res = await orpcClient.history.getCollectionMembershipAsOf({
        params: { collectionId },
        query: { asOf },
      });
      return (res as unknown[]).map((row: unknown) =>
        collectionMembershipAsOfEntry.parse(row),
      ) as CollectionMembershipAsOfEntry[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to reconstruct collection membership',
        error.status?.toString() || error.code || 'HISTORY_FETCH_FAILED',
      );
    }
  },
};

void historyContract;
