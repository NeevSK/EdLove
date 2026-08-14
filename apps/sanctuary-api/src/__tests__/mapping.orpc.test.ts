import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('mapping API', () => {
  it('rejects malformed topology identifiers at the transport boundary', async () => {
    await expect(createTestORPCClient().mapping.getById({ id: 'bad-id' })).rejects.toMatchObject({
      status: 400,
    });
  });
});
