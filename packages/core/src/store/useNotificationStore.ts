import { create } from 'zustand';
import { notification } from '../logic/managers/factory';
import type { AppNotification } from '../hooks/useNotifications';

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
      get().loadNotifications();
      get().subscribe();
    }
  },

  loadNotifications: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const [notifs, count] = await Promise.all([
        notification.getNotifications(userId),
        notification.getUnreadCount(userId)
      ]);

      set({ 
        notifications: notifs, 
        unreadCount: count,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const { userId, notifications } = get();
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
            n.id === updated.id ? { ...n, is_read: updated.is_read } : n
          ),
        }));
        if (updated.is_read) {
          get().loadNotifications();
        }
      },
      (status) => {
        set({ isRealtimeConnected: status === 'CONNECTED' });
        if (status === 'ERROR') {
          set({ error: 'Realtime synchronization failed' });
        }
      }
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
