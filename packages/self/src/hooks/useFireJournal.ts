import { SafeZustandStorage, supabase, useStore, useTemporalStore } from '@repo/core';
import { useState, useCallback, useEffect } from 'react';
import { FireJournalEntry } from '../types';

const JOURNAL_CACHE_KEY = 'gurudevi-journal-cache';

/**
 * useFireJournal Hook
 * 
 * Manages journal entries with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useFireJournal(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const viewDate = useTemporalStore(state => state.viewDate);
    const isPastView = useTemporalStore(state => state.isPastView);
    const [journalHistory, setJournalHistory] = useState<FireJournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${JOURNAL_CACHE_KEY}-${userId}`);
                if (cached) {
                    setJournalHistory(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load journal cache', e);
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
            let query = supabase
                .from('fire_journal')
                .select('*')
                .eq('user_id', userId);

            if (isPastView) {
                const startOfDay = `${viewDate}T00:00:00.000Z`;
                const endOfDay = `${viewDate}T23:59:59.999Z`;
                query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
            } else {
                query = query.order('created_at', { ascending: false }).limit(10);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setJournalHistory(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${JOURNAL_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh journal history', e);
        }
    }, [userId, isOnline, viewDate, isPastView]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        journalHistory,
        isLoading,
        refreshData,
        setJournalHistory
    };
}
