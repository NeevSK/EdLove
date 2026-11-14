import { toMutationReceipt } from '@repo/core/lib/sync/receipts';
import { describe, expect, it } from 'vitest';

describe('toMutationReceipt', () => {
  it('preserves operation identity while mapping a completed server receipt', () => {
    expect(
      toMutationReceipt('op-1', {
        mutationId: 'server-1',
        operationId: 'op-1',
        receiptId: 'receipt-1',
        status: 'completed',
        serverRevision: '2026-10-10T15:10:00.000Z',
      }),
    ).toEqual({
      operationId: 'op-1',
      status: 'completed',
      receiptId: 'receipt-1',
      serverRevision: '2026-10-10T15:10:00.000Z',
    });
  });

  it('retains an authoritative failure without inventing a conflict', () => {
    expect(
      toMutationReceipt('op-2', {
        mutationId: 'server-2',
        status: 'failed',
        error: 'validation rejected',
      }),
    ).toEqual({
      operationId: 'op-2',
      status: 'failed',
      receiptId: 'server-2',
      error: 'validation rejected',
    });
  });

  it('does not overwrite a server operation identity with the local fallback', () => {
    expect(
      toMutationReceipt('local-op', {
        mutationId: 'server-3',
        operationId: 'server-op-3',
        status: 'completed',
      }).operationId,
    ).toBe('server-op-3');
  });
});
