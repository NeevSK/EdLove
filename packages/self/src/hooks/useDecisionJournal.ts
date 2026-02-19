import { SafeZustandStorage, supabase, useStore } from '@repo/core';
import { useState, useCallback, useEffect } from 'react';
import { DecisionLog } from '../types';

const DECISION_journal_CACHE_KEY = 'gurudevi-decision-journal-cache';

/**
 * useDecisionJournal Hook
 * 
 * Manages principal's decision logs with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useDecisionJournal(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [decisions, setDecisions] = useState<DecisionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${DECISION_journal_CACHE_KEY}-${userId}`);
                if (cached) {
                    setDecisions(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load decision journal cache', e);
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
                .from('decision_journals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                // If table doesn't exist, ignore (local-only mode for now)
                if (error.code !== '42P01') { // 42P01 is undefined_table
                    console.warn('Failed to fetch decisions', error);
                }
                return;
            }

            if (data) {
                setDecisions(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${DECISION_journal_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh decision history', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        decisions,
        isLoading,
        refreshData,
        setDecisions
    };
}
