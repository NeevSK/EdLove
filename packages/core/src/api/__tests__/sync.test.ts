import { describe, expect, it } from 'vitest';
import { applyPowerSyncBatch } from '../handlers/sync';

const makeDb = (writes: any[]) => ({
  $transaction: async (fn: (tx: any) => Promise<void>) =>
    fn({
      bond: {
        upsert: async (input: any) => writes.push(input),
      },
    }),
});

describe('PowerSync upload idempotency', () => {
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
  });

  it('keeps the same key independent across accounts', async () => {
    const writes: any[] = [];
    const db = makeDb(writes);
    const crud = [{ id: 'row-1', op: 'PUT', table: 'bonds', opData: { capacity: 'teacher' } }];

    await applyPowerSyncBatch(db, crud, 'same-key', 'user-c');
    await applyPowerSyncBatch(db, crud, 'same-key', 'user-d');

    expect(writes).toHaveLength(2);
  });
});
