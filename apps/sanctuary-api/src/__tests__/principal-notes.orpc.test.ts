import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: principal notes via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const schoolId = '923e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockUserData({ id: userId, is_anonymous: false, full_name: 'Principal', capacity: 'principal' });
    setMockActiveBond({ id: 'b23e4567-e89b-12d3-a456-426614174000', entity_id: schoolId, entity_type: 'SCHOOL', capacity: 'principal' });
  });

  it('reads only the authenticated principal note stream', async () => {
    expect(await createTestORPCClient(headers).principalNotes.getAll({ schoolId })).toEqual([]);
    expect(await createTestORPCClient(headers).principalNotes.getRecent({ schoolId, limit: 3 })).toEqual([]);
  });

  it('creates, updates, and deletes notes through typed procedures', async () => {
    const client = createTestORPCClient(headers);
    const created = await client.principalNotes.create({ schoolId, content: 'Review staffing', noteType: 'todo' });
    expect(created.author_id).toBe(userId);
    expect(created.note_type).toBe('todo');

    const updated = await client.principalNotes.update({ id: created.id, isDone: true });
    expect(updated.is_done).toBe(true);
    expect((await client.principalNotes.delete({ id: created.id })).success).toBe(true);
  });

  it('rejects malformed school identifiers before handler execution', async () => {
    await expect(createTestORPCClient(headers).principalNotes.getAll({ schoolId: 'not-a-uuid' })).rejects.toMatchObject({ status: 400 });
  });
});
