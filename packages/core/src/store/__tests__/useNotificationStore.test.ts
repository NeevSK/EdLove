import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import { useNotificationStore } from '../useNotificationStore';

vi.mock('@repo/core/logic/managers/factory', () => ({
  notification: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllRead: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

import { notification } from '@repo/core/logic/managers/factory';

describe('useNotificationStore - Real vs Sample Sovereignty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isRealtimeConnected: false,
      error: null,
      unsubscribeFn: null,
      userId: null,
    });
    useAuthStore.setState({
      isExplorerMode: false,
      user: { id: 'real-user-1', email: 'real@sanctuary.lk' } as any,
    });
  });

  afterEach(() => {
    useNotificationStore.getState().unsubscribe();
  });

  it('populates real notifications when available from database', async () => {
    const realNotifs = [
      {
        id: 'notif-101',
        type: 'grade.published',
        title: 'Grade 10B Midterm Result',
        body: 'Science grades have been published',
        is_read: false,
        reference_id: 'grade-1',
        reference_type: 'grade',
        created_at: '2026-10-17T05:00:00Z',
      },
    ];
    vi.mocked(notification.getNotifications).mockResolvedValue(realNotifs as any);
    vi.mocked(notification.getUnreadCount).mockResolvedValue(1);

    useNotificationStore.getState().setUserId('real-user-1');
    await useNotificationStore.getState().loadNotifications();

    const state = useNotificationStore.getState();
    expect(state.notifications).toEqual(realNotifs);
    expect(state.unreadCount).toBe(1);
    expect(notification.getNotifications).toHaveBeenCalledWith('real-user-1');
  });

  it('falls back to sample notifications when empty and explorer mode is enabled', async () => {
    useAuthStore.setState({ isExplorerMode: true });
    vi.mocked(notification.getNotifications).mockResolvedValue([]);
    vi.mocked(notification.getUnreadCount).mockResolvedValue(0);

    useNotificationStore.getState().setUserId('explorer-user-1');
    await useNotificationStore.getState().loadNotifications();

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBeGreaterThan(0);
    expect(state.notifications[0]?.id).toMatch(/^sample-notif-/);
  });

  it('marks sample notification as read in-memory without calling database port', async () => {
    useAuthStore.setState({ isExplorerMode: true });
    vi.mocked(notification.getNotifications).mockResolvedValue([]);
    vi.mocked(notification.getUnreadCount).mockResolvedValue(0);

    useNotificationStore.getState().setUserId('explorer-user-1');
    await useNotificationStore.getState().loadNotifications();

    const initialUnread = useNotificationStore.getState().unreadCount;
    expect(initialUnread).toBeGreaterThan(0);

    const firstUnread = useNotificationStore.getState().notifications.find((n) => !n.is_read);
    expect(firstUnread).toBeDefined();

    await useNotificationStore.getState().markAsRead(firstUnread!.id);

    const updated = useNotificationStore
      .getState()
      .notifications.find((n) => n.id === firstUnread!.id);
    expect(updated?.is_read).toBe(true);
    expect(useNotificationStore.getState().unreadCount).toBe(initialUnread - 1);
    // Crucial check: zero Supabase database writes for sample data
    expect(notification.markAsRead).not.toHaveBeenCalled();
  });

  it('calls database port when marking a real notification as read', async () => {
    const realNotif = {
      id: 'real-notif-77',
      type: 'announcement',
      title: 'School Closure',
      body: 'Campus maintenance on Saturday',
      is_read: false,
      reference_id: null,
      reference_type: null,
      created_at: '2026-10-17T06:00:00Z',
    };
    vi.mocked(notification.getNotifications).mockResolvedValue([realNotif] as any);
    vi.mocked(notification.getUnreadCount).mockResolvedValue(1);
    vi.mocked(notification.markAsRead).mockResolvedValue(undefined);

    useNotificationStore.getState().setUserId('real-user-1');
    await useNotificationStore.getState().loadNotifications();

    await useNotificationStore.getState().markAsRead('real-notif-77');

    expect(notification.markAsRead).toHaveBeenCalledWith('real-user-1', 'real-notif-77');
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications[0]?.is_read).toBe(true);
  });
});
