import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsAPI } from '../api/rewards';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

/**
 * Hook for managing user rewards, points, and milestones.
 * Provides real-time updates and mutations for adding points.
 */
export function useRewards() {
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserId();
    }, []);

    // Fetch rewards data
    const { data: rewards, isLoading, error } = useQuery({
        queryKey: ['rewards', userId],
        queryFn: async () => {
            if (!userId) return null;
            const data = await rewardsAPI.getRewards(userId);
            if (!data) {
                return await rewardsAPI.initializeRewards(userId);
            }
            return data;
        },
        enabled: !!userId,
    });

    // Mutation to add points
    const addPointsMutation = useMutation({
        mutationFn: ({ points }: { points: number }) => {
            if (!userId) throw new Error('User not authenticated');
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
            return rewardsAPI.awardBadge(userId, badge);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
        },
    });

    // Check achievements mutation
    const checkAchievementsMutation = useMutation({
        mutationFn: () => (userId ? rewardsAPI.checkAndAwardAchievements(userId) : Promise.resolve({ updatedRewards: null, newAchievements: [] })),
        onSuccess: (data) => {
            if (data.updatedRewards) {
                queryClient.setQueryData(['rewards', userId], data.updatedRewards);
                queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
            }
        }
    });

    const trackAction = async (actionType: 'mood_log' | 'journal_entry' | 'library_upload' | 'community_post' | 'comment' | 'exploration') => {
        const pointsMap = {
            mood_log: 10,
            journal_entry: 20,
            library_upload: 50,
            community_post: 15,
            comment: 5,
            exploration: 0
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
        isLoading,
        error,
        addPoints: (points: number) => addPointsMutation.mutateAsync({ points }),
        awardBadge: (badge: string) => awardBadgeMutation.mutateAsync({ badge }),
        checkAchievements: () => checkAchievementsMutation.mutateAsync(),
        trackAction,
        isUpdating: addPointsMutation.isPending || awardBadgeMutation.isPending || checkAchievementsMutation.isPending,
        newAchievements: checkAchievementsMutation.data?.newAchievements || []
    };
}
