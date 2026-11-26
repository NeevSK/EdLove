import { z } from 'zod';

/** A role journey's context and the events its machine accepts. */
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
