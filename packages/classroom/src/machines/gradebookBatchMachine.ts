import { GPACalculator } from '@repo/core/logic/grading/GPACalculator';
import { buildPartitionedKey, type PartitionKeyOptions } from '@repo/core/lib/storage';
import { storage } from '@repo/core/lib/storage';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

const gpaCalculator = new GPACalculator();
const marksToGPA = (marks: number) => gpaCalculator.marksToGPA(marks);
const calculateRanks = (grades: any[]) => gpaCalculator.calculateRanks(grades);

export const StudentGradeEntrySchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  marks: z.number().min(0).max(100),
  feedback: z.string().default(''),
  letterGrade: z.string().default('F'),
  gpa: z.number().default(0),
  rank: z.number().optional(),
  isDirty: z.boolean().default(false),
});
export type StudentGradeEntry = z.infer<typeof StudentGradeEntrySchema>;

export const GradebookBatchContextSchema = z.object({
  classroomId: z.string(),
  assignmentId: z.string(),
  assignmentTitle: z.string().default(''),
  maxMarks: z.number().positive().default(100),
  passingMarks: z.number().nonnegative().default(40),
  students: z.array(StudentGradeEntrySchema),
  activeStudentIndex: z.number().int().nonnegative().default(0),
  isSaving: z.boolean().default(false),
  error: z.string().nullable().default(null),
});
export type GradebookBatchContext = z.infer<typeof GradebookBatchContextSchema>;

export type GradebookBatchEvent =
  | {
      type: 'LOAD_ROSTER';
      classroomId: string;
      assignmentId: string;
      assignmentTitle?: string;
      maxMarks?: number;
      students: Array<{ studentId: string; studentName: string; marks?: number; feedback?: string }>;
    }
  | { type: 'SELECT_STUDENT'; index: number }
  | { type: 'NEXT_STUDENT' }
  | { type: 'PREV_STUDENT' }
  | {
      type: 'UPDATE_SCORE';
      studentId: string;
      marks: number;
      feedback?: string;
    }
  | { type: 'RECALCULATE_RANKS' }
  | { type: 'START_SYNC' }
  | { type: 'SYNC_SUCCESS' }
  | { type: 'SYNC_FAILURE'; error: string }
  | { type: 'RESTORE_DRAFT'; draft: Partial<GradebookBatchContext> }
  | { type: 'RESET' };

export const initialGradebookBatchContext: GradebookBatchContext = {
  classroomId: '',
  assignmentId: '',
  assignmentTitle: '',
  maxMarks: 100,
  passingMarks: 40,
  students: [],
  activeStudentIndex: 0,
  isSaving: false,
  error: null,
};

function computeEntryStats(marks: number) {
  const safeMarks = Math.max(0, Math.min(100, marks));
  const { grade: letterGrade, gpa } = marksToGPA(safeMarks);
  return { marks: safeMarks, letterGrade, gpa };
}

function recalculateBatchRanks(students: StudentGradeEntry[]): StudentGradeEntry[] {
  if (students.length === 0) return [];
  const gradesPayload = students.map((s) => ({
    id: s.studentId,
    marks: s.marks,
  }));
  const ranked = calculateRanks(gradesPayload) as Array<{ id: string; marks: number; rank?: number }>;
  const rankMap = new Map<string, number>();
  for (const r of ranked) {
    if (r.rank !== undefined) {
      rankMap.set(r.id, r.rank);
    }
  }

  return students.map((s) => ({
    ...s,
    rank: rankMap.get(s.studentId),
  }));
}

