import './setup';
import { call } from '@orpc/server';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import { describe, expect, it } from 'vitest';
import { implement, type ORPCContext } from '../core/orpc';
import { doubleGateMiddleware } from '../core/orpcMiddleware';
import { resolveChildStudentIds } from '../core/router';
import { createFakeDb } from './fakeAttendanceDb';

// The real Cedar gate in front of a stub handler: which callers reach
// attendance.getStudentHistory at all. The handler's own scope rules are covered
// against real Postgres in policy-pg/studentHistory.test.ts.
const gate = implement(attendanceORPCContract)
  .$context<ORPCContext>()
  .getStudentHistory.use(doubleGateMiddleware)
  .handler(async () => [] as any);

const school = '123e4567-e89b-12d3-a456-4266141740aa';
const student = '123e4567-e89b-8101-8000-426614174010';
const otherStudent = '123e4567-e89b-12d3-a456-426614174011';
const gradeClass = '123e4567-e89b-8101-8000-426614174020';
const otherClass = '123e4567-e89b-12d3-a456-426614174021';

const as = (
  userId: string,
  capacity: string,
  extra: { classroom_ids?: string[]; child_student_ids?: string[] } = {},
): ORPCContext => ({
  user: { id: userId },
  schoolId: school,
  capacity,
  requestId: 'history-cedar',
  principal: {
    id: userId,
    type: capacity,
    attributes: {
      school_id: school,
      capacity,
      active_entity_id: school,
      active_entity_type: 'SCHOOL',
      classroom_ids: extra.classroom_ids ?? [],
      child_student_ids: extra.child_student_ids ?? [],
    },
  },
  securityContext: { device_trust: 'standard', network_zone: 'public' },
});

const read = (context: ORPCContext, query: Record<string, unknown>) =>
  call(gate, { query } as any, { context });

describe('attendance.getStudentHistory Cedar gate', () => {
  it('lets a student read only their own history', async () => {
    await expect(read(as(student, 'student'), { studentId: student })).resolves.toEqual([]);
    await expect(read(as(student, 'student'), { studentId: otherStudent })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('lets a parent read only children in child_student_ids', async () => {
    const parent = '123e4567-e89b-8101-8000-426614174030';
    const ctx = as(parent, 'parent', { child_student_ids: [student] });
    await expect(read(ctx, { studentId: student })).resolves.toEqual([]);
    await expect(read(ctx, { studentId: otherStudent })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(read(as(parent, 'parent'), { studentId: student })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('lets a teacher through only via one of their own grade classes', async () => {
    const teacher = '123e4567-e89b-8101-8000-426614174040';
    const ctx = as(teacher, 'teacher', { classroom_ids: [gradeClass] });
    await expect(read(ctx, { studentId: student, gradeClassId: gradeClass })).resolves.toEqual([]);
    await expect(read(ctx, { studentId: student, gradeClassId: otherClass })).rejects.toMatchObject(
      { code: 'FORBIDDEN' },
    );
    await expect(read(ctx, { studentId: student })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lets a principal of the active school through (the handler then checks the student)', async () => {
    const principal = '123e4567-e89b-12d3-a456-426614174050';
    await expect(read(as(principal, 'principal'), { studentId: student })).resolves.toEqual([]);
  });
});

describe('child_student_ids for Cedar', () => {
  const db = createFakeDb({
    studentGuardianRelationship: [
      { guardian_id: 'g1', student_id: 's1', verification_status: 'verified' },
      { guardian_id: 'g1', student_id: 's2', verification_status: 'pending' },
      { guardian_id: 'g1', student_id: 's3', verification_status: 'revoked' },
      { guardian_id: 'g2', student_id: 's4', verification_status: 'verified' },
    ],
  });

  it('holds only verified links, and only for parent/guardian capacity', async () => {
    await expect(resolveChildStudentIds(db, 'g1', 'parent')).resolves.toEqual(['s1']);
    await expect(resolveChildStudentIds(db, 'g1', 'guardian')).resolves.toEqual(['s1']);
    await expect(resolveChildStudentIds(db, 'g1', 'teacher')).resolves.toEqual([]);
  });

  it('denies child scope if the lookup fails', async () => {
    const broken = {
      studentGuardianRelationship: {
        findMany: async () => {
          throw new Error('db down');
        },
      },
    };
    await expect(resolveChildStudentIds(broken, 'g1', 'parent')).resolves.toEqual([]);
  });
});
