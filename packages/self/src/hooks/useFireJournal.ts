import { SafeZustandStorage } from '@repo/core';
import { useStore, useTemporalStore } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';
import { burnFireJournalEntry, fetchFireJournalHistoryForView } from '../api/wellbeingRepository';
import type { FireJournalEntry } from '../types';

const JOURNAL_CACHE_KEY = 'gurudevi-journal-cache';

/**
 * useFireJournal Hook
 *
 * Manages journal entries with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useFireJournal(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const isPastView = useTemporalStore((state) => state.isPastView);
  const [journalHistory, setJournalHistory] = useState<FireJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from cache
  useEffect(() => {
    if (!userId) return;

    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
        );
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
  }, [userId, viewDate]);

  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;

    try {
      const data = await fetchFireJournalHistoryForView(userId, { viewDate, isPastView });
      if (data) {
        setJournalHistory(data);
        // Persist to cache
        await SafeZustandStorage.setItem(
          `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh journal history', e);
    }
  }, [userId, isOnline, viewDate, isPastView]);

  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const burnEntry = useCallback(
    async (content: string) => {
      if (!userId) throw new Error('Missing user id for fire journal');

      const entry = await burnFireJournalEntry(userId, content);
      const nextHistory = [entry, ...journalHistory].slice(0, 10);
      setJournalHistory(nextHistory);
      await SafeZustandStorage.setItem(
        `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(nextHistory),
      );

      return entry;
    },
    [journalHistory, userId, viewDate],
  );

  return {
    journalHistory,
    isLoading,
    refreshData,
    burnEntry,
    setJournalHistory,
  };
}
