import { storage } from '@repo/core/logic/managers/StorageManager';
import { StorageKeys } from '@repo/core/lib/storage';
import type { BulkStudent } from '@repo/core/types';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const DraftStudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  index_number: z.string(),
  notes: z.string().default(''),
});

export type DraftStudent = z.infer<typeof DraftStudentSchema>;

export const BulkStudentCreationContextSchema = z.object({
  totalCount: z.string(),
  students: z.array(DraftStudentSchema),
  currentIndex: z.number().int().nonnegative(),
  error: z.string().nullable(),
});

export type BulkStudentCreationContext = z.infer<typeof BulkStudentCreationContextSchema>;

export type BulkStudentStep = 'count' | 'entry' | 'review' | 'importing' | 'completed';

export const createDraftStudent = (index: number): DraftStudent => ({
  id: `draft-${index}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
  name: '',
  index_number: '',
  notes: '',
});

export type BulkStudentCreationEvents =
  | { type: 'SET_TOTAL_COUNT'; totalCount: string }
  | { type: 'START_ENTRY' }
  | { type: 'UPDATE_CURRENT_STUDENT'; field: keyof BulkStudent; value: string }
  | { type: 'NEXT_STUDENT' }
  | { type: 'PREV_STUDENT' }
  | { type: 'SKIP_STUDENT' }
  | { type: 'ADD_ONE_MORE' }
  | { type: 'REMOVE_STUDENT'; index: number }
  | { type: 'GO_TO_REVIEW' }
  | { type: 'EDIT_STUDENT'; index: number }
  | { type: 'BACK_TO_ENTRY' }
  | { type: 'CONFIRM_IMPORT' }
  | { type: 'IMPORT_SUCCESS' }
  | { type: 'IMPORT_FAILURE'; error: string }
  | {
      type: 'RESTORE_DRAFT';
      students: DraftStudent[];
      step?: 'count' | 'entry' | 'review';
      currentIndex?: number;
    }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialBulkStudentContext: BulkStudentCreationContext = {
  totalCount: '',
  students: [],
  currentIndex: 0,
  error: null,
};

export const bulkStudentCreationMachine = createMachine({
  id: 'bulkStudentCreation',
  initial: 'count',
  schemas: {
    context: BulkStudentCreationContextSchema,
    events: {
      SET_TOTAL_COUNT: types<{ totalCount: string }>(),
      START_ENTRY: types<void>(),
      UPDATE_CURRENT_STUDENT: types<{ field: keyof BulkStudent; value: string }>(),
      NEXT_STUDENT: types<void>(),
      PREV_STUDENT: types<void>(),
      SKIP_STUDENT: types<void>(),
      ADD_ONE_MORE: types<void>(),
      REMOVE_STUDENT: types<{ index: number }>(),
      GO_TO_REVIEW: types<void>(),
      EDIT_STUDENT: types<{ index: number }>(),
      BACK_TO_ENTRY: types<void>(),
      CONFIRM_IMPORT: types<void>(),
      IMPORT_SUCCESS: types<void>(),
      IMPORT_FAILURE: types<{ error: string }>(),
      RESTORE_DRAFT: types<{
        students: DraftStudent[];
        step?: 'count' | 'entry' | 'review';
        currentIndex?: number;
      }>(),
      CLEAR_ERROR: types<void>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<BulkStudentCreationContext> }) => ({
    ...initialBulkStudentContext,
    ...input,
  }),
  states: {
    count: {
      on: {
        SET_TOTAL_COUNT: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            totalCount: event.totalCount,
            error: null,
          },
        }),
        START_ENTRY: ({ context }) => {
          const count = Number.parseInt(context.totalCount, 10);
          if (!Number.isFinite(count) || count < 1 || count > 100) {
            return {
              target: 'count',
              context: {
                ...context,
                error: 'Please enter a number between 1 and 100',
              },
            };
          }
          return {
            target: 'entry',
            context: {
              ...context,
              students: Array.from({ length: count }, (_, i) => createDraftStudent(i)),
              currentIndex: 0,
              error: null,
            },
          };
        },
      },
    },
    entry: {
      on: {
        UPDATE_CURRENT_STUDENT: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            students: context.students.map((student, idx) =>
              idx === context.currentIndex ? { ...student, [event.field]: event.value } : student,
            ),
            error: null,
          },
        }),
        NEXT_STUDENT: ({ context }) => {
          const student = context.students[context.currentIndex];
          if (!student?.name.trim() || !student.index_number.trim()) {
            return {
              target: 'entry',
              context: {
                ...context,
                error: 'Name and Index are required',
              },
            };
          }
          if (context.currentIndex < context.students.length - 1) {
            return {
              target: 'entry',
              context: {
                ...context,
                currentIndex: context.currentIndex + 1,
                error: null,
              },
            };
          }
          return {
            target: 'review',
            context: {
              ...context,
              error: null,
            },
          };
        },
        PREV_STUDENT: ({ context }) => ({
          target: 'entry',
          context: {
            ...context,
            currentIndex: Math.max(0, context.currentIndex - 1),
            error: null,
          },
        }),
        SKIP_STUDENT: ({ context }) => ({
          target: 'entry',
          context: {
            ...context,
            currentIndex:
              context.currentIndex < context.students.length - 1
                ? context.currentIndex + 1
                : context.currentIndex,
            error: null,
          },
        }),
        ADD_ONE_MORE: ({ context }) => ({
          target: 'entry',
          context: {
            ...context,
            students: [...context.students, createDraftStudent(context.students.length)],
            currentIndex: context.students.length,
            error: null,
          },
        }),
        REMOVE_STUDENT: ({ context, event }) => {
          const next = context.students.filter((_, i) => i !== event.index);
          if (next.length === 0) {
            return {
              target: 'count',
              context: initialBulkStudentContext,
            };
          }
          return {
            target: 'entry',
            context: {
              ...context,
              students: next,
              currentIndex: Math.min(context.currentIndex, next.length - 1),
              error: null,
            },
          };
        },
        GO_TO_REVIEW: ({ context }) => ({
          target: 'review',
          context: {
            ...context,
            error: null,
          },
        }),
      },
    },
    review: {
      on: {
        EDIT_STUDENT: ({ context, event }) => ({
          target: 'entry',
          context: {
            ...context,
            currentIndex: Math.max(0, Math.min(context.students.length - 1, event.index)),
            error: null,
          },
        }),
        BACK_TO_ENTRY: ({ context }) => ({
          target: 'entry',
          context: {
            ...context,
            error: null,
          },
        }),
        ADD_ONE_MORE: ({ context }) => ({
          target: 'entry',
          context: {
            ...context,
            students: [...context.students, createDraftStudent(context.students.length)],
            currentIndex: context.students.length,
            error: null,
          },
        }),
        REMOVE_STUDENT: ({ context, event }) => {
          const next = context.students.filter((_, i) => i !== event.index);
          if (next.length === 0) {
            return {
              target: 'count',
              context: initialBulkStudentContext,
            };
          }
          return {
            target: 'review',
            context: {
              ...context,
              students: next,
              currentIndex: Math.min(context.currentIndex, next.length - 1),
              error: null,
            },
          };
        },
        CONFIRM_IMPORT: ({ context }) => {
          const validStudents = context.students.filter(
            (s) => s.name.trim() && s.index_number.trim(),
          );
          if (validStudents.length === 0) {
            return {
              target: 'review',
              context: {
                ...context,
                error: 'No valid students to add',
              },
            };
          }
          return {
            target: 'importing',
            context: {
              ...context,
              error: null,
            },
          };
        },
      },
    },
    importing: {
      on: {
        IMPORT_SUCCESS: {
          target: 'completed',
        },
        IMPORT_FAILURE: ({ context, event }) => ({
          target: 'review',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    completed: {
      type: 'final',
    },
  },
  on: {
    RESTORE_DRAFT: ({ context, event }) => {
      const targetStep = event.step === 'review' ? '.review' : '.entry';
      return {
        target: targetStep,
        context: {
          ...context,
          students: event.students,
          currentIndex: event.currentIndex ?? 0,
          totalCount: String(event.students.length),
          error: null,
        },
      };
    },
    CLEAR_ERROR: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        error: null,
      },
    }),
    RESET: () => ({
      target: '.count',
      context: initialBulkStudentContext,
    }),
  },
});

export type BulkStudentCreationMachine = typeof bulkStudentCreationMachine;
export type BulkStudentCreationActor = ReturnType<typeof createBulkStudentCreationActor>;

/**
 * Creates and starts a BulkStudentCreation actor.
 */
export function createBulkStudentCreationActor(initial?: Partial<BulkStudentCreationContext>) {
  const actor = createActor(bulkStudentCreationMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Saves draft students snapshot into StorageManager.
 */
export function saveBulkStudentDraftSnapshot(
  actor: BulkStudentCreationActor,
  storageKey = StorageKeys.DRAFT_STUDENTS,
): void {
  try {
    const snapshot = actor.getSnapshot();
    if (snapshot.value === 'completed') {
      storage.delete(storageKey);
      return;
    }
    if (snapshot.context.students.length > 0) {
      storage.set(
        storageKey,
        JSON.stringify({
          students: snapshot.context.students,
          step: snapshot.value,
          currentIndex: snapshot.context.currentIndex,
          timestamp: Date.now(),
        }),
      );
    }
  } catch (err) {
    console.warn('[BulkStudentCreation] Failed to persist draft snapshot:', err);
  }
}

/**
 * Restores draft students snapshot from StorageManager.
 */
export function restoreBulkStudentDraftSnapshot(
  actor: BulkStudentCreationActor,
  storageKey = StorageKeys.DRAFT_STUDENTS,
): boolean {
  try {
    const raw = storage.getString(storageKey);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Array.isArray(data?.students) && data.students.length > 0) {
      actor.send({
        type: 'RESTORE_DRAFT',
        students: data.students,
        step: data.step,
        currentIndex: data.currentIndex,
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Effect-TS v4 runner for executing bulk student import.
 */
export async function executeBulkStudentImportEffect(
  actor: BulkStudentCreationActor,
  importFn: (students: BulkStudent[]) => Promise<void> | void,
  clearDraftFn?: () => void,
): Promise<{ success: boolean; count: number; error?: string }> {
  actor.send({ type: 'CONFIRM_IMPORT' });

  const snapshot = actor.getSnapshot();
  if (snapshot.value !== 'importing') {
    return {
      success: false,
      count: 0,
      error: snapshot.context.error ?? 'Validation failed',
    };
  }

  const validStudents: BulkStudent[] = snapshot.context.students
    .filter((s) => s.name.trim() && s.index_number.trim())
    .map(({ id: _id, ...rest }) => ({
      name: rest.name,
      index_number: rest.index_number,
      notes: rest.notes ?? '',
    }));

  const program = Effect.tryPromise({
    try: async () => {
      await importFn(validStudents);
    },
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: () => {
      actor.send({ type: 'IMPORT_SUCCESS' });
      clearDraftFn?.();
      return { success: true, count: validStudents.length };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? errOption.value
          : 'Failed to import student roster. Please try again.';
      actor.send({ type: 'IMPORT_FAILURE', error: errorMessage });
      return { success: false, count: 0, error: errorMessage };
    },
  });
}
