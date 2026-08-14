import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('inventory API', () => {
  it('rejects malformed classroom identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().inventory.getAll({ classroomId: 'bad-id' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
