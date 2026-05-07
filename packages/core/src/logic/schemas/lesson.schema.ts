import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * LessonSchema - A structured step in the learning arc.
 * Derived from ZenStack Lesson model.
 */
export const LessonSchema = makeModelSchema('Lesson');

export type Lesson = z.infer<typeof LessonSchema>;
