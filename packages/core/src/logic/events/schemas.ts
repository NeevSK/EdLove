import type { StandardSchemaV1 } from 'inngest';
import { eventType } from 'inngest';
import { z } from 'zod';
import {
  AttendanceSchema,
  ClassroomSchema,
  StudentGradeSchema,
  StudentSchema,
  UserSchema,
} from '../schemas';

const withWorkflowMetadata = <TSchema extends z.ZodObject<any>>(schema: TSchema) =>
  schema.extend({
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
    tenantId: z.string().optional(),
  });

const asEventSchema = <T extends Record<string, unknown>>(schema: z.ZodType<T>) =>
  schema as unknown as StandardSchemaV1<T, T>;

/**
 * Shared Inngest v4 event contracts for Gurudevi.
 *
 * These definitions are safe to keep in shared packages because they describe
 * event names and payload shapes only; they do not instantiate clients or bind
 * to any runtime-specific environment.
 */
export const userCreatedEvent = eventType('user/created', {
  schema: withWorkflowMetadata(UserSchema),
});

export const userUpdatedEvent = eventType('user/updated', {
  schema: withWorkflowMetadata(UserSchema),
});

export const schoolClassroomCreatedEvent = eventType('school/classroom.created', {
  schema: withWorkflowMetadata(ClassroomSchema),
});

export const schoolAttendanceRecordedEvent = eventType('school/attendance.recorded', {
  schema: withWorkflowMetadata(AttendanceSchema),
});

export const schoolGradePublishedEvent = eventType('school/grade.published', {
  schema: withWorkflowMetadata(StudentGradeSchema),
});

export const studentOnboardedEvent = eventType('student/onboarded', {
  schema: withWorkflowMetadata(StudentSchema),
});

export const wellbeingMoodLoggedEvent = eventType('wellbeing/mood.logged', {
  schema: z.object({
    studentId: z.string().uuid(),
    moodScore: z.number().int().min(1).max(5),
    schoolId: z.string().uuid(),
    loggedAt: z.string().datetime().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
    tenantId: z.string().optional(),
  }),
});

export const syncMutationQueuedEvent = eventType('sync/mutation-queued', {
  schema: z.object({
    mutationId: z.string(),
    action: z.string().min(1),
    scope: z.string().min(1).optional(),
    idempotencyKey: z.string().min(1).optional(),
    payload: z.unknown(),
    tenantId: z.string().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  }),
});

export const teacherSummaryRequestedPayloadSchema = z.object({
  runId: z.string().uuid(),
  mode: z.enum(['demo', 'live']),
  demoScenario: z.enum(['attendance-dip', 'steady-growth', 'wellbeing-watch']).optional(),
  schoolId: z.string().uuid(),
  classroomId: z.string().uuid(),
  teacherId: z.string().uuid().optional().nullable(),
  requestedBy: z.string().optional().nullable(),
  requestedAt: z.string().datetime(),
  focusPrompt: z.string().min(1).max(500).optional(),
  reviewMode: z.enum(['draft_only']),
  evidenceScopes: z
    .array(z.enum(['attendance', 'grades', 'wellbeing', 'assignments']))
    .min(1)
    .max(4),
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  tenantId: z.string().optional(),
});

export const teacherSummaryRequestedEvent = eventType('agent/teacher-summary.requested', {
  schema: asEventSchema(teacherSummaryRequestedPayloadSchema),
});

export const studentSupportRequestedPayloadSchema = z.object({
  runId: z.string().uuid(),
  mode: z.enum(['demo', 'live']),
  demoScenario: z.enum(['quiet-struggle', 'resilient-improver', 'wellbeing-watch']).optional(),
  schoolId: z.string().uuid(),
  classroomId: z.string().uuid(),
  teacherId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid(),
  studentName: z.string().min(1).max(120).optional(),
  requestedBy: z.string().optional().nullable(),
  requestedAt: z.string().datetime(),
  focusPrompt: z.string().min(1).max(500).optional(),
  reviewMode: z.enum(['draft_only']),
  evidenceScopes: z
    .array(z.enum(['attendance', 'grades', 'wellbeing']))
    .min(1)
    .max(3),
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  tenantId: z.string().optional(),
});

export const studentSupportRequestedEvent = eventType('agent/student-support.requested', {
  schema: asEventSchema(studentSupportRequestedPayloadSchema),
});

export const systemAuditLogEvent = eventType('system/audit.log', {
  schema: withWorkflowMetadata(
    z.object({
      action: z.string(),
      actorId: z.string().uuid(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

/**
 * Transitional export retained for repo-wide compatibility while older code is
 * still being moved off the v3-style centralized schema mental model.
 */
export const schemas = {
  'user/created': userCreatedEvent,
  'user/updated': userUpdatedEvent,
  'school/classroom.created': schoolClassroomCreatedEvent,
  'school/attendance.recorded': schoolAttendanceRecordedEvent,
  'school/grade.published': schoolGradePublishedEvent,
  'student/onboarded': studentOnboardedEvent,
  'wellbeing/mood.logged': wellbeingMoodLoggedEvent,
  'sync/mutation-queued': syncMutationQueuedEvent,
  'agent/teacher-summary.requested': teacherSummaryRequestedEvent,
  'agent/student-support.requested': studentSupportRequestedEvent,
  'system/audit.log': systemAuditLogEvent,
} as const;

export type GurudeviEvents = typeof schemas;
