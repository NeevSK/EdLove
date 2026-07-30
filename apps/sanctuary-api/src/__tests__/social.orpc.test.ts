import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: notifications and safety via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const targetUserId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-social', user_id: userId, entity_id: 'school-123', entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' });
  });

  it('reads and acknowledges notifications through the native contract', async () => {
    const client = createTestORPCClient(headers).social;
    expect(await client.getNotifications({ limit: 30 })).toEqual([]);
    expect(await client.getUnreadNotificationCount({})).toBe(0);
    expect(await client.markNotificationRead({ notificationId: '323e4567-e89b-12d3-a456-426614174000' })).toEqual({ success: true });
    expect(await client.markAllNotificationsRead({})).toEqual({ success: true });
  });

  it('reads community resonance through the native community procedure', async () => {
    const body = await createTestORPCClient(headers).community.getCommunityResonance({ userId });
    expect(body).toEqual({ likes: 0, comments: 0, shares: 0 });
  });

  it('manages blocking with server-derived ownership and rejects malformed targets', async () => {
    const client = createTestORPCClient(headers).social;
    expect(await client.blockUser({ targetUserId })).toEqual({ success: true });
    expect(await client.isBlockingActive({ targetUserId })).toBe(false);
    expect(await client.getBlockedUsers({})).toEqual([]);
    expect(await client.unblockUser({ targetUserId })).toEqual({ success: true });
    await expect((client.blockUser as any)({ targetUserId: 'not-a-uuid' })).rejects.toBeTruthy();
  });
});
