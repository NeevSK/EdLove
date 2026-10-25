import { ORPCError } from '@orpc/server';
import {
  attendanceBatchRecordCapability,
  attendanceV1ORPCContract,
} from '@repo/core/api/attendance-v1.orpc.contract';
import { expectedFailurePolicy } from '@repo/core/api/capabilityFoundation';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import {
  ATTENDANCE_BATCH_RECORD_CAPABILITY,
  type AttendanceBatchRecordCommand,
} from '@repo/core/logic/domains/attendanceCommand/contract';
import type {
  AttendanceBatchAuthority,
  AttendanceBatchCommandDependencies,
  AttendanceBatchRecordedItem,
} from '@repo/core/logic/domains/attendanceCommand/ports';
import {
  AttendanceBatchCommandError,
  executeAttendanceBatchRecord,
} from '@repo/core/logic/domains/attendanceCommand/service';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { activeScopeReader, resolvePersistedActiveBond } from '../activeScope';
import { capabilityErrorEnvelope } from '../capabilityErrorEnvelope';
import { recordCapabilityAudit } from '../capabilityObservability';
import { createOperationReceiptPort } from '../operationReceiptStore';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';
import { recordDailyAttendance } from './attendance';

const impl = implement(attendanceV1ORPCContract).$context<ORPCContext>();

function authorityFromContext(context: ORPCContext): AttendanceBatchAuthority {
  const gradeClassIds = context.principal?.attributes.classroom_ids ?? [];
  return {
    principalId: context.user.id,
    activeScope: {
      schoolId: context.schoolId ?? '',
      gradeClassIds,
      // Cedar's declared DailyAttendance policy is the authorization authority.
      // The command receives only a server-derived capability fact after that gate.
      capabilities: ['attendance:write'],
    },
  };
}

async function assertCurrentScope(
  tx: any,
  context: ORPCContext,
  authority: AttendanceBatchAuthority,
) {
  const activeBond = await resolvePersistedActiveBond(activeScopeReader(tx), context.user.id);
  if (!activeBond) {
    throw new AttendanceBatchCommandError('SCOPE_MISMATCH', 'An active scope is required.');
  }
  const scope = resolveBondScope(activeBond);
  if (
    scope.activeBondId !== context.activeBondId ||
    scope.schoolId !== authority.activeScope.schoolId ||
    !scope.schoolId
  ) {
    throw new AttendanceBatchCommandError(
      'SCOPE_MISMATCH',
      'The active scope changed before attendance could be recorded.',
    );
  }
}

function dependenciesFor(context: ORPCContext): AttendanceBatchCommandDependencies {
  if (!context.db) {
    throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Database is unavailable.' });
  }
  return {
    hashPayload: (command) =>
      getConsistentIdempotencyKey(
        {
          gradeClassId: command.gradeClassId,
          date: command.date,
          records: command.records,
        },
        ATTENDANCE_BATCH_RECORD_CAPABILITY,
      ),
    transaction: {
      run: (work) =>
        context.db.$transaction(async (tx: any) => {
          await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
          await tx.$executeRaw`SET LOCAL statement_timeout = '8s'`;
          await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
          let auditTarget: { gradeClassId: string; recordCount: number } | null = null;
          const baseReceipts = createOperationReceiptPort<readonly AttendanceBatchRecordedItem[]>(
            tx,
            context.user.id,
          );
          const receipts = {
            ...baseReceipts,
            complete: async ({ operationId, payloadHash, result }: any) => {
              if (!auditTarget) throw new Error('Attendance receipt has no audit target.');
              await recordCapabilityAudit(tx, attendanceBatchRecordCapability, {
                action: 'attendance_batch_recorded',
                actorId: context.user.id,
                resourceType: 'grade_class',
                resourceId: auditTarget.gradeClassId,
                details: {
                  operationId,
                  schoolId: context.schoolId,
                  recordCount: auditTarget.recordCount,
                },
              });
              return baseReceipts.complete({ operationId, payloadHash, result });
            },
          };
          const attendance = {
            recordBatch: async ({
              authority,
              command,
            }: {
              authority: AttendanceBatchAuthority;
              command: AttendanceBatchRecordCommand;
            }) => {
              await assertCurrentScope(tx, context, authority);
              const recorded: AttendanceBatchRecordedItem[] = [];
              for (const item of command.records) {
                const row = await recordDailyAttendance(
                  context,
                  { ...item, gradeClassId: command.gradeClassId, date: command.date },
                  tx,
                );
                recorded.push({
                  attendanceId: String(row.id),
                  studentId: item.studentId,
                  status: item.status,
                });
              }
              auditTarget = { gradeClassId: command.gradeClassId, recordCount: recorded.length };
              return recorded;
            },
          };
          return work({ receipts, attendance });
        }),
    },
  };
}

function commandErrorToORPC(error: AttendanceBatchCommandError): ORPCError<string, unknown> {
  const failureKindByCommandError = {
    VALIDATION_FAILED: 'validation',
    AUTHORIZATION_DENIED: 'authorization',
    SCOPE_MISMATCH: 'authorization',
    IDEMPOTENCY_CONFLICT: 'conflict',
    OPERATION_IN_PROGRESS: 'in-progress',
    DEPENDENCY_FAILURE: 'dependency-unavailable',
  } as const;
  const failure = expectedFailurePolicy(failureKindByCommandError[error.code]);
  return new ORPCError(failure.orpcCode, {
    message: error.message,
    data: {
      capability: attendanceBatchRecordCapability.id,
      failureKind: failure.kind,
      retryable: failure.retryable,
    },
  });
}

const attendanceFailureKindByProtocolCode = {
  BAD_REQUEST: ['validation'],
  FORBIDDEN: ['authorization'],
  CONFLICT: ['conflict'],
  SERVICE_UNAVAILABLE: ['dependency-unavailable', 'in-progress'],
} as const;

export const attendanceV1Router = impl.router({
  batchRecord: impl.batchRecord
    .use(
      capabilityErrorEnvelope(attendanceBatchRecordCapability, attendanceFailureKindByProtocolCode),
    )
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      try {
        return await executeAttendanceBatchRecord(
          input.body,
          authorityFromContext(context),
          dependenciesFor(context),
        );
      } catch (error) {
        if (error instanceof AttendanceBatchCommandError) throw commandErrorToORPC(error);
        throw error;
      }
    }),
});
