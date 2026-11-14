import { describe, expect, it } from 'vitest';
import {
  type CapabilityTransactionPort,
  type OperationReceiptPort,
  expectedFailurePolicy,
} from '../capabilityFoundation';

describe('capability foundation expected failures', () => {
  it.each([
    ['validation', 400, 'BAD_REQUEST', false],
    ['authentication', 401, 'UNAUTHORIZED', false],
    ['authorization', 403, 'FORBIDDEN', false],
    ['not-found', 404, 'NOT_FOUND', false],
    ['conflict', 409, 'CONFLICT', false],
    ['in-progress', 503, 'SERVICE_UNAVAILABLE', true],
    ['rate-limited', 429, 'TOO_MANY_REQUESTS', true],
    ['dependency-unavailable', 503, 'SERVICE_UNAVAILABLE', true],
    ['timeout', 504, 'TIMEOUT', true],
  ] as const)('maps %s to one stable transport policy', (kind, httpStatus, orpcCode, retryable) => {
    expect(expectedFailurePolicy(kind)).toEqual({ kind, httpStatus, orpcCode, retryable });
  });

  it('keeps receipt settlement inside the capability transaction boundary', async () => {
    const receipts: OperationReceiptPort<readonly string[]> = {
      claim: async () => ({
        kind: 'claimed',
        receipt: { operationId: 'operation', status: 'pending', payloadHash: 'hash', result: null },
      }),
      complete: async ({ result }) => ({
        operationId: 'operation',
        status: 'completed',
        payloadHash: 'hash',
        result,
      }),
      fail: async () => undefined,
    };
    const transaction: CapabilityTransactionPort<{ receipts: typeof receipts }> = {
      run: async (work) => work({ receipts }),
    };

    await expect(
      transaction.run(async ({ receipts: scopedReceipts }) =>
        scopedReceipts.complete({ operationId: 'operation', payloadHash: 'hash', result: ['record'] }),
      ),
    ).resolves.toMatchObject({ status: 'completed', result: ['record'] });
  });
});
