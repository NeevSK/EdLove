import { growthViewSource } from '@repo/core/adapters/supabase/growthView.adapter';
import type { GrowthViewSource } from '@repo/core/logic/ports/growthView.port';

/** The growth view and its offline snapshot, decoded at the boundary. */
export const growthView: GrowthViewSource = growthViewSource;
