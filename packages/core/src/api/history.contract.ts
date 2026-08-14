import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const collectionMembershipEvent = z.object({
  id: z.string(),
  collection_id: z.string(),
  node_id: z.string(),
  event_type: z.enum(['added', 'removed', 'reordered']),
  position: z.number().int().nullable(),
  occurred_at: z.string().datetime(),
  actor_id: z.string().nullable(),
  actor: z.object({ full_name: z.string() }).nullable(),
});

const collectionMembershipAsOfEntry = z.object({
  node_id: z.string(),
  position: z.number().int(),
  added_at: z.string().datetime().nullable(),
  removed_at: z.string().datetime().nullable(),
});

const versionHistoryEntry = z.object({
  id: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  event_type: z.enum(['insert', 'update', 'delete']),
  changed_at: z.string().datetime(),
  changed_by: z.string().nullable(),
  snapshot: z.record(z.string(), z.unknown()),
  author: z.object({ full_name: z.string() }).nullable(),
});

const auditLogEntry = z.object({
  id: z.string(),
  table_name: z.literal('classroom_notes'),
  record_id: z.string(),
  action: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  old_data: z.record(z.string(), z.unknown()).nullable(),
  new_data: z.record(z.string(), z.unknown()).nullable(),
  changed_by: z.string().nullable(),
  changed_at: z.string().datetime(),
  author: z.object({ full_name: z.string() }).nullable(),
});

export const historyContract = {
  getCollectionMembershipTimeline: {
    method: 'get',
    path: '/history/collections/:collectionId/membership',
    request: { params: z.object({ collectionId: z.string().uuid() }) },
    responses: {
      200: {
        schema: z.array(collectionMembershipEvent),
        description: 'Read the append-only collection membership timeline',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Library' } },
  },
  getCollectionMembershipAsOf: {
    method: 'get',
    path: '/history/collections/:collectionId/membership/as-of',
    request: {
      params: z.object({ collectionId: z.string().uuid() }),
      query: z.object({ asOf: z.string().datetime() }),
    },
    responses: {
      200: {
        schema: z.array(collectionMembershipAsOfEntry),
        description: 'Reconstruct collection membership at a timestamp',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Library' } },
  },
  getLibraryEntityHistory: {
    method: 'get',
    path: '/history/library/:entityType/:entityId',
    request: {
      params: z.object({
        entityType: z.enum(['node', 'collection']),
        entityId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        schema: z.array(versionHistoryEntry),
        description: 'Read authorized library entity version history',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Library' } },
  },
  getCommunityEntityHistory: {
    method: 'get',
    path: '/history/community/:entityType/:entityId',
    request: {
      params: z.object({
        entityType: z.enum([
          'community_post',
          'community_comment',
          'group_message',
          'direct_message',
        ]),
        entityId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        schema: z.array(versionHistoryEntry),
        description: 'Read authorized community entity version history',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Library' } },
  },
  getClassroomNoteHistory: {
    method: 'get',
    path: '/history/classroom-notes/:recordId',
    request: { params: z.object({ recordId: z.string().uuid() }) },
    responses: {
      200: {
        schema: z.array(auditLogEntry),
        description: 'Read authorized classroom-note audit history',
      },
    },
    metadata: { policy: { action: 'read', subject: 'ClassroomNote' } },
  },
} as const satisfies SovereignContract;

export {
  auditLogEntry,
  collectionMembershipAsOfEntry,
  collectionMembershipEvent,
  versionHistoryEntry,
};
