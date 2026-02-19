export interface StudentGrade {
  id: string;
  student_id: string;
  classroom_id: string;
  assignment_id?: string;
  marks: number;
  grade: string;
  gpa: number;
  feedback?: string;
  rank?: number;
  graded_at: string;
}

export interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
}
