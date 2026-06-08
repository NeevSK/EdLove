import type { IEventBusPort } from '../ports/eventBus.port';
import type { Classroom, Student, StudentGrade, User } from '../schemas';
import type { Attendance } from '../schemas/attendance.schema';

export interface WorkflowCorrelationMetadata {
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export type SchoolAttendanceRecordedPayload = Attendance & WorkflowCorrelationMetadata;
export type UserCreatedPayload = User & WorkflowCorrelationMetadata;
export type UserUpdatedPayload = User & WorkflowCorrelationMetadata;
export type SchoolClassroomCreatedPayload = Classroom & WorkflowCorrelationMetadata;
export type SchoolGradePublishedPayload = StudentGrade & WorkflowCorrelationMetadata;
export type StudentOnboardedPayload = Student & WorkflowCorrelationMetadata;

export interface WellbeingMoodLoggedPayload {
  studentId: string;
  moodScore: number;
  schoolId: string;
  loggedAt?: string;
  eventId?: string;
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export interface SyncMutationQueuedPayload {
  mutationId: string;
  action: string;
  scope?: string;
  idempotencyKey?: string;
  payload: unknown;
  tenantId?: string;
  eventId?: string;
  correlationId?: string;
  causationId?: string;
}

export interface TeacherSummaryRequestedPayload {
  runId: string;
  mode?: 'demo' | 'live';
  demoScenario?: 'attendance-dip' | 'steady-growth' | 'wellbeing-watch';
  schoolId: string;
  classroomId: string;
  teacherId?: string | null;
  requestedBy?: string | null;
  requestedAt: string;
  focusPrompt?: string;
  reviewMode?: 'draft_only';
  evidenceScopes: Array<'attendance' | 'grades' | 'wellbeing' | 'assignments'>;
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export interface StudentSupportRequestedPayload {
  runId: string;
  mode?: 'demo' | 'live';
  demoScenario?: 'quiet-struggle' | 'resilient-improver' | 'wellbeing-watch';
  schoolId: string;
  classroomId: string;
  teacherId?: string | null;
  studentId: string;
  studentName?: string;
  requestedBy?: string | null;
  requestedAt: string;
  focusPrompt?: string;
  reviewMode?: 'draft_only';
  evidenceScopes: Array<'attendance' | 'grades' | 'wellbeing'>;
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

/**
 * Shared producer helpers keep apps from hand-rolling event names and payload
 * shapes in many places.
 */
export async function sendWellbeingMoodLogged(
  bus: IEventBusPort,
  input: WellbeingMoodLoggedPayload,
) {
  return bus.publish({
    name: 'wellbeing/mood.logged',
    data: {
      studentId: input.studentId,
      moodScore: input.moodScore,
      schoolId: input.schoolId,
      loggedAt: input.loggedAt,
    },
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendUserCreated(bus: IEventBusPort, input: UserCreatedPayload) {
  return bus.publish({
    name: 'user/created',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendUserUpdated(bus: IEventBusPort, input: UserUpdatedPayload) {
  return bus.publish({
    name: 'user/updated',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendSchoolClassroomCreated(
  bus: IEventBusPort,
  input: SchoolClassroomCreatedPayload,
) {
  return bus.publish({
    name: 'school/classroom.created',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendSchoolAttendanceRecorded(
  bus: IEventBusPort,
  input: SchoolAttendanceRecordedPayload,
) {
  return bus.publish({
    name: 'school/attendance.recorded',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendSchoolGradePublished(
  bus: IEventBusPort,
  input: SchoolGradePublishedPayload,
) {
  return bus.publish({
    name: 'school/grade.published',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendStudentOnboarded(bus: IEventBusPort, input: StudentOnboardedPayload) {
  return bus.publish({
    name: 'student/onboarded',
    data: input,
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendSyncMutationQueued(bus: IEventBusPort, input: SyncMutationQueuedPayload) {
  return bus.publish({
    name: 'sync/mutation-queued',
    data: {
      mutationId: input.mutationId,
      action: input.action,
      scope: input.scope,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
      tenantId: input.tenantId,
    },
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendTeacherSummaryRequested(
  bus: IEventBusPort,
  input: TeacherSummaryRequestedPayload,
) {
  return bus.publish({
    name: 'agent/teacher-summary.requested',
    data: {
      runId: input.runId,
      mode: input.mode ?? 'demo',
      demoScenario: input.demoScenario,
      schoolId: input.schoolId,
      classroomId: input.classroomId,
      teacherId: input.teacherId,
      requestedBy: input.requestedBy,
      requestedAt: input.requestedAt,
      focusPrompt: input.focusPrompt,
      reviewMode: input.reviewMode ?? 'draft_only',
      evidenceScopes: input.evidenceScopes,
    },
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendStudentSupportRequested(
  bus: IEventBusPort,
  input: StudentSupportRequestedPayload,
) {
  return bus.publish({
    name: 'agent/student-support.requested',
    data: {
      runId: input.runId,
      mode: input.mode ?? 'demo',
      demoScenario: input.demoScenario,
      schoolId: input.schoolId,
      classroomId: input.classroomId,
      teacherId: input.teacherId,
      studentId: input.studentId,
      studentName: input.studentName,
      requestedBy: input.requestedBy,
      requestedAt: input.requestedAt,
      focusPrompt: input.focusPrompt,
      reviewMode: input.reviewMode ?? 'draft_only',
      evidenceScopes: input.evidenceScopes,
    },
    metadata: {
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}
