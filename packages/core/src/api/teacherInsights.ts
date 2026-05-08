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
} from '../logic/schemas/teacher-insights.schema';
import { teacherInsights } from '../logic/managers/factory';

export const teacherInsightsAPI = {
  /**
   * @authority read TeacherInsight
   */
  async listPrivateNotes(
    teacherId: string,
    type?: TeacherPrivateNoteZod['type'],
  ): Promise<TeacherPrivateNoteZod[]> {
    return teacherInsights.listPrivateNotes(teacherId, type);
  },

  /**
   * @authority create TeacherInsight
   */
  async createPrivateNote(input: TeacherPrivateNoteCreate): Promise<TeacherPrivateNoteZod> {
    return teacherInsights.createPrivateNote(input);
  },

  /**
   * @authority delete TeacherInsight
   */
  async deletePrivateNote(id: string): Promise<{ success: true }> {
    await teacherInsights.deletePrivateNote(id);
    return { success: true };
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservations(classroomId: string): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservations(classroomId);
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservationsForEnrollment(
    classroomStudentId: string,
  ): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservationsForEnrollment(classroomStudentId);
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservationsForStudent(
    studentId: string,
  ): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservationsForStudent(studentId);
  },

  /**
   * @authority create TeacherInsight
   */
  async createStudentObservation(
    input: TeacherStudentObservationCreate,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.createStudentObservation(input);
  },

  /**
   * @authority update TeacherInsight
   */
  async finalizeStudentObservation(
    id: string,
    acceptDeclaration: boolean,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.finalizeStudentObservation(id, acceptDeclaration);
  },

  /**
   * @authority delete TeacherInsight
   */
  async deleteStudentObservation(id: string): Promise<{ success: true }> {
    await teacherInsights.deleteStudentObservation(id);
    return { success: true };
  },

  /**
   * @authority update TeacherInsight
   */
  async shareStudentObservation(
    id: string,
    update: TeacherInsightShareUpdate,
    actorId: string,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.shareStudentObservation(id, update, actorId);
  },

  /**
   * @authority update TeacherInsight
   */
  async revokeStudentObservationShare(
    id: string,
    actorId: string,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.revokeStudentObservationShare(id, actorId);
  },

  /**
   * @authority create TeacherInsightPromotion
   */
  async promoteStudentObservation(
    id: string,
    promotion: TeacherInsightPromotion,
    actorId: string,
  ): Promise<{ success: true; recordedAt: string }> {
    return teacherInsights.promoteStudentObservation(id, promotion, actorId);
  },

  /**
   * @authority read TeacherInsight
   */
  async getStudentPotential(
    studentId: string,
    classroomId: string,
  ): Promise<TeacherStudentPotentialZod | null> {
    return teacherInsights.getStudentPotential(studentId, classroomId);
  },

  /**
   * @authority update TeacherInsight
   */
  async upsertStudentPotential(
    input: TeacherStudentPotentialUpsert,
  ): Promise<TeacherStudentPotentialZod> {
    return teacherInsights.upsertStudentPotential(input);
  },

  /**
   * @authority read TeacherInsightAudit
   */
  async getInsightAuditTrail(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightAuditEvent[]> {
    return teacherInsights.getInsightAuditTrail(insightType, insightId);
  },

  /**
   * @authority read TeacherInsight
   */
  async getInsightTimeline(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightLifecycleEvent[]> {
    return teacherInsights.getInsightTimeline(insightType, insightId);
  },
};
