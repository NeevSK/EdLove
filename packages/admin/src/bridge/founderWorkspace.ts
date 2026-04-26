import {
  api,
  MOCK_SCHOOL_STATS,
  SafeZustandStorage,
  type School,
  type SchoolStats,
  useFeatureAccess,
  useStore,
  useTemporalStore,
} from '@repo/core';
import { useCallback, useEffect, useState } from 'react';

const ECOSYSTEM_STATS_CACHE_KEY = 'gurudevi-ecosystem-stats-cache';
const ECOSYSTEM_SCHOOLS_CACHE_KEY = 'gurudevi-ecosystem-schools-cache';
const SCHOOL_STATS_CACHE_KEY = 'gurudevi-school-stats-cache';
const SCHOOL_INFO_CACHE_KEY = 'gurudevi-school-info-cache';

export interface FounderEcosystemStats {
  total_schools: number;
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_principals: number;
  total_classrooms: number;
  active_communities: number;
  ecosystem_health: number;
  active_users_7d: number;
  mood_checkins_7d: number;
  avg_mood_score_7d: number | null;
  total_library_resources: number;
  verified_resources: number;
  total_bookmarks: number;
  total_community_posts: number;
  posts_7d: number;
  attendance_records: number;
  attendance_records_7d: number;
  growth_signals_7d: number;
  total_inventory_items: number;
  total_inventory_requests: number;
  pending_inventory_requests: number;
  total_echo_feedback: number;
  pending_echo_responses: number;
  avg_student_performance: number | null;
  total_submissions: number;
  submissions_7d: number;
}

export function useFounderEcosystemStats() {
  const isOnline = useStore((state) => state.isOnline);
  const isDemoMode = useStore((state) => state.isDemoMode);
  const [stats, setStats] = useState<FounderEcosystemStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedStats, cachedSchools] = await Promise.all([
          SafeZustandStorage.getItem(ECOSYSTEM_STATS_CACHE_KEY),
          SafeZustandStorage.getItem(ECOSYSTEM_SCHOOLS_CACHE_KEY),
        ]);

        if (cachedStats) setStats(JSON.parse(cachedStats));
        if (cachedSchools) setSchools(JSON.parse(cachedSchools));
      } catch (caughtError) {
        console.warn('Failed to load founder ecosystem cache', caughtError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCache();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      if (isDemoMode) {
        const mockStats: FounderEcosystemStats = {
          total_schools: 12,
          total_users: 1450,
          total_students: 1200,
          total_teachers: 150,
          total_principals: 12,
          total_classrooms: 48,
          active_communities: 24,
          ecosystem_health: 95,
          active_users_7d: 850,
          mood_checkins_7d: 320,
          avg_mood_score_7d: 4.2,
          total_library_resources: 120,
          verified_resources: 95,
          total_bookmarks: 450,
          total_community_posts: 1200,
          posts_7d: 156,
          attendance_records: 4500,
          attendance_records_7d: 840,
          growth_signals_7d: 3200,
          total_inventory_items: 4500,
          total_inventory_requests: 120,
          pending_inventory_requests: 45,
          total_echo_feedback: 85,
          pending_echo_responses: 12,
          avg_student_performance: 78.5,
          total_submissions: 1250,
          submissions_7d: 145,
        };
        setStats(mockStats);
        setSchools([]);
        setError(null);
        return;
      }

      const [statsData, schoolsData] = await Promise.all([
        api.founder.getEcosystemStats(),
        api.founder.getAllSchools(),
      ]);

      setStats(statsData);
      setSchools(schoolsData);

      await Promise.all([
        SafeZustandStorage.setItem(ECOSYSTEM_STATS_CACHE_KEY, JSON.stringify(statsData)),
        SafeZustandStorage.setItem(ECOSYSTEM_SCHOOLS_CACHE_KEY, JSON.stringify(schoolsData)),
      ]);

      setError(null);
    } catch (caughtError: any) {
      console.error('Failed to refresh founder ecosystem data', caughtError);
      setError(caughtError.message || 'Failed to sync platform data');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    void refreshData();
  }, [isOnline, refreshData]);

  return {
    stats,
    schools,
    isLoading,
    error,
    refreshData,
  };
}

export async function createFounderSchool(input: {
  name: string;
  type: string;
  created_by: string;
}) {
  return api.founder.createSchool(input);
}

export async function createFounderClassroom(input: {
  school_id: string;
  name: string;
  grade_number: number;
  created_by: string;
}) {
  return api.founder.createClassroom(input);
}

export function useFounderSchoolStats(schoolId: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate } = useTemporalStore();
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
        console.warn('Failed to load founder school stats cache', caughtError);
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
        [schoolData, statsData] = await Promise.all([
          api.school.getSchool(schoolId),
          api.school.getSchoolStats(schoolId, viewDate),
        ]);
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
      console.error('Failed to refresh founder school stats', caughtError);
      setError(caughtError.message || 'Failed to sync school data');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, isGuest, schoolId, viewDate]);

  useEffect(() => {
    void refreshData();
  }, [isOnline, refreshData]);

  return {
    school,
    stats,
    isLoading,
    error,
    refreshData,
  };
}
