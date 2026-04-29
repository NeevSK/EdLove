import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../native/supabase';
import { useStore } from '../../store/useStore';
import { communityAPI } from '../community';
import { communityKeys } from './community.hooks';

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
      // Fetch vote counts
      const { data: countData, error: countError } = await supabase
        .from('community_poll_votes')
        .select('option_id')
        .eq('post_id', postId);

      if (countError) throw countError;

      const counts: Record<string, number> = {};
      let total = 0;
      (countData ?? []).forEach((v) => {
        counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
        total++;
      });

      // Fetch current user votes if logged in
      let userVotes: string[] = [];
      if (user?.id) {
        const { data: myVotesData, error: myVotesError } = await supabase
          .from('community_poll_votes')
          .select('option_id')
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (myVotesError) throw myVotesError;
        userVotes = (myVotesData ?? []).map((v) => v.option_id);
      }

      return {
        counts,
        totalVotes: total,
        userVotes: new Set(userVotes),
      };
    },
    enabled: !!postId,
  });

  const voteMutation = useMutation({
    mutationFn: ({ optionId, allowMultiple }: { optionId: string; allowMultiple: boolean }) =>
      communityAPI.voteInPoll(postId, optionId, allowMultiple),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) });
    },
  });

  return {
    ...query.data,
    isLoading: query.isLoading,
    isVoting: voteMutation.isPending,
    handleVote: (optionId: string, allowMultiple = false) =>
      voteMutation.mutate({ optionId, allowMultiple }),
    refreshVotes: () => queryClient.invalidateQueries({ queryKey: pollKeys.detail(postId) }),
  };
}
