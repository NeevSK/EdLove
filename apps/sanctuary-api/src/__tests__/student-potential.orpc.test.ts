import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockQueryRowsQueue,
  setMockUserData,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: Student Potential', () => {
  const teacherId = '123e4567-e89b-8101-8000-426614174000';
  const studentId = '223e4567-e89b-12d3-a456-426614174000';
  const classroomId = '323e4567-e89b-12d3-a456-426614174000';
  const schoolId = '423e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${teacherId}` };

  const row = {
    id: '523e4567-e89b-12d3-a456-426614174000',
    student_id: studentId,
    teacher_id: teacherId,
    classroom_id: classroomId,
    cognitive_flow: 4,
    emotional_resonance: 3,
    social_weaving: 5,
    creative_spark: 4,
    practical_mastery: 3,
    silver_lining: 'Consistent curiosity',
    potential_notes: ['Ask a deeper question'],
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-02T00:00:00.000Z',
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockUserData({
      id: teacherId,
      is_anonymous: false,
      full_name: 'Teacher',
      capacity: 'teacher',
    });
    setMockActiveBond({
      id: '623e4567-e89b-12d3-a456-426614174000',
      user_id: teacherId,
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockQueryRowsQueue([]);
  });

  it('reads and maps the private analysis through the native route', async () => {
    setMockQueryRowsQueue([[row]]);

    const result = await createTestORPCClient(headers).studentPotential.listForStudent({
      params: { studentId },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      student_id: studentId,
      teacher_id: teacherId,
      visibility: 'private',
      audit: { audit_required: true, owner_id: teacherId, share_state: 'private' },
    });
  });

  it('rejects a teacher update when the classroom authorization query denies it', async () => {
    setMockQueryRowsQueue([[{ allowed: false }]]);

    await expect(
      createTestORPCClient(headers).studentPotential.upsert({
        params: { studentId },
        body: {
          student_id: studentId,
          classroom_id: classroomId,
          cognitive_flow: 4,
          emotional_resonance: 3,
          social_weaving: 5,
          creative_spark: 4,
          practical_mastery: 3,
          silver_lining: null,
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('upserts through the database function and returns a private audited result', async () => {
    setMockQueryRowsQueue([[{ allowed: true }], [{ result: row }]]);

    const result = await createTestORPCClient(headers).studentPotential.upsert({
      params: { studentId },
      body: {
        student_id: studentId,
        classroom_id: classroomId,
        cognitive_flow: 4,
        emotional_resonance: 3,
        social_weaving: 5,
        creative_spark: 4,
        practical_mastery: 3,
        silver_lining: 'Consistent curiosity',
      },
    });

    expect(result.audit).toEqual({
      audit_required: true,
      owner_id: teacherId,
      share_state: 'private',
    });
    expect(result.updated_at).toBe(row.updated_at);
  });

  it('rejects malformed identifiers before the handler can query the database', async () => {
    await expect(
      createTestORPCClient(headers).studentPotential.listForStudent({
        params: { studentId: 'not-a-uuid' },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a body student identity that differs from the route identity', async () => {
    await expect(
      createTestORPCClient(headers).studentPotential.upsert({
        params: { studentId },
        body: {
          student_id: teacherId,
          classroom_id: classroomId,
          cognitive_flow: 4,
          emotional_resonance: 3,
          social_weaving: 5,
          creative_spark: 4,
          practical_mastery: 3,
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects legacy flattened envelopes', async () => {
    await expect(
      createTestORPCClient(headers).studentPotential.listForStudent({ studentId } as never),
    ).rejects.toBeTruthy();
  });
});
