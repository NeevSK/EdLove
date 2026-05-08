import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { communityAPI } from '../community';

export const pollKeys = {
  all: ['community', 'polls'] as const,
  detail: (postId: string) => [...pollKeys.all, postId] as const,
};

/**
 * Modern logic for Community Polls using TanStack Query v5.
 * Promoted to @repo/core/api/hooks/poll.hooks.ts.
 */
export function usePollHooks(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useStore();

  const query = useQuery({
    queryKey: pollKeys.detail(postId),
    queryFn: async () => {
      const data = await communityAPI.getPollStatus(postId);
      return {
        ...data,
        userVotes: new Set(data.userVotes),
      };
    },
    enabled: !!postId,
  });

  const voteMutation = useMutation({
    mutationFn: ({ optionId, allowMultiple }: { optionId: string; allowMultiple: boolean }) =>
      communityAPI.voteInPoll(postId, optionId, allowMultiple),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) });
    },
  });

  return useMemo(
    () => ({
      ...query.data,
      isLoading: query.isLoading,
      isVoting: voteMutation.isPending,
      handleVote: (optionId: string, allowMultiple = false) =>
        voteMutation.mutate({ optionId, allowMultiple }),
      refreshVotes: () => {
        void queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) });
      },
    }),
    [query.data, query.isLoading, voteMutation.isPending, voteMutation.mutate, queryClient, postId],
  );
}
