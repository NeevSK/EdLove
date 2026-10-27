import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';

import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { createGratitudeEntry, fetchGratitudeEntries } from '@repo/self/api/selfFeatureRepository';
import type { GratitudeEntry } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const GRATITUDE_CACHE_KEY = 'gurudevi-gratitude-cache';
/**
 * useGratitude Hook
 *
 * Manages gratitude entries with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useGratitude(userId?: string) {
  const { isOnline } = useOfflineStatus();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initial load from cache
  useEffect(() => {
    if (!userId) return;
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(`${GRATITUDE_CACHE_KEY}-${userId}`);
        if (cached) {
          setEntries(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load gratitude cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [userId]);
  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    setError(null);
    try {
      const data = await fetchGratitudeEntries(userId);
      if (data) {
        setEntries(data);
        // Persist to cache
        await SafeZustandStorage.setItem(`${GRATITUDE_CACHE_KEY}-${userId}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to refresh gratitude history', e);
      setError('Gratitude history is temporarily unavailable.');
    }
  }, [userId, isOnline]);
  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return {
    entries,
    isLoading,
    error,
    refreshData,
    setEntries,
    addGratitudeEntry: async (input: Pick<GratitudeEntry, 'content' | 'category'>) => {
      if (!userId) return null;
      return createGratitudeEntry(userId, input);
    },
  };
}
