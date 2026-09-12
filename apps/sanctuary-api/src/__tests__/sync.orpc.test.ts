import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: PowerSync upload via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockUserData(null);
    setMockActiveBond({
      id: 'bond-sync',
      user_id: userId,
      entity_id: '123e4567-e89b-12d3-a456-426614174002',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('rejects an unauthenticated batch before reaching the handler', async () => {
    await expect(
      createTestORPCClient().sync.uploadBatch({
        body: {
          idempotencyKey: 'sync-anonymous',
          crud: [{ id: 'mutation-1', op: 'PATCH', table: 'classroom', opData: {} }],
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('validates the canonical body envelope before executing a batch', async () => {
    const client = createTestORPCClient(headers).sync;

    await expect(
      (client.uploadBatch as any)({
        idempotencyKey: 'sync-flattened',
        crud: [],
      }),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      client.uploadBatch({
        body: {
          idempotencyKey: 'sync-missing-key',
          crud: [{ id: 'mutation-1', op: 'INVALID', table: 'classroom', opData: {} }],
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('executes an authenticated batch with a server-scoped idempotency key', async () => {
    const response = await createTestORPCClient(headers).sync.uploadBatch({
      body: {
        idempotencyKey: 'sync-canonical-success',
        crud: [
          {
            id: '123e4567-e89b-12d3-a456-426614174099',
            op: 'PUT',
            table: 'classroom',
            opData: { name: 'Canonical Sync Classroom' },
          },
        ],
      },
    });

    expect(response).toMatchObject({ success: true, processedCount: 1 });
  });

  it('rejects third-class synchronization at the server boundary', async () => {
    setMockUserData({
      id: userId,
      citizenship: 'THIRD_CLASS',
      is_anonymous: false,
    });

    await expect(
      createTestORPCClient(headers).sync.uploadBatch({
        body: {
          idempotencyKey: 'sync-third-class',
          crud: [
            {
              id: '123e4567-e89b-12d3-a456-426614174098',
              op: 'PUT',
              table: 'self_journey',
              opData: { title: 'must remain local' },
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
