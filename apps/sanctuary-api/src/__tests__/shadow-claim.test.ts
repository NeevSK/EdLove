import './setup';
import { describe, expect, it } from 'vitest';
import { claimShadowStudentAtomically } from '../core/handlers/shadowClaim';
import { createFakeDb } from './fakeAttendanceDb';

const shadowId = 'shadow-1';
const claimerId = 'claimer-1';
const day1 = new Date('2026-10-20T00:00:00.000Z');
const day2 = new Date('2026-10-21T00:00:00.000Z');

const seed = () => ({
  user: [
    { id: shadowId, full_name: 'Nimal', identity_state: 'shadow' },
    { id: claimerId, full_name: null, school_id: null },
  ],
  classroomStudent: [
    {
      id: 'seat-1',
      classroom_id: 'cls-5a',
      student_id: shadowId,
      full_name: 'Nimal',
      invite_code: 'EDL-AAAA-BBBB',
      claimed_at: null,
    },
  ],
  dailyAttendance: [
    {
      id: 'd1',
      student_id: shadowId,
      grade_class_id: 'gc-5a',
      attendance_date: day1,
      status: 'present',
    },
    {
      id: 'd2',
      student_id: shadowId,
      grade_class_id: 'gc-5a',
      attendance_date: day2,
      status: 'absent',
    },
    // The claimer already has a row for day2, so the shadow's day2 must stay put.
    {
      id: 'd2-own',
      student_id: claimerId,
      grade_class_id: 'gc-5a',
      attendance_date: day2,
      status: 'present',
    },
  ],
  attendanceSession: [
    { id: 's1', daily_attendance_id: 'd1', student_id: shadowId },
    { id: 's2', daily_attendance_id: 'd2', student_id: shadowId },
  ],
  studentGradeClassEnrollment: [{ id: 'e1', grade_class_id: 'gc-5a', student_id: shadowId }],
  gradeMark: [{ id: 'm1', student_id: shadowId }],
  assignmentSubmission: [{ id: 'sub1', student_id: shadowId }],
});

const input = { inviteCode: 'EDL-AAAA-BBBB', claimingUserId: claimerId, schoolId: 'school-1' };
const byId = (rows: any[], id: string) => rows.find((row) => row.id === id);

describe('claimShadowStudentAtomically', () => {
  it('moves the shadow history to the claimer and seals the seat', async () => {
    const db = createFakeDb(seed());
    const seat = await claimShadowStudentAtomically(db, input);
    const t = db.tables;
    expect(seat).toMatchObject({ id: 'seat-1', student_id: claimerId });
    expect(seat.claimed_at).toBeInstanceOf(Date);
    expect(byId(t.dailyAttendance, 'd1').student_id).toBe(claimerId);
    expect(byId(t.dailyAttendance, 'd2').student_id).toBe(shadowId);
    // Sessions follow their daily row only.
    expect(byId(t.attendanceSession, 's1').student_id).toBe(claimerId);
    expect(byId(t.attendanceSession, 's2').student_id).toBe(shadowId);
    expect(byId(t.studentGradeClassEnrollment, 'e1').student_id).toBe(claimerId);
    expect(byId(t.gradeMark, 'm1').student_id).toBe(claimerId);
    expect(byId(t.assignmentSubmission, 'sub1').student_id).toBe(claimerId);
    expect(byId(t.user, shadowId).identity_state).toBe(`claimed_by_${claimerId}`);
    expect(byId(t.user, claimerId)).toMatchObject({ full_name: 'Nimal', school_id: 'school-1' });
  });

  it('rolls everything back when a step fails part-way', async () => {
    const db = createFakeDb(seed(), { failOn: 'gradeMark.updateMany' });
    await expect(claimShadowStudentAtomically(db, input)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    const t = db.tables;
    expect(byId(t.dailyAttendance, 'd1').student_id).toBe(shadowId);
    expect(byId(t.attendanceSession, 's1').student_id).toBe(shadowId);
    expect(byId(t.studentGradeClassEnrollment, 'e1').student_id).toBe(shadowId);
    expect(byId(t.classroomStudent, 'seat-1')).toMatchObject({
      student_id: shadowId,
      claimed_at: null,
    });
    expect(byId(t.user, shadowId).identity_state).toBe('shadow');
  });

  it('refuses a second claim of an already claimed code by someone else', async () => {
    const db = createFakeDb(seed());
    await claimShadowStudentAtomically(db, input);
    await expect(
      claimShadowStudentAtomically(db, { ...input, claimingUserId: 'intruder' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(byId(db.tables.dailyAttendance, 'd1').student_id).toBe(claimerId);
  });

  it('is idempotent for the same claimer', async () => {
    const db = createFakeDb(seed());
    await claimShadowStudentAtomically(db, input);
    await expect(claimShadowStudentAtomically(db, input)).resolves.toMatchObject({
      student_id: claimerId,
    });
  });

  it('refuses to re-key a seat that belongs to a real account', async () => {
    const data = seed();
    data.user[0].identity_state = 'active';
    const db = createFakeDb(data);
    await expect(claimShadowStudentAtomically(db, input)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    expect(byId(db.tables.dailyAttendance, 'd1').student_id).toBe(shadowId);
  });

  it('returns NOT_FOUND for an unknown invite code', async () => {
    const db = createFakeDb(seed());
    await expect(
      claimShadowStudentAtomically(db, { ...input, inviteCode: 'EDL-NOPE-NOPE' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
