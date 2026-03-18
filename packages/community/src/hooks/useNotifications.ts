/**
 * useNotifications — Real-time notification feed for the current user.
 *
 * Provides: fetching, unread count badge, mark-as-read, real-time subscription.
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, useStore } from '@repo/core';
import { communityAPI } from '../api/community';
import type { Notification } from '../types/Community';

const NOTIF_KEYS = {
    all:   ['notifications'] as const,
    list:  (userId: string | undefined) => [...NOTIF_KEYS.all, userId, 'list'] as const,
    count: (userId: string | undefined) => [...NOTIF_KEYS.all, userId, 'unread-count'] as const,
};

export function useNotifications() {
    const queryClient = useQueryClient();
    const userId = useStore(state => state.user?.id);

    // ── Fetch list ─────────────────────────────────────────────────────────
    const listQuery = useQuery({
        queryKey: NOTIF_KEYS.list(userId),
        queryFn: () => communityAPI.getNotifications(40),
        enabled: !!userId,
        staleTime: 60_000,
    });

    // ── Unread badge count ─────────────────────────────────────────────────
    const countQuery = useQuery({
        queryKey: NOTIF_KEYS.count(userId),
        queryFn: communityAPI.getUnreadNotificationCount,
        enabled: !!userId,
        staleTime: 30_000,
        refetchInterval: 60_000,   // poll every 60 s as fallback
    });

    // ── Real-time subscription ─────────────────────────────────────────────
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
                    // Prepend new notification optimistically
                    queryClient.setQueryData<Notification[]>(NOTIF_KEYS.list(userId), prev =>
                        [payload.new as Notification, ...(prev ?? [])],
                    );
                    // Bump badge count
                    queryClient.setQueryData<number>(NOTIF_KEYS.count(userId), prev => (prev ?? 0) + 1);
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
                    queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.list(userId) });
                    queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.count(userId) });
                },
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, queryClient]);

    // ── Mark single as read ────────────────────────────────────────────────
    const markReadMutation = useMutation({
        mutationFn: (notifId: string) => communityAPI.markNotificationRead(notifId),
        onMutate: async (notifId) => {
            await queryClient.cancelQueries({ queryKey: NOTIF_KEYS.list(userId) });
            const previous = queryClient.getQueryData<Notification[]>(NOTIF_KEYS.list(userId));

            queryClient.setQueryData<Notification[]>(NOTIF_KEYS.list(userId), prev =>
                (prev ?? []).map(n =>
                    n.id === notifId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n,
                ),
            );
            // Decrement badge
            queryClient.setQueryData<number>(
                NOTIF_KEYS.count(userId),
                prev => Math.max(0, (prev ?? 1) - 1),
            );

            return { previous };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(NOTIF_KEYS.list(userId), context.previous);
                queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.count(userId) });
            }
        },
    });

    // ── Mark all as read ───────────────────────────────────────────────────
    const markAllReadMutation = useMutation({
        mutationFn: communityAPI.markAllNotificationsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: NOTIF_KEYS.list(userId) });
            const previous = queryClient.getQueryData<Notification[]>(NOTIF_KEYS.list(userId));
            const now = new Date().toISOString();

            queryClient.setQueryData<Notification[]>(NOTIF_KEYS.list(userId), prev =>
                (prev ?? []).map(n => ({ ...n, is_read: true, read_at: now })),
            );
            queryClient.setQueryData<number>(NOTIF_KEYS.count(userId), 0);

            return { previous };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(NOTIF_KEYS.list(userId), context.previous);
                queryClient.invalidateQueries({ queryKey: NOTIF_KEYS.count(userId) });
            }
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
