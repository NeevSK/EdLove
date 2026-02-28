/**
 * Growth Signals API — the complete wiring layer of the Bhumi Growth Model.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PRESENCE INFERENCE MODEL: Work as Witness
 * (see docs/Core/GROWTH_MODEL.md v2.0 — Section 3, Dimension 1)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * We do not ask teachers "were you present today?"
 * We observe the natural residue of their work.
 *
 * Signal tiers (from highest to lowest confidence of presence):
 *   Tier 1 — Work Signals: attendance_recorded, assignment_graded,
 *             lesson_material_created, assignment_created
 *             → Teacher was actively doing their job.
 *   Tier 2 — Care Signals: mood_checkin, fire_journal_entry,
 *             breathing_exercise_complete
 *             → Teacher chose to prioritise their own wellbeing.
 *   Tier 3 — Context Signals: app_opened (with section metadata)
 *             → Teacher was in the app thinking about their work.
 *
 * All three tiers contribute to the Presence dimension.
 * None require any extra action from the teacher beyond their normal work.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * After any meaningful user action, call fire-and-forget:
 *   void growthSignalsAPI.emitSignal(userId, 'mood_checkin').catch(() => {});
 *
 * Rules:
 *   ✅ Always call AFTER the primary operation succeeds.
 *   ✅ Always fire-and-forget — the primary action completes first; the signal follows silently.
 *   ✅ Growth signal errors are silently absorbed — the primary feature always succeeds independently.
 *   ✅ Signal counts and event types are internal to the growth system — expressed only through the lotus visual.
 *   ✅ The primary feature succeeds on its own terms; growth observation rides alongside it.
 */

import { supabase } from '../lib/supabase';
import { userGrowthStateAPI, GrowthDimension } from './userGrowthState';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** All semantic signal types that can flow through the growth system. */
export type GrowthSignalType =
    // PRESENCE — the natural residue of showing up
    | 'app_opened'                     // Tier 3 — context; carry {section} in metadata
    | 'mood_checkin'                   // Tier 2 — self-care (Witnessing cross-filed as Presence)
    | 'breathing_exercise_complete'    // Tier 2 — self-care
    | 'joy_jar_entry'                  // Tier 2 — self-care
    | 'fire_journal_entry'             // Tier 2 — self-care
    | 'attendance_recorded'            // Tier 1 — work; teacher was in school
    // NOURISHING — creating and sharing that which feeds others
    | 'resource_uploaded'
    | 'lesson_plan_created'
    | 'assignment_created'
    | 'wisdom_seed_shared'
    | 'lesson_material_created'
    | 'assignment_graded'              // Teacher graded work (with or without written feedback)
    // WITNESSING — absorbing, reflecting, growing inward
    | 'resource_read'
    | 'wisdom_seed_read'
    | 'reflection_written'
    | 'goal_set'
    // WEAVING — building the web that holds the community together
    | 'community_post_created'
    | 'manifesto_endorsed'
    | 'resource_shared'
    | 'colleague_helped'
    | 'group_message_sent'
    | 'group_joined'
    // BLOOMING — being seen and honored (given by others, received with gratitude)
    | 'thuthimal_received'
    | 'principal_recognition'
    | 'community_milestone_reached';

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL → DIMENSION MAP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps every growth signal type to its aliveness dimension.
 * This is the canonical, single-source-of-truth mapping.
 * (See GROWTH_MODEL.md Appendix B for the full design specification.)
 */
export const GROWTH_SIGNAL_MAP: Record<GrowthSignalType, GrowthDimension> = {
    // Presence
    app_opened: 'presence',
    mood_checkin: 'presence',
    breathing_exercise_complete: 'presence',
    joy_jar_entry: 'presence',
    fire_journal_entry: 'presence',
    attendance_recorded: 'presence',
    // Nourishing
    resource_uploaded: 'nourishing',
    lesson_plan_created: 'nourishing',
    assignment_created: 'nourishing',
    wisdom_seed_shared: 'nourishing',
    lesson_material_created: 'nourishing',
    assignment_graded: 'nourishing',
    // Witnessing
    resource_read: 'witnessing',
    wisdom_seed_read: 'witnessing',
    reflection_written: 'witnessing',
    goal_set: 'witnessing',
    // Weaving
    community_post_created: 'weaving',
    manifesto_endorsed: 'weaving',
    resource_shared: 'weaving',
    colleague_helped: 'weaving',
    group_message_sent: 'weaving',
    group_joined: 'weaving',
    // Blooming
    thuthimal_received: 'blooming',
    principal_recognition: 'blooming',
    community_milestone_reached: 'blooming',
};

// ─────────────────────────────────────────────────────────────────────────────
// WHISPERED MOMENT DEFINITIONS
// (See GROWTH_MODEL.md Section 4 for full catalog and design specification.)
// ─────────────────────────────────────────────────────────────────────────────

type WhisperedMomentKey =
    | 'still_water'     // 5 mood check-ins (any mood, no pressure)
    | 'storm_holder'    // Fire journal 3+ times in one week
    | 'first_offering'  // First lesson material or resource shared
    | 'caring_teacher'  // 10+ assignments graded (proxy for consistent feedback)
    | 'the_seeker';     // All main app sections explored in first week

interface WhisperedMomentSpec {
    key: WhisperedMomentKey;
    name_si: string;    // Sinhala name (pending native educator review)
    name_en: string;
    triggerSignals: GrowthSignalType[];
}

