import { describe, expect, it } from 'vitest';
import { attendanceSummaryLabel, summarizeStudentAttendance } from './studentAttendanceSummary';

describe('student profile attendance summary', () => {
  it('shows a dash, not 100%, when there are no records or access is denied', () => {
    expect(attendanceSummaryLabel(summarizeStudentAttendance([]))).toBe('—');
    expect(attendanceSummaryLabel(summarizeStudentAttendance(null))).toBe('—');
    expect(summarizeStudentAttendance(null)).toEqual({ kind: 'unavailable' });
  });

  it('counts only present days, as the card always did', () => {
    const summary = summarizeStudentAttendance([
      { status: 'present' },
      { status: 'late' },
      { status: 'absent' },
      { status: 'excused' },
    ]);
    expect(summary).toEqual({ kind: 'rate', percent: 25, days: 4 });
    expect(attendanceSummaryLabel(summary)).toBe('25%');
  });
});
