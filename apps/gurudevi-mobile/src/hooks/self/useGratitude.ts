import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { supabase } from '../../lib/supabase';
import { GratitudeEntry } from '../../types/Wellbeing';

const GRATITUDE_CACHE_KEY = 'gurudevi-gratitude-cache';

/**
 * useGratitude Hook
 * 
 * Manages gratitude entries with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useGratitude(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [entries, setEntries] = useState<GratitudeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${GRATITUDE_CACHE_KEY}-${userId}`);
                if (cached) {
                    setEntries(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load gratitude cache', e);
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
                .from('gratitude_entries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                setEntries(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${GRATITUDE_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh gratitude history', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        entries,
        isLoading,
        refreshData,
        setEntries
    };
}
