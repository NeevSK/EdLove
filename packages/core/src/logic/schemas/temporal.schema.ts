import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

export const LongitudinalEntityTypeSchema = z.enum([
  'enrollment',
  'attendance',
  'grade',
  'guardian_relationship',
  'observation',
  'submission',
  'study_note',
]);

export const LongitudinalOperationSchema = z.enum(['insert', 'update', 'delete']);

/**
 * StudentLongitudinalEventSchema - A point in time for a student's journey.
 * Derived from ZenStack StudentLongitudinalEvent model.
 */
export const StudentLongitudinalEventSchema = makeModelSchema('StudentLongitudinalEvent').extend({
  entity_type: LongitudinalEntityTypeSchema,
  operation: LongitudinalOperationSchema,
  snapshot: z.any().optional(),
});

export const StudentLongitudinalTimelineSchema = z.object({
  studentId: z.uuid(),
  viewDate: z.string(),
  events: z.array(StudentLongitudinalEventSchema),
});

export const StudentLongitudinalSnapshotSchema = z.object({
  studentId: z.uuid(),
  viewDate: z.string(),
  records: z.array(StudentLongitudinalEventSchema),
});

export type LongitudinalEntityType = z.infer<typeof LongitudinalEntityTypeSchema>;
export type LongitudinalOperation = z.infer<typeof LongitudinalOperationSchema>;
export type StudentLongitudinalEvent = z.infer<typeof StudentLongitudinalEventSchema>;
export type StudentLongitudinalTimeline = z.infer<typeof StudentLongitudinalTimelineSchema>;
export type StudentLongitudinalSnapshot = z.infer<typeof StudentLongitudinalSnapshotSchema>;
