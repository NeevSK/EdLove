/**
 * #149 teaching-group links (classroom_grade_classes) against real Postgres, with Cedar
 * substituted by a pass-through: linking rules, policy limits, and link-first lookup.
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

const science = '00000000-0000-4000-8000-000000000053'; // subject classroom, school A
const legacy5B = '00000000-0000-4000-8000-000000000054'; // unlinked classroom named 5B

describe.skipIf(!url)('classroom <-> grade class links (real Postgres)', () => {
  let raw: any;
  const ctx = (userId: string, schoolId = ID.schoolA) => ({
    context: { user: { id: userId }, requestId: 'links', schoolId, db: raw } as ORPCContext,
  });
  const link = (userId: string, body: Record<string, unknown>, schoolId?: string) =>
    call(attendanceRouter.linkClassroom, { body } as any, ctx(userId, schoolId));
  const links = (userId: string, classroomId: string) =>
    call(
      attendanceRouter.getClassroomLinks,
      { query: { classroomId } } as any,
      ctx(userId),
    ) as Promise<any[]>;

  beforeAll(async () => {
    raw = await resetAndSeed();
    await raw.classroom.create({
      data: {
        id: science,
        school_id: ID.schoolA,
        teacher_id: ID.subjectTeacherA,
        name: 'Science 5',
        academic_year: '2026',
      },
    });
    await raw.classroom.create({
      data: {
        id: legacy5B,
        school_id: ID.schoolA,
        teacher_id: ID.teacherA2,
        name: '5B',
        academic_year: '2026',
      },
    });
  });

  it('an unclassified classroom must be given a kind before it is linked', async () => {
    await expect(
      link(ID.teacherA, { classroomId: ID.classroomA, gradeClassId: ID.gcA }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(await raw.classroomGradeClass.count()).toBe(0);
  });

  it('the classroom teacher links their homeroom to the class they teach (idempotent)', async () => {
    const body = { classroomId: ID.classroomA, gradeClassId: ID.gcA, kind: 'homeroom' };
    await expect(link(ID.teacherA, body)).resolves.toEqual({
      classroom_id: ID.classroomA,
      grade_class_id: ID.gcA,
      kind: 'homeroom',
    });
    await expect(link(ID.teacherA, body)).resolves.toMatchObject({ kind: 'homeroom' });
    expect(await raw.classroomGradeClass.count({ where: { classroom_id: ID.classroomA } })).toBe(1);
    expect((await raw.classroom.findUnique({ where: { id: ID.classroomA } })).kind).toBe(
      'homeroom',
    );
  });

  it('a homeroom links to exactly one grade class, and the kind cannot silently change', async () => {
    await expect(
      link(ID.principalA, { classroomId: ID.classroomA, gradeClassId: ID.gcA2 }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    await expect(
      link(ID.principalA, { classroomId: ID.classroomA, gradeClassId: ID.gcA, kind: 'subject' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('cannot link across schools', async () => {
    await expect(
      link(
        ID.teacherB,
        { classroomId: ID.classroomB, gradeClassId: ID.gcA, kind: 'homeroom' },
        ID.schoolB,
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    await expect(
      link(ID.principalB, { classroomId: ID.classroomA, gradeClassId: ID.gcA }, ID.schoolB),
    ).rejects.toMatchObject({ code: expect.stringMatching(/FORBIDDEN|BAD_REQUEST/) });
  });

  it('a teacher may link only to grade classes they teach; leaders may link any in their school', async () => {
    await expect(
      link(ID.subjectTeacherA, { classroomId: science, gradeClassId: ID.gcA2, kind: 'subject' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await link(ID.subjectTeacherA, { classroomId: science, gradeClassId: ID.gcA, kind: 'subject' });
    await link(ID.principalA, { classroomId: science, gradeClassId: ID.gcA2 });
    expect((await links(ID.subjectTeacherA, science)).map((row) => row.name).sort()).toEqual([
      '5A',
      '5B',
    ]);
  });

  it('people outside the school see no links', async () => {
    expect(await links(ID.stranger, science)).toEqual([]);
    expect(await links(ID.teacherB, science)).toEqual([]);
  });

  describe('link-first enrollment when adding a shadow learner', () => {
    const add = (userId: string, classroomId: string, fullName: string) =>
      call(
        educationalRouter.addShadowStudent,
        { params: { classroomId }, body: { fullName, rollNumber: 7 } } as any,
        ctx(userId),
      ) as Promise<any>;
    const enrollmentOf = async (seat: any) =>
      raw.studentGradeClassEnrollment.findMany({ where: { student_id: seat.student_id } });

    it('a linked homeroom enrolls into its linked grade class', async () => {
      const seat = await add(ID.teacherA, ID.classroomA, 'Amal');
      expect((await enrollmentOf(seat)).map((row: any) => row.grade_class_id)).toEqual([ID.gcA]);
    });

    it('a classroom linked to several classes enrolls nowhere (no guessing)', async () => {
      const seat = await add(ID.subjectTeacherA, science, 'Bimal');
      expect(await enrollmentOf(seat)).toEqual([]);
    });

    it('an unlinked classroom still falls back to a unique same-name grade class', async () => {
      const seat = await add(ID.teacherA2, legacy5B, 'Chamari');
      expect((await enrollmentOf(seat)).map((row: any) => row.grade_class_id)).toEqual([ID.gcA2]);
    });
  });
});
