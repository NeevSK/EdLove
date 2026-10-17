/**
 * Hexagonal Academic Port
 *
 * Grounded in monorepo substrate contracts:
 * - @repo/core/logic/schemas/classroom.schema: Assignment, AssignmentSubmission, StudentSubmissionSummary
 * - @repo/core/logic/schemas/grading.schema: Grade
 */

export interface AssignmentQuest {
  id: string;
  classroom_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
  rubric?: { maxMarks: number; passingMarks: number };
  status: 'draft' | 'published' | 'archived';
}

export interface AssignmentSubmissionItem {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string | null;
  photo_url?: string | null;
  submitted_at: string;
}

export interface SubmitAssignmentInput {
  assignmentId: string;
  studentId: string;
  studentName?: string;
  content?: string;
  photoUrl?: string;
}

export interface GradeSubmissionInput {
  submissionId: string;
  studentId: string;
  classroomId: string;
  assignmentId?: string;
  marks: number;
  letterGrade: string;
  feedback?: string;
  gradedBy?: string;
}

export interface StudentGradeResult {
  id: string;
  student_id: string;
  classroom_id: string;
  assignment_id?: string;
  marks: number;
  grade: string;
  gpa: number;
  feedback?: string;
  graded_by: string;
  publication_state: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface AcademicSubmissionView {
  id: string;
  assignment_id: string;
  classroom_id: string;
  student_id: string;
  assignment_title: string;
  classroom?: string | null;
  due_date?: string | null;
  submitted_at: string;
  content?: string | null;
  photo_url?: string | null;
  grade?: string;
  marks?: number;
  feedback?: string;
  status: 'pending_review' | 'graded' | 'resubmit';
}

/** Inbound Port Driving the Submissions Floor UI */
export interface IAcademicPort {
  getAssignments(classroomId?: string): Promise<AssignmentQuest[]>;
  getSubmissions(studentId?: string): Promise<AcademicSubmissionView[]>;
  submitAssignment(
    input: SubmitAssignmentInput,
  ): Promise<{ submission: AssignmentSubmissionItem; status: 'synced' | 'queued_offline' }>;
  gradeSubmission(
    input: GradeSubmissionInput,
  ): Promise<{ grade: StudentGradeResult; status: 'synced' | 'queued_offline' }>;
}

/** Outbound Port for Durable Storage Persistence */
export interface IAcademicStoragePort {
  loadCachedAssignments(): AssignmentQuest[] | null;
  saveCachedAssignments(assignments: AssignmentQuest[]): void;
  loadCachedSubmissions(): AcademicSubmissionView[];
  saveCachedSubmissions(submissions: AcademicSubmissionView[]): void;
}
