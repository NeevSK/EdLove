import { z } from 'zod';

export const GuardianPublishedGradeMarkSchema = z.object({
  grade_mark_id: z.uuid(),
  percentage: z.number(),
  letter_grade: z.string(),
  graded_at: z.iso.datetime(),
  published_at: z.iso.datetime(),
});

export const GuardianAssessmentReadAuditEventSchema = z.object({
  guardian_id: z.uuid(),
  student_id: z.uuid(),
  outcome: z.enum(['allowed', 'denied']),
  reason: z.enum(['allowed', 'no_relationship', 'permission_missing', 'no_published_results']),
  result_count: z.number().int().nonnegative(),
  occurred_at: z.iso.datetime(),
});

export type GuardianPublishedGradeMark = z.infer<typeof GuardianPublishedGradeMarkSchema>;
export type GuardianAssessmentReadAuditEvent = z.infer<
  typeof GuardianAssessmentReadAuditEventSchema
>;
