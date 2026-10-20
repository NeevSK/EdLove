import { useStore, useTemporalStore } from '@repo/core/logic';
import { isGuestUserId } from '@repo/core/native';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import {
  burnFireJournalEntry,
  fetchFireJournalHistoryForView,
} from '@repo/self/api/wellbeingRepository';
import type { FireJournalEntry } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const JOURNAL_CACHE_KEY = 'gurudevi-journal-cache';

/**
 * useFireJournal Hook
 *
 * Manages journal entries with "Local-First" resilience.
 * - Loads recent history instantly from cache or GuestDataManager.
 * - Supports guest safe-try private persistence.
 * - Syncs with Supabase in background for authenticated citizens.
 */
export function useFireJournal(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const isPastView = useTemporalStore((state) => state.isPastView);
  const [journalHistory, setJournalHistory] = useState<FireJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || 'guest';
  const isGuest = isGuestUserId(effectiveUserId);

  // Initial load from cache or local GuestDataManager
  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        if (isGuest) {
          const data = await fetchFireJournalHistoryForView(effectiveUserId, {
            viewDate,
            isPastView,
          });
          if (active && data) {
            setJournalHistory(data);
          }
        } else if (userId) {
          const cached = await SafeZustandStorage.getItem(
            `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
          );
          if (active && cached) {
            setJournalHistory(JSON.parse(cached));
          }
        }
      } catch (e) {
        console.warn('Failed to load journal cache', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadInitial();
    return () => {
      active = false;
    };
  }, [effectiveUserId, isGuest, userId, viewDate, isPastView]);

  // Refresh from API or GuestDataManager
  const refreshData = useCallback(async () => {
    if (isGuest) {
      try {
        const data = await fetchFireJournalHistoryForView(effectiveUserId, {
          viewDate,
          isPastView,
        });
        if (data) setJournalHistory(data);
      } catch (e) {
        console.warn('Failed to refresh guest journal history', e);
      }
      return;
    }
    if (!userId || !isOnline) return;
    setError(null);
    try {
      const data = await fetchFireJournalHistoryForView(userId, {
        viewDate,
        isPastView,
      });
      if (data) {
        setJournalHistory(data);
        await SafeZustandStorage.setItem(
          `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh journal history', e);
      setError('Journal history is temporarily unavailable.');
    }
  }, [effectiveUserId, isGuest, userId, isOnline, viewDate, isPastView]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const burnEntry = useCallback(
    async (content: string) => {
      const entry = await burnFireJournalEntry(effectiveUserId, content);
      const nextHistory = [entry, ...journalHistory].slice(0, 10);
      setJournalHistory(nextHistory);
      if (!isGuest && userId) {
        await SafeZustandStorage.setItem(
          `${JOURNAL_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(nextHistory),
        );
      }
      return entry;
    },
    [effectiveUserId, isGuest, journalHistory, userId, viewDate],
  );

  return {
    journalHistory,
    isLoading,
    error,
    refreshData,
    burnEntry,
    setJournalHistory,
    isGuest,
  };
}
