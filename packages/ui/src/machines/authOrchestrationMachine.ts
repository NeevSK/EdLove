import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const AuthOrchestrationContextSchema = z.object({
  email: z.string(),
  password: z.string(),
  errors: z.record(z.string(), z.string()),
  showScanner: z.boolean(),
  showSyncModal: z.boolean(),
  newUserId: z.string(),
  pendingPinAccountId: z.string().nullable(),
  pinError: z.string().nullable(),
  usePassword: z.boolean(),
  guestSourceId: z.string().nullable(),
});

export type AuthOrchestrationContext = z.infer<typeof AuthOrchestrationContextSchema>;

export type AuthOrchestrationEvents =
  | { type: 'SET_FIELD'; field: 'email' | 'password' | 'newUserId'; value: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'RESET_ERRORS' }
  | { type: 'TOGGLE_PASSWORD_MODE' }
  | { type: 'OPEN_SCANNER' }
  | { type: 'CLOSE_SCANNER' }
  | { type: 'OPEN_PIN_MODAL'; accountId: string }
  | { type: 'CLOSE_PIN_MODAL' }
  | { type: 'SET_PIN_ERROR'; error: string | null }
  | { type: 'OPEN_SYNC_MODAL'; newUserId: string }
  | { type: 'CLOSE_SYNC_MODAL' }
  | { type: 'START_AUTHENTICATING' }
  | { type: 'AUTH_SUCCESS'; guestSourceId?: string | null; newUserId?: string; hasGuestData?: boolean }
  | { type: 'AUTH_FAILURE'; error: string }
  | { type: 'RESET' };

export const initialAuthContext: AuthOrchestrationContext = {
  email: '',
  password: '',
  errors: {},
  showScanner: false,
  showSyncModal: false,
  newUserId: '',
  pendingPinAccountId: null,
  pinError: null,
  usePassword: false,
  guestSourceId: null,
};

export const authOrchestrationMachine = createMachine({
  id: 'authOrchestration',
  initial: 'idle',
  schemas: {
    context: AuthOrchestrationContextSchema,
    events: {
      SET_FIELD: types<{ field: 'email' | 'password' | 'newUserId'; value: string }>(),
      SET_ERRORS: types<{ errors: Record<string, string> }>(),
      RESET_ERRORS: types<void>(),
      TOGGLE_PASSWORD_MODE: types<void>(),
      OPEN_SCANNER: types<void>(),
      CLOSE_SCANNER: types<void>(),
      OPEN_PIN_MODAL: types<{ accountId: string }>(),
      CLOSE_PIN_MODAL: types<void>(),
      SET_PIN_ERROR: types<{ error: string | null }>(),
      OPEN_SYNC_MODAL: types<{ newUserId: string }>(),
      CLOSE_SYNC_MODAL: types<void>(),
      START_AUTHENTICATING: types<void>(),
      AUTH_SUCCESS: types<{
        guestSourceId?: string | null;
        newUserId?: string;
        hasGuestData?: boolean;
      }>(),
      AUTH_FAILURE: types<{ error: string }>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<AuthOrchestrationContext> }) => ({
    ...initialAuthContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        START_AUTHENTICATING: {
          target: 'authenticating',
        },
      },
    },
    authenticating: {
      on: {
        AUTH_SUCCESS: ({ context, event }) => {
          if (event.hasGuestData && event.newUserId) {
            return {
              target: 'syncing_guest_data',
              context: {
                ...context,
                showSyncModal: true,
                newUserId: event.newUserId,
                guestSourceId: event.guestSourceId ?? null,
                errors: {},
              },
            };
          }
          return {
            target: 'authenticated',
            context: {
              ...context,
              guestSourceId: event.guestSourceId ?? null,
              errors: {},
            },
          };
        },
        AUTH_FAILURE: ({ context, event }) => ({
          target: 'idle',
          context: {
            ...context,
            errors: { form: event.error },
          },
        }),
      },
    },
    syncing_guest_data: {
      on: {
        CLOSE_SYNC_MODAL: {
          target: 'authenticated',
          context: ({ context }) => ({
            ...context,
            showSyncModal: false,
          }),
        },
      },
    },
    authenticated: {
      type: 'final',
    },
  },
  on: {
    SET_FIELD: ({ context, event }) => ({
      target: undefined,
      context: {
        ...context,
        [event.field]: event.value,
      },
    }),
    SET_ERRORS: ({ context, event }) => ({
      target: undefined,
      context: {
        ...context,
        errors: event.errors,
      },
    }),
    RESET_ERRORS: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        errors: {},
      },
    }),
    TOGGLE_PASSWORD_MODE: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        usePassword: !context.usePassword,
      },
    }),
    OPEN_SCANNER: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        showScanner: true,
      },
    }),
    CLOSE_SCANNER: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        showScanner: false,
      },
    }),
    OPEN_PIN_MODAL: ({ context, event }) => ({
      target: undefined,
      context: {
        ...context,
        pendingPinAccountId: event.accountId,
        pinError: null,
      },
    }),
    CLOSE_PIN_MODAL: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        pendingPinAccountId: null,
        pinError: null,
      },
    }),
    SET_PIN_ERROR: ({ context, event }) => ({
      target: undefined,
      context: {
        ...context,
        pinError: event.error,
      },
    }),
    OPEN_SYNC_MODAL: ({ context, event }) => ({
      target: undefined,
      context: {
        ...context,
        showSyncModal: true,
        newUserId: event.newUserId,
      },
    }),
    CLOSE_SYNC_MODAL: ({ context }) => ({
      target: undefined,
      context: {
        ...context,
        showSyncModal: false,
      },
    }),
    RESET: () => ({
      target: '.idle',
      context: initialAuthContext,
    }),
  },
});

