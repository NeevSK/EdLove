import './setup';
import { gradingContract } from '@repo/core/api/grading.contract';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockClassroomRelationships,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: lifecycle grading via native oRPC', () => {
  const headers = {
    Authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000',
    'x-classroom-ids': '123e4567-e89b-12d3-a456-426614174003',
    'x-device-trust': 'high',
  };
  const ids = {
    studentId: '123e4567-e89b-8101-8000-426614174000',
    schoolId: '123e4567-e89b-12d3-a456-426614174001',
    academicCycleId: '123e4567-e89b-8101-8000-426614174002',
    gradeClassId: '123e4567-e89b-12d3-a456-426614174003',
    termId: '123e4567-e89b-12d3-a456-426614174004',
    subjectId: '123e4567-e89b-12d3-a456-426614174005',
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockClassroomRelationships({
      classrooms: [{ id: ids.gradeClassId, school_id: ids.schoolId, teacher_id: ids.studentId }],
      students: [{ id: ids.studentId, classroom_id: ids.gradeClassId }],
    });
    setMockActiveBond({
      id: 'bond-grading',
      user_id: ids.studentId,
      entity_id: ids.schoolId,
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('reads grade marks through the lifecycle grade class scope', async () => {
    const body = await createTestORPCClient(headers).grading.getClassroomGrades({
      query: {
        schoolId: ids.schoolId,
        academicCycleId: ids.academicCycleId,
        gradeClassId: ids.gradeClassId,
        termId: ids.termId,
        subjectId: ids.subjectId,
      },
    });
    expect(body).toEqual([]);
  });

  it('rejects legacy classroom identifiers and invalid marks at the contract boundary', async () => {
    const result = gradingContract.submitGrade.request.body.safeParse({
      ...ids,
      marksEarned: 101,
      maxPoints: 100,
      classroomId: ids.gradeClassId,
    });
    expect(result.success).toBe(false);
  });

  it('requires every lifecycle identifier for writes', async () => {
    const { subjectId: _subjectId, ...missingSubject } = ids;
    const result = gradingContract.submitGrade.request.body.safeParse({
      ...missingSubject,
      marksEarned: 75,
      maxPoints: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects legacy flattened envelopes before handler execution', async () => {
    await expect(
      createTestORPCClient(headers).grading.getClassroomGrades({
        schoolId: ids.schoolId,
        academicCycleId: ids.academicCycleId,
        gradeClassId: ids.gradeClassId,
      } as never),
    ).rejects.toBeTruthy();
  });

  it('rejects writes targeting a school outside the active bond', async () => {
    await expect(
      createTestORPCClient(headers).grading.submitGrade({
        body: {
          ...ids,
          schoolId: '523e4567-e89b-12d3-a456-426614174000',
          marksEarned: 75,
          maxPoints: 100,
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
