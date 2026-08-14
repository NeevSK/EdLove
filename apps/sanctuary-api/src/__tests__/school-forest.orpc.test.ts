import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('school forest gratitude gifts API', () => {
  it('rejects malformed forest overview identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().schoolForest.getForestOverview({ schoolId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects malformed school pulse identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().schoolForest.getSchoolPulse({ schoolId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects malformed recipient identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().schoolForest.sendGratitudeGift({
        recipientUserId: 'bad-id',
        giftType: 'lantern',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects malformed delivery identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().schoolForest.markGiftDelivered({ giftId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
