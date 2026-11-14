import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

/**
 * GrowthSignalSchema - A signal of developmental progress.
 * Derived from ZenStack GrowthEvent model.
 */
export const GrowthSignalSchema = makeModelSchema('GrowthEvent');

/**
 * UserGrowthStateSchema - The current developmental snapshot of a user.
 * Derived from ZenStack UserGrowthState model.
 */
export const UserGrowthStateSchema = makeModelSchema('UserGrowthState');

/**
 * SanctuaryManifestoSchema - A collective intention for the school.
 * Derived from ZenStack SanctuaryManifesto model with computed extensions.
 */
export const SanctuaryManifestoSchema = makeModelSchema('SanctuaryManifesto').extend({
  status: z.enum(['active', 'archived', 'fulfilled']).default('active'),
  has_endorsed: z.boolean().optional(), // Computed field per-user
});

/**
 * ImpactRippleSchema - A ripple of kindness or impact across the sanctuary.
 * Derived from ZenStack ImpactRipple model.
 */
export const ImpactRippleSchema = makeModelSchema('ImpactRipple');

/**
 * ThuthimalGiftSchema - A token of gratitude.
 * Derived from ZenStack ThuthimalGift model.
 */
export const ThuthimalGiftSchema = makeModelSchema('ThuthimalGift');

/**
 * WhisperedMomentSchema - A subtle achievement recognized by the system.
 * Derived from ZenStack WhisperedMoment model.
 */
export const WhisperedMomentSchema = makeModelSchema('WhisperedMoment');

/**
 * What the growth screens read: the counters and the stage of each path. The database leaves an
 * unopened path's stage null; the UI must not invent one.
 */
export const GrowthViewSchema = z.object({
  user_id: z.uuid(),
  banyan_stage: z
    .enum(['sapling', 'roots_spreading', 'canopy', 'shade_giver', 'forest_maker'])
    .nullable(),
  peer_mentored_count: z.number().int().nonnegative(),
  circles_facilitated_count: z.number().int().nonnegative(),
  river_stage: z.enum(['trickle', 'stream', 'river', 'delta']).nullable(),
  crystal_tier: z.enum(['spark', 'cluster', 'cave', 'fractal']).nullable(),
  crystals_found_count: z.number().int().nonnegative(),
  fractal_moments_count: z.number().int().nonnegative(),
});
export type GrowthView = z.infer<typeof GrowthViewSchema>;

/** The growth view kept on the device for offline reading. */
export const SavedGrowthSchema = z.object({
  savedAt: z.number().nonnegative(),
  data: GrowthViewSchema.nullable(),
});
export type SavedGrowth = z.infer<typeof SavedGrowthSchema>;
