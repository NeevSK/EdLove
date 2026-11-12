import { journeySnapshots } from '@repo/core/effect/bindings/journey';
import {
  RoleJourneyContextSchema,
  AdvanceStepEventSchema,
  CompleteMilestoneEventSchema,
  DismissScaffoldEventSchema,
  ResetJourneyEventSchema,
} from '@repo/core/logic/schemas/roleJourney.schema';
import type { WorkspaceRolePersona } from '@repo/core/types';
import { createActor, setup } from 'xstate';
import { restoreActor } from 'xstate/persist';

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

/**
 * Creates and starts a restored or fresh Role Journey Actor for the given persona.
 */
export function createRoleJourneyActor(persona: WorkspaceRolePersona) {
  const savedSnapshot = journeySnapshots.load(persona);
  // An unreadable snapshot restores to an actor in 'error' rather than throwing: drop it and start fresh.
  let actor = savedSnapshot
    ? restoreActor(roleJourneyMachine, savedSnapshot as never)
    : null;
  if (actor && actor.getSnapshot().status === 'error') {
    journeySnapshots.drop(persona);
    actor = null;
  }

  if (actor) {
    actor.start();
  } else {
    actor = createActor(roleJourneyMachine);
    actor.start();
    // Start with assigned persona
    actor.send({ type: 'ADVANCE_STEP', stepId: `init_${persona}` });
  }

  // Subscribe to auto-persist transitions
  actor.subscribe(() => {
    journeySnapshots.save(persona, actor.getPersistedSnapshot());
  });

  return actor;
}
