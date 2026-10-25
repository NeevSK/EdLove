import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { settleWorkspaceProvisioning } from '../core/handlers/workspaceProvisioning';

const accountId = '123e4567-e89b-8101-8000-426614174000';
const key = '123e4567-e89b-12d3-a456-426614174001';
const capability = 'workspace.provision-commercial-batch';
const intent = { accountId, subjectName: 'Physics' };

function fixture() {
  const receipt = {
    operation_id: '123e4567-e89b-8101-8000-426614174002',
    payload_hash: '',
    status: 'pending',
    result: null as unknown,
  };
  const state = { claimed: true, updates: 1, commits: 0 };
  const tx = {
    $executeRaw: vi.fn(async (parts: TemplateStringsArray) =>
      parts.join('?').includes('UPDATE public.operation_receipts') ? state.updates : 0,
    ),
    $queryRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      if (parts.join('?').includes('INSERT INTO public.operation_receipts')) {
        if (state.claimed) receipt.payload_hash = String(values[4]);
        return state.claimed ? [{ operation_id: receipt.operation_id }] : [];
      }
      return [receipt];
    }),
  };
  const context = {
    user: { id: accountId },
    db: { $transaction: async (work: (client: typeof tx) => unknown) => work(tx) },
  } as any;
  const execute = () =>
    settleWorkspaceProvisioning({
      context,
      capability,
      idempotencyKey: key,
      intent,
      commit: async () => {
        state.commits += 1;
        return { batchId: '123e4567-e89b-12d3-a456-426614174003' };
      },
    });
  return { receipt, state, tx, execute };
}

describe('workspace provisioning receipt settlement (G1 transaction substitution)', () => {
  let f: ReturnType<typeof fixture>;
  beforeEach(async () => {
    f = fixture();
    f.receipt.payload_hash = await getConsistentIdempotencyKey(intent, capability);
  });

  it('commits the domain result and receipt in the same transaction', async () => {
    await expect(f.execute()).resolves.toMatchObject({
      outcome: 'committed',
      result: { batchId: expect.any(String) },
    });
    expect(f.state.commits).toBe(1);
    const settlement = f.tx.$executeRaw.mock.calls.find(([parts]: [TemplateStringsArray]) =>
      parts.join('?').includes("UPDATE public.operation_receipts SET status = 'committed'"),
    );
    expect(settlement).toEqual([
      expect.any(Array),
      expect.any(String),
      f.receipt.operation_id,
      accountId,
      f.receipt.payload_hash,
    ]);
  });

  it('replays a committed receipt without a second domain write', async () => {
    f.state.claimed = false;
    f.receipt.status = 'committed';
    f.receipt.result = { batchId: '123e4567-e89b-12d3-a456-426614174003' };
    await expect(f.execute()).resolves.toMatchObject({
      outcome: 'replayed',
      result: f.receipt.result,
    });
    expect(f.state.commits).toBe(0);
  });

  it('rejects same-key changed intent before domain mutation', async () => {
    f.state.claimed = false;
    f.receipt.payload_hash = 'different';
    await expect(f.execute()).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(f.state.commits).toBe(0);
  });
});
