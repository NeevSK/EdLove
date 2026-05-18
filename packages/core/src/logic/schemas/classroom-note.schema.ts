import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

export const ClassroomNoteTypeSchema = z.enum([
  'note',
  'announcement',
  'lesson_recap',
  'reminder',
  'personal',
]);

export const ClassroomNoteVisibilitySchema = z.enum(['private', 'class']);

export const ClassroomNoteAuthorSchema = z.object({
  full_name: z.string(),
  capacity: z.string(),
});

/**
 * ClassroomNoteSchema - A pulse of communication in the classroom.
 * Derived from ZenStack ClassroomNote model.
 */
export const ClassroomNoteSchema = makeModelSchema('ClassroomNote').extend({
  note_type: ClassroomNoteTypeSchema,
  visibility: ClassroomNoteVisibilitySchema,
  author: ClassroomNoteAuthorSchema.optional(),
});

export const ClassroomNoteCreateSchema = ClassroomNoteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  author: true,
});

export const ClassroomNoteUpdateSchema = ClassroomNoteSchema.partial().omit({
  id: true,
  classroom_id: true,
  author_id: true,
  created_at: true,
  updated_at: true,
  author: true,
});

/**
 * ClassroomNoteLifecycleEventSchema - Non-repudiable audit log for notes.
 * Derived from ZenStack StudentLongitudinalEvent model (as a snapshot).
 */
export const ClassroomNoteLifecycleEventSchema = makeModelSchema('StudentLongitudinalEvent').extend({
  note_type: ClassroomNoteTypeSchema,
  visibility: ClassroomNoteVisibilitySchema,
});

export type ClassroomNoteRecord = z.infer<typeof ClassroomNoteSchema>;
export type ClassroomNoteCreate = z.infer<typeof ClassroomNoteCreateSchema>;
export type ClassroomNoteUpdate = z.infer<typeof ClassroomNoteUpdateSchema>;
export type ClassroomNoteLifecycleEvent = z.infer<typeof ClassroomNoteLifecycleEventSchema>;
