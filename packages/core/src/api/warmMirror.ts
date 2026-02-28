/**
 * Warm Mirror API — Competence through personal narrative.
 *
 * The Warm Mirror is a teacher's (or student's) weekly reflection on what they
 * actually did — framed as a human story, not a performance summary.
 *
 * It lives in the Self tab as an optional, quietly glowing section. It is:
 *   - Entirely opt-in (enabled by teacher in Self settings)
 *   - Never pushed as a notification
 *   - Completely private (not visible to Principal or colleagues)
 *   - Compassionate for quiet weeks ("Rest is part of the rhythm")
 *   - Story-format, not dashboard-format — no raw numbers as headlines
 *
 * Philosophy (see GROWTH_MODEL.md v2.0 — Section 3: "The Warm Mirror"):
 *   The Warm Mirror does not tell a teacher they "achieved" something.
 *   It tells them who they ARE based on what they did.
 *
 * (See GROWTH_MODEL.md Appendix B for WarmMirrorDataPoints interface specification.)
 */

import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All data points needed to generate the Warm Mirror narrative.
 * Aggregated from multiple tables — never raw event counts as headlines.
 */
export interface WarmMirrorDataPoints {
    // Presence
    /** Distinct calendar days where any growth_event was recorded. */
    days_present: number;
    /** Count of self-care actions: mood_checkin + breathing_exercise_complete + fire_journal_entry */
    quiet_moments: number;

    // Nourishing / Impact
    /** Impact Ripples delivered this period (warm echoes of real human impact). */
    ripples_received: number;
    /** Assignments graded where written feedback was provided (feedback length > 20 chars). */
    assignments_with_feedback: number;
    /** Resources or lesson materials that generated at least one ripple (resource_saved or resource_read). */
    resources_that_reached_others: number;

    // Weaving
    /** Community posts or messages that generated a post_sparked ripple. */
    posts_that_sparked: number;

