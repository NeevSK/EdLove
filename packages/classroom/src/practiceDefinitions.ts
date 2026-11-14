import type { PracticeDefinition } from '@repo/core/lib/practiceSessionResolver';

export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'excused'] as const;
export type AttendancePracticeStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendancePracticeDocument = Readonly<{
  version: 1;
  dates: Readonly<Record<string, Readonly<Record<string, AttendancePracticeStatus>>>>;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStatus(value: unknown): value is AttendancePracticeStatus {
  return (
    typeof value === 'string' && ATTENDANCE_STATUSES.includes(value as AttendancePracticeStatus)
  );
}

export function parseAttendancePracticeDocument(value: string): AttendancePracticeDocument {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.dates)) {
    throw new Error(
      'The saved attendance practice workspace is unreadable. It has not been removed.',
    );
  }
  const dates: Record<string, Record<string, AttendancePracticeStatus>> = {};
  for (const [date, marks] of Object.entries(parsed.dates)) {
    if (!isRecord(marks))
      throw new Error(
        'The saved attendance practice workspace is unreadable. It has not been removed.',
      );
    const parsedMarks: Record<string, AttendancePracticeStatus> = {};
    for (const [studentId, status] of Object.entries(marks)) {
      if (!isStatus(status))
        throw new Error(
          'The saved attendance practice workspace has invalid marks. It has not been removed.',
        );
      parsedMarks[studentId] = status;
    }
    dates[date] = parsedMarks;
  }
  return { version: 1, dates };
}

export const CLASSROOM_PRACTICE_DEFINITIONS: Readonly<Record<string, PracticeDefinition>> = {
  attendance: {
    featureId: 'attendance',
    documentSchemaId: 'attendance-daily-roll-call-v1',
    codec: {
      parse: parseAttendancePracticeDocument,
      stringify: JSON.stringify,
    },
    createInitialState: () => ({ version: 1, dates: {} }),
  },
};
