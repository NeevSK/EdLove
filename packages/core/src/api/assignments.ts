import type {
  Assignment as AssignmentRecord,
  StudentAssignment,
  StudentSubmissionSummary,
} from '../logic/schemas/classroom.schema';
import { educationalServices } from '../native/runtimes/educational.runtime';
import { supabase } from '../native/supabase';
import type { Assignment } from '../types';
import { educationalContract } from './educational.contract';

type RecentGradeOverviewRow = {
  id: string;
  grade: number;
  feedback: string | null;
  submitted_at: string;
  assignments: { title: string } | null;
  classrooms: { name: string } | null;
};

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
   * Convenience query used by UI surfaces (keeps Supabase usage out of feature packages).
   *
   * @authority read AssignmentSubmission
   */
  async getRecentGradesOverviewForStudent(
    studentId: string,
    limit = 4,
  ): Promise<RecentGradeOverviewRow[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, grade, feedback, submitted_at, assignments(title), classrooms(name)')
      .eq('student_id', studentId)
      .not('grade', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data as RecentGradeOverviewRow[] | null) ?? []).filter(
      (row) => typeof row.grade === 'number',
    );
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
