import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { realtime } from '../../logic/managers/factory';
import { useStore } from '../../store/useStore';
import type { Notification } from '../../types/Community';
import { socialAPI } from '../social';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string | undefined) => [...notificationKeys.all, userId, 'list'] as const,
  count: (userId: string | undefined) => [...notificationKeys.all, userId, 'unread-count'] as const,
};

/**
 * Hook for managing real-time notifications, promoted to @repo/core.
 */
export function useNotificationHooks() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.user?.id);

  // Fetch list
  const { data: notificationsData, isLoading: isListLoading } = useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => socialAPI.getNotifications(40),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Unread badge count
  const { data: countData } = useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: socialAPI.getUnreadNotificationCount,
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = realtime.subscribe<Notification>(
      `notifications-${userId}-${Math.random().toString(36).slice(2, 9)}`,
      {
        event: 'INSERT',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        queryClient.setQueryData<Notification[]>(notificationKeys.list(userId), (prev) => [
          payload.new as Notification,
          ...(prev ?? []),
        ]);
        queryClient.setQueryData<number>(notificationKeys.count(userId), (prev) => (prev ?? 0) + 1);
      },
    );

    return () => {
      void subscription.unsubscribe().catch((error) => {
        console.error(
          '[notifications] Failed to unsubscribe realtime subscription; a stale channel may remain active until the next reconnect.',
          error,
        );
      });
    };
  }, [userId, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (notifId: string) => socialAPI.markNotificationRead(notifId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: socialAPI.markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return useMemo(
    () => ({
      notifications: notificationsData ?? [],
      isLoading: isListLoading,
      unreadCount: countData ?? 0,
      markRead: markReadMutation.mutateAsync,
      markAllRead: markAllReadMutation.mutateAsync,
      isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
    }),
    [
      notificationsData,
      isListLoading,
      countData,
      markReadMutation.mutateAsync,
      markAllReadMutation.mutateAsync,
      markReadMutation.isPending,
      markAllReadMutation.isPending,
    ],
  );
}
