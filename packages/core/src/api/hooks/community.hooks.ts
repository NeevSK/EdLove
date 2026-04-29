import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { identityAPI } from '../../native/identity';
import { useStore, useTemporalStore } from '../../store';
import { APIError } from '../../types/API';
import type { Post } from '../../types/Community';
import { communityAPI } from '../community';
import { growthSignalsAPI } from '../growthSignals';

/**
 * Community Query Key Factory
 */
export const communityKeys = {
  all: ['community'] as const,
  announcements: (schoolId: string) => [...communityKeys.all, 'announcements', schoolId] as const,
  groups: (filters: Record<string, any>) => [...communityKeys.all, 'groups', filters] as const,
  groupDetail: (groupId: string) => [...communityKeys.all, 'group', groupId] as const,
  posts: (groupId: string, filters: Record<string, any>) =>
    [...communityKeys.all, 'posts', groupId, filters] as const,
  comments: (postId: string) => [...communityKeys.all, 'comments', postId] as const,
  members: (groupId: string, status: 'active' | 'pending') =>
    [...communityKeys.all, 'members', groupId, status] as const,
};

/**
 * useGroupsInfiniteQuery - Search and filter community groups with pagination.
 */
export function useGroupsInfiniteQuery(options: {
  searchQuery?: string;
  isPublicOnly?: boolean;
  schoolId?: string;
}) {
  return useInfiniteQuery({
    queryKey: communityKeys.groups({ ...options }),
    queryFn: async ({ pageParam = 0 }) => {
      return communityAPI.getGroups({
        limit: 10,
        offset: pageParam,
        search: options.searchQuery,
        is_public: options.isPublicOnly,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage || []).length === 10 ? allPages.length * 10 : undefined;
    },
  });
}

/**
 * usePostsInfiniteQuery - Fetch posts for a specific group with filtering and pagination.
 */
export function usePostsInfiniteQuery(groupId: string = 'all', options: Record<string, any> = {}) {
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);

  return useInfiniteQuery({
    queryKey: communityKeys.posts(groupId, { ...options, viewDate, viewScale }),
    queryFn: async ({ pageParam = 0 }) => {
      return communityAPI.getPosts({
        limit: 10,
        offset: pageParam,
        groupId: groupId === 'all' ? undefined : groupId,
        viewDate,
        viewScale,
        ...options,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage || []).length === 10 ? allPages.length * 10 : undefined;
    },
  });
}

/**
 * useCreatePostMutation - Optimistic post creation.
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  const storeUser = useStore((state) => state.user);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);

  return useMutation({
    mutationFn: async (input: any) => {
      const loggedInId = await identityAPI.getMyInternalId();
      if (!loggedInId) throw new APIError('Not authenticated', 'UNAUTHORIZED' as any);

      const schoolId = storeUser?.school_id;
      if (!schoolId) {
        throw new APIError(
          'No school context  please complete your profile before posting.',
          'BAD_REQUEST' as any,
        );
      }
      const authority = storeUser?.authority || 'student';
      return communityAPI.createPost(input, loggedInId, authority as any, schoolId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.posts(variables.group_id || 'all', {}),
      });
      if (storeUser?.id) {
        growthSignalsAPI.emitSilent({
          user_id: storeUser.id,
          event_type: 'community_post_created',
        });
      }
    },
  });
}

/**
 * useToggleReactionMutation - Optimistic reaction toggling.
 */
export function useToggleReactionMutation(groupId: string = 'all') {
  const queryClient = useQueryClient();
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);

  return useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      return communityAPI.togglePostReaction(postId, userId);
    },
    onMutate: async ({ postId }) => {
      const key = communityKeys.posts(groupId, { viewDate, viewScale });
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);

      const update = (post: Post) => {
        if (post.id !== postId) return post;
        const wasLiked = post.has_liked ?? false;
        const delta = wasLiked ? -1 : 1;
        const prev = post.reactions?.['❤️'] ?? 0;
        return {
          ...post,
          has_liked: !wasLiked,
          reactions: { ...post.reactions, '❤️': Math.max(0, prev + delta) },
          reaction_count: Math.max(0, (post.reaction_count ?? 0) + delta),
        };
      };

      queryClient.setQueryData(key, (pages: any) => {
        if (!pages) return pages;
        return {
          ...pages,
          pages: pages.pages.map((p: Post[]) => p.map(update)),
        };
      });

      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.posts(groupId, { viewDate, viewScale }),
      });
    },
  });
}

/**
 * Existing Hooks (Refactored)
 */

export function useAnnouncementsQuery(schoolId: string) {
  return useQuery({
    queryKey: communityKeys.announcements(schoolId),
    queryFn: () => communityAPI.getAnnouncements(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePollVoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { postId: string; optionId: string; allowMultiple?: boolean }) =>
      communityAPI.voteInPoll(params.postId, params.optionId, params.allowMultiple),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
}

export function useReportMutation() {
  return useMutation({
    mutationFn: (params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      report_target: 'teacher' | 'principal' | 'platform';
      reporterId: string;
    }) =>
      communityAPI.reportContent(
        {
          postId: params.postId,
          groupId: params.groupId,
          targetUserId: params.targetUserId,
          reason: params.reason,
          report_target: params.report_target,
        },
        params.reporterId,
      ),
  });
}

/**
 * usePostLogic - Shared logic for post interactions.
 */
export function usePostLogic(post: Post, userId?: string) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleReaction = useToggleReactionMutation(post.group_id || 'all');

  const handleLike = useCallback(
    (onSuccess?: () => void) => {
      if (!userId) return;
      toggleReaction.mutate({ postId: post.id, userId }, { onSuccess });
    },
    [post.id, userId, toggleReaction],
  );

  return {
    state: {
      isMenuOpen,
      isLiked: post.has_liked,
      likeCount: post.reaction_count,
      hasResonated: false,
      isResonating: false,
    },
    handleLike,
    handleResonate: () => {},
    toggleMenu: () => setIsMenuOpen(true),
    closeMenu: () => setIsMenuOpen(false),
  };
}

/**
 * usePollLogic - Logic for community poll interaction.
 */
export function usePollLogic(postId: string, userId?: string, allowMultiple?: boolean) {
  const voteMutation = usePollVoteMutation();
  const [userVotes, setUserVotes] = useState<string[]>([]); // This should eventually come from a query

  const handleVote = useCallback(
    async (optionId: string) => {
      if (!userId) return;
      await voteMutation.mutateAsync({ postId, optionId, allowMultiple });
    },
    [postId, userId, allowMultiple, voteMutation],
  );

  return {
    counts: {}, // Mock/Placeholder for now
    userVotes,
    totalVotes: 0,
    isLoading: false,
    isVoting: voteMutation.isPending,
    handleVote,
    refreshVotes: () => {},
  };
}
