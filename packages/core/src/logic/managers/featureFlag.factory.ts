import { SupabaseFeatureFlagAdapter } from '../../adapters/supabase/supabaseFeatureFlag.adapter';

/**
 * featureFlags: The Global Sovereign Feature Flag Instance.
 */
export const featureFlags = new SupabaseFeatureFlagAdapter();
