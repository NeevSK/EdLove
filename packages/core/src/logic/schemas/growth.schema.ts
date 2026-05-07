import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

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
