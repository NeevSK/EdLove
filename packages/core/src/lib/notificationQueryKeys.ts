import { type QueryScope, scopedQueryKey } from '@repo/core/lib/clientStateFoundation';

/** Notifications are principal-owned; workspace lenses never partition an inbox. */
export const NOTIFICATION_LIST_LIMIT = 40;

export const notificationQueryKeys = {
  all: (scope: QueryScope) => scopedQueryKey(scope, ['notifications'] as const),
  list: (scope: QueryScope) =>
    scopedQueryKey(scope, ['notifications', 'list', NOTIFICATION_LIST_LIMIT] as const),
  count: (scope: QueryScope) => scopedQueryKey(scope, ['notifications', 'unread-count'] as const),
  samples: (scope: QueryScope) => scopedQueryKey(scope, ['notifications', 'samples'] as const),
};
