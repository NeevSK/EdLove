import { useTemporalStore } from '@repo/core/logic';
import { GuestStorage } from '@repo/core/native';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useAuthStore } from '@repo/core/store';
import { createJournalEntry, fetchJournalEntries } from '@repo/self/data/selfFeature.data';
import type { JournalEntry } from '@repo/core/types/Wellbeing';
import { useCallback, useEffect, useState } from 'react';

const JOURNAL_ENTRIES_CACHE_KEY = 'gurudevi-journal-entries-cache';

export const useJournalEntries = () => {
  const authUser = useAuthStore((state) => state.user);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isAnonymous = !authUser || authUser.is_anonymous;
  const userId = authUser?.id ?? null;
  const viewDate = useTemporalStore((s) => s.viewDate);
  const phase = useTemporalStore((s) => s.phase);

  // Initial load from cache (local-first)
  useEffect(() => {
    let active = true;
    const loadCache = async () => {
      try {
        if (isAnonymous) {
          const guestEntries = await GuestStorage.getJournalEntries();
          const mappedEntries: JournalEntry[] = guestEntries.map((ge) => ({
            id: ge.localId,
            user_id: 'guest',
            content: ge.content,
            created_at: ge.timestamp,
          }));
          if (active) setEntries(mappedEntries);
        } else if (userId) {
          const cached = await SafeZustandStorage.getItem(
            `${JOURNAL_ENTRIES_CACHE_KEY}-${userId}-${viewDate}`,
          );
          if (active && cached) {
            setEntries(JSON.parse(cached));
          }
        }
      } catch (error) {
        console.warn('[useJournalEntries] Failed to load cache:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCache();
    return () => {
      active = false;
    };
  }, [isAnonymous, userId, viewDate]);

  // Refresh from local guest storage or the account-scoped device cache.
  const refreshData = useCallback(async () => {
    if (isAnonymous) {
      const guestEntries = await GuestStorage.getJournalEntries();
      const mappedEntries: JournalEntry[] = guestEntries.map((ge) => ({
        id: ge.localId,
        user_id: 'guest',
        content: ge.content,
        created_at: ge.timestamp,
      }));
      setEntries(mappedEntries);
      return;
    }

    if (!userId) return;

    try {
      const data = await fetchJournalEntries(userId, { viewDate });
      if (data) {
        setEntries(data);
        await SafeZustandStorage.setItem(
          `${JOURNAL_ENTRIES_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (error) {
      console.warn('[useJournalEntries] Failed to refresh entries from server:', error);
    }
  }, [isAnonymous, userId, viewDate]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const addJournalEntry = useCallback(
    async (content: string) => {
      if (phase === 'past') throw new Error('Cannot add entries to the past');

      if (isAnonymous) {
        // Guest mode: Save to local storage
        const guestEntry = await GuestStorage.addJournalEntry(content);
        const newEntry: JournalEntry = {
          id: guestEntry.localId,
          user_id: 'guest',
          content,
          created_at: guestEntry.timestamp,
        };
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      }

      if (!userId) throw new Error('Not authenticated');

      // Optimistic local entry for instant feedback
      const tempEntry: JournalEntry = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
      };

      setEntries((prev) => {
        const next = [tempEntry, ...prev];
        void SafeZustandStorage.setItem(
          `${JOURNAL_ENTRIES_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(next),
        );
        return next;
      });

      try {
        const data = await createJournalEntry(userId, content);
        setEntries((prev) => {
          const next = prev.map((e) => (e.id === tempEntry.id ? data : e));
          void SafeZustandStorage.setItem(
            `${JOURNAL_ENTRIES_CACHE_KEY}-${userId}-${viewDate}`,
            JSON.stringify(next),
          );
          return next;
        });

        return data;
      } catch (error) {
        console.warn(
          '[useJournalEntries] Offline or failed to sync new journal entry with server:',
          error,
        );
        return tempEntry;
      }
    },
    [isAnonymous, phase, userId, viewDate],
  );

  return {
    entries,
    loading,
    isLoading: loading,
    isAnonymous,
    refreshData,
    addJournalEntry,
    setEntries,
  };
};
