import type { AttendanceBatchRecordCommand } from './contract';
import type {
  CapabilityTransactionPort,
  OperationReceipt,
  OperationReceiptClaim,
  OperationReceiptPort,
} from '../../../api/capabilityFoundation';

export type AttendanceBatchAuthority = Readonly<{
  principalId: string;
  activeScope: Readonly<{
    schoolId: string;
    gradeClassIds: readonly string[];
    capabilities: readonly string[];
  }>;
}>;

export type AttendanceBatchRecordedItem = Readonly<{
  attendanceId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}>;

export type AttendanceBatchReceipt = OperationReceipt<readonly AttendanceBatchRecordedItem[]>;

export type AttendanceBatchReceiptClaim = OperationReceiptClaim<
  readonly AttendanceBatchRecordedItem[]
>;

export type AttendanceBatchReceiptPort = OperationReceiptPort<
  readonly AttendanceBatchRecordedItem[]
>;

export interface AttendanceBatchRepository {
  recordBatch(input: {
    authority: AttendanceBatchAuthority;
    command: AttendanceBatchRecordCommand;
  }): Promise<readonly AttendanceBatchRecordedItem[]>;
}

/**
 * The receipt and attendance write must share one durable transaction. This is
 * deliberately a capability-local boundary: the command cannot infer atomicity
 * from unrelated repository implementations.
 */
export type AttendanceBatchTransactionPort = CapabilityTransactionPort<{
  receipts: AttendanceBatchReceiptPort;
  attendance: AttendanceBatchRepository;
}>;

export type AttendanceBatchCommandDependencies = Readonly<{
  transaction: AttendanceBatchTransactionPort;
  hashPayload: (command: AttendanceBatchRecordCommand) => string | Promise<string>;
}>;
