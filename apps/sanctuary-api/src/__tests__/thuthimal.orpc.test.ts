import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: Thuthimal', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-thuthimal',
      user_id: userId,
      entity_id: '223e4567-e89b-12d3-a456-426614174000',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('rejects unauthenticated gift creation', async () => {
    await expect(
      createTestORPCClient().thuthimal.createGift({
        body: { gifterName: 'A', recipientTier: 'teacher' },
      }),
    ).rejects.toBeTruthy();
  });

  it('rejects legacy flattened gift envelopes', async () => {
    await expect(
      createTestORPCClient(headers).thuthimal.claimGift({ giftToken: 'token' } as never),
    ).rejects.toBeTruthy();
  });
});
