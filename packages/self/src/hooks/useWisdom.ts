import {
  getTemporalRange,
  SafeZustandStorage,
  supabase,
  useStore,
  useTemporalStore,
} from '@repo/core';
import { useCallback, useEffect, useState } from 'react';
import type { WisdomNote } from '../types';

const WISDOM_CACHE_KEY = 'gurudevi-wisdom-cache';

/**
 * useWisdom Hook
 *
 * Manages wisdom notes with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useWisdom(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, isPastView } = useTemporalStore();
  const [notes, setNotes] = useState<WisdomNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from cache
  useEffect(() => {
    if (!userId) return;

    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${WISDOM_CACHE_KEY}-${userId}-${viewDate}`,
        );
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
  }, [userId, viewDate]);

  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;

    try {
      let query = supabase.from('wisdom_notes').select('*').eq('user_id', userId);

      if (isPastView) {
        const range = getTemporalRange(viewDate, 'day');
        query = query.gte('created_at', range.start).lte('created_at', range.end);
      } else {
        query = query.order('created_at', { ascending: false }).limit(30);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setNotes(data);
        // Persist to cache
        await SafeZustandStorage.setItem(
          `${WISDOM_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh wisdom history', e);
    }
  }, [userId, isOnline, viewDate, isPastView]);

  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData, isOnline]);

  return {
    notes,
    isLoading,
    refreshData,
    setNotes,
  };
}
