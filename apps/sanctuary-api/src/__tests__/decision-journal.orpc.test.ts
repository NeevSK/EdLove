import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('decision journal API', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  it('rejects empty decision text before database access', async () => {
    await expect(
      createTestORPCClient().decisionJournal.create({
        decision_text: '   ',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an invalid review identifier before database access', async () => {
    await expect(
      createTestORPCClient().decisionJournal.markReviewed({
        id: 'not-a-uuid',
        is_reviewed: true,
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects the former flattened list envelope', async () => {
    await expect(
      (createTestORPCClient(headers).decisionJournal.list as any)({ limit: 20 }),
    ).rejects.toBeTruthy();
  });
});
