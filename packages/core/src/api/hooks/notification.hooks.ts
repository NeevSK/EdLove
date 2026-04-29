import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { supabase } from '../../native/supabase';
import { useStore } from '../../store/useStore';
import type { Notification } from '../../types/Community';
import { communityAPI } from '../community';

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
    queryFn: () => communityAPI.getNotifications(40),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Unread badge count
  const countQuery = useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: communityAPI.getUnreadNotificationCount,
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Real-time subscription
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
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
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
          queryClient.invalidateQueries({ queryKey: notificationKeys.count(userId) });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (notifId: string) => communityAPI.markNotificationRead(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: communityAPI.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return {
    notifications: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    unreadCount: countQuery.data ?? 0,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
  };
}
