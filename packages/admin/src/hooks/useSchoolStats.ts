import type { School, SchoolStats } from '@repo/core';
import {
  api,
  MOCK_SCHOOL_STATS,
  SafeZustandStorage,
  useFeatureAccess,
  useStore,
  useTemporalStore,
} from '@repo/core';
import { useCallback, useEffect, useState } from 'react';

const SCHOOL_STATS_CACHE_KEY = 'gurudevi-school-stats-cache';
const SCHOOL_INFO_CACHE_KEY = 'gurudevi-school-info-cache';

export function useSchoolStats(schoolId: string) {
  const _isOnline = useStore((state) => state.isOnline);
  const viewDate = useTemporalStore(s => s.viewDate);
  const isDemoMode = useStore((state) => state.isDemoMode);
  const { isGuest } = useFeatureAccess();
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (caughtError) {
        console.warn('Failed to load school stats cache', caughtError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCache();
  }, [schoolId, viewDate]);

  const refreshData = useCallback(async () => {
    if (!schoolId && !isDemoMode && !isGuest) {
      setIsLoading(false);
      return;
    }

    try {
      let schoolData: School;
      let statsData: SchoolStats;

      if (isDemoMode || isGuest || !schoolId) {
        schoolData = {
          id: 'sample-school',
          name: 'Wisdom Academy',
          type: 'primary',
          handle: 'wisdom-academy',
          official_type: 'Primary',
          status: 'active',
          created_at: new Date().toISOString(),
        } as School;
        statsData = { ...MOCK_SCHOOL_STATS, is_sample: true } as SchoolStats;
      } else {
        const [sData, stData] = await Promise.all([
          api.school.getSchool(schoolId),
          api.school.getSchoolStats(schoolId, viewDate),
        ]);
        schoolData = sData;
        statsData = stData;
      }

      setSchool(schoolData);
      setStats(statsData);

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
    } catch (caughtError: any) {
      console.error('Failed to refresh school stats', caughtError);
      setError(caughtError.message || 'Failed to sync school data');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, isDemoMode, isGuest, viewDate]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  return {
    school,
    stats,
    isLoading,
    error,
    refreshData,
  };
}
