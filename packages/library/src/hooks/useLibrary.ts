import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { libraryAPI } from '../api/library';
import { ResourceFilters, CollectionFilters } from '../types';

// Keys for React Query
export const LIBRARY_KEYS = {
    all: ['library'] as const,
    resources: (filters: ResourceFilters = {}) => [...LIBRARY_KEYS.all, 'resources', filters] as const,
    collections: (filters: CollectionFilters = {}) => [...LIBRARY_KEYS.all, 'collections', filters] as const,
    resource: (id: string) => [...LIBRARY_KEYS.all, 'resource', id] as const,
    sync: () => [...LIBRARY_KEYS.all, 'sync'] as const,
};
import { knowledgeSync } from '../api/sync';
import { knowledgeDB } from '../api/database';
import { useEffect } from 'react';

export const useLibrary = (resourceFilters: ResourceFilters = {}, collectionFilters: CollectionFilters = {}) => {
    const queryClient = useQueryClient();

    // Fetch Resources with Infinite Scroll
    const resourcesInfiniteQuery = useInfiniteQuery({
        queryKey: LIBRARY_KEYS.resources(resourceFilters),
        queryFn: async ({ pageParam = 0 }) => {
            // High-Performance Sync Search — enabled for web via IndexedDB resonance
            if (resourceFilters.search) {
                return libraryAPI.searchResourcesLocal(resourceFilters.search, 20);
            }

            // Versatile Server-Side Search
            if (resourceFilters.search || resourceFilters.type) {
                return libraryAPI.searchLibrary({
                    query: resourceFilters.search || '',
                    type: resourceFilters.type,
                    limit: 20
                });
            }

            return libraryAPI.getResources({ ...resourceFilters, limit: 10, offset: pageParam });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // For local search, we don't handle pagination yet in the same way (simple limit for now)
            if (resourceFilters.search) return undefined;
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        }
    });

    // Fetch Collections with Infinite Scroll
    const collectionsInfiniteQuery = useInfiniteQuery({
        queryKey: LIBRARY_KEYS.collections(collectionFilters),
        queryFn: async ({ pageParam = 0 }) => {
            return libraryAPI.getCollections({ ...collectionFilters, limit: 10, offset: pageParam });
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        }
    });

    // Create Resource Mutation
    const createResourceMutation = useMutation({
        mutationFn: async ({ input, creatorId, creatorRole }: { input: any, creatorId: string, creatorRole: string }) => {
            return libraryAPI.createResource(input, creatorId, creatorRole);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
        },
    });

    // Endorse Mutation
    const endorseMutation = useMutation({
        mutationFn: async ({ resourceId, userId }: { resourceId: string, userId: string }) => {
            return libraryAPI.endorseResource(resourceId, userId);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
            queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resource(variables.resourceId) });
        },
    });

    return {
        resources: resourcesInfiniteQuery.data?.pages.flat() || [],
        isLoadingResources: resourcesInfiniteQuery.isLoading,
        isFetchingNextResources: resourcesInfiniteQuery.isFetchingNextPage,
        hasNextResources: resourcesInfiniteQuery.hasNextPage,
        fetchNextResources: resourcesInfiniteQuery.fetchNextPage,
        fetchResources: resourcesInfiniteQuery.refetch,

        collections: collectionsInfiniteQuery.data?.pages.flat() || [],
        isLoadingCollections: collectionsInfiniteQuery.isLoading,
        isFetchingNextCollections: collectionsInfiniteQuery.isFetchingNextPage,
        hasNextCollections: collectionsInfiniteQuery.hasNextPage,
        fetchNextCollections: collectionsInfiniteQuery.fetchNextPage,
        fetchCollections: collectionsInfiniteQuery.refetch,

        createResource: createResourceMutation.mutateAsync,
        isCreatingResource: createResourceMutation.isPending,

        endorseResource: endorseMutation.mutateAsync,

        syncLibrary: async () => {
            await knowledgeSync.performSync();
            resourcesInfiniteQuery.refetch();
        },

        loading: resourcesInfiniteQuery.isLoading || collectionsInfiniteQuery.isLoading,
        error: (resourcesInfiniteQuery.error || collectionsInfiniteQuery.error)
            ? ((resourcesInfiniteQuery.error || collectionsInfiniteQuery.error) as Error).message
            : null,
    };
};
