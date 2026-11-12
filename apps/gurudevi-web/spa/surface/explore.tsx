import type { ReactNode } from 'react';
import { notificationFeed } from '../../app/(sanctuary)/notifications/notificationFeed';
import { getExploreSampleAnnouncements } from '../../lib/community/announcements-contract';
import { getExploreCapacityMeta, useExploreCapacity } from '../../lib/explore/exploreCapacity';
import { SessionScope } from './session';
import type { Sources } from './sources';

/** A visitor with no account: the persona they chose to try, kept on this device. */
export function ExploreSession({ children }: { readonly children: ReactNode }) {
  const capacity = useExploreCapacity();
  return (
    <SessionScope
      session={{
        surface: 'explore',
        accountId: 'explore-guest',
        displayName: 'Guest Explorer',
        capacity,
        roleLabel: getExploreCapacityMeta(capacity).roleTitle,
      }}
    >
      {children}
    </SessionScope>
  );
}

/** Explore answers every query from sample data on the device; nothing leaves the browser. */
export const exploreSources: Sources = {
  announcements: () => ({
    queryKey: ['explore', 'announcements'],
    queryFn: async () => getExploreSampleAnnouncements(),
  }),
  notifications: () => ({
    queryKey: ['explore', 'notifications'],
    queryFn: async () => notificationFeed('explore'),
  }),
};
