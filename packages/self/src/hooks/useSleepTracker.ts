import { SafeZustandStorage, supabase, useStore } from '@repo/core';
import { useState, useCallback, useEffect } from 'react';
import { SleepLog } from '../types';

const SLEEP_CACHE_KEY = 'gurudevi-sleep-cache';

/**
 * useSleepTracker Hook
 * 
 * Manages sleep logs with "Local-First" resilience.
 * - Loads recent sleep history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useSleepTracker(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${SLEEP_CACHE_KEY}-${userId}`);
                if (cached) {
                    setSleepLogs(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load sleep cache', e);
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
                .from('sleep_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(7); // Last week

            if (error) throw error;

            if (data) {
                setSleepLogs(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${SLEEP_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh sleep logs', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        sleepLogs,
        isLoading,
        refreshData,
        setSleepLogs
    };
}
