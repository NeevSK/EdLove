import { z } from 'zod';

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
    role: z.string(),
});

export const ClassroomNoteSchema = z.object({
    id: z.string().uuid(),
    classroom_id: z.string().uuid(),
    author_id: z.string().uuid(),
    content: z.string(),
    note_type: ClassroomNoteTypeSchema,
    visibility: ClassroomNoteVisibilitySchema,
    is_pinned: z.boolean().default(false),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    author: ClassroomNoteAuthorSchema.optional(),
});

export const ClassroomNoteCreateSchema = z.object({
    classroom_id: z.string().uuid(),
    content: z.string().min(1),
    note_type: ClassroomNoteTypeSchema,
    visibility: ClassroomNoteVisibilitySchema,
});

export const ClassroomNoteUpdateSchema = z.object({
    content: z.string().min(1).optional(),
    is_pinned: z.boolean().optional(),
    visibility: ClassroomNoteVisibilitySchema.optional(),
});

export const ClassroomNoteLifecycleEventSchema = z.object({
    id: z.string().uuid(),
    note_id: z.string().uuid(),
    classroom_id: z.string().uuid(),
    author_id: z.string().uuid(),
    event_type: z.enum(['create', 'update', 'delete']),
    note_type: ClassroomNoteTypeSchema,
    visibility: ClassroomNoteVisibilitySchema,
    is_pinned: z.boolean(),
    snapshot: z.record(z.string(), z.any()),
    occurred_at: z.string().datetime(),
    recorded_at: z.string().datetime(),
    effective_from: z.string().datetime().nullable().optional(),
    effective_to: z.string().datetime().nullable().optional(),
    recorded_by: z.string().uuid().nullable().optional(),
});

export type ClassroomNoteRecord = z.infer<typeof ClassroomNoteSchema>;
export type ClassroomNoteCreate = z.infer<typeof ClassroomNoteCreateSchema>;
export type ClassroomNoteUpdate = z.infer<typeof ClassroomNoteUpdateSchema>;
export type ClassroomNoteLifecycleEvent = z.infer<typeof ClassroomNoteLifecycleEventSchema>;
