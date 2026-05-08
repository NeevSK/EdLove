import type {
  StudentAssignment,
  StudentSubmissionSummary,
} from '../logic/schemas/classroom.schema';
import { educational } from '../logic/managers/factory';
import type { Assignment } from '../types';

export const assignmentsAPI = {
  /**
   * @authority read Assignment
   */
  async getAll(classroomId: string): Promise<Assignment[]> {
    return educational.assignments.getAll(classroomId) as unknown as Assignment[];
  },

  /**
   * @authority read Assignment
   */
  async getByLesson(lessonId: string): Promise<Assignment[]> {
    return educational.assignments.getByLesson(lessonId) as unknown as Assignment[];
  },

  /**
   * @authority read Assignment
   */
  async getUpcomingForStudent(studentId: string): Promise<StudentAssignment[]> {
    return educational.assignments.getUpcomingForStudent(studentId);
  },

  /**
   * @authority read AssignmentSubmission
   */
  async getSubmissionHistoryForStudent(
    studentId: string,
    classroomId?: string,
  ): Promise<StudentSubmissionSummary[]> {
    return educational.assignments.getSubmissionHistory(studentId, classroomId);
  },

  /**
   * @authority read AssignmentSubmission
   */
  async getRecentGradesOverviewForStudent(
    studentId: string,
    limit = 4,
  ) {
    return educational.assignments.getRecentGradesOverviewForStudent(studentId, limit);
  },

  /**
   * @authority create AssignmentSubmission
   */
  async submitSubmission(assignmentId: string, content?: string, photoUrl?: string | null) {
    return educational.assignments.submitSubmission(assignmentId, content, photoUrl);
  },

  /**
   * @authority create Assignment
   */
  async create(
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Assignment> {
    return educational.assignments.create(assignment) as unknown as Assignment;
  },

  /**
   * @authority update Assignment
   */
  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    return educational.assignments.update(id, updates) as unknown as Assignment;
  },

  /**
   * @authority delete Assignment
   */
  async delete(id: string): Promise<void> {
    return educational.assignments.delete(id);
  },
};
