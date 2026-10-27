import { z } from 'zod';
import type { CapabilityDescriptor } from '../../../api/capabilityFoundation';

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
  // The durable operation_receipts identity is UUID-backed. Keeping this at
  // the contract boundary prevents a route from accepting a key the adapter
  // cannot settle.
  idempotencyKey: z.uuid(),
  records: z.array(AttendanceBatchRecordSchema).min(1).max(500),
});

export type AttendanceBatchRecordCommand = z.infer<typeof AttendanceBatchRecordCommandSchema>;
export type AttendanceBatchRecord = z.infer<typeof AttendanceBatchRecordSchema>;

export const AttendanceBatchRecordFoundationPolicy: Omit<CapabilityDescriptor, 'id'> = {
  lifecycle: 'commit',
  privacy: 'sensitive',
  idempotency: 'required',
  receipt: 'required',
  audit: 'minimal',
  activity: { kind: 'none' },
  telemetry: { kind: 'operational', allowedFields: ['capability', 'outcome', 'recordCount'] },
  effect: { kind: 'none' },
} as const;

export const AttendanceBatchRecordEventDecision = {
  capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
  audit: {
    emit: AttendanceBatchRecordFoundationPolicy.audit !== 'none',
    fields: ['actorId', 'schoolId', 'gradeClassId', 'operationId', 'outcome'] as const,
  },
  productActivity: {
    emit: AttendanceBatchRecordFoundationPolicy.activity.kind !== 'none',
    reason: 'No audience, visibility, consent, or retention policy has been approved.',
  },
  telemetry: {
    emit: AttendanceBatchRecordFoundationPolicy.telemetry.kind === 'operational',
    fields:
      AttendanceBatchRecordFoundationPolicy.telemetry.kind === 'operational'
        ? AttendanceBatchRecordFoundationPolicy.telemetry.allowedFields
        : [],
    excludes: ['studentIds', 'attendanceStatuses', 'requestPayload'] as const,
  },
} as const;

export type AttendanceBatchRecordEventDecision = typeof AttendanceBatchRecordEventDecision;
