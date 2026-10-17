/**
 * PowerSync Hooks — Compiled Drizzle AST Query Hooks (2026 Edition)
 *
 * Provides type-safe React hooks for reactive local-first SQLite queries.
 * Instead of raw string-based SQL queries, this module uses Drizzle ORM
 * to compile reactive AST queries, providing 100% compile-time type-safety.
 *
 * @see https://docs.powersync.com/usage/use-case-examples/drizzle
 */

import { toCompilableQuery } from '@powersync/drizzle-driver';
import {
  getActivePowerSyncDB,
  getDrizzleDB,
  registerPolicyVersionHash,
  setActiveCapabilityToken,
} from '@repo/core/adapters/powersync/database';
import { useQuery, useStatus } from '@powersync/react';
import {
  type Attendance,
  attendance,
  type Classroom,
  classrooms,
  type MoodLog,
  moodLogs,
  type PolicyVersion,
  policyVersion,
  type School,
  type Student,
  schools,
  students,
} from '@repo/core/adapters/powersync/schema';
import { and, desc, eq, type Query } from 'drizzle-orm';
import { useEffect, useMemo } from 'react';

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
export function useDrizzleQuery<T>(query: {
  execute: () => Promise<T | T[]>;
  toSQL: () => Query;
}): T[] {
  const compilableQuery = useMemo(() => toCompilableQuery<T>(query), [query]);
  const { data } = useQuery<T>(compilableQuery);
  return data;
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
    .where(and(eq(attendance.classroomId, classroomId), eq(attendance.date, date)))
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
    .where(and(eq(students.classroomId, classroomId), eq(students.isActive, true)))
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
    .where(and(eq(classrooms.schoolId, schoolId), eq(classrooms.isArchived, false)))
    .orderBy(classrooms.name);

  return useDrizzleQuery<Classroom>(query);
}

/**
 * Get the school record for a given school ID.
 */
export function useSchool(schoolId: string): School | null {
  const db = getDrizzleDB();
  const query = db.select().from(schools).where(eq(schools.id, schoolId)).limit(1);

  const rows = useDrizzleQuery<School>(query);
  return rows[0] || null;
}

/**
 * usePolicyVersion — reactively watches for policy_version changes.
 * When the hash changes, Active capability tokens are invalidated
 * per ADR-006 and ADR-012.
 */
export function usePolicyVersion(): PolicyVersion | null {
  if (!getActivePowerSyncDB()) return null;
  const db = getDrizzleDB();
  // The browser runtime can be active before its Drizzle query facade is
  // ready (or can be intentionally disabled while offline). Do not let that
  // transient state crash the application shell.
  if (!db || typeof db.select !== 'function' || typeof db.select()?.from !== 'function') {
    return null;
  }
  const query = useMemo(
    () => (db && typeof db.select === 'function' ? db.select().from(policyVersion).limit(1) : null),
    [db],
  );

  const rows = useDrizzleQuery<PolicyVersion>(
    query ?? ({ execute: async () => [], toSQL: () => ({ sql: '', params: [] }) } as any),
  );
  return rows[0] || null;
}

/**
 * usePolicyVersionInvalidation — watches policy_version and clears
 * capability tokens when the hash changes.
 * Consumers don't need to call this directly; it's wired at the app level.
 */
let _lastPolicyHash: string | null = null;

export function usePolicyVersionInvalidation(onInvalidated?: () => void): void {
  const version = usePolicyVersion();

  useEffect(() => {
    if (!version || version.hash === _lastPolicyHash) return;

    registerPolicyVersionHash(version.hash);
    if (_lastPolicyHash !== null) {
      // Hash changed — invalidate tokens and all locally cached Cedar decisions.
      setActiveCapabilityToken(null);
      onInvalidated?.();
    }
    _lastPolicyHash = version.hash;
  }, [onInvalidated, version]);
}
