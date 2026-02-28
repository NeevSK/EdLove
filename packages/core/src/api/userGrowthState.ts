/**
 * User Growth State API — All nature path stage management.
 *
 * Manages the `user_growth_state` table which tracks each user's position across
 * all four nature paths of the Gurudevi Growth Model (see docs/Core/GROWTH_MODEL.md Section 2B).
 *
 *   🌸 Bhumi (Lotus) — Bijam → Mūla → Nāla → Patra → Kamala → Pūrṇa Kamala  (all users)
 *   🌳 Banyan (Vata)  — Sapling → Roots → Canopy → Shade Giver → Forest Maker (teachers/principals)
 *   🌊 River (Ganga)  — Trickle → Stream → River → Delta                       (students/teachers)
 *   💎 Crystal        — Spark → Cluster → Cave → Fractal                        (students)
 *
 * Stages advance naturally when the app notices genuine engagement over time.
 *
 * USAGE:
 *   - Import from '@repo/core' in any downstream package.
 *   - growthSignalsAPI calls incrementDimension automatically after every signal.
 *   - UI reads getBhumiStage to render the Lotus Life Stage visualization (Self tab only).
 *   - Show only the living lotus visual — the stage name lives in the database, the lotus speaks for itself.
 */

import { supabase } from '../lib/supabase';
import type { BanyanStage, RiverStage, CrystalTier } from './naturePaths';

export type BhumiStage =
    | 'bijam'
    | 'mula'
    | 'nala'
    | 'patra'
    | 'kamala'
    | 'purna_kamala';

export type GrowthDimension =
    | 'presence'
    | 'nourishing'
    | 'witnessing'
    | 'weaving'
    | 'blooming';

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
    // Banyan (Vata) path — teachers & principals
    banyan_stage: BanyanStage;
    peer_mentored_count: number;
    circles_facilitated_count: number;
    // River (Ganga) path — students & teachers' curricular contribution
    river_stage: RiverStage;
    lessons_completed_count: number;
    reflections_submitted_count: number;
    // Crystal (Spatika) path — students
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
 * Intentionally approximate and lenient — natural engagement, not metric grind.
 * (See GROWTH_MODEL.md Section 5 for the full design specification.)
 */
function meetsTransitionCriteria(
    currentStage: BhumiStage,
    state: UserGrowthState
): BhumiStage | null {
    switch (currentStage) {
        case 'bijam':
            // Bijam → Mūla: First meaningful presence signal — just showing up
            return state.presence_signals >= 1 ? 'mula' : null;

        case 'mula':
            // Mūla → Nāla: Present on 5+ occasions AND engaged with at least one other dimension
            return state.presence_signals >= 5 &&
                (state.nourishing_signals + state.witnessing_signals + state.weaving_signals) >= 1
                ? 'nala'
                : null;

        case 'nala':
            // Nāla → Patra: Outward contribution required — either weaving (community) OR nourishing (sharing).
            // Intentional: mula→nala only requires any ONE of (nourishing + witnessing + weaving) >= 1,
            // so a teacher could advance via witnessing alone (e.g., reading resources). This gate
            // ensures at least one act of outward contribution before reaching Patra.
            return (state.weaving_signals >= 1 || state.nourishing_signals >= 1) ? 'patra' : null;

        case 'patra': {
            // Patra → Kamala: Active across at least 3 aliveness dimensions
            const activeDimensions = (
                [
                    state.presence_signals,
                    state.nourishing_signals,
                    state.witnessing_signals,
                    state.weaving_signals,
                    state.blooming_signals,
                ] as number[]
            ).filter(v => v > 0).length;
            return activeDimensions >= 3 ? 'kamala' : null;
        }

        case 'kamala':
            // Kamala → Pūrṇa: Received a Thuthimal or other blooming signal
            return state.blooming_signals >= 1 ? 'purna_kamala' : null;

        case 'purna_kamala':
            return null; // Already at full bloom — no further advancement
    }
}

export const userGrowthStateAPI = {
    /**
     * Get the growth state for a user, creating a new seed record if none exists.
     * Every user starts as Bijam — a seed in the mud.
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
     * Returns 'bijam' for new users (seed in the mud — never empty, seeds are beautiful).
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

    /**
     * Increment a dimension's signal counter and update last_seen_at.
     * Checks and applies a stage transition if conditions are met.
     *
     * Non-fatal: errors are silently absorbed so growth signals yield to the primary action.
     */
    async incrementDimension(userId: string, dimension: GrowthDimension): Promise<void> {
        const state = await this.getOrCreate(userId).catch(() => null);
        if (!state) return;

        const column = DIMENSION_COLUMN[dimension];
        const currentValue = (state[column] as number) ?? 0;

        const { error } = await supabase
            .from('user_growth_state')
            .update({
                [column]: currentValue + 1,
                last_seen_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) {
            console.warn('[UserGrowthState] Failed to increment dimension:', error.message);
            return;
        }

        // Construct the updated state locally (avoids a second DB read)
        const updatedState: UserGrowthState = { ...state, [column]: currentValue + 1 };

        // Check if the user has graduated to the next Bhumi stage
        const nextStage = meetsTransitionCriteria(state.bhumi_stage as BhumiStage, updatedState);
        if (nextStage) {
            await supabase
                .from('user_growth_state')
                .update({ bhumi_stage: nextStage, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .catch(() => {});
        }
    },
};
