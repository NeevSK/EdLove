import type { MutationReceipt } from '@repo/core/lib/sync/types';

/** The current server response; intentionally narrower than the future receipt contract. */
export type MutationReceiptResponse = Readonly<{
  mutationId: string;
  operationId?: string;
  receiptId?: string;
  status: 'pending' | 'completed' | 'failed' | 'conflict';
  error?: string | null;
  serverRevision?: string;
  conflictReason?: string;
}>;

/** Maps the existing receipt endpoint into the shared client settlement contract. */
export function toMutationReceipt(
  operationId: string,
  response: MutationReceiptResponse,
): MutationReceipt {
  return {
    operationId: response.operationId ?? operationId,
    status: response.status,
    receiptId: response.receiptId ?? response.mutationId,
    ...(response.serverRevision ? { serverRevision: response.serverRevision } : {}),
    ...(response.status === 'failed' && response.error ? { error: response.error } : {}),
    ...(response.status === 'conflict'
      ? {
          error: response.error ?? 'Mutation conflict',
          conflictReason: response.conflictReason,
        }
      : {}),
  };
}
