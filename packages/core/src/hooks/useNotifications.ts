/**
 * useNotifications  Real notification data for NotificationDrawer.
 *
 * This hook is now a facade for the centralized NotificationStore.
 * It manages the connection lifecycle automatically based on the userId.
 */

import { useEffect, useMemo } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

import type { AppNotification } from '../types';


// Types now provided by @repo/core/types


export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => void;
}

export function useNotifications(userId: string | null | undefined): UseNotificationsResult {
  const {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
    loadNotifications,
    setUserId,
  } = useNotificationStore();

  useEffect(() => {
    setUserId(userId || null);
  }, [userId, setUserId]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isRealtimeConnected,
      error,
      markAsRead,
      markAllRead,
      refresh: loadNotifications,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      isRealtimeConnected,
      error,
      markAsRead,
      markAllRead,
      loadNotifications,
    ],
  );
}
