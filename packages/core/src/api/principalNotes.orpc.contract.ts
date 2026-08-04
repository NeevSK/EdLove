import { z } from 'zod';

export const principalNotesORPCContract = {
  getAll: {
    method: 'get',
    path: '/principal-notes',
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
      }),
    },
  },
  getRecent: {
    method: 'get',
    path: '/principal-notes/recent',
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
        limit: z.number().optional(),
      }),
    },
  },
  create: {
    method: 'post',
    path: '/principal-notes',
    request: {
      body: z.object({
        schoolId: z.string().uuid(),
        content: z.string(),
        noteType: z.string(),
        contextTeacherId: z.string().uuid().optional().nullable(),
        contextClassroomId: z.string().uuid().optional().nullable(),
        targetDate: z.string().optional().nullable(),
      }),
    },
  },
  update: {
    method: 'patch',
    path: '/principal-notes/:id',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        content: z.string().optional(),
        isPinned: z.boolean().optional(),
        isDone: z.boolean().optional(),
      }),
    },
  },
  delete: {
    method: 'delete',
    path: '/principal-notes/:id',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
  },
};
