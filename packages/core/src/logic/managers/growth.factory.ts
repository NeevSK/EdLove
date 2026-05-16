import { GrowthManager } from './GrowthManager';
import { SupabaseGrowthAdapter } from '../../adapters/supabase/growth.adapter';

/**
 * growth: The Global Sovereign Growth Instance.
 */
export const growth = new GrowthManager(new SupabaseGrowthAdapter());
