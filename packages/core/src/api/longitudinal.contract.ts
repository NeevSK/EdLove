import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  LongitudinalEntityTypeSchema,
  StudentLongitudinalSnapshotSchema,
  StudentLongitudinalTimelineSchema,
} from '../logic/schemas/temporal.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

export const longitudinalContract = c.router({
  getStudentTimeline: {
    method: 'GET',
    path: '/longitudinal/student/timeline',
    responses: {
      200: StudentLongitudinalTimelineSchema,
    },
    query: z.object({
      studentId: z.uuid(),
      viewDate: z.string(),
      entityTypes: z.array(LongitudinalEntityTypeSchema).optional(),
    }),
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Student',
      },
    }),
    summary: 'Retrieve a longitudinal event timeline for a student as of a view date',
  },
  getStudentSnapshotAsOf: {
    method: 'GET',
    path: '/longitudinal/student/snapshot',
    responses: {
      200: StudentLongitudinalSnapshotSchema,
    },
    query: z.object({
      studentId: z.uuid(),
      viewDate: z.string(),
      entityTypes: z.array(LongitudinalEntityTypeSchema).optional(),
    }),
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Student',
      },
    }),
    summary: 'Retrieve the latest effective longitudinal records for a student as of a view date',
  },
});
