import type { ResourceType } from '@repo/core/types/Resource';

/**
 * Lesson Material
 *
 * Represents a study material linked to a classroom or a specific lesson.
 */
export interface LessonMaterial {
  id: string;
  classroom_id: string;
  lesson_id?: string;
  title: string;
  type: ResourceType;
  content?: string;
  url?: string;
  is_pinned: boolean;
  created_at: Date;
  updated_at?: Date;
}
