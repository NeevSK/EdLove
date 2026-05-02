export interface Lesson {
  id: string;
  classroom_id: string;
  title: string;
  content?: string;
  order_index: number;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}
