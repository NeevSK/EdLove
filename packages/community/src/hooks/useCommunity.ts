import { identityAPI } from '@repo/core/api';
import {
  useCreatePostMutation,
  useGroupsInfiniteQuery,
  usePostsInfiniteQuery,
} from '@repo/core/api/hooks';
import { useStore, useTemporalStore } from '@repo/core/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { communityAPI } from '../api/community';

export const COMMUNITY_KEYS = {
  all: ['community'] as const,
  groups: () => [...COMMUNITY_KEYS.all, 'groups'] as const,
  posts: (groupId?: string, date?: string, scale?: string) =>
    [...COMMUNITY_KEYS.all, 'posts', groupId || 'all', date || 'now', scale || 'day'] as const,
};

export const useCommunity = (
  groupId?: string,
  options: { searchQuery?: string; isPublicOnly?: boolean } = {},
) => {
  const queryClient = useQueryClient();
  const user = useStore((state) => state.user);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);

  const groupsInfiniteQuery = useGroupsInfiniteQuery({
    schoolId: user?.school_id,
    searchQuery: options.searchQuery,
    isPublicOnly: options.isPublicOnly,
  });

  const postsInfiniteQuery = usePostsInfiniteQuery(groupId || 'all');
  const createPostMutation = useCreatePostMutation();

  const createGroupMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const loggedInId = await identityAPI.getMyInternalId();
      if (!loggedInId) throw new Error('Not authenticated');
      return communityAPI.createGroupWithOwner(input, loggedInId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.groups() });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async ({
      groupId: targetGroupId,
      userId,
      joinPolicy,
    }: {
      groupId: string;
      userId: string;
      joinPolicy?: string;
    }) => communityAPI.joinGroup(targetGroupId, userId, joinPolicy || 'member'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.groups() });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) =>
      communityAPI.togglePostReaction(postId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: COMMUNITY_KEYS.posts(groupId || 'all', viewDate, viewScale),
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => communityAPI.deletePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: COMMUNITY_KEYS.posts(groupId || 'all', viewDate, viewScale),
      });
    },
  });

  const groups = useMemo(
    () => groupsInfiniteQuery.data?.pages.flatMap((page) => page) ?? [],
    [groupsInfiniteQuery.data],
  );
  const posts = useMemo(
    () => postsInfiniteQuery.data?.pages.flatMap((page) => page) ?? [],
    [postsInfiniteQuery.data],
  );

  const fetchGroups = useCallback(() => groupsInfiniteQuery.refetch(), [groupsInfiniteQuery]);
  const fetchPosts = useCallback(
    (targetGroupId?: string) =>
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_KEYS.posts(targetGroupId || groupId || 'all', viewDate, viewScale),
      }),
    [groupId, queryClient, viewDate, viewScale],
  );

  return useMemo(
    () => ({
      groups,
      isLoadingGroups: groupsInfiniteQuery.isLoading,
      isFetchingNextGroups: groupsInfiniteQuery.isFetchingNextPage,
      hasNextGroups: groupsInfiniteQuery.hasNextPage,
      fetchNextGroups: groupsInfiniteQuery.fetchNextPage,
      posts,
      isLoadingPosts: postsInfiniteQuery.isLoading,
      isFetchingNextPosts: postsInfiniteQuery.isFetchingNextPage,
      hasNextPosts: postsInfiniteQuery.hasNextPage,
      fetchNextPosts: postsInfiniteQuery.fetchNextPage,
      fetchGroups,
      fetchPosts,
      createPost: createPostMutation.mutateAsync,
      isCreatingPost: createPostMutation.isPending,
      createGroup: createGroupMutation.mutateAsync,
      isCreatingGroup: createGroupMutation.isPending,
      joinGroup: joinGroupMutation.mutateAsync,
      isJoiningGroup: joinGroupMutation.isPending,
      toggleReaction: toggleReactionMutation.mutateAsync,
      isTogglingReaction: toggleReactionMutation.isPending,
      deletePost: deletePostMutation.mutateAsync,
      isDeletingPost: deletePostMutation.isPending,
      loading: groupsInfiniteQuery.isLoading || postsInfiniteQuery.isLoading,
      error:
        groupsInfiniteQuery.error || postsInfiniteQuery.error
          ? (groupsInfiniteQuery.error || postsInfiniteQuery.error)?.message || 'An error occurred'
          : null,
    }),
    [
      createGroupMutation.isPending,
      createGroupMutation.mutateAsync,
      createPostMutation.isPending,
      createPostMutation.mutateAsync,
      deletePostMutation.isPending,
      deletePostMutation.mutateAsync,
      fetchGroups,
      fetchPosts,
      groups,
      groupsInfiniteQuery.error,
      groupsInfiniteQuery.fetchNextPage,
      groupsInfiniteQuery.hasNextPage,
      groupsInfiniteQuery.isFetchingNextPage,
      groupsInfiniteQuery.isLoading,
      joinGroupMutation.isPending,
      joinGroupMutation.mutateAsync,
      posts,
      postsInfiniteQuery.error,
      postsInfiniteQuery.fetchNextPage,
      postsInfiniteQuery.hasNextPage,
      postsInfiniteQuery.isFetchingNextPage,
      postsInfiniteQuery.isLoading,
      toggleReactionMutation.isPending,
      toggleReactionMutation.mutateAsync,
    ],
  );
};
