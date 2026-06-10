import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useStore, useTemporalStore } from '../../store';
import { useAuthStore } from '../../store/useAuthStore';
import { APIError } from '../../types/API';
import type { Post } from '../../types/Community';
import { announcementAPI } from '../announcements';
import { circleAPI } from '../circles';
import { communityAPI } from '../community';
import { growthSignalsAPI } from '../growthSignals';
import { identityAPI } from '../identity';
import { socialAPI } from '../social';

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
      return circleAPI.getGroups({
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
  const { user: storeUser } = useStore();
  const _activeBond = useAuthStore((state) => state.activeBond);

  return useMutation({
    mutationFn: async (input: any) => {
      const identity = await identityAPI.identifyActiveCitizen();
      if (!identity) throw new APIError('Not authenticated', 'UNAUTHORIZED' as any);
      if (!identity.activeBond) throw new APIError('No active bond found', 'FORBIDDEN' as any);

      return communityAPI.createPost({
        ...input,
        author_tier: identity.activeBond.capacity, // Using resolved capacity
      });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
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
    onSettled: async () => {
      await queryClient.invalidateQueries({
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
    queryFn: () => announcementAPI.getAnnouncements(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePollVoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { postId: string; optionId: string }) =>
      communityAPI.voteInPoll(params.postId, params.optionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communityKeys.all });
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
      socialAPI.reportContent(
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

  return useMemo(
    () => ({
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
    }),
    [isMenuOpen, post.has_liked, post.reaction_count, handleLike],
  );
}

/**
 * usePollLogic - Logic for community poll interaction.
 */
export function usePollLogic(postId: string, userId?: string) {
  const voteMutation = usePollVoteMutation();
  const [userVotes, _setUserVotes] = useState<string[]>([]); // This should eventually come from a query

  const handleVote = useCallback(
    async (optionId: string) => {
      if (!userId) return;
      await voteMutation.mutateAsync({ postId, optionId });
    },
    [postId, userId, voteMutation],
  );

  return useMemo(
    () => ({
      counts: {}, // Mock/Placeholder for now
      userVotes,
      totalVotes: 0,
      isLoading: false,
      isVoting: voteMutation.isPending,
      handleVote,
      refreshVotes: () => {},
    }),
    [userVotes, voteMutation.isPending, handleVote],
  );
}
