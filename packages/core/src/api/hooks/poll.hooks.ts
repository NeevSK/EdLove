import { communityAPI } from '@repo/core/api/community';
import { orpc } from '@repo/core/api/orpcClient';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const pollKeys = {
  all: ['community', 'polls'] as const,
  detail: (postId: string) => [...pollKeys.all, postId] as const,
};

/**
 * Modern logic for Community Polls using TanStack Query v5 & oRPC v2.
 * Promoted to @repo/core/api/hooks/poll.hooks.ts.
 */
export function usePollHooks(postId: string) {
  const queryClient = useQueryClient();
  const _user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    ...orpc.community.getPollStatus.queryOptions({
      input: { params: { postId } },
    }),
    select: (res: any): Record<string, any> => ({
      ...(res || {}),
      userVotes: new Set(res?.userVotes || []),
    }),
    enabled: Boolean(postId),
  });

  const voteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string; allowMultiple?: boolean }) =>
      communityAPI.voteInPoll(postId, optionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orpc.community.getPollStatus.queryKey({ input: { params: { postId } } }),
        }),
        queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) }),
      ]);
    },
  });

  return useMemo(
    () => ({
      ...(data || {}),
      isLoading,
      isVoting: voteMutation.isPending,
      handleVote: (optionId: string, _allowMultiple = false) => voteMutation.mutate({ optionId }),
      refreshVotes: () => {
        void queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) });
      },
    }),
    [data, isLoading, voteMutation, queryClient, postId],
  );
}
