import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { supabase } from '../supabase';
import { communityAPI } from '../community';

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
  React.useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const createMutation = useMutation({
    mutationFn: ({ content, isAnonymous = false }: { content: string; isAnonymous?: boolean }) =>
      communityAPI.createComment(postId!, content, isAnonymous),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.deleteComment(commentId),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.toggleCommentUpvote(commentId),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  const markOfficialMutation = useMutation({
    mutationFn: ({ commentId, isOfficial }: { commentId: string; isOfficial: boolean }) =>
      communityAPI.markOfficialAnswer(commentId, isOfficial),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });

  return {
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
  };
}
