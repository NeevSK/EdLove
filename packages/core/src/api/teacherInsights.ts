import { teacherInsights } from '@repo/core/logic/managers/factory';
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

export const teacherInsightsAPI = {
  /**
   * @policy read TeacherInsight
   */
  async listPrivateNotes(
    teacherId: string,
    type?: TeacherPrivateNoteZod['type'],
  ): Promise<TeacherPrivateNoteZod[]> {
    return teacherInsights.listPrivateNotes(teacherId, type);
  },

  /**
   * @policy create TeacherInsight
   */
  async createPrivateNote(input: TeacherPrivateNoteCreate): Promise<TeacherPrivateNoteZod> {
    return teacherInsights.createPrivateNote(input);
  },

  /**
   * @policy delete TeacherInsight
   */
  async deletePrivateNote(id: string): Promise<{ success: true }> {
    await teacherInsights.deletePrivateNote(id);
    return { success: true };
  },

  /**
   * @policy read TeacherInsight
   */
  async listStudentObservations(classroomId: string): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservations(classroomId);
  },

  /**
   * @policy read TeacherInsight
   */
  async listStudentObservationsForEnrollment(
    classroomStudentId: string,
  ): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservationsForEnrollment(classroomStudentId);
  },

  /**
   * @policy read TeacherInsight
   */
  async listStudentObservationsForStudent(
    studentId: string,
  ): Promise<TeacherStudentObservationZod[]> {
    return teacherInsights.listStudentObservationsForStudent(studentId);
  },

  /**
   * @policy create TeacherInsight
   */
  async createStudentObservation(
    input: TeacherStudentObservationCreate,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.createStudentObservation(input);
  },

  /**
   * @policy update TeacherInsight
   */
  async finalizeStudentObservation(
    id: string,
    acceptDeclaration: boolean,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.finalizeStudentObservation(id, acceptDeclaration);
  },

  /**
   * @policy delete TeacherInsight
   */
  async deleteStudentObservation(id: string): Promise<{ success: true }> {
    await teacherInsights.deleteStudentObservation(id);
    return { success: true };
  },

  /**
   * @policy update TeacherInsight
   */
  async shareStudentObservation(
    id: string,
    update: TeacherInsightShareUpdate,
    actorId: string,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.shareStudentObservation(id, update, actorId);
  },

  /**
   * @policy update TeacherInsight
   */
  async revokeStudentObservationShare(
    id: string,
    actorId: string,
  ): Promise<TeacherStudentObservationZod> {
    return teacherInsights.revokeStudentObservationShare(id, actorId);
  },

  /**
   * @policy create TeacherInsightPromotion
   */
  async promoteStudentObservation(
    id: string,
    promotion: TeacherInsightPromotion,
    actorId: string,
  ): Promise<{ success: true; recordedAt: string }> {
    return teacherInsights.promoteStudentObservation(id, promotion, actorId);
  },

  /**
   * @policy read TeacherInsight
   */
  async getStudentPotential(
    studentId: string,
    classroomId: string,
  ): Promise<TeacherStudentPotentialZod | null> {
    return teacherInsights.getStudentPotential(studentId, classroomId);
  },

  /**
   * @policy update TeacherInsight
   */
  async upsertStudentPotential(
    input: TeacherStudentPotentialUpsert,
  ): Promise<TeacherStudentPotentialZod> {
    return teacherInsights.upsertStudentPotential(input);
  },

  /**
   * @policy read TeacherInsightAudit
   */
  async getInsightAuditTrail(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightAuditEvent[]> {
    return teacherInsights.getInsightAuditTrail(insightType, insightId);
  },

  /**
   * @policy read TeacherInsight
   */
  async getInsightTimeline(
    insightType: TeacherInsightTargetType,
    insightId: string,
  ): Promise<TeacherInsightLifecycleEvent[]> {
    return teacherInsights.getInsightTimeline(insightType, insightId);
  },
};

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_STUDENT_OBSERVATIONS } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'teacherInsights',
  ghostMethods: [
    'listStudentObservations',
    'listStudentObservationsForEnrollment',
    'listStudentObservationsForStudent',
  ],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_STUDENT_OBSERVATIONS,
});
