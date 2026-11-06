// apps/gurudevi-web/lib/tutii/tutiiMachine.ts
import { createActor, setup } from 'xstate';
import { z } from 'zod';
import {
  ComputedPlacement,
  TargetRect,
  tutiiJourneySpec,
  tutiiStepSpec,
  UserRolePerspective,
} from './schema';

export interface tutiiMachineContext {
  spec: tutiiJourneySpec | null;
  activeRole: UserRolePerspective;
  filteredSteps: tutiiStepSpec[];
  currentIndex: number;
  activeStep: tutiiStepSpec | null;
  targetRect: TargetRect | null;
  placement: ComputedPlacement | null;
  isDismissed: boolean;
  pollAttempts: number;
}

export const tutiiMachineContextSchema = z.object({
  spec: z.custom<tutiiJourneySpec | null>(),
  activeRole: z.custom<UserRolePerspective>(),
  filteredSteps: z.array(z.custom<tutiiStepSpec>()),
  currentIndex: z.number().int().nonnegative(),
  activeStep: z.custom<tutiiStepSpec | null>(),
  targetRect: z.custom<TargetRect | null>(),
  placement: z.custom<ComputedPlacement | null>(),
  isDismissed: z.boolean(),
  pollAttempts: z.number().int().nonnegative(),
});

export const StarttutiiEventSchema = z.object({
  type: z.literal('START'),
  spec: z.custom<tutiiJourneySpec>(),
  role: z.custom<UserRolePerspective>(),
});

export const NexttutiiEventSchema = z.object({
  type: z.literal('NEXT'),
});

export const PrevtutiiEventSchema = z.object({
  type: z.literal('PREV'),
});

export const ResizetutiiEventSchema = z.object({
  type: z.literal('RESIZE'),
});

export const TargetLocatedtutiiEventSchema = z.object({
  type: z.literal('TARGET_LOCATED'),
  rect: z.custom<TargetRect>(),
  placement: z.custom<ComputedPlacement>(),
});

export const PollTimeouttutiiEventSchema = z.object({
  type: z.literal('POLL_TIMEOUT'),
});

export const DismisstutiiEventSchema = z.object({
  type: z.literal('DISMISS'),
});

export type tutiiMachineEvents =
  | z.infer<typeof StarttutiiEventSchema>
  | z.infer<typeof NexttutiiEventSchema>
  | z.infer<typeof PrevtutiiEventSchema>
  | z.infer<typeof ResizetutiiEventSchema>
  | z.infer<typeof TargetLocatedtutiiEventSchema>
  | z.infer<typeof PollTimeouttutiiEventSchema>
  | z.infer<typeof DismisstutiiEventSchema>;

function persistDismissal(spec: tutiiJourneySpec | null) {
  if (typeof window !== 'undefined' && spec?.rememberDismissal) {
    try {
      window.localStorage.setItem(`tutii.journey.${spec.id}.seen`, 'true');
    } catch {
      // ignore quota / private mode errors
    }
  }
}

export const tutiiMachine = setup({
  schemas: {
    context: tutiiMachineContextSchema,
    events: {
      START: StarttutiiEventSchema,
      NEXT: NexttutiiEventSchema,
      PREV: PrevtutiiEventSchema,
      RESIZE: ResizetutiiEventSchema,
      TARGET_LOCATED: TargetLocatedtutiiEventSchema,
      POLL_TIMEOUT: PollTimeouttutiiEventSchema,
      DISMISS: DismisstutiiEventSchema,
    },
  },
}).createMachine({
  id: 'tutiiSpotlight',
  initial: 'idle',
  context: {
    spec: null,
    activeRole: 'teacher',
    filteredSteps: [],
    currentIndex: 0,
    activeStep: null,
    targetRect: null,
    placement: null,
    isDismissed: false,
    pollAttempts: 0,
  },
  states: {
    idle: {
      on: {
        START: ({ event }: { event: z.infer<typeof StarttutiiEventSchema> }) => {
          const steps = event.spec.steps.filter((s: tutiiStepSpec) => {
            if (!s.applicableRoles || s.applicableRoles.length === 0) return true;
            return (
              s.applicableRoles.includes(event.role) || s.applicableRoles.includes('universal')
            );
          });
          return {
            target: 'locating_target',
            context: {
              spec: event.spec,
              activeRole: event.role,
              filteredSteps: steps,
              currentIndex: 0,
              activeStep: steps[0] ?? null,
              targetRect: null,
              placement: null,
              isDismissed: false,
              pollAttempts: 0,
            },
          };
        },
      },
    },
    locating_target: {
      on: {
        TARGET_LOCATED: ({ event }: { event: z.infer<typeof TargetLocatedtutiiEventSchema> }) => ({
          target: 'spotlighting',
          context: {
            targetRect: event.rect,
            placement: event.placement,
          },
        }),
        POLL_TIMEOUT: ({ context }: { context: tutiiMachineContext }) => {
          const nextIdx = context.currentIndex + 1;
          if (nextIdx < context.filteredSteps.length) {
            return {
              target: 'locating_target',
              context: {
                currentIndex: nextIdx,
                activeStep: context.filteredSteps[nextIdx],
              },
            };
          }
          persistDismissal(context.spec);
          return {
            target: 'completed',
          };
        },
        DISMISS: ({ context }: { context: tutiiMachineContext }) => {
          persistDismissal(context.spec);
          return {
            target: 'dismissed',
            context: {
              isDismissed: true,
            },
          };
        },
      },
    },
    spotlighting: {
      on: {
        NEXT: ({ context }: { context: tutiiMachineContext }) => {
          const nextIdx = context.currentIndex + 1;
          if (nextIdx < context.filteredSteps.length) {
            return {
              target: 'locating_target',
              context: {
                currentIndex: nextIdx,
                activeStep: context.filteredSteps[nextIdx],
              },
            };
          }
          persistDismissal(context.spec);
          return {
            target: 'completed',
          };
        },
        PREV: ({ context }: { context: tutiiMachineContext }) => {
          if (context.currentIndex > 0) {
            const prevIdx = context.currentIndex - 1;
            return {
              target: 'locating_target',
              context: {
                currentIndex: prevIdx,
                activeStep: context.filteredSteps[prevIdx],
              },
            };
          }
          return {
            target: 'spotlighting',
          };
        },
        RESIZE: () => ({
          target: 'locating_target',
        }),
        DISMISS: ({ context }: { context: tutiiMachineContext }) => {
          persistDismissal(context.spec);
          return {
            target: 'dismissed',
            context: {
              isDismissed: true,
            },
          };
        },
      },
    },
    completed: {
      type: 'final',
    },
    dismissed: {
      type: 'final',
    },
  },
});

export function createtutiiActor() {
  return createActor(tutiiMachine);
}
