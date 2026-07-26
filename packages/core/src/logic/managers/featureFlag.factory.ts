import { GrowthBookFeatureRolloutAdapter } from '@/adapters/feature-rollout/growthBookFeatureRollout.adapter';
import type { IFeatureRolloutPort } from '@/logic/ports/featureRollout.port';

/**
 * featureFlags: The Global Feature Flag Instance.
 * Supabase adapter removed — GrowthBook is the only rollout backend.
 */
export const featureFlags: IFeatureRolloutPort = new GrowthBookFeatureRolloutAdapter();
