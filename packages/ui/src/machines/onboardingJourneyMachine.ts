import { storage } from '@repo/core/logic/managers/StorageManager';
import type { Capacity } from '@repo/core/types';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const ONBOARDING_LAST_STEP = 6;

export const OnboardingCapacityEnum = z.custom<Capacity>((val) => typeof val === 'string');

export const OnboardingJourneyContextSchema = z.object({
  userId: z.string().nullable(),
  currentStep: z.number().int().min(0).max(ONBOARDING_LAST_STEP),
  name: z.string(),
  selectedCapacity: OnboardingCapacityEnum,
  schoolId: z.string().nullable(),
  pricingTier: z.string(),
  citizenship: z.string(),
  showDevSandbox: z.boolean(),
  error: z.string().nullable(),
  isGuest: z.boolean(),
  isProcessing: z.boolean(),
});

export type OnboardingJourneyContext = z.infer<typeof OnboardingJourneyContextSchema>;

export type OnboardingJourneyEvents =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CAPACITY'; capacity: Capacity }
  | { type: 'SET_SCHOOL_ID'; schoolId: string | null }
  | { type: 'SET_PRICING'; pricing: string }
  | { type: 'SET_CITIZENSHIP'; citizenship: string }
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SKIP_TOUR' }
  | {
      type: 'FAST_TRACK';
      name: string;
      capacity: Capacity;
      pricing: string;
      citizenship: string;
      schoolId: string | null;
    }
  | { type: 'SHOW_DEV_SANDBOX'; visible: boolean }
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingJourneyContext> }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; error: string }
  | { type: 'RETRY_COMPLETION' }
  | { type: 'RESET' }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null };

export type OnboardingJourneyAction =
  | OnboardingJourneyEvents
  | { type: 'BEGIN_COMPLETION' }
  | { type: 'COMPLETE' }
  | { type: 'FAIL_COMPLETION'; error: string };

function normalizeStep(step: number): number {
  return Math.max(0, Math.min(ONBOARDING_LAST_STEP, step));
}

export const initialOnboardingContext: OnboardingJourneyContext = {
  userId: null,
  currentStep: 0,
  name: '',
  selectedCapacity: 'teacher',
  schoolId: null,
  pricingTier: 'FREE',
  citizenship: 'WANDERER',
  showDevSandbox: false,
  error: null,
  isGuest: false,
  isProcessing: false,
};

