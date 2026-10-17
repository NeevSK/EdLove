import { ORPCError } from '@orpc/server';
import {
  ASSIGNMENT_SUBMISSION_CAPABILITY,
  OperationReceiptResultSchema,
} from '@repo/core/api/educational.contract';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { assertDatabase } from './apiErrors';
import type { ORPCContext } from './orpc';
import { assertSubmissionAuthority } from './submissionAuthority';

type SubmissionIntent = { assignmentId: string; content?: string | null };
type SettlementReceipt = {
  operation_id: string;
  payload_hash: string;
  status: string;
  result: unknown;
};

const submissionProjection = {
  id: true,
  assignment_id: true,
  student_id: true,
  content: true,
  submitted_at: true,
  grade: true,
  feedback: true,
  graded_at: true,
  idempotency_key: true,
  assignment: { select: { classroom_id: true } },
} as const;

export function assertSubmissionIntent(
  row: { student_id: string; assignment_id: string; content: string | null },
  accountId: string,
  input: SubmissionIntent,
) {
  if (
    row.student_id !== accountId ||
    row.assignment_id !== input.assignmentId ||
    (row.content ?? null) !== (input.content ?? null)
  ) {
    throw new ORPCError('CONFLICT', {
      message: 'Submission intent does not match the existing operation.',
    });
  }
}

export async function settleAssignmentSubmission(
  context: ORPCContext,
  input: SubmissionIntent & { idempotencyKey: string },
) {
  assertDatabase(context);
  const accountId = context.user.id;
  const capability = ASSIGNMENT_SUBMISSION_CAPABILITY;
  const payloadHash = await getConsistentIdempotencyKey(
    {
      studentId: accountId,
      assignmentId: input.assignmentId,
      content: input.content ?? null,
    },
    capability,
  );
  try {
    return await context.db.$transaction(async (tx) => {
      await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
      await tx.$executeRaw`SET LOCAL statement_timeout = '8s'`;
      await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
      await assertSubmissionAuthority(tx, context, input.assignmentId);
      const claimed = await tx.$queryRaw<Array<{ operation_id: string }>>`
        INSERT INTO public.operation_receipts (operation_id, account_id, capability, idempotency_key, payload_hash, status)
        VALUES (${crypto.randomUUID()}::uuid, ${accountId}::uuid, ${capability}, ${input.idempotencyKey}::uuid, ${payloadHash}, 'pending')
        ON CONFLICT (account_id, capability, idempotency_key) DO NOTHING
        RETURNING operation_id
      `;
      // A second statement sees a concurrent winner after the unique-key wait.
      const receipts = await tx.$queryRaw<SettlementReceipt[]>`
        SELECT operation_id, payload_hash, status, result FROM public.operation_receipts
        WHERE account_id = ${accountId}::uuid AND capability = ${capability}
          AND idempotency_key = ${input.idempotencyKey}::uuid
        FOR UPDATE
      `;
      const receipt = receipts[0];
      if (!receipt)
        throw new ORPCError('SERVICE_UNAVAILABLE', {
          message: 'Operation outcome is not yet available. Retry with the same key.',
        });
      if (receipt.payload_hash !== payloadHash) {
        throw new ORPCError('CONFLICT', {
          message: 'Idempotency key was used for a different submission intent.',
        });
      }
      if (claimed.length === 0) {
        if (receipt.status !== 'committed') {
          throw new ORPCError(receipt.status === 'conflict' ? 'CONFLICT' : 'SERVICE_UNAVAILABLE', {
            message: 'Operation has no committed outcome. Recover using the same key.',
          });
        }
        const { submissionId } = OperationReceiptResultSchema.parse(receipt.result);
        const replay = await tx.assignmentSubmission.findUnique({
          where: { id: submissionId },
          select: submissionProjection,
        });
        if (!replay)
          throw new ORPCError('SERVICE_UNAVAILABLE', {
            message: 'Committed submission is not available.',
          });
        assertSubmissionIntent(replay, accountId, input);
        return replay;
      }
      if (receipt.status !== 'pending') {
        throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Operation claim is not pending.' });
      }
      const existing = await tx.assignmentSubmission.findUnique({
        where: {
          assignment_id_student_id: { assignment_id: input.assignmentId, student_id: accountId },
        },
        select: submissionProjection,
      });
      if (existing) assertSubmissionIntent(existing, accountId, input);
      const submission =
        existing ??
        (await tx.assignmentSubmission.create({
          data: {
            assignment_id: input.assignmentId,
            student_id: accountId,
            content: input.content,
            idempotency_key: input.idempotencyKey,
          },
          select: submissionProjection,
        }));
      await tx.sentinelAuditLog.create({
        data: {
          action: 'assignment_submission_settled',
          actor_id: accountId,
          resource_type: 'assignment_submission',
          resource_id: submission.id,
          details: {
            assignmentId: input.assignmentId,
            operationId: receipt.operation_id,
            replayed: Boolean(existing),
          },
        },
      });
      const result = JSON.stringify({ submissionId: submission.id });
      const updated = await tx.$executeRaw`
        UPDATE public.operation_receipts SET status = 'committed', result = ${result}::jsonb
        WHERE operation_id = ${receipt.operation_id}::uuid AND account_id = ${accountId}::uuid
          AND payload_hash = ${payloadHash} AND status = 'pending'
      `;
      if (updated !== 1)
        throw new ORPCError('SERVICE_UNAVAILABLE', {
          message: 'Operation could not be committed.',
        });
      return submission;
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'dbErrorCode' in error) {
      if (error.dbErrorCode === '23505') {
        throw new ORPCError('CONFLICT', {
          message:
            'Submission uniqueness conflict. Recover the existing operation before retrying.',
        });
      }
      if (['55P03', '57014', '40001', '40P01'].includes(String(error.dbErrorCode))) {
        throw new ORPCError('SERVICE_UNAVAILABLE', {
          message: 'Submission settlement was interrupted. Retry with the same key.',
        });
      }
    }
    throw error;
  }
}
