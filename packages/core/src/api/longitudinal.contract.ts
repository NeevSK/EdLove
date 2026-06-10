import { z } from 'zod';
import {
  LongitudinalEntityTypeSchema,
  StudentLongitudinalSnapshotSchema,
  StudentLongitudinalTimelineSchema,
} from '../logic/schemas/temporal.schema';
import type { SovereignContract } from './contract';

const longitudinalAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject = 'Student',
) => ({ policy: { action, subject } }) as const;

export const longitudinalContract = {
  getStudentTimeline: {
    method: 'get',
    path: '/longitudinal/student/timeline',
    request: {
      query: z.object({
        studentId: z.uuid(),
        viewDate: z.string(),
        entityTypes: z.array(LongitudinalEntityTypeSchema).optional(),
      }),
    },
    responses: {
      200: {
        schema: StudentLongitudinalTimelineSchema,
        description: 'Retrieve a longitudinal event timeline for a student as of a view date',
      },
    },
    metadata: longitudinalAuthority('read'),
  },
  getStudentSnapshotAsOf: {
    method: 'get',
    path: '/longitudinal/student/snapshot',
    request: {
      query: z.object({
        studentId: z.uuid(),
        viewDate: z.string(),
        entityTypes: z.array(LongitudinalEntityTypeSchema).optional(),
      }),
    },
    responses: {
      200: {
        schema: StudentLongitudinalSnapshotSchema,
        description:
          'Retrieve the latest effective longitudinal records for a student as of a view date',
      },
    },
    metadata: longitudinalAuthority('read'),
  },
} as const satisfies SovereignContract;
