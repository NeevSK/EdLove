import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: principal notes via native oRPC', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const schoolId = '923e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockUserData({
      id: userId,
      is_anonymous: false,
      full_name: 'Principal',
      capacity: 'teacher',
    });
    setMockActiveBond({
      id: 'b23e4567-e89b-12d3-a456-426614174000',
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: 'principal',
    });
  });

  it('reads only the authenticated principal note stream', async () => {
    expect(
      await createTestORPCClient(headers).principalNotes.getAll({ query: { schoolId } }),
    ).toEqual([]);
    expect(
      await createTestORPCClient(headers).principalNotes.getRecent({
        query: { schoolId, limit: 3 },
      }),
    ).toEqual([]);
  });

  it('creates, updates, and deletes notes through typed procedures', async () => {
    const client = createTestORPCClient(headers);
    const created = await client.principalNotes.create({
      body: {
        schoolId,
        content: 'Review staffing',
        noteType: 'todo',
      },
    });
    expect(created.author_id).toBe(userId);
    expect(created.note_type).toBe('todo');

    const updated = await client.principalNotes.update({
      params: { id: created.id },
      body: { isDone: true },
    });
    expect(updated.is_done).toBe(true);
    expect((await client.principalNotes.delete({ params: { id: created.id } })).success).toBe(true);
  });

  it('rejects malformed school identifiers before handler execution', async () => {
    await expect(
      createTestORPCClient(headers).principalNotes.getAll({ query: { schoolId: 'not-a-uuid' } }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('denies updates to a note authored by another principal', async () => {
    const outsiderId = '333e4567-e89b-8101-8000-426614174000';
    setMockActiveBond({
      id: 'bond-outsider',
      user_id: outsiderId,
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: 'principal',
    });
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${outsiderId}` }).principalNotes.update({
        params: { id: '823e4567-e89b-12d3-a456-426614174000' },
        body: { isDone: true },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
