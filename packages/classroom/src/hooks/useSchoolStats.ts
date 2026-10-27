import { api } from '@repo/core/api/client';
import { useIsGuest } from '@repo/core/hooks';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { School, SchoolStats } from '@repo/core/types';
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
  const { viewDate } = useTemporalStore();
  const isDemoMode = useExperienceState((state) => state.isDemoMode);
  const isExplorerMode = useExperienceState((state) => state.isExplorerMode);
  const isGuest = useIsGuest();
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
  }, [schoolId, viewDate]);
  // Refresh from API
  const refreshData = useCallback(async () => {
    const shouldProvideSample = isDemoMode || isGuest || isExplorerMode || !schoolId;
    if (!schoolId && !shouldProvideSample) {
      setIsLoading(false);
      return;
    }
    try {
      const targetSchoolId = schoolId || 'sample-school-1';
      const [schoolData, statsData] = await Promise.all([
        api.school.getSchool(targetSchoolId),
        api.school.getSchoolStats(targetSchoolId, viewDate),
      ]);
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
  }, [schoolId, isDemoMode, isExplorerMode, viewDate, isGuest]);
  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return {
    school,
    stats,
    isLoading,
    error,
    refreshData,
  };
}
