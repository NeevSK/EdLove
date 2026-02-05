import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { storage, StorageKeys } from '../lib/storage';

export interface Group {
    id: string;
    name: string;
    description: string;
    type: 'public' | 'private' | 'class';
    member_count: number;
    image_url?: string;
    is_member: boolean;
}

export interface Post {
    id: string;
    group_id: string;
    author_id: string;
    content: string;
    type: 'text' | 'announcement' | 'poll';
    created_at: string;
    reactions: { [key: string]: number };
    author_name: string;
    author_avatar?: string;
}

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
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockGroups: Group[] = [
                { id: '1', name: 'Science Club', description: 'For styling atomic structures', type: 'public', member_count: 42, is_member: true },
                { id: '2', name: 'Grade 10-A', description: 'Official class group', type: 'class', member_count: 30, is_member: true },
                { id: '3', name: 'Teachers Lounge', description: 'Staff only', type: 'private', member_count: 15, is_member: true },
            ];

            // Persist to MMKV
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
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockPosts: Post[] = [
                {
                    id: '1',
                    group_id: '1',
                    author_id: 'u1',
                    author_name: 'Dr. Stone',
                    content: 'Science fair is coming up! Get your projects ready.',
                    type: 'announcement',
                    created_at: new Date().toISOString(),
                    reactions: { '🔥': 5, '👍': 12 }
                },
                {
                    id: '2',
                    group_id: '1',
                    author_id: 'u2',
                    author_name: 'Alice',
                    content: 'Anyone has a spare voltmeter?',
                    type: 'text',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    reactions: { '❤️': 2 }
                }
            ];
            return mockPosts;
        }
    });

    // Create Post Mutation
    const createPostMutation = useMutation({
        mutationFn: async (post: Omit<Post, 'id' | 'created_at' | 'reactions' | 'author_name'>) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const newPost: Post = {
                ...post,
                id: `new-${Date.now()}`,
                created_at: new Date().toISOString(),
                reactions: {},
                author_name: 'Me', // Placeholder
            };
            return newPost;
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
                    } as Post,
                    ...previousPosts,
                ]);
            }

            return { previousPosts };
        },
        onError: (err, newPost, context) => {
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
