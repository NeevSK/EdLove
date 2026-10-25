import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('warm mirror API', () => {
  it('rejects malformed user identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().warmMirror.getDataPoints({ params: { userId: 'bad-id' } }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects anonymous warm mirror reads', async () => {
    await expect(
      createTestORPCClient().warmMirror.getDataPoints({
        params: { userId: '123e4567-e89b-8101-8000-426614174000' },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
