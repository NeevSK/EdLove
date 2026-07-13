

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { libraryAPI } from '../api/library';
import { knowledgeSync } from '../api/sync';
import type { CollectionFilters, CreateCollectionInput, CreateResourceInput, LibraryCollection, ResourceFilters } from '../types';

// Keys for React Query
export const LIBRARY_KEYS = {
  all: ['library'] as const,
  resources: (filters: ResourceFilters = {}) =>
    [...LIBRARY_KEYS.all, 'resources', filters] as const,
  collections: (filters: CollectionFilters = {}) =>
    [...LIBRARY_KEYS.all, 'collections', filters] as const,
  collection: (id: string) => [...LIBRARY_KEYS.all, 'collection', id] as const,
  resource: (id: string) => [...LIBRARY_KEYS.all, 'resource', id] as const,
  bookmarked: (userId: string) =>
    [...LIBRARY_KEYS.all, 'bookmarked', userId] as const,
  sync: () => [...LIBRARY_KEYS.all, 'sync'] as const,
};

export const useLibrary = (
  resourceFilters: ResourceFilters = {},
  collectionFilters: CollectionFilters = {},
) => {
  const queryClient = useQueryClient();
  const temporalResourceFilters = useMemo(
    () => ({ ...resourceFilters }),
    [resourceFilters],
  );
  const temporalCollectionFilters = useMemo(
    () => ({ ...collectionFilters }),
    [collectionFilters],
  );

  const { data: totalResourcesCount } = useQuery({
    queryKey: [...LIBRARY_KEYS.all, 'resources-count'],
    queryFn: () => libraryAPI.getResourcesCount(),
  });

  const { data: totalCollectionsCount } = useQuery({
    queryKey: [...LIBRARY_KEYS.all, 'collections-count'],
    queryFn: () => libraryAPI.getCollectionsCount(),
  });

  // Fetch Resources with Infinite Scroll
  const resourcesInfiniteQuery = useInfiniteQuery({
    queryKey: LIBRARY_KEYS.resources(temporalResourceFilters),
    queryFn: async ({ pageParam = 0 }) => {
      // Prefer Server-Side Search for reliability on web (Guest and Auth)
      if (temporalResourceFilters.search || temporalResourceFilters.type) {
        return libraryAPI.searchLibrary({
          query: temporalResourceFilters.search || '',
          type: temporalResourceFilters.type,
          limit: 20,
        });
      }

      return libraryAPI.getResources({
        ...temporalResourceFilters,
        limit: 10,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // For local search, we don't handle pagination yet in the same way (simple limit for now)
      if (temporalResourceFilters.search) return undefined;
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
  });

  // Fetch Categories (Virtual Dynamic Collections based on subjects/topics) with Infinite Scroll
  const categoriesInfiniteQuery = useInfiniteQuery({
    queryKey: [...LIBRARY_KEYS.collections(temporalCollectionFilters), 'only_virtual'],
    queryFn: async ({ pageParam = 0 }) => {
      return libraryAPI.getCollections({
        ...temporalCollectionFilters,
        only_virtual: true,
        limit: 10,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
  });

  // Fetch Collections (Explicit Database physical rows) with Infinite Scroll
  const collectionsInfiniteQuery = useInfiniteQuery({
    queryKey: [...LIBRARY_KEYS.collections(temporalCollectionFilters), 'exclude_virtual'],
    queryFn: async ({ pageParam = 0 }) => {
      return libraryAPI.getCollections({
        ...temporalCollectionFilters,
        exclude_virtual: true,
        limit: 10,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
  });

  // Create Resource Mutation
  const createResourceMutation = useMutation({
    mutationFn: async ({
      input,
      creatorId,
      creatorRole,
    }: {
      input: CreateResourceInput;
      creatorId: string;
      creatorRole: string;
    }) => {
      return libraryAPI.createResource(input, creatorId, creatorRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
    },
  });

  // Endorse Mutation
  const endorseMutation = useMutation({
    mutationFn: async ({ resourceId, userId }: { resourceId: string; userId: string }) => {
      return libraryAPI.endorseResource(resourceId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.resource(variables.resourceId),
      });
    },
  });

  // Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ resourceId, userId }: { resourceId: string; userId: string }) => {
      return libraryAPI.bookmarkResource(resourceId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.bookmarked(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.resource(variables.resourceId),
      });
    },
  });

  // Add to Collection Mutation
  const addToCollectionMutation = useMutation({
    mutationFn: async ({
      collectionId,
      resourceId,
    }: {
      collectionId: string;
      resourceId: string;
    }) => {
      return libraryAPI.addToCollection(collectionId, resourceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.collection(variables.collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.resource(variables.resourceId),
      });
    },
  });

  // Remove from Collection Mutation
  const removeFromCollectionMutation = useMutation({
    mutationFn: async ({
      collectionId,
      resourceId,
    }: {
      collectionId: string;
      resourceId: string;
    }) => {
      return libraryAPI.removeFromCollection(collectionId, resourceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_KEYS.collection(variables.collectionId),
      });
    },
  });

  // Create Collection Mutation
  const createCollectionMutation = useMutation({
    mutationFn: async ({
      input,
      creatorId,
    }: {
      input: CreateCollectionInput;
      creatorId: string;
    }) => {
      return libraryAPI.createCollection(input, creatorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({ queryKey: [...LIBRARY_KEYS.all, 'collections-count'] });
    },
  });

  // Update Collection Mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<LibraryCollection>;
    }) => {
      return libraryAPI.updateCollection(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(variables.id) });
    },
  });

  // Delete Collection Mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return libraryAPI.deleteCollection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({ queryKey: [...LIBRARY_KEYS.all, 'collections-count'] });
    },
  });

  const syncLibrary = useCallback(async () => {
    await knowledgeSync.performSync();
    // Use queryClient directly to invalidate instead of causing a dependency on the query object itself
    queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.resources() });
  }, [queryClient]);

  const resources = useMemo(
    () => resourcesInfiniteQuery.data?.pages.flat() || [],
    [resourcesInfiniteQuery.data],
  );
  const categories = useMemo(
    () => categoriesInfiniteQuery.data?.pages.flat() || [],
    [categoriesInfiniteQuery.data],
  );
  const collections = useMemo(
    () => collectionsInfiniteQuery.data?.pages.flat() || [],
    [collectionsInfiniteQuery.data],
  );

  return {
    resources,
    isLoadingResources: resourcesInfiniteQuery.isLoading,
    isFetchingNextResources: resourcesInfiniteQuery.isFetchingNextPage,
    hasNextResources: resourcesInfiniteQuery.hasNextPage,
    fetchNextResources: resourcesInfiniteQuery.fetchNextPage,
    fetchResources: resourcesInfiniteQuery.refetch,

    categories,
    isLoadingCategories: categoriesInfiniteQuery.isLoading,
    isFetchingNextCategories: categoriesInfiniteQuery.isFetchingNextPage,
    hasNextCategories: categoriesInfiniteQuery.hasNextPage,
    fetchNextCategories: categoriesInfiniteQuery.fetchNextPage,
    fetchCategories: categoriesInfiniteQuery.refetch,

    collections,
    isLoadingCollections: collectionsInfiniteQuery.isLoading,
    isFetchingNextCollections: collectionsInfiniteQuery.isFetchingNextPage,
    hasNextCollections: collectionsInfiniteQuery.hasNextPage,
    fetchNextCollections: collectionsInfiniteQuery.fetchNextPage,
    fetchCollections: collectionsInfiniteQuery.refetch,

    createResource: createResourceMutation.mutateAsync,
    isCreatingResource: createResourceMutation.isPending,

    endorseResource: endorseMutation.mutateAsync,
    bookmarkResource: bookmarkMutation.mutateAsync,
    isBookmarking: bookmarkMutation.isPending,
    addToCollection: addToCollectionMutation.mutateAsync,
    isAddingToCollection: addToCollectionMutation.isPending,

    removeFromCollection: removeFromCollectionMutation.mutateAsync,
    isRemovingFromCollection: removeFromCollectionMutation.isPending,

    createCollection: createCollectionMutation.mutateAsync,
    isCreatingCollection: createCollectionMutation.isPending,

    updateCollection: updateCollectionMutation.mutateAsync,
    isUpdatingCollection: updateCollectionMutation.isPending,

    deleteCollection: deleteCollectionMutation.mutateAsync,
    isDeletingCollection: deleteCollectionMutation.isPending,

    syncLibrary,

    totalResourcesCount: totalResourcesCount ?? 0,
    totalCollectionsCount: totalCollectionsCount ?? 0,

    loading:
      resourcesInfiniteQuery.isLoading ||
      categoriesInfiniteQuery.isLoading ||
      collectionsInfiniteQuery.isLoading,
    error:
      resourcesInfiniteQuery.error ||
      categoriesInfiniteQuery.error ||
      collectionsInfiniteQuery.error
        ? ((resourcesInfiniteQuery.error ||
            categoriesInfiniteQuery.error ||
            collectionsInfiniteQuery.error) as Error).message
        : null,
  };
};
export const useCollection = (id: string, userId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: LIBRARY_KEYS.collection(id),
    queryFn: () => libraryAPI.getCollectionById(id, userId),
    enabled: !!id,
  });

  return {
    collection: data ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

export const useBookmarkedResources = (userId?: string) => {
  const { data, isLoading, error, refetch } = useInfiniteQuery({
    queryKey: LIBRARY_KEYS.bookmarked(userId || ''),
    queryFn: () =>
      userId
        ? libraryAPI.getBookmarkedResources(userId)
        : Promise.resolve([]),
    enabled: !!userId,
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });

  return {
    resources: data?.pages[0] || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
