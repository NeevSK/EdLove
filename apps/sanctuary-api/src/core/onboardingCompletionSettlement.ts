import { ORPCError } from '@orpc/server';
import type { ORPCContext } from './orpc';

export const ONBOARDING_COMPLETION_CAPABILITY = 'onboarding.complete';
const ONBOARDING_COMPLETION_INTENT = 'onboarding-completion-v1';

type CompletionReceiptRow = {
  operation_id: string;
  payload_hash: string;
  status: string;
};

export async function settleOnboardingCompletion(
  context: ORPCContext,
  idempotencyKey: string,
  commit: (tx: any) => Promise<void>,
): Promise<{ receiptId: string; replayed: boolean }> {
  const accountId = context.user.id;

  return context.db.$transaction(async (tx: any) => {
    const claimed = await tx.$queryRaw<Array<{ operation_id: string }>>`
      INSERT INTO public.operation_receipts (operation_id, account_id, capability, idempotency_key, payload_hash, status)
      VALUES (${crypto.randomUUID()}::uuid, ${accountId}::uuid, ${ONBOARDING_COMPLETION_CAPABILITY}, ${idempotencyKey}::uuid, ${ONBOARDING_COMPLETION_INTENT}, 'pending')
      ON CONFLICT (account_id, capability, idempotency_key) DO NOTHING
      RETURNING operation_id
    `;
    const receipts = await tx.$queryRaw<CompletionReceiptRow[]>`
      SELECT operation_id, payload_hash, status FROM public.operation_receipts
      WHERE account_id = ${accountId}::uuid AND capability = ${ONBOARDING_COMPLETION_CAPABILITY}
        AND idempotency_key = ${idempotencyKey}::uuid
      FOR UPDATE
    `;
    const receipt = receipts[0];
    if (!receipt) {
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Onboarding completion outcome is not yet available. Retry with the same key.',
      });
    }
    if (receipt.payload_hash !== ONBOARDING_COMPLETION_INTENT) {
      throw new ORPCError('CONFLICT', {
        message: 'Idempotency key was used for a different onboarding completion intent.',
      });
    }
    if (claimed.length === 0) {
      if (receipt.status !== 'committed') {
        throw new ORPCError(receipt.status === 'conflict' ? 'CONFLICT' : 'SERVICE_UNAVAILABLE', {
          message: 'Onboarding completion has no committed outcome. Retry with the same key.',
        });
      }
      return { receiptId: receipt.operation_id, replayed: true };
    }

    await commit(tx);
    const updated = await tx.$executeRaw`
      UPDATE public.operation_receipts SET status = 'committed', result = '{"success":true}'::jsonb
      WHERE operation_id = ${receipt.operation_id}::uuid AND account_id = ${accountId}::uuid
        AND payload_hash = ${ONBOARDING_COMPLETION_INTENT} AND status = 'pending'
    `;
    if (updated !== 1) {
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Onboarding completion could not be committed. Retry with the same key.',
      });
    }
    return { receiptId: receipt.operation_id, replayed: false };
  });
}
