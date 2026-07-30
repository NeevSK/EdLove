import { GrowthBookFeatureRolloutAdapter } from '@repo/core/adapters/feature-rollout/growthBookFeatureRollout.adapter';
import type { IFeatureRolloutPort } from '@repo/core/logic/ports/featureRollout.port';

/**
 * featureFlags: The Global Feature Flag Instance.
 * Supabase adapter removed — GrowthBook is the only rollout backend.
 */
export const featureFlags: IFeatureRolloutPort = new GrowthBookFeatureRolloutAdapter();
