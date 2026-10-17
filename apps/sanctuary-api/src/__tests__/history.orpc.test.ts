import './setup';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../core/app';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockClassroomNoteRead,
  setMockClassroomRelationships,
  setMockCollectionNodeEvents,
  setMockQueryRowsQueue,
  setMockUsers,
  setMockZenStackDbAvailable,
} from './setup';

describe('history API (identity/database substituted)', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const actorId = '123e4567-e89b-12d3-a456-426614174001';
  const classroomId = '123e4567-e89b-12d3-a456-426614174001';
  const collectionId = '123e4567-e89b-12d3-a456-426614174003';
  const nodeId = '123e4567-e89b-12d3-a456-426614174004';
  const recordId = '123e4567-e89b-12d3-a456-426614174007';
  const client = createTestORPCClient({ Authorization: `Bearer ${userId}` }).history;

  afterEach(() => {
    setMockClassroomNoteRead(undefined);
  });

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-history',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockClassroomRelationships({
      classrooms: [{ id: classroomId, school_id: 'school-123', teacher_id: userId }],
    });
    setMockClassroomNoteRead({
      id: recordId,
      classroom_id: classroomId,
      school_id: 'school-123',
      author_id: userId,
      classroom: { school_id: 'school-123' },
    });
    setMockUsers([{ id: actorId, full_name: 'Test Actor' }]);
    setMockCollectionNodeEvents([]);
    setMockQueryRowsQueue([]);
  });

  describe('getCollectionMembershipTimeline', () => {
    it('rejects malformed collection identifiers at the transport boundary', async () => {
      await expect(
        client.getCollectionMembershipTimeline({ params: { collectionId: 'bad-id' } }),
      ).rejects.toMatchObject({ status: 400 });
    });
    it('returns empty array when no events exist', async () => {
      expect(await client.getCollectionMembershipTimeline({ params: { collectionId } })).toEqual(
        [],
      );
    });
    it('returns timeline events with actor info', async () => {
      setMockCollectionNodeEvents([
        {
          id: 'event-1',
          collection_id: collectionId,
          node_id: nodeId,
          event_type: 'added',
          position: 0,
          occurred_at: '2026-08-14T10:00:00.000Z',
          actor_id: actorId,
        },
      ]);
      const response = await client.getCollectionMembershipTimeline({ params: { collectionId } });
      expect(response).toHaveLength(1);
      expect(response[0]).toMatchObject({
        id: 'event-1',
        collection_id: collectionId,
        node_id: nodeId,
        event_type: 'added',
        actor_id: actorId,
        actor: { full_name: 'Test Actor' },
      });
    });
    it('returns timeline events with null actor when actor not found', async () => {
      setMockCollectionNodeEvents([
        {
          id: 'event-1',
          collection_id: collectionId,
          node_id: nodeId,
          event_type: 'added',
          position: 0,
          occurred_at: '2026-08-14T10:00:00.000Z',
          actor_id: 'unknown-actor',
        },
      ]);
      setMockUsers([]);
      const response = await client.getCollectionMembershipTimeline({ params: { collectionId } });
      expect(response).toHaveLength(1);
      expect(response[0].actor).toBeNull();
    });
  });
  describe('getCollectionMembershipAsOf', () => {
    it('returns empty array when no events exist', async () => {
      expect(
        await client.getCollectionMembershipAsOf({
          params: { collectionId },
          query: { asOf: '2026-08-14T10:00:00.000Z' },
        }),
      ).toEqual([]);
    });
    it('returns current members as of given date', async () => {
      setMockCollectionNodeEvents([
        {
          id: 'event-1',
          collection_id: collectionId,
          node_id: nodeId,
          event_type: 'added',
          position: 0,
          occurred_at: '2026-08-14T09:00:00.000Z',
        },
        {
          id: 'event-2',
          collection_id: collectionId,
          node_id: nodeId,
          event_type: 'removed',
          position: 0,
          occurred_at: '2026-08-14T11:00:00.000Z',
        },
      ]);
      const response = await client.getCollectionMembershipAsOf({
        params: { collectionId },
        query: { asOf: '2026-08-14T10:00:00.000Z' },
      });
      expect(response).toHaveLength(1);
      expect(response[0].node_id).toBe(nodeId);
      expect(response[0].added_at).toBe('2026-08-14T09:00:00.000Z');
    });
  });
  describe('getLibraryEntityHistory', () => {
    it('returns empty array when no version history exists', async () => {
      expect(
        await client.getLibraryEntityHistory({
          params: {
            entityType: 'collection',
            entityId: collectionId,
          },
        }),
      ).toEqual([]);
    });
    it('returns version history for public entity', async () => {
      setMockQueryRowsQueue([
        [
          {
            id: 'version-1',
            entity_type: 'collection',
            entity_id: collectionId,
            event_type: 'update',
            changed_at: new Date('2026-08-14T10:00:00.000Z'),
            changed_by: actorId,
            snapshot: { visibility: 'public', title: 'Updated' },
            author_full_name: 'Test Actor',
          },
        ],
      ]);
      expect(
        await client.getLibraryEntityHistory({
          params: {
            entityType: 'collection',
            entityId: collectionId,
          },
        }),
      ).toEqual([
        {
          id: 'version-1',
          entity_type: 'collection',
          entity_id: collectionId,
          event_type: 'update',
          changed_at: '2026-08-14T10:00:00.000Z',
          changed_by: actorId,
          snapshot: { visibility: 'public', title: 'Updated' },
          author: { full_name: 'Test Actor' },
        },
      ]);
    });
  });
  describe('getCommunityEntityHistory', () => {
    it('returns empty array when no version history exists', async () => {
      expect(
        await client.getCommunityEntityHistory({
          params: {
            entityType: 'community_post',
            entityId: nodeId,
          },
        }),
      ).toEqual([]);
    });
    it('returns version history for community entity', async () => {
      setMockQueryRowsQueue([
        [
          {
            id: 'version-community',
            entity_type: 'community_post',
            entity_id: nodeId,
            event_type: 'insert',
            changed_at: new Date('2026-08-14T10:00:00.000Z'),
            changed_by: null,
            snapshot: { content: 'Hello' },
            author_full_name: null,
          },
        ],
      ]);
      expect(
        await client.getCommunityEntityHistory({
          params: {
            entityType: 'community_post',
            entityId: nodeId,
          },
        }),
      ).toEqual([
        {
          id: 'version-community',
          entity_type: 'community_post',
          entity_id: nodeId,
          event_type: 'insert',
          changed_at: '2026-08-14T10:00:00.000Z',
          changed_by: null,
          snapshot: { content: 'Hello' },
          author: null,
        },
      ]);
    });
  });
  describe('getClassroomNoteHistory', () => {
    it('serves authorized stored-note history through the read-only OpenAPI projection', async () => {
      setMockQueryRowsQueue([
        [
          {
            id: 'audit-openapi',
            table_name: 'classroom_notes',
            record_id: recordId,
            action: 'INSERT',
            old_data: null,
            new_data: { content: 'Recorded' },
            changed_by: userId,
            changed_at: new Date('2026-08-14T10:00:00.000Z'),
            author_full_name: 'Teacher',
          },
        ],
      ]);
      const response = await app.request(`/api/openapi/history/classroom-notes/${recordId}`, {
        headers: { Authorization: `Bearer ${userId}` },
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([
        {
          id: 'audit-openapi',
          table_name: 'classroom_notes',
          record_id: recordId,
          action: 'INSERT',
          old_data: null,
          new_data: { content: 'Recorded' },
          changed_by: userId,
          changed_at: '2026-08-14T10:00:00.000Z',
          author: { full_name: 'Teacher' },
        },
      ]);
    });

    it.each(['teacher', 'principal'])(
      'denies foreign-school stored history for %s',
      async (capacity) => {
        setMockActiveBond({
          user_id: userId,
          entity_id: 'school-123',
          entity_type: 'SCHOOL',
          capacity,
        });
        setMockClassroomNoteRead({
          id: recordId,
          classroom_id: classroomId,
          author_id: userId,
          classroom: { school_id: 'foreign-school' },
        });
        await expect(
          client.getClassroomNoteHistory({ params: { recordId } }),
        ).rejects.toMatchObject({ status: 403 });
        const response = await app.request(`/api/openapi/history/classroom-notes/${recordId}`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        expect(response.status).toBe(403);
        await expect(
          createTestORPCClient({
            Authorization: `Bearer ${userId}`,
          }).educational.getClassroomNoteTimeline({ params: { id: recordId } }),
        ).rejects.toMatchObject({ status: 403 });
      },
    );

    it('does not grant teacher history access to an unresolved note', async () => {
      setMockClassroomNoteRead(null);
      await expect(client.getClassroomNoteHistory({ params: { recordId } })).rejects.toMatchObject({
        status: 403,
      });
    });
    it('returns empty array when note not found', async () => {
      setMockActiveBond({
        user_id: userId,
        entity_id: 'school-123',
        entity_type: 'SCHOOL',
        capacity: 'principal',
      });
      setMockClassroomNoteRead(null);
      expect(await client.getClassroomNoteHistory({ params: { recordId } })).toEqual([]);
    });
    it('returns audit log for classroom note', async () => {
      setMockQueryRowsQueue([
        [
          {
            id: 'audit-1',
            table_name: 'classroom_notes',
            record_id: recordId,
            action: 'UPDATE',
            old_data: { content: 'Before' },
            new_data: { content: 'After' },
            changed_by: actorId,
            changed_at: new Date('2026-08-14T10:00:00.000Z'),
            author_full_name: 'Test Actor',
          },
        ],
      ]);
      expect(await client.getClassroomNoteHistory({ params: { recordId } })).toEqual([
        {
          id: 'audit-1',
          table_name: 'classroom_notes',
          record_id: recordId,
          action: 'UPDATE',
          old_data: { content: 'Before' },
          new_data: { content: 'After' },
          changed_by: actorId,
          changed_at: '2026-08-14T10:00:00.000Z',
          author: { full_name: 'Test Actor' },
        },
      ]);
    });
  });
});
