import { AppNotification, NotificationStatus } from '../../types';


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
   * Creates a notification for a user.
   */
  createNotification(userId: string, type: string, title: string, message: string, metadata?: any): Promise<void>;


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
    onStatusChange: (status: NotificationStatus) => void
  ): () => void;
}
