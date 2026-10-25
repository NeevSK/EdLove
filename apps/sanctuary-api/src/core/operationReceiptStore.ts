import { ORPCError } from '@orpc/server';
import type {
  OperationReceipt,
  OperationReceiptPort,
} from '@repo/core/api/capabilityFoundation';

type OperationReceiptRow = {
  operation_id: string;
  payload_hash: string;
  status: string;
  result: unknown;
  error_code: string | null;
};

function receiptFromRow<TResult>(row: OperationReceiptRow): OperationReceipt<TResult> {
  return {
    operationId: row.operation_id,
    payloadHash: row.payload_hash,
    status:
      row.status === 'committed'
        ? 'completed'
        : row.status === 'failed'
          ? 'failed'
          : row.status === 'conflict'
            ? 'conflict'
            : 'pending',
    result: row.status === 'committed' ? (row.result as TResult) : null,
    failureCode: row.error_code,
  };
}

/**
 * Persistence adapter for the server-owned, payload-bound operation receipt
 * table. Callers provide it only from the same transaction as their durable
 * command and audit write; effects are intentionally outside this adapter.
 */
export function createOperationReceiptPort<TResult>(
  tx: any,
  accountId: string,
): OperationReceiptPort<TResult> {
  return {
    claim: async ({ capability, principalId, idempotencyKey, payloadHash }) => {
      if (principalId !== accountId) {
        throw new ORPCError('FORBIDDEN', { message: 'Operation principal does not match the receipt owner.' });
      }
      const claimed = await tx.$queryRaw<Array<{ operation_id: string }>>`
        INSERT INTO public.operation_receipts (operation_id, account_id, capability, idempotency_key, payload_hash, status)
        VALUES (${crypto.randomUUID()}::uuid, ${accountId}::uuid, ${capability}, ${idempotencyKey}::uuid, ${payloadHash}, 'pending')
        ON CONFLICT (account_id, capability, idempotency_key) DO NOTHING
        RETURNING operation_id
      `;
      const rows = await tx.$queryRaw<OperationReceiptRow[]>`
        SELECT operation_id, payload_hash, status, result, error_code FROM public.operation_receipts
        WHERE account_id = ${accountId}::uuid AND capability = ${capability}
          AND idempotency_key = ${idempotencyKey}::uuid
        FOR UPDATE
      `;
      const row = rows[0];
      if (!row) {
        throw new ORPCError('SERVICE_UNAVAILABLE', {
          message: 'Operation outcome is not yet available. Retry with the same key.',
        });
      }
      const receipt = receiptFromRow<TResult>(row);
      if (receipt.payloadHash !== payloadHash) return { kind: 'payload-conflict', receipt };
      if (claimed.length === 0 && receipt.status === 'completed') return { kind: 'replay', receipt };
      if (claimed.length === 0 && receipt.status === 'failed') return { kind: 'failed', receipt };
      if (claimed.length === 0 && receipt.status === 'conflict') return { kind: 'conflict', receipt };
      if (claimed.length === 0) return { kind: 'in-progress', receipt };
      return { kind: 'claimed', receipt };
    },
    complete: async ({ operationId, payloadHash, result }) => {
      const updated = await tx.$executeRaw`
        UPDATE public.operation_receipts SET status = 'committed', result = ${JSON.stringify(result)}::jsonb
        WHERE operation_id = ${operationId}::uuid AND account_id = ${accountId}::uuid
          AND payload_hash = ${payloadHash} AND status = 'pending'
      `;
      if (updated !== 1) throw new Error('Operation receipt could not be committed.');
      return { operationId, status: 'completed', payloadHash, result };
    },
    fail: async ({ operationId, payloadHash, failureCode }) => {
      await tx.$executeRaw`
        UPDATE public.operation_receipts SET status = 'failed', error_code = ${failureCode}
        WHERE operation_id = ${operationId}::uuid AND account_id = ${accountId}::uuid
          AND payload_hash = ${payloadHash} AND status = 'pending'
      `;
    },
  };
}
