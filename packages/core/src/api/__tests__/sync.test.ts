import { describe, expect, expectTypeOf, it, test } from 'vitest';
import { applyPowerSyncBatch } from '../handlers/sync';

const makeDb = (writes: any[]) => ({
  $transaction: async (fn: (tx: any) => Promise<void>) =>
    fn({
      bond: {
        upsert: async (input: any) => writes.push(input),
      },
      classroom: {
        upsert: async (input: any) => writes.push(input),
      },
    }),
});

describe('PowerSync upload idempotency', { tags: ['storage', 'fast'] }, () => {
  it('enforces static handler output types with expectTypeOf (T16)', () => {
    type HandlerReturn = ReturnType<typeof applyPowerSyncBatch>;
    expectTypeOf<HandlerReturn>().toEqualTypeOf<
      Promise<{ success: true; processedCount: number; idempotent?: boolean }>
    >();
  });

  test.for([
    { table: 'bonds', expectedWrites: 1 },
    { table: 'classroom', expectedWrites: 1 },
  ])('parametric sync batch for table $table (T17 test.for)', async ({ table, expectedWrites }) => {
    const writes: any[] = [];
    const db = makeDb(writes);
    const crud = [{ id: 'row-1', op: 'PUT', table, opData: { name: 'Test' } }];

    const res = await applyPowerSyncBatch(db, crud, `key-${table}`, `user-${table}`);
    expect(res.success).toBe(true);
    expect(res.processedCount).toBe(expectedWrites);
    expect(writes).toHaveLength(expectedWrites);
  });
  it('replays a completed batch without applying the writes again', async () => {
    const writes: any[] = [];
    const db = makeDb(writes);
    const crud = [{ id: 'row-1', op: 'PUT', table: 'bonds', opData: { capacity: 'teacher' } }];

    await expect(applyPowerSyncBatch(db, crud, 'key-replay', 'user-a')).resolves.toEqual({
      success: true,
      processedCount: 1,
    });
    await expect(applyPowerSyncBatch(db, crud, 'key-replay', 'user-a')).resolves.toEqual({
      success: true,
      processedCount: 1,
      idempotent: true,
    });

    expect(writes).toHaveLength(1);
  });

  it('does not allow an account-scoped key to be reused for another payload', async () => {
    const db = makeDb([]);
    const first = [{ id: 'row-1', op: 'PUT', table: 'bonds', opData: { capacity: 'teacher' } }];
    const second = [{ id: 'row-2', op: 'PUT', table: 'bonds', opData: { capacity: 'principal' } }];

    await applyPowerSyncBatch(db, first, 'key-conflict', 'user-b');
    await expect(applyPowerSyncBatch(db, second, 'key-conflict', 'user-b')).rejects.toThrow(
      'Idempotency key was reused with a different batch payload',
    );
    await expect(applyPowerSyncBatch(db, second, 'key-conflict', 'user-b')).rejects.toMatchObject({
      details: {
        status: 409,
        code: 'IDEMPOTENCY_CONFLICT',
        detail: 'Idempotency key was reused with a different batch payload',
      },
    });
  });

  it('keeps the same key independent across accounts', async () => {
    const writes: any[] = [];
    const db = makeDb(writes);
    const crud = [{ id: 'row-1', op: 'PUT', table: 'bonds', opData: { capacity: 'teacher' } }];

    await applyPowerSyncBatch(db, crud, 'same-key', 'user-c');
    await applyPowerSyncBatch(db, crud, 'same-key', 'user-d');

    expect(writes).toHaveLength(2);
  });

  it('settles concurrent retries through the durable principal-scoped ledger only once', async () => {
    const writes: unknown[] = [];
    let ledger:
      | { payloadHash: string; status: 'processing' | 'completed'; processedCount: number }
      | undefined;
    let transactionTail = Promise.resolve();

    const tx = {
      bond: { upsert: async (input: unknown) => writes.push(input) },
      $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
        const sql = strings.join('?');
        if (sql.includes('INSERT INTO powersync_idempotency_keys') && !ledger) {
          ledger = {
            payloadHash: String(values[2]),
            status: 'processing',
            processedCount: 0,
          };
        }
        if (sql.includes('UPDATE powersync_idempotency_keys') && ledger) {
          ledger.status = 'completed';
          ledger.processedCount = Number(values[0]);
        }
      },
      $queryRaw: async () =>
        ledger
          ? [
              {
                payload_hash: ledger.payloadHash,
                status: ledger.status,
                processed_count: ledger.processedCount,
              },
            ]
          : [],
    };
    const db = {
      $transaction: async (operation: (transaction: typeof tx) => Promise<void>) => {
        const previous = transactionTail;
        let releaseTransaction: (() => void) | undefined;
        transactionTail = new Promise<void>((resolve) => {
          releaseTransaction = resolve;
        });
        await previous;
        try {
          await operation(tx);
        } finally {
          releaseTransaction?.();
        }
      },
    };
    const crud = [{ id: 'row-1', op: 'PUT', table: 'bonds', opData: { capacity: 'teacher' } }];

    const outcomes = await Promise.all([
      applyPowerSyncBatch(db, crud, 'durable-concurrent-key', 'user-durable'),
      applyPowerSyncBatch(db, crud, 'durable-concurrent-key', 'user-durable'),
    ]);

    expect(outcomes).toEqual([
      { success: true, processedCount: 1 },
      { success: true, processedCount: 1, idempotent: true },
    ]);
    expect(writes).toHaveLength(1);
  });
});
