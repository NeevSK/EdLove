import { AppNotification } from '../../hooks/useNotifications';

/**
 * INotificationPort: The Sovereign Notification Interface.
 * Decouples the application logic from the underlying notification transport (Supabase, WebSockets, Firebase, etc.).
 */
export interface INotificationPort {
  /**
   * Fetches the initial batch of notifications for a user.
   */
  getNotifications(userId: string, limit?: number): Promise<AppNotification[]>;

  /**
   * Resolves the unread count for a user.
   */
  getUnreadCount(userId: string): Promise<number>;

  /**
   * Marks a specific notification as read.
   */
  markAsRead(userId: string, notificationId: string): Promise<void>;

  /**
   * Marks all notifications for a user as read.
   */
  markAllRead(userId: string): Promise<void>;

  /**
   * Subscribes to real-time notification changes.
   * Returns a cleanup function.
   */
  subscribe(
    userId: string,
    onInsert: (notification: AppNotification) => void,
    onUpdate: (notification: AppNotification) => void,
    onStatusChange: (status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR') => void
  ): () => void;
}
