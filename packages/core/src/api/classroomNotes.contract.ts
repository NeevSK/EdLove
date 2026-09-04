import type { SovereignContract } from '@repo/core/api/contracts';
import {
  ClassroomNoteLifecycleEventSchema,
  ClassroomNoteSchema,
  ClassroomNoteTypeSchema,
  ClassroomNoteVisibilitySchema,
} from '@repo/core/logic/schemas/classroom-note.schema';
import { z } from 'zod';

const classroomNoteAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject = 'ClassroomNote',
) => ({ policy: { action, subject } }) as const;

export const classroomNotesContract = {
  listVisibleNotes: {
    method: 'get',
    path: '/classroom-notes',
    request: {
      query: z.object({ classroom_id: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'List visible notes',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },
  getVisibleNotesSnapshot: {
    method: 'get',
    path: '/classroom-notes/snapshot',
    request: {
      query: z.object({
        classroom_id: z.uuid(),
        view_date: z.string(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'Get visible notes snapshot',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },
  createClassroomNote: {
    method: 'post',
    path: '/classroom-notes',
    request: {
      body: z.object({
        classroom_id: z.uuid(),
        content: z.string().min(1),
        note_type: ClassroomNoteTypeSchema,
        visibility: ClassroomNoteVisibilitySchema,
      }),
    },
    responses: {
      201: {
        schema: ClassroomNoteSchema,
        description: 'Classroom note created successfully',
      },
    },
    metadata: classroomNoteAuthority('create'),
  },
  updateClassroomNote: {
    method: 'patch',
    path: '/classroom-notes/:id',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({
        content: z.string().optional(),
        is_pinned: z.boolean().optional(),
        visibility: ClassroomNoteVisibilitySchema.optional(),
      }),
    },
    responses: {
      200: {
        schema: ClassroomNoteSchema,
        description: 'Classroom note updated successfully',
      },
    },
    metadata: classroomNoteAuthority('update'),
  },
  deleteClassroomNote: {
    method: 'delete',
    path: '/classroom-notes/:id',
    request: {
      params: z.object({ id: z.uuid() }),
    },
    responses: {
      204: {
        schema: z.null(),
        description: 'Classroom note deleted successfully',
      },
    },
    metadata: classroomNoteAuthority('delete'),
  },
  getClassroomNoteTimeline: {
    method: 'get',
    path: '/classroom-notes/:id/timeline',
    request: {
      params: z.object({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteLifecycleEventSchema),
        description: 'Retrieve classroom note timeline',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },
} as const satisfies SovereignContract;
