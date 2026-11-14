import { z } from 'zod';
import {
  ATTENDANCE_BATCH_RECORD_CAPABILITY,
  AttendanceBatchRecordFoundationPolicy,
  AttendanceBatchRecordCommandSchema,
  AttendanceStatusSchema,
} from '../logic/domains/attendanceCommand/contract';
import type { CapabilityDescriptor } from './capabilityFoundation';

export const attendanceBatchRecordCapability: CapabilityDescriptor = {
  id: ATTENDANCE_BATCH_RECORD_CAPABILITY,
  ...AttendanceBatchRecordFoundationPolicy,
};

const recordedItem = z.strictObject({
  attendanceId: z.uuid(),
  studentId: z.uuid(),
  status: AttendanceStatusSchema,
});

const attendanceFailureData = <TKind extends z.ZodLiteral<string>>(
  failureKind: TKind,
  retryable: boolean,
) =>
  z.strictObject({
    capability: z.literal(ATTENDANCE_BATCH_RECORD_CAPABILITY),
    failureKind,
    retryable: z.literal(retryable),
  });

export const attendanceV1ORPCContract = {
  batchRecord: {
    method: 'post',
    path: '/classroom/attendance/batch-record',
    request: { body: AttendanceBatchRecordCommandSchema },
    responses: {
      200: {
        schema: z.strictObject({
          capability: z.literal(ATTENDANCE_BATCH_RECORD_CAPABILITY),
          operationId: z.uuid(),
          outcome: z.enum(['committed', 'replayed']),
          records: z.array(recordedItem),
        }),
        description: 'Atomically settled attendance batch operation',
      },
    },
    errors: {
      BAD_REQUEST: { data: attendanceFailureData(z.literal('validation'), false) },
      FORBIDDEN: { data: attendanceFailureData(z.literal('authorization'), false) },
      CONFLICT: { data: attendanceFailureData(z.literal('conflict'), false) },
      SERVICE_UNAVAILABLE: {
        data: z.union([
          attendanceFailureData(z.literal('in-progress'), true),
          attendanceFailureData(z.literal('dependency-unavailable'), true),
        ]),
      },
    },
    metadata: { policy: { action: 'create', subject: 'DailyAttendance' } },
  },
} as const;
