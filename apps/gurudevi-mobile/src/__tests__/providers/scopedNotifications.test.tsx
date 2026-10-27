import { useScopedNotifications } from '@repo/core/hooks/useScopedNotifications';
import type { AppNotification } from '@repo/core/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  auth: { isExplorerMode: false, user: { is_anonymous: false } },
  scope: { snapshot: { principalId: 'account-a' }, isTransitioning: false },
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
}));
vi.mock('@repo/core/api/social', () => ({ socialAPI: fixture }));
vi.mock('@repo/core/logic/managers/factory', () => ({ notification: fixture }));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (select: (value: typeof fixture.auth) => unknown) => select(fixture.auth),
}));
vi.mock('@repo/core/lib/experienceState', () => ({
  useExperienceState: (select: (value: typeof fixture.auth) => unknown) => select(fixture.auth),
}));
vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: (select: (value: typeof fixture.scope) => unknown) => select(fixture.scope),
}));

const realNotification: AppNotification = {
  id: 'real-notification',
  type: 'school.announcement',
  title: 'School closure',
  body: 'Maintenance',
  is_read: false,
  reference_id: null,
  reference_type: null,
  created_at: '2026-10-26T00:00:00Z',
};
let client: QueryClient;
function mount(principalId: string | null = 'account-a') {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(({ principal }) => useScopedNotifications(principal), {
    wrapper,
    initialProps: { principal: principalId },
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  fixture.auth.isExplorerMode = false;
  fixture.auth.user.is_anonymous = false;
  fixture.scope.snapshot.principalId = 'account-a';
  fixture.scope.isTransitioning = false;
  fixture.getNotifications.mockReset().mockResolvedValue([realNotification]);
  fixture.getUnreadNotificationCount.mockReset().mockResolvedValue(1);
  fixture.markNotificationRead.mockReset().mockResolvedValue(undefined);
  fixture.markAllNotificationsRead.mockReset().mockResolvedValue(undefined);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
});

describe('mounted notification behavior parity', () => {
  it('shares sample read state across header/screen observers without leaking into another account', async () => {
    fixture.auth.isExplorerMode = true;
    fixture.getNotifications.mockResolvedValue([]);
    const header = mount();
    const screen = mount();
    await waitFor(() => expect(screen.result.current.notifications[0]?.id).toMatch(/^sample-/));
    const first = screen.result.current.notifications.find((item) => !item.is_read)!;
    const unread = screen.result.current.unreadCount;
    await act(async () => {
      await screen.result.current.markAsRead(first.id);
    });
    await waitFor(() => expect(header.result.current.unreadCount).toBe(unread - 1));
    fixture.scope.snapshot.principalId = 'account-b';
    screen.rerender({ principal: 'account-b' });
    await waitFor(() => expect(screen.result.current.notifications[0]?.id).toMatch(/^sample-/));
    expect(screen.result.current.unreadCount).toBe(unread);
    expect(screen.result.current.notifications.find((item) => item.id === first.id)?.is_read).toBe(
      false,
    );
  });

  it('keeps an admitted explorer in loading state until the real read settles', async () => {
    fixture.auth.isExplorerMode = true;
    let resolveRead!: (items: AppNotification[]) => void;
    fixture.getNotifications.mockReturnValue(
      new Promise<AppNotification[]>((resolve) => {
        resolveRead = resolve;
      }),
    );
    const view = mount();
    expect(view.result.current.isLoading).toBe(true);
    expect(view.result.current.notifications).toEqual([]);
    await act(async () => {
      resolveRead([]);
    });
    await waitFor(() => expect(view.result.current.notifications[0]?.id).toMatch(/^sample-/));
  });

  it('does not replace a real account empty inbox with samples', async () => {
    fixture.getNotifications.mockResolvedValue([]);
    fixture.getUnreadNotificationCount.mockResolvedValue(0);
    const view = mount();
    await waitFor(() => expect(view.result.current.isLoading).toBe(false));
    expect(view.result.current.notifications).toEqual([]);
    expect(view.result.current.error).toBeNull();
  });

  it('does not publish an outgoing account response into the replacement inbox', async () => {
    let resolveOldRead!: (items: AppNotification[]) => void;
    fixture.getNotifications.mockReturnValueOnce(
      new Promise<AppNotification[]>((resolve) => {
        resolveOldRead = resolve;
      }),
    );
    const view = mount();
    fixture.scope.snapshot.principalId = 'account-b';
    const replacement = { ...realNotification, id: 'account-b-notification' };
    fixture.getNotifications.mockResolvedValue([replacement]);
    view.rerender({ principal: 'account-b' });
    await waitFor(() => expect(view.result.current.notifications).toEqual([replacement]));
    await act(async () => {
      resolveOldRead([realNotification]);
    });
    expect(view.result.current.notifications).toEqual([replacement]);
  });

  it.each(['explorer', 'guest'] as const)(
    'prefers real data for an admitted %s principal',
    async (mode) => {
      fixture.auth.isExplorerMode = mode === 'explorer';
      fixture.auth.user.is_anonymous = mode === 'guest';
      const view = mount();
      await waitFor(() => expect(view.result.current.notifications).toEqual([realNotification]));
      expect(view.result.current.unreadCount).toBe(1);
      expect(fixture.getNotifications).toHaveBeenCalledOnce();
    },
  );

  it.each(['empty', 'failed'] as const)(
    'falls back to samples after an explorer read is %s',
    async (outcome) => {
      fixture.auth.isExplorerMode = true;
      if (outcome === 'empty') fixture.getNotifications.mockResolvedValue([]);
      else fixture.getNotifications.mockRejectedValue(new Error('offline'));
      const view = mount();
      await waitFor(() => expect(fixture.getNotifications).toHaveBeenCalledOnce());
      await waitFor(() => expect(view.result.current.notifications[0]?.id).toMatch(/^sample-/));
      const first = view.result.current.notifications.find((item) => !item.is_read)!;
      const unread = view.result.current.unreadCount;
      await act(async () => {
        await view.result.current.markAsRead(first.id);
      });
      await waitFor(() =>
        expect(
          view.result.current.notifications.find((item) => item.id === first.id)?.is_read,
        ).toBe(true),
      );
      expect(view.result.current.unreadCount).toBe(unread - 1);
      await act(async () => {
        await view.result.current.markAllRead();
      });
      await waitFor(() => expect(view.result.current.unreadCount).toBe(0));
      expect(fixture.markNotificationRead).not.toHaveBeenCalled();
      expect(fixture.markAllNotificationsRead).not.toHaveBeenCalled();
    },
  );

  it('dispatches real read mutations and refreshes the visible result after confirmation', async () => {
    const view = mount();
    await waitFor(() => expect(view.result.current.notifications).toEqual([realNotification]));
    fixture.getNotifications.mockResolvedValue([{ ...realNotification, is_read: true }]);
    fixture.getUnreadNotificationCount.mockResolvedValue(0);
    await act(async () => {
      await view.result.current.markAsRead(realNotification.id);
    });
    await waitFor(() => expect(view.result.current.unreadCount).toBe(0));
    expect(fixture.markNotificationRead).toHaveBeenCalledWith(realNotification.id);
    expect(view.result.current.notifications[0]?.is_read).toBe(true);
    await act(async () => {
      await view.result.current.markAllRead();
    });
    expect(fixture.markAllNotificationsRead).toHaveBeenCalledOnce();
  });

  it('keeps real content and exposes an error when refresh or a read mutation fails', async () => {
    fixture.auth.isExplorerMode = true;
    const view = mount();
    await waitFor(() => expect(view.result.current.notifications).toEqual([realNotification]));
    fixture.getNotifications.mockRejectedValue(new Error('refresh failed'));
    act(() => view.result.current.refresh());
    await waitFor(() => expect(view.result.current.error).toBe('refresh failed'));
    expect(view.result.current.notifications).toEqual([realNotification]);
    fixture.markNotificationRead.mockRejectedValue(new Error('write denied'));
    await act(async () => {
      await expect(view.result.current.markAsRead(realNotification.id)).rejects.toThrow(
        'write denied',
      );
    });
    expect(view.result.current.notifications[0]?.is_read).toBe(false);
  });

  it('offers local samples without an account but denies real reads during a mismatching scope', async () => {
    fixture.auth.isExplorerMode = true;
    const view = mount(null);
    expect(view.result.current.notifications[0]?.id).toMatch(/^sample-/);
    expect(fixture.getNotifications).not.toHaveBeenCalled();
    view.rerender({ principal: 'account-b' });
    expect(view.result.current.notifications).toEqual([]);
    expect(view.result.current.error).toContain('scope is ready');
    expect(fixture.getNotifications).not.toHaveBeenCalled();
  });
});
