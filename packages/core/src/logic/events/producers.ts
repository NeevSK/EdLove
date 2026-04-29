import type { Inngest } from "inngest";
import type { Classroom, Student, StudentGrade, User } from "../schemas";
import type { Attendance } from "../schemas/attendance.schema";

type SendableInngestClient = Pick<Inngest.Any, "send">;

export interface WorkflowCorrelationMetadata {
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export type SchoolAttendanceRecordedPayload = Attendance &
  WorkflowCorrelationMetadata;
export type UserCreatedPayload = User & WorkflowCorrelationMetadata;
export type UserUpdatedPayload = User & WorkflowCorrelationMetadata;
export type SchoolClassroomCreatedPayload = Classroom &
  WorkflowCorrelationMetadata;
export type SchoolGradePublishedPayload = StudentGrade &
  WorkflowCorrelationMetadata;
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
  mode?: "demo" | "live";
  demoScenario?: "attendance-dip" | "steady-growth" | "wellbeing-watch";
  schoolId: string;
  classroomId: string;
  teacherId?: string | null;
  requestedBy?: string | null;
  requestedAt: string;
  focusPrompt?: string;
  reviewMode?: "draft_only";
  evidenceScopes: Array<"attendance" | "grades" | "wellbeing" | "assignments">;
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export interface StudentSupportRequestedPayload {
  runId: string;
  mode?: "demo" | "live";
  demoScenario?: "quiet-struggle" | "resilient-improver" | "wellbeing-watch";
  schoolId: string;
  classroomId: string;
  teacherId?: string | null;
  studentId: string;
  studentName?: string;
  requestedBy?: string | null;
  requestedAt: string;
  focusPrompt?: string;
  reviewMode?: "draft_only";
  evidenceScopes: Array<"attendance" | "grades" | "wellbeing">;
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

/**
 * Shared producer helpers keep apps from hand-rolling event names and payload
 * shapes in many places.
 */
export async function sendWellbeingMoodLogged(
  client: SendableInngestClient,
  input: WellbeingMoodLoggedPayload,
) {
  return client.send({
    id: input.eventId,
    name: "wellbeing/mood.logged",
    data: {
      studentId: input.studentId,
      moodScore: input.moodScore,
      schoolId: input.schoolId,
      loggedAt: input.loggedAt,
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendUserCreated(
  client: SendableInngestClient,
  input: UserCreatedPayload,
) {
  return client.send({
    id: input.id,
    name: "user/created",
    data: input,
  });
}

export async function sendUserUpdated(
  client: SendableInngestClient,
  input: UserUpdatedPayload,
) {
  return client.send({
    id: input.id,
    name: "user/updated",
    data: input,
  });
}

export async function sendSchoolClassroomCreated(
  client: SendableInngestClient,
  input: SchoolClassroomCreatedPayload,
) {
  return client.send({
    id: input.id,
    name: "school/classroom.created",
    data: input,
  });
}

export async function sendSchoolAttendanceRecorded(
  client: SendableInngestClient,
  input: SchoolAttendanceRecordedPayload,
) {
  return client.send({
    id: input.id,
    name: "school/attendance.recorded",
    data: {
      ...input,
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendSchoolGradePublished(
  client: SendableInngestClient,
  input: SchoolGradePublishedPayload,
) {
  return client.send({
    id: input.id,
    name: "school/grade.published",
    data: input,
  });
}

export async function sendStudentOnboarded(
  client: SendableInngestClient,
  input: StudentOnboardedPayload,
) {
  return client.send({
    id: input.id,
    name: "student/onboarded",
    data: input,
  });
}

export async function sendSyncMutationQueued(
  client: SendableInngestClient,
  input: SyncMutationQueuedPayload,
) {
  return client.send({
    id: input.eventId ?? input.mutationId,
    name: "sync/mutation-queued",
    data: {
      mutationId: input.mutationId,
      action: input.action,
      scope: input.scope,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      causationId: input.causationId,
    },
  });
}

export async function sendTeacherSummaryRequested(
  client: SendableInngestClient,
  input: TeacherSummaryRequestedPayload,
) {
  return client.send({
    id: input.runId,
    name: "agent/teacher-summary.requested",
    data: {
      runId: input.runId,
      mode: input.mode ?? "demo",
      demoScenario: input.demoScenario,
      schoolId: input.schoolId,
      classroomId: input.classroomId,
      teacherId: input.teacherId,
      requestedBy: input.requestedBy,
      requestedAt: input.requestedAt,
      focusPrompt: input.focusPrompt,
      reviewMode: input.reviewMode ?? "draft_only",
      evidenceScopes: input.evidenceScopes,
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}

export async function sendStudentSupportRequested(
  client: SendableInngestClient,
  input: StudentSupportRequestedPayload,
) {
  return client.send({
    id: input.runId,
    name: "agent/student-support.requested",
    data: {
      runId: input.runId,
      mode: input.mode ?? "demo",
      demoScenario: input.demoScenario,
      schoolId: input.schoolId,
      classroomId: input.classroomId,
      teacherId: input.teacherId,
      studentId: input.studentId,
      studentName: input.studentName,
      requestedBy: input.requestedBy,
      requestedAt: input.requestedAt,
      focusPrompt: input.focusPrompt,
      reviewMode: input.reviewMode ?? "draft_only",
      evidenceScopes: input.evidenceScopes,
      correlationId: input.correlationId,
      causationId: input.causationId,
      tenantId: input.tenantId,
    },
  });
}
