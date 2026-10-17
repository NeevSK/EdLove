import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockClassroomRelationships,
  setMockGradeClassLifecycle,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: attendance via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const gradeClassId = '123e4567-e89b-12d3-a456-426614174001';
  const headers = { Authorization: `Bearer ${userId}`, 'x-classroom-ids': gradeClassId };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-attendance',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockClassroomRelationships({
      classrooms: [{ id: gradeClassId, school_id: 'school-123', teacher_id: userId }],
    });
  });

  it('reads classroom attendance through the real native request path', async () => {
    const body = await createTestORPCClient(headers).attendance.getByClassroom({
      query: { gradeClassId, date: '2026-07-30' },
    });
    expect(body).toEqual([]);
  });

  it('rejects malformed attendance input before database execution', async () => {
    await expect(
      createTestORPCClient(headers).attendance.record({
        body: {
          gradeClassId: 'bad',
          studentId: gradeClassId,
          status: 'present',
          date: '2026-07-30',
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects the former flattened record shape', async () => {
    await expect(
      (createTestORPCClient(headers).attendance.record as any)({
        gradeClassId,
        studentId: gradeClassId,
        status: 'present',
        date: '2026-07-30',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('Sanctuary API: attendance on grade classes (model A)', () => {
  const teacherId = '123e4567-e89b-12d3-a456-426614174000';
  const gradeClassId = '123e4567-e89b-12d3-a456-426614174004';
  const otherGradeClassId = '123e4567-e89b-12d3-a456-426614174005';
  const studentId = '123e4567-e89b-12d3-a456-426614174020';
  const headers = { Authorization: `Bearer ${teacherId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-attendance-a',
      user_id: teacherId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    // No legacy classroom rows: grade class scope must come from teacher assignments.
    setMockClassroomRelationships({ classrooms: [] });
    setMockGradeClassLifecycle({
      assignments: [
        {
          id: 'gcta-1',
          teacher_id: teacherId,
          grade_class_id: gradeClassId,
          role: 'class_teacher',
          status: 'active',
          grade_class: {
            id: gradeClassId,
            name: '5A',
            academic_cycle_id: '123e4567-e89b-12d3-a456-426614174010',
          },
        },
      ],
      enrollments: [
        {
          id: '123e4567-e89b-12d3-a456-426614174030',
          grade_class_id: gradeClassId,
          student_id: studentId,
          status: 'active',
          student: { full_name: 'Nimal Perera', avatar_url: null },
        },
      ],
    });
  });

  it('lists the grade classes the teacher is assigned to', async () => {
    const body = await createTestORPCClient(headers).attendance.getMyGradeClasses();
    expect(body).toEqual([
      {
        id: gradeClassId,
        name: '5A',
        academic_cycle_id: '123e4567-e89b-12d3-a456-426614174010',
        role: 'class_teacher',
      },
    ]);
  });

  it('returns the enrolled roster for an assigned grade class', async () => {
    const body = await createTestORPCClient(headers).attendance.getGradeClassRoster({
      query: { gradeClassId },
    });
    expect(body).toEqual([
      {
        enrollment_id: '123e4567-e89b-12d3-a456-426614174030',
        student_id: studentId,
        full_name: 'Nimal Perera',
        avatar_url: null,
      },
    ]);
  });

  it('authorizes reads for an assigned grade class without any legacy classroom', async () => {
    const body = await createTestORPCClient(headers).attendance.getByClassroom({
      query: { gradeClassId, date: '2026-10-17' },
    });
    expect(body).toEqual([]);
  });

  it('records a batch for an assigned grade class', async () => {
    await expect(
      createTestORPCClient(headers).attendance.batchRecord({
        body: [{ gradeClassId, studentId, status: 'absent', date: '2026-10-17' }],
      }),
    ).resolves.toMatchObject([
      { grade_class_id: gradeClassId, student_id: studentId, status: 'absent' },
    ]);
  });

  it('denies a batch for a grade class the teacher is not assigned to', async () => {
    await expect(
      createTestORPCClient(headers).attendance.batchRecord({
        body: [
          { gradeClassId: otherGradeClassId, studentId, status: 'absent', date: '2026-10-17' },
        ],
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('denies a batch that spans an assigned and an unassigned grade class', async () => {
    await expect(
      createTestORPCClient(headers).attendance.batchRecord({
        body: [
          { gradeClassId, studentId, status: 'present', date: '2026-10-17' },
          { gradeClassId: otherGradeClassId, studentId, status: 'absent', date: '2026-10-17' },
        ],
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('denies a grade class the teacher is not assigned to', async () => {
    await expect(
      createTestORPCClient(headers).attendance.getGradeClassRoster({
        query: { gradeClassId: otherGradeClassId },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
