import { buildPartitionedKey, type PartitionKeyOptions } from '@repo/core/lib/storage.adapter';
import { storage } from '@repo/core/lib/storage.adapter';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const VerificationMethodEnum = z.enum(['qr', 'nfc', 'manual', 'biometric']);
export type VerificationMethod = z.infer<typeof VerificationMethodEnum>;

export const VerifiedStudentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  full_name: z.string(),
  roll_number: z.string().nullable().optional(),
});
export type VerifiedStudent = z.infer<typeof VerifiedStudentSchema>;

export const StudentVerificationContextSchema = z.object({
  classroomId: z.string(),
  date: z.string(),
  token: z.string().nullable(),
  student: VerifiedStudentSchema.nullable(),
  poaClaimId: z.string().nullable(),
  method: VerificationMethodEnum.default('qr'),
  error: z.string().nullable(),
  historyCount: z.number().int().nonnegative().default(0),
});
export type StudentVerificationContext = z.infer<typeof StudentVerificationContextSchema>;

export type StudentVerificationEvent =
  | { type: 'START_SCAN' }
  | { type: 'CANCEL_SCAN' }
  | {
      type: 'SUBMIT_TOKEN';
      token: string;
      method?: VerificationMethod;
    }
  | {
      type: 'VERIFICATION_SUCCESS';
      student: VerifiedStudent;
      poaClaimId: string;
    }
  | { type: 'VERIFICATION_FAILURE'; error: string }
  | { type: 'RESET' };

export const initialStudentVerificationContext: StudentVerificationContext = {
  classroomId: '',
  date: '',
  token: null,
  student: null,
  poaClaimId: null,
  method: 'qr',
  error: null,
  historyCount: 0,
};

export const studentVerificationMachine = createMachine({
  id: 'studentVerification',
  initial: 'idle',
  schemas: {
    context: StudentVerificationContextSchema,
    events: {
      START_SCAN: types<void>(),
      CANCEL_SCAN: types<void>(),
      SUBMIT_TOKEN: types<{ token: string; method?: VerificationMethod }>(),
      VERIFICATION_SUCCESS: types<{ student: VerifiedStudent; poaClaimId: string }>(),
      VERIFICATION_FAILURE: types<{ error: string }>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<StudentVerificationContext> }) => ({
    ...initialStudentVerificationContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        START_SCAN: ({ context }) => ({
          target: 'scanning',
          context: {
            ...context,
            error: null,
            token: null,
          },
        }),
        SUBMIT_TOKEN: ({ context, event }) => ({
          target: 'verifying',
          context: {
            ...context,
            token: event.token,
            method: event.method ?? 'qr',
            error: null,
          },
        }),
      },
    },
    scanning: {
      on: {
        SUBMIT_TOKEN: ({ context, event }) => ({
          target: 'verifying',
          context: {
            ...context,
            token: event.token,
            method: event.method ?? 'qr',
            error: null,
          },
        }),
        CANCEL_SCAN: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            error: null,
          },
        }),
      },
    },
    verifying: {
      on: {
        VERIFICATION_SUCCESS: ({ context, event }) => ({
          target: 'verified',
          context: {
            ...context,
            student: event.student,
            poaClaimId: event.poaClaimId,
            historyCount: context.historyCount + 1,
            error: null,
          },
        }),
        VERIFICATION_FAILURE: ({ context, event }) => ({
          target: 'rejected',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    verified: {
      on: {
        START_SCAN: ({ context }) => ({
          target: 'scanning',
          context: {
            ...context,
            token: null,
            error: null,
          },
        }),
        RESET: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            token: null,
            student: null,
            poaClaimId: null,
            error: null,
          },
        }),
      },
    },
    rejected: {
      on: {
        START_SCAN: ({ context }) => ({
          target: 'scanning',
          context: {
            ...context,
            token: null,
            error: null,
          },
        }),
        RESET: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            token: null,
            error: null,
          },
        }),
      },
    },
  },
  on: {
    RESET: ({ context }) => ({
      target: '.idle',
      context: {
        ...context,
        token: null,
        student: null,
        poaClaimId: null,
        error: null,
      },
    }),
  },
});

