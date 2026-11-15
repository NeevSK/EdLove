import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship';
import { TimeProfileSchema } from '@repo/core/logic/registry/timeProfile';
import { z } from 'zod';

/**
 * DomainEntry — the canonical definition of one domain/tab/surface
 * in the Gurudevi app.
 *
 * Each domain package defines its own entries conforming to this type.
 * The AppCatalog assembles them all at boot.
 *
 * Rules:
 * - Never put gate logic here. Declare requirements only.
 * - Never check isPro, pricing_tier, or capacity here.
 * - Never import from ports or store here. Pure data.
 */

export const FeatureStateSchema = z.enum([
  'development', // not shipped to any user
  'beta', // early access, opt-in rollout
  'live', // fully shipped and stable
  'deprecated', // being phased out
]);

export const FeatureFlagClassSchema = z.enum(['release', 'experiment', 'beta', 'operational']);

export const FeatureLifecycleSchema = z
  .object({
    owner: z.string().min(1),
    createdAt: z.iso.date(),
    reviewAt: z.iso.date(),
    removalTarget: z.iso.date().optional(),
    permanentJustification: z.string().min(1).optional(),
    flagClass: FeatureFlagClassSchema.optional(),
  })
  .refine(({ removalTarget, permanentJustification }) => removalTarget || permanentJustification, {
    message: 'Lifecycle metadata requires a removalTarget or permanentJustification.',
  });

export function defineFeatureLifecycle(lifecycle: FeatureLifecycle): FeatureLifecycle {
  return FeatureLifecycleSchema.parse(lifecycle);
}

export const CitizenshipLevelSchema = z.union([
  z.literal(CITIZENSHIP.FIRST_CLASS),
  z.literal(CITIZENSHIP.SECOND_CLASS),
  z.literal(CITIZENSHIP.THIRD_CLASS),
]);

export const TabDomainSchema = z.enum(['self', 'workspace', 'community', 'library', 'profile']);

export const WorkspaceRolePersonaSchema = z.enum([
  'founder',
  'principal',
  'assistantPrincipal',
  'sectionHead',
  'gradeHead',
  'teacher',
  'student',
  'guardian',
  'parent',
  'developer',
]);

export const FeatureLifecycleStageSchema = z.enum([
  'day_0_onboarding',
  'daily_circadian',
  'mastery_governance',
]);

export const ScreenSequenceStepSchema = z.object({
  step: z.number().int().nonnegative(),
  screenId: z.string(),
  route: z.string(),
  title: z.string(),
  purpose: z.enum(['on_ramp', 'primary_action', 'sub_detail', 'feedback_completion']),
  fallbackRoute: z.string().optional(),
});

export const SensoryFeedbackProfileSchema = z.object({
  tutiiMode: z.enum(['guiding', 'celebrating', 'resting', 'somatic_calm', 'alert']),
  tutiiRole: z.enum(['guide', 'companion', 'sentinel']).optional(),
  haptic: z.enum(['light', 'medium', 'success', 'warning', 'selection']),
  soundChime: z.enum(['arrival', 'celebration', 'pulse', 'subtle_tap']).optional(),
  scaffoldDismissalKey: z.string().optional(),
  scaffoldThreshold: z.number().int().positive().optional(),
});

export const FeatureJourneySchema = z.object({
  featureId: z.string(),
  targetPersonas: z.array(WorkspaceRolePersonaSchema),
  stage: FeatureLifecycleStageSchema,
  entryRoute: z.string(),
  sequence: z.array(ScreenSequenceStepSchema),
  feedback: SensoryFeedbackProfileSchema,
});

export const FlowTriggerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('deep_link'),
    urlPattern: z.string().min(1),
  }),
  z.object({
    type: z.literal('tab_navigation'),
    tab: TabDomainSchema,
    floor: z.string().min(1),
  }),
  z.object({
    type: z.literal('dashboard_action'),
    buttonId: z.string().min(1),
    surfaceId: z.string().optional(),
  }),
  z.object({
    type: z.literal('push_notification'),
    category: z.string().min(1),
    payloadKey: z.string().optional(),
  }),
  z.object({
    type: z.literal('scaffold_onboarding'),
    dayStage: FeatureLifecycleStageSchema,
  }),
]);

export const FlowFallbackConditionSchema = z.enum([
  'offline_no_cache',
  'permission_denied',
  'prerequisite_missing',
  'account_unlinked',
  'server_503',
  'feature_disabled',
]);

