export interface TeacherNote {
  id: string;
  teacher_id: string;
  content: string;
  type: 'venting' | 'reflection' | 'note';
  created_at: string;
  updated_at: string;
}
