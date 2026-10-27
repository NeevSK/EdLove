import type { AttendanceStatus, StudentAttendance } from '@repo/core/logic';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const AttendanceStatusEnum = z.enum(['present', 'absent', 'late']);

export const StudentAttendanceRecordSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  full_name: z.string(),
  roll_number: z.string().nullable().optional(),
  status: AttendanceStatusEnum,
});

export const AttendanceStatsSchema = z.object({
  present: z.number().int().nonnegative(),
  absent: z.number().int().nonnegative(),
  late: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type AttendanceStats = z.infer<typeof AttendanceStatsSchema>;

export const AttendanceSessionContextSchema = z.object({
  classroomId: z.string(),
  date: z.string(),
  students: z.array(StudentAttendanceRecordSchema),
  searchQuery: z.string(),
  error: z.string().nullable(),
  isSaving: z.boolean(),
});

export type AttendanceSessionContext = z.infer<typeof AttendanceSessionContextSchema>;

export function calculateAttendanceStats(students: StudentAttendance[]): AttendanceStats {
  const stats: AttendanceStats = {
    present: 0,
    absent: 0,
    late: 0,
    total: students.length,
  };

  for (const student of students) {
    if (student.status === 'present') stats.present += 1;
    else if (student.status === 'absent') stats.absent += 1;
    else if (student.status === 'late') stats.late += 1;
  }

  return stats;
}

export type AttendanceSessionEvents =
  | { type: 'START_FETCH' }
  | { type: 'FETCH_SUCCESS'; students: StudentAttendance[] }
  | { type: 'FETCH_FAILURE'; error: string }
  | { type: 'UPDATE_STATUS'; studentId: string; status: AttendanceStatus }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'APPLY_RAPID_ABSENTEES'; tokens: string }
  | { type: 'MARK_ALL'; status: AttendanceStatus }
  | { type: 'START_SAVING' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_FAILURE'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialAttendanceContext: AttendanceSessionContext = {
  classroomId: '',
  date: new Date().toISOString().split('T')[0] ?? '',
  students: [],
  searchQuery: '',
  error: null,
  isSaving: false,
};

export const attendanceSessionMachine = createMachine({
  id: 'attendanceSession',
  initial: 'loading',
  schemas: {
    context: AttendanceSessionContextSchema,
    events: {
      START_FETCH: types<void>(),
      FETCH_SUCCESS: types<{ students: StudentAttendance[] }>(),
      FETCH_FAILURE: types<{ error: string }>(),
      UPDATE_STATUS: types<{ studentId: string; status: AttendanceStatus }>(),
      SET_SEARCH_QUERY: types<{ query: string }>(),
      APPLY_RAPID_ABSENTEES: types<{ tokens: string }>(),
      MARK_ALL: types<{ status: AttendanceStatus }>(),
      START_SAVING: types<void>(),
      SAVE_SUCCESS: types<void>(),
      SAVE_FAILURE: types<{ error: string }>(),
      CLEAR_ERROR: types<void>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<AttendanceSessionContext> }) => ({
    ...initialAttendanceContext,
    ...input,
  }),
  states: {
    loading: {
      on: {
        START_FETCH: {
          target: 'loading',
        },
        FETCH_SUCCESS: ({ context, event }) => ({
          target: 'marking',
          context: {
            ...context,
            students: event.students,
            error: null,
          },
        }),
        FETCH_FAILURE: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    marking: {
      on: {
        UPDATE_STATUS: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            students: context.students.map((s) =>
              s.id === event.studentId || s.student_id === event.studentId
                ? { ...s, status: event.status }
                : s,
            ),
          },
        }),
        SET_SEARCH_QUERY: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            searchQuery: event.query,
          },
        }),
        APPLY_RAPID_ABSENTEES: ({ context, event }) => {
          const tokens = event.tokens
            .split(/[,\s]+/)
            .map((t) => t.trim())
            .filter(Boolean);
          const rolls = new Set(
            tokens
              .map((t) => Number.parseInt(t, 10))
              .filter((n) => Number.isFinite(n) && n > 0),
          );

          return {
            target: undefined,
            context: {
              ...context,
              students: context.students.map((student, idx) => {
                const roll =
                  typeof student.roll_number === 'number'
                    ? student.roll_number
                    : Number.parseInt(String(student.roll_number ?? idx + 1), 10);
                const isAbsent = rolls.has(roll);
                return {
                  ...student,
                  status: (isAbsent ? 'absent' : 'present') as AttendanceStatus,
                };
              }),
            },
          };
        },
        MARK_ALL: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            students: context.students.map((s) => ({ ...s, status: event.status })),
          },
        }),
        START_SAVING: {
          target: 'saving',
          context: ({ context }) => ({
            ...context,
            isSaving: true,
            error: null,
          }),
        },
      },
    },
    saving: {
      on: {
        SAVE_SUCCESS: {
          target: 'synced',
          context: ({ context }) => ({
            ...context,
            isSaving: false,
            error: null,
          }),
        },
        SAVE_FAILURE: ({ context, event }) => ({
          target: 'marking',
          context: {
            ...context,
            isSaving: false,
            error: event.error,
          },
        }),
      },
    },
    synced: {
      on: {
        UPDATE_STATUS: ({ context, event }) => ({
          target: 'marking',
          context: {
            ...context,
            students: context.students.map((s) =>
              s.id === event.studentId || s.student_id === event.studentId
                ? { ...s, status: event.status }
                : s,
            ),
          },
        }),
        START_SAVING: {
          target: 'saving',
          context: ({ context }) => ({
            ...context,
            isSaving: true,
          }),
        },
      },
    },
    error: {
      on: {
        START_FETCH: {
          target: 'loading',
          context: ({ context }) => ({
            ...context,
            error: null,
          }),
        },
      },
    },
  },
  on: {
    CLEAR_ERROR: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        error: null,
      },
    }),
    RESET: () => ({
      target: '.loading',
      context: initialAttendanceContext,
    }),
  },
});

