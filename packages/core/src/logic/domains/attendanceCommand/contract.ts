import { z } from 'zod';

export const ATTENDANCE_BATCH_RECORD_CAPABILITY = 'classroom.attendance.batch-record' as const;

export const AttendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);

export const AttendanceBatchRecordSchema = z.strictObject({
  studentId: z.uuid(),
  status: AttendanceStatusSchema,
  sessionKind: z.enum(['lesson', 'arrival', 'departure']).optional(),
  sessionAt: z.iso.datetime().optional(),
  subjectId: z.uuid().nullable().optional(),
  termId: z.uuid().nullable().optional(),
});

/**
 * Deliberately excludes actor, school, role, and active scope. Those facts must
 * come from the server-derived authority context, never from transport input.
 */
export const AttendanceBatchRecordCommandSchema = z.strictObject({
  gradeClassId: z.uuid(),
  date: z.iso.date(),
  idempotencyKey: z.string().trim().min(1).max(200),
  records: z.array(AttendanceBatchRecordSchema).min(1).max(500),
});

export type AttendanceBatchRecordCommand = z.infer<typeof AttendanceBatchRecordCommandSchema>;
export type AttendanceBatchRecord = z.infer<typeof AttendanceBatchRecordSchema>;

export const AttendanceBatchRecordEventDecision = {
  capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
  audit: {
    emit: true,
    fields: ['actorId', 'schoolId', 'gradeClassId', 'operationId', 'outcome'] as const,
  },
  productActivity: {
    emit: false,
    reason: 'No audience, visibility, consent, or retention policy has been approved.',
  },
  telemetry: {
    emit: true,
    fields: ['capability', 'outcome', 'recordCount'] as const,
    excludes: ['studentIds', 'attendanceStatuses', 'requestPayload'] as const,
  },
} as const;

export type AttendanceBatchRecordEventDecision = typeof AttendanceBatchRecordEventDecision;
