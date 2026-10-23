import {
  ATTENDANCE_BATCH_RECORD_CAPABILITY,
  type AttendanceBatchRecordCommand,
  AttendanceBatchRecordCommandSchema,
} from './contract';
import type {
  AttendanceBatchAuthority,
  AttendanceBatchCommandDependencies,
  AttendanceBatchReceipt,
  AttendanceBatchRecordedItem,
} from './ports';

export type AttendanceBatchCommandFailureCode =
  | 'VALIDATION_FAILED'
  | 'AUTHORIZATION_DENIED'
  | 'SCOPE_MISMATCH'
  | 'IDEMPOTENCY_CONFLICT'
  | 'OPERATION_IN_PROGRESS'
  | 'DEPENDENCY_FAILURE';

export class AttendanceBatchCommandError extends Error {
  constructor(
    readonly code: AttendanceBatchCommandFailureCode,
    message: string,
  ) {
    super(message);
    this.name = 'AttendanceBatchCommandError';
  }
}

export type AttendanceBatchCommandOutcome = Readonly<{
  capability: typeof ATTENDANCE_BATCH_RECORD_CAPABILITY;
  operationId: string;
  outcome: 'committed' | 'replayed';
  records: readonly AttendanceBatchRecordedItem[];
}>;

function assertAuthority(
  authority: AttendanceBatchAuthority,
  command: AttendanceBatchRecordCommand,
): void {
  if (!authority.activeScope.capabilities.includes('attendance:write')) {
    throw new AttendanceBatchCommandError(
      'AUTHORIZATION_DENIED',
      'The active scope cannot record attendance.',
    );
  }
  if (!authority.activeScope.gradeClassIds.includes(command.gradeClassId)) {
    throw new AttendanceBatchCommandError(
      'SCOPE_MISMATCH',
      'The requested grade class is outside the active scope.',
    );
  }
}

function completedOutcome(receipt: AttendanceBatchReceipt, outcome: 'committed' | 'replayed') {
  if (receipt.status !== 'completed' || !receipt.result) {
    throw new AttendanceBatchCommandError(
      'OPERATION_IN_PROGRESS',
      'The operation has no completed receipt. Recover using the same idempotency key.',
    );
  }
  return {
    capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
    operationId: receipt.operationId,
    outcome,
    records: receipt.result,
  } as const;
}

/**
 * Transport-free v1 command. A persistence adapter must make receipt claim,
 * mutation, and completion atomic before this command is admitted to a route.
 */
export async function executeAttendanceBatchRecord(
  rawCommand: unknown,
  authority: AttendanceBatchAuthority,
  dependencies: AttendanceBatchCommandDependencies,
): Promise<AttendanceBatchCommandOutcome> {
  const validation = AttendanceBatchRecordCommandSchema.safeParse(rawCommand);
  if (!validation.success) {
    throw new AttendanceBatchCommandError(
      'VALIDATION_FAILED',
      'The attendance batch command is invalid.',
    );
  }
  const command = validation.data;
  assertAuthority(authority, command);
  const payloadHash = dependencies.hashPayload(command);
  const claim = await dependencies.receipts.claim({
    capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
    principalId: authority.principalId,
    idempotencyKey: command.idempotencyKey,
    payloadHash,
  });

  if (claim.kind === 'payload-conflict') {
    throw new AttendanceBatchCommandError(
      'IDEMPOTENCY_CONFLICT',
      'The idempotency key was already used for a different attendance batch.',
    );
  }
  if (claim.kind === 'in-progress') {
    throw new AttendanceBatchCommandError(
      'OPERATION_IN_PROGRESS',
      'The attendance batch is still being settled. Recover using the same idempotency key.',
    );
  }
  if (claim.kind === 'replay') return completedOutcome(claim.receipt, 'replayed');

  let records: readonly AttendanceBatchRecordedItem[];
  try {
    records = await dependencies.attendance.recordBatch({ authority, command });
  } catch {
    await dependencies.receipts.fail({
      operationId: claim.receipt.operationId,
      payloadHash,
      failureCode: 'DEPENDENCY_FAILURE',
    });
    throw new AttendanceBatchCommandError(
      'DEPENDENCY_FAILURE',
      'Attendance batch could not be recorded. Recover using the same idempotency key.',
    );
  }

  try {
    const receipt = await dependencies.receipts.complete({
      operationId: claim.receipt.operationId,
      payloadHash,
      result: records,
    });
    return completedOutcome(receipt, 'committed');
  } catch (error) {
    if (error instanceof AttendanceBatchCommandError) throw error;
    throw new AttendanceBatchCommandError(
      'OPERATION_IN_PROGRESS',
      'Attendance may have been recorded. Recover using the same idempotency key.',
    );
  }
}
