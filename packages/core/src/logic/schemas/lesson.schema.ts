import { z } from 'zod';

/**
 * LessonSchema  A structured step in the learning arc.
 */
export const LessonSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable().optional(),
  order_index: z.number().int().nonnegative(),
  published_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export type Lesson = z.infer<typeof LessonSchema>;
