import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockQueryRowsQueue, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: self journal entries', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-self',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('lists actor-owned entries and applies a UTC day view', async () => {
    setMockQueryRowsQueue([
      [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          user_id: userId,
          content: 'A reflection',
          created_at: '2026-08-14T09:00:00.000Z',
        },
      ],
    ]);

    const response = await createTestORPCClient(headers).journalEntries.list({
      query: { limit: 50, view_date: '2026-08-14T12:00:00.000Z' },
    });
    expect(response).toEqual([
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        content: 'A reflection',
        created_at: '2026-08-14T09:00:00.000Z',
      },
    ]);
  });

  it('creates an authenticated entry without accepting a client user id', async () => {
    setMockQueryRowsQueue([
      [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          user_id: userId,
          content: 'A new reflection',
          created_at: '2026-08-14T10:00:00.000Z',
        },
      ],
    ]);

    const response = await createTestORPCClient(headers).journalEntries.create({
      body: { content: 'A new reflection' },
    });
    expect(response).toMatchObject({ user_id: userId, content: 'A new reflection' });
  });

  it('requires authentication', async () => {
    await expect(
      createTestORPCClient().journalEntries.list({ query: { limit: 50 } }),
    ).rejects.toBeTruthy();
  });

  it('rejects the former flattened request shape', async () => {
    await expect(
      (createTestORPCClient(headers).journalEntries.list as any)({ limit: 50 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