    // Context (for richer narrative phrasing)
    /** Days since the user joined the app. Used for "your classroom has been home for X months". */
    days_since_joined: number;
    /** Name of the user's primary classroom, if any. */
    primary_classroom_name?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WARM MIRROR API
// ─────────────────────────────────────────────────────────────────────────────

export const warmMirrorAPI = {
    /**
     * Aggregate the data points needed for a user's Warm Mirror narrative.
     *
     * @param userId    The user's ID.
     * @param since     ISO timestamp — start of the period to aggregate (default: 7 days ago).
     */
    async getDataPoints(userId: string, since?: string): Promise<WarmMirrorDataPoints> {
        const periodStart = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Days present — distinct calendar days with any growth_event
        const { data: growthEvents } = await supabase
            .from('growth_events')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', periodStart);

        const distinctDays = new Set(
            (growthEvents ?? []).map(e => e.created_at.slice(0, 10)) // YYYY-MM-DD
        );
        const days_present = distinctDays.size;

        // 2. Quiet self-care moments
        const { count: quietCount } = await supabase
            .from('growth_events')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', periodStart)
            .in('event_type', [
                'mood_checkin',
                'breathing_exercise_complete',
                'fire_journal_entry',
            ]);
        const quiet_moments = quietCount ?? 0;

        // 3. Impact ripples delivered this period
        const { count: ripplesCount } = await supabase
            .from('impact_ripples')
            .select('id', { count: 'exact', head: true })
            .eq('recipient_user_id', userId)
            .eq('delivered', true)
            .gte('delivered_at', periodStart);
        const ripples_received = ripplesCount ?? 0;

        // 4. Assignments graded with written feedback (feedback length > 20 chars)
        const { count: feedbackCount } = await supabase
            .from('grades')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', periodStart)
            .not('feedback', 'is', null)
            .gt('feedback', '                    '); // > 20 chars (20 spaces as proxy)
        // Note: Supabase doesn't support string length in PostgREST filters directly.
        // The gt comparison is an approximation; for production, use a DB function.
        const assignments_with_feedback = feedbackCount ?? 0;

        // 5. Resources/lessons that reached others (via resource_saved or resource_read ripples)
        const { data: reachRipples } = await supabase
            .from('impact_ripples')
            .select('source_entity_id')
            .eq('recipient_user_id', userId)
            .in('ripple_type', ['resource_saved', 'resource_read', 'lesson_accessed'])
            .gte('created_at', periodStart);
        const resources_that_reached_others = new Set(
            (reachRipples ?? []).map(r => r.source_entity_id).filter(Boolean)
        ).size;

        // 6. Posts that sparked a conversation (post_sparked ripples)
        const { count: postsCount } = await supabase
            .from('impact_ripples')
            .select('id', { count: 'exact', head: true })
            .eq('recipient_user_id', userId)
            .eq('ripple_type', 'post_sparked')
            .gte('created_at', periodStart);
        const posts_that_sparked = postsCount ?? 0;

        // 7. Days since joined (from the user's growth state)
        const { data: growthState } = await supabase
            .from('user_growth_state')
            .select('created_at')
            .eq('user_id', userId)
            .maybeSingle();
        const joinedAt = growthState?.created_at
            ? new Date(growthState.created_at)
            : new Date();
        const days_since_joined = Math.floor(
            (Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            days_present,
            quiet_moments,
            ripples_received,
            assignments_with_feedback,
            resources_that_reached_others,
            posts_that_sparked,
            days_since_joined,
        };
    },

    /**
     * Generate the English Warm Mirror narrative from a set of data points.
     *
     * The narrative is:
     *   - Story-format, not a list of metrics
     *   - Compassionate for quiet weeks (never guilting)
     *   - Present-tense observations, not past-tense verdicts
     *   - Ending with a grounding affirmation (never toxic positivity)
     */
    generateNarrativeEn(data: WarmMirrorDataPoints): string {
        const lines: string[] = ['This past week in your sanctuary:'];

        // Presence
        if (data.days_present === 0) {
            lines.push(
                'This week was a quiet one.',
                'The sanctuary is here when you return.',
                'Rest is part of the rhythm.'
            );
            return lines.join('\n');
        }

        if (data.days_present === 1) {
            lines.push('You found your way here once this week. That still counts.');
        } else if (data.days_present <= 3) {
            lines.push(`You were present on ${data.days_present} days.`);
        } else {
            lines.push(`You showed up on ${data.days_present} days — including the harder ones.`);
        }

        // Self-care
        if (data.quiet_moments >= 3) {
            lines.push('You made space for yourself more than once. That takes intention.');
        } else if (data.quiet_moments === 1) {
            lines.push('You made space for yourself at least once.');
        }

        // Impact on others
        if (data.ripples_received >= 3) {
            lines.push(
                `Your work reached people — ${data.ripples_received} quiet echoes came back to you this week.`
            );
        } else if (data.ripples_received === 1) {
            lines.push('Your work touched someone this week.');
        }

        if (data.resources_that_reached_others > 0) {
            lines.push(
                `${data.resources_that_reached_others === 1 ? 'Something' : `${data.resources_that_reached_others} things`} you created found their way to another person.`
            );
        }

        if (data.assignments_with_feedback > 0) {
            lines.push(
                `You wrote careful feedback for ${data.assignments_with_feedback} ${
                    data.assignments_with_feedback === 1 ? 'student' : 'students'
                }. They received more than a mark.`
            );
        }

        if (data.posts_that_sparked > 0) {
            lines.push('A question you raised opened a conversation.');
        }

        // Long-running context
        if (data.days_since_joined >= 30 && data.primary_classroom_name) {
            const months = Math.floor(data.days_since_joined / 30);
            lines.push(
                `${data.primary_classroom_name} has been your classroom for ${months} ${
                    months === 1 ? 'month' : 'months'
                } now.`
            );
        }

        // Closing affirmation (never toxic positivity — grounded and warm)
        lines.push('You showed up. That is not a small thing.');

        return lines.join('\n');
    },

    /**
     * Generate the Sinhala Warm Mirror narrative.
     *
     * ⚠️  PENDING NATIVE REVIEW: These are draft translations and must be reviewed
     * by a native Sri Lankan educator before production use. Natural idiomatic
     * expression matters more than literal accuracy. See GROWTH_MODEL.md note.
     */
    generateNarrativeSi(data: WarmMirrorDataPoints): string {
        const lines: string[] = ['ඔබේ ශාලාවේ පසුගිය සතිය:'];

        if (data.days_present === 0) {
            lines.push(
                'මේ සතිය නිහඬ එකක් විය.',
                'ශාලාව ඔබ ආපසු ආ විට මෙහිම ඇත.',
                'විශ්‍රාමය ද ගමනේ කොටසකි.'
            );
            return lines.join('\n');
        }

        if (data.days_present === 1) {
            lines.push('ඔබ මේ සතිය තුළ එක් වරක් මෙහි ආවා. එය ද ගණනාවේ.');
        } else {
            lines.push(`ඔබ ${data.days_present} දිනක් ළඟ සිටියා.`);
        }

        if (data.quiet_moments >= 1) {
            lines.push('ඔබ ඔබ සඳහා ඉඩක් සෑදූ.');
        }

        if (data.ripples_received >= 1) {
            lines.push('ඔබේ කාර්යයේ ගිය තරංග ආපසු ආවා.');
        }

        if (data.assignments_with_feedback > 0) {
            lines.push(`ඔබ ${data.assignments_with_feedback} දෙනෙකුට ගැඹුරු ප්‍රතිචාර ලිව්වා.`);
        }

        lines.push('ඔබ ගෙනය. එය කුඩා දෙයක් නොවේ.'); // pending native review

        return lines.join('\n');
    },
};
