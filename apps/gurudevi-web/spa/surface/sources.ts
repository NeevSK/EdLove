import type { NotificationItem } from '../../app/(sanctuary)/notifications/notificationFeed';
import type { CommunityAnnouncement } from '../../lib/community/announcements-contract';

/** A query a screen can run, whatever answers it: local sample data on Explore, the v1 API on sanctuary. */
export interface Source<T> {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<T>;
}

/** Every data source a screen reads. Each surface supplies one implementation of this set. */
export interface Sources {
  readonly announcements: () => Source<readonly CommunityAnnouncement[]>;
  readonly notifications: () => Source<readonly NotificationItem[]>;
}
