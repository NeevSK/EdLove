import { describe, expect, it, vi } from 'vitest';
import { createOperationReceiptPort } from '../operationReceiptStore';

const accountId = '123e4567-e89b-12d3-a456-426614174000';
const key = '123e4567-e89b-12d3-a456-426614174001';

function transactionFixture(row: {
  operation_id: string;
  payload_hash: string;
  status: string;
  result: unknown;
  error_code: string | null;
}) {
  return {
    $queryRaw: vi.fn(async (parts: TemplateStringsArray) => {
      const sql = parts.join('?');
      if (sql.includes('INSERT INTO public.operation_receipts')) return [{ operation_id: row.operation_id }];
      return [row];
    }),
    $executeRaw: vi.fn(async (..._args: unknown[]) => 1),
  };
}

describe('operation receipt store', () => {
  it('refuses a cross-principal receipt claim before querying the transaction', async () => {
    const tx = transactionFixture({
      operation_id: key,
      payload_hash: 'payload',
      status: 'pending',
      result: null,
      error_code: null,
    });
    const receipts = createOperationReceiptPort<{ id: string }>(tx, accountId);

    await expect(
      receipts.claim({
        capability: 'test.capability',
        principalId: '123e4567-e89b-12d3-a456-426614174099',
        idempotencyKey: key,
        payloadHash: 'payload',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it('turns a mismatched durable payload into a payload-conflict claim', async () => {
    const tx = transactionFixture({
      operation_id: key,
      payload_hash: 'first-payload',
      status: 'committed',
      result: { id: key },
      error_code: null,
    });
    const receipts = createOperationReceiptPort<{ id: string }>(tx, accountId);

    await expect(
      receipts.claim({
        capability: 'test.capability',
        principalId: accountId,
        idempotencyKey: key,
        payloadHash: 'second-payload',
      }),
    ).resolves.toMatchObject({ kind: 'payload-conflict' });
  });

  it('settles only the pending receipt owned by the capability principal', async () => {
    const tx = transactionFixture({
      operation_id: key,
      payload_hash: 'payload',
      status: 'pending',
      result: null,
      error_code: null,
    });
    const receipts = createOperationReceiptPort<{ id: string }>(tx, accountId);

    await expect(
      receipts.complete({ operationId: key, payloadHash: 'payload', result: { id: key } }),
    ).resolves.toEqual({
      operationId: key,
      payloadHash: 'payload',
      status: 'completed',
      result: { id: key },
    });
    const settlementParts = tx.$executeRaw.mock.calls[0]?.[0];
    expect(Array.isArray(settlementParts) ? settlementParts.join('?') : '').toContain(
      "UPDATE public.operation_receipts SET status = 'committed'",
    );
    expect(tx.$executeRaw.mock.calls[0]?.slice(1)).toEqual([
      JSON.stringify({ id: key }),
      key,
      accountId,
      'payload',
    ]);
  });

  it.each([
    ['failed', 'DEPENDENCY_UNAVAILABLE', 'failed'],
    ['conflict', 'IDEMPOTENCY_CONFLICT', 'conflict'],
  ] as const)('preserves a settled %s receipt as %s', async (status, errorCode, kind) => {
    const tx = transactionFixture({
      operation_id: key,
      payload_hash: 'payload',
      status,
      result: null,
      error_code: errorCode,
    });
    tx.$queryRaw.mockImplementationOnce(async () => []);
    const receipts = createOperationReceiptPort<{ id: string }>(tx, accountId);

    await expect(
      receipts.claim({
        capability: 'test.capability',
        principalId: accountId,
        idempotencyKey: key,
        payloadHash: 'payload',
      }),
    ).resolves.toMatchObject({ kind, receipt: { status, failureCode: errorCode } });
  });
});
