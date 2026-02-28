import { supabase, APIError, requireAuth, growthSignalsAPI } from '@repo/core';
import { MoodLog, FireJournalEntry } from '../types';

// ============================================================================
// SELF API (Wellbeing & Reflection)
// ============================================================================

export const selfAPI = {
    /**
     * Log a mood entry for the current user
     */
    async logMood(userId: string, score: number, note?: string): Promise<MoodLog> {
        const user = await requireAuth();
        if (user.id !== userId) {
            throw new APIError('Unauthorized: Cannot log mood for another user', 'FORBIDDEN');
        }

        // Validate mood score (1-5)
        if (score < 1 || score > 5) {
            throw new APIError('Mood score must be between 1 and 5', 'INVALID_SCORE');
        }

        const { data, error } = await supabase
            .from('mood_logs')
            .insert([
                {
                    user_id: userId,
                    mood_score: score,
                    note,
                },
            ])
            .select()
            .single();


        if (error) {
            throw new APIError('Failed to log mood', error.code, error);
        }

        // Growth signal: teacher chose to check in with themselves (Presence — Tier 2 Care Signal)
        // Also triggers the 'still_water' Whispered Moment check after 5 consecutive check-ins
        void growthSignalsAPI.emitSignal(userId, 'mood_checkin', {
            mood_score: score,
        }).catch(() => {});

        return data;
    },

    /**
     * Get mood history for a user
     */
    async getMoodHistory(userId: string, limit: number = 30): Promise<MoodLog[]> {
        const user = await requireAuth();
        if (user.id !== userId) {
            throw new APIError('Unauthorized: Cannot view another user\'s mood history', 'FORBIDDEN');
        }

        const { data, error } = await supabase
            .from('mood_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new APIError('Failed to fetch mood history', error.code, error);
        }

        return data || [];
    },

    /**
     * Burn a journal entry (save with is_burned = true)
     * Content is stored with only a preview for privacy
     */
    async burnJournal(userId: string, content: string): Promise<FireJournalEntry> {
        const user = await requireAuth();
        if (user.id !== userId) {
            throw new APIError('Unauthorized: Cannot burn journal for another user', 'FORBIDDEN');
        }

        // Only store preview (first 50 characters) for privacy
        const contentPreview = content.substring(0, 50);

        const { data, error } = await supabase
            .from('fire_journal')
            .insert([
                {
                    user_id: userId,
                    content_preview: contentPreview,
                    is_burned: true,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to burn journal entry', error.code, error);
        }

        // Growth signal: teacher processed difficult emotions (Presence — Tier 2 Care Signal)
        // Also triggers the 'storm_holder' Whispered Moment check after 3+ entries in a week
        void growthSignalsAPI.emitSignal(userId, 'fire_journal_entry', {}).catch(() => {});

        return data;
    },

    /**
     * Get burned journal history (for statistics, not content)
     */
    async getBurnedHistory(userId: string, limit: number = 10): Promise<FireJournalEntry[]> {
        const user = await requireAuth();
        if (user.id !== userId) {
            throw new APIError('Unauthorized: Cannot view another user\'s journal history', 'FORBIDDEN');
        }

        const { data, error } = await supabase
            .from('fire_journal')
            .select('id, user_id, content_preview, is_burned, created_at')
            .eq('user_id', userId)
            .eq('is_burned', true)
            .order('created_at', { ascending: false })
            .limit(limit);


        if (error) {
            throw new APIError('Failed to fetch burned history', error.code, error);
        }

        return data || [];
    },

    /**
     * Get today's mood (if logged)
     */
    async getTodayMood(userId: string): Promise<MoodLog | null> {
        const user = await requireAuth();
        if (user.id !== userId) {
            throw new APIError('Unauthorized: Cannot view another user\'s today mood', 'FORBIDDEN');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('mood_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No mood logged today
            }
            throw new APIError('Failed to fetch today mood', error.code, error);
        }

        return data;
    },
};
