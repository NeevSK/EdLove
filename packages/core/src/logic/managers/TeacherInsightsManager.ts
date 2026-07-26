import type { TeacherInsightsRepository } from '@/logic/domains/teacherInsights/ports';
import type {
  TeacherInsightPromotion,
  TeacherInsightShareUpdate,
  TeacherInsightTargetType,
  TeacherPrivateNoteCreate,
  TeacherPrivateNoteZod,
  TeacherStudentObservationCreate,
  TeacherStudentPotentialUpsert,
} from '@/logic/schemas/teacher-insights.schema';

/**
 * TeacherInsightsManager
 *
 * Orchestrates pedagogical insights, observations, and student potential tracking.
 */
export class TeacherInsightsManager {
  constructor(private repo: TeacherInsightsRepository) {}

  async listPrivateNotes(teacherId: string, type?: TeacherPrivateNoteZod['type']) {
    return this.repo.listPrivateNotes(teacherId, type);
  }

  async createPrivateNote(input: TeacherPrivateNoteCreate) {
    return this.repo.createPrivateNote(input);
  }

  async deletePrivateNote(id: string) {
    return this.repo.deletePrivateNote(id);
  }

  async listStudentObservations(classroomId: string) {
    return this.repo.listStudentObservations(classroomId);
  }

  async listStudentObservationsForEnrollment(classroomStudentId: string) {
    return this.repo.listStudentObservationsForEnrollment(classroomStudentId);
  }

  async listStudentObservationsForStudent(studentId: string) {
    return this.repo.listStudentObservationsForStudent(studentId);
  }

  async createStudentObservation(input: TeacherStudentObservationCreate) {
    return this.repo.createStudentObservation(input);
  }

  async finalizeStudentObservation(id: string, acceptDeclaration: boolean) {
    return this.repo.finalizeStudentObservation(id, acceptDeclaration);
  }

  async deleteStudentObservation(id: string) {
    return this.repo.deleteStudentObservation(id);
  }

  async shareStudentObservation(id: string, update: TeacherInsightShareUpdate, actorId: string) {
    return this.repo.shareStudentObservation(id, update, actorId);
  }

  async revokeStudentObservationShare(id: string, actorId: string) {
    return this.repo.revokeStudentObservationShare(id, actorId);
  }

  async promoteStudentObservation(id: string, promotion: TeacherInsightPromotion, actorId: string) {
    return this.repo.promoteStudentObservation(id, promotion, actorId);
  }

  async getStudentPotential(studentId: string, classroomId: string) {
    return this.repo.getStudentPotential(studentId, classroomId);
  }

  async upsertStudentPotential(input: TeacherStudentPotentialUpsert) {
    return this.repo.upsertStudentPotential(input);
  }

  async getInsightAuditTrail(insightType: TeacherInsightTargetType, insightId: string) {
    return this.repo.getInsightAuditTrail(insightType, insightId);
  }

  async getInsightTimeline(insightType: TeacherInsightTargetType, insightId: string) {
    return this.repo.getInsightTimeline(insightType, insightId);
  }
}
