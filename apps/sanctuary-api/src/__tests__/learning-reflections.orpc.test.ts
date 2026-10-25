import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: learning reflections via native oRPC', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const classroomId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-reflections',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('reads reflection filters only from the canonical query envelope', async () => {
    const client = createTestORPCClient(headers).learningReflections;

    await expect(
      client.getLearningReflections({ query: { classroom_id: classroomId, limit: 20 } }),
    ).resolves.toEqual([]);
    await expect(
      (client.getLearningReflections as any)({ classroom_id: classroomId, limit: 20 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
