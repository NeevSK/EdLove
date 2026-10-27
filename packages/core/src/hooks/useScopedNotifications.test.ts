import { notification } from '@repo/core/logic/managers/factory';
import type { AppNotification, NotificationStatus } from '@repo/core/types';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { disposeAccountBoundaryQueries } from '../lib/clientStateFoundation';
import {
  acquireScopedNotificationRealtime,
  markAllSampleNotificationsAsRead,
  markSampleNotificationAsRead,
  mergeNotification,
  notificationQueryKeys,
  resolveNotificationQueryScope,
} from './useScopedNotifications';

function notificationFixture(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'notification-1',
    type: 'school.announcement',
    title: 'Announcement',
    body: 'Hello',
    is_read: false,
    created_at: '2026-10-24T00:00:00.000Z',
    ...overrides,
  };
}

describe('scoped notification query admission', () => {
  it('admits only a committed scope for the requested principal', () => {
    expect(resolveNotificationQueryScope('account-a', null)).toBeNull();
    expect(resolveNotificationQueryScope('account-a', { principalId: 'account-b' })).toBeNull();
    expect(resolveNotificationQueryScope(' account-a ', { principalId: 'account-a' })).toEqual({
      principalId: 'account-a',
    });
  });

  it('keeps notifications principal-scoped while workspace changes stay cache-compatible', () => {
    const scope = { principalId: 'account-a' };
    expect(notificationQueryKeys.list(scope)).toEqual([
      'scope',
      'account-a',
      null,
      null,
      null,
      'notifications',
      'list',
      40,
    ]);
  });

  it('removes only the outgoing account notification cache without touching mutations', async () => {
    const client = new QueryClient();
    const accountA = { principalId: 'account-a' };
    const accountB = { principalId: 'account-b' };
    client.setQueryData(notificationQueryKeys.list(accountA), [{ id: 'a-1' }]);
    client.setQueryData(notificationQueryKeys.count(accountA), 1);
    client.setQueryData(notificationQueryKeys.list(accountB), [{ id: 'b-1' }]);
    client.getMutationCache().build(client, { mutationKey: ['outbox', 'account-a'] });

    await disposeAccountBoundaryQueries(client, 'account-a');

    expect(client.getQueryData(notificationQueryKeys.list(accountA))).toBeUndefined();
    expect(client.getQueryData(notificationQueryKeys.count(accountA))).toBeUndefined();
    expect(client.getQueryData(notificationQueryKeys.list(accountB))).toEqual([{ id: 'b-1' }]);
    expect(client.getMutationCache().getAll()).toHaveLength(1);
  });
});

describe('scoped notification realtime coordinator', () => {
  it('shares one subscription, deduplicates INSERT/UPDATE, and ignores callbacks after final release', async () => {
    const client = new QueryClient();
    const scope = { principalId: 'account-a' };
    const listKey = notificationQueryKeys.list(scope);
    const countKey = notificationQueryKeys.count(scope);
    let onInsert: ((notification: AppNotification) => void) | undefined;
    let onUpdate: ((notification: AppNotification) => void) | undefined;
    let onStatus: ((status: NotificationStatus) => void) | undefined;
    const unsubscribe = vi.fn();
    const subscribe = vi
      .spyOn(notification, 'subscribe')
      .mockImplementation((_principal, insert, update, status) => {
        onInsert = insert;
        onUpdate = update;
        onStatus = status;
        return unsubscribe;
      });

    const firstListener = vi.fn();
    const secondListener = vi.fn();
    const releaseFirst = acquireScopedNotificationRealtime(
      client,
      scope,
      listKey,
      countKey,
      firstListener,
    );
    const releaseSecond = acquireScopedNotificationRealtime(
      client,
      scope,
      listKey,
      countKey,
      secondListener,
    );

    expect(subscribe).toHaveBeenCalledTimes(1);
    onStatus?.('CONNECTED');
    await Promise.resolve();
    expect(firstListener).toHaveBeenCalledWith('CONNECTED');
    expect(secondListener).toHaveBeenCalledWith('CONNECTED');

    onInsert?.(notificationFixture());
    onInsert?.(notificationFixture());
    onUpdate?.(notificationFixture({ is_read: true }));
    expect(client.getQueryData<readonly AppNotification[]>(listKey)).toEqual([
      expect.objectContaining({ id: 'notification-1', is_read: true }),
    ]);

    releaseFirst();
    expect(unsubscribe).not.toHaveBeenCalled();
    releaseSecond();
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    onInsert?.(notificationFixture({ id: 'stale-after-account-switch' }));
    expect(client.getQueryData<readonly AppNotification[]>(listKey)).toHaveLength(1);
    subscribe.mockRestore();
  });

  it('keeps the later account cache isolated after releasing the outgoing principal', () => {
    const client = new QueryClient();
    const accountA = { principalId: 'account-a' };
    const accountB = { principalId: 'account-b' };
    const releases: Array<() => void> = [];
    let onInsertA: ((notification: AppNotification) => void) | undefined;
    let onInsertB: ((notification: AppNotification) => void) | undefined;
    const subscribe = vi
      .spyOn(notification, 'subscribe')
      .mockImplementation((principal, insert) => {
        if (principal === 'account-a') onInsertA = insert;
        if (principal === 'account-b') onInsertB = insert;
        return () => undefined;
      });

    releases.push(
      acquireScopedNotificationRealtime(
        client,
        accountA,
        notificationQueryKeys.list(accountA),
        notificationQueryKeys.count(accountA),
        vi.fn(),
      ),
    );
    releases.pop()?.();
    releases.push(
      acquireScopedNotificationRealtime(
        client,
        accountB,
        notificationQueryKeys.list(accountB),
        notificationQueryKeys.count(accountB),
        vi.fn(),
      ),
    );

    onInsertA?.(notificationFixture({ id: 'stale-a' }));
    onInsertB?.(notificationFixture({ id: 'fresh-b' }));
    expect(client.getQueryData(notificationQueryKeys.list(accountA))).toBeUndefined();
    expect(
      client.getQueryData<readonly AppNotification[]>(notificationQueryKeys.list(accountB)),
    ).toEqual([expect.objectContaining({ id: 'fresh-b' })]);

    releases.pop()?.();
    subscribe.mockRestore();
  });
});

describe('realtime event reconciliation', () => {
  it('keeps a duplicate/out-of-order event as one latest notification', () => {
    const unread = notificationFixture();
    const read = notificationFixture({ is_read: true });
    expect(mergeNotification(mergeNotification([unread], read), unread)).toEqual([unread]);
  });
});

describe('local sample notifications', () => {
  it('marks samples locally without a remote principal', () => {
    const original = [
      notificationFixture({ id: 'sample-1' }),
      notificationFixture({ id: 'sample-2' }),
    ];
    const oneRead = markSampleNotificationAsRead(original, 'sample-1');

    expect(oneRead).toEqual([
      expect.objectContaining({ id: 'sample-1', is_read: true }),
      expect.objectContaining({ id: 'sample-2', is_read: false }),
    ]);
    expect(markAllSampleNotificationsAsRead(oneRead)).toEqual([
      expect.objectContaining({ is_read: true }),
      expect.objectContaining({ is_read: true }),
    ]);
  });
});
