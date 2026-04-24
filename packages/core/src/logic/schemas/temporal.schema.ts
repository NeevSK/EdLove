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

export const StudentLongitudinalEventSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  school_id: z.string().uuid().nullable().optional(),
  classroom_id: z.string().uuid().nullable().optional(),
  entity_type: LongitudinalEntityTypeSchema,
  entity_id: z.string().uuid(),
  operation: LongitudinalOperationSchema,
  source_table: z.string(),
  snapshot: z.record(z.string(), z.any()),
  occurred_at: z.string(),
  recorded_at: z.string(),
  effective_from: z.string().nullable().optional(),
  effective_to: z.string().nullable().optional(),
  recorded_by: z.string().uuid().nullable().optional(),
});

export const StudentLongitudinalTimelineSchema = z.object({
  studentId: z.string().uuid(),
  viewDate: z.string(),
  events: z.array(StudentLongitudinalEventSchema),
});

export const StudentLongitudinalSnapshotSchema = z.object({
  studentId: z.string().uuid(),
  viewDate: z.string(),
  records: z.array(StudentLongitudinalEventSchema),
});

export type LongitudinalEntityType = z.infer<typeof LongitudinalEntityTypeSchema>;
export type LongitudinalOperation = z.infer<typeof LongitudinalOperationSchema>;
export type StudentLongitudinalEvent = z.infer<typeof StudentLongitudinalEventSchema>;
export type StudentLongitudinalTimeline = z.infer<typeof StudentLongitudinalTimelineSchema>;
export type StudentLongitudinalSnapshot = z.infer<typeof StudentLongitudinalSnapshotSchema>;
