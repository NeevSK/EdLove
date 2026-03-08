import { storage, StorageKeys, requireAuth, useStore, growthSignalsAPI } from '@repo/core';
import { CommunityPost, CommunityGroup, Group, Post } from '../types';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { communityAPI } from '../api/community';

// Keys for React Query
export const COMMUNITY_KEYS = {
    all: ['community'] as const,
    groups: () => [...COMMUNITY_KEYS.all, 'groups'] as const,
    posts: (groupId?: string) => [...COMMUNITY_KEYS.all, 'posts', groupId || 'all'] as const,
};

export const useCommunity = (groupId?: string) => {
    const queryClient = useQueryClient();
    const storeUser = useStore(state => state.user);

    // Fetch Groups with Infinite Scroll
    const groupsInfiniteQuery = useInfiniteQuery({
        queryKey: COMMUNITY_KEYS.groups(),
        queryFn: async ({ pageParam = 0 }) => {
            return communityAPI.getGroups({ limit: 10, offset: pageParam });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        }
    });

    // Fetch Posts with Infinite Scroll
    const postsInfiniteQuery = useInfiniteQuery({
        queryKey: COMMUNITY_KEYS.posts(groupId || 'all'),
        queryFn: async ({ pageParam = 0 }) => {
            return communityAPI.getPosts({
                limit: 10,
                offset: pageParam,
                groupId: groupId
            });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        }
    });

    // Create Post Mutation
    const createPostMutation = useMutation({
        mutationFn: async (input: any) => {
            const user = await requireAuth();
            const schoolId = storeUser?.school_id ?? user.school_id;
            if (!schoolId) {
                throw new Error('No school context — please complete your profile before posting.');
            }
            return communityAPI.createPost(input, user.id, storeUser?.role ?? 'teacher', schoolId);
        },
        onMutate: async (newPost) => {
            // Optimistic Update
            await queryClient.cancelQueries({ queryKey: COMMUNITY_KEYS.posts(newPost.group_id) });

            const previousPosts = queryClient.getQueryData<Post[]>(COMMUNITY_KEYS.posts(newPost.group_id));

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(COMMUNITY_KEYS.posts(newPost.group_id), [
                    {
                        ...newPost,
                        id: 'temp-id',
                        created_at: new Date().toISOString(),
                        reactions: {},
                        author_name: 'Me',
                        author_role: storeUser?.role ?? 'teacher',
                        post_type: newPost.post_type || 'discussion',
                        visibility: 'school',
                        media_url: newPost.media_url,
                        media_type: newPost.media_type,
                        is_anonymous: false,
                        comment_count: 0,
                        view_count: 0,
                        school_id: storeUser?.school_id ?? '',
                        tags: [],
                        updated_at: new Date().toISOString()
                    } as Post,
                    ...previousPosts,
                ]);
            }

            return { previousPosts };
        },
        onError: (err, newPost, context: any) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(COMMUNITY_KEYS.posts(newPost.group_id), context.previousPosts);
            }
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.posts(variables.group_id) });
        },
        onSuccess: (_data, _variables) => {
            // Growth signal — post created, fire-and-forget
            if (storeUser?.id) {
                growthSignalsAPI.emitSignal(storeUser.id, 'community_post_created')
                    .catch((err) => console.warn('[useCommunity] growth signal failed:', err));
            }
        },
    });

    // Create Group Mutation — always uses createGroupWithOwner so creator gets owner rights
    const createGroupMutation = useMutation({
        mutationFn: async (input: any) => {
            const user = await requireAuth();
            return communityAPI.createGroupWithOwner(input, user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.groups() });
        }
    });

    // Join Group Mutation
    const joinGroupMutation = useMutation({
        mutationFn: async ({ groupId, userId, joinPolicy }: { groupId: string, userId: string, joinPolicy?: string }) => {
            return communityAPI.joinGroup(groupId, userId, joinPolicy);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.groups() });
            // Also invalidate specific group if we have query for it
        }
    });

    return {
        groups: groupsInfiniteQuery.data?.pages.flat() || [],
        isLoadingGroups: groupsInfiniteQuery.isLoading,
        isFetchingNextGroups: groupsInfiniteQuery.isFetchingNextPage,
        hasNextGroups: groupsInfiniteQuery.hasNextPage,
        fetchNextGroups: groupsInfiniteQuery.fetchNextPage,

        posts: postsInfiniteQuery.data?.pages.flat() || [],
        isLoadingPosts: postsInfiniteQuery.isLoading,
        isFetchingNextPosts: postsInfiniteQuery.isFetchingNextPage,
        hasNextPosts: postsInfiniteQuery.hasNextPage,
        fetchNextPosts: postsInfiniteQuery.fetchNextPage,

        getPosts: (groupId?: string) => {
            // Wrapper to access data if needed
            return { data: [], isLoading: false };
        },

        fetchGroups: () => groupsInfiniteQuery.refetch(),
        fetchPosts: (groupId?: string) => queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.posts(groupId || 'all') }),

        createPost: createPostMutation.mutateAsync,
        isCreatingPost: createPostMutation.isPending,

        createGroup: createGroupMutation.mutateAsync,
        isCreatingGroup: createGroupMutation.isPending,

        joinGroup: joinGroupMutation.mutateAsync,
        isJoiningGroup: joinGroupMutation.isPending,

        loading: groupsInfiniteQuery.isLoading || postsInfiniteQuery.isLoading,
        error: (groupsInfiniteQuery.error || postsInfiniteQuery.error)
            ? ((groupsInfiniteQuery.error || postsInfiniteQuery.error) as any)?.message || 'An error occurred'
            : null,
    };
};