export type StudentVerificationMachine = typeof studentVerificationMachine;
export type StudentVerificationActor = ReturnType<typeof createStudentVerificationActor>;

/**
 * Instantiates and starts a StudentVerification actor.
 */
export function createStudentVerificationActor(
  initial?: Partial<StudentVerificationContext>,
) {
  const actor = createActor(studentVerificationMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Resolves a partitioned key for storing offline POA (Proof-of-Attendance) claims.
 */
export function resolvePoaStorageKey(
  classroomId: string,
  options?: Partial<PartitionKeyOptions>,
): string {
  return buildPartitionedKey({
    tenantId: options?.tenantId ?? 'global',
    userId: options?.userId ?? 'teacher',
    entityId: classroomId || 'default_class',
    feature: 'poa_claims',
    version: 'v6',
  });
}

/**
 * Saves a verified POA claim snapshot to StorageManager.
 */
export function savePoaClaimSnapshot(
  actor: StudentVerificationActor,
  options?: Partial<PartitionKeyOptions>,
): void {
  try {
    const snapshot = actor.getSnapshot();
    if (snapshot.value !== 'verified' || !snapshot.context.poaClaimId) {
      return;
    }
    const key = resolvePoaStorageKey(snapshot.context.classroomId, options);
    const existingRaw = storage.getString(key);
    const claims = existingRaw ? JSON.parse(existingRaw) : [];
    claims.push({
      poaClaimId: snapshot.context.poaClaimId,
      student: snapshot.context.student,
      date: snapshot.context.date,
      method: snapshot.context.method,
      timestamp: Date.now(),
    });
    storage.set(key, JSON.stringify(claims));
  } catch (err) {
    console.warn('[StudentVerification] Failed to save POA claim snapshot:', err);
  }
}

/**
 * Restores verified POA claims from StorageManager.
 */
export function restorePoaClaims(
  classroomId: string,
  options?: Partial<PartitionKeyOptions>,
): unknown[] {
  try {
    const key = resolvePoaStorageKey(classroomId, options);
    const raw = storage.getString(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Effect-TS v4 runner for executing full anti-spoof student verification.
 */
export async function executeStudentVerificationEffect(
  actor: StudentVerificationActor,
  token: string,
  dependencies: {
    verifyToken: (
      token: string,
      classroomId: string,
    ) => Promise<{
      student: VerifiedStudent;
      poaClaimId: string;
      antiSpoofPassed: boolean;
    }>;
    method?: VerificationMethod;
  },
): Promise<{ success: boolean; student?: VerifiedStudent; poaClaimId?: string; error?: string }> {
  actor.send({ type: 'SUBMIT_TOKEN', token, method: dependencies.method ?? 'qr' });

  const snapshot = actor.getSnapshot();
  const classroomId = snapshot.context.classroomId;

  const program = Effect.gen(function* () {
    const verification = yield* Effect.tryPromise({
      try: () => dependencies.verifyToken(token, classroomId),
      catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
    });

    if (!verification.antiSpoofPassed) {
      return yield* Effect.fail('Anti-spoof replay detected or expired security nonce.');
    }

    return verification;
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (data) => {
      if (actor.getSnapshot().status === 'stopped') {
        return { success: true, student: data.student, poaClaimId: data.poaClaimId };
      }
      actor.send({
        type: 'VERIFICATION_SUCCESS',
        student: data.student,
        poaClaimId: data.poaClaimId,
      });
      return { success: true, student: data.student, poaClaimId: data.poaClaimId };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? String(errOption.value)
          : 'Failed to verify student credentials.';
      if (actor.getSnapshot().status === 'stopped') {
        return { success: false, error: errorMessage };
      }
      actor.send({ type: 'VERIFICATION_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
