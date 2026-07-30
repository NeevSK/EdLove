import { SupabaseGrowthAdapter } from '@repo/core/adapters/supabase/growth.adapter';
import { GrowthManager } from '@repo/core/logic/managers/GrowthManager';

/**
 * growth: The Global Sovereign Growth Instance.
 */
export const growth = new GrowthManager(new SupabaseGrowthAdapter());
