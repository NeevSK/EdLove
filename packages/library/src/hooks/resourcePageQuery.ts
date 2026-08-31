import type { LibraryResource, ResourceFilters } from '@repo/library/types';

export type ResourcePageClient = {
  getResources: (filters: ResourceFilters) => Promise<LibraryResource[]>;
  searchLibrary: (params: {
    query: string;
    type?: string;
    limit?: number;
  }) => Promise<LibraryResource[]>;
};

export async function fetchResourcePage(
  client: ResourcePageClient,
  filters: ResourceFilters,
  pageParam: number,
): Promise<LibraryResource[]> {
  if (filters.search || filters.type) {
    return client.searchLibrary({
      query: filters.search ?? '',
      type: filters.type,
      limit: 20,
    });
  }

  return client.getResources({
    ...filters,
    limit: 10,
    offset: pageParam,
  });
}
