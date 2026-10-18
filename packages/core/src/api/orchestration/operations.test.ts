import { describe, expect, it } from 'vitest';

import { attendanceAPI } from './operations';

describe('operations API contract coverage', () => {
  it('keeps the grade-class attendance snapshot behind the attendance oRPC contract', () => {
    expect(attendanceAPI.getGradeClassAttendanceSnapshot).toBeTypeOf('function');
  });
});
