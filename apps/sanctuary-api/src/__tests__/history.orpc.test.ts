import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('history API', () => {
  it('rejects malformed collection identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().history.getCollectionMembershipTimeline({ collectionId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
