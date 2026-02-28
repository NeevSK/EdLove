/**
 * Nature Paths API — The Extended Nature Metaphor Growth System.
 *
 * The Bhumi (Lotus) path — personal inner growth — is the foundation for every user.
 * These additional paths illuminate different qualities of growth that the lotus alone
 * cannot fully express:
 *
 *   🌳 BANYAN (Vata Vriksha)    — Mentorship and ecosystem-building (teachers, principals)
 *   🌊 RIVER  (Ganga Pravaham)  — Learning flow (students, teachers' curricular contribution)
 *   💎 CRYSTAL (Spatika)        — Knowledge discovery collection (students)
 *
 * See: docs/Core/GROWTH_MODEL.md v3.0 — Section 2B "The Four Nature Paths"
 *
 * USAGE:
 *   After any banyan/river/crystal signal, call:
 *   void naturePathsAPI.advanceBanyan(userId, state).catch(() => {});
 *
 *   All path advance checks are fire-and-forget, just like growthSignals.
 */

import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Banyan Path stages — the tree that becomes a forest.
 * For teachers who mentor; for principals as their primary path.
 */
export type BanyanStage =
    | 'sapling'          // First act of helping/mentoring a colleague
    | 'roots_spreading'  // 3+ meaningful peer interactions
    | 'canopy'           // Others find warmth in what you share; ripples received from colleagues
    | 'shade_giver'      // Active community facilitator; your circle is alive with others
    | 'forest_maker';    // Multiple teachers have grown with your support

/**
 * River Path stages — learning that flows and shapes what it touches.
 * For students (primary) and teachers' curricular contribution.
 */
export type RiverStage =
    | 'trickle'   // Curiosity awakening; first learning flow
    | 'stream'    // Consistent engagement; direction emerging
    | 'river'     // Deep and flowing; contributing back to peers
    | 'delta';    // Knowledge branching and nourishing many

/**
 * Crystal Tier — student knowledge as discovered crystals and fractals.
 * Each tier represents increasingly rich patterns of discovery.
 */
export type CrystalTier =
    | 'spark'    // First genuine discovery — a single glowing crystal
    | 'cluster'  // Multiple discoveries in a subject (depth)
    | 'cave'     // Rich exploration across multiple subjects (breadth)
    | 'fractal'; // Concepts connecting across domains (the highest insight)

