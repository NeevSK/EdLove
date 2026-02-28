import { supabase } from '../lib/supabase';

/**
 * Growth Signals API — internal tracking of aliveness dimensions.
 *
 * ⚠️  PHILOSOPHY ALIGNMENT NOTE (see docs/Core/GROWTH_MODEL.md v2.0):
 * This module was originally scaffolded as a conventional "points + badges" system.
 * It is being repurposed toward the Bhumi Nature-Inspired Growth Model (v2.0):
 *   - `points`  → internal growth_score (NEVER displayed to user as a number)
 *   - `badges`  → signals fed into Whispered Moments (never a browsable badge collection)
 *   - NEW v2.0: `impact_ripples` table handles Relatedness (Impact Ripple mechanism)
 *   - NEW v2.0: `WarmMirrorDataPoints` aggregation handles Competence (Warm Mirror narrative)
 *   - NEW v2.0: `user_growth_state` table tracks Bhumi life stages (Bijam → Purna Kamala)
 *
 * The Gurudevi North Star explicitly prohibits extractive gamification (points/rankings/streaks).
 * The golden mean (v2.0): genuine human-sourced impact feedback IS healthy (relatedness ≠ gamification).
 * Do NOT expose points or badge counts in any UI component.
 * Use `user_growth_state` for the Lotus Life Stage visualization.
 * Use `impact_ripples` for warm human connection signals.
 * Use `WarmMirrorDataPoints` aggregation for the weekly personal narrative.
 */
export const rewardsAPI = {
    /**
     * Fetches reward data for a specific user.
     * Returns null if no record exists yet.
     */
    async getRewards(userId: string) {
        const { data, error } = await supabase
            .from('user_rewards')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching rewards:', error);
            throw error;
        }
        return data;
    },

    /**
     * Initializes a rewards record for a new user if it doesn't exist.
     */
    async initializeRewards(userId: string) {
        const existing = await this.getRewards(userId);
        if (existing) return existing;

        const { data, error } = await supabase
            .from('user_rewards')
            .insert([{
                user_id: userId,
                points: 0,
                badges: []
            }])
            .select()
            .single();

        if (error) {
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
            const { data, error } = await supabase
                .from('user_rewards')
                .insert([{
                    user_id: userId,
                    points: points,
                    badges: []
                }])
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('user_rewards')
                .update({
                    points: (rewards.points || 0) + points,
                    updated_at: new Date().toISOString()
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
            const { data, error } = await supabase
                .from('user_rewards')
                .insert([{
                    user_id: userId,
                    points: 0,
                    badges: updatedBadges
                }])
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('user_rewards')
                .update({
                    badges: updatedBadges,
                    updated_at: new Date().toISOString()
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
     * ⚠️  MIGRATION PENDING (see GROWTH_MODEL.md Phase 1):
     * Current implementation awards generic badge strings.
     * Target implementation: check `user_growth_state` + emit `whispered_moments` events.
     * The "Sanctuary Seeker" string badge should be migrated to the
     * `whispered_moments` table with key 'the_seeker' and Sinhala name 'සොයන්නා'.
     */
    async checkAndAwardAchievements(userId: string) {
        // Fetch feature usage
        const { data: usage } = await supabase
            .from('feature_usage_log')
            .select('feature_name')
            .eq('user_id', userId);

        const features = usage?.map(u => u.feature_name) || [];
        const rewards = await this.getRewards(userId);
        const badges = rewards?.badges || [];
        const newBadges: string[] = [];

        // Sanctuary Seeker: Visit all 4 main sections
        const mainSections = ['section_self', 'section_community', 'section_library', 'section_profile'];
        if (mainSections.every(s => features.includes(s)) && !badges.includes('Sanctuary Seeker')) {
            newBadges.push('Sanctuary Seeker');
        }

        if (newBadges.length > 0) {
            const updatedBadges = [...badges, ...newBadges];
            const { data, error } = await supabase
                .from('user_rewards')
                .update({
                    badges: updatedBadges,
                    points: (rewards?.points || 0) + (newBadges.length * 50)
                })
                .eq('user_id', userId)
                .select()
                .single();
            if (error) throw error;
            return { updatedRewards: data, newAchievements: newBadges };
        }

        return { updatedRewards: rewards, newAchievements: [] };
    }
};
