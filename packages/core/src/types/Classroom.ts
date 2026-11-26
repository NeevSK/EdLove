export interface Classroom {
  id: string;
  school_id?: string | null;
  grade_id?: string | null;
  teacher_id?: string | null;
  section_id?: string | null;
  name: string;
  handle?: string | null;
  subject?: string | null;
  description?: string | null;
  color_theme?: string | null;
  syllabus_version?: string | null;
  is_archived: boolean;
  /** Academic year label, e.g. '2026'. Set automatically on creation; used for year-end rollover and historical queries. */
  academic_year?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ClassroomStudent {
  id: string;
  classroom_id: string;
  student_id: string;
  status: 'active' | 'left' | 'suspended';
  joined_at: string;
}
