import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('warm mirror API', () => {
  it('rejects malformed user identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().warmMirror.getDataPoints({ userId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects anonymous warm mirror reads', async () => {
    await expect(
      createTestORPCClient().warmMirror.getDataPoints({
        userId: '123e4567-e89b-12d3-a456-426614174000',
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
