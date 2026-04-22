export interface Assignment {
  id: string;
  classroom_id: string;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  max_points?: number | null;
  classroom?: string | null;
  submitted?: boolean;
  created_at: string;
  updated_at: string;
}
