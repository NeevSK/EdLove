import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { communityAPI } from '../community';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';

export const commentKeys = {
  all: ['community', 'comments'] as const,
  list: (postId: string) => [...commentKeys.all, postId] as const,
};

/**
 * Hook for managing community comments, promoted to @repo/core.
 */
export function useCommentHooks(postId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: postId ? commentKeys.list(postId) : ['community', 'comments', '__none__'],
    queryFn: () => communityAPI.getComments(postId!, 60),
    enabled: !!postId,
    staleTime: 30_000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!postId) return;

    const channel = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) }).catch((e) => {
            console.error('Failed to invalidate comments after real-time update', e);
          });
        },
      )
      .subscribe();

    return () => {
      __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.removeChannel(channel).catch((e) => {
        console.error('Failed to remove channel during cleanup', e);
      });
    };
  }, [postId, queryClient]);

  const createMutation = useMutation({
    mutationFn: ({ content, isAnonymous = false }: { content: string; isAnonymous?: boolean }) =>
      communityAPI.createComment(postId!, content, isAnonymous),
    onSuccess: async () => {
      if (postId) await queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.deleteComment(commentId),
    onSuccess: async () => {
      if (postId) await queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.toggleCommentUpvote(commentId),
    onSuccess: async () => {
      if (postId) await queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const markOfficialMutation = useMutation({
    mutationFn: ({ commentId, isOfficial }: { commentId: string; isOfficial: boolean }) =>
      communityAPI.markOfficialAnswer(commentId, isOfficial),
    onSuccess: async () => {
      if (postId) await queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  return useMemo(
    () => ({
      comments: query.data ?? [],
      isLoading: query.isLoading,
      error: query.error,
      createComment: createMutation.mutateAsync,
      isCreatingComment: createMutation.isPending,
      deleteComment: deleteMutation.mutateAsync,
      isDeletingComment: deleteMutation.isPending,
      toggleUpvote: upvoteMutation.mutateAsync,
      isUpvoting: upvoteMutation.isPending,
      markOfficialAnswer: markOfficialMutation.mutateAsync,
    }),
    [
      query.data,
      query.isLoading,
      query.error,
      createMutation.mutateAsync,
      createMutation.isPending,
      deleteMutation.mutateAsync,
      deleteMutation.isPending,
      upvoteMutation.mutateAsync,
      upvoteMutation.isPending,
      markOfficialMutation.mutateAsync,
    ],
  );
}
