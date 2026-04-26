/**
 * useComments  Real-time comment system for community posts.
 *
 * Provides: fetching, creating, deleting, upvoting, and live subscription.
 * Safe to mount with postId=null (does nothing).
 */

import { supabase, usePermissions } from '@repo/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { communityAPI } from '../api/community';
import type { Comment } from '../types/Community';

export const COMMENT_KEYS = {
  list: (postId: string) => ['community', 'comments', postId] as const,
};

export function useComments(postId: string | null) {
  const queryClient = useQueryClient();
  const { context } = usePermissions();
  // (Note: ability was unused here, but context might be needed for ID)

  //  Fetch
  const query = useQuery({
    queryKey: postId ? COMMENT_KEYS.list(postId) : ['community', 'comments', '__none__'],
    queryFn: () => communityAPI.getComments(postId!, 60),
    enabled: !!postId,
    staleTime: 30_000,
  });

  //  Real-time subscription
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
          // Invalidate  do not manually merge to avoid auth/upvote state mismatch
          queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(postId) });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  //  Create
  const createMutation = useMutation({
    mutationFn: ({ content, isAnonymous = false }: { content: string; isAnonymous?: boolean }) =>
      communityAPI.createComment(postId!, content, isAnonymous),

    onMutate: async ({ content, isAnonymous = false }) => {
      if (!postId) return;
      await queryClient.cancelQueries({ queryKey: COMMENT_KEYS.list(postId) });
      const previous = queryClient.getQueryData<Comment[]>(COMMENT_KEYS.list(postId));

      const optimistic: Comment = {
        id: `opt-${Date.now()}`,
        post_id: postId,
        content,
        is_anonymous: isAnonymous,
        is_official_answer: false,
        upvotes: 0,
        has_upvoted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_id: 'me',
        author_name: isAnonymous ? 'Anonymous' : 'Me',
        author_avatar: null,
        author_authority: 'student', // Optimized: default for comments is student, but should ideally come from identity
      };

      queryClient.setQueryData<Comment[]>(COMMENT_KEYS.list(postId), (prev) => [
        ...(prev ?? []),
        optimistic,
      ]);

      return { previous };
    },

    onError: (_err, _vars, context: any) => {
      if (postId && context?.previous !== undefined) {
        queryClient.setQueryData(COMMENT_KEYS.list(postId), context.previous);
      }
    },

    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(postId) });
    },
  });

  //  Delete
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.deleteComment(commentId),

    onMutate: async (commentId) => {
      if (!postId) return;
      await queryClient.cancelQueries({ queryKey: COMMENT_KEYS.list(postId) });
      const previous = queryClient.getQueryData<Comment[]>(COMMENT_KEYS.list(postId));
      queryClient.setQueryData<Comment[]>(COMMENT_KEYS.list(postId), (prev) =>
        (prev ?? []).filter((c) => c.id !== commentId),
      );
      return { previous };
    },

    onError: (_err, _vars, context: any) => {
      if (postId && context?.previous !== undefined) {
        queryClient.setQueryData(COMMENT_KEYS.list(postId), context.previous);
      }
    },

    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(postId) });
    },
  });

  //  Upvote toggle
  const upvoteMutation = useMutation({
    mutationFn: (commentId: string) => communityAPI.toggleCommentUpvote(commentId),

    onMutate: async (commentId) => {
      if (!postId) return;
      await queryClient.cancelQueries({ queryKey: COMMENT_KEYS.list(postId) });
      const previous = queryClient.getQueryData<Comment[]>(COMMENT_KEYS.list(postId));

      queryClient.setQueryData<Comment[]>(COMMENT_KEYS.list(postId), (prev) =>
        (prev ?? []).map((c) =>
          c.id !== commentId
            ? c
            : {
                ...c,
                has_upvoted: !c.has_upvoted,
                upvotes: Math.max(0, c.upvotes + (c.has_upvoted ? -1 : 1)),
              },
        ),
      );

      return { previous };
    },

    onError: (_err, _vars, context: any) => {
      if (postId && context?.previous !== undefined) {
        queryClient.setQueryData(COMMENT_KEYS.list(postId), context.previous);
      }
    },

    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(postId) });
    },
  });

  //  Mark official answer
  const markOfficialMutation = useMutation({
    mutationFn: ({ commentId, isOfficial }: { commentId: string; isOfficial: boolean }) =>
      communityAPI.markOfficialAnswer(commentId, isOfficial),
    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(postId) });
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    createComment: createMutation.mutateAsync,
    isCreatingComment: createMutation.isPending,

    deleteComment: deleteMutation.mutateAsync,
    isDeletingComment: deleteMutation.isPending,

    toggleUpvote: upvoteMutation.mutateAsync,
    isUpvoting: upvoteMutation.isPending,

    markOfficialAnswer: markOfficialMutation.mutateAsync,
  };
}
