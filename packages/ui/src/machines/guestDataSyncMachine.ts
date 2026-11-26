import { GuestDataSync } from '@repo/core/native/guestDataSync';
import {
  createActor,
  createAsyncLogic,
  createCallbackLogic,
  type EventObject,
  setup,
  types,
} from 'xstate';
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

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/** Events the transfer actor sends back while it runs. */
type TransferEvent =
  | { type: 'TRANSFER_PROGRESS'; current: number; total: number; step: string }
  | { type: 'TRANSFER_DONE' }
  | { type: 'TRANSFER_FAILED'; message: string };

/**
 * Counts what the guest left on this device. Runs while the machine is `loading`; leaving that
 * state (closing the modal) aborts it.
 */
export const loadGuestDataSummary = createAsyncLogic<SyncSummary, void>({
  run: async () => {
    const summary = await GuestDataSync.getGuestDataSummary();
    return SyncSummarySchema.parse(summary);
  },
});

/**
 * Moves the guest's data to the account, reporting progress back to the machine. Runs while the
 * machine is `syncing`; once that state is left, late progress and results are ignored.
 */
export const transferGuestData = createCallbackLogic<EventObject, { userId: string }>(
  ({ input, sendBack }) => {
    let active = true;
    const send = (event: TransferEvent) => {
      if (active) sendBack(event);
    };
    GuestDataSync.syncAllData(input.userId, (progress) =>
      send({
        type: 'TRANSFER_PROGRESS',
        current: progress.completed,
        total: progress.total,
        step: progress.currentStep,
      }),
    ).then(
      (result) =>
        send(
          result.success
            ? { type: 'TRANSFER_DONE' }
            : {
                type: 'TRANSFER_FAILED',
                message: result.errors.join(', ') || 'Failed to sync all guest data.',
              },
        ),
      (error: unknown) =>
        send({
          type: 'TRANSFER_FAILED',
          message: messageOf(error, 'An unexpected error occurred during sync.'),
        }),
    );
    return () => {
      active = false;
    };
  },
);

/**
 * The guest data modal: count what's on the device, then move it to the account or discard it.
 * The machine runs both jobs itself (`invoke`), so a screen only sends what the person chose.
 * Tests replace the jobs with `guestDataSyncMachine.provide({ actors: { ... } })`.
 */
export const guestDataSyncMachine = setup({
  schemas: {
    context: GuestDataSyncContextSchema,
    input: types<Partial<GuestDataSyncContext> | undefined>(),
    events: {
      START_LOADING: types<void>(),
      START_SYNC: types<void>(),
      TRIGGER_CONFIRM_SKIP: types<void>(),
      CANCEL_CONFIRM_SKIP: types<void>(),
      SET_ERROR: types<{ message: string }>(),
      RESET: types<void>(),
      TRANSFER_PROGRESS: types<{ current: number; total: number; step: string }>(),
      TRANSFER_DONE: types<void>(),
      TRANSFER_FAILED: types<{ message: string }>(),
    },
  },
  actors: { loadSummary: loadGuestDataSummary, transfer: transferGuestData },
}).createMachine({
  id: 'guestDataSync',
  initial: 'idle',
  context: ({ input }) => ({ ...initialGuestDataSyncContext, ...input }),
  states: {
    idle: {
      on: {
        START_LOADING: { target: 'loading' },
        START_SYNC: { target: 'syncing' },
      },
    },
    loading: {
      invoke: {
        src: 'loadSummary',
        onDone: ({ context, event }) => ({
          target: 'ready',
          context: { ...context, summary: event.output, error: null },
        }),
        onError: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            error: messageOf(event.error, 'Failed to retrieve guest data summary.'),
          },
        }),
      },
    },
    ready: {
      on: {
        START_SYNC: { target: 'syncing' },
        TRIGGER_CONFIRM_SKIP: { target: 'confirm_skip' },
        START_LOADING: { target: 'loading' },
      },
    },
    confirm_skip: {
      on: {
        CANCEL_CONFIRM_SKIP: { target: 'ready' },
      },
    },
    syncing: {
      invoke: {
        src: 'transfer',
        input: ({ context }) => ({ userId: context.userId ?? '' }),
      },
      on: {
        TRANSFER_PROGRESS: ({ context, event }) => ({
          context: {
            ...context,
            progress: { current: event.current, total: event.total, step: event.step },
          },
        }),
        TRANSFER_DONE: { target: 'completed' },
        TRANSFER_FAILED: ({ context, event }) => ({
          target: 'error',
          context: { ...context, error: event.message },
        }),
      },
    },
    completed: {
      type: 'final',
    },
    error: {
      on: {
        START_SYNC: { target: 'syncing' },
        START_LOADING: { target: 'loading' },
        TRIGGER_CONFIRM_SKIP: { target: 'confirm_skip' },
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
      context: { ...context, error: event.message },
    }),
  },
});

/** The machine, or a copy with other jobs from `guestDataSyncMachine.provide(...)`. */
export type GuestDataSyncMachine =
  | typeof guestDataSyncMachine
  | ReturnType<(typeof guestDataSyncMachine)['provide']>;
export type GuestDataSyncActor = ReturnType<typeof createGuestDataSyncActor>;

/** Creates and starts a guest data sync actor. Pass `machine` to run it with other jobs (tests). */
export function createGuestDataSyncActor(
  initial?: Partial<GuestDataSyncContext>,
  machine: GuestDataSyncMachine = guestDataSyncMachine,
) {
  return createActor(machine, { input: initial }).start();
}
