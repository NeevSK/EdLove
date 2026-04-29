/**
 * Warm Mirror API \u2014 Competence through personal narrative.
 *
 * The Warm Mirror is a teacher's (or student's) weekly reflection on what they
 * actually did \u2014 framed as a human story, not a performance summary.
 *
 * It lives in the Self tab as an optional, quietly glowing section. It is:
 *   - Entirely opt-in (enabled by teacher in Self settings)
 *   - Never pushed as a notification
 *   - Completely private (not visible to Principal or colleagues)
 *   - Compassionate for quiet weeks ("Rest is part of the rhythm")
 *   - Story-format, not dashboard-format \u2014 no raw numbers as headlines
 *
 * Philosophy (see GROWTH_MODEL.md v2.0 \u2014 Section 3: "The Warm Mirror"):
 *   The Warm Mirror does not tell a teacher they "achieved" something.
 *   It tells them who they ARE based on what they did.
 *
 * (See GROWTH_MODEL.md Appendix B for WarmMirrorDataPoints interface specification.)
 */

import { composeUserAbilities } from '../logic/permissions/composer';
import { identityAPI } from './identity';
import { supabase } from './supabase';
import { APIError } from '../types/API';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/**
 * All data points needed to generate the Warm Mirror narrative.
 * Aggregated from multiple tables \u2014 events are woven into narrative; meaning over metrics.
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

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// WARM MIRROR API
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const warmMirrorAPI = {
  /**
   * Aggregate the data points needed for a user's Warm Mirror narrative.
   *
   * @param userId    The user's ID.
   * @param since     ISO timestamp \u2014 start of the period to aggregate (default: 7 days ago).
   */
  async getDataPoints(userId: string, since?: string): Promise<WarmMirrorDataPoints> {
    const loggedInId = await identityAPI.getMyInternalId();
    const ability = composeUserAbilities({ userId: loggedInId });

    if (loggedInId !== userId && !ability.can('manage', 'Wellbeing')) {
      throw new APIError('Unauthorized access to wellbeing data', 'FORBIDDEN');
    }

    const periodStart = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Days present \u2014 distinct calendar days with any growth_event
    const { data: growthEvents } = await supabase
      .from('growth_events')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', periodStart);

    const distinctDays = new Set(
      (growthEvents ?? []).map((e) => e.created_at.slice(0, 10)), // YYYY-MM-DD
    );
    const days_present = distinctDays.size;

    // 2. Quiet self-care moments
    const { count: quietCount } = await supabase
      .from('growth_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .in('event_type', ['mood_checkin', 'breathing_exercise_complete', 'fire_journal_entry']);
    const quiet_moments = quietCount ?? 0;

    // 3. Impact ripples delivered this period
    const { count: ripplesCount } = await supabase
      .from('impact_ripples')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', userId)
      .eq('delivered', true)
      .gte('delivered_at', periodStart);
    const ripples_received = ripplesCount ?? 0;

    // 4. Assignments graded with substantive written feedback (> 20 characters).
    // PostgREST has no direct string-length filter, so we fetch this teacher's feedback
    // text and measure length in application code. The user_id filter keeps the
    // result set small (only this teacher's grades in this period).
    const { data: gradingData } = await supabase
      .from('grades')
      .select('feedback')
      .eq('user_id', userId)
      .gte('graded_at', periodStart)
      .not('feedback', 'is', null);
    const assignments_with_feedback = (gradingData ?? []).filter(
      (g) => (g.feedback?.length ?? 0) > 20,
    ).length;

    // 5. Resources/lessons that reached others (via resource_saved or resource_read ripples)
    const { data: reachRipples } = await supabase
      .from('impact_ripples')
      .select('source_entity_id')
      .eq('recipient_user_id', userId)
      .eq('delivered', true)
      .in('ripple_type', ['resource_saved', 'resource_read', 'lesson_accessed'])
      .gte('delivered_at', periodStart);
    const resources_that_reached_others = new Set(
      (reachRipples ?? []).map((r) => r.source_entity_id).filter(Boolean),
    ).size;

    // 6. Posts that sparked a conversation (post_sparked ripples)
    const { count: postsCount } = await supabase
      .from('impact_ripples')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', userId)
      .eq('ripple_type', 'post_sparked')
      .eq('delivered', true)
      .gte('delivered_at', periodStart);
    const posts_that_sparked = postsCount ?? 0;

    // 7. Days since joined (from the user's growth state)
    const { data: growthState } = await supabase
      .from('user_growth_state')
      .select('created_at')
      .eq('user_id', userId)
      .maybeSingle();
    const joinedAt = growthState?.created_at ? new Date(growthState.created_at) : new Date();
    const days_since_joined = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));

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
   *   - Compassionate for quiet weeks \u2014 rest is as valid as activity, honored as such
   *   - Present-tense observations, not past-tense verdicts
   *   - Ending with a grounding affirmation \u2014 real acknowledgment, warm but not hollow
   */
  generateNarrativeEn(data: WarmMirrorDataPoints): string {
    const lines: string[] = ['This past week in your sanctuary:'];

    // Presence
    if (data.days_present === 0) {
      lines.push(
        'This week was a quiet one.',
        'The sanctuary is here when you return.',
        'Rest is part of the rhythm.',
      );
      return lines.join('\n');
    }

    if (data.days_present === 1) {
      lines.push('You found your way here once this week. That still counts.');
    } else if (data.days_present <= 3) {
      lines.push(`You were present on ${data.days_present} days.`);
    } else {
      lines.push(`You showed up on ${data.days_present} days \u2014 including the harder ones.`);
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
        `Your work reached people \u2014 ${data.ripples_received} quiet echoes came back to you this week.`,
      );
    } else if (data.ripples_received === 1) {
      lines.push('Your work touched someone this week.');
    }

    if (data.resources_that_reached_others > 0) {
      lines.push(
        `${data.resources_that_reached_others === 1 ? 'Something' : `${data.resources_that_reached_others} things`} you created found their way to another person.`,
      );
    }

    if (data.assignments_with_feedback > 0) {
      lines.push(
        `You wrote careful feedback for ${data.assignments_with_feedback} ${
          data.assignments_with_feedback === 1 ? 'student' : 'students'
        }. They received more than a mark.`,
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
        } now.`,
      );
    }

    // Closing affirmation \u2014 grounded and warm; real acknowledgment over empty encouragement
    lines.push('You showed up. That is not a small thing.');

    return lines.join('\n');
  },

  /**
   * Generate the Sinhala Warm Mirror narrative.
   *
   * \u26A0\uFE0F  PENDING NATIVE REVIEW: These are draft translations and must be reviewed
   * by a native Sri Lankan educator before production use. Natural idiomatic
   * expression matters more than literal accuracy. See GROWTH_MODEL.md note.
   */
  generateNarrativeSi(data: WarmMirrorDataPoints): string {
    const lines: string[] = [
      '\u0D94\u0DB6\u0DDA \u0DC1\u0DCF\u0DBD\u0DCF\u0DC0\u0DDA \u0DB4\u0DC3\u0DD4\u0D9C\u0DD2\u0DBA \u0DC3\u0DAD\u0DD2\u0DBA:',
    ];

    if (data.days_present === 0) {
      lines.push(
        '\u0DB8\u0DDA \u0DC3\u0DAD\u0DD2\u0DBA \u0DB1\u0DD2\u0DC4\u0DAC \u0D91\u0D9A\u0D9A\u0DCA \u0DC0\u0DD2\u0DBA.',
        '\u0DC1\u0DCF\u0DBD\u0DCF\u0DC0 \u0D94\u0DB6 \u0D86\u0DB4\u0DC3\u0DD4 \u0D86 \u0DC0\u0DD2\u0DA7 \u0DB8\u0DD9\u0DC4\u0DD2\u0DB8 \u0D87\u0DAD.',
        '\u0DC0\u0DD2\u0DC1\u0DCA\u200D\u0DBB\u0DCF\u0DB8\u0DBA \u0DAF \u0D9C\u0DB8\u0DB1\u0DDA \u0D9A\u0DDC\u0DA7\u0DC3\u0D9A\u0DD2.',
      );
      return lines.join('\n');
    }

    if (data.days_present === 1) {
      lines.push(
        '\u0D94\u0DB6 \u0DB8\u0DDA \u0DC3\u0DAD\u0DD2\u0DBA \u0DAD\u0DD4\u0DC5 \u0D91\u0D9A\u0DCA \u0DC0\u0DBB\u0D9A\u0DCA \u0DB8\u0DD9\u0DC4\u0DD2 \u0D86\u0DC0\u0DCF. \u0D91\u0DBA \u0DAF \u0D9C\u0DAB\u0DB1\u0DCF\u0DC0\u0DDA.',
      );
    } else {
      lines.push(
        `\u0D94\u0DB6 ${data.days_present} \u0DAF\u0DD2\u0DB1\u0D9A\u0DCA \u0DC5\u0D9F \u0DC3\u0DD2\u0DA7\u0DD2\u0DBA\u0DCF.`,
      );
    }

    if (data.quiet_moments >= 1) {
      lines.push(
        '\u0D94\u0DB6 \u0D94\u0DB6 \u0DC3\u0DB3\u0DC4\u0DCF \u0D89\u0DA9\u0D9A\u0DCA \u0DC3\u0DD1\u0DAF\u0DD6.',
      );
    }

    if (data.ripples_received >= 1) {
      lines.push(
        '\u0D94\u0DB6\u0DDA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DBA\u0DDA \u0D9C\u0DD2\u0DBA \u0DAD\u0DBB\u0D82\u0D9C \u0D86\u0DB4\u0DC3\u0DD4 \u0D86\u0DC0\u0DCF.',
      );
    }

    if (data.assignments_with_feedback > 0) {
      lines.push(
        `\u0D94\u0DB6 ${data.assignments_with_feedback} \u0DAF\u0DD9\u0DB1\u0DD9\u0D9A\u0DD4\u0DA7 \u0D9C\u0DD0\u0DB9\u0DD4\u0DBB\u0DD4 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DA0\u0DCF\u0DBB \u0DBD\u0DD2\u0DC0\u0DCA\u0DC0\u0DCF.`,
      );
    }

    lines.push(
      '\u0D94\u0DB6 \u0D9C\u0DD9\u0DB1\u0DBA. \u0D91\u0DBA \u0D9A\u0DD4\u0DA9\u0DCF \u0DAF\u0DD9\u0DBA\u0D9A\u0DCA \u0DB1\u0DDC\u0DC0\u0DDA.',
    ); // pending native review

    return lines.join('\n');
  },
};
