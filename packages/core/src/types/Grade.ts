export interface StudentGrade {
  id: string;
  student_id: string;
  classroom_id: string;
  assignment_id?: string | null;
  marks: number;
  grade: string;
  gpa: number;
  feedback?: string | null;
  rank?: number | null;
  created_at: Date;
  updated_at: Date;
  graded_by: string;
  graded_at: Date;
  publication_state?: 'draft' | 'published';
  published_at?: Date | null;
  published_by?: string | null;
  publication_action?: string | null;
}

export interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
}
