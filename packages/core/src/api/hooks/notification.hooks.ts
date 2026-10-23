import { orpc } from '@repo/core/api/orpcClient';
import { socialAPI } from '@repo/core/api/social';
import { realtime } from '@repo/core/logic/managers/factory';
import { useStore } from '@repo/core/store/useStore';
import type { Notification } from '@repo/core/types/Community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string | undefined) => [...notificationKeys.all, userId, 'list'] as const,
  count: (userId: string | undefined) => [...notificationKeys.all, userId, 'unread-count'] as const,
};

/**
 * Hook for managing real-time notifications, promoted to @repo/core.
 * Backed by typed oRPC v2 contracts with deterministic cache keys.
 */
export function useNotificationHooks() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.user?.id);

  // Fetch list via typed oRPC v2 queryOptions
  const { data: notificationsData, isLoading: isListLoading } = useQuery({
    ...orpc.social.getNotifications.queryOptions({
      input: { query: { limit: 40 } },
    }),
    select: (notifications) =>
      (notifications as any[]).map((notification: any) => ({
        ...notification,
        body: notification.message,
      })),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // Unread badge count via typed oRPC v2 queryOptions
  const { data: countData } = useQuery<number>({
    ...orpc.social.getUnreadNotificationCount.queryOptions(),
    select: (res: any) => Number(res ?? 0),
    enabled: Boolean(userId),
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
        queryClient.setQueryData<Notification[]>(
          orpc.social.getNotifications.queryKey({ input: { query: { limit: 40 } } }),
          (prev) => [payload.new as Notification, ...(prev ?? [])],
        );
        queryClient.setQueryData<number>(
          orpc.social.getUnreadNotificationCount.queryKey(),
          (prev) => (prev ?? 0) + 1,
        );
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orpc.social.getNotifications.key() }),
        queryClient.invalidateQueries({ queryKey: orpc.social.getUnreadNotificationCount.key() }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
      ]);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: socialAPI.markAllNotificationsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orpc.social.getNotifications.key() }),
        queryClient.invalidateQueries({ queryKey: orpc.social.getUnreadNotificationCount.key() }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
      ]);
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
