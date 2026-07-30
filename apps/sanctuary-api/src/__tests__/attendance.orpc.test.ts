import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: attendance via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const classroomId = '123e4567-e89b-12d3-a456-426614174001';
  const headers = { Authorization: `Bearer ${userId}`, 'x-classroom-ids': classroomId };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-attendance', user_id: userId, entity_id: 'school-123', entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' });
  });

  it('reads classroom attendance through the real native request path', async () => {
    const body = await createTestORPCClient(headers).attendance.getByClassroom({ classroomId, date: '2026-07-30' });
    expect(body).toEqual([]);
  });

  it('rejects malformed attendance input before database execution', async () => {
    await expect(createTestORPCClient(headers).attendance.record({ classroomId: 'bad', studentId: classroomId, status: 'present', date: '2026-07-30' } as any)).rejects.toMatchObject({ status: 400 });
  });
});
