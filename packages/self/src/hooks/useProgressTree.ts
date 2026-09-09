import { useStore, useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { fetchInteractionCountForView } from '@repo/self/api/selfInsightsRepository';
import { useCallback, useEffect, useState } from 'react';

const PROGRESS_TREE_CACHE_KEY = 'gurudevi-progtree-cache';

export function useProgressTree(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, isPastView } = useTemporalStore();
  const [interactionCount, setInteractionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from local cache on mount
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${PROGRESS_TREE_CACHE_KEY}-${userId}-${viewDate}`,
        );
        if (cached !== null) {
          setInteractionCount(Number(cached));
        }
      } catch (e) {
        console.warn('Failed to load progress tree cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [userId, viewDate]);

  // Sync / Refresh function
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    setError(null);
    try {
      const count = await fetchInteractionCountForView(userId, {
        viewDate,
        isPastView,
      });
      setInteractionCount(count);
      // Persist to local cache
      await SafeZustandStorage.setItem(
        `${PROGRESS_TREE_CACHE_KEY}-${userId}-${viewDate}`,
        String(count),
      );
    } catch (e) {
      console.error('Failed to sync progress tree interactions', e);
      setError('Progress could not be refreshed.');
    }
  }, [userId, isOnline, viewDate, isPastView]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    interactionCount,
    isLoading,
    error,
    refreshData,
  };
}
