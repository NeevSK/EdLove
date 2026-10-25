import './setup';
import { guardianAssessmentContract } from '@repo/core/api/guardian-assessment.contract';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

const studentId = '22222222-2222-4222-8222-222222222222';

describe('Sanctuary API: guardian published assessment summary', () => {
  it('rejects anonymous assessment reads at the API boundary', async () => {
    await expect(
      createTestORPCClient().guardianAssessment.getPublishedAssessmentSummary({
        params: { studentId },
        query: { limit: 25 },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('rejects invalid pagination through the declared contract schema', () => {
    expect(
      guardianAssessmentContract.getPublishedAssessmentSummary.request.query.safeParse({
        limit: 51,
      }).success,
    ).toBe(false);
  });

  it('denies a non-relationship principal before exposing validation or data details', async () => {
    await expect(
      createTestORPCClient({
        Authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000',
      }).guardianAssessment.getPublishedAssessmentSummary({
        params: { studentId },
        query: { limit: 51 },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
