import { SupabaseGrowthAdapter } from '../../adapters/supabase/growth.adapter';
import { GrowthManager } from './GrowthManager';

/**
 * growth: The Global Sovereign Growth Instance.
 */
export const growth = new GrowthManager(new SupabaseGrowthAdapter());