export type AttendanceSessionMachine = typeof attendanceSessionMachine;
export type AttendanceSessionActor = ReturnType<typeof createAttendanceSessionActor>;

/**
 * Creates and starts an AttendanceSession actor.
 */
export function createAttendanceSessionActor(initial?: Partial<AttendanceSessionContext>) {
  const actor = createActor(attendanceSessionMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for loading classroom attendance roster and saved daily records in parallel.
 */
export async function executeFetchAttendanceRosterEffect(
  actor: AttendanceSessionActor,
  dependencies: {
    classroomId: string;
    date: string;
    fetchRoster: (classroomId: string) => Promise<unknown[]>;
    fetchSnapshot: (classroomId: string, date: string) => Promise<{ records: unknown[] }>;
  },
): Promise<{ success: boolean; students?: StudentAttendance[]; error?: string }> {
  actor.send({ type: 'START_FETCH' });

  const program = Effect.gen(function* () {
    const [rosterRaw, snapshotRaw] = yield* Effect.all(
      [
        Effect.tryPromise({
          try: () => dependencies.fetchRoster(dependencies.classroomId),
          catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
        }),
        Effect.tryPromise({
          try: () => dependencies.fetchSnapshot(dependencies.classroomId, dependencies.date),
          catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
        }),
      ],
      { concurrency: 2 },
    );

    const snapshot = snapshotRaw as { records: { student_id: string; status: AttendanceStatus }[] };
    const savedStatus = new Map<string, AttendanceStatus>(
      (snapshot?.records ?? []).map((r) => [r.student_id, r.status]),
    );

    const typedRoster = rosterRaw as {
      id: string;
      student_id?: string | null;
      full_name?: string | null;
      roll_number?: string | number | null;
    }[];

    const attendanceData: StudentAttendance[] = typedRoster.map((student) => ({
      id: student.id,
      student_id: student.student_id || student.id,
      full_name: student.full_name || 'Unknown Student',
      roll_number: student.roll_number != null ? String(student.roll_number) : null,
      status: savedStatus.get(student.student_id || student.id) ?? 'present',
    }));

    return attendanceData;
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (students) => {
      actor.send({ type: 'FETCH_SUCCESS', students });
      return { success: true, students };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? errOption.value
          : 'The class list could not be loaded. Please try again.';
      actor.send({ type: 'FETCH_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}

/**
 * Effect-TS v4 runner for saving daily attendance records.
 */
export async function executeSaveAttendanceSessionEffect(
  actor: AttendanceSessionActor,
  saveFn: (
    classroomId: string,
    date: string,
    records: { student_id: string; status: AttendanceStatus }[],
  ) => Promise<void>,
): Promise<{ success: boolean; error?: string }> {
  actor.send({ type: 'START_SAVING' });

  const snapshot = actor.getSnapshot();
  const { classroomId, date, students } = snapshot.context;

  const records = students.map((s) => ({
    student_id: s.student_id,
    status: s.status,
  }));

  const program = Effect.tryPromise({
    try: () => saveFn(classroomId, date, records),
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: () => {
      actor.send({ type: 'SAVE_SUCCESS' });
      return { success: true };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some' ? errOption.value : 'Failed to save attendance records.';
      actor.send({ type: 'SAVE_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
