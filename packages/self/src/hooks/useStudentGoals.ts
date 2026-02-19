import { SafeZustandStorage, supabase, useStore } from '@repo/core';
import { useState, useCallback, useEffect } from 'react';
import { Goal } from '../types';

const GOALS_CACHE_KEY = 'gurudevi-student-goals-cache';

/**
 * useStudentGoals Hook
 * 
 * Manages student goals with "Local-First" resilience.
 * - Loads recent goals instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useStudentGoals(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${GOALS_CACHE_KEY}-${userId}`);
                if (cached) {
                    setGoals(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load goals cache', e);
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
                .from('student_goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setGoals(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${GOALS_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh goals', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        goals,
        isLoading,
        refreshData,
        setGoals
    };
}
