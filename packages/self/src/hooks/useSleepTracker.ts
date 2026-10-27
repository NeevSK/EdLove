import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';

import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { createSleepLog, fetchSleepLogs } from '@repo/self/api/selfFeatureRepository';
import type { SleepLog } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const SLEEP_CACHE_KEY = 'gurudevi-sleep-cache';
/**
 * useSleepTracker Hook
 *
 * Manages sleep logs with "Local-First" resilience.
 * - Loads recent sleep history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useSleepTracker(userId?: string) {
  const { isOnline } = useOfflineStatus();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initial load from cache
  useEffect(() => {
    if (!userId) return;
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(`${SLEEP_CACHE_KEY}-${userId}`);
        if (cached) {
          setSleepLogs(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load sleep cache', e);
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
      const data = await fetchSleepLogs(userId);
      if (data) {
        setSleepLogs(data);
        // Persist to cache
        await SafeZustandStorage.setItem(`${SLEEP_CACHE_KEY}-${userId}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to refresh sleep logs', e);
      setError('Sleep history is temporarily unavailable.');
    }
  }, [userId, isOnline]);
  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return {
    sleepLogs,
    isLoading,
    error,
    refreshData,
    setSleepLogs,
    addSleepLog: async (quality: SleepLog['quality']) => {
      if (!userId) return null;
      return createSleepLog(userId, quality);
    },
  };
}
