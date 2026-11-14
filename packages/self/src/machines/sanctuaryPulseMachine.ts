import { createActor, setup, types } from 'xstate';
import { z } from 'zod';

export const BreathPhaseEnum = z.enum([
  'idle',
  'inhale',
  'holdIn',
  'exhale',
  'holdOut',
]);

export type BreathPhase = z.infer<typeof BreathPhaseEnum>;

export const SanctuaryPulseContextSchema = z.object({
  phase: BreathPhaseEnum,
  cycleCount: z.number().int().nonnegative(),
  totalDurationSeconds: z.number().int().nonnegative(),
  isPlayfulMode: z.boolean(),
});

export type SanctuaryPulseContext = z.infer<typeof SanctuaryPulseContextSchema>;

export const sanctuaryPulseMachine = setup({
  schemas: {
    context: SanctuaryPulseContextSchema,
    events: {
      START: types<{ isPlayfulMode?: boolean }>(),
      TICK_PHASE: types<void>(),
      INTERRUPT: types<void>(),
      RESET: types<void>(),
    },
  },
}).createMachine({
  id: 'sanctuaryPulse',
  initial: 'idle',
  context: {
    phase: 'idle',
    cycleCount: 0,
    totalDurationSeconds: 0,
    isPlayfulMode: false,
  },
  states: {
    idle: {
      on: {
        START: ({ event }) => ({
          target: 'inhale',
          context: {
            phase: 'inhale',
            cycleCount: 1,
            totalDurationSeconds: 0,
            isPlayfulMode: event.isPlayfulMode ?? false,
          },
        }),
      },
    },
    inhale: {
      on: {
        TICK_PHASE: ({ context }) => ({
          target: 'holdIn',
          context: {
            phase: 'holdIn',
            totalDurationSeconds: context.totalDurationSeconds + 4,
          },
        }),
        INTERRUPT: () => ({
          target: 'idle',
          context: { phase: 'idle' },
        }),
      },
    },
    holdIn: {
      on: {
        TICK_PHASE: ({ context }) => ({
          target: 'exhale',
          context: {
            phase: 'exhale',
            totalDurationSeconds: context.totalDurationSeconds + 4,
          },
        }),
        INTERRUPT: () => ({
          target: 'idle',
          context: { phase: 'idle' },
        }),
      },
    },
    exhale: {
      on: {
        TICK_PHASE: ({ context }) => ({
          target: 'holdOut',
          context: {
            phase: 'holdOut',
            totalDurationSeconds: context.totalDurationSeconds + 4,
          },
        }),
        INTERRUPT: () => ({
          target: 'idle',
          context: { phase: 'idle' },
        }),
      },
    },
    holdOut: {
      on: {
        TICK_PHASE: ({ context }) => ({
          target: 'inhale',
          context: {
            phase: 'inhale',
            cycleCount: context.cycleCount + 1,
            totalDurationSeconds: context.totalDurationSeconds + 4,
          },
        }),
        INTERRUPT: () => ({
          target: 'idle',
          context: { phase: 'idle' },
        }),
      },
    },
  },
});

export type SanctuaryPulseMachine = typeof sanctuaryPulseMachine;

/**
 * Creates and starts a fresh Sanctuary Pulse Actor.
 */
export function createSanctuaryPulseActor(isPlayfulMode = false) {
  const actor = createActor(sanctuaryPulseMachine);
  actor.start();
  actor.send({ type: 'START', isPlayfulMode });
  return actor;
}
