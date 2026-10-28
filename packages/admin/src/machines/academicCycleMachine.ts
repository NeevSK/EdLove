import { buildPartitionedKey, storage } from '@repo/core/lib/storage';
import { Cause, Effect, Exit } from 'effect';
import { type ActorRefFrom, createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const AcademicCycleStageEnum = z.enum([
  'planning',
  'active_term',
  'review_and_lock',
  'rollover_staging',
  'archived',
]);

export type AcademicCycleStage = z.infer<typeof AcademicCycleStageEnum>;

export const AcademicCycleContextSchema = z.object({
  cycleId: z.string().nullable(),
  schoolId: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  status: AcademicCycleStageEnum,
  lockedGradesCount: z.number().int().nonnegative(),
  migratedStudentsCount: z.number().int().nonnegative(),
  error: z.string().nullable(),
  isPastView: z.boolean(),
});

export type AcademicCycleContext = z.infer<typeof AcademicCycleContextSchema>;

export const initialAcademicCycleContext: AcademicCycleContext = {
  cycleId: null,
  schoolId: '',
  name: '',
  startDate: '',
  endDate: null,
  status: 'planning',
  lockedGradesCount: 0,
  migratedStudentsCount: 0,
  error: null,
  isPastView: false,
};

export const academicCycleMachine = createMachine({
  id: 'academicCycle',
  schemas: {
    context: AcademicCycleContextSchema,
    events: {
      CONFIGURE_CYCLE: types<{
        name: string;
        startDate: string;
        endDate?: string;
      }>(),
      ACTIVATE_TERM: types<{ cycleId: string }>(),
      INITIATE_LOCK: types<void>(),
      CONFIRM_LOCK_GRADES: types<{ lockedCount: number }>(),
      STAGE_ROLLOVER: types<void>(),
      EXECUTE_ROLLOVER_SUCCESS: types<{
        migratedCount: number;
        newCycleId: string;
      }>(),
      ROLLOVER_FAILED: types<{ error: string }>(),
      ARCHIVE_CYCLE: types<void>(),
      RETRY: types<void>(),
      RESET: types<void>(),
    },
  },
  initial: 'planning',
  context: ({ input }: { input?: Partial<AcademicCycleContext> }) => ({
    ...initialAcademicCycleContext,
    ...input,
  }),
  states: {
    planning: {
      on: {
        CONFIGURE_CYCLE: ({ event, context }) => ({
          target: 'planning',
          context: {
            ...context,
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate ?? null,
            error: null,
          },
        }),
        ACTIVATE_TERM: ({ event, context }) => ({
          target: 'active_term',
          context: {
            ...context,
            cycleId: event.cycleId,
            status: 'active_term' as const,
            error: null,
          },
        }),
      },
    },
    active_term: {
      on: {
        INITIATE_LOCK: ({ context }) => ({
          target: 'review_and_lock',
          context: {
            ...context,
            status: 'review_and_lock' as const,
            error: null,
          },
        }),
      },
    },
    review_and_lock: {
      on: {
        CONFIRM_LOCK_GRADES: ({ event, context }) => ({
          target: 'rollover_staging',
          context: {
            ...context,
            status: 'rollover_staging' as const,
            lockedGradesCount: event.lockedCount,
            error: null,
          },
        }),
        RETRY: ({ context }) => ({
          target: 'active_term',
          context: {
            ...context,
            status: 'active_term' as const,
          },
        }),
      },
    },
    rollover_staging: {
      on: {
        EXECUTE_ROLLOVER_SUCCESS: ({ event, context }) => ({
          target: 'archived',
          context: {
            ...context,
            status: 'archived' as const,
            migratedStudentsCount: event.migratedCount,
            error: null,
          },
        }),
        ROLLOVER_FAILED: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    archived: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: ({ context }) => ({
          target: 'rollover_staging',
          context: {
            ...context,
            error: null,
          },
        }),
        RESET: ({ context }) => ({
          target: 'active_term',
          context: {
            ...context,
            status: 'active_term' as const,
            error: null,
          },
        }),
      },
    },
  },
});

export type AcademicCycleMachine = typeof academicCycleMachine;
export type AcademicCycleActor = ActorRefFrom<AcademicCycleMachine>;

/**
 * Creates and starts an Academic Cycle Actor instance.
 */
export function createAcademicCycleActor(
  initialContext?: Partial<AcademicCycleContext>,
): AcademicCycleActor {
  const actor = createActor(academicCycleMachine, { input: initialContext });
  actor.start();
  return actor;
}

export interface AcademicCycleRolloverDependencies {
  lockTermGrades: (cycleId: string) => Promise<{ lockedCount: number }>;
  stageStudentPromotions: (params: {
    schoolId: string;
    fromCycleId: string;
    toCycleId: string;
  }) => Promise<{ migratedCount: number }>;
}

/**
 * Effect-TS v4 runner for Academic Cycle Rollover.
 * Enforces pre- and post-flight actor liveness guards.
 */
export function executeCycleRolloverEffect(params: {
  schoolId: string;
  cycleId: string;
  nextCycleId: string;
  deps: AcademicCycleRolloverDependencies;
  actor: AcademicCycleActor;
}) {
  const { schoolId, cycleId, nextCycleId, deps, actor } = params;

  if (actor.getSnapshot().status === 'stopped') {
    return Promise.resolve(Exit.void);
  }

  const program = Effect.gen(function* () {
    // 1. Lock grades for current cycle
    const lockResult = yield* Effect.tryPromise({
      try: () => deps.lockTermGrades(cycleId),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    // 2. Stage promotions to next cycle
    const migrationResult = yield* Effect.tryPromise({
      try: () =>
        deps.stageStudentPromotions({
          schoolId,
          fromCycleId: cycleId,
          toCycleId: nextCycleId,
        }),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    return {
      lockedCount: lockResult.lockedCount,
      migratedCount: migrationResult.migratedCount,
      newCycleId: nextCycleId,
    };
  });

  return Effect.runPromiseExit(program).then((exit) => {
    if (actor.getSnapshot().status === 'stopped') {
      return exit;
    }

    Exit.match(exit, {
      onFailure: (cause) => {
        const errOption = Cause.findErrorOption(cause);
        const errorMsg =
          errOption._tag === 'Some'
            ? errOption.value instanceof Error
              ? errOption.value.message
              : String(errOption.value)
            : 'Academic rollover failed';
        actor.send({ type: 'ROLLOVER_FAILED', error: errorMsg });
      },
      onSuccess: ({ migratedCount, newCycleId }) => {
        actor.send({
          type: 'EXECUTE_ROLLOVER_SUCCESS',
          migratedCount,
          newCycleId,
        });
      },
    });

    return exit;
  });
}

/**
 * Resolves partitioned storage key for academic cycle state.
 */
export function resolveCycleStorageKey(params: {
  schoolId: string;
  cycleId: string;
}): string {
  return buildPartitionedKey({
    tenantId: params.schoolId,
    entityId: params.cycleId,
    feature: 'academic_cycle_state',
  });
}

/**
 * Saves academic cycle snapshot to partitioned storage.
 */
export async function saveCycleSnapshot(
  key: string,
  snapshot: Partial<AcademicCycleContext>,
): Promise<void> {
  await storage.setAsync(key, JSON.stringify(snapshot));
}

/**
 * Restores academic cycle snapshot from partitioned storage.
 */
export async function restoreCycleSnapshot(
  key: string,
): Promise<Partial<AcademicCycleContext> | null> {
  const raw = await storage.getStringAsync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
