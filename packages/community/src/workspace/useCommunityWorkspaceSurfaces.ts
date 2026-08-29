import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import { useMemo } from 'react';

export type CommunityWorkspaceSurfaceId = 'feed' | 'circles' | 'messages' | 'announcements';
export type CommunityWorkspaceCapabilityKey = 'CommunityMode';

export type CommunityWorkspaceSurface = WorkspaceSurfaceDefinition<
  CommunityWorkspaceSurfaceId,
  CommunityWorkspaceCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
};

function createSurface(
  surfaceId: CommunityWorkspaceSurfaceId,
  config: Omit<
    CommunityWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage' | 'title'
  > & { title: string },
): CommunityWorkspaceSurface {
  return {
    surfaceId,
    workspaceId: 'community',
    capabilityKey: 'CommunityMode',
    ownerPackage: 'community',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    kind: 'mode',
    domain: 'community',
    groupId: 'today',
    hiddenByDefault: config.hiddenByDefault,
    mobileSupport: true,
    webSupport: true,
    title: config.title,
    subtitle: config.subtitle,
    summary: config.summary,
    temporalLabel: config.temporalLabel,
    metadata: config.metadata,
    content: undefined as unknown as React.ReactNode,
  } as unknown as CommunityWorkspaceSurface;
}

export function useCommunityWorkspaceSurfaces(): CommunityWorkspaceSurface[] {
  return useMemo<CommunityWorkspaceSurface[]>(
    () => [
      createSurface('feed', {
        defaultZone: 'today',
        defaultOrder: 10,
        title: 'Feed',
        subtitle: 'Shared updates',
        summary: 'Posts, echoes, community pulse.',
        temporalLabel: 'Live',
        metadata: ['Feed'],
      }),
      createSurface('circles', {
        defaultZone: 'today',
        defaultOrder: 20,
        title: 'Circles',
        subtitle: 'Your groups',
        summary: 'Joined circles and discovery.',
        temporalLabel: 'Circles',
        metadata: ['Circles'],
      }),
      createSurface('messages', {
        defaultZone: 'today',
        defaultOrder: 30,
        title: 'Messages',
        subtitle: 'Direct conversations',
        summary: 'Private messages, one tap away.',
        temporalLabel: 'DMs',
        metadata: ['Messages'],
      }),
      createSurface('announcements', {
        defaultZone: 'today',
        defaultOrder: 40,
        title: 'Announcements',
        subtitle: 'School guidance',
        summary: 'Official school-wide guidance.',
        temporalLabel: 'Official',
        metadata: ['Announcements'],
      }),
    ],
    [],
  );
}
