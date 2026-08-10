import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type { INotificationPort } from '@repo/core/logic/ports/notification.port';
import type { AppNotification, NotificationStatus } from '@repo/core/types';

/**
 * SupabaseNotificationAdapter: Implementation of INotificationPort using Supabase.
 */
export class SupabaseNotificationAdapter implements INotificationPort {
  async getNotifications(userId: string, limit: number = 20): Promise<AppNotification[]> {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('id, type, title, body, is_read, reference_id, reference_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AppNotification[];
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata: any = {},
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('notifications')
      .insert([{ user_id: userId, type, title, body: message, metadata }]);

    if (error) throw error;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  subscribe(
    userId: string,
    onInsert: (notification: AppNotification) => void,
    onUpdate: (notification: AppNotification) => void,
    onStatusChange: (status: NotificationStatus) => void,
  ): () => void {
    const channel = supabaseClient
      .channel(`notifications:global:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onInsert(payload.new as AppNotification),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onUpdate(payload.new as AppNotification),
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') onStatusChange('CONNECTED');
        if (status === 'CLOSED') onStatusChange('DISCONNECTED');
        if (status === 'CHANNEL_ERROR') onStatusChange('ERROR');
      });

    return () => {
      supabaseClient.removeChannel(channel).catch(() => {});
    };
  }
}
