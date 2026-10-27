import type { GuestDataTransferAvailability } from '@repo/core/native/guestDataTransferPolicy';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const SyncSummarySchema = z.object({
  timetablePeriods: z.number().int().nonnegative(),
  moodLogs: z.number().int().nonnegative(),
  journalEntries: z.number().int().nonnegative(),
  students: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type SyncSummary = z.infer<typeof SyncSummarySchema>;

export const SyncProgressSchema = z.object({
  current: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  step: z.string(),
});

export type SyncProgress = z.infer<typeof SyncProgressSchema>;

export const GuestDataSyncContextSchema = z.object({
  userId: z.string().nullable(),
  summary: SyncSummarySchema,
  progress: SyncProgressSchema,
  error: z.string().nullable(),
});

export type GuestDataSyncContext = z.infer<typeof GuestDataSyncContextSchema>;

export type GuestDataSyncEvents =
  | { type: 'START_LOADING' }
  | { type: 'SET_SUMMARY'; summary: SyncSummary }
  | { type: 'START_SYNC' }
  | { type: 'UPDATE_PROGRESS'; current: number; total: number; step: string }
  | { type: 'SET_COMPLETED' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'TRIGGER_CONFIRM_SKIP' }
  | { type: 'CANCEL_CONFIRM_SKIP' }
  | { type: 'RESET' };

export const initialGuestDataSyncContext: GuestDataSyncContext = {
  userId: null,
  summary: {
    timetablePeriods: 0,
    moodLogs: 0,
    journalEntries: 0,
    students: 0,
    total: 0,
  },
  progress: {
    current: 0,
    total: 0,
    step: '',
  },
  error: null,
};

export const guestDataSyncMachine = createMachine({
  id: 'guestDataSync',
  initial: 'idle',
  schemas: {
    context: GuestDataSyncContextSchema,
    events: {
      START_LOADING: types<void>(),
      SET_SUMMARY: types<{ summary: SyncSummary }>(),
      START_SYNC: types<void>(),
      UPDATE_PROGRESS: types<{ current: number; total: number; step: string }>(),
      SET_COMPLETED: types<void>(),
      SET_ERROR: types<{ message: string }>(),
      TRIGGER_CONFIRM_SKIP: types<void>(),
      CANCEL_CONFIRM_SKIP: types<void>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<GuestDataSyncContext> }) => ({
    ...initialGuestDataSyncContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        START_LOADING: {
          target: 'loading',
        },
        START_SYNC: {
          target: 'syncing',
        },
      },
    },
    loading: {
      on: {
        SET_SUMMARY: ({ context, event }) => ({
          target: 'ready',
          context: {
            ...context,
            summary: event.summary,
            error: null,
          },
        }),
        SET_ERROR: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.message,
          },
        }),
      },
    },
    ready: {
      on: {
        START_SYNC: {
          target: 'syncing',
        },
        TRIGGER_CONFIRM_SKIP: {
          target: 'confirm_skip',
        },
        START_LOADING: {
          target: 'loading',
        },
      },
    },
    confirm_skip: {
      on: {
        CANCEL_CONFIRM_SKIP: {
          target: 'ready',
        },
      },
    },
    syncing: {
      on: {
        UPDATE_PROGRESS: ({ context, event }) => ({
          target: undefined,
          context: {
            ...context,
            progress: {
              current: event.current,
              total: event.total,
              step: event.step,
            },
          },
        }),
        SET_COMPLETED: {
          target: 'completed',
        },
        SET_ERROR: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.message,
          },
        }),
      },
    },
    completed: {
      type: 'final',
    },
    error: {
      on: {
        START_SYNC: {
          target: 'syncing',
        },
        START_LOADING: {
          target: 'loading',
        },
        TRIGGER_CONFIRM_SKIP: {
          target: 'confirm_skip',
        },
      },
    },
  },
  on: {
    RESET: () => ({
      target: '.idle',
      context: initialGuestDataSyncContext,
    }),
    SET_ERROR: ({ context, event }) => ({
      target: '.error',
      context: {
        ...context,
        error: event.message,
      },
    }),
  },
});

export type GuestDataSyncMachine = typeof guestDataSyncMachine;
export type GuestDataSyncActor = ReturnType<typeof createGuestDataSyncActor>;

/**
 * Creates and starts a GuestDataSync actor.
 */
export function createGuestDataSyncActor(initial?: Partial<GuestDataSyncContext>) {
  const actor = createActor(guestDataSyncMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for loading guest data summary.
 */
export async function executeFetchGuestDataSummaryEffect(
  actor: GuestDataSyncActor,
  fetchFn: () => Promise<SyncSummary>,
): Promise<{ success: boolean; summary?: SyncSummary; error?: string }> {
  actor.send({ type: 'START_LOADING' });

  const program = Effect.tryPromise({
    try: () => fetchFn(),
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (summary) => {
      actor.send({ type: 'SET_SUMMARY', summary });
      return { success: true, summary };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const message =
        errOption._tag === 'Some' ? errOption.value : 'Failed to retrieve guest data summary.';
      actor.send({ type: 'SET_ERROR', message });
      return { success: false, error: message };
    },
  });
}

/**
 * Effect-TS v4 runner for syncing all guest data.
 */
export async function executeGuestDataSyncEffect(
  actor: GuestDataSyncActor,
  userId: string,
  syncFn: (
    userId: string,
    onProgress: (prog: { completed: number; total: number; currentStep: string }) => void,
  ) => Promise<{ success: boolean; errors?: string[] }>,
): Promise<{ success: boolean; error?: string }> {
  actor.send({ type: 'START_SYNC' });

  const program = Effect.tryPromise({
    try: () =>
      syncFn(userId, (prog) => {
        actor.send({
          type: 'UPDATE_PROGRESS',
          current: prog.completed,
          total: prog.total,
          step: prog.currentStep,
        });
      }),
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (result) => {
      if (result.success) {
        actor.send({ type: 'SET_COMPLETED' });
        return { success: true };
      }
      const message = result.errors?.join(', ') || 'Failed to sync all guest data.';
      actor.send({ type: 'SET_ERROR', message });
      return { success: false, error: message };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const message =
        errOption._tag === 'Some' ? errOption.value : 'An unexpected error occurred during sync.';
      actor.send({ type: 'SET_ERROR', message });
      return { success: false, error: message };
    },
  });
}
