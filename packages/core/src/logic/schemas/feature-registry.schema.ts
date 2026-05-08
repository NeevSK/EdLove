import { z } from 'zod';

/**
 * FeatureKind - The type of feature.
 */
export const FeatureKindSchema = z.enum(['CORE', 'PRO', 'EXPERIMENTAL']);

/**
 * FeatureState - The status of a feature for a specific user.
 */
export const FeatureStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  kind: FeatureKindSchema,
  is_enabled: z.boolean(),
  is_locked: z.boolean(), // Locked features require citizenship/payment
  lock_reason: z.enum(['CITIZENSHIP_REQUIRED', 'PAYMENT_REQUIRED', 'GLOBAL_OFF']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * DomainRegistrySchema - Grouping features by app tabs.
 */
export const DomainRegistrySchema = z.object({
  self: z.array(FeatureStateSchema),
  classroom: z.array(FeatureStateSchema),
  community: z.array(FeatureStateSchema),
  library: z.array(FeatureStateSchema),
  profile: z.array(FeatureStateSchema),
});

export type FeatureKind = z.infer<typeof FeatureKindSchema>;
export type FeatureState = z.infer<typeof FeatureStateSchema>;
export type DomainRegistry = z.infer<typeof DomainRegistrySchema>;
