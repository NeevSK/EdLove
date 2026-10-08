import { supabaseClient as defaultClient } from '@repo/core/adapters/supabaseClient';
import { strictRetryPolicy } from '@repo/core/effect/Schedules';
import { Duration, Effect, pipe, Schema } from 'effect';
import {
  AgentDatabaseError,
  AgentDomainError,
  AgentSchemaError,
  AgentTimeoutError,
  type ClassroomRow,
  type CoordinationGap,
  CoordinationGapSchema,
} from './agentContracts';

type SupabaseQueryClient = typeof defaultClient;

/**
 * Hardened Effect workflow for discovering staff relief coordination gaps.
 *
 * Resilience Invariants:
 * 1. Bounded by a 10-second timeout to prevent stalling the agent loop.
 * 2. Retries transient connection blips using strictRetryPolicy (exponential with recurs(3)).
 * 3. Output validated against CoordinationGapSchema before crossing the boundary.
 */
export function checkSectionReliefGapsEffect(
  schoolId: string,
  sectionId?: string,
  clientOverride?: SupabaseQueryClient,
): Effect.Effect<CoordinationGap[], AgentDomainError, never> {
  const db = clientOverride ?? defaultClient;

  return pipe(
    Effect.tryPromise({
      try: async () => {
        const today = new Date().toISOString().split('T')[0] ?? '';

        // 1. Find teachers on approved leave today
        const { data: leaves, error: leavesError } = await db
          .from('staff_leaves')
          .select('user_id, leave_type, users(full_name)')
          .eq('school_id', schoolId)
          .eq('status', 'approved')
          .lte('start_date', today)
          .gte('end_date', today);

        if (leavesError) {
          throw new Error(`Failed to query staff_leaves: ${leavesError.message}`);
        }

        if (!leaves || leaves.length === 0) {
          return [] as CoordinationGap[];
        }

        const absentTeacherIds = leaves.map((l: any) => l.user_id as string).filter(Boolean);

        // 2. Find classrooms assigned to absent teachers
        let classroomQuery = db
          .from('classrooms')
          .select('id, name, grade, teacher_id')
          .in('teacher_id', absentTeacherIds)
          .eq('school_id', schoolId);

        if (sectionId) {
          classroomQuery = classroomQuery.eq('id', sectionId);
        }

        const { data: classrooms, error: classroomsError } = await classroomQuery.limit(10);
        if (classroomsError) {
          throw new Error(`Failed to query classrooms: ${classroomsError.message}`);
        }

        if (!classrooms || classrooms.length === 0) {
          return [] as CoordinationGap[];
        }

        // 3. Find available teachers with no leave today
        const availableTeachersQuery = db
          .from('users')
          .select('id, full_name')
          .eq('school_id', schoolId)
          .eq('authority', 'teacher');

        const { data: allTeachers, error: teachersError } =
          absentTeacherIds.length > 0
            ? await availableTeachersQuery.not(
                'id',
                'in',
                `(${absentTeacherIds.map((id) => `"${id}"`).join(',')})`,
              )
            : await availableTeachersQuery;

        if (teachersError) {
          throw new Error(`Failed to query available teachers: ${teachersError.message}`);
        }

        const rawGaps: unknown[] = [];
        for (const classroom of classrooms) {
          const matchingLeave = leaves.find((l: any) => l.user_id === classroom.teacher_id);
          const absentTeacher = matchingLeave
            ? ((matchingLeave as any).users?.full_name ?? 'Absent teacher')
            : 'Absent teacher';

          const suggestion = (allTeachers as any[])?.[0]?.full_name
            ? `Assign ${(allTeachers as any[])[0].full_name} (available)`
            : 'No free teacher found — check timetable';

          rawGaps.push({
            id: `relief-${classroom.id}-${today}`,
            type: 'relief',
            title: `Relief needed: ${classroom.name}`,
            description: `${absentTeacher} is on approved leave. ${classroom.name} may be uncovered.`,
            priority: 'high',
            suggestedAction: suggestion,
            context: {
              classroomId: classroom.id,
              classroomName: classroom.name,
              absentTeacherIds,
              availableTeachers: allTeachers ?? [],
            },
          });
        }

        // 4. Validate output with Schema
        const decoded = Schema.decodeUnknownSync(Schema.Array(CoordinationGapSchema))(rawGaps);
        return Array.from(decoded);
      },
      catch: (err) =>
        new AgentDatabaseError({
          message: err instanceof Error ? err.message : String(err),
          operation: 'checkSectionReliefGaps',
        }),
    }),
    Effect.retry(strictRetryPolicy),
    Effect.timeout(Duration.seconds(10)),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(
        new AgentTimeoutError({
          message: 'Relief gap query timed out after 10s',
          timeoutMs: 10000,
        }),
      ),
    ),
  );
}

/**
 * Hardened Effect workflow for detecting pending classroom attendance gaps.
 *
 * Resilience Invariants:
 * 1. Bounded by a 10-second timeout.
 * 2. Retries transient connection blips using strictRetryPolicy.
 * 3. Returns validated CoordinationGap records.
 */
export function detectAttendanceGapsEffect(
  classrooms: ClassroomRow[],
  today: string,
  clientOverride?: SupabaseQueryClient,
): Effect.Effect<CoordinationGap[], AgentDomainError, never> {
  const db = clientOverride ?? defaultClient;

  return pipe(
    Effect.tryPromise({
      try: async () => {
        if (classrooms.length === 0) return [] as CoordinationGap[];

        const classroomIds = classrooms.map((c) => c.id);

        const { data: markedToday, error } = await db
          .from('attendance')
          .select('classroom_id')
          .in('classroom_id', classroomIds)
          .eq('date', today);

        if (error) {
          throw new Error(`Failed to query attendance: ${error.message}`);
        }

        const markedIds = new Set((markedToday ?? []).map((r: any) => r.classroom_id));
        const rawGaps: unknown[] = [];

        for (const c of classrooms.filter((c) => !markedIds.has(c.id))) {
          rawGaps.push({
            id: `attendance-${c.id}-${today}`,
            type: 'relief',
            title: `Attendance pending: ${c.name}`,
            description: `Today's attendance for ${c.name} has not been recorded yet.`,
            priority: 'high',
            suggestedAction: 'Mark attendance now',
            context: { classroomId: c.id, classroomName: c.name },
          });
        }

        const decoded = Schema.decodeUnknownSync(Schema.Array(CoordinationGapSchema))(rawGaps);
        return Array.from(decoded);
      },
      catch: (err) =>
        new AgentDatabaseError({
          message: err instanceof Error ? err.message : String(err),
          operation: 'detectAttendanceGaps',
        }),
    }),
    Effect.retry(strictRetryPolicy),
    Effect.timeout(Duration.seconds(10)),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(
        new AgentTimeoutError({
          message: 'Attendance gap query timed out after 10s',
          timeoutMs: 10000,
        }),
      ),
    ),
  );
}
