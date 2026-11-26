import type { ReactNode } from 'react';
import { notificationFeed } from '../../app/(sanctuary)/notifications/notificationFeed';
import { getExploreSampleAnnouncements } from '../../lib/community/announcements-contract';
import { getExploreCapacityMeta, useExploreCapacity } from '../../lib/explore/exploreCapacity';
import { AccessScope } from './access';
import { EXPLORE_COMMUNITY_GROUPS } from '../../app/(sanctuary)/community/exploreGroups';
import { resolveSurfaceUrl } from '../../lib/surface-urls';
import type { AccountHome, Commands, Sources } from './sources';

/** A visitor with no account: the persona they chose to try, kept on this device. */
export function Surface({ children }: { readonly children: ReactNode }) {
  const capacity = useExploreCapacity();
  const session = {
    surface: 'explore',
    accountId: 'explore-guest',
    authSubjectId: 'explore-guest',
    displayName: 'Guest Explorer',
    capacity,
    primaryCapacity: capacity,
    roleLabel: getExploreCapacityMeta(capacity).roleTitle,
  } as const;
  return <AccessScope access={{ kind: 'ready', session }}>{children}</AccessScope>;
}

/** Explore answers every query from sample data on the device; nothing leaves the browser. */
export const sources: Sources = {
  announcements: () => ({
    queryKey: ['explore', 'announcements'],
    queryFn: async () => getExploreSampleAnnouncements(),
  }),
  notifications: () => ({
    queryKey: ['explore', 'notifications'],
    queryFn: async () => notificationFeed('explore'),
  }),
  communityGroups: () => ({
    queryKey: ['explore', 'community-groups'],
    queryFn: async () => ({ kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false }),
  }),
  accountDeletion: () => ({
    queryKey: ['explore', 'account-deletion'],
    queryFn: async () => null,
  }),
};

/** Explore has no account, so there is nothing to delete; no screen offers it here. */
export const commands: Commands = {
  requestAccountDeletion: () => Promise.reject(new Error('Explore has no account.')),
  cancelAccountDeletion: () => Promise.reject(new Error('Explore has no account.')),
};

export const accountHome: AccountHome = {
  kind: 'elsewhere',
  origin: new URL(resolveSurfaceUrl('sanctuary', '/')).origin,
};
