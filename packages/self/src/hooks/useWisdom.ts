import { useStore, useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';

import { useCallback, useEffect, useState } from 'react';
import { createWisdomNote, fetchWisdomNotes } from '../api/selfFeatureRepository';
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
    void loadCache();
  }, [userId, viewDate]);
  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    try {
      const data = await fetchWisdomNotes(userId, { viewDate, isPastView });
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
    void refreshData();
  }, [refreshData]);
  return {
    notes,
    isLoading,
    refreshData,
    setNotes,
    addWisdomNote: async (insight: string) => {
      if (!userId) throw new Error('Missing user id');
      const newNote = await createWisdomNote(userId, insight);
      const nextNotes = [newNote, ...notes];
      setNotes(nextNotes);
      await SafeZustandStorage.setItem(
        `${WISDOM_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(nextNotes),
      );
      return newNote;
    },
  };
}
