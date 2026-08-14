import { z } from 'zod';

const principalNote = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  note_type: z.string(),
  is_pinned: z.boolean(),
  is_done: z.boolean(),
  context_teacher_id: z.string().uuid().nullable(),
  context_classroom_id: z.string().uuid().nullable(),
  target_date: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const principalNotesORPCContract = {
  getAll: {
    method: 'get',
    path: '/principal-notes',
    metadata: { policy: { action: 'read', subject: 'PrincipalNote' } },
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: z.array(principalNote), description: 'Principal notes' } },
  },
  getRecent: {
    method: 'get',
    path: '/principal-notes/recent',
    metadata: { policy: { action: 'read', subject: 'PrincipalNote' } },
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
        limit: z.number().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(principalNote), description: 'Recent unfinished principal notes' },
    },
  },
  create: {
    method: 'post',
    path: '/principal-notes',
    metadata: { policy: { action: 'create', subject: 'PrincipalNote' } },
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
    responses: { 201: { schema: principalNote, description: 'Created principal note' } },
  },
  update: {
    method: 'patch',
    path: '/principal-notes/:id',
    metadata: { policy: { action: 'update', subject: 'PrincipalNote' } },
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
    responses: { 200: { schema: principalNote, description: 'Updated principal note' } },
  },
  delete: {
    method: 'delete',
    path: '/principal-notes/:id',
    metadata: { policy: { action: 'delete', subject: 'PrincipalNote' } },
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Principal note deleted',
      },
    },
  },
};
