import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('decision journal API', () => {
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
});
