import { attendanceAPI } from '@repo/core/api/attendance';
import type {
  AttendanceStatus,
  StudentAttendance,
} from '@repo/core/logic/schemas/attendance.schema';

/**
 * Grade-class register (attendance model A: grade_classes + daily_attendance).
 *
 * The roster is the grade class's active enrollments. Students that exist only as
 * name-only ("shadow") classroom_students rows have no user account, so they are not
 * enrolled and cannot be written to daily_attendance (student_id is a required FK).
 */
export const SHADOW_STUDENT_NOTICE =
  'Students added by name only (no EdLove account yet) are not on the class register and ' +
  'cannot be marked until they claim their invite.';

export const PICK_GRADE_CLASS_NOTICE =
  'Attendance is taken for your class (for example 5A), not for a subject classroom. ' +
  'Choose a class to open its register.';

export type RosterRow = {
  enrollment_id: string;
  student_id: string | null;
  full_name: string | null;
};

export type SavedRow = { student_id: string; status: string };

export type Register = {
  students: StudentAttendance[];
  /** Roster rows without a linked account; excluded from the register and from saves. */
  excludedWithoutAccount: number;
};

const MARKABLE: readonly AttendanceStatus[] = ['present', 'absent', 'late'];

export function buildRegister(roster: RosterRow[], saved: SavedRow[]): Register {
  const savedStatus = new Map(saved.map((row) => [row.student_id, row.status]));
  let excludedWithoutAccount = 0;
  const students: StudentAttendance[] = [];
  for (const row of roster) {
    if (!row.student_id) {
      excludedWithoutAccount += 1;
      continue;
    }
    const prior = savedStatus.get(row.student_id);
    students.push({
      id: row.enrollment_id,
      student_id: row.student_id,
      full_name: row.full_name?.trim() || 'Unnamed student',
      roll_number: null,
      // Unmarked students start present locally; only an explicit save persists it.
      status: MARKABLE.includes(prior as AttendanceStatus)
        ? (prior as AttendanceStatus)
        : 'present',
    });
  }
  return { students, excludedWithoutAccount };
}

export function toDailyAttendanceRows(
  gradeClassId: string,
  date: string,
  students: StudentAttendance[],
) {
  return students
    .filter((student) => Boolean(student.student_id))
    .map((student) => ({
      gradeClassId,
      studentId: student.student_id,
      status: student.status,
      date,
    }));
}

export function localDate(now: Date = new Date()): string {
  // The school day is local; toISOString() would roll over at 05:30 in Sri Lanka.
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export async function loadGradeClassRegister(gradeClassId: string, date: string) {
  const [roster, snapshot] = await Promise.all([
    attendanceAPI.getGradeClassRoster(gradeClassId, date),
    attendanceAPI.getClassroomAttendanceSnapshot(gradeClassId, date),
  ]);
  return buildRegister(roster, snapshot.records);
}

export async function saveGradeClassRegister(
  gradeClassId: string,
  date: string,
  students: StudentAttendance[],
) {
  const rows = toDailyAttendanceRows(gradeClassId, date, students);
  if (rows.length === 0) return [];
  return attendanceAPI.batchRecord(rows);
}
