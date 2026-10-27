import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship';
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
  purpose: z.enum([
    'on_ramp',
    'input_form',
    'preview_confirm',
    'sub_detail',
    'terminal_success',
  ]),
  mobileRoute: z.string().min(1),
  webRoute: z.string().min(1),
  primaryAction: z.string().min(1),
  fallbacks: z.array(FlowFallbackEdgeSchema).default([]),
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
