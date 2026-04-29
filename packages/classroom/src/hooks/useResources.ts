import { type ClassroomResource, SafeZustandStorage } from '@repo/core';
import { api } from '@repo/core/api';
import { useStore } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';

const RESOURCES_CACHE_KEY = 'gurudevi-resources-cache';

/**
 * useResources Hook
 *
 * Manages classroom resources with a "Local-First" feel.
 * - Loads instantly from persistent cache.
 * - Background fetches from API to stay fresh.
 */
export function useResources(classroomId: string) {
  const isOnline = useStore((state) => state.isOnline);
  const [resources, setResources] = useState<ClassroomResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from cache
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(`${RESOURCES_CACHE_KEY}-${classroomId}`);
        if (cached) {
          setResources(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load resources cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [classroomId]);

  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!isOnline) return;

    try {
      const fetched = await api.resources.getAll(classroomId);
      setResources(fetched);

      // Persist to cache
      await SafeZustandStorage.setItem(
        `${RESOURCES_CACHE_KEY}-${classroomId}`,
        JSON.stringify(fetched),
      );
    } catch (e) {
      console.error('Failed to refresh resources', e);
    }
  }, [classroomId, isOnline]);

  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    resources,
    isLoading,
    refreshData,
    setResources,
  };
}
