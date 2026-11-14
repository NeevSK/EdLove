import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getStudentHistory } = vi.hoisted(() => ({ getStudentHistory: vi.fn() }));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { attendance: { getStudentHistory } },
}));

import { Effect } from 'effect';
import { attendanceAPI, attendanceAPI$ } from '../attendance';

const row = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  student_id: 's-1',
  grade_class_id: 'gc-1',
  status: 'present',
  attendance_date: '2026-10-21',
  student_name: 'Nimal',
};

describe('student attendance history client', () => {
  beforeEach(() => {
    getStudentHistory.mockReset();
    getStudentHistory.mockResolvedValue([row]);
  });

  it('calls the history procedure with the class the caller views the student through', async () => {
    await expect(
      attendanceAPI.getStudentAttendanceTimeline('s-1', { classroomId: 'cls-1' }),
    ).resolves.toEqual([row]);
    expect(getStudentHistory).toHaveBeenCalledWith({
      query: { studentId: 's-1', gradeClassId: 'cls-1' },
    });
  });

  it('prefers an explicit grade class and passes the date range and limit', async () => {
    await attendanceAPI.getStudentAttendanceTimeline('s-1', {
      gradeClassId: 'gc-1',
      classroomId: 'cls-1',
      from: '2026-10-01',
      to: '2026-10-31',
      limit: 50,
    });
    expect(getStudentHistory).toHaveBeenCalledWith({
      query: {
        studentId: 's-1',
        gradeClassId: 'gc-1',
        from: '2026-10-01',
        to: '2026-10-31',
        limit: 50,
      },
    });
  });

  it('getForStudent narrows to one day', async () => {
    await attendanceAPI.getForStudent('s-1', '2026-10-21');
    expect(getStudentHistory).toHaveBeenCalledWith({
      query: { studentId: 's-1', from: '2026-10-21', to: '2026-10-21' },
    });
  });

  it('the Effect variants use the same procedure', async () => {
    await expect(
      Effect.runPromise(attendanceAPI$.getStudentAttendanceTimeline('s-1', 10)),
    ).resolves.toEqual([row]);
    expect(getStudentHistory).toHaveBeenCalledWith({ query: { studentId: 's-1', limit: 10 } });
  });
});
