import { authAPI, growthSignalsAPI, identityAPI } from '@repo/core/api/client';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { GuestDataManager } from '@repo/core/native';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { createJournalEntry, fetchJournalEntries } from '@repo/self/api/selfFeatureRepository';
import type { JournalEntry } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const JOURNAL_ENTRIES_CACHE_KEY = 'gurudevi-journal-entries-cache';

export const useJournalEntries = () => {
  const isOnline = useStore((state) => state.isOnline);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { viewDate, phase } = useTemporalStore();

  // Check anonymous status and resolve identity
  useEffect(() => {
    let active = true;
    const resolveAuth = async () => {
      try {
        const anon = await authAPI.isAnonymous();
        if (!active) return;
        setIsAnonymous(anon);

        if (!anon) {
          const internalId = await identityAPI.getMyInternalId();
          if (active && internalId) {
            setUserId(internalId);
          }
        }
      } catch (error) {
        console.warn('[useJournalEntries] Auth check error:', error);
      }
    };
    void resolveAuth();
    return () => {
      active = false;
    };
  }, []);

  // Initial load from cache (local-first)
  useEffect(() => {
    let active = true;
    const loadCache = async () => {
      try {
        if (isAnonymous) {
          const guestEntries = await GuestDataManager.getJournalEntries();
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

  // Refresh from remote / sync in background
  const refreshData = useCallback(async () => {
    if (isAnonymous) {
      const guestEntries = await GuestDataManager.getJournalEntries();
      const mappedEntries: JournalEntry[] = guestEntries.map((ge) => ({
        id: ge.localId,
        user_id: 'guest',
        content: ge.content,
        created_at: ge.timestamp,
      }));
      setEntries(mappedEntries);
      return;
    }

    if (!userId || !isOnline) return;

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
  }, [isAnonymous, isOnline, userId, viewDate]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const addJournalEntry = useCallback(
    async (content: string) => {
      if (phase === 'past') throw new Error('Cannot add entries to the past');

      if (isAnonymous) {
        // Guest mode: Save to local storage
        const guestEntry = await GuestDataManager.addJournalEntry(content);
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

      if (!isOnline) {
        return tempEntry;
      }

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

        // Fire growth signal
        growthSignalsAPI.emitSilent({
          user_id: userId,
          event_type: 'reflection_written',
          event_metadata: {},
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
    [isAnonymous, isOnline, phase, userId, viewDate],
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
