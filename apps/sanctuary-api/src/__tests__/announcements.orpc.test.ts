import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: announcements via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const schoolId = '923e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-announcement', user_id: userId, entity_id: schoolId, entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' });
  });

  it('reads and creates school-scoped announcements with server-derived authorship', async () => {
    const client = createTestORPCClient(headers).announcements;
    expect(await client.getAnnouncements({ schoolId })).toEqual([]);
    expect(await client.createAnnouncement({ schoolId, title: 'Welcome', content: 'Welcome to the new term', isPinned: true })).toMatchObject({
      school_id: schoolId,
      author_id: userId,
      title: 'Welcome',
      content: 'Welcome to the new term',
      is_pinned: true,
    });
  });

  it('rejects invalid school identifiers at the contract boundary', async () => {
    await expect((createTestORPCClient(headers).announcements.getAnnouncements as any)({ schoolId: 'not-a-uuid' })).rejects.toBeTruthy();
  });
});
