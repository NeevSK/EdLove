/**
 * attendance.getStudentHistory against real Postgres, with Cedar substituted by a
 * pass-through so the handler's own scope rules and the policy client are what is tested.
 */
import { call, os } from '@orpc/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { attendanceRouter } from '../../core/handlers/attendance';
import type { ORPCContext } from '../../core/orpc';
import { ID, resetAndSeed, url } from './fixtures';

vi.mock('../../core/orpcMiddleware', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    doubleGateMiddleware: os.$context<ORPCContext>().middleware(async ({ next, context }) => {
      try {
        return await next({});
      } catch (error) {
        throw actual.toORPCError(error, context.requestId);
      }
    }),
  };
});

describe.skipIf(!url)('attendance.getStudentHistory scope (real Postgres)', () => {
  let raw: any;
  const history = (userId: string, query: Record<string, unknown> = {}) =>
    call(
      attendanceRouter.getStudentHistory,
      { query: { studentId: ID.student, ...query } } as any,
      { context: { user: { id: userId }, requestId: 'history', db: raw } as ORPCContext },
    ) as Promise<any[]>;
  const dates = async (userId: string, query?: Record<string, unknown>) =>
    (await history(userId, query)).map((row) => row.attendance_date);
  const setAccess = (value: unknown) =>
    raw.school.update({ where: { id: ID.schoolA }, data: { student_history_access: value } });

  beforeAll(async () => {
    raw = await resetAndSeed();
  });
  afterEach(async () => {
    await setAccess({});
  });

  describe('strict defaults', () => {
    it('the student sees their whole history, newest first', async () => {
      expect(await dates(ID.student)).toEqual(['2026-10-21', '2026-10-20', '2026-03-02']);
    });

    it('a verified guardian sees it; a pending guardian does not', async () => {
      expect(await dates(ID.guardian)).toHaveLength(3);
      await expect(history(ID.pendingGuardian)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('the class teacher sees the history in their school', async () => {
      expect(await dates(ID.teacherA, { gradeClassId: ID.gcA })).toHaveLength(3);
    });

    it('a subject teacher sees only their own class', async () => {
      expect(await dates(ID.subjectTeacherA, { gradeClassId: ID.gcA })).toEqual([
        '2026-10-21',
        '2026-10-20',
      ]);
    });

    it("the teacher of a class the student has left, and other schools' staff, are denied", async () => {
      await expect(history(ID.teacherA2)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(history(ID.teacherB)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(history(ID.principalB)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it("the principal of the student's school sees it; strangers are denied", async () => {
      expect(await dates(ID.principalA)).toHaveLength(3);
      await expect(history(ID.stranger)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('filters by date range and limit', async () => {
      expect(await dates(ID.student, { from: '2026-10-01', to: '2026-10-20' })).toEqual([
        '2026-10-20',
      ]);
      expect(await dates(ID.student, { limit: 1 })).toEqual(['2026-10-21']);
    });
  });

  describe('per-school setting (schools.student_history_access)', () => {
    it('can limit class teachers to their own class', async () => {
      await setAccess({ classTeachers: 'own_class' });
      expect(await dates(ID.teacherA, { gradeClassId: ID.gcA })).toHaveLength(2);
    });

    it('can turn off guardian and subject-teacher access', async () => {
      await setAccess({ guardians: 'none', subjectTeachers: 'none' });
      await expect(history(ID.guardian)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(history(ID.subjectTeacherA)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(await dates(ID.student)).toHaveLength(3);
    });

    it('invalid values fall back to the strict default, never wider', async () => {
      await setAccess({ guardians: 'everyone', leaderCapacities: ['teacher'] });
      await expect(history(ID.pendingGuardian)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(history(ID.stranger)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(await dates(ID.guardian)).toHaveLength(3);
    });
  });
});
