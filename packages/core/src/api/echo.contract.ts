import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const echo = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  school_id: z.uuid(),
  student_id: z.uuid(),
  content: z.string(),
  is_anonymous: z.boolean(),
  is_read: z.boolean(),
  teacher_response: z.string().nullable(),
  responded_by: z.uuid().nullable(),
  responded_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  student_name: z.string().optional(),
  student_avatar: z.string().nullable().optional(),
});

const authority = (action: 'read' | 'create' | 'update') =>
  ({ policy: { action, subject: 'ClassroomEchoFeedback' } }) as const;

export const echoContract = {
  sendEcho: {
    method: 'post',
    path: '/echoes',
    request: {
      body: z.object({
        classroomId: z.uuid(),
        content: z.string().trim().min(1).max(5000),
        isAnonymous: z.boolean(),
      }),
    },
    responses: { 201: { schema: echo, description: 'Student echo submitted' } },
    metadata: authority('create'),
  },
  getMyEchoes: {
    method: 'get',
    path: '/echoes/mine',
    request: {},
    responses: { 200: { schema: z.array(echo), description: 'Current student echoes' } },
    metadata: authority('read'),
  },
  getEchoesByClassroom: {
    method: 'get',
    path: '/echoes/classrooms/:classroomId',
    request: { params: z.object({ classroomId: z.uuid() }) },
    responses: { 200: { schema: z.array(echo), description: 'Authorized classroom echoes' } },
    metadata: authority('read'),
  },
  getTeacherEchoes: {
    method: 'get',
    path: '/echoes/classrooms/:classroomId/teacher',
    request: { params: z.object({ classroomId: z.uuid() }) },
    responses: { 200: { schema: z.array(echo), description: 'Teacher classroom echoes' } },
    metadata: authority('read'),
  },
  respondToEcho: {
    method: 'patch',
    path: '/echoes/:echoId/response',
    request: {
      params: z.object({ echoId: z.uuid() }),
      body: z.object({ response: z.string().trim().min(1).max(5000) }),
    },
    responses: { 200: { schema: echo, description: 'Teacher response recorded' } },
    metadata: authority('update'),
  },
  markAsRead: {
    method: 'patch',
    path: '/echoes/:echoId/read',
    request: { params: z.object({ echoId: z.uuid() }) },
    responses: { 200: { schema: echo, description: 'Echo marked as read' } },
    metadata: authority('update'),
  },
} as const satisfies SovereignContract;

export type StudentEcho = z.infer<typeof echo>;
