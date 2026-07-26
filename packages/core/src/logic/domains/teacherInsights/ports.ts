import type {
  TeacherInsightAuditEvent,
  TeacherInsightLifecycleEvent,
  TeacherInsightPromotion,
  TeacherInsightShareUpdate,
  TeacherInsightTargetType,
  TeacherPrivateNoteCreate,
  TeacherPrivateNoteZod,
  TeacherStudentObservationCreate,
  TeacherStudentObservationZod,
  TeacherStudentPotentialUpsert,
  TeacherStudentPotentialZod,
} from '@/logic/schemas/teacher-insights.schema';

export interface TeacherInsightsRepository {
  listPrivateNotes(
    teacherId: string,
    type?: TeacherPrivateNoteZod['type'],
  ): Promise<TeacherPrivateNoteZod[]>;
  createPrivateNote(
    input: TeacherPrivateNoteCreate,
    idempotencyKey?: string,
  ): Promise<TeacherPrivateNoteZod>;
  deletePrivateNote(id: string): Promise<void>;
  listStudentObservations(classroomId: string): Promise<TeacherStudentObservationZod[]>;
  listStudentObservationsForEnrollment(
    classroomStudentId: string,
  ): Promise<TeacherStudentObservationZod[]>;
  listStudentObservationsForStudent(studentId: string): Promise<TeacherStudentObservationZod[]>;
  createStudentObservation(
    input: TeacherStudentObservationCreate,
    idempotencyKey?: string,
  ): Promise<TeacherStudentObservationZod>;
  finalizeStudentObservation(
    id: string,
    acceptDeclaration: boolean,
    idempotencyKey?: string,
  ): Promise<TeacherStudentObservationZod>;
  deleteStudentObservation(id: string): Promise<void>;
  shareStudentObservation(
    id: string,
    update: TeacherInsightShareUpdate,
    actorId: string,
    idempotencyKey?: string,
  ): Promise<TeacherStudentObservationZod>;
  revokeStudentObservationShare(
    id: string,
    actorId: string,
    idempotencyKey?: string,
  ): Promise<TeacherStudentObservationZod>;
  promoteStudentObservation(
    id: string,
    promotion: TeacherInsightPromotion,
    actorId: string,
    idempotencyKey?: string,
  ): Promise<{ success: true; recordedAt: string }>;
  getStudentPotential(
    studentId: string,
    classroomId: string,
  ): Promise<TeacherStudentPotentialZod | null>;
  upsertStudentPotential(
    input: TeacherStudentPotentialUpsert,
    idempotencyKey?: string,
  ): Promise<TeacherStudentPotentialZod>;
  getInsightAuditTrail(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightAuditEvent[]>;
  getInsightTimeline(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightLifecycleEvent[]>;
}
