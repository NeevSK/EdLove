import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockQueryRowsQueue, setMockZenStackDbAvailable } from './setup';

describe('presence API', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-presence',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockQueryRowsQueue([]);
  });

  describe('getFallbackCount', () => {
    it('requires authentication', async () => {
      await expect(
        createTestORPCClient().presence.getFallbackCount({ query: {} }),
      ).rejects.toMatchObject({
        status: 403,
      });
    });

    it('returns fallback count for authenticated user', async () => {
      setMockQueryRowsQueue([[{ count: 42 }]]);

      const response = await createTestORPCClient(headers).presence.getFallbackCount({});

      expect(response).toEqual({ count: 42 });
    });

    it('respects windowMs parameter', async () => {
      setMockQueryRowsQueue([[{ count: 10 }]]);

      const response = await createTestORPCClient(headers).presence.getFallbackCount({
        windowMs: 60000,
      });

      expect(response).toEqual({ count: 10 });
    });

    it('filters by targetCapacities when provided', async () => {
      setMockQueryRowsQueue([[{ count: 5 }]]);

      const response = await createTestORPCClient(headers).presence.getFallbackCount({
        targetCapacities: 'teacher,admin',
      });

      expect(response).toEqual({ count: 5 });
    });

    it('excludes self when cumulative is true', async () => {
      setMockQueryRowsQueue([[{ count: 3 }]]);

      const response = await createTestORPCClient(headers).presence.getFallbackCount({
        cumulative: true,
      });

      expect(response).toEqual({ count: 3 });
    });
  });

  describe('markSeen', () => {
    it('requires authentication', async () => {
      await expect(createTestORPCClient().presence.markSeen({ body: {} })).rejects.toMatchObject({
        status: 403,
      });
    });

    it('updates last_seen_at and returns timestamp', async () => {
      setMockQueryRowsQueue([[{ last_seen_at: '2026-08-14T10:00:00.000Z' }]]);

      const response = await createTestORPCClient(headers).presence.markSeen({ body: {} });

      expect(response).toHaveProperty('seenAt');
      expect(new Date(response.seenAt).toISOString()).toBe('2026-08-14T10:00:00.000Z');
    });
  });
});
