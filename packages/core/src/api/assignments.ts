import { educationalServices } from '../domains/educational/runtime';
import { educationalContract } from './educational.contract';
import type {
  Assignment as AssignmentRecord,
  StudentAssignment,
  StudentSubmissionSummary,
} from './schemas/classroom.schema';
import type { Assignment } from './types';

export const assignmentsAPI = {
  /**
   * @authority read Assignment
   */
  async getAll(classroomId: string): Promise<Assignment[]> {
    return (await educationalServices.assignments.getAll(classroomId)) as unknown as Assignment[];
  },

  /**
   * @authority read Assignment
   */
  async getByLesson(lessonId: string): Promise<Assignment[]> {
    return (await educationalServices.assignments.getByLesson(lessonId)) as unknown as Assignment[];
  },

  /**
   * @authority read Assignment
   */
  async getUpcomingForStudent(studentId: string): Promise<StudentAssignment[]> {
    return educationalServices.assignments.getUpcomingForStudent(studentId);
  },

  /**
   * @authority read AssignmentSubmission
   */
  async getSubmissionHistoryForStudent(
    studentId: string,
    classroomId?: string,
  ): Promise<StudentSubmissionSummary[]> {
    return educationalServices.assignments.getSubmissionHistory(studentId, classroomId);
  },

  /**
   * @authority create AssignmentSubmission
   */
  async submitSubmission(assignmentId: string, content?: string, photoUrl?: string | null) {
    return educationalServices.assignments.submitSubmission(assignmentId, content, photoUrl);
  },

  /**
   * @authority create Assignment
   */
  async create(
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Assignment> {
    return (await educationalServices.assignments.create(
      assignment as Omit<AssignmentRecord, 'id' | 'created_at' | 'updated_at'>,
    )) as unknown as Assignment;
  },

  /**
   * @authority update Assignment
   */
  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    return (await educationalServices.assignments.update(
      id,
      updates as Partial<AssignmentRecord>,
    )) as unknown as Assignment;
  },

  /**
   * @authority delete Assignment
   */
  async delete(id: string): Promise<void> {
    return educationalServices.assignments.delete(id);
  },
};

// Satisfy linter for architectural linking
void educationalContract;
