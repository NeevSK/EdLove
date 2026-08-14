/**
 * History API
 *
 * Fetches version history/audit logs for records.
 */

import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import {
  auditLogEntry,
  collectionMembershipAsOfEntry,
  collectionMembershipEvent,
  historyContract,
  versionHistoryEntry,
} from '@repo/core/api/history.contract';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

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
    const res = await (client.api as any).history['classroom-notes'][':recordId'].$get({
      param: { recordId },
    });
    if (!res.ok) throw new APIError('Failed to fetch record history', res.status.toString());
    return (await res.json()).map((row: unknown) => auditLogEntry.parse(row)) as AuditLogEntry[];
  },

  /**
   * Community entity history from the temporal version table.
   */
  async getCommunityEntityHistory(
    entityType: CommunityHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    const res = await (client.api as any).history.community[':entityType'][':entityId'].$get({
      param: { entityType, entityId },
    });
    if (!res.ok) throw new APIError('Failed to fetch community history', res.status.toString());
    return (await res.json()).map((row: unknown) =>
      versionHistoryEntry.parse(row),
    ) as VersionHistoryEntry[];
  },

  /**
   * Library entity history from the temporal version table.
   */
  async getLibraryEntityHistory(
    entityType: LibraryHistoryEntityType,
    entityId: string,
  ): Promise<VersionHistoryEntry[]> {
    const res = await (client.api as any).history.library[':entityType'][':entityId'].$get({
      param: { entityType, entityId },
    });
    if (!res.ok) throw new APIError('Failed to fetch library history', res.status.toString());
    return (await res.json()).map((row: unknown) =>
      versionHistoryEntry.parse(row),
    ) as VersionHistoryEntry[];
  },

  /**
   * Collection membership event stream.
   */
  async getCollectionMembershipTimeline(
    collectionId: string,
  ): Promise<CollectionMembershipEvent[]> {
    const res = await (client.api as any).history.collections[':collectionId'].membership.$get({
      param: { collectionId },
    });
    if (!res.ok)
      throw new APIError('Failed to fetch collection membership timeline', res.status.toString());
    return (await res.json()).map((row: unknown) =>
      collectionMembershipEvent.parse(row),
    ) as CollectionMembershipEvent[];
  },

  /**
   * Collection membership reconstructed for a specific timestamp.
   */
  async getCollectionMembershipAsOf(
    collectionId: string,
    asOf: string,
  ): Promise<CollectionMembershipAsOfEntry[]> {
    const res = await (client.api as any).history.collections[':collectionId'].membership[
      'as-of'
    ].$get({
      param: { collectionId },
      query: { asOf },
    });
    if (!res.ok)
      throw new APIError('Failed to reconstruct collection membership', res.status.toString());
    return (await res.json()).map((row: unknown) =>
      collectionMembershipAsOfEntry.parse(row),
    ) as CollectionMembershipAsOfEntry[];
  },
};

void historyContract;
