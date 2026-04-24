import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { rewardsAPI } from '../api/rewards';
import { identityAPI } from '../native/identity';
import { useTemporalStore } from '../store/useTemporalStore';

/**
 * Hook for managing user rewards, points, and milestones.
 * Provides real-time updates and mutations for adding points.
 */
export function useRewards(
  options: { userId?: string; includeHistory?: boolean; historyLimit?: number } = {},
) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);
  const phase = useTemporalStore((state) => state.phase);

  useEffect(() => {
    const getUserId = async () => {
      const internalId = options.userId || (await identityAPI.getMyInternalId());
      if (internalId) setUserId(internalId);
    };
    getUserId();
  }, [options.userId]);

  // Fetch rewards data
  const {
    data: rewards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rewards', userId, phase, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return null;
      const data =
        phase === 'past'
          ? await rewardsAPI.getRewardsAsOf(userId, viewDate)
          : await rewardsAPI.getRewards(userId);

      if (!data && !options.userId && phase === 'present') {
        return await rewardsAPI.initializeRewards(userId);
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['rewards_history', userId, viewDate, viewScale, options.historyLimit],
    queryFn: async () => {
      if (!userId) return [];
      if (phase === 'past') {
        return rewardsAPI.getRewardsRangeHistory(userId, viewDate, viewScale);
      }
      return rewardsAPI.getRewardsHistory(userId, options.historyLimit ?? 50);
    },
    enabled: !!userId && !!options.includeHistory,
  });

  // Mutation to add points
  const addPointsMutation = useMutation({
    mutationFn: ({ points }: { points: number }) => {
      if (!userId) throw new Error('User not authenticated');
      if (phase === 'past') throw new Error('Rewards are read-only in past view');
      return rewardsAPI.addPoints(userId, points);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
    },
  });

  // Mutation to award badge
  const awardBadgeMutation = useMutation({
    mutationFn: ({ badge }: { badge: string }) => {
      if (!userId) throw new Error('User not authenticated');
      if (phase === 'past') throw new Error('Rewards are read-only in past view');
      return rewardsAPI.awardBadge(userId, badge);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
    },
  });

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: () => {
      if (phase === 'past') {
        return Promise.resolve({ updatedRewards: null, newAchievements: [] });
      }
      return userId
        ? rewardsAPI.checkAndAwardAchievements(userId)
        : Promise.resolve({ updatedRewards: null, newAchievements: [] });
    },
    onSuccess: (data) => {
      if (data.updatedRewards) {
        queryClient.setQueryData(['rewards', userId], data.updatedRewards);
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
      }
    },
  });

  const trackAction = async (
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
  };

  return {
    rewards: rewards || { points: 0, badges: [] },
    history,
    isLoading,
    error,
    addPoints: (points: number) => addPointsMutation.mutateAsync({ points }),
    awardBadge: (badge: string) => awardBadgeMutation.mutateAsync({ badge }),
    checkAchievements: () => checkAchievementsMutation.mutateAsync(),
    trackAction,
    isUpdating:
      addPointsMutation.isPending ||
      awardBadgeMutation.isPending ||
      checkAchievementsMutation.isPending,
    newAchievements: checkAchievementsMutation.data?.newAchievements || [],
  };
}
