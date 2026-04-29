import { getTemporalRange, SafeZustandStorage } from '@repo/core';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { supabase } from '@repo/core/native';

import { useCallback, useEffect, useState } from 'react';
import type { DecisionLog } from '../types';

const DECISION_journal_CACHE_KEY = 'gurudevi-decision-journal-cache';

/**
 * useDecisionJournal Hook
 *
 * Manages principal's decision logs with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useDecisionJournal(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, isPastView } = useTemporalStore();
  const [decisions, setDecisions] = useState<DecisionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from cache
  useEffect(() => {
    if (!userId) return;

    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${DECISION_journal_CACHE_KEY}-${userId}-${viewDate}`,
        );
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
  }, [userId, viewDate]);

  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;

    try {
      let query = supabase.from('decision_journals').select('*').eq('user_id', userId);

      if (isPastView) {
        const range = getTemporalRange(viewDate, 'day');
        query = query.gte('created_at', range.start).lte('created_at', range.end);
      } else {
        query = query.order('created_at', { ascending: false }).limit(20);
      }

      const { data, error } = await query;

      if (error) {
        // If table doesn't exist, ignore (local-only mode for now)
        if (error.code !== '42P01') {
          // 42P01 is undefined_table
          console.warn('Failed to fetch decisions', error);
        }
        return;
      }

      if (data) {
        setDecisions(data);
        // Persist to cache
        await SafeZustandStorage.setItem(
          `${DECISION_journal_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh decision history', e);
    }
  }, [userId, isOnline, viewDate, isPastView]);

  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData, isOnline]);

  return {
    decisions,
    isLoading,
    refreshData,
    setDecisions,
  };
}
