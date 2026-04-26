import {
  createDefaultWorkspaceLayout,
  type ResolvedWorkspaceSurface,
  resolveWorkspaceSurfaceLayout,
  type WorkspaceLayout,
  type WorkspaceRuntimePlatform,
  type WorkspaceSurfaceDefinition,
} from '@repo/core';
import type {
  CommunityGroup,
  CommunityPost,
  DirectConversation,
  SanctuaryManifesto,
} from '../types';

export type CommunityWorkspaceMode = 'feed' | 'circles' | 'messages' | 'announcements';

export type CommunityWorkspaceSurfaceId =
  | 'modes'
  | 'joined-circles'
  | 'trust'
  | 'quick-path'
  | 'hearth'
  | 'search'
  | 'compose'
  | 'feed-stream'
  | 'context-pulse'
  | 'context-circles'
  | 'context-trust'
  | 'context-messages';

export type CommunityWorkspaceCapabilityKey =
  | 'community.mode'
  | 'community.circles'
  | 'community.trust'
  | 'community.quick-path'
  | 'community.hearth'
  | 'community.search'
  | 'community.compose'
  | 'community.feed'
  | 'community.pulse'
  | 'community.messages';

const COMMUNITY_WORKSPACE_ID = 'community-sanctuary';

const COMMUNITY_SURFACES: WorkspaceSurfaceDefinition<
  CommunityWorkspaceSurfaceId,
  CommunityWorkspaceCapabilityKey
>[] = [
  {
    surfaceId: 'modes',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.mode',
    ownerPackage: 'community',
    defaultZone: 'today',
    defaultOrder: 10,
    mobileSupport: true,
    webSupport: true,
  },
  {
    surfaceId: 'joined-circles',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.circles',
    ownerPackage: 'community',
    defaultZone: 'today',
    defaultOrder: 20,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'trust',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.trust',
    ownerPackage: 'community',
    defaultZone: 'today',
    defaultOrder: 30,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'quick-path',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.quick-path',
    ownerPackage: 'community',
    defaultZone: 'today',
    defaultOrder: 40,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'hearth',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.hearth',
    ownerPackage: 'community',
    defaultZone: 'work',
    defaultOrder: 50,
    mobileSupport: true,
    webSupport: true,
  },
  {
    surfaceId: 'search',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.search',
    ownerPackage: 'community',
    defaultZone: 'work',
    defaultOrder: 60,
    mobileSupport: true,
    webSupport: true,
  },
  {
    surfaceId: 'compose',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.compose',
    ownerPackage: 'community',
    defaultZone: 'work',
    defaultOrder: 70,
    mobileSupport: true,
    webSupport: true,
  },
  {
    surfaceId: 'feed-stream',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.feed',
    ownerPackage: 'community',
    defaultZone: 'work',
    defaultOrder: 80,
    mobileSupport: true,
    webSupport: true,
  },
  {
    surfaceId: 'context-pulse',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.pulse',
    ownerPackage: 'community',
    defaultZone: 'outlook',
    defaultOrder: 90,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'context-circles',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.circles',
    ownerPackage: 'community',
    defaultZone: 'outlook',
    defaultOrder: 100,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'context-trust',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.trust',
    ownerPackage: 'community',
    defaultZone: 'outlook',
    defaultOrder: 110,
    mobileSupport: false,
    webSupport: true,
  },
  {
    surfaceId: 'context-messages',
    workspaceId: COMMUNITY_WORKSPACE_ID,
    capabilityKey: 'community.messages',
    ownerPackage: 'community',
    defaultZone: 'outlook',
    defaultOrder: 120,
    mobileSupport: false,
    webSupport: true,
  },
];

export function createCommunityWorkspaceLayout(
  userId: string,
): WorkspaceLayout<CommunityWorkspaceSurfaceId> {
  return createDefaultWorkspaceLayout({
    workspaceId: COMMUNITY_WORKSPACE_ID,
    userId,
    surfaces: COMMUNITY_SURFACES,
  });
}

export function resolveCommunityWorkspace(
  runtimePlatform: WorkspaceRuntimePlatform,
  userId: string,
): ResolvedWorkspaceSurface<CommunityWorkspaceSurfaceId, CommunityWorkspaceCapabilityKey>[] {
  const layout = createCommunityWorkspaceLayout(userId);
  return resolveWorkspaceSurfaceLayout(COMMUNITY_SURFACES, layout).filter((surface) =>
    runtimePlatform === 'web' ? surface.webSupport !== false : surface.mobileSupport !== false,
  );
}

export function mapCommunitySurfaceSlots(
  runtimePlatform: WorkspaceRuntimePlatform,
  userId: string,
) {
  const resolved = resolveCommunityWorkspace(runtimePlatform, userId);
  return COMMUNITY_SURFACES.reduce(
    (acc, definition) => {
      const surface =
        resolved.find((candidate) => candidate.surfaceId === definition.surfaceId) ?? null;
      acc[definition.surfaceId] = surface;
      return acc;
    },
    {} as Record<
      CommunityWorkspaceSurfaceId,
      ResolvedWorkspaceSurface<CommunityWorkspaceSurfaceId, CommunityWorkspaceCapabilityKey> | null
    >,
  );
}

export function getCommunityModeOptions(
  includeAnnouncements: boolean,
  includeMessaging: boolean = true,
) {
  const base: { key: CommunityWorkspaceMode; label: string }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'circles', label: 'Circles' },
  ];

  const modes = [...base];
  if (includeMessaging) {
    modes.push({ key: 'messages' as const, label: 'Messages' });
  }

  return includeAnnouncements
    ? [...modes, { key: 'announcements' as const, label: 'Announcements' }]
    : modes;
}

export function deriveCommunityPulse(
  posts: CommunityPost[],
  groups: CommunityGroup[],
  manifestos: SanctuaryManifesto[],
  conversations: DirectConversation[],
) {
  const joinedGroups = groups.filter((group) => group.is_member);
  const totalMembersSeen = joinedGroups.reduce((sum, group) => sum + (group.member_count || 0), 0);
  const newPostsToday = posts.filter((post) => {
    const created = new Date(post.created_at);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  return {
    membersSeen: totalMembersSeen,
    circlesActive: joinedGroups.length,
    newPostsToday,
    manifestosActive: manifestos.filter((manifesto) => manifesto.status === 'active').length,
    messagesOpen: conversations.length,
  };
}

export function getCommunityFilterOptions(groups: CommunityGroup[]) {
  const joined = groups.filter((group) => group.is_member);
  return [
    { label: 'All Updates', value: 'all' },
    ...joined.slice(0, 3).map((group) => ({
      label: group.name,
      value: group.id,
    })),
  ];
}

export function getCommunityQuickPaths(canReadAnnouncements: boolean) {
  const items = [
    {
      key: 'circles',
      title: 'Open Circle',
      description: 'Jump into the group you belong to and continue the thread there.',
    },
    {
      key: 'messages',
      title: 'Open Messages',
      description: 'Direct conversations stay one step away from the hearth.',
    },
  ];

  if (canReadAnnouncements) {
    items.push({
      key: 'announcements',
      title: 'Announcements',
      description: 'School-wide guidance stays reachable without crowding the feed.',
    });
  }

  return items;
}
