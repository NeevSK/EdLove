import { teacherInsightsContract } from './teacherInsights.contract';
import { teacherInsightsServices } from '../domains/teacherInsights/runtime';
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
} from './schemas/teacher-insights.schema';

export const teacherInsightsAPI = {
  /**
   * @authority read TeacherInsight
   */
  async listPrivateNotes(teacherId: string, type?: TeacherPrivateNoteZod['type']): Promise<TeacherPrivateNoteZod[]> {
    return teacherInsightsServices.listPrivateNotes(teacherId, type);
  },

  /**
   * @authority create TeacherInsight
   */
  async createPrivateNote(input: TeacherPrivateNoteCreate): Promise<TeacherPrivateNoteZod> {
    return teacherInsightsServices.createPrivateNote(input);
  },

  /**
   * @authority delete TeacherInsight
   */
  async deletePrivateNote(id: string): Promise<{ success: true }> {
    await teacherInsightsServices.deletePrivateNote(id);
    return { success: true };
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservations(classroomId: string): Promise<TeacherStudentObservationZod[]> {
    return teacherInsightsServices.listStudentObservations(classroomId);
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservationsForEnrollment(classroomStudentId: string): Promise<TeacherStudentObservationZod[]> {
    return teacherInsightsServices.listStudentObservationsForEnrollment(classroomStudentId);
  },

  /**
   * @authority read TeacherInsight
   */
  async listStudentObservationsForStudent(studentId: string): Promise<TeacherStudentObservationZod[]> {
    return teacherInsightsServices.listStudentObservationsForStudent(studentId);
  },

  /**
   * @authority create TeacherInsight
   */
  async createStudentObservation(input: TeacherStudentObservationCreate): Promise<TeacherStudentObservationZod> {
    return teacherInsightsServices.createStudentObservation(input);
  },

  /**
   * @authority update TeacherInsight
   */
  async finalizeStudentObservation(id: string, acceptDeclaration: boolean): Promise<TeacherStudentObservationZod> {
    return teacherInsightsServices.finalizeStudentObservation(id, acceptDeclaration);
  },

  /**
   * @authority delete TeacherInsight
   */
  async deleteStudentObservation(id: string): Promise<{ success: true }> {
    await teacherInsightsServices.deleteStudentObservation(id);
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
    return teacherInsightsServices.shareStudentObservation(id, update, actorId);
  },

  /**
   * @authority update TeacherInsight
   */
  async revokeStudentObservationShare(id: string, actorId: string): Promise<TeacherStudentObservationZod> {
    return teacherInsightsServices.revokeStudentObservationShare(id, actorId);
  },

  /**
   * @authority create TeacherInsightPromotion
   */
  async promoteStudentObservation(
    id: string,
    promotion: TeacherInsightPromotion,
    actorId: string,
  ): Promise<{ success: true; recordedAt: string }> {
    return teacherInsightsServices.promoteStudentObservation(id, promotion, actorId);
  },

  /**
   * @authority read TeacherInsight
   */
  async getStudentPotential(studentId: string, classroomId: string): Promise<TeacherStudentPotentialZod | null> {
    return teacherInsightsServices.getStudentPotential(studentId, classroomId);
  },

  /**
   * @authority update TeacherInsight
   */
  async upsertStudentPotential(input: TeacherStudentPotentialUpsert): Promise<TeacherStudentPotentialZod> {
    return teacherInsightsServices.upsertStudentPotential(input);
  },

  /**
   * @authority read TeacherInsightAudit
   */
  async getInsightAuditTrail(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightAuditEvent[]> {
    return teacherInsightsServices.getInsightAuditTrail(insightType, insightId);
  },

  /**
   * @authority read TeacherInsight
   */
  async getInsightTimeline(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightLifecycleEvent[]> {
    return teacherInsightsServices.getInsightTimeline(insightType, insightId);
  },
};

void teacherInsightsContract;
