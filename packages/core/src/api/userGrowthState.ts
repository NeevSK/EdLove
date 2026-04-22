/**
 * User Growth State API \u2014 All nature path stage management.
 *
 * Manages the `user_growth_state` table which tracks each user's position across
 * all four nature paths of the Gurudevi Growth Model (see docs/Core/GROWTH_MODEL.md Section 2B).
 *
 *   \uD83C\uDF38 Bhumi (Lotus) \u2014 Bijam \u2192 M\u016Bla \u2192 N\u0101la \u2192 Patra \u2192 Kamala \u2192 P\u016Br\u1E47a Kamala  (all users)
 *   \uD83C\uDF33 Banyan (Vata)  \u2014 Sapling \u2192 Roots \u2192 Canopy \u2192 Shade Giver \u2192 Forest Maker (teachers/principals)
 *   \uD83C\uDF0A River (Ganga)  \u2014 Trickle \u2192 Stream \u2192 River \u2192 Delta                       (students/teachers)
 *   \uD83D\uDC8E Crystal        \u2014 Spark \u2192 Cluster \u2192 Cave \u2192 Fractal                        (students)
 *
 * Stages advance naturally when the app notices genuine engagement over time.
 *
 * USAGE:
 *   - Import from '@repo/core' in any downstream package.
 *   - growthSignalsAPI calls incrementDimension automatically after every signal.
 *   - UI reads getBhumiStage to render the Lotus Life Stage visualization (Self tab only).
 *   - Show only the living lotus visual \u2014 the stage name lives in the database, the lotus speaks for itself.
 */

import { supabase } from '../lib/supabase';
import { composeUserAbilities } from '../permissions/composer';
import { getTemporalRange } from '../utils/temporalUtils';
import { identityAPI } from './identity';
import type { BanyanStage, CrystalTier, RiverStage } from './naturePaths';
import { APIError } from './types';

export type BhumiStage = 'bijam' | 'mula' | 'nala' | 'patra' | 'kamala' | 'purna_kamala';

export type GrowthDimension = 'presence' | 'nourishing' | 'witnessing' | 'weaving' | 'blooming';