export const FlowFallbackEdgeSchema = z.object({
  condition: FlowFallbackConditionSchema,
  fallbackScreenId: z.string().min(1),
  fallbackRoute: z.string().min(1),
  guidancePrompt: z.string().min(1),
  recoveryAction: z.enum([
    'retry',
    'switch_role',
    'open_demo_sandbox',
    'link_account',
    'view_cached',
  ]),
});

export const FlowNodeStepSchema = z.object({
  stepId: z.string().min(1),
  title: z.string().min(1),
  purpose: z.enum(['on_ramp', 'input_form', 'preview_confirm', 'sub_detail', 'terminal_success']),
  mobileRoute: z.string().min(1),
  webRoute: z.string().min(1),
  primaryAction: z.string().min(1),
  fallbacks: z.array(FlowFallbackEdgeSchema).default([]),
});

// Product contract and traceability metadata; these declarations do not grant authority.
export const JourneyPilotSchema = z.object({
  status: z.enum(['proposed', 'implemented']),
  intent: z.string().min(1),
  developmentContext: z
    .object({
      mode: z.enum(['greenfield', 'brownfield', 'mixed']),
      existingBehavior: z.array(z.string().min(1)),
      integrationPoints: z.array(
        z.object({ reference: z.string().min(1), role: z.string().min(1) }),
      ),
      invariants: z.array(z.string().min(1)).min(1),
      openQuestions: z.array(z.string().min(1)),
    })
    .optional(),
  entryStep: z.string().min(1),
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        interaction: z.string().min(1),
        terminal: z.boolean(),
      }),
    )
    .min(1),
  transitions: z
    .array(
      z.object({
        id: z.string().min(1),
        from: z.string().min(1),
        to: z.string().min(1),
        action: z.string().min(1),
        feedback: z.string().min(1),
      }),
    )
    .min(1),
  scenarios: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        transitions: z.array(z.string().min(1)).min(1),
        evidence: z.array(z.object({ reference: z.string().min(1), tier: z.string().min(1) })),
      }),
    )
    .min(1),
  bindings: z
    .array(
      z.object({
        kind: z.enum(['web', 'mobile', 'api', 'data', 'authorization']),
        status: z.enum(['unknown', 'planned', 'implemented', 'verified']),
        reference: z.string().min(1).optional(),
        note: z.string().min(1),
      }),
    )
    .min(1),
});

export const FeatureJTBDGraphSchema = z.object({
  featureId: z.string().min(1),
  jobTitle: z.string().min(1),
  jobStory: z.string().min(1),
  targetPersonas: z.array(WorkspaceRolePersonaSchema).min(1),
  lifecycleStage: FeatureLifecycleStageSchema,
  triggers: z.array(FlowTriggerSchema).min(1),
  nodes: z.array(FlowNodeStepSchema).min(1),
  completion: z.object({
    sensoryProfile: SensoryFeedbackProfileSchema,
    nextCircadianRoute: z.string().min(1),
    scaffoldDismissalKey: z.string().optional(),
  }),
  journeyPilot: JourneyPilotSchema.optional(),
});

/** Channels beyond the two apps. Web and phone support is webSupport/mobileSupport only. */
export const ChannelAffordanceSchema = z.object({
  whatsapp: z
    .object({
      intent: z.string(),
      requiresApproval: z.boolean().default(true),
    })
    .optional(),
  agent_mcp: z
    .object({
      toolName: z.string(),
      readOnly: z.boolean().default(false),
    })
    .optional(),
});

/**
 * Where a feature sits on its room's floor by default. The person's saved
 * arrangement moves, hides and pins on top of this; SanctuaryFeature decides
 * whether it is there at all. `shape` names the kit component that draws it
 * (a key of the kit's floor-fit table: row, card, rail, list, grid...).
 */
export const FeatureFloorSchema = z.object({
  group: z.string().min(1),
  shape: z.string().min(1),
  /** How urgent it is within today: now, later or any time. */
  urgency: z.enum(['now', 'later', 'anytime']).optional(),
  /** A job to finish, not just something to look at. */
  task: z.boolean().optional(),
  /** Holds the lamp: what matters most right now. */
  lit: z.boolean().optional(),
  needsAttention: z.boolean().optional(),
  /** How much it matters to its roles, 1 by default. */
  weight: z.number().positive().optional(),
});

