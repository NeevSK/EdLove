import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

const studentId = '22222222-2222-4222-8222-222222222222';

describe('Sanctuary API: guardian published assessment summary', () => {
  it('rejects anonymous assessment reads at the API boundary', async () => {
    await expect(
      createTestORPCClient().guardianAssessment.getPublishedAssessmentSummary({ studentId }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('validates pagination limits at the contract boundary', async () => {
    await expect(
      createTestORPCClient({
        Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000',
      }).guardianAssessment.getPublishedAssessmentSummary({ studentId, limit: 51 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