export interface UserGrowthState {
  id: string;
  user_id: string;
  // Bhumi (Lotus) path
  bhumi_stage: BhumiStage;
  presence_signals: number;
  nourishing_signals: number;
  witnessing_signals: number;
  weaving_signals: number;
  blooming_signals: number;
  // Banyan (Vata) path \u2014 teachers & principals
  banyan_stage: BanyanStage;
  peer_mentored_count: number;
  circles_facilitated_count: number;
  // River (Ganga) path \u2014 students & teachers' curricular contribution
  river_stage: RiverStage;
  lessons_completed_count: number;
  reflections_submitted_count: number;
  // Crystal (Spatika) path \u2014 students
  crystal_tier: CrystalTier;
  crystals_found_count: number;
  fractal_moments_count: number;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Column name for each dimension counter. */
const DIMENSION_COLUMN: Record<GrowthDimension, keyof UserGrowthState> = {
  presence: 'presence_signals',
  nourishing: 'nourishing_signals',
  witnessing: 'witnessing_signals',
  weaving: 'weaving_signals',
  blooming: 'blooming_signals',
};

/**
 * Bhumi stage transition criteria.
 * Intentionally approximate and lenient \u2014 natural engagement, not metric grind.
 * (See GROWTH_MODEL.md Section 5 for the full design specification.)
 */
function meetsTransitionCriteria(
  currentStage: BhumiStage,
  state: UserGrowthState,
): BhumiStage | null {
  switch (currentStage) {
    case 'bijam':
      // Bijam \u2192 M\u016Bla: First meaningful presence signal \u2014 just showing up
      return state.presence_signals >= 1 ? 'mula' : null;

    case 'mula':
      // M\u016Bla \u2192 N\u0101la: Present on 5+ occasions AND engaged with at least one other dimension
      return state.presence_signals >= 5 &&
        state.nourishing_signals + state.witnessing_signals + state.weaving_signals >= 1
        ? 'nala'
        : null;

    case 'nala':
      // N\u0101la \u2192 Patra: Outward contribution required \u2014 either weaving (community) OR nourishing (sharing).
      // Intentional: mula\u2192nala only requires any ONE of (nourishing + witnessing + weaving) >= 1,
      // so a teacher could advance via witnessing alone (e.g., reading resources). This gate
      // ensures at least one act of outward contribution before reaching Patra.
      return state.weaving_signals >= 1 || state.nourishing_signals >= 1 ? 'patra' : null;

    case 'patra': {
      // Patra \u2192 Kamala: Active across at least 3 aliveness dimensions
      const activeDimensions = (
        [
          state.presence_signals,
          state.nourishing_signals,
          state.witnessing_signals,
          state.weaving_signals,
          state.blooming_signals,
        ] as number[]
      ).filter((v) => v > 0).length;
      return activeDimensions >= 3 ? 'kamala' : null;
    }

    case 'kamala':
      // Kamala \u2192 P\u016Br\u1E47a: Received a Thuthimal or other blooming signal
      return state.blooming_signals >= 1 ? 'purna_kamala' : null;

    case 'purna_kamala':
      return null; // Already at full bloom \u2014 no further advancement
  }
}

export const userGrowthStateAPI = {
  /**
   * Get the growth state for a user, creating a new seed record if none exists.
   * Every user starts as Bijam \u2014 a seed in the mud.
   */
  async getOrCreate(userId: string): Promise<UserGrowthState> {
    const { data: existing } = await supabase
      .from('user_growth_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing as UserGrowthState;

    const { data, error } = await supabase
      .from('user_growth_state')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as UserGrowthState;
  },

  /**
   * Get the current Bhumi life stage for a user.
   * Returns 'bijam' for new users (seed in the mud \u2014 never empty, seeds are beautiful).
   * Non-throwing: returns 'bijam' on any error.
   */
  async getBhumiStage(userId: string): Promise<BhumiStage> {
    const { data } = await supabase
      .from('user_growth_state')
      .select('bhumi_stage')
      .eq('user_id', userId)
      .maybeSingle();
    return (data?.bhumi_stage as BhumiStage | undefined) ?? 'bijam';
  },

  /**
   * Get the full growth state (all dimension counters).
   * Used by Warm Mirror data aggregation.
   */
  async getFullState(userId: string): Promise<UserGrowthState | null> {
    const { data } = await supabase
      .from('user_growth_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return (data as UserGrowthState | null) ?? null;
  },

  async getStateAsOf(userId: string, asOf: string): Promise<UserGrowthState | null> {
    const { data, error } = await supabase
      .from('user_growth_state_versions')
      .select('snapshot')
      .eq('user_id', userId)
      .lte('recorded_at', asOf)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data?.snapshot as UserGrowthState | undefined) ?? null;
  },

  async getStateHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_growth_state_versions')
      .select('id, operation, recorded_at, recorded_by, snapshot')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Increment a dimension's signal counter and update last_seen_at.
   * Checks and applies a stage transition if conditions are met.
   *
   * Non-fatal: errors are silently absorbed so growth signals yield to the primary action.
   */
  async incrementDimension(userId: string, dimension: GrowthDimension): Promise<void> {
    const column = DIMENSION_COLUMN[dimension];

    // Atomic DB-side increment via dedicated RPC (avoids read-then-write race condition).
    // The RPC does UPDATE ... SET col = COALESCE(col,0)+1 in a single round-trip.
    const { data: updatedRow, error } = await supabase
      .rpc('increment_growth_dimension', { p_user_id: userId, p_column: column })
      .maybeSingle();

    if (error || !updatedRow) {
      // Fallback to read-then-write when the RPC is unavailable (e.g. migration not yet run)
      const state = await this.getOrCreate(userId).catch(() => null);
      if (!state) {
        console.warn(
          '[UserGrowthState] Failed to increment dimension:',
          error?.message ?? 'no row returned',
        );
        return;
      }
      const currentValue = (state[column] as number) ?? 0;
      const { error: fallbackError, data: fallbackRow } = await supabase
        .from('user_growth_state')
        .update({
          [column]: currentValue + 1,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();
      if (fallbackError || !fallbackRow) {
        console.warn('[UserGrowthState] Failed to increment dimension:', fallbackError?.message);
        return;
      }
      const row = fallbackRow as UserGrowthState;
      const nextStageFallback = meetsTransitionCriteria(row.bhumi_stage, row);
      if (nextStageFallback) {
        try {
          await supabase
            .from('user_growth_state')
            .update({ bhumi_stage: nextStageFallback, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } catch {
          // ignore
        }
      }
      return;
    }

    // Check if the user has graduated to the next Bhumi stage (using DB-authoritative value)
    const row = updatedRow as UserGrowthState;
    const nextStage = meetsTransitionCriteria(row.bhumi_stage, row);
    if (nextStage) {
      try {
        await supabase
          .from('user_growth_state')
          .update({ bhumi_stage: nextStage, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } catch {
        // ignore
      }
    }
  },

  /**
   * Alias for getOrCreate \u2014 used by the LivingJourneyPanel UI component.
   * Returns the full growth state (all paths) for a user.
   *
   * Security: ensures the caller is authenticated and can only access their own state.
   */
  async getOrCreateState(input: { userId: string }): Promise<UserGrowthState> {
    const { userId } = input;
    const loggedInId = await identityAPI.getMyInternalId();
    const ability = composeUserAbilities({ userId: loggedInId });

    if (loggedInId !== userId && !ability.can('manage', 'Wellbeing')) {
      throw new APIError('Unauthorized access to growth state', 'FORBIDDEN');
    }
    return this.getOrCreate(userId);
  },

  /**
   * Get all Whispered Moments that have been discovered by a user.
   * Used by the LivingJourneyPanel to display memory tiles.
   * Returns an empty array on any error or unauthorized access.
   */
  async getWhisperedMoments(input: {
    userId: string;
    options?: {
      asOf?: string;
      viewDate?: string;
      viewScale?: 'day' | 'week' | 'month' | 'year' | 'custom';
    };
  }): Promise<
    Array<{
      key: string;
      name_en: string;
      name_si: string;
      awarded_at: string;
    }>
  > {
    const { userId, options = {} } = input;
    const loggedInId = await identityAPI.getMyInternalId();
    if (!loggedInId) return [];

    const ability = composeUserAbilities({ userId: loggedInId });
    if (loggedInId !== userId && !ability.can('manage', 'Wellbeing')) {
      return [];
    }

    let query = supabase
      .from('whispered_moments')
      .select('moment_key, moment_name_en, moment_name_si, awarded_at')
      .eq('user_id', userId);

    if (options.asOf) {
      query = query.lte('awarded_at', options.asOf);
    } else if (options.viewDate) {
      const { end } = getTemporalRange(
        options.viewDate,
        options.viewScale === 'custom' ? 'day' : (options.viewScale ?? 'day'),
      );
      query = query.lte('awarded_at', end);
    }

    const { data } = await query.order('awarded_at', { ascending: false });

    if (!data) return [];

    return data.map((row) => ({
      key: row.moment_key as string,
      name_en: (row.moment_name_en as string) ?? row.moment_key,
      name_si: (row.moment_name_si as string) ?? row.moment_key,
      awarded_at: row.awarded_at as string,
    }));
  },
};