export type AuthOrchestrationMachine = typeof authOrchestrationMachine;
export type AuthOrchestrationActor = ReturnType<typeof createAuthOrchestrationActor>;

/**
 * Creates and starts an AuthOrchestration actor.
 */
export function createAuthOrchestrationActor(initial?: Partial<AuthOrchestrationContext>) {
  const actor = createActor(authOrchestrationMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for executing password sign-in.
 */
export async function executePasswordAuthEffect(
  actor: AuthOrchestrationActor,
  dependencies: {
    signIn: (email: string, pass: string) => Promise<{ session: unknown; user: { id: string } | null }>;
    prepareGuestConversion: () => Promise<string | null>;
    authorizeTransfer: (guestSourceId: string) => Promise<void>;
    bindGuestConversionTarget: (sourceId: string, targetUser: { id: string; is_anonymous: boolean }) => Promise<void>;
    getMyInternalId: () => Promise<string | null>;
    hasGuestData: (guestSourceId: string) => Promise<boolean>;
    clearTransferAuth: (guestSourceId: string) => Promise<void>;
  },
): Promise<{ success: boolean; error?: string; newUserId?: string; hasGuestData?: boolean }> {
  actor.send({ type: 'START_AUTHENTICATING' });

  const snapshot = actor.getSnapshot();
  const { email, password } = snapshot.context;

  const program = Effect.gen(function* () {
    // 1. Prepare potential guest conversion
    const guestSourceId = yield* Effect.tryPromise({
      try: () => dependencies.prepareGuestConversion(),
      catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
    });

    if (guestSourceId) {
      yield* Effect.tryPromise({
        try: () => dependencies.authorizeTransfer(guestSourceId),
        catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
      });
    }

    // 2. Perform sign in
    const authResult = yield* Effect.tryPromise({
      try: () => dependencies.signIn(email, password),
      catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
    });

    if (!authResult?.session || !authResult?.user) {
      return yield* Effect.fail('Password sign-in returned no valid session.');
    }

    // 3. Bind guest conversion target if needed
    if (guestSourceId) {
      yield* Effect.tryPromise({
        try: () =>
          dependencies.bindGuestConversionTarget(guestSourceId, {
            id: authResult.user!.id,
            is_anonymous: false,
          }),
        catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
      });
    }

    // 4. Resolve internal identity and guest data
    const internalId = yield* Effect.tryPromise({
      try: () => dependencies.getMyInternalId(),
      catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
    });

    const hasData = guestSourceId
      ? yield* Effect.tryPromise({
          try: () => dependencies.hasGuestData(guestSourceId),
          catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
        })
      : false;

    return {
      guestSourceId,
      newUserId: internalId ?? authResult.user.id,
      hasGuestData: Boolean(hasData),
    };
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (data) => {
      actor.send({
        type: 'AUTH_SUCCESS',
        guestSourceId: data.guestSourceId,
        newUserId: data.newUserId,
        hasGuestData: data.hasGuestData,
      });
      return {
        success: true,
        newUserId: data.newUserId,
        hasGuestData: data.hasGuestData,
      };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage: string =
        errOption._tag === 'Some'
          ? String(errOption.value)
          : 'Authentication failed. Please verify your credentials.';
      actor.send({ type: 'AUTH_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
