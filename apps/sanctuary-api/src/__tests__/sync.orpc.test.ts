import './setup';
import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLastExecuteRawArgs,
  getMockLastQueryRawArgs,
  setMockActiveBond,
  setMockDailyContentRows,
  setMockRawQueryRowsQueue,
  setMockUserData,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: PowerSync upload via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockDailyContentRows([]);
    setMockRawQueryRowsQueue([]);
    setMockZenStackDbAvailable(true);
    setMockUserData(null);
    setMockUserPreferences({ active_bond_id: '123e4567-e89b-12d3-a456-426614174001' });
    setMockActiveBond({
      id: '123e4567-e89b-12d3-a456-426614174001',
      user_id: userId,
      entity_id: '123e4567-e89b-12d3-a456-426614174002',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
      valid_from: new Date('2020-01-01T00:00:00.000Z'),
      valid_until: null,
      metadata: null,
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

  it('keeps a missing workflow receipt pending for the authenticated command owner', async () => {
    setMockDailyContentRows([]);

    await expect(
      createTestORPCClient(headers).sync.getMutationReceipt({
        params: { mutationId: 'mutation-awaiting-worker' },
      }),
    ).resolves.toEqual({ mutationId: 'mutation-awaiting-worker', status: 'pending' });

    const queryArgs = getMockLastQueryRawArgs();
    expect(queryArgs).not.toBeNull();
    expect(queryArgs?.[1]).toBe('mutation-awaiting-worker');
    expect(queryArgs?.[2]).toBe(userId);
    expect(String(queryArgs?.[0])).toContain("payload->>'actorId'");
  });

  it('returns terminal worker outcomes without exposing another command payload', async () => {
    setMockDailyContentRows([{ status: 'completed', error: null }]);
    await expect(
      createTestORPCClient(headers).sync.getMutationReceipt({
        params: { mutationId: 'mutation-complete' },
      }),
    ).resolves.toEqual({ mutationId: 'mutation-complete', status: 'completed', error: null });

    setMockDailyContentRows([{ status: 'failed', error: 'validation rejected' }]);
    await expect(
      createTestORPCClient(headers).sync.getMutationReceipt({
        params: { mutationId: 'mutation-failed' },
      }),
    ).resolves.toEqual({
      mutationId: 'mutation-failed',
      status: 'failed',
      error: 'validation rejected',
    });
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
    const idempotencyKey = 'sync-canonical-success';
    const crud = [
      {
        id: '123e4567-e89b-12d3-a456-426614174099',
        op: 'PUT',
        table: 'classroom',
        opData: { name: 'Canonical Sync Classroom' },
      },
    ];
    const payloadHash = createHash('sha256').update(JSON.stringify(crud)).digest('hex');
    setMockRawQueryRowsQueue([
      [{ payload_hash: payloadHash, status: 'processing', processed_count: 0 }],
    ]);

    const response = await createTestORPCClient(headers).sync.uploadBatch({
      body: {
        idempotencyKey,
        crud,
      },
    });

    expect(response).toMatchObject({ success: true, processedCount: 1 });

    const queryArgs = getMockLastQueryRawArgs();
    expect(queryArgs?.[0]).toEqual(
      expect.arrayContaining([
        expect.stringContaining('SELECT payload_hash, status, processed_count'),
      ]),
    );
    expect(queryArgs).toContain(userId);
    expect(queryArgs).toContain(idempotencyKey);

    const updateArgs = getMockLastExecuteRawArgs();
    expect(updateArgs?.[0]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("SET status = 'completed', processed_count ="),
      ]),
    );
    expect(updateArgs).toContain(1);
    expect(updateArgs).toContain(userId);
    expect(updateArgs).toContain(idempotencyKey);
  });

  it('rejects an idempotency key reused for a different payload', async () => {
    const idempotencyKey = 'sync-mismatched-payload';
    const crud = [{ id: 'mutation-mismatch', op: 'PUT', table: 'classroom', opData: {} }];
    const serializedPayload = JSON.stringify(crud);
    setMockRawQueryRowsQueue([
      [{ payload_hash: 'different-payload-hash', status: 'processing', processed_count: 0 }],
    ]);

    const rejection = await createTestORPCClient(headers)
      .sync.uploadBatch({ body: { idempotencyKey, crud } })
      .then(
        () => null,
        (error: unknown) => error,
      );

    expect(rejection).toMatchObject({
      status: 409,
      message: 'Idempotency key was reused with a different batch payload',
      data: { code: 'IDEMPOTENCY_CONFLICT' },
    });
    expect(rejection).not.toHaveProperty('cause');
    const publicError = JSON.stringify(rejection);
    expect(publicError).not.toContain(idempotencyKey);
    expect(publicError).not.toContain(serializedPayload);
    expect(publicError).not.toContain('different-payload-hash');
  });

  it('returns the stored count for a completed idempotency replay', async () => {
    const crud = [{ id: 'mutation-replay', op: 'PUT', table: 'classroom', opData: {} }];
    const payloadHash = createHash('sha256').update(JSON.stringify(crud)).digest('hex');
    setMockRawQueryRowsQueue([
      [{ payload_hash: payloadHash, status: 'completed', processed_count: 7 }],
    ]);

    await expect(
      createTestORPCClient(headers).sync.uploadBatch({
        body: { idempotencyKey: 'sync-completed-replay', crud },
      }),
    ).resolves.toMatchObject({ success: true, processedCount: 7, idempotent: true });
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
