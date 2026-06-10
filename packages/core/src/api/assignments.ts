import { educational } from '../logic/managers/factory';
import type {
  StudentAssignment,
  StudentSubmissionSummary,
} from '../logic/schemas/classroom.schema';
import type { Assignment } from '../types';

export const assignmentsAPI = {
  /**
   * @policy read Assignment
   */
  async getAll(classroomId: string): Promise<Assignment[]> {
    return educational.assignments.getAll(classroomId) as unknown as Assignment[];
  },

  /**
   * @policy read Assignment
   */
  async getByLesson(lessonId: string): Promise<Assignment[]> {
    return educational.assignments.getByLesson(lessonId) as unknown as Assignment[];
  },

  /**
   * @policy read Assignment
   */
  async getUpcomingForStudent(studentId: string): Promise<StudentAssignment[]> {
    return educational.assignments.getUpcomingForStudent(studentId);
  },

  /**
   * @policy read AssignmentSubmission
   */
  async getSubmissionHistoryForStudent(
    studentId: string,
    classroomId?: string,
  ): Promise<StudentSubmissionSummary[]> {
    return educational.assignments.getSubmissionHistory(studentId, classroomId);
  },

  /**
   * @policy read AssignmentSubmission
   */
  async getRecentGradesOverviewForStudent(studentId: string, limit = 4) {
    return educational.assignments.getRecentGradesOverviewForStudent(studentId, limit);
  },

  /**
   * @policy create AssignmentSubmission
   */
  async submitSubmission(assignmentId: string, content?: string, photoUrl?: string | null) {
    return educational.assignments.submitSubmission(assignmentId, content, photoUrl);
  },

  /**
   * @policy create Assignment
   */
  async create(
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Assignment> {
    return educational.assignments.create(assignment as any) as unknown as Assignment;
  },

  /**
   * @policy update Assignment
   */
  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    return educational.assignments.update(id, updates as any) as unknown as Assignment;
  },

  /**
   * @policy delete Assignment
   */
  async delete(id: string): Promise<void> {
    return educational.assignments.delete(id);
  },
};
