import { MOCK_SCHOOL_STATS, SafeZustandStorage, type School, type SchoolStats } from '@repo/core';
import { api } from '@repo/core/api';
import { useFeatureAccess } from '@repo/core/hooks';
import { useStore, useTemporalStore } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';

const SCHOOL_STATS_CACHE_KEY = 'gurudevi-school-stats-cache';
const SCHOOL_INFO_CACHE_KEY = 'gurudevi-school-info-cache';

/**
 * useSchoolStats Hook
 *
 * Manages school statistics and details with "Local-First" resilience.
 * - Loads recent stats instantly from cache.
 * - Syncs with Supabase in background.
 * - Shared across Admin, Principal, and Founder views.
 */
export function useSchoolStats(schoolId: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate } = useTemporalStore();
  const isDemoMode = useStore((state) => state.isDemoMode);
  const { isGuest } = useFeatureAccess();
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load from cache
  useEffect(() => {
    if (!schoolId) return;

    const loadCache = async () => {
      try {
        const [cachedStats, cachedSchool] = await Promise.all([
          SafeZustandStorage.getItem(`${SCHOOL_STATS_CACHE_KEY}-${schoolId}-${viewDate}`),
          SafeZustandStorage.getItem(`${SCHOOL_INFO_CACHE_KEY}-${schoolId}`),
        ]);

        if (cachedStats) setStats(JSON.parse(cachedStats));
        if (cachedSchool) setSchool(JSON.parse(cachedSchool));
      } catch (e) {
        console.warn('Failed to load school stats cache', e);
      } finally {
        // If we have cached data, stop loading immediately for instant UI
        // Background fetch will update if online
        setIsLoading(false);
      }
    };
    loadCache();
  }, [schoolId]);

  // Refresh from API
  const refreshData = useCallback(async () => {
    // If no schoolId and not in demo mode (or explicitly guest), we still want to show SOMETHING
    // Let's assume if schoolId is missing, we check if we should show mock data
    if (!schoolId && !isDemoMode && !isGuest) {
      setIsLoading(false);
      return;
    }

    try {
      let schoolData: School;
      let statsData: SchoolStats;

      if (isDemoMode || isGuest || !schoolId) {
        // Return mock data for demo/guest flow
        schoolData = {
          id: 'sample-school',
          name: 'Wisdom Academy',
          school_type: 'Primary',
          status: 'active',
          created_at: new Date().toISOString(),
        } as any;
        statsData = { ...MOCK_SCHOOL_STATS, is_sample: true } as any;
      } else {
        [schoolData, statsData] = await Promise.all([
          api.school.getSchool(schoolId),
          api.school.getSchoolStats(schoolId, viewDate),
        ]);
      }

      setSchool(schoolData);
      setStats(statsData);

      // Persist to cache if we have a real schoolId
      if (schoolId) {
        await Promise.all([
          SafeZustandStorage.setItem(
            `${SCHOOL_INFO_CACHE_KEY}-${schoolId}`,
            JSON.stringify(schoolData),
          ),
          SafeZustandStorage.setItem(
            `${SCHOOL_STATS_CACHE_KEY}-${schoolId}-${viewDate}`,
            JSON.stringify(statsData),
          ),
        ]);
      }

      setError(null);
    } catch (e: any) {
      console.error('Failed to refresh school stats', e);
      setError(e.message || 'Failed to sync school data');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, isOnline, isDemoMode, viewDate]);

  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData, isOnline]);

  return {
    school,
    stats,
    isLoading,
    error,
    refreshData,
  };
}
