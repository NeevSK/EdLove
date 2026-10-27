import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import {
  createStudentGoal,
  fetchStudentGoalsForView,
  updateStudentGoal,
} from '@repo/self/api/selfFeatureRepository';
import type { Goal } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const GOALS_CACHE_KEY = 'gurudevi-student-goals-cache';
export function useStudentGoals(userId?: string) {
  const { isOnline } = useOfflineStatus();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { viewDate, isPastView } = useTemporalStore();
  useEffect(() => {
    if (!userId) return;
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(`${GOALS_CACHE_KEY}-${userId}-${viewDate}`);
        if (cached) {
          setGoals(JSON.parse(cached));
        }
      } catch (error) {
        console.warn('Failed to load goals cache', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [userId, viewDate]);
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    try {
      const data = await fetchStudentGoalsForView(userId, {
        viewDate,
        isPastView,
      });
      setGoals(data);
      setLoadError(null);
      await SafeZustandStorage.setItem(
        `${GOALS_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(data),
      );
    } catch (error) {
      console.error('Failed to refresh goals', error);
      setLoadError(error instanceof Error ? error : new Error('Unable to load goals'));
    }
  }, [isOnline, isPastView, userId, viewDate]);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  const addGoal = useCallback(
    async (text: string) => {
      if (!userId) throw new Error('Missing user id for student goals');
      const goal = await createStudentGoal(userId, text);
      const nextGoals = [goal, ...goals];
      setGoals(nextGoals);
      await SafeZustandStorage.setItem(
        `${GOALS_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(nextGoals),
      );
      return goal;
    },
    [goals, userId, viewDate],
  );
  const updateGoal = useCallback(
    async (goalId: string, updates: Partial<Pick<Goal, 'text' | 'progress' | 'is_completed'>>) => {
      await updateStudentGoal(goalId, updates);
      const nextGoals = goals.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal));
      setGoals(nextGoals);
      if (userId) {
        await SafeZustandStorage.setItem(
          `${GOALS_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(nextGoals),
        );
      }
    },
    [goals, userId, viewDate],
  );
  return {
    goals,
    isLoading,
    loadError,
    refreshData,
    addGoal,
    updateGoal,
    setGoals,
  };
}
