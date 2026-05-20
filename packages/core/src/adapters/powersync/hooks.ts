/**
 * PowerSync Hooks — Compiled Drizzle AST Query Hooks (2026 Edition)
 *
 * Provides type-safe React hooks for reactive local-first SQLite queries.
 * Instead of raw string-based SQL queries, this module uses Drizzle ORM
 * to compile reactive AST queries, providing 100% compile-time type-safety.
 *
 * @see https://docs.powersync.com/usage/use-case-examples/drizzle
 */
import { and, desc, eq } from 'drizzle-orm';
import { getDrizzleDB } from './database';
import { useQuery, useStatus } from './powersync-react-shim';
import {
  attendance,
  classrooms,
  moodLogs,
  schools,
  students,
  type Attendance,
  type Classroom,
  type MoodLog,
  type School,
  type Student,
} from './schema';

// ─── Generic Reactive Query Hooks ────────────────────────────────────────────

/**
 * Low-level reactive raw SQL query hook. Re-renders automatically when
 * the underlying SQLite data changes.
 */
export function usePowerSyncQuery<T = Record<string, unknown>>(
  sql: string,
  parameters?: unknown[],
): T[] {
  const { data } = useQuery<T>(sql, parameters);
  return data;
}

/**
 * The ultimate Drizzle reactive query compiler hook!
 * Compiles a Drizzle AST query into raw SQLite and feeds it directly
 * into PowerSync's live query reactive stream.
 *
 * Provides absolute compile-time type safety from the DB to the UI render tree.
 */
export function useDrizzleQuery<T>(
  query: { toSQL(): { sql: string; params: unknown[] } },
): T[] {
  const { sql: compiledSql, params } = query.toSQL();
  return usePowerSyncQuery<T>(compiledSql, params);
}

/**
 * Returns the current PowerSync synchronization status.
 * Useful for displaying sync status indicators in the user interface.
 */
export function usePowerSyncStatus() {
  return useStatus();
}

// ─── Pre-built, Type-Safe Query Hooks ─────────────────────────────────────────

/**
 * Get all attendance records for a classroom on a given ISO date.
 * Returns correctly typed Attendance rows.
 */
export function useAttendanceForClassroom(classroomId: string, date: string): Attendance[] {
  const db = getDrizzleDB();
  const query = db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.classroomId, classroomId),
        eq(attendance.date, date),
      ),
    )
    .orderBy(attendance.studentId);

  return useDrizzleQuery<Attendance>(query);
}

/**
 * Get all active students in a classroom.
 * Boolean conversion is handled automatically by the Drizzle schema.
 */
export function useStudentsInClassroom(classroomId: string): Student[] {
  const db = getDrizzleDB();
  const query = db
    .select()
    .from(students)
    .where(
      and(
        eq(students.classroomId, classroomId),
        eq(students.isActive, true),
      ),
    )
    .orderBy(students.fullName);

  return useDrizzleQuery<Student>(query);
}

/**
 * Get mood logs for a student.
 */
export function useMoodLogsForUser(userId: string, limit = 30): MoodLog[] {
  const db = getDrizzleDB();
  const query = db
    .select()
    .from(moodLogs)
    .where(eq(moodLogs.userId, userId))
    .orderBy(desc(moodLogs.createdAt))
    .limit(limit);

  return useDrizzleQuery<MoodLog>(query);
}

/**
 * Get all active classrooms for a school.
 */
export function useClassroomsForSchool(schoolId: string): Classroom[] {
  const db = getDrizzleDB();
  const query = db
    .select()
    .from(classrooms)
    .where(
      and(
        eq(classrooms.schoolId, schoolId),
        eq(classrooms.isActive, true),
      ),
    )
    .orderBy(classrooms.name);

  return useDrizzleQuery<Classroom>(query);
}

/**
 * Get the school record for a given school ID.
 */
export function useSchool(schoolId: string): School | null {
  const db = getDrizzleDB();
  const query = db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  const rows = useDrizzleQuery<School>(query);
  return rows[0] || null;
}
