/**
 * Handler-level proof that the database gate holds on its own: Cedar is substituted by a
 * pass-through (as if it had wrongly allowed the call), and the real handlers run against
 * real Postgres through the policy-enforced client.
 */
import { call, os } from '@orpc/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { attendanceRouter } from '../../core/handlers/attendance';
import { educationalRouter } from '../../core/handlers/educational';
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

describe.skipIf(!url)(
  'handlers enforce zmodel policies even if Cedar allowed (real Postgres)',
  () => {
    let raw: any;
    const ctx = (userId: string, schoolId?: string): ORPCContext => ({
      user: { id: userId },
      requestId: `policy-${userId}`,
      schoolId,
      db: raw,
    });
    beforeAll(async () => {
      raw = await resetAndSeed();
    });

    describe('attendance router', () => {
      it('a teacher from school B cannot record attendance in school A', async () => {
        await expect(
          call(
            attendanceRouter.record,
            {
              body: {
                gradeClassId: ID.gcA,
                studentId: ID.student,
                date: '2026-10-22',
                status: 'absent',
              },
            } as any,
            { context: ctx(ID.teacherB) },
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        expect(
          await raw.dailyAttendance.count({
            where: { attendance_date: new Date('2026-10-22T00:00:00.000Z') },
          }),
        ).toBe(0);
      });

      it("a teacher from school B cannot read school A's register", async () => {
        await expect(
          call(
            attendanceRouter.getByClassroom,
            { query: { gradeClassId: ID.gcA, date: '2026-10-20' } } as any,
            { context: ctx(ID.teacherB) },
          ),
        ).rejects.toMatchObject({ code: 'NOT_FOUND' });
      });

      it('the class teacher in school A can record and read', async () => {
        const row: any = await call(
          attendanceRouter.record,
          {
            body: {
              gradeClassId: ID.gcA,
              studentId: ID.student,
              date: '2026-10-22',
              status: 'late',
            },
          } as any,
          { context: ctx(ID.teacherA, ID.schoolA) },
        );
        expect(row).toMatchObject({ status: 'late', attendance_date: '2026-10-22' });
        const day: any = await call(
          attendanceRouter.getByClassroom,
          { query: { gradeClassId: ID.gcA, date: '2026-10-22' } } as any,
          { context: ctx(ID.teacherA, ID.schoolA) },
        );
        expect(JSON.stringify(day)).toContain(ID.student);
      });

      it('a signed-in user with no school bond cannot record attendance', async () => {
        await expect(
          call(
            attendanceRouter.record,
            {
              body: {
                gradeClassId: ID.gcA,
                studentId: ID.student,
                date: '2026-10-23',
                status: 'absent',
              },
            } as any,
            { context: ctx(ID.stranger) },
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
      });
    });

    describe('classroom procedures', () => {
      it("a teacher cannot rename, delete or edit the roster of another teacher's classroom", async () => {
        const context = { context: ctx(ID.teacherB) };
        await expect(
          call(
            educationalRouter.updateClassroom,
            { params: { id: ID.classroomA }, body: { name: 'Hijacked' } } as any,
            context,
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        await expect(
          call(
            educationalRouter.deleteClassroom,
            { params: { id: ID.classroomA } } as any,
            context,
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        await expect(
          call(
            educationalRouter.updateClassroomStudent,
            {
              params: { id: '00000000-0000-4000-8000-000000000061' },
              body: { rollNumber: 99 },
            } as any,
            context,
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        await expect(
          call(
            educationalRouter.removeClassroomStudent,
            { params: { id: '00000000-0000-4000-8000-000000000061' }, body: {} } as any,
            context,
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        expect(
          await call(
            educationalRouter.getClassroomStudents,
            { params: { classroomId: ID.classroomA } } as any,
            context,
          ),
        ).toEqual([]);
        const classroom = await raw.classroom.findUnique({ where: { id: ID.classroomA } });
        expect(classroom.name).toBe('5A');
        expect(await raw.classroomStudent.count({ where: { classroom_id: ID.classroomA } })).toBe(
          1,
        );
      });

      it("a teacher cannot add a shadow learner to another teacher's classroom (nothing is left behind)", async () => {
        const usersBefore = await raw.user.count();
        await expect(
          call(
            educationalRouter.addShadowStudent,
            {
              params: { classroomId: ID.classroomA },
              body: { fullName: 'Ghost', rollNumber: 9 },
            } as any,
            { context: ctx(ID.teacherB) },
          ),
        ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) });
        expect(await raw.user.count()).toBe(usersBefore);
      });

      it('the classroom teacher can add a shadow learner and manage the roster', async () => {
        const seat: any = await call(
          educationalRouter.addShadowStudent,
          {
            params: { classroomId: ID.classroomA },
            body: { fullName: 'Sunil', rollNumber: 2 },
          } as any,
          { context: ctx(ID.teacherA, ID.schoolA) },
        );
        expect(seat).toMatchObject({ roll_number: 2 });
        const roster: any = await call(
          educationalRouter.getClassroomStudents,
          { params: { classroomId: ID.classroomA } } as any,
          { context: ctx(ID.teacherA, ID.schoolA) },
        );
        expect(roster).toHaveLength(2);
        await call(
          educationalRouter.updateClassroom,
          { params: { id: ID.classroomA }, body: { description: 'Morning class' } } as any,
          { context: ctx(ID.teacherA, ID.schoolA) },
        );
      });
    });
  },
);
