import type { AttendanceBatchRecordCommand } from './contract';

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

export type AttendanceBatchReceipt = Readonly<{
  operationId: string;
  status: 'pending' | 'completed' | 'failed';
  payloadHash: string;
  result: readonly AttendanceBatchRecordedItem[] | null;
}>;

export type AttendanceBatchReceiptClaim =
  | Readonly<{ kind: 'claimed'; receipt: AttendanceBatchReceipt }>
  | Readonly<{ kind: 'replay'; receipt: AttendanceBatchReceipt }>
  | Readonly<{ kind: 'payload-conflict'; receipt: AttendanceBatchReceipt }>
  | Readonly<{ kind: 'in-progress'; receipt: AttendanceBatchReceipt }>;

export interface AttendanceBatchReceiptPort {
  claim(input: {
    capability: string;
    principalId: string;
    idempotencyKey: string;
    payloadHash: string;
  }): Promise<AttendanceBatchReceiptClaim>;
  complete(input: {
    operationId: string;
    payloadHash: string;
    result: readonly AttendanceBatchRecordedItem[];
  }): Promise<AttendanceBatchReceipt>;
  fail(input: { operationId: string; payloadHash: string; failureCode: string }): Promise<void>;
}

export interface AttendanceBatchRepository {
  recordBatch(input: {
    authority: AttendanceBatchAuthority;
    command: AttendanceBatchRecordCommand;
  }): Promise<readonly AttendanceBatchRecordedItem[]>;
}

export type AttendanceBatchCommandDependencies = Readonly<{
  receipts: AttendanceBatchReceiptPort;
  attendance: AttendanceBatchRepository;
  hashPayload: (command: AttendanceBatchRecordCommand) => string;
}>;
