import { SupabaseGrowthAdapter } from '@/adapters/supabase/growth.adapter';
import { GrowthManager } from '@/logic/managers/GrowthManager';

/**
 * growth: The Global Sovereign Growth Instance.
 */
export const growth = new GrowthManager(new SupabaseGrowthAdapter());
