import { MOCK_NOTIFICATIONS } from '@repo/core/api/mockData';
import { notification } from '@repo/core/logic/managers/factory';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { AppNotification } from '@repo/core/types';
import { create } from 'zustand';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  error: string | null;
  unsubscribeFn: (() => void) | null;
  userId: string | null;

  // Actions
  setUserId: (userId: string | null) => void;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRealtimeConnected: false,
  error: null,
  unsubscribeFn: null,
  userId: null,

  setUserId: (userId) => {
    const currentUserId = get().userId;
    if (userId === currentUserId) return;

    // Cleanup if switching users
    get().unsubscribe();

    set({ userId, notifications: [], unreadCount: 0, error: null });

    if (userId) {
      void get().loadNotifications();
      get().subscribe();
    }
  },

  loadNotifications: async () => {
    const { userId } = get();
    const { isExplorerMode, user } = useAuthStore.getState();
    const isGuest = (user as any)?.is_anonymous ?? false;
    const shouldProvideSamples = isExplorerMode || isGuest;

    if (!userId) {
      if (shouldProvideSamples) {
        set({
          notifications: MOCK_NOTIFICATIONS,
          unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
          isLoading: false,
        });
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [notifs, count] = await Promise.all([
        notification.getNotifications(userId),
        notification.getUnreadCount(userId),
      ]);

      if (notifs.length > 0) {
        set({
          notifications: notifs,
          unreadCount: count,
          isLoading: false,
        });
      } else if (shouldProvideSamples) {
        set({
          notifications: MOCK_NOTIFICATIONS,
          unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
          isLoading: false,
        });
      } else {
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
        });
      }
    } catch (err: any) {
      if (shouldProvideSamples) {
        set({
          notifications: MOCK_NOTIFICATIONS,
          unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
          isLoading: false,
        });
      } else {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  markAsRead: async (id) => {
    const { userId, notifications } = get();

    if (id.startsWith('sample-') || id.startsWith('mock-')) {
      set({
        notifications: notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
      return;
    }

    if (!userId) return;

    try {
      await notification.markAsRead(userId, id);

      set({
        notifications: notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markAllRead: async () => {
    const { userId, notifications } = get();

    const hasOnlySamples = notifications.every(
      (n) => n.id.startsWith('sample-') || n.id.startsWith('mock-'),
    );
    if (hasOnlySamples) {
      set({
        notifications: notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      });
      return;
    }

    if (!userId) return;

    try {
      await notification.markAllRead(userId);

      set({
        notifications: notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  subscribe: () => {
    const { userId, unsubscribeFn } = get();
    if (!userId || unsubscribeFn) return;

    const cleanup = notification.subscribe(
      userId,
      (incoming) => {
        set((state) => ({
          notifications: [incoming, ...state.notifications].slice(0, 20),
          unreadCount: incoming.is_read ? state.unreadCount : state.unreadCount + 1,
        }));
      },
      (updated) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === updated.id ? { ...n, is_read: updated.is_read } : n,
          ),
        }));
        if (updated.is_read) {
          void get().loadNotifications();
        }
      },
      (status) => {
        set({ isRealtimeConnected: status === 'CONNECTED' });
        if (status === 'ERROR') {
          set({ error: 'Realtime synchronization failed' });
        }
      },
    );

    set({ unsubscribeFn: cleanup });
  },

  unsubscribe: () => {
    const { unsubscribeFn } = get();
    if (unsubscribeFn) {
      unsubscribeFn();
      set({ unsubscribeFn: null, isRealtimeConnected: false });
    }
  },
}));