export const gradebookBatchMachine = createMachine({
  id: 'gradebookBatch',
  initial: 'idle',
  schemas: {
    context: GradebookBatchContextSchema,
    events: {
      LOAD_ROSTER: types<{
        classroomId: string;
        assignmentId: string;
        assignmentTitle?: string;
        maxMarks?: number;
        students: Array<{ studentId: string; studentName: string; marks?: number; feedback?: string }>;
      }>(),
      SELECT_STUDENT: types<{ index: number }>(),
      NEXT_STUDENT: types<void>(),
      PREV_STUDENT: types<void>(),
      UPDATE_SCORE: types<{
        studentId: string;
        marks: number;
        feedback?: string;
      }>(),
      RECALCULATE_RANKS: types<void>(),
      START_SYNC: types<void>(),
      SYNC_SUCCESS: types<void>(),
      SYNC_FAILURE: types<{ error: string }>(),
      RESTORE_DRAFT: types<{ draft: Partial<GradebookBatchContext> }>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<GradebookBatchContext> }) => ({
    ...initialGradebookBatchContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        LOAD_ROSTER: ({ context, event }) => {
          const mappedStudents: StudentGradeEntry[] = event.students.map((s) => {
            const stats = computeEntryStats(s.marks ?? 0);
            return {
              studentId: s.studentId,
              studentName: s.studentName,
              marks: stats.marks,
              letterGrade: stats.letterGrade,
              gpa: stats.gpa,
              feedback: s.feedback ?? '',
              isDirty: false,
            };
          });

          const rankedStudents = recalculateBatchRanks(mappedStudents);

          return {
            target: 'editing',
            context: {
              ...context,
              classroomId: event.classroomId,
              assignmentId: event.assignmentId,
              assignmentTitle: event.assignmentTitle ?? context.assignmentTitle,
              maxMarks: event.maxMarks ?? context.maxMarks,
              students: rankedStudents,
              activeStudentIndex: 0,
              error: null,
            },
          };
        },
        RESTORE_DRAFT: ({ context, event }) => ({
          target: 'editing',
          context: {
            ...context,
            ...event.draft,
            error: null,
          },
        }),
      },
    },
    editing: {
      on: {
        SELECT_STUDENT: ({ context, event }) => ({
          target: 'editing',
          context: {
            ...context,
            activeStudentIndex: Math.max(0, Math.min(context.students.length - 1, event.index)),
          },
        }),
        NEXT_STUDENT: ({ context }) => ({
          target: 'editing',
          context: {
            ...context,
            activeStudentIndex: Math.min(context.students.length - 1, context.activeStudentIndex + 1),
          },
        }),
        PREV_STUDENT: ({ context }) => ({
          target: 'editing',
          context: {
            ...context,
            activeStudentIndex: Math.max(0, context.activeStudentIndex - 1),
          },
        }),
        UPDATE_SCORE: ({ context, event }) => {
          const stats = computeEntryStats(event.marks);
          const updatedStudents = context.students.map((student) => {
            if (student.studentId !== event.studentId) return student;
            return {
              ...student,
              marks: stats.marks,
              letterGrade: stats.letterGrade,
              gpa: stats.gpa,
              feedback: event.feedback !== undefined ? event.feedback : student.feedback,
              isDirty: true,
            };
          });

          return {
            target: 'editing',
            context: {
              ...context,
              students: updatedStudents,
              error: null,
            },
          };
        },
        RECALCULATE_RANKS: ({ context }) => ({
          target: 'editing',
          context: {
            ...context,
            students: recalculateBatchRanks(context.students),
          },
        }),
        START_SYNC: ({ context }) => ({
          target: 'saving',
          context: {
            ...context,
            isSaving: true,
            error: null,
          },
        }),
      },
    },
    saving: {
      on: {
        SYNC_SUCCESS: ({ context }) => {
          const cleanedStudents = context.students.map((s) => ({ ...s, isDirty: false }));
          return {
            target: 'synced',
            context: {
              ...context,
              students: cleanedStudents,
              isSaving: false,
              error: null,
            },
          };
        },
        SYNC_FAILURE: ({ context, event }) => ({
          target: 'editing',
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
        UPDATE_SCORE: ({ context, event }) => {
          const stats = computeEntryStats(event.marks);
          const updated = context.students.map((s) =>
            s.studentId === event.studentId
              ? {
                  ...s,
                  marks: stats.marks,
                  letterGrade: stats.letterGrade,
                  gpa: stats.gpa,
                  feedback: event.feedback !== undefined ? event.feedback : s.feedback,
                  isDirty: true,
                }
              : s,
          );
          return {
            target: 'editing',
            context: {
              ...context,
              students: updated,
            },
          };
        },
        START_SYNC: ({ context }) => ({
          target: 'saving',
          context: {
            ...context,
            isSaving: true,
            error: null,
          },
        }),
      },
    },
  },
  on: {
    RESET: () => ({
      target: '.idle',
      context: initialGradebookBatchContext,
    }),
  },
});

export type GradebookBatchMachine = typeof gradebookBatchMachine;
export type GradebookBatchActor = ReturnType<typeof createGradebookBatchActor>;

/**
 * Instantiates and starts a GradebookBatch actor.
 */
export function createGradebookBatchActor(initial?: Partial<GradebookBatchContext>) {
  const actor = createActor(gradebookBatchMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Resolves storage key for draft gradebook scoring batch.
 */
export function resolveGradebookDraftKey(
  classroomId: string,
  assignmentId: string,
  options?: Partial<PartitionKeyOptions>,
): string {
  return buildPartitionedKey({
    tenantId: options?.tenantId ?? 'global',
    userId: options?.userId ?? 'teacher',
    entityId: `${classroomId || 'class'}_${assignmentId || 'assign'}`,
    feature: 'gradebook_batch',
    version: 'v6',
  });
}

/**
 * Persists current gradebook batch draft to StorageManager.
 */
export function saveGradebookDraftSnapshot(
  actor: GradebookBatchActor,
  options?: Partial<PartitionKeyOptions>,
): void {
  try {
    const snapshot = actor.getSnapshot();
    const { classroomId, assignmentId, students } = snapshot.context;
    if (!classroomId || !assignmentId) return;

    const key = resolveGradebookDraftKey(classroomId, assignmentId, options);
    storage.set(
      key,
      JSON.stringify({
        context: snapshot.context,
        step: snapshot.value,
        timestamp: Date.now(),
      }),
    );
  } catch (err) {
    console.warn('[GradebookBatch] Failed to persist draft snapshot:', err);
  }
}

/**
 * Restores gradebook batch draft from StorageManager.
 */
export function restoreGradebookDraftSnapshot(
  actor: GradebookBatchActor,
  classroomId: string,
  assignmentId: string,
  options?: Partial<PartitionKeyOptions>,
): boolean {
  try {
    const key = resolveGradebookDraftKey(classroomId, assignmentId, options);
    const raw = storage.getString(key);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data?.context) {
      actor.send({ type: 'RESTORE_DRAFT', draft: data.context });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clears gradebook draft from StorageManager upon successful sync.
 */
export function clearGradebookDraftSnapshot(
  classroomId: string,
  assignmentId: string,
  options?: Partial<PartitionKeyOptions>,
): void {
  try {
    const key = resolveGradebookDraftKey(classroomId, assignmentId, options);
    storage.delete(key);
  } catch {
    // Graceful noop
  }
}

/**
 * Effect-TS v4 runner for executing batch grade synchronization.
 */
export async function executeGradebookBatchSyncEffect(
  actor: GradebookBatchActor,
  syncFn: (
    classroomId: string,
    assignmentId: string,
    grades: Array<{ studentId: string; marks: number; feedback: string }>,
  ) => Promise<void>,
  onSuccessPurge?: () => void,
): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  actor.send({ type: 'START_SYNC' });

  const snapshot = actor.getSnapshot();
  const { classroomId, assignmentId, students } = snapshot.context;

  const dirtyGrades = students.filter((s) => s.isDirty);
  if (dirtyGrades.length === 0) {
    if (actor.getSnapshot().status !== 'stopped') {
      actor.send({ type: 'SYNC_SUCCESS' });
    }
    return { success: true, syncedCount: 0 };
  }

  const payload = dirtyGrades.map((s) => ({
    studentId: s.studentId,
    marks: s.marks,
    feedback: s.feedback,
  }));

  const program = Effect.tryPromise({
    try: () => syncFn(classroomId, assignmentId, payload),
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: () => {
      if (actor.getSnapshot().status === 'stopped') {
        return { success: true, syncedCount: payload.length };
      }
      actor.send({ type: 'SYNC_SUCCESS' });
      onSuccessPurge?.();
      return { success: true, syncedCount: payload.length };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? String(errOption.value)
          : 'Failed to synchronize gradebook batch scores.';
      if (actor.getSnapshot().status === 'stopped') {
        return { success: false, syncedCount: 0, error: errorMessage };
      }
      actor.send({ type: 'SYNC_FAILURE', error: errorMessage });
      return { success: false, syncedCount: 0, error: errorMessage };
    },
  });
}
