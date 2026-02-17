import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { supabase } from '../../lib/supabase';
import { WisdomNote } from '../../types/Wellbeing';

const WISDOM_CACHE_KEY = 'gurudevi-wisdom-cache';

/**
 * useWisdom Hook
 * 
 * Manages wisdom notes with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useWisdom(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [notes, setNotes] = useState<WisdomNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${WISDOM_CACHE_KEY}-${userId}`);
                if (cached) {
                    setNotes(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load wisdom cache', e);
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
                .from('wisdom_notes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) throw error;

            if (data) {
                setNotes(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${WISDOM_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh wisdom history', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        notes,
        isLoading,
        refreshData,
        setNotes
    };
}
