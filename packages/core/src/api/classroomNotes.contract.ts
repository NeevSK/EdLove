import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  ClassroomNoteLifecycleEventSchema,
  ClassroomNoteSchema,
  ClassroomNoteTypeSchema,
  ClassroomNoteVisibilitySchema,
} from '../logic/schemas/classroom-note.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const classroomNoteAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject = 'ClassroomNote',
) => POAMetadataSchema.parse({ policy: { action, subject } });

export const classroomNotesContract = c.router({
  listVisibleNotes: {
    method: 'GET',
    path: '/classroom-notes',
    query: z.object({ classroom_id: z.uuid() }),
    responses: {
      200: z.array(ClassroomNoteSchema),
    },
    metadata: classroomNoteAuthority('read'),
  },
  getVisibleNotesSnapshot: {
    method: 'GET',
    path: '/classroom-notes/snapshot',
    query: z.object({
      classroom_id: z.uuid(),
      view_date: z.iso.datetime(),
    }),
    responses: {
      200: z.array(ClassroomNoteSchema),
    },
    metadata: classroomNoteAuthority('read'),
  },
  createClassroomNote: {
    method: 'POST',
    path: '/classroom-notes',
    body: z.object({
      classroom_id: z.uuid(),
      content: z.string().min(1),
      note_type: ClassroomNoteTypeSchema,
      visibility: ClassroomNoteVisibilitySchema,
    }),
    responses: {
      201: ClassroomNoteSchema,
    },
    metadata: classroomNoteAuthority('create'),
  },
  updateClassroomNote: {
    method: 'PATCH',
    path: '/classroom-notes/:id',
    body: z.object({
      content: z.string().optional(),
      is_pinned: z.boolean().optional(),
      visibility: ClassroomNoteVisibilitySchema.optional(),
    }),
    responses: {
      200: ClassroomNoteSchema,
    },
    metadata: classroomNoteAuthority('update'),
  },
  deleteClassroomNote: {
    method: 'DELETE',
    path: '/classroom-notes/:id',
    responses: {
      204: z.void(),
    },
    metadata: classroomNoteAuthority('delete'),
  },
  getClassroomNoteTimeline: {
    method: 'GET',
    path: '/classroom-notes/:id/timeline',
    responses: {
      200: z.array(ClassroomNoteLifecycleEventSchema),
    },
    metadata: classroomNoteAuthority('read'),
  },
});