export const DomainEntrySchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  ownerPackage: z.string(),

  // ── Platform support ──────────────────────────────────────────────
  mobileSupport: z.boolean(),
  webSupport: z.boolean(),
  channelAffordance: ChannelAffordanceSchema.optional(),

  // ── Deployment state ──────────────────────────────────────────────
  // What IFeatureRolloutPort / GrowthBook reads.
  // 'development' domains are never shown to any user.
  // 'deprecated' domains are hidden and being removed.
  state: FeatureStateSchema,
  flagKey: z.string().optional(),
  lifecycle: FeatureLifecycleSchema,
  presentation: z
    .object({
      title: z.string(),
      accentColor: z.string(),
      energyVibe: z.tuple([z.string(), z.string()]).optional(),
      featureIds: z.array(z.string()).optional(),
    })
    .optional(),

  // ── Gate requirements ─────────────────────────────────────────────
  // What useSanctuaryFeature evaluates.
  // Never put the evaluation logic here — only the requirements.
  citizenshipRequired: CitizenshipLevelSchema,
  capabilityRequirement: z.object({
    action: z.string(),
    subject: z.string(),
  }),
  entitlementModule: z.string().optional(),
  entitlementTier: z.enum(['FREE', 'PRO', 'INSTITUTIONAL']).optional(),
  entitlementScope: z.enum(['individual', 'active_bond', 'active_entity', 'add_on']).optional(),

  // ── UI / routing ──────────────────────────────────────────────────
  tabDomain: TabDomainSchema,
  surfaceId: z.string(),
  defaultOrder: z.number(),
  /** The floor zone it starts in (today, work, institution...). */
  defaultZone: z.string().optional(),
  /** Short symbol shown beside the label. */
  icon: z.string().optional(),
  /** The practice in the capability manifest it runs (attendance, climate_sensing...). */
  capabilityId: z.string().optional(),
  /** Where each platform opens it. */
  routes: z.object({ web: z.string().optional(), mobile: z.string().optional() }).optional(),

  // ── Room floor ────────────────────────────────────────────────────
  /**
   * Roles that see it in their room (teacher, student, principal, guardian,
   * or an exact capacity). Missing means every role. `common` features are
   * offered to every role even when not listed.
   */
  roles: z.array(z.string().min(1)).optional(),
  common: z.boolean().optional(),
  /** Its default place on the room's floor. Without it the entry is not furniture. */
  floor: FeatureFloorSchema.optional(),
  /** Time lens: how it behaves looking back, today, and ahead. */
  time: TimeProfileSchema.optional(),

  // ── Journey & Interaction Sequencing ──────────────────────────────
  journey: FeatureJourneySchema.optional(),
  jtbdFlow: FeatureJTBDGraphSchema.optional(),
  flowId: z.string().optional(),

  // ── Analytics ─────────────────────────────────────────────────────
  // Scoped key for domain-level usage tracking.
  // Format: 'tabDomain.domainId' e.g. 'workspace.teacher_dashboard'
  analyticsKey: z.string(),
});

export type DomainEntry = z.infer<typeof DomainEntrySchema>;
export type FeatureFloor = z.infer<typeof FeatureFloorSchema>;
export type ChannelAffordance = z.infer<typeof ChannelAffordanceSchema>;
export type FeatureState = z.infer<typeof FeatureStateSchema>;
export type FeatureFlagClass = z.infer<typeof FeatureFlagClassSchema>;
export type FeatureLifecycle = z.infer<typeof FeatureLifecycleSchema>;
export type TabDomain = z.infer<typeof TabDomainSchema>;
export type WorkspaceRolePersona = z.infer<typeof WorkspaceRolePersonaSchema>;
export type FeatureLifecycleStage = z.infer<typeof FeatureLifecycleStageSchema>;
export type ScreenSequenceStep = z.infer<typeof ScreenSequenceStepSchema>;
export type SensoryFeedbackProfile = z.infer<typeof SensoryFeedbackProfileSchema>;
export type FeatureJourneySpec = z.infer<typeof FeatureJourneySchema>;
export type FlowTrigger = z.infer<typeof FlowTriggerSchema>;
export type FlowFallbackCondition = z.infer<typeof FlowFallbackConditionSchema>;
export type FlowFallbackEdge = z.infer<typeof FlowFallbackEdgeSchema>;
export type FlowNodeStep = z.infer<typeof FlowNodeStepSchema>;
export type FeatureJTBDGraph = z.infer<typeof FeatureJTBDGraphSchema>;