export const onboardingJourneyMachine = createMachine({
  schemas: {
    context: OnboardingJourneyContextSchema,
    events: {
      SET_NAME: types<{ name: string }>(),
      SET_CAPACITY: types<{ capacity: Capacity }>(),
      SET_SCHOOL_ID: types<{ schoolId: string | null }>(),
      SET_PRICING: types<{ pricing: string }>(),
      SET_CITIZENSHIP: types<{ citizenship: string }>(),
      SET_STEP: types<{ step: number }>(),
      NEXT_STEP: types<void>(),
      PREV_STEP: types<void>(),
      SKIP_TOUR: types<void>(),
      FAST_TRACK: types<{
        name: string;
        capacity: Capacity;
        pricing: string;
        citizenship: string;
        schoolId: string | null;
      }>(),
      SHOW_DEV_SANDBOX: types<{ visible: boolean }>(),
      RESTORE_PROGRESS: types<{ progress: Partial<OnboardingJourneyContext> }>(),
      SUBMIT: types<void>(),
      SUBMIT_SUCCESS: types<void>(),
      SUBMIT_FAILURE: types<{ error: string }>(),
      RETRY_COMPLETION: types<void>(),
      RESET: types<void>(),
      SET_PROCESSING: types<{ isProcessing: boolean }>(),
      SET_ERROR: types<{ error: string | null }>(),
    },
  },
  id: 'onboardingJourney',
  initial: 'arrival',
  context: ({ input }: { input?: Partial<OnboardingJourneyContext> }) => ({
    ...initialOnboardingContext,
    ...input,
  }),
  states: {
    arrival: {
      on: {
        SET_NAME: ({ context, event }) => ({
          target: 'arrival',
          context: { ...context, name: event.name, error: null },
        }),
        NEXT_STEP: ({ context }) => {
          if (!context.name.trim()) {
            return {
              target: 'arrival',
              context: { ...context, error: 'Please enter a name to continue.' },
            };
          }
          return {
            target: 'identity',
            context: { ...context, currentStep: 1, error: null },
          };
        },
        SET_STEP: ({ context, event }) => ({
          target: event.step === 0 ? 'arrival' : event.step === 1 ? 'identity' : event.step === 6 ? 'review' : 'tour',
          context: { ...context, currentStep: normalizeStep(event.step), error: null },
        }),
        SUBMIT: ({ context }) => ({
          target: 'submitting',
          context: { ...context, error: null },
        }),
      },
    },
    identity: {
      on: {
        SET_CAPACITY: ({ context, event }) => ({
          target: 'identity',
          context: { ...context, selectedCapacity: event.capacity, error: null },
        }),
        SET_SCHOOL_ID: ({ context, event }) => ({
          target: 'identity',
          context: { ...context, schoolId: event.schoolId },
        }),
        NEXT_STEP: ({ context }) => ({
          target: 'tour',
          context: { ...context, currentStep: 2, error: null },
        }),
        PREV_STEP: ({ context }) => ({
          target: 'arrival',
          context: { ...context, currentStep: 0, error: null },
        }),
        SET_STEP: ({ context, event }) => ({
          target: event.step === 0 ? 'arrival' : event.step === 1 ? 'identity' : event.step === 6 ? 'review' : 'tour',
          context: { ...context, currentStep: normalizeStep(event.step), error: null },
        }),
        SUBMIT: ({ context }) => ({
          target: 'submitting',
          context: { ...context, error: null },
        }),
      },
    },
    tour: {
      on: {
        NEXT_STEP: ({ context }) => {
          const nextStep = normalizeStep(context.currentStep + 1);
          if (nextStep >= 6) {
            return {
              target: 'review',
              context: { ...context, currentStep: 6, error: null },
            };
          }
          return {
            target: 'tour',
            context: { ...context, currentStep: nextStep, error: null },
          };
        },
        PREV_STEP: ({ context }) => {
          const prevStep = normalizeStep(context.currentStep - 1);
          if (prevStep <= 1) {
            return {
              target: 'identity',
              context: { ...context, currentStep: 1, error: null },
            };
          }
          return {
            target: 'tour',
            context: { ...context, currentStep: prevStep, error: null },
          };
        },
        SKIP_TOUR: ({ context }) => ({
          target: 'review',
          context: { ...context, currentStep: 6, error: null },
        }),
        SET_STEP: ({ context, event }) => ({
          target: event.step === 0 ? 'arrival' : event.step === 1 ? 'identity' : event.step === 6 ? 'review' : 'tour',
          context: { ...context, currentStep: normalizeStep(event.step), error: null },
        }),
        SUBMIT: ({ context }) => ({
          target: 'submitting',
          context: { ...context, error: null },
        }),
      },
    },
    review: {
      on: {
        PREV_STEP: ({ context }) => ({
          target: 'tour',
          context: { ...context, currentStep: 5, error: null },
        }),
        SUBMIT: ({ context }) => ({
          target: 'submitting',
          context: { ...context, error: null },
        }),
        SET_STEP: ({ context, event }) => ({
          target: event.step === 0 ? 'arrival' : event.step === 1 ? 'identity' : event.step === 6 ? 'review' : 'tour',
          context: { ...context, currentStep: normalizeStep(event.step), error: null },
        }),
      },
    },
    submitting: {
      on: {
        SUBMIT_SUCCESS: ({ context }) => ({
          target: 'completed',
          context: { ...context, error: null },
        }),
        SUBMIT_FAILURE: ({ context, event }) => ({
          target: 'error',
          context: { ...context, error: event.error },
        }),
      },
    },
    error: {
      on: {
        RETRY_COMPLETION: ({ context }) => ({
          target: 'submitting',
          context: { ...context, error: null },
        }),
        PREV_STEP: ({ context }) => ({
          target: 'review',
          context: { ...context, error: null },
        }),
        RESET: () => ({
          target: 'arrival',
          context: initialOnboardingContext,
        }),
      },
    },
    completed: {
      type: 'final',
    },
  },
  on: {
    FAST_TRACK: ({ context, event }) => ({
      target: '.review',
      context: {
        ...context,
        name: event.name,
        selectedCapacity: event.capacity,
        pricingTier: event.pricing,
        citizenship: event.citizenship,
        schoolId: event.schoolId,
        currentStep: 6,
        error: null,
      },
    }),
    SHOW_DEV_SANDBOX: ({ context, event }) => ({
      target: undefined,
      context: { ...context, showDevSandbox: event.visible },
    }),
    SET_PRICING: ({ context, event }) => ({
      target: undefined,
      context: { ...context, pricingTier: event.pricing },
    }),
    SET_CITIZENSHIP: ({ context, event }) => ({
      target: undefined,
      context: { ...context, citizenship: event.citizenship },
    }),
    RESTORE_PROGRESS: ({ context, event }) => {
      const nextStep = event.progress.currentStep ?? context.currentStep;
      const targetState =
        nextStep === 0
          ? '.arrival'
          : nextStep === 1
            ? '.identity'
            : nextStep >= 6
              ? '.review'
              : '.tour';
      return {
        target: targetState,
        context: {
          ...context,
          ...event.progress,
          currentStep: normalizeStep(nextStep),
          error: null,
        },
      };
    },
    SET_PROCESSING: ({ context, event }) => ({
      target: undefined,
      context: { ...context, isProcessing: event.isProcessing },
    }),
    SET_ERROR: ({ context, event }) => ({
      target: undefined,
      context: { ...context, error: event.error },
    }),
    RESET: () => ({
      target: '.arrival',
      context: initialOnboardingContext,
    }),
  },
});

