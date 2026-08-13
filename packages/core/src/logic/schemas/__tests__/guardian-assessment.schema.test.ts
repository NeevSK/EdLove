import { describe, expect, it } from 'vitest';
import {
  GuardianAssessmentReadAuditEventSchema,
  GuardianPublishedGradeMarkSchema,
} from '../guardian-assessment.schema';

describe('guardian assessment read contract', () => {
  it('accepts only the safe published grade-mark projection', () => {
    const parsed = GuardianPublishedGradeMarkSchema.parse({
      grade_mark_id: '11111111-1111-4111-8111-111111111111',
      percentage: 93,
      letter_grade: 'A',
      graded_at: '2026-08-13T10:00:00.000Z',
      published_at: '2026-08-13T10:00:00.000Z',
      feedback: 'must not cross the contract',
    });

    expect(parsed).not.toHaveProperty('feedback');
  });

  it('requires an explicit allowed or denied audit outcome', () => {
    expect(
      GuardianAssessmentReadAuditEventSchema.parse({
        guardian_id: '22222222-2222-4222-8222-222222222222',
        student_id: '33333333-3333-4333-8333-333333333333',
        outcome: 'denied',
        reason: 'permission_missing',
        result_count: 0,
        occurred_at: '2026-08-13T10:00:00.000Z',
      }),
    ).toMatchObject({ outcome: 'denied', reason: 'permission_missing' });
  });
});
