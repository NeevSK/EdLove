import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { supabase } from '../../lib/supabase';

const MOOD_CACHE_KEY = 'gurudevi-mood-cache';

export interface MoodLog {
    id?: string;
    user_id: string;
    mood_score: number;
    created_at: string;
}

/**
 * useMood Hook
 * 
 * Manages mood tracking with "Local-First" resilience.
 * - Loads recent mood history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useMood(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${MOOD_CACHE_KEY}-${userId}`);
                if (cached) {
                    setMoodHistory(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load mood cache', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCache();
    }, [userId]);

    // Refresh from API
    const refreshData = useCallback(async () => {
        if (!userId || !isOnline) return;

        try {
            const { data, error } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10); // Keep last 10 locally for now

            if (error) throw error;

            if (data) {
                setMoodHistory(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${MOOD_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh mood history', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        moodHistory,
        isLoading,
        refreshData,
        setMoodHistory
    };
}