export type OnboardingJourneyMachine = typeof onboardingJourneyMachine;
export type OnboardingJourneyActor = ReturnType<typeof createOnboardingJourneyActor>;

/**
 * Creates and starts an onboarding journey actor.
 */
export function createOnboardingJourneyActor(initial?: Partial<OnboardingJourneyContext>) {
  const actor = createActor(onboardingJourneyMachine, {
    input: initial,
  });
  actor.start();
  if (typeof initial?.currentStep === 'number' && initial.currentStep > 0) {
    actor.send({ type: 'SET_STEP', step: initial.currentStep });
  }
  return actor;
}

/**
 * Snapshot persistence key helper.
 */
export function getOnboardingSnapshotKey(userId: string | null): string {
  return `onboarding_v6_snapshot:${userId || 'guest'}`;
}

/**
 * Saves actor snapshot into StorageManager.
 */
export function saveOnboardingSnapshot(actor: OnboardingJourneyActor, userId: string | null): void {
  try {
    const snapshot = actor.getSnapshot();
    if (snapshot.value === 'completed') {
      storage.delete(getOnboardingSnapshotKey(userId));
      return;
    }
    const key = getOnboardingSnapshotKey(userId);
    storage.set(
      key,
      JSON.stringify({
        stateValue: snapshot.value,
        context: snapshot.context,
        timestamp: Date.now(),
      }),
    );
  } catch (err) {
    console.warn('[OnboardingJourney] Failed to persist snapshot:', err);
  }
}

/**
 * Restores actor snapshot from StorageManager.
 */
export function restoreOnboardingSnapshot(
  actor: OnboardingJourneyActor,
  userId: string | null,
): boolean {
  try {
    const key = getOnboardingSnapshotKey(userId);
    const raw = storage.getString(key);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data?.context) {
      actor.send({ type: 'RESTORE_PROGRESS', progress: data.context });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Executes onboarding completion using Effect-TS v4.
 */
export async function executeOnboardingCompletionEffect(
  actor: OnboardingJourneyActor,
  dependencies: {
    resolveSubject: () => Promise<{ internalId: string; isAnonymous: boolean }>;
    createInitialBond: (
      orientation: Capacity,
      context: Record<string, unknown>,
      internalId: string,
      isAnonymous: boolean,
    ) => Promise<void>;
    completeOnboarding: (internalId: string, isAnonymous: boolean) => Promise<void>;
  },
): Promise<{ success: boolean; error: string | null }> {
  actor.send({ type: 'SUBMIT' });

  const snapshot = actor.getSnapshot();
  const context = snapshot.context;

  const program = Effect.gen(function* () {
    // 1. Resolve active citizen / subject identity
    const subject = yield* Effect.tryPromise({
      try: () => dependencies.resolveSubject(),
      catch: (err: unknown) =>
        err instanceof Error ? err.message : 'Identity could not be resolved.',
    });

    // 2. Create initial bond
    yield* Effect.tryPromise({
      try: () =>
        dependencies.createInitialBond(
          context.selectedCapacity,
          {
            name: context.name,
            schoolId: context.schoolId,
            citizenship: context.citizenship,
            pricingTier: context.pricingTier,
          },
          subject.internalId,
          subject.isAnonymous,
        ),
      catch: (err: unknown) =>
        err instanceof Error ? err.message : 'Failed to establish initial bond.',
    });

    // 3. Complete onboarding
    yield* Effect.tryPromise({
      try: () => dependencies.completeOnboarding(subject.internalId, subject.isAnonymous),
      catch: (err: unknown) =>
        err instanceof Error ? err.message : 'Failed to finalize onboarding.',
    });

    return subject;
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: () => {
      actor.send({ type: 'SUBMIT_SUCCESS' });
      return { success: true, error: null };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? errOption.value
          : 'An unexpected error occurred during onboarding.';
      actor.send({ type: 'SUBMIT_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
