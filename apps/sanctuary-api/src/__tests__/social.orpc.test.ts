import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: Social', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const targetUserId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-social',
      user_id: userId,
      entity_id: '323e4567-e89b-12d3-a456-426614174000',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('rejects anonymous notification access', async () => {
    await expect(
      createTestORPCClient().social.getNotifications({ query: { limit: 30 } }),
    ).rejects.toBeTruthy();
  });

  it('rejects legacy flattened block requests', async () => {
    await expect(
      createTestORPCClient(headers).social.blockUser({ targetUserId } as never),
    ).rejects.toBeTruthy();
  });
});
