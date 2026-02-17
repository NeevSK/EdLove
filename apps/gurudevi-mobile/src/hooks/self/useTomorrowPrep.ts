import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { supabase } from '../../lib/supabase';
import { DailyPrepItem } from '../../types/Wellbeing';

const PREP_CACHE_KEY = 'gurudevi-prep-cache';

/**
 * useTomorrowPrep Hook
 * 
 * Manages daily prep items with "Local-First" resilience.
 * - Loads items instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useTomorrowPrep(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [prepItems, setPrepItems] = useState<DailyPrepItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${PREP_CACHE_KEY}-${userId}`);
                if (cached) {
                    setPrepItems(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load prep cache', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCache();
    }, [userId]);

    // Refresh from API
    const refreshData = useCallback(async () => {
        if (!userId || !isOnline) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        try {
            const { data, error } = await supabase
                .from('daily_prep_items')
                .select('*')
                .eq('user_id', userId)
                // We might want more than just tomorrow's items eventually, but for now focus on next day
                .gte('prep_date', new Date().toISOString().split('T')[0])
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                setPrepItems(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${PREP_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh prep items', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        prepItems,
        isLoading,
        refreshData,
        setPrepItems
    };
}
