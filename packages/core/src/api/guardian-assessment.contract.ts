import type { SovereignContract } from '@repo/core/api/contract';
import {
  GuardianAssessmentReadAuditEventSchema,
  GuardianPublishedGradeMarkSchema,
} from '@repo/core/logic/schemas/guardian-assessment.schema';
import { z } from 'zod';

export const GuardianAssessmentErrorCategorySchema = z.enum([
  'unauthenticated',
  'relationship_denied',
  'permission_denied',
  'invalid_cursor',
  'database_unavailable',
  'audit_failed',
]);

export const GuardianPublishedAssessmentSummarySchema = z.object({
  items: z.array(GuardianPublishedGradeMarkSchema),
  next_cursor: z.string().nullable(),
  request_id: z.string().min(1),
});

export const GuardianAssessmentApiErrorSchema = z.object({
  category: GuardianAssessmentErrorCategorySchema,
  request_id: z.string().min(1),
});

const guardianAssessmentAuthority = () =>
  ({ policy: { action: 'read', subject: 'Guardian' } }) as const;

export const guardianAssessmentContract = {
  getPublishedAssessmentSummary: {
    method: 'get',
    path: '/guardian/students/:studentId/assessments',
    request: {
      params: z.strictObject({ studentId: z.uuid() }),
      query: z.strictObject({
        cursor: z.string().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(50).default(25),
      }),
    },
    responses: {
      200: {
        schema: GuardianPublishedAssessmentSummarySchema,
        description: 'Published, minimized assessment results for an authorized guardian',
      },
    },
    metadata: guardianAssessmentAuthority(),
  },
} as const satisfies SovereignContract;

export type GuardianPublishedAssessmentSummary = z.infer<
  typeof GuardianPublishedAssessmentSummarySchema
>;
export type GuardianAssessmentApiError = z.infer<typeof GuardianAssessmentApiErrorSchema>;
export type GuardianAssessmentAuditEvent = z.infer<typeof GuardianAssessmentReadAuditEventSchema>;
