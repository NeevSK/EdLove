/**
 * PowerSync Hooks — Typed React Hooks (2026 Elegant Edition)
 *
 * Thin wrappers around @powersync/react that add compile-time type safety
 * via the Database type generated from AppSchema.
 *
 * 2026 Addition: Each typed hook applies a `mapRow` transform to cast
 * SQLite integer fields (0|1) to proper TypeScript booleans. This prevents
 * primitive leakage where UI components expecting `true/false` receive `1/0`.
 *
 * Usage:
 *   const rows = useStudentsInClassroom(classroomId);
 *   rows[0].is_active // → true | false (not 1 | 0)
 */
import { useQuery, useStatus } from './powersync-react-shim';
import type { Database } from './schema';

// ─── Raw Row Types (from SQLite schema) ───────────────────────────────────────
type RawAttendanceRow = Database['attendance'];
type RawStudentRow = Database['students'];
type RawClassroomRow = Database['classrooms'];
type RawMoodLogRow = Database['mood_logs'];
type RawSchoolRow = Database['schools'];

// ─── Mapped Row Types (TypeScript-safe with booleans) ────────────────────────
export type AttendanceRow = RawAttendanceRow;

export type StudentRow = Omit<RawStudentRow, 'is_active'> & {
  is_active: boolean;
};

export type ClassroomRow = Omit<RawClassroomRow, 'is_active'> & {
  is_active: boolean;
};

export type MoodLogRow = RawMoodLogRow;

export type SchoolRow = Omit<RawSchoolRow, 'is_active'> & {
  is_active: boolean;
};

// ─── SQLite → TypeScript Primitive Mappers ───────────────────────────────────

function mapStudent(row: RawStudentRow): StudentRow {
  return { ...row, is_active: row.is_active === 1 };
}

function mapClassroom(row: RawClassroomRow): ClassroomRow {
  return { ...row, is_active: row.is_active === 1 };
}

function mapSchool(row: RawSchoolRow): SchoolRow {
  return { ...row, is_active: row.is_active === 1 };
}

// ─── Generic Query Hook ───────────────────────────────────────────────────────

/**
 * Reactive SQL query hook. Re-renders automatically when the underlying
 * SQLite data changes (via PowerSync's watch mechanism).
 */
export function usePowerSyncQuery<T = Record<string, unknown>>(
  sql: string,
  parameters?: unknown[],
): T[] {
  const { data } = useQuery<T>(sql, parameters);
  return data;
}

/**
 * Returns the current PowerSync sync status.
 * Useful for showing a "syncing..." indicator.
 */
export function usePowerSyncStatus() {
  return useStatus();
}

// ─── Pre-built, Type-Safe, Mapped Query Hooks ─────────────────────────────────

/**
 * Get all attendance records for a classroom on a given ISO date.
 * Returns correctly typed AttendanceRow objects.
 */
export function useAttendanceForClassroom(
  classroomId: string,
  date: string,
): AttendanceRow[] {
  return usePowerSyncQuery<RawAttendanceRow>(
    'SELECT * FROM attendance WHERE classroom_id = ? AND date = ? ORDER BY student_id',
    [classroomId, date],
  );
}

/**
 * Get all active students in a classroom.
 * Maps is_active (0|1) → boolean.
 */
export function useStudentsInClassroom(classroomId: string): StudentRow[] {
  const rows = usePowerSyncQuery<RawStudentRow>(
    'SELECT * FROM students WHERE classroom_id = ? AND is_active = 1 ORDER BY full_name',
    [classroomId],
  );
  return rows.map(mapStudent);
}

/**
 * Get mood logs for a student.
 */
export function useMoodLogsForStudent(studentId: string, limit = 30): MoodLogRow[] {
  return usePowerSyncQuery<MoodLogRow>(
    'SELECT * FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC LIMIT ?',
    [studentId, limit],
  );
}

/**
 * Get all active classrooms for a school.
 * Maps is_active (0|1) → boolean.
 */
export function useClassroomsForSchool(schoolId: string): ClassroomRow[] {
  const rows = usePowerSyncQuery<RawClassroomRow>(
    'SELECT * FROM classrooms WHERE school_id = ? AND is_active = 1 ORDER BY name',
    [schoolId],
  );
  return rows.map(mapClassroom);
}

/**
 * Get the school record for a given school ID.
 * Maps is_active (0|1) → boolean.
 */
export function useSchool(schoolId: string): SchoolRow | null {
  const rows = usePowerSyncQuery<RawSchoolRow>(
    'SELECT * FROM schools WHERE id = ? LIMIT 1',
    [schoolId],
  );
  const raw = rows[0];
  return raw ? mapSchool(raw) : null;
}
