import { storage, StorageKeys, requireAuth } from '@repo/core';
import { CommunityPost, CommunityGroup } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../api/community';

export type Group = CommunityGroup;
export type Post = CommunityPost;

// Keys for React Query
export const COMMUNITY_KEYS = {
    all: ['community'] as const,
    groups: () => [...COMMUNITY_KEYS.all, 'groups'] as const,
    posts: (groupId?: string) => [...COMMUNITY_KEYS.all, 'posts', groupId || 'all'] as const,
};

export const useCommunity = () => {
    const queryClient = useQueryClient();

    // Fetch Groups
    const groupsQuery = useQuery({
        queryKey: COMMUNITY_KEYS.groups(),
        queryFn: async () => {
            const mockGroups = await communityAPI.getGroups();

            // Persist to MMKV (Internal cache)
            storage.set(StorageKeys.CACHED_GROUPS, JSON.stringify(mockGroups));

            return mockGroups;
        },
        initialData: () => {
            try {
                const cached = storage.getString(StorageKeys.CACHED_GROUPS);
                return cached ? JSON.parse(cached) : undefined;
            } catch (e) { return undefined; }
        }
    });

    // Default fetch for 'all' posts to satisfy legacy API
    const defaultPostsQuery = useQuery({
        queryKey: COMMUNITY_KEYS.posts('all'),
        queryFn: async () => {
            const mockPosts = await communityAPI.getPosts();
            return mockPosts;
        }
    });

    // Create Post Mutation
    const createPostMutation = useMutation({
        mutationFn: async (input: any) => {
            const user = await requireAuth();

            return communityAPI.createPost(input, user.id, 'teacher', 'mock-school');
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
                        author_role: 'teacher',
                        post_type: newPost.post_type || 'discussion',
                        visibility: 'school',
                        is_anonymous: false,
                        comment_count: 0,
                        view_count: 0,
                        school_id: 'mock-school',
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
    });

    return {
        groups: groupsQuery.data || [],
        isLoadingGroups: groupsQuery.isLoading,
        errorGroups: groupsQuery.error,

        getPosts: (groupId?: string) => {
            // Wrapper to access data if needed
            return { data: [], isLoading: false };
        },

        // Expose default posts so UI doesn't break
        posts: defaultPostsQuery.data || [],

        fetchGroups: () => groupsQuery.refetch(),
        fetchPosts: (groupId?: string) => queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.posts(groupId || 'all') }),

        createPost: createPostMutation.mutateAsync,
        isCreatingPost: createPostMutation.isPending,

        loading: groupsQuery.isLoading || defaultPostsQuery.isLoading,
        error: (groupsQuery.error || defaultPostsQuery.error) ? ((groupsQuery.error || defaultPostsQuery.error) as Error).message : null,
    };
};
