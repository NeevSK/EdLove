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
    createdAt: z.string().date(),
    reviewAt: z.string().date(),
    removalTarget: z.string().date().optional(),
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
