import { z } from 'zod';
import {
  ClassroomGradingSettingsSchema,
  StudentGradeSchema,
} from '../logic/schemas/grading.schema';
import type { SovereignContract } from './contract';

const gradingAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'grade' | 'publish' | 'override',
  subject: 'Grade',
) =>
  ({
    policy: { action, subject },
  }) as const;

/**
 * Grading Domain Port (Sovereign RPC)
 * Framework-agnostic definition of the Grading API.
 */
export const gradingContract = {
  getReportCard: {
    method: 'get',
    path: '/grades/report-card',
    request: {
      query: z.strictObject({
        studentId: z.uuid(),
      }),
    },
    responses: {
      200: { schema: z.array(StudentGradeSchema), description: 'Retrieve student grades' },
    },
    metadata: gradingAuthority('read', 'Grade'),
  },

  getClassroomGrades: {
    method: 'get',
    path: '/grades/classroom',
    request: {
      query: z.strictObject({
        classroomId: z.uuid(),
      }),
    },
    responses: {
      200: { schema: z.array(StudentGradeSchema), description: 'Retrieve classroom grades' },
    },
    metadata: gradingAuthority('read', 'Grade'),
  },

  submitGrade: {
    method: 'post',
    path: '/grades',
    request: {
      body: z.strictObject({
        studentId: z.uuid(),
        classroomId: z.uuid(),
        marks: z.number().min(0).max(100),
        assignmentId: z.uuid().optional(),
        feedback: z.string().optional(),
      }),
    },
    responses: {
      201: { schema: StudentGradeSchema, description: 'Grade submitted' },
    },
    metadata: gradingAuthority('grade', 'Grade'),
  },

  publishGrade: {
    method: 'post',
    path: '/grades/:id/publish',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: { schema: StudentGradeSchema, description: 'Grade published' },
    },
    metadata: gradingAuthority('publish', 'Grade'),
  },

  getGradingSettings: {
    method: 'get',
    path: '/grades/settings/:classroomId',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
    },
    responses: {
      200: { schema: ClassroomGradingSettingsSchema, description: 'Grading settings retrieved' },
    },
    metadata: gradingAuthority('read', 'Grade'),
  },
} as const satisfies SovereignContract;
