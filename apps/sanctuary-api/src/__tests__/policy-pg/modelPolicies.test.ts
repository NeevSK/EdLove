import { beforeAll, describe, expect, it } from 'vitest';
import { as, ID, resetAndSeed, url } from './fixtures';

describe.skipIf(!url)('zmodel policies enforced at runtime (real Postgres)', () => {
  let raw: any;
  beforeAll(async () => {
    raw = await resetAndSeed();
  });

  describe('guardian notifications, settings and links', () => {
    it('a guardian reads only their own notifications', async () => {
      expect(await (await as(raw, ID.guardian)).guardianNotification.findMany()).toHaveLength(1);
      expect(await (await as(raw, ID.stranger)).guardianNotification.findMany()).toEqual([]);
      expect(await (await as(raw, ID.teacherA)).guardianNotification.findMany()).toEqual([]);
    });

    it("nobody else can edit a guardian's notification settings", async () => {
      const stranger = await as(raw, ID.stranger);
      expect(await stranger.guardianNotificationSetting.findMany()).toEqual([]);
      await expect(
        stranger.guardianNotificationSetting.update({
          where: { guardian_id: ID.guardian },
          data: { settings: { push: false } },
        }),
      ).rejects.toThrow();
      const row = await raw.guardianNotificationSetting.findUnique({
        where: { guardian_id: ID.guardian },
      });
      expect(row.settings).toEqual({ push: true });
      // The owner still can.
      await (await as(raw, ID.guardian)).guardianNotificationSetting.update({
        where: { guardian_id: ID.guardian },
        data: { settings: { push: true, print: true } },
      });
    });

    it('a user cannot self-link as a verified guardian (relationships)', async () => {
      const stranger = await as(raw, ID.stranger);
      await expect(
        stranger.studentGuardianRelationship.create({
          data: {
            student_id: ID.otherStudent,
            guardian_id: ID.stranger,
            relationship_type: 'parent',
            verification_status: 'verified',
          },
        }),
      ).rejects.toThrow();
      // A pending request is allowed, and cannot then be promoted by the requester.
      const pending = await stranger.studentGuardianRelationship.create({
        data: {
          student_id: ID.otherStudent,
          guardian_id: ID.stranger,
          relationship_type: 'parent',
        },
      });
      await expect(
        stranger.studentGuardianRelationship.update({
          where: { id: pending.id },
          data: { verification_status: 'verified' },
        }),
      ).rejects.toThrow();
      expect(
        (await raw.studentGuardianRelationship.findUnique({ where: { id: pending.id } }))
          .verification_status,
      ).toBe('pending');
    });

    it('a user cannot self-link as a verified guardian (guardian bonds)', async () => {
      const stranger = await as(raw, ID.stranger);
      await expect(
        stranger.guardianBond.create({
          data: {
            guardian_user_id: ID.stranger,
            ward_student_id: ID.otherStudent,
            status: 'verified',
          },
        }),
      ).rejects.toThrow();
      const bond = await stranger.guardianBond.create({
        data: { guardian_user_id: ID.stranger, ward_student_id: ID.otherStudent },
      });
      expect(bond.status).toBe('pending');
      await expect(
        stranger.guardianBond.update({ where: { id: bond.id }, data: { status: 'verified' } }),
      ).rejects.toThrow();
    });
  });

  describe('attendance', () => {
    it("a teacher cannot read another school's attendance", async () => {
      const rows = await (await as(raw, ID.teacherB)).dailyAttendance.findMany();
      expect(rows.every((row: any) => row.school_id === ID.schoolB)).toBe(true);
      expect(rows.some((row: any) => row.student_id === ID.student)).toBe(false);
    });

    it("a teacher cannot write attendance into another school's class", async () => {
      await expect(
        (await as(raw, ID.teacherB)).dailyAttendance.create({
          data: {
            student_id: ID.student,
            grade_class_id: ID.gcA,
            school_id: ID.schoolA,
            academic_cycle_id: ID.cycleA,
            attendance_date: new Date('2026-10-22T00:00:00.000Z'),
            status: 'absent',
            recorded_by: ID.teacherB,
          },
        }),
      ).rejects.toThrow();
    });

    it('a stranger reads no attendance and no enrollments', async () => {
      const stranger = await as(raw, ID.stranger);
      expect(await stranger.dailyAttendance.findMany()).toEqual([]);
      expect(await stranger.studentGradeClassEnrollment.findMany()).toEqual([]);
    });

    it('a student reads only their own attendance', async () => {
      const rows = await (await as(raw, ID.student)).dailyAttendance.findMany();
      expect(rows.length).toBe(3);
      expect(rows.every((row: any) => row.student_id === ID.student)).toBe(true);
    });

    it('a teacher may create a shadow learner only in their own school, and no other users', async () => {
      const teacherB = await as(raw, ID.teacherB);
      const shadow = { full_name: 'Shadow', is_anonymous: true, identity_state: 'shadow' };
      await expect(
        teacherB.user.create({ data: { ...shadow, school_id: ID.schoolA } }),
      ).rejects.toThrow();
      await expect(
        teacherB.user.create({ data: { full_name: 'Real', school_id: ID.schoolB } }),
      ).rejects.toThrow();
      await expect(
        teacherB.user.update({ where: { id: ID.student }, data: { full_name: 'Renamed' } }),
      ).rejects.toThrow();
      const created = await teacherB.user.create({ data: { ...shadow, school_id: ID.schoolB } });
      expect(created.identity_state).toBe('shadow');
      await expect(
        (await as(raw, ID.stranger)).user.create({ data: { ...shadow, school_id: ID.schoolB } }),
      ).rejects.toThrow();
    });

    it('teachers see only their own grade-class assignments', async () => {
      const rows = await (await as(raw, ID.teacherA)).gradeClassTeacherAssignment.findMany();
      expect(rows.map((row: any) => row.teacher_id)).toEqual([ID.teacherA]);
    });
  });

  describe('classroom rosters', () => {
    it("a teacher cannot read or edit another teacher's roster", async () => {
      const teacherB = await as(raw, ID.teacherB);
      const seats = await teacherB.classroomStudent.findMany();
      expect(seats.every((seat: any) => seat.classroom_id === ID.classroomB)).toBe(true);
      await expect(
        teacherB.classroomStudent.update({
          where: { id: '00000000-0000-4000-8000-000000000061' },
          data: { roll_number: 99 },
        }),
      ).rejects.toThrow();
    });

    it("a principal manages their own school's rosters only", async () => {
      const principalA = await as(raw, ID.principalA);
      const seats = await principalA.classroomStudent.findMany();
      expect(seats.map((seat: any) => seat.classroom_id)).toEqual([ID.classroomA]);
    });
  });
});
