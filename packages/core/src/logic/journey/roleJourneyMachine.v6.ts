import { storage } from '@repo/core/logic/managers/StorageManager';
import type { WorkspaceRolePersona } from '@repo/core/types';
import { createActor, setup } from 'xstate';
import { z } from 'zod';

export const RoleJourneyContextSchema = z.object({
  persona: z.enum([
    'principal',
    'guardian',
    'teacher',
    'student',
    'founder',
    'admin',
    'guest',
  ]),
  currentStepIndex: z.number().int().nonnegative(),
  completedStepIds: z.array(z.string()),
  lastCompletedAt: z.iso.datetime().nullable(),
});

export type RoleJourneyContext = z.infer<typeof RoleJourneyContextSchema>;

export const AdvanceStepEventSchema = z.object({
  type: z.literal('ADVANCE_STEP'),
  stepId: z.string(),
});

export const CompleteMilestoneEventSchema = z.object({
  type: z.literal('COMPLETE_MILESTONE'),
  stepId: z.string(),
});

export const DismissScaffoldEventSchema = z.object({
  type: z.literal('DISMISS_SCAFFOLD'),
});

export const ResetJourneyEventSchema = z.object({
  type: z.literal('RESET_JOURNEY'),
});

export const RoleJourneyEventsSchema = z.discriminatedUnion('type', [
  AdvanceStepEventSchema,
  CompleteMilestoneEventSchema,
  DismissScaffoldEventSchema,
  ResetJourneyEventSchema,
]);

export type RoleJourneyEvents = z.infer<typeof RoleJourneyEventsSchema>;

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

// -----------------------------------------------------------------------------
// SNAPSHOT PERSISTENCE ENVELOPE (Anti-Slop Corruption Firewall)
// -----------------------------------------------------------------------------

const SNAPSHOT_SCHEMA_VERSION = 1;

export const SnapshotEnvelopeSchema = z.object({
  version: z.number().int(),
  savedAt: z.iso.datetime(),
  snapshot: z.unknown(),
});

export function getJourneySnapshotStorageKey(persona: WorkspaceRolePersona): string {
  return `role_journey:v6:${persona}:snapshot`;
}

export function saveJourneySnapshot(
  persona: WorkspaceRolePersona,
  snapshot: unknown,
): void {
  const envelope = {
    version: SNAPSHOT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    snapshot,
  };
  storage.set(getJourneySnapshotStorageKey(persona), JSON.stringify(envelope));
}

export function loadJourneySnapshot(persona: WorkspaceRolePersona): unknown | null {
  const raw = storage.getString(getJourneySnapshotStorageKey(persona));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const validated = SnapshotEnvelopeSchema.safeParse(parsed);
    if (!validated.success || validated.data.version !== SNAPSHOT_SCHEMA_VERSION) {
      // Version mismatch or schema drift — safely discard to prevent state crash
      storage.delete(getJourneySnapshotStorageKey(persona));
      return null;
    }
    return validated.data.snapshot;
  } catch {
    storage.delete(getJourneySnapshotStorageKey(persona));
    return null;
  }
}

/**
 * Creates and starts a restored or fresh Role Journey Actor for the given persona.
 */
export function createRoleJourneyActor(persona: WorkspaceRolePersona) {
  const savedSnapshot = loadJourneySnapshot(persona);

  const actor = createActor(roleJourneyMachine, {
    snapshot: (savedSnapshot as never) ?? undefined,
  });

  // Inject initial persona if starting fresh
  if (!savedSnapshot) {
    actor.start();
    // Start with assigned persona
    actor.send({ type: 'ADVANCE_STEP', stepId: `init_${persona}` });
  } else {
    actor.start();
  }

  // Subscribe to auto-persist transitions
  actor.subscribe(() => {
    saveJourneySnapshot(persona, actor.getPersistedSnapshot());
  });

  return actor;
}
