import { z } from 'zod';
import {
  AttendanceSchema,
  ClassroomSchema,
  StudentGradeSchema,
  StudentSchema,
  UserSchema,
} from '../schemas';

/**
 * Event Schemas for Gurudevi National OS.
 * This is the Sovereign Brain of our Inngest implementation.
 * It is PLATFORM AGNOSTIC and holds only the shape of the data.
 */
export const schemas = {
  /**
   * User related events
   */
  'user/created': {
    data: UserSchema,
  },
  'user/updated': {
    data: UserSchema,
  },

  /**
   * Classroom and academic events
   */
  'school/classroom.created': {
    data: ClassroomSchema,
  },
  'school/attendance.recorded': {
    data: AttendanceSchema,
  },
  'school/grade.published': {
    data: StudentGradeSchema,
  },

  /**
   * Well-being and student lifecycle
   */
  'student/onboarded': {
    data: StudentSchema,
  },
  'wellbeing/mood.logged': {
    data: z.object({
      studentId: z.string().uuid(),
      mood: z.enum(['happy', 'neutral', 'sad']),
      timestamp: z.string().datetime(),
    }),
  },

  /**
   * System events
   */
  'system/audit.log': {
    data: z.object({
      action: z.string(),
      actorId: z.string().uuid(),
      metadata: z.record(z.string(), z.any()).optional(),
    }),
  },
} as const;

/**
 * Helper type for event payloads
 */
export type GurudeviEvents = typeof schemas;
