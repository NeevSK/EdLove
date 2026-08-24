import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('Sanctuary API: authorization snapshot via native oRPC', () => {
  it('rejects anonymous snapshot refresh with a typed authorization error', async () => {
    await expect(createTestORPCClient().authorization.refresh()).rejects.toMatchObject({
      status: 403,
    });
  });
});
