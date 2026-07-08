import { getTemporalRange } from '../logic/utils/temporalUtils';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

/**
 * Growth Signals API \u2014 internal tracking of aliveness dimensions.
 *
 * \u26A0\uFE0F  PHILOSOPHY ALIGNMENT NOTE (see docs/Core/GROWTH_MODEL.md v2.0):
 * This module was originally scaffolded as a conventional "points + badges" system.
 * It is being repurposed toward the Bhumi Nature-Inspired Growth Model (v2.0):
 *   - `points`  \u2192 internal growth_score (NEVER displayed to user as a number)
 *   - `badges`  \u2192 signals fed into Whispered Moments (never a browsable badge collection)
 *   - NEW v2.0: `impact_ripples` table handles Relatedness (Impact Ripple mechanism)
 *   - NEW v2.0: `WarmMirrorDataPoints` aggregation handles Competence (Warm Mirror narrative)
 *   - NEW v2.0: `user_growth_state` table tracks Bhumi life stages (Bijam \u2192 Purna Kamala)
 *
 * The Gurudevi North Star explicitly prohibits extractive gamification (points/rankings/streaks).
 * The golden mean (v2.0): genuine human-sourced impact feedback IS healthy (relatedness \u2260 gamification).
 * Do NOT expose points or badge counts in any UI component.
 * Use `user_growth_state` for the Lotus Life Stage visualization.
 * Use `impact_ripples` for warm human connection signals.
 * Use `WarmMirrorDataPoints` aggregation for the weekly personal narrative.
 */
function isAbortError(error: any): boolean {
  return !!(
    error &&
    (error.message?.includes('AbortError') ||
      error.message?.includes('Lock broken') ||
      error.details?.includes('AbortError') ||
      error.details?.includes('Lock broken'))
  );
}

export const rewardsAPI = {
  /**
   * Fetches reward data for a specific user.
   * Returns null if no record exists yet.
   */
  async getRewards(userId: string) {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards API] Suppressing abort/lock-steal error during fetch:', error.message);
        return null;
      }
      console.error('Error fetching rewards:', error);
      throw error;
    }
    return data;
  },

  async getRewardsAsOf(userId: string, asOf: string) {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_rewards_versions')
      .select('snapshot')
      .eq('user_id', userId)
      .lte('recorded_at', asOf)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards API] Suppressing abort/lock-steal error during history fetch:', error.message);
        return null;
      }
      console.error('Error fetching historical rewards:', error);
      throw error;
    }
    return (data?.snapshot as any) ?? null;
  },

  async getRewardsHistory(userId: string, limit = 50) {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_rewards_versions')
      .select('id, operation, recorded_at, recorded_by, snapshot')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards API] Suppressing abort/lock-steal error during history list:', error.message);
        return [];
      }
      console.error('Error fetching rewards history:', error);
      throw error;
    }
    return data || [];
  },

  async getRewardsRangeHistory(
    userId: string,
    viewDate: string,
    viewScale: 'day' | 'week' | 'month' | 'year' | 'custom' = 'day',
  ) {
    const { start, end } = getTemporalRange(viewDate, viewScale === 'custom' ? 'day' : viewScale);
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_rewards_versions')
      .select('id, operation, recorded_at, recorded_by, snapshot')
      .eq('user_id', userId)
      .gte('recorded_at', start)
      .lte('recorded_at', end)
      .order('recorded_at', { ascending: false });

    if (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards API] Suppressing abort/lock-steal error during range history list:', error.message);
        return [];
      }
      console.error('Error fetching rewards range history:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Initializes a rewards record for a new user if it doesn't exist.
   */
  async initializeRewards(userId: string) {
    const existing = await this.getRewards(userId);
    if (existing) return existing;

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_rewards')
      .insert([
        {
          user_id: userId,
          points: 0,
          badges: [],
        },
      ])
      .select()
      .single();

    if (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards API] Suppressing abort/lock-steal error during initialization:', error.message);
        return null;
      }
      console.error('Error initializing rewards:', error);
      throw error;
    }
    return data;
  },

  /**
   * Adds points to a user's reward balance.
   * Automatically initializes the record if it doesn't exist.
   */
  async addPoints(userId: string, points: number) {
    const rewards = await this.getRewards(userId);

    if (!rewards) {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('user_rewards')
        .insert([
          {
            user_id: userId,
            points: points,
            badges: [],
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('user_rewards')
        .update({
          points: (rewards.points || 0) + points,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Awards a badge to a user.
   */
  async awardBadge(userId: string, badge: string) {
    const rewards = await this.getRewards(userId);
    const currentBadges = rewards?.badges || [];

    if (currentBadges.includes(badge)) return rewards;

    const updatedBadges = [...currentBadges, badge];

    if (!rewards) {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('user_rewards')
        .insert([
          {
            user_id: userId,
            points: 0,
            badges: updatedBadges,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('user_rewards')
        .update({
          badges: updatedBadges,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Checks if user qualifies for any new Whispered Moments or Bhumi stage transitions.
   *
   * \u26A0\uFE0F  MIGRATION PENDING (see GROWTH_MODEL.md Phase 1):
   * Current implementation awards generic badge strings.
   * Target implementation: check `user_growth_state` + emit `whispered_moments` events.
   * The "Sanctuary Seeker" string badge should be migrated to the
   * `whispered_moments` table with key 'the_seeker' and Sinhala name '\u0DC3\u0DDC\u0DBA\u0DB1\u0DCA\u0DB1\u0DCF'.
   */
  async checkAndAwardAchievements(userId: string) {
    // Fetch feature usage
    const { data: usage } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('feature_usage_log')
      .select('feature_name')
      .eq('user_id', userId);

    const features = usage?.map((u) => u.feature_name) || [];
    const rewards = await this.getRewards(userId);
    const badges = rewards?.badges || [];
    const newBadges: string[] = [];

    // Sanctuary Seeker: Visit all 4 main sections
    const mainSections = [
      'section_self',
      'section_community',
      'section_library',
      'section_profile',
    ];
    if (mainSections.every((s) => features.includes(s)) && !badges.includes('Sanctuary Seeker')) {
      newBadges.push('Sanctuary Seeker');
    }

    if (newBadges.length > 0) {
      const updatedBadges = [...badges, ...newBadges];
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('user_rewards')
        .update({
          badges: updatedBadges,
          points: (rewards?.points || 0) + newBadges.length * 50,
        })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return { updatedRewards: data, newAchievements: newBadges };
    }

    return { updatedRewards: rewards, newAchievements: [] };
  },
};
