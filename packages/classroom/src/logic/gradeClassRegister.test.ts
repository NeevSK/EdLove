import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/core/api/attendance', () => ({ attendanceAPI: {} }));

import { buildRegister, localDate, toDailyAttendanceRows } from './gradeClassRegister';

const s1 = '123e4567-e89b-12d3-a456-426614174020';
const s2 = '123e4567-e89b-12d3-a456-426614174021';
const gc = '123e4567-e89b-12d3-a456-426614174004';

describe('grade-class register (attendance model A)', () => {
  it('merges saved statuses and defaults the rest to present', () => {
    const { students } = buildRegister(
      [
        { enrollment_id: 'e1', student_id: s1, full_name: 'Nimal' },
        { enrollment_id: 'e2', student_id: s2, full_name: 'Kamala' },
      ],
      [{ student_id: s2, status: 'absent' }],
    );
    expect(students.map((s) => [s.student_id, s.status])).toEqual([
      [s1, 'present'],
      [s2, 'absent'],
    ]);
  });

  it('includes shadow students without explicit account on register and marks them markable', () => {
    const register = buildRegister(
      [
        { enrollment_id: 'e1', student_id: s1, full_name: 'Nimal' },
        { enrollment_id: 'e3', student_id: null, full_name: 'Shadow Student' },
      ],
      [],
    );
    expect(register.students).toHaveLength(2);
    expect(register.students[1]!.student_id).toBe('e3');
    expect(register.students[1]!.full_name).toBe('Shadow Student');
    expect(register.excludedWithoutAccount).toBe(0);
  });

  it('writes grade_class_id rows for daily_attendance', () => {
    const { students } = buildRegister(
      [{ enrollment_id: 'e1', student_id: s1, full_name: 'N' }],
      [],
    );
    expect(toDailyAttendanceRows(gc, '2026-10-17', students)).toEqual([
      { gradeClassId: gc, studentId: s1, status: 'present', date: '2026-10-17' },
    ]);
  });

  it('uses the local calendar date', () => {
    expect(localDate(new Date(2026, 9, 17, 0, 15))).toBe('2026-10-17');
  });
});
