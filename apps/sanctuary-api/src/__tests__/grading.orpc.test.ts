import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: grading via native oRPC', () => {
  const headers = {
    Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000',
    'x-classroom-ids': '123e4567-e89b-12d3-a456-426614174001',
  };
  const classroomId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-grading', user_id: '123e4567-e89b-12d3-a456-426614174000', entity_id: 'school-123', entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' });
  });

  it('executes classroom grade reads and validates the explicit DTO list', async () => {
    const body = await createTestORPCClient(headers).grading.getClassroomGrades({ classroomId });
    expect(body).toEqual([]);
  });

  it('rejects marks outside the contract range before the handler runs', async () => {
    await expect(createTestORPCClient(headers).grading.submitGrade({
      studentId: classroomId,
      classroomId,
      marks: 101,
    })).rejects.toMatchObject({ status: 400 });
  });

  it('reads and updates grading settings through typed procedures', async () => {
    const client = createTestORPCClient(headers);
    await expect(client.grading.getGradingSettings({ classroomId })).resolves.toEqual({
      classroom_id: classroomId,
      grading_mode: 'both',
      show_ranks: true,
    });
    await expect(client.grading.updateGradingSettings({ classroomId, gradingMode: 'points', showRanks: false })).resolves.toMatchObject({
      classroom_id: classroomId,
      grading_mode: 'points',
      show_ranks: false,
    });
  });
});
