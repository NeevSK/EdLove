import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import type {
  LearningReflection,
  ReframeOutcome,
} from '@repo/classroom/api/learningReflectionRepository';
import {
  completeLearningReflectionFollowUp,
  createLearningReflection,
  fetchLearningReflectionsForView,
} from '@repo/classroom/api/learningReflectionRepository';
import { authAPI } from '@repo/core/api/client';
import { useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useCallback, useEffect, useState } from 'react';

const LEARNING_REFLECTION_CACHE_KEY = 'gurudevi-learning-reflection-cache';

/**
 * useLearningReflections Hook
 *
 * Local-first management for classroom learning reflections.
 * Mirrors useThoughtRecords but scoped to the classroom domain.
 */
export const useLearningReflections = (userId?: string, classroomId?: string) => {
  const { isOnline } = useOfflineStatus();
  const { viewDate, phase } = useTemporalStore();
  const [records, setRecords] = useState<LearningReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const anon = await authAPI.isAnonymous();
      setIsAnonymous(anon);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        if (!isAnonymous && userId) {
          const cacheKey = classroomId
            ? `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${classroomId}-${viewDate}`
            : `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${viewDate}`;
          const cached = await SafeZustandStorage.getItem(cacheKey);
          if (cached) {
            setRecords(JSON.parse(cached));
          }
        }
      } catch (error) {
        console.warn('Failed to load initial learning reflections', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, [isAnonymous, userId, classroomId, viewDate]);

  const refreshData = useCallback(async () => {
    if (isAnonymous || !userId || !isOnline) return;
    try {
      const data = await fetchLearningReflectionsForView(userId, { phase });
      setRecords(data);
      const cacheKey = classroomId
        ? `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${classroomId}-${viewDate}`
        : `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${viewDate}`;
      await SafeZustandStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to refresh learning reflections', error);
    }
  }, [isAnonymous, isOnline, phase, userId, classroomId, viewDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addLearningReflection = useCallback(
    async (record: LearningReflection) => {
      if (isAnonymous) {
        throw new Error('Learning reflection requires a signed-in account');
      }
      if (!userId) throw new Error('Missing user id for learning reflection');
      const data = await createLearningReflection(userId, record);
      setRecords((prev) => [data, ...prev].slice(0, 30));
      const cacheKey = classroomId
        ? `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${classroomId}-${viewDate}`
        : `${LEARNING_REFLECTION_CACHE_KEY}-${userId}-${viewDate}`;
      await SafeZustandStorage.setItem(cacheKey, JSON.stringify([data, ...records].slice(0, 30)));
      return data;
    },
    [isAnonymous, records, userId, classroomId, viewDate],
  );

  const completeFollowUp = useCallback(
    async (recordId: string, input: { outcome: ReframeOutcome; reflection?: string }) => {
      if (!userId) throw new Error('Missing user id for learning reflection');
      await completeLearningReflectionFollowUp(recordId, input);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? {
                ...r,
                postOutcome: input.outcome,
                followUp: {
                  ...(r.followUp ?? { dueAt: new Date().toISOString() }),
                  completedAt: new Date().toISOString(),
                  outcome: input.outcome,
                  reflection: input.reflection,
                },
              }
            : r,
        ),
      );
    },
    [userId],
  );

  return {
    records,
    isLoading,
    loading: isLoading,
    isAnonymous,
    refreshData,
    addLearningReflection,
    completeFollowUp,
    setRecords,
  };
};
