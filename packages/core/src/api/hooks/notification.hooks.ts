import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { Notification } from '../../types/Community';
import { socialAPI } from '../social';
import { supabase } from '../supabase';

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
  const listQuery = useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => socialAPI.getNotifications(40),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Unread badge count
  const countQuery = useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: socialAPI.getUnreadNotificationCount,
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          queryClient.setQueryData<Notification[]>(notificationKeys.list(userId), (prev) => [
            payload.new as Notification,
            ...(prev ?? []),
          ]);
          queryClient.setQueryData<number>(
            notificationKeys.count(userId),
            (prev) => (prev ?? 0) + 1,
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: notificationKeys.list(userId),
            }),
            queryClient.invalidateQueries({
              queryKey: notificationKeys.count(userId),
            }),
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch((e) => {
        console.error('Notifications: Failed to remove channel during cleanup', e);
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
      notifications: listQuery.data ?? [],
      isLoading: listQuery.isLoading,
      unreadCount: countQuery.data ?? 0,
      markRead: markReadMutation.mutateAsync,
      markAllRead: markAllReadMutation.mutateAsync,
      isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
    }),
    [
      listQuery.data,
      listQuery.isLoading,
      countQuery.data,
      markReadMutation.mutateAsync,
      markAllReadMutation.mutateAsync,
      markReadMutation.isPending,
      markAllReadMutation.isPending,
    ],
  );
}
