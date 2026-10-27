import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const WindDownStepEnum = z.enum(['breathe', 'reflect', 'release', 'intent']);

export type WindDownStep = z.infer<typeof WindDownStepEnum>;

export const WindDownRitualContextSchema = z.object({
  userId: z.string().default(''),
  wentWell: z.string().default(''),
  toRelease: z.string().default(''),
  tomorrowIntent: z.string().default(''),
  error: z.string().nullable().default(null),
  isSaving: z.boolean().default(false),
});

export type WindDownRitualContext = z.infer<typeof WindDownRitualContextSchema>;

export type WindDownRitualEvents =
  | { type: 'SET_USER_ID'; userId: string }
  | { type: 'SET_WENT_WELL'; text: string }
  | { type: 'SET_TO_RELEASE'; text: string }
  | { type: 'SET_TOMORROW_INTENT'; text: string }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'START_SAVE' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_FAILURE'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialWindDownContext: WindDownRitualContext = {
  userId: '',
  wentWell: '',
  toRelease: '',
  tomorrowIntent: '',
  error: null,
  isSaving: false,
};

export const windDownRitualMachine = createMachine({
  id: 'windDownRitual',
  initial: 'breathe',
  schemas: {
    context: WindDownRitualContextSchema,
    events: {
      SET_USER_ID: types<{ userId: string }>(),
      SET_WENT_WELL: types<{ text: string }>(),
      SET_TO_RELEASE: types<{ text: string }>(),
      SET_TOMORROW_INTENT: types<{ text: string }>(),
      NEXT: types<void>(),
      PREV: types<void>(),
      START_SAVE: types<void>(),
      SAVE_SUCCESS: types<void>(),
      SAVE_FAILURE: types<{ error: string }>(),
      CLEAR_ERROR: types<void>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<WindDownRitualContext> }) => ({
    ...initialWindDownContext,
    ...input,
  }),
  states: {
    breathe: {
      on: {
        NEXT: {
          target: 'reflect',
        },
      },
    },
    reflect: {
      on: {
        NEXT: ({ context }) => {
          if (!context.wentWell.trim()) {
            return {
              target: 'reflect',
              context: { ...context, error: 'Please enter one thing that went well today.' },
            };
          }
          return {
            target: 'release',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'breathe',
        },
      },
    },
    release: {
      on: {
        NEXT: ({ context }) => {
          if (!context.toRelease.trim()) {
            return {
              target: 'release',
              context: { ...context, error: 'Please enter one thing you are releasing tonight.' },
            };
          }
          return {
            target: 'intent',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'reflect',
        },
      },
    },
    intent: {
      on: {
        NEXT: ({ context }) => {
          if (!context.tomorrowIntent.trim()) {
            return {
              target: 'intent',
              context: { ...context, error: 'Please enter a gentle intention for tomorrow.' },
            };
          }
          return {
            target: 'saving',
            context: { ...context, isSaving: true, error: null },
          };
        },
        START_SAVE: {
          target: 'saving',
          context: ({ context }) => ({ ...context, isSaving: true, error: null }),
        },
        PREV: {
          target: 'release',
        },
      },
    },
    saving: {
      on: {
        SAVE_SUCCESS: ({ context }) => ({
          target: 'completed',
          context: {
            ...context,
            isSaving: false,
            error: null,
          },
        }),
        SAVE_FAILURE: ({ context, event }) => ({
          target: 'intent',
          context: {
            ...context,
            isSaving: false,
            error: event.error,
          },
        }),
      },
    },
    completed: {
      on: {
        RESET: () => ({
          target: 'breathe',
          context: initialWindDownContext,
        }),
      },
    },
  },
  on: {
    SET_USER_ID: ({ context, event }) => ({
      target: undefined,
      context: { ...context, userId: event.userId },
    }),
    SET_WENT_WELL: ({ context, event }) => ({
      target: undefined,
      context: { ...context, wentWell: event.text, error: null },
    }),
    SET_TO_RELEASE: ({ context, event }) => ({
      target: undefined,
      context: { ...context, toRelease: event.text, error: null },
    }),
    SET_TOMORROW_INTENT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, tomorrowIntent: event.text, error: null },
    }),
    CLEAR_ERROR: ({ context }) => ({
      target: undefined,
      context: { ...context, error: null },
    }),
    START_SAVE: {
      target: '.saving',
      context: ({ context }) => ({ ...context, isSaving: true, error: null }),
    },
    RESET: () => ({
      target: '.breathe',
      context: initialWindDownContext,
    }),
  },
});

export type WindDownRitualMachine = typeof windDownRitualMachine;
export type WindDownRitualActor = ReturnType<typeof createWindDownRitualActor>;

/**
 * Creates and starts a WindDownRitual actor.
 */
export function createWindDownRitualActor(initial?: Partial<WindDownRitualContext>) {
  const actor = createActor(windDownRitualMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for saving completed wind-down ritual.
 */
export async function executeSaveWindDownRitualEffect(
  actor: WindDownRitualActor,
  saveFn: (
    userId: string,
    data: { went_well: string; to_release: string; tomorrow_intent: string },
  ) => Promise<void>,
): Promise<{ success: boolean; error?: string }> {
  actor.send({ type: 'START_SAVE' });

  const { userId, wentWell, toRelease, tomorrowIntent } = actor.getSnapshot().context;

  const program = Effect.tryPromise({
    try: () =>
      saveFn(userId, {
        went_well: wentWell,
        to_release: toRelease,
        tomorrow_intent: tomorrowIntent,
      }),
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
        errOption._tag === 'Some'
          ? errOption.value
          : 'Your ritual could not be saved. Your reflections are still here—please try again.';
      actor.send({ type: 'SAVE_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
