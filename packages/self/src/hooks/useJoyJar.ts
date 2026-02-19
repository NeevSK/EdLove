import { SafeZustandStorage, supabase, useStore } from '@repo/core';
import { useState, useCallback, useEffect } from 'react';
import { JoyMoment } from '../types';

const JOY_CACHE_KEY = 'gurudevi-joy-cache';

/**
 * useJoyJar Hook
 * 
 * Manages joy moments with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useJoyJar(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [joyMoments, setJoyMoments] = useState<JoyMoment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${JOY_CACHE_KEY}-${userId}`);
                if (cached) {
                    setJoyMoments(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load joy cache', e);
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
                .from('joy_moments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                setJoyMoments(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${JOY_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh joy history', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        joyMoments,
        isLoading,
        refreshData,
        setJoyMoments
    };
}
