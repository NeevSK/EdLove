import { ORPCError } from '@orpc/server';
import {
  WorkspaceProvisioningCapabilities,
  workspaceProvisioningORPCContract,
} from '@repo/core/api/workspace-provisioning.orpc.contract';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { assertDatabase } from '../apiErrors';
import { createOperationReceiptPort } from '../operationReceiptStore';
import { implement, type ORPCContext } from '../orpc';
import { sovereignErrorMiddleware } from '../orpcMiddleware';

const impl = implement(workspaceProvisioningORPCContract).$context<ORPCContext>();

export async function assertGuardianLinkEligibility(
  tx: any,
  input: { guardianId: string; studentId: string; schoolId?: string | null },
): Promise<void> {
  const identity = await tx.guardianIdentity.findFirst({
    where: { user_id: input.guardianId },
    select: { id: true, school_id: true },
  });
  if (!identity) {
    throw new ORPCError('NOT_FOUND', {
      message: 'A guardian profile is required before requesting this link.',
    });
  }
  if (!input.schoolId) return;
  if (identity.school_id && identity.school_id !== input.schoolId) {
    throw new ORPCError('FORBIDDEN', {
      message: 'The guardian profile is not associated with the requested school.',
    });
  }
  const enrollment = await tx.studentGradeClassEnrollment.findFirst({
    where: { student_id: input.studentId, school_id: input.schoolId, status: 'active' },
    select: { id: true },
  });
  if (!enrollment) {
    throw new ORPCError('NOT_FOUND', {
      message: 'The student is not enrolled in the requested school.',
    });
  }
}

export async function settleWorkspaceProvisioning<T extends Record<string, unknown>>(input: {
  context: ORPCContext;
  capability: string;
  idempotencyKey: string;
  intent: Record<string, unknown>;
  commit: (tx: any) => Promise<T>;
}) {
  assertDatabase(input.context);
  if (input.context.user.id === 'anonymous')
    throw new ORPCError('FORBIDDEN', { message: 'Authentication is required.' });
  const accountId = input.context.user.id;
  const payloadHash = await getConsistentIdempotencyKey(input.intent, input.capability);
  return input.context.db.$transaction(async (tx: any) => {
    await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
    await tx.$executeRaw`SET LOCAL statement_timeout = '8s'`;
    await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
    const receipts = createOperationReceiptPort<T>(tx, accountId);
    const claim = await receipts.claim({
      capability: input.capability,
      principalId: accountId,
      idempotencyKey: input.idempotencyKey,
      payloadHash,
    });
    if (claim.kind === 'payload-conflict' || claim.kind === 'conflict')
      throw new ORPCError('CONFLICT', {
        message: 'Idempotency key was used for a different provisioning intent.',
      });
    if (claim.kind === 'failed' || claim.kind === 'in-progress')
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Provisioning outcome is not committed. Recover with the same key.',
      });
    if (claim.kind === 'replay') {
      return {
        capability: input.capability,
        operationId: claim.receipt.operationId,
        outcome: 'replayed' as const,
        result: claim.receipt.result as T,
      };
    }
    const result = await input.commit(tx);
    let receipt;
    try {
      receipt = await receipts.complete({
        operationId: claim.receipt.operationId,
        payloadHash,
        result,
      });
    } catch {
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Provisioning receipt could not be committed.',
      });
    }
    return {
      capability: input.capability,
      operationId: receipt.operationId,
      outcome: 'committed' as const,
      result,
    };
  });
}

export const workspaceProvisioningRouter = impl.router({
  provisionCommercialBatch: impl.provisionCommercialBatch
    .use(sovereignErrorMiddleware)
    .handler(({ input, context }) =>
      settleWorkspaceProvisioning({
        context,
        capability: WorkspaceProvisioningCapabilities.commercialCapability,
        idempotencyKey: input.body.idempotencyKey,
        intent: { ...input.body, accountId: context.user.id },
        commit: async (tx) => {
          if (input.body.instituteId) {
            const institute = await tx.tuitionInstitute.findFirst({
              where: { id: input.body.instituteId, created_by: context.user.id },
              select: { id: true },
            });
            if (!institute)
              throw new ORPCError('FORBIDDEN', {
                message: 'You cannot create a batch for that tuition institute.',
              });
          }
          const batch = await tx.tuitionBatch.create({
            data: {
              institute_id: input.body.instituteId ?? null,
              tutor_user_id: context.user.id,
              subject_name: input.body.subjectName,
              grade_level: input.body.gradeLevel,
              medium: input.body.medium,
              schedule: input.body.schedule,
              monthly_fee: input.body.monthlyFee ? Number(input.body.monthlyFee) : null,
              custom_alias: input.body.customAlias ?? null,
              role: input.body.role ?? 'lead_tutor',
              is_active: true,
            },
            select: { id: true },
          });
          return { batchId: batch.id };
        },
      }),
    ),
  requestGuardianLink: impl.requestGuardianLink
    .use(sovereignErrorMiddleware)
    .handler(({ input, context }) =>
      settleWorkspaceProvisioning({
        context,
        capability: WorkspaceProvisioningCapabilities.guardianCapability,
        idempotencyKey: input.body.idempotencyKey,
        intent: { ...input.body, accountId: context.user.id },
        commit: async (tx) => {
          await assertGuardianLinkEligibility(tx, {
            guardianId: context.user.id,
            studentId: input.body.studentId,
            schoolId: input.body.schoolId,
          });
          const relationship = await tx.studentGuardianRelationship.create({
            data: {
              guardian_id: context.user.id,
              student_id: input.body.studentId,
              relationship_type: input.body.relationship,
              verification_status: 'pending',
            },
            select: { id: true },
          });
          return { relationshipId: relationship.id };
        },
      }),
    ),
});
