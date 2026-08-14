import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('presence API', () => {
  it('requires authentication for fallback counts', async () => {
    await expect(createTestORPCClient().presence.getFallbackCount()).rejects.toMatchObject({
      status: 403,
    });
  });

  it('requires authentication for presence heartbeats', async () => {
    await expect(createTestORPCClient().presence.markSeen({})).rejects.toMatchObject({
      status: 403,
    });
  });
});
