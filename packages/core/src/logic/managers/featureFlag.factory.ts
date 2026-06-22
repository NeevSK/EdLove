import { SupabaseFeatureFlagAdapter } from '../../adapters/supabase/supabaseFeatureFlag.adapter';
import { GrowthBookFeatureRolloutAdapter } from '../../adapters/feature-rollout/growthBookFeatureRollout.adapter';
import type { IFeatureRolloutPort } from '../ports/featureRollout.port';

const hasGrowthBookConfig =
  !!(process.env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY || process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY);

/**
 * featureFlags: The Global Sovereign Feature Flag Instance.
 */
export const featureFlags: IFeatureRolloutPort = hasGrowthBookConfig
  ? new GrowthBookFeatureRolloutAdapter()
  : new SupabaseFeatureFlagAdapter();
