import { identityAPI } from '@repo/core/api/identity';
import { rewardsAPI } from '@repo/core/api/rewards';
import type { UserRewards } from '@repo/core/api/rewards.orpc.contract';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

const REWARDS_CACHE_PREFIX = 'gurudevi-rewards-cache';

/**
 * Hook for managing user rewards, points, and milestones.
 * Provides real-time updates and mutations for adding points.
 */
export function useRewards(
  options: { userId?: string; includeHistory?: boolean; historyLimit?: number } = {},
) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAnonymous = !user || user.is_anonymous;
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);
  const phase = useTemporalStore((state) => state.phase);

  useEffect(() => {
    let active = true;
    const getUserId = async () => {
      try {
        if (isAnonymous && !options.userId) {
          if (active) setUserId(null);
          return;
        }
        const identity = await identityAPI.identifyActiveCitizen();
        const internalId = options.userId || identity?.id;
        if (active && internalId) setUserId(internalId);
      } catch (e) {
        console.warn('[useRewards] Failed to resolve identity:', e);
      }
    };
    void getUserId();
    return () => {
      active = false;
    };
  }, [isAnonymous, options.userId]);

  // Fetch rewards data
  const {
    data: rewards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rewards', userId, phase, viewDate, viewScale],
    queryFn: async () => {
      if (!userId || isAnonymous) return null;
      const cacheKey = `${REWARDS_CACHE_PREFIX}-${userId}-${phase}-${viewDate}`;
      try {
        const data =
          phase === 'past'
            ? await rewardsAPI.getRewardsAsOf(userId, viewDate)
            : await rewardsAPI.getRewards(userId);

        if (!data && !options.userId && phase === 'present') {
          const initData = await rewardsAPI.initializeRewards(userId);
          if (initData) {
            void SafeZustandStorage.setItem(cacheKey, JSON.stringify(initData));
          }
          return initData;
        }

        if (data) {
          void SafeZustandStorage.setItem(cacheKey, JSON.stringify(data));
        }
        return data;
      } catch (e) {
        console.warn('[useRewards] Offline or unreachable, loading from cache:', e);
        try {
          const cached = await SafeZustandStorage.getItem(cacheKey);
          if (cached) return JSON.parse(cached);
        } catch {
          // Ignore
        }
        return null;
      }
    },
    enabled: !!userId && !isAnonymous,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['rewards_history', userId, viewDate, viewScale, options.historyLimit],
    queryFn: async () => {
      if (!userId || isAnonymous) return [];
      try {
        if (phase === 'past') {
          return await rewardsAPI.getRewardsRangeHistory(userId, viewDate, viewScale);
        }
        return await rewardsAPI.getRewardsHistory(userId, options.historyLimit ?? 50);
      } catch (e) {
        console.warn('[useRewards] Failed to fetch rewards history:', e);
        return [];
      }
    },
    enabled: !!userId && !isAnonymous && !!options.includeHistory,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });


  // Mutation to add points
  const addPointsMutation = useMutation({
    mutationFn: ({ points }: { points: number }) => {
      if (!userId) throw new Error('User not authenticated');
      if (phase === 'past') throw new Error('Rewards are read-only in past view');
      return rewardsAPI.addPoints(userId, points);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
    },
  });

  // Mutation to award badge
  const awardBadgeMutation = useMutation({
    mutationFn: ({ badge }: { badge: string }) => {
      if (!userId) throw new Error('User not authenticated');
      if (phase === 'past') throw new Error('Rewards are read-only in past view');
      return rewardsAPI.awardBadge(userId, badge);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
    },
  });

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: async (): Promise<{
      updatedRewards: UserRewards | null;
      newAchievements: string[];
    }> => {
      if (phase === 'past') {
        return { updatedRewards: null, newAchievements: [] };
      }
      return userId
        ? rewardsAPI.checkAndAwardAchievements(userId)
        : { updatedRewards: null, newAchievements: [] };
    },
    onSuccess: async (data) => {
      if (data.updatedRewards) {
        queryClient.setQueryData(['rewards', userId], data.updatedRewards);
        await queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
      }
    },
  });

  const addPoints = useCallback(
    (points: number) => addPointsMutation.mutateAsync({ points }),
    [addPointsMutation],
  );

  const awardBadge = useCallback(
    (badge: string) => awardBadgeMutation.mutateAsync({ badge }),
    [awardBadgeMutation],
  );

  const checkAchievements = useCallback(
    () => checkAchievementsMutation.mutateAsync(),
    [checkAchievementsMutation],
  );

  const trackAction = useCallback(
    async (
      actionType:
        | 'mood_log'
        | 'journal_entry'
        | 'library_upload'
        | 'community_post'
        | 'comment'
        | 'exploration',
    ) => {
      const pointsMap = {
        mood_log: 10,
        journal_entry: 20,
        library_upload: 50,
        community_post: 15,
        comment: 5,
        exploration: 0,
      };

      const points = pointsMap[actionType];
      if (points > 0) {
        await addPointsMutation.mutateAsync({ points });
      }

      // After every action, check for achievements
      return checkAchievementsMutation.mutateAsync();
    },
    [addPointsMutation, checkAchievementsMutation],
  );

  return useMemo(
    () => ({
      rewards: rewards || { points: 0, badges: [] },
      history,
      isLoading,
      error,
      addPoints,
      awardBadge,
      checkAchievements,
      trackAction,
      isUpdating:
        addPointsMutation.isPending ||
        awardBadgeMutation.isPending ||
        checkAchievementsMutation.isPending,
      newAchievements: checkAchievementsMutation.data?.newAchievements || [],
    }),
    [
      rewards,
      history,
      isLoading,
      error,
      addPoints,
      awardBadge,
      checkAchievements,
      trackAction,
      addPointsMutation.isPending,
      awardBadgeMutation.isPending,
      checkAchievementsMutation.isPending,
      checkAchievementsMutation.data?.newAchievements,
    ],
  );
}
