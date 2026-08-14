import type { SovereignContract } from '@repo/core/api/contracts';
import {
  TeacherStudentPotentialSchema,
  TeacherStudentPotentialUpsertSchema,
} from '@repo/core/logic/schemas/teacher-insights.schema';
import { z } from 'zod';

export const studentPotentialContract = {
  getForClassroom: {
    method: 'get',
    path: '/student-potential/students/:studentId/classrooms/:classroomId',
    request: {
      params: z.object({
        studentId: z.string().uuid(),
        classroomId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        schema: TeacherStudentPotentialSchema.nullable(),
        description: 'Get the current teacher analysis for a student in a classroom',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Student' } },
  },
  listForStudent: {
    method: 'get',
    path: '/student-potential/students/:studentId',
    request: {
      params: z.object({ studentId: z.string().uuid() }),
    },
    responses: {
      200: {
        schema: z.array(TeacherStudentPotentialSchema),
        description: 'List visible potential analyses for a student',
      },
    },
    metadata: { policy: { action: 'read', subject: 'Student' } },
  },
  upsert: {
    method: 'put',
    path: '/student-potential/students/:studentId',
    request: {
      params: z.object({ studentId: z.string().uuid() }),
      body: TeacherStudentPotentialUpsertSchema,
    },
    responses: {
      200: {
        schema: TeacherStudentPotentialSchema,
        description: 'Create or update a teacher student-potential analysis',
      },
    },
    metadata: { policy: { action: 'update', subject: 'Student' } },
  },
} as const satisfies SovereignContract;
