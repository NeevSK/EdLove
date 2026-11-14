/**
 * @file packages/core/src/api/hooks/library.hooks.ts
 * Sovereign TanStack Query v5 hooks bound to native oRPC v2 Library contracts.
 */

import { orpc } from '../orpcClient';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export function useLibraryCountsQuery() {
  return useQuery<{ resource_count: number; collection_count: number }>({
    ...orpc.library.getCounts.queryOptions({
      input: { query: {} },
    }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryResourcesQuery(filters: {
  subject?: string;
  topic?: string;
  resource_type?: string;
  is_active?: boolean;
  search?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery<any[]>({
    ...orpc.library.getResources.queryOptions({
      input: { query: filters },
    }),
    staleTime: 60 * 1000,
  });
}

export function useLibraryCollectionsQuery(filters: {
  subject?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery<any[]>({
    ...orpc.library.getCollections.queryOptions({
      input: { query: filters },
    }),
    staleTime: 60 * 1000,
  });
}

export function useLibraryCollectionQuery(collectionId?: string) {
  return useQuery<any>({
    ...orpc.library.getCollectionById.queryOptions({
      input: { params: { id: collectionId || '00000000-0000-0000-0000-000000000000' } },
    }),
    enabled: Boolean(collectionId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLibraryResourceQuery(resourceId?: string) {
  return useQuery<any>({
    ...orpc.library.getResourceById.queryOptions({
      input: { params: { id: resourceId || '00000000-0000-0000-0000-000000000000' } },
    }),
    enabled: Boolean(resourceId),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Atomic invalidation for library queries.
 */
export async function invalidateLibraryQueries(queryClient: QueryClient, id?: string) {
  if (id) {
    await queryClient.invalidateQueries({
      queryKey: orpc.library.getCollectionById.key({
        input: { params: { id } },
      }),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.library.getResourceById.key({
        input: { params: { id } },
      }),
    });
  } else {
    await queryClient.invalidateQueries({
      queryKey: orpc.library.getCounts.key(),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.library.getResources.key(),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.library.getCollections.key(),
    });
  }
}
