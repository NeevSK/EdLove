import { journeySnapshots } from '@repo/core/effect/bindings/journey';
import {
  RoleJourneyContextSchema,
  AdvanceStepEventSchema,
  CompleteMilestoneEventSchema,
  DismissScaffoldEventSchema,
  ResetJourneyEventSchema,
} from '@repo/core/logic/schemas/roleJourney.schema';
import type { WorkspaceRolePersona } from '@repo/core/types';
import { startPersistedActor } from '@repo/core/store/persistedActor';
import { setup } from 'xstate';

export const roleJourneyMachine = setup({
  schemas: {
    context: RoleJourneyContextSchema,
    events: {
      ADVANCE_STEP: AdvanceStepEventSchema,
      COMPLETE_MILESTONE: CompleteMilestoneEventSchema,
      DISMISS_SCAFFOLD: DismissScaffoldEventSchema,
      RESET_JOURNEY: ResetJourneyEventSchema,
    },
  },
}).createMachine({
  id: 'roleJourney',
  // Bump when states, context or events change. Stored journeys of another version start fresh
  // unless a `migrate` function is added here.
  version: '1',
  initial: 'day0_onboarding',
  context: {
    persona: 'guest',
    currentStepIndex: 0,
    completedStepIds: [],
    lastCompletedAt: null,
  },
  states: {
    day0_onboarding: {
      on: {
        ADVANCE_STEP: ({ context, event }) => ({
          target: 'day0_onboarding',
          context: {
            currentStepIndex: context.currentStepIndex + 1,
            completedStepIds: [...context.completedStepIds, event.stepId],
            lastCompletedAt: new Date().toISOString(),
          },
        }),
        COMPLETE_MILESTONE: ({ context, event }) => ({
          target: 'day1_operational',
          context: {
            completedStepIds: [...context.completedStepIds, event.stepId],
            lastCompletedAt: new Date().toISOString(),
          },
        }),
        DISMISS_SCAFFOLD: ({ context }) => ({
          target: 'day1_operational',
          context: {
            lastCompletedAt: new Date().toISOString(),
          },
        }),
      },
    },
    day1_operational: {
      on: {
        ADVANCE_STEP: ({ context, event }) => ({
          target: 'day1_operational',
          context: {
            completedStepIds: [...context.completedStepIds, event.stepId],
            lastCompletedAt: new Date().toISOString(),
          },
        }),
        RESET_JOURNEY: () => ({
          target: 'day0_onboarding',
          context: {
            currentStepIndex: 0,
            completedStepIds: [],
            lastCompletedAt: null,
          },
        }),
      },
    },
  },
});

export type RoleJourneyMachine = typeof roleJourneyMachine;

/** Starts the persona's role journey where it left off, or fresh, and keeps it saved. */
export function createRoleJourneyActor(persona: WorkspaceRolePersona) {
  return startPersistedActor(
    roleJourneyMachine,
    {
      load: () => journeySnapshots.load(persona),
      save: (snapshot) => journeySnapshots.save(persona, snapshot),
      drop: () => journeySnapshots.drop(persona),
    },
    (actor) => actor.send({ type: 'ADVANCE_STEP', stepId: `init_${persona}` }),
  );
}