const WHISPERED_MOMENT_SPECS: WhisperedMomentSpec[] = [
    {
        key: 'still_water',
        name_si: 'නිශ්චල දිය',
        name_en: 'Still Water',
        triggerSignals: ['mood_checkin'],
    },
    {
        key: 'storm_holder',
        name_si: 'කුළු ගෙන සිටින්නා',
        name_en: 'Storm Holder',
        triggerSignals: ['fire_journal_entry'],
    },
    {
        key: 'first_offering',
        name_si: 'ප්‍රථම දානය',
        name_en: 'First Offering',
        triggerSignals: ['lesson_material_created', 'resource_uploaded'],
    },
    {
        key: 'caring_teacher',
        name_si: 'සැලකිලිමත් ගුරුවරිය',
        name_en: 'The Caring Teacher',
        triggerSignals: ['assignment_graded'],
    },
    {
        key: 'the_seeker',
        name_si: 'සොයන්නා',
        name_en: 'The Seeker',
        triggerSignals: ['app_opened'],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// GROWTH SIGNALS API
// ─────────────────────────────────────────────────────────────────────────────

export const growthSignalsAPI = {
    /**
     * Emit a growth signal for a user.
     *
     * This is the single call site for wiring growth signals into existing APIs.
     * Every call:
     *   1. Writes a `growth_events` record (internal analytics — expressed through the lotus visual, not as raw data)
     *   2. Increments the user's dimension counter in `user_growth_state`
     *   3. Checks and awards any triggered Whispered Moments
     *   4. Checks and advances the user's Bhumi stage if criteria are met
     *
     * @param userId     The user performing the action.
     * @param signalType Semantic type of the signal (see GrowthSignalType).
     * @param metadata   Optional context stored in event_metadata (entity IDs, section names, etc.)
     *                   Never surfaced to the user — analytics only.
     */
    async emitSignal(
        userId: string,
        signalType: GrowthSignalType,
        metadata: Record<string, unknown> = {}
    ): Promise<void> {
        const dimension = GROWTH_SIGNAL_MAP[signalType];

        // 1. Record the growth event (internal analytics — feeds the lotus, stays out of the teacher's hands)
        const { error: eventError } = await supabase.from('growth_events').insert({
            user_id: userId,
            dimension,
            event_type: signalType,
            event_metadata: metadata,
        });

        if (eventError) {
            // Non-fatal — log only; growth observations absorb their own errors
            console.warn('[GrowthSignals] Failed to record event:', eventError.message);
            return;
        }

        // 2. Increment the dimension counter + check Bhumi stage transition
        await userGrowthStateAPI.incrementDimension(userId, dimension).catch(() => {});

        // 3. Check for Whispered Moments triggered by this signal type
        await checkWhisperedMoments(userId, signalType).catch(() => {});
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: Whispered Moment evaluation
// (Private — not exported. Only triggered from within emitSignal.)
// ─────────────────────────────────────────────────────────────────────────────

async function checkWhisperedMoments(
    userId: string,
    signalType: GrowthSignalType
): Promise<void> {
    const relevantMoments = WHISPERED_MOMENT_SPECS.filter(m =>
        m.triggerSignals.includes(signalType)
    );
    if (relevantMoments.length === 0) return;

    for (const moment of relevantMoments) {
        // Skip if already experienced (UNIQUE constraint on user_id + moment_key)
        const { data: existing } = await supabase
            .from('whispered_moments')
            .select('id')
            .eq('user_id', userId)
            .eq('moment_key', moment.key)
            .maybeSingle();

        if (existing) continue;

        const conditionMet = await evaluateMomentCondition(userId, moment.key);
        if (!conditionMet) continue;

        // Award the whispered moment — silently ignore duplicate-key errors
        await supabase
            .from('whispered_moments')
            .insert({
                user_id: userId,
                moment_key: moment.key,
                moment_name_si: moment.name_si,
                moment_name_en: moment.name_en,
            })
            .catch(() => {});
    }
}

async function evaluateMomentCondition(
    userId: string,
    momentKey: WhisperedMomentKey
): Promise<boolean> {
    switch (momentKey) {
        case 'still_water': {
            // Any 5 mood check-ins — any mood, no pressure
            const { count } = await supabase
                .from('growth_events')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'mood_checkin');
            return (count ?? 0) >= 5;
        }

        case 'storm_holder': {
            // 3+ fire journal entries within any 7-day window
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
                .from('growth_events')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'fire_journal_entry')
                .gte('created_at', sevenDaysAgo);
            return (count ?? 0) >= 3;
        }

        case 'first_offering': {
            // At least one lesson material or resource created
            const { count } = await supabase
                .from('growth_events')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .in('event_type', ['lesson_material_created', 'resource_uploaded']);
            return (count ?? 0) >= 1;
        }

        case 'caring_teacher': {
            // 10+ assignments graded (sustained engagement with students' work)
            const { count } = await supabase
                .from('growth_events')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'assignment_graded');
            return (count ?? 0) >= 10;
        }

        case 'the_seeker': {
            // Explored all four main sections: community, library, self, classroom
            const { data } = await supabase
                .from('growth_events')
                .select('event_metadata')
                .eq('user_id', userId)
                .eq('event_type', 'app_opened');

            const visitedSections = new Set<string>(
                (data ?? [])
                    .map(e => (e.event_metadata as Record<string, unknown>)?.section as string)
                    .filter(Boolean)
            );

            return (
                visitedSections.has('community') &&
                visitedSections.has('library') &&
                visitedSections.has('self') &&
                visitedSections.has('classroom')
            );
        }
    }
}
