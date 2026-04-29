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
import { useCallback, useEffect, useReducer, useState } from 'react';

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

type EcosystemStatsState = {
  stats: FounderEcosystemStats | null;
  schools: School[];
  isLoading: boolean;
  error: string | null;
};

type EcosystemStatsAction =
  | { type: 'LOAD_CACHE'; stats: FounderEcosystemStats | null; schools: School[] }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; stats: FounderEcosystemStats; schools: School[] }
  | { type: 'SET_MOCK_STATS'; stats: FounderEcosystemStats }
  | { type: 'REFRESH_FAILURE'; error: string }
  | { type: 'SET_LOADING'; isLoading: boolean };

const ecosystemStatsReducer = (
  state: EcosystemStatsState,
  action: EcosystemStatsAction,
): EcosystemStatsState => {
  switch (action.type) {
    case 'LOAD_CACHE':
      return { ...state, stats: action.stats, schools: action.schools, isLoading: false };
    case 'REFRESH_START':
      return { ...state, isLoading: true, error: null };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        stats: action.stats,
        schools: action.schools,
        isLoading: false,
        error: null,
      };
    case 'SET_MOCK_STATS':
      return { ...state, stats: action.stats, schools: [], isLoading: false, error: null };
    case 'REFRESH_FAILURE':
      return { ...state, isLoading: false, error: action.error };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
};

export function useFounderEcosystemStats() {
  const isDemoMode = useStore((state) => state.isDemoMode);
  const [state, dispatch] = useReducer(ecosystemStatsReducer, {
    stats: null,
    schools: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedStats, cachedSchools] = await Promise.all([
          SafeZustandStorage.getItem(ECOSYSTEM_STATS_CACHE_KEY),
          SafeZustandStorage.getItem(ECOSYSTEM_SCHOOLS_CACHE_KEY),
        ]);

        dispatch({
          type: 'LOAD_CACHE',
          stats: cachedStats ? JSON.parse(cachedStats) : null,
          schools: cachedSchools ? JSON.parse(cachedSchools) : [],
        });
      } catch (caughtError) {
        console.warn('Failed to load founder ecosystem cache', caughtError);
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    };

    void loadCache();
  }, []);

  const refreshData = useCallback(async () => {
    dispatch({ type: 'REFRESH_START' });
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
        dispatch({ type: 'SET_MOCK_STATS', stats: mockStats });
        return;
      }

      const [statsData, schoolsData] = await Promise.all([
        api.founder.getEcosystemStats(),
        api.founder.getAllSchools(),
      ]);

      dispatch({ type: 'REFRESH_SUCCESS', stats: statsData, schools: schoolsData });

      await Promise.all([
        SafeZustandStorage.setItem(ECOSYSTEM_STATS_CACHE_KEY, JSON.stringify(statsData)),
        SafeZustandStorage.setItem(ECOSYSTEM_SCHOOLS_CACHE_KEY, JSON.stringify(schoolsData)),
      ]);
    } catch (caughtError: unknown) {
      console.error('Failed to refresh founder ecosystem data', caughtError);
      dispatch({
        type: 'REFRESH_FAILURE',
        error: caughtError instanceof Error ? caughtError.message : 'Failed to sync platform data',
      });
    }
  }, [isDemoMode]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  return {
    ...state,
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

type SchoolStatsState = {
  stats: SchoolStats | null;
  school: School | null;
  isLoading: boolean;
  error: string | null;
};

type SchoolStatsAction =
  | { type: 'LOAD_CACHE'; stats: SchoolStats | null; school: School | null }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; stats: SchoolStats; school: School }
  | { type: 'REFRESH_FAILURE'; error: string }
  | { type: 'SET_LOADING'; isLoading: boolean };

const schoolStatsReducer = (
  state: SchoolStatsState,
  action: SchoolStatsAction,
): SchoolStatsState => {
  switch (action.type) {
    case 'LOAD_CACHE':
      return { ...state, stats: action.stats, school: action.school, isLoading: false };
    case 'REFRESH_START':
      return { ...state, isLoading: true, error: null };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        stats: action.stats,
        school: action.school,
        isLoading: false,
        error: null,
      };
    case 'REFRESH_FAILURE':
      return { ...state, isLoading: false, error: action.error };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
};

export function useFounderSchoolStats(schoolId: string) {
  const viewDate = useTemporalStore((s) => s.viewDate);
  const isDemoMode = useStore((state) => state.isDemoMode);
  const { isGuest } = useFeatureAccess();
  const [state, dispatch] = useReducer(schoolStatsReducer, {
    stats: null,
    school: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!schoolId) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return;
    }

    const loadCache = async () => {
      try {
        const [cachedStats, cachedSchool] = await Promise.all([
          SafeZustandStorage.getItem(`${SCHOOL_STATS_CACHE_KEY}-${schoolId}-${viewDate}`),
          SafeZustandStorage.getItem(`${SCHOOL_INFO_CACHE_KEY}-${schoolId}`),
        ]);

        dispatch({
          type: 'LOAD_CACHE',
          stats: cachedStats ? JSON.parse(cachedStats) : null,
          school: cachedSchool ? JSON.parse(cachedSchool) : null,
        });
      } catch (caughtError) {
        console.warn('Failed to load founder school stats cache', caughtError);
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    };

    void loadCache();
  }, [schoolId, viewDate]);

  const refreshData = useCallback(async () => {
    if (!schoolId && !isDemoMode && !isGuest) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return;
    }

    dispatch({ type: 'REFRESH_START' });
    try {
      let schoolData: School;
      let statsData: SchoolStats;

      if (isDemoMode || isGuest || !schoolId) {
        schoolData = {
          id: 'sample-school',
          name: 'Wisdom Academy',
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

      dispatch({ type: 'REFRESH_SUCCESS', stats: statsData, school: schoolData });

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
    } catch (caughtError: unknown) {
      console.error('Failed to refresh founder school stats', caughtError);
      dispatch({
        type: 'REFRESH_FAILURE',
        error: caughtError instanceof Error ? caughtError.message : 'Failed to sync school data',
      });
    }
  }, [isDemoMode, isGuest, schoolId, viewDate]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  return {
    ...state,
    refreshData,
  };
}

export const founderWorkspaceAPI = {
  useEcosystemStats: useFounderEcosystemStats,
  useSchoolStats: useFounderSchoolStats,
  createSchool: createFounderSchool,
  createClassroom: createFounderClassroom,
};
