import { z } from 'zod';
import { ClassroomSchema, LessonSchema } from '@repo/core/logic/schemas/classroom.schema';
import {
  ClassroomNoteLifecycleEventSchema,
  ClassroomNoteSchema,
} from '@repo/core/logic/schemas/classroom-note.schema';
import type { SovereignContract } from '@repo/core/api/contracts';

const classroomAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Classroom' },
  }) as const;

const lessonAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Lesson' },
  }) as const;

const classroomNoteAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'ClassroomNote' },
  }) as const;

/**
 * Educational Port (Sovereign RPC)
 * Framework-agnostic definition of the Educational API.
 * Updated: Zod v4 + Hono alignment.
 * [LOUD-FAILURE] Methods must be explicitly mapped in the contract to be exposed via POA.
 */
export const educationalContract = {
  getByTeacher: {
    method: 'get',
    path: '/educational/classrooms/by-teacher',
    request: {
      query: z.strictObject({
        teacher_id: z.uuid(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomSchema),
        description: 'Retrieve classrooms by teacher',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getByStudent: {
    method: 'get',
    path: '/educational/classrooms/by-student',
    request: {
      query: z.strictObject({
        student_id: z.uuid(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomSchema),
        description: 'Retrieve classrooms by student',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getTeacherStats: {
    method: 'get',
    path: '/educational/classrooms/stats/teacher/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.strictObject({
          active_classes: z.number(),
          total_students: z.number(),
          average_pulse: z.number().optional(),
        }),
        description: 'Get statistics for a teacher',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getById: {
    method: 'get',
    path: '/educational/classrooms/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: ClassroomSchema,
        description: 'Retrieve a single classroom',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getClassroomResources: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/resources',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(z.any()), // Simplified for now to avoid schema drift
        description: 'Retrieve classroom resources',
      },
    },
    metadata: classroomAuthority('read'),
  },

  createLesson: {
    method: 'post',
    path: '/educational/lessons',
    request: {
      body: LessonSchema.omit({ id: true, created_at: true }),
    },
    responses: {
      201: {
        schema: LessonSchema,
        description: 'Lesson created successfully',
      },
    },
    metadata: lessonAuthority('create'),
  },

  // Classroom Notes
  getClassroomNotes: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/notes',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'Retrieve classroom notes',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },

  getClassroomNoteSnapshot: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/notes/snapshot',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
      query: z.strictObject({ view_date: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'Retrieve classroom notes snapshot',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },

  createClassroomNote: {
    method: 'post',
    path: '/educational/notes',
    request: {
      body: ClassroomNoteSchema.omit({ id: true, created_at: true, author_id: true }),
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
    path: '/educational/notes/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: ClassroomNoteSchema.pick({
        content: true,
        is_pinned: true,
        visibility: true,
      }).partial(),
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
    path: '/educational/notes/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
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
    path: '/educational/notes/:id/timeline',
    request: {
      params: z.strictObject({ id: z.uuid() }),
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
