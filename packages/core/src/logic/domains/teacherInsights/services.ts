import type { TeacherInsightsRepository } from '@repo/core/logic/domains/teacherInsights/ports';
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
} from '@repo/core/logic/schemas/teacher-insights.schema';

export interface TeacherInsightsServices {
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

export const createTeacherInsightsServices = (
  repository: TeacherInsightsRepository,
): TeacherInsightsServices => ({
  listPrivateNotes: (teacherId, type) => repository.listPrivateNotes(teacherId, type),
  createPrivateNote: (input, idempotencyKey) => repository.createPrivateNote(input, idempotencyKey),
  deletePrivateNote: (id) => repository.deletePrivateNote(id),
  listStudentObservations: (classroomId) => repository.listStudentObservations(classroomId),
  listStudentObservationsForEnrollment: (classroomStudentId) =>
    repository.listStudentObservationsForEnrollment(classroomStudentId),
  listStudentObservationsForStudent: (studentId) =>
    repository.listStudentObservationsForStudent(studentId),
  createStudentObservation: (input, idempotencyKey) =>
    repository.createStudentObservation(input, idempotencyKey),
  finalizeStudentObservation: (id, acceptDeclaration, idempotencyKey) =>
    repository.finalizeStudentObservation(id, acceptDeclaration, idempotencyKey),
  deleteStudentObservation: (id) => repository.deleteStudentObservation(id),
  shareStudentObservation: (id, update, actorId, idempotencyKey) =>
    repository.shareStudentObservation(id, update, actorId, idempotencyKey),
  revokeStudentObservationShare: (id, actorId, idempotencyKey) =>
    repository.revokeStudentObservationShare(id, actorId, idempotencyKey),
  promoteStudentObservation: (id, promotion, actorId, idempotencyKey) =>
    repository.promoteStudentObservation(id, promotion, actorId, idempotencyKey),
  getStudentPotential: (studentId, classroomId) =>
    repository.getStudentPotential(studentId, classroomId),
  upsertStudentPotential: (input, idempotencyKey) =>
    repository.upsertStudentPotential(input, idempotencyKey),
  getInsightAuditTrail: (insightType, insightId) =>
    repository.getInsightAuditTrail(insightType, insightId),
  getInsightTimeline: (insightType, insightId) =>
    repository.getInsightTimeline(insightType, insightId),
});
