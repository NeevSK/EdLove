import {
  MOCK_LIBRARY_COLLECTIONS,
  MOCK_LIBRARY_RESOURCES,
  type MockLibraryCollection,
  type MockLibraryResource,
} from '@repo/core/api/mockData';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { answer, definePort, type PortSource } from '@repo/core/ports/definePort';
import { useQuery } from '@tanstack/react-query';

/** One thing on a shelf, as a room shows it. */
export interface ShelfItem {
  id: string;
  title: string;
  summary: string;
  /** pdf, video, link, document… */
  kind: string;
  subjects: readonly string[];
  language?: string;
  /** From the ministry or the school, not a person. */
  official: boolean;
  verified: boolean;
  url?: string;
}

export interface ShelfCollection {
  id: string;
  name: string;
  summary: string;
  itemIds: readonly string[];
  official: boolean;
}

export interface LibraryPort extends PortSource {
  shelf(signal?: AbortSignal): Promise<readonly ShelfItem[]>;
  collections(signal?: AbortSignal): Promise<readonly ShelfCollection[]>;
}

export function shelfItemOf(r: MockLibraryResource): ShelfItem {
  return {
    id: r.id,
    title: r.title,
    summary: r.description,
    kind: r.format ?? r.type,
    subjects: r.subjects ?? (r.subject ? [r.subject] : []),
    language: r.language,
    official: r.is_official === true,
    verified: r.verified === true,
    url: r.url,
  };
}

export function shelfCollectionOf(c: MockLibraryCollection): ShelfCollection {
  return {
    id: c.id,
    name: c.name,
    summary: c.description,
    itemIds: c.resource_ids,
    official: c.is_official === true,
  };
}

const sample: LibraryPort = {
  source: 'sample',
  shelf: (signal) => answer(MOCK_LIBRARY_RESOURCES.map(shelfItemOf), signal),
  collections: (signal) => answer(MOCK_LIBRARY_COLLECTIONS.map(shelfCollectionOf), signal),
};

/** Where the Library's records come from. Samples until library.resources is admitted. */
export const libraryPort = definePort<LibraryPort>(sample);

/** Every subject on the shelf, most used first. */
export function subjectsOf(items: readonly ShelfItem[]): string[] {
  const count = new Map<string, number>();
  for (const it of items) for (const s of it.subjects) count.set(s, (count.get(s) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([s]) => s);
}

/** Items whose title, summary or subject holds every word of the query. */
export function searchShelf(items: readonly ShelfItem[], query: string): ShelfItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...items];
  return items.filter((it) => {
    const hay = `${it.title} ${it.summary} ${it.subjects.join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export function useShelf() {
  const port = libraryPort.get();
  return useQuery({
    queryKey: ['library', 'shelf', getActiveAccountId(), port.source],
    queryFn: ({ signal }) => port.shelf(signal),
    staleTime: 5 * 60_000,
  });
}

export function useShelfCollections() {
  const port = libraryPort.get();
  return useQuery({
    queryKey: ['library', 'collections', getActiveAccountId(), port.source],
    queryFn: ({ signal }) => port.collections(signal),
    staleTime: 5 * 60_000,
  });
}
