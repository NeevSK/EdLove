import { z } from 'zod';

/**
 * MaterialSchema  A repository of knowledge.
 */
export const MaterialSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  lesson_id: z.string().uuid().nullable().optional(),
  title: z.string(),
  type: z.string(), // ResourceType
  url: z.string().url().nullable().optional(),
  content: z.string().nullable().optional(),
  is_pinned: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});

export type Material = z.infer<typeof MaterialSchema>;
