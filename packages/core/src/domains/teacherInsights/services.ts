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
} from '../../api/schemas/teacher-insights.schema';
import type { TeacherInsightsRepository } from './ports';

export interface TeacherInsightsServices {
  listPrivateNotes(
    teacherId: string,
    type?: TeacherPrivateNoteZod['type'],
  ): Promise<TeacherPrivateNoteZod[]>;
  createPrivateNote(input: TeacherPrivateNoteCreate): Promise<TeacherPrivateNoteZod>;
  deletePrivateNote(id: string): Promise<void>;
  listStudentObservations(classroomId: string): Promise<TeacherStudentObservationZod[]>;
  listStudentObservationsForEnrollment(
    classroomStudentId: string,
  ): Promise<TeacherStudentObservationZod[]>;
  listStudentObservationsForStudent(studentId: string): Promise<TeacherStudentObservationZod[]>;
  createStudentObservation(
    input: TeacherStudentObservationCreate,
  ): Promise<TeacherStudentObservationZod>;
  finalizeStudentObservation(
    id: string,
    acceptDeclaration: boolean,
  ): Promise<TeacherStudentObservationZod>;
  deleteStudentObservation(id: string): Promise<void>;
  shareStudentObservation(
    id: string,
    update: TeacherInsightShareUpdate,
    actorId: string,
  ): Promise<TeacherStudentObservationZod>;
  revokeStudentObservationShare(id: string, actorId: string): Promise<TeacherStudentObservationZod>;
  promoteStudentObservation(
    id: string,
    promotion: TeacherInsightPromotion,
    actorId: string,
  ): Promise<{ success: true; recordedAt: string }>;
  getStudentPotential(
    studentId: string,
    classroomId: string,
  ): Promise<TeacherStudentPotentialZod | null>;
  upsertStudentPotential(input: TeacherStudentPotentialUpsert): Promise<TeacherStudentPotentialZod>;
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
  createPrivateNote: (input) => repository.createPrivateNote(input),
  deletePrivateNote: (id) => repository.deletePrivateNote(id),
  listStudentObservations: (classroomId) => repository.listStudentObservations(classroomId),
  listStudentObservationsForEnrollment: (classroomStudentId) =>
    repository.listStudentObservationsForEnrollment(classroomStudentId),
  listStudentObservationsForStudent: (studentId) =>
    repository.listStudentObservationsForStudent(studentId),
  createStudentObservation: (input) => repository.createStudentObservation(input),
  finalizeStudentObservation: (id, acceptDeclaration) =>
    repository.finalizeStudentObservation(id, acceptDeclaration),
  deleteStudentObservation: (id) => repository.deleteStudentObservation(id),
  shareStudentObservation: (id, update, actorId) =>
    repository.shareStudentObservation(id, update, actorId),
  revokeStudentObservationShare: (id, actorId) =>
    repository.revokeStudentObservationShare(id, actorId),
  promoteStudentObservation: (id, promotion, actorId) =>
    repository.promoteStudentObservation(id, promotion, actorId),
  getStudentPotential: (studentId, classroomId) =>
    repository.getStudentPotential(studentId, classroomId),
  upsertStudentPotential: (input) => repository.upsertStudentPotential(input),
  getInsightAuditTrail: (insightType, insightId) =>
    repository.getInsightAuditTrail(insightType, insightId),
  getInsightTimeline: (insightType, insightId) =>
    repository.getInsightTimeline(insightType, insightId),
});