export interface CrystalDiscovery {
    id: string;
    user_id: string;
    crystal_type: 'subject_crystal' | 'connection_crystal' | 'deep_crystal' | 'fractal_crystal';
    subject_tags: string[];
    source_entity_id: string | null;
    crystal_name_en: string | null;
    crystal_description_en: string | null;
    is_fractal_moment: boolean;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BANYAN PATH TRANSITION CRITERIA
// ─────────────────────────────────────────────────────────────────────────────

function nextBanyanStage(
    current: BanyanStage,
    peerMentoredCount: number,
    circlesFacilitatedCount: number,
    bloomingSignals: number
): BanyanStage | null {
    switch (current) {
        case 'sapling':
            // First peer interaction unlocks roots_spreading
            return peerMentoredCount >= 1 ? 'roots_spreading' : null;
        case 'roots_spreading':
            // 3+ peer interactions = roots finding ground
            return peerMentoredCount >= 3 ? 'canopy' : null;
        case 'canopy':
            // Facilitated at least one circle + received colleague ripple
            return (circlesFacilitatedCount >= 1 && bloomingSignals >= 1) ? 'shade_giver' : null;
        case 'shade_giver':
            // 5+ peer mentored + 3+ circles facilitated = forest maker
            return (peerMentoredCount >= 5 && circlesFacilitatedCount >= 3) ? 'forest_maker' : null;
        case 'forest_maker':
            return null; // The forest is complete — and still growing
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RIVER PATH TRANSITION CRITERIA
// ─────────────────────────────────────────────────────────────────────────────

function nextRiverStage(
    current: RiverStage,
    lessonsCompleted: number,
    reflectionsSubmitted: number,
    weavingSignals: number
): RiverStage | null {
    switch (current) {
        case 'trickle':
            return lessonsCompleted >= 1 ? 'stream' : null;
        case 'stream':
            // Consistent engagement across lessons + at least one reflection
            return (lessonsCompleted >= 5 && reflectionsSubmitted >= 1) ? 'river' : null;
        case 'river':
            // Contributing back: helping peers or teaching others
            return (reflectionsSubmitted >= 5 && weavingSignals >= 1) ? 'delta' : null;
        case 'delta':
            return null; // The river has found the ocean — all knowledge flows from here
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRYSTAL TIER TRANSITION CRITERIA
// ─────────────────────────────────────────────────────────────────────────────

function nextCrystalTier(
    current: CrystalTier,
    crystalsFound: number,
    fractalMoments: number
): CrystalTier | null {
    switch (current) {
        case 'spark':
            return crystalsFound >= 1 ? 'cluster' : null;
        case 'cluster':
            return crystalsFound >= 5 ? 'cave' : null;
        case 'cave':
            // At least one fractal moment (cross-domain connection)
            return fractalMoments >= 1 ? 'fractal' : null;
        case 'fractal':
            return null; // The fractal network sees all the connections — and more are forming
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATURE PATHS API
// ─────────────────────────────────────────────────────────────────────────────

export const naturePathsAPI = {
    /**
     * Check and advance the Banyan stage if conditions are met.
     * Called after peer_mentored or circle_facilitated signals.
     * Fire-and-forget — errors are silently absorbed.
     */
    async advanceBanyan(userId: string, state: {
        banyan_stage: BanyanStage;
        peer_mentored_count: number;
        circles_facilitated_count: number;
        blooming_signals: number;
    }): Promise<void> {
        const next = nextBanyanStage(
            state.banyan_stage,
            state.peer_mentored_count,
            state.circles_facilitated_count,
            state.blooming_signals
        );
        if (!next) return;

        await supabase
            .from('user_growth_state')
            .update({ banyan_stage: next, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .catch((err: Error) =>
                console.warn('[NaturePaths] Banyan advance failed:', err.message)
            );
    },

    /**
     * Check and advance the River stage if conditions are met.
     * Called after lesson_completed or reflection_submitted signals.
     * Fire-and-forget — errors are silently absorbed.
     */
    async advanceRiver(userId: string, state: {
        river_stage: RiverStage;
        lessons_completed_count: number;
        reflections_submitted_count: number;
        weaving_signals: number;
    }): Promise<void> {
        const next = nextRiverStage(
            state.river_stage,
            state.lessons_completed_count,
            state.reflections_submitted_count,
            state.weaving_signals
        );
        if (!next) return;

        await supabase
            .from('user_growth_state')
            .update({ river_stage: next, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .catch((err: Error) =>
                console.warn('[NaturePaths] River advance failed:', err.message)
            );
    },

    /**
     * Record a crystal discovery for a student.
     * Creates a `crystal_discoveries` row and checks for Crystal Tier advancement.
     *
     * @param userId           The student's user ID
     * @param crystalType      What kind of discovery this represents
     * @param subjectTags      Which subject(s) contributed to this discovery
     * @param nameEn           A warm name for this crystal (e.g., "The Living Cell")
     * @param descriptionEn    What the discovery represents (e.g., "You connected two ideas")
     * @param isFractalMoment  Whether this is a cross-domain connection (the rarest kind)
     * @param sourceEntityId   The assignment/lesson that triggered the discovery
     */
    async recordCrystalDiscovery(
        userId: string,
        crystalType: CrystalDiscovery['crystal_type'],
        subjectTags: string[],
        nameEn: string,
        descriptionEn: string,
        isFractalMoment = false,
        sourceEntityId?: string
    ): Promise<void> {
        // 1. Record the crystal
        await supabase
            .from('crystal_discoveries')
            .insert({
                user_id: userId,
                crystal_type: crystalType,
                subject_tags: subjectTags,
                crystal_name_en: nameEn,
                crystal_description_en: descriptionEn,
                is_fractal_moment: isFractalMoment,
                source_entity_id: sourceEntityId ?? null,
            })
            .catch((err: Error) =>
                console.warn('[NaturePaths] Crystal insert failed:', err.message)
            );

        // 2. Update counters and check for tier advancement
        const { data: state } = await supabase
            .from('user_growth_state')
            .select('crystal_tier, crystals_found_count, fractal_moments_count')
            .eq('user_id', userId)
            .maybeSingle();

        if (!state) return;

        const newCrystalsFound = (state.crystals_found_count ?? 0) + 1;
        const newFractalMoments = (state.fractal_moments_count ?? 0) + (isFractalMoment ? 1 : 0);

        const next = nextCrystalTier(
            (state.crystal_tier as CrystalTier) ?? 'spark',
            newCrystalsFound,
            newFractalMoments
        );

        await supabase
            .from('user_growth_state')
            .update({
                crystals_found_count: newCrystalsFound,
                fractal_moments_count: newFractalMoments,
                ...(next ? { crystal_tier: next } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .catch((err: Error) =>
                console.warn('[NaturePaths] Crystal state update failed:', err.message)
            );
    },

    /**
     * Get a student's full Crystal Collection.
     * Used to render the Crystal Collection view in the student's home screen.
     */
    async getCrystalCollection(userId: string): Promise<CrystalDiscovery[]> {
        const { data, error } = await supabase
            .from('crystal_discoveries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('[NaturePaths] Failed to fetch crystal collection:', error.message);
            return [];
        }
        return (data ?? []) as CrystalDiscovery[];
    },

    /**
     * Get a student's current nature path state (River stage + Crystal tier).
     * Used to render the student's home screen River visualization.
     */
    async getStudentPathState(userId: string): Promise<{
        river_stage: RiverStage;
        crystal_tier: CrystalTier;
        crystals_found_count: number;
        fractal_moments_count: number;
    } | null> {
        const { data } = await supabase
            .from('user_growth_state')
            .select('river_stage, crystal_tier, crystals_found_count, fractal_moments_count')
            .eq('user_id', userId)
            .maybeSingle();

        if (!data) return null;
        return {
            river_stage: (data.river_stage as RiverStage) ?? 'trickle',
            crystal_tier: (data.crystal_tier as CrystalTier) ?? 'spark',
            crystals_found_count: data.crystals_found_count ?? 0,
            fractal_moments_count: data.fractal_moments_count ?? 0,
        };
    },

    /**
     * Get a teacher's/principal's Banyan stage.
     * Used to render the Banyan visualization in the Community Garden.
     */
    async getBanyanState(userId: string): Promise<{
        banyan_stage: BanyanStage;
        peer_mentored_count: number;
        circles_facilitated_count: number;
    } | null> {
        const { data } = await supabase
            .from('user_growth_state')
            .select('banyan_stage, peer_mentored_count, circles_facilitated_count')
            .eq('user_id', userId)
            .maybeSingle();

        if (!data) return null;
        return {
            banyan_stage: (data.banyan_stage as BanyanStage) ?? 'sapling',
            peer_mentored_count: data.peer_mentored_count ?? 0,
            circles_facilitated_count: data.circles_facilitated_count ?? 0,
        };
    },
};
