import type { NotificationItem } from '../../app/(sanctuary)/notifications/notificationFeed';
import type { CommunityAnnouncement } from '../../lib/community/announcements-contract';
import type { CommunityGroupsResult } from '../../lib/community/groups';

/** A query a screen can run, whatever answers it: local sample data on Explore, the v1 API on sanctuary. */
export interface Source<T> {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<T>;
}

/** Every data source a screen reads. Each surface supplies one implementation of this set. */
export interface Sources {
  readonly announcements: () => Source<readonly CommunityAnnouncement[]>;
  readonly notifications: () => Source<readonly NotificationItem[]>;
  readonly communityGroups: () => Source<CommunityGroupsResult>;
}

/**
 * Where accounts are: this app, or another origin. Explore has no accounts, so signing in,
 * recovering an account and finishing an email link happen on sanctuary.
 */
export type AccountHome =
  | { readonly kind: 'here' }
  | { readonly kind: 'elsewhere'; readonly origin: string };
