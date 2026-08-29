import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import { useMemo } from 'react';

export type LibraryWorkspaceSurfaceId =
  | 'continue_learning'
  | 'bookmarks'
  | 'categories'
  | 'collections'
  | 'trending'
  | 'new_arrivals';

export type LibraryWorkspaceCapabilityKey = 'LibrarySection';

export type LibraryWorkspaceSurface = WorkspaceSurfaceDefinition<
  LibraryWorkspaceSurfaceId,
  LibraryWorkspaceCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
};

function createSurface(
  surfaceId: LibraryWorkspaceSurfaceId,
  config: Omit<
    LibraryWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage' | 'title'
  > & { title: string },
): LibraryWorkspaceSurface {
  return {
    surfaceId,
    workspaceId: 'library',
    capabilityKey: 'LibrarySection',
    ownerPackage: 'library',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    kind: 'section',
    domain: config.defaultZone,
    groupId: config.defaultZone,
    hiddenByDefault: config.hiddenByDefault,
    mobileSupport: true,
    webSupport: true,
    title: config.title,
    subtitle: config.subtitle,
    summary: config.summary,
    temporalLabel: config.temporalLabel,
    metadata: config.metadata,
    content: undefined as unknown as React.ReactNode,
  } as unknown as LibraryWorkspaceSurface;
}

export function useLibraryWorkspaceSurfaces(): LibraryWorkspaceSurface[] {
  return useMemo<LibraryWorkspaceSurface[]>(
    () => [
      createSurface('continue_learning', {
        defaultZone: 'today',
        defaultOrder: 10,
        title: 'Continue Learning',
        subtitle: 'Pick up where you left off',
        summary: 'Your desk items and recent reading.',
        temporalLabel: 'Today',
        metadata: ['Desk', 'Recent'],
      }),
      createSurface('bookmarks', {
        defaultZone: 'work',
        defaultOrder: 20,
        title: 'My Bookmarks',
        subtitle: 'Saved for later',
        summary: 'Resources you bookmarked.',
        temporalLabel: 'Saved',
        metadata: ['Bookmarks'],
      }),
      createSurface('categories', {
        defaultZone: 'work',
        defaultOrder: 30,
        title: 'Discover Categories',
        subtitle: 'Browse by subject',
        summary: 'Collections grouped by subject.',
        temporalLabel: 'Browse',
        metadata: ['Categories'],
      }),
      createSurface('collections', {
        defaultZone: 'institution',
        defaultOrder: 40,
        title: 'Featured Collections',
        subtitle: 'Curated paths',
        summary: 'Themed gathers of resources.',
        temporalLabel: 'Curated',
        metadata: ['Collections'],
      }),
      createSurface('trending', {
        defaultZone: 'outlook',
        defaultOrder: 50,
        title: 'Trending',
        subtitle: 'Most endorsed',
        summary: 'Top endorsed resources.',
        temporalLabel: 'Hot',
        metadata: ['Trending'],
      }),
      createSurface('new_arrivals', {
        defaultZone: 'outlook',
        defaultOrder: 60,
        title: 'New Arrivals',
        subtitle: 'Recently added',
        summary: 'Newest resources in the sanctuary.',
        temporalLabel: 'New',
        metadata: ['New'],
      }),
    ],
    [],
  );
}
