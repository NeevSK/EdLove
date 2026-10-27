import { Cause, Effect, Exit } from 'effect';
import { createActor, setup, types } from 'xstate';
import { z } from 'zod';

export const StudentClaimContextSchema = z.object({
  code: z.string(),
  error: z.string().nullable(),
  successData: z.unknown().nullable(),
  attemptCount: z.number().int().nonnegative(),
});

export type StudentClaimContext = z.infer<typeof StudentClaimContextSchema>;

export const studentClaimMachine = setup({
  schemas: {
    context: StudentClaimContextSchema,
    events: {
      SET_CODE: types<{ code: string }>(),
      SUBMIT: types<void>(),
      CLAIM_SUCCESS: types<{ data: unknown }>(),
      CLAIM_FAILURE: types<{ error: string }>(),
      CANCEL: types<void>(),
      RETRY: types<void>(),
      RESET: types<void>(),
    },
  },
}).createMachine({
  id: 'studentClaim',
  initial: 'idle',
  context: {
    code: '',
    error: null,
    successData: null,
    attemptCount: 0,
  },
  states: {
    idle: {
      on: {
        SET_CODE: ({ context, event }) => ({
          target: 'idle',
          context: {
            ...context,
            code: event.code,
            error: null,
          },
        }),
        SUBMIT: ({ context }) => {
          const sanitized = context.code.trim().toUpperCase();
          if (sanitized.length < 8) {
            return {
              target: 'idle',
              context: {
                ...context,
                error: 'Please enter a valid 8-character invite code.',
              },
            };
          }
          return {
            target: 'verifying',
            context: {
              ...context,
              code: sanitized,
              error: null,
            },
          };
        },
        RESET: () => ({
          target: 'idle',
          context: {
            code: '',
            error: null,
            successData: null,
            attemptCount: 0,
          },
        }),
      },
    },
    verifying: {
      on: {
        CLAIM_SUCCESS: ({ context, event }) => ({
          target: 'success',
          context: {
            ...context,
            successData: event.data,
            error: null,
          },
        }),
        CLAIM_FAILURE: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
            attemptCount: context.attemptCount + 1,
          },
        }),
        CANCEL: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            error: null,
          },
        }),
      },
    },
    error: {
      on: {
        SET_CODE: ({ context, event }) => ({
          target: 'idle',
          context: {
            ...context,
            code: event.code,
            error: null,
          },
        }),
        RETRY: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            error: null,
          },
        }),
        RESET: () => ({
          target: 'idle',
          context: {
            code: '',
            error: null,
            successData: null,
            attemptCount: 0,
          },
        }),
      },
    },
    success: {
      on: {
        RESET: () => ({
          target: 'idle',
          context: {
            code: '',
            error: null,
            successData: null,
            attemptCount: 0,
          },
        }),
      },
    },
  },
});

export type StudentClaimMachine = typeof studentClaimMachine;
export type StudentClaimActor = ReturnType<typeof createStudentClaimActor>;

export function createStudentClaimActor() {
  const actor = createActor(studentClaimMachine);
  actor.start();
  return actor;
}

export type StudentClaimResult =
  | { success: true; data: unknown }
  | { success: false; error: string | null };

/**
 * Executes student claim verification via Effect-TS with structured error handling.
 */
export async function executeStudentClaimEffect(
  actor: StudentClaimActor,
  code: string,
  claimFn: (c: string) => Promise<unknown>,
): Promise<StudentClaimResult> {
  actor.send({ type: 'SUBMIT' });
  const snapshot = actor.getSnapshot();
  if (snapshot.value !== 'verifying') {
    return { success: false, error: snapshot.context.error };
  }

  const program = Effect.tryPromise({
    try: () => claimFn(code.trim().toUpperCase()),
    catch: (err: unknown) =>
      err instanceof Error ? err.message : 'Invalid invite code or record already claimed.',
  });

  const exit = await Effect.runPromiseExit(program);
  return Exit.match(exit, {
    onSuccess: (data): StudentClaimResult => {
      actor.send({ type: 'CLAIM_SUCCESS', data });
      return { success: true, data };
    },
    onFailure: (cause): StudentClaimResult => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? errOption.value
          : 'Invalid invite code or record already claimed.';
      actor.send({ type: 'CLAIM_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
