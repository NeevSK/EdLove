/**
 * Warm Mirror API — Competence through personal narrative.
 */

import { checkLocalPermission } from '@repo/core/logic/permissions/localEvaluator';
import { APIError } from '@repo/core/types/API';
import { identityAPI } from '@repo/core/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

export interface WarmMirrorDataPoints {
  days_present: number;
  quiet_moments: number;
  ripples_received: number;
  assignments_with_feedback: number;
  resources_that_reached_others: number;
  posts_that_sparked: number;
  days_since_joined: number;
  primary_classroom_name?: string;
}

export const warmMirrorAPI = {
  async getDataPoints(userId: string, since?: string): Promise<WarmMirrorDataPoints> {
    const identity = await identityAPI.identifyActiveCitizen();
    const loggedInId = identity?.id;
    if (!loggedInId) throw new APIError('Authentication required', 'UNAUTHORIZED');

    const isAllowed = await checkLocalPermission({
      action: 'manage',
      resourceType: 'Wellbeing',
      resourceId: userId,
      userContext: { userId: loggedInId },
    });

    if (loggedInId !== userId && !isAllowed) {
      throw new APIError('Unauthorized access to wellbeing data', 'FORBIDDEN');
    }

    const now = Date.now();
    const periodStart = since ?? new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: growthEvents } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('growth_events')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', periodStart);

    const distinctDays = new Set((growthEvents ?? []).map((e) => e.created_at.slice(0, 10)));
    const days_present = distinctDays.size;

    const { count: quietCount } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('growth_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .in('event_type', ['mood_checkin', 'breathing_exercise_complete', 'fire_journal_entry']);
    const quiet_moments = quietCount ?? 0;

    const { count: ripplesCount } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('impact_ripples')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', userId)
      .eq('delivered', true)
      .gte('delivered_at', periodStart);
    const ripples_received = ripplesCount ?? 0;

    const { data: gradingData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('grades')
      .select('feedback')
      .eq('user_id', userId)
      .gte('graded_at', periodStart)
      .not('feedback', 'is', null);
    const assignments_with_feedback = (gradingData ?? []).filter(
      (g) => (g.feedback?.length ?? 0) > 20,
    ).length;

    const { data: reachRipples } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('impact_ripples')
      .select('source_entity_id')
      .eq('recipient_user_id', userId)
      .eq('delivered', true)
      .in('ripple_type', ['resource_saved', 'resource_read', 'lesson_accessed'])
      .gte('delivered_at', periodStart);
    const resources_that_reached_others = new Set(
      (reachRipples ?? []).map((r) => r.source_entity_id).filter(Boolean),
    ).size;

    const { count: postsCount } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('impact_ripples')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', userId)
      .eq('ripple_type', 'post_sparked')
      .eq('delivered', true)
      .gte('delivered_at', periodStart);
    const posts_that_sparked = postsCount ?? 0;

    const { data: growthState } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_growth_state')
      .select('created_at')
      .eq('user_id', userId)
      .maybeSingle();
    const joinedAt = growthState?.created_at ? new Date(growthState.created_at) : new Date();
    const days_since_joined = Math.floor((now - joinedAt.getTime()) / (1000 * 60 * 60 * 24));

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

  generateNarrativeEn(data: WarmMirrorDataPoints): string {
    const lines: string[] = ['This past week in your sanctuary:'];

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
      lines.push(`You showed up on ${data.days_present} days — including the harder ones.`);
    }

    if (data.quiet_moments >= 3) {
      lines.push('You made space for yourself more than once. That takes intention.');
    } else if (data.quiet_moments === 1) {
      lines.push('You made space for yourself at least once.');
    }

    if (data.ripples_received >= 3) {
      lines.push(
        `Your work reached people — ${data.ripples_received} quiet echoes came back to you this week.`,
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

    if (data.days_since_joined >= 30 && data.primary_classroom_name) {
      const months = Math.floor(data.days_since_joined / 30);
      lines.push(
        `${data.primary_classroom_name} has been your classroom for ${months} ${
          months === 1 ? 'month' : 'months'
        } now.`,
      );
    }

    lines.push('You showed up. That is not a small thing.');

    return lines.join('\n');
  },

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
        '\u0D94\u0DB6\u0DDA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DBA\u0DED\u0D9C\u0DD2\u0DBA \u0DAD\u0DBB\u0D82\u0D9C \u0D86\u0DB4\u0DC3\u0DD4 \u0D86\u0DC0\u0DCF.',
      );
    }

    if (data.assignments_with_feedback > 0) {
      lines.push(
        `\u0D94\u0DB6 ${data.assignments_with_feedback} \u0DAF\u0DD9\u0DB1\u0DD9\u0D9A\u0DD4\u0DA7 \u0D9C\u0DD0\u0DB9\u0DD4\u0DBB\u0DD4 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DA0\u0DCF\u0DBB \u0DBD\u0DD2\u0DC0\u0DCA\u0DC0\u0DCF.`,
      );
    }

    lines.push(
      '\u0D94\u0DB6 \u0D9C\u0DD9\u0DB1\u0DBA. \u0D91\u0DBA \u0D9A\u0DD4\u0DA9\u0DAF\u0DD9\u0DBA\u0D9A\u0DCA \u0DB1\u0DDC\u0DC0\u0DDA.',
    );

    return lines.join('\n');
  },
};
