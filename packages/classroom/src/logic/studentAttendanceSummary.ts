/**
 * Student profile attendance card. The history comes from attendance.getStudentHistory;
 * a caller the school does not allow to see it gets a 403, which must not blank the rest
 * of the profile, and "no records" must not read as a perfect 100%.
 */
export type StudentAttendanceSummary =
  | { kind: 'rate'; percent: number; days: number }
  | { kind: 'no_records' }
  | { kind: 'unavailable' };

export function summarizeStudentAttendance(
  records: ReadonlyArray<{ status: string }> | null,
): StudentAttendanceSummary {
  if (records === null) return { kind: 'unavailable' };
  if (records.length === 0) return { kind: 'no_records' };
  // Same rule the card always used: only 'present' counts.
  const attended = records.filter((r) => r.status === 'present').length;
  return {
    kind: 'rate',
    percent: Math.round((attended / records.length) * 100),
    days: records.length,
  };
}

export function attendanceSummaryLabel(summary: StudentAttendanceSummary): string {
  return summary.kind === 'rate' ? `${summary.percent}%` : '—';
}
