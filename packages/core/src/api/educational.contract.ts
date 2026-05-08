import { z } from 'zod';
import {
  AssignmentSchema,
  ClassroomSchema,
  LessonSchema,
} from '../logic/schemas/classroom.schema';
import { type SovereignContract } from './contract';

const classroomAuthority = (action: 'create' | 'read' | 'update' | 'delete') => ({
  authority: { action, subject: 'Classroom' }
});

const lessonAuthority = (action: 'create' | 'read' | 'update' | 'delete') => ({
  authority: { action, subject: 'Lesson' }
});

/**
 * Educational Port (Pure Port)
 * Framework-agnostic definition of the Educational API.
 */
export const educationalContract: SovereignContract = {
  getByTeacher: {
    method: 'get',
    path: '/educational/classrooms/by-teacher',
    request: {
      query: z.object({
        teacher_id: z.string(),
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
  getById: {
    method: 'get',
    path: '/educational/classrooms/{id}',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        schema: ClassroomSchema,
        description: 'Retrieve a single classroom',
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
} as const;
