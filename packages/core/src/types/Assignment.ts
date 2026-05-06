export interface Assignment {
  id: string;
  classroom_id: string;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  due_date?: Date | null;
  max_points?: number | null;
  classroom?: string | null;
  submitted?: boolean;
  created_at: Date;
  updated_at: Date;
}
