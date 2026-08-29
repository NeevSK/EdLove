import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import { useMemo } from 'react';

export type ProfileWorkspaceSurfaceId =
  | 'identity'
  | 'journey'
  | 'tools'
  | 'care'
  | 'account';

export type ProfileWorkspaceCapabilityKey = 'ProfileSection';

export type ProfileWorkspaceSurface = WorkspaceSurfaceDefinition<
  ProfileWorkspaceSurfaceId,
  ProfileWorkspaceCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
};

function createSurface(
  surfaceId: ProfileWorkspaceSurfaceId,
  config: Omit<
    ProfileWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage' | 'title'
  > & { title: string },
): ProfileWorkspaceSurface {
  return {
    surfaceId,
    workspaceId: 'profile',
    capabilityKey: 'ProfileSection',
    ownerPackage: 'core',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    kind: 'group',
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
  } as unknown as ProfileWorkspaceSurface;
}

export function useProfileWorkspaceSurfaces(): ProfileWorkspaceSurface[] {
  return useMemo<ProfileWorkspaceSurface[]>(
    () => [
      createSurface('identity', {
        defaultZone: 'today',
        defaultOrder: 10,
        title: 'Identity',
        subtitle: 'Who you are',
        summary: 'Your card, edit, and completion.',
        temporalLabel: 'You',
        metadata: ['Identity'],
      }),
      createSurface('journey', {
        defaultZone: 'today',
        defaultOrder: 20,
        title: 'Journey',
        subtitle: 'Living journey',
        summary: 'Stats, thuthimal, growth.',
        temporalLabel: 'Journey',
        metadata: ['Journey'],
      }),
      createSurface('tools', {
        defaultZone: 'work',
        defaultOrder: 30,
        title: 'Profile tools',
        subtitle: 'Settings, privacy, public',
        summary: 'Open settings, privacy ledger, public preview.',
        temporalLabel: 'Tools',
        metadata: ['Tools'],
      }),
      createSurface('care', {
        defaultZone: 'outlook',
        defaultOrder: 40,
        title: 'Care & preferences',
        subtitle: 'Support & notifications',
        summary: 'Support, app experience, notifications, security.',
        temporalLabel: 'Care',
        metadata: ['Care'],
      }),
      createSurface('account', {
        defaultZone: 'private',
        defaultOrder: 50,
        title: 'Account actions',
        subtitle: 'Sign out & deletion',
        summary: 'Leave or delete with protection.',
        temporalLabel: 'Private',
        metadata: ['Private'],
      }),
    ],
    [],
  );
}
