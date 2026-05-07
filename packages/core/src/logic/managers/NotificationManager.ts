import { INotificationPort } from '../ports/notification.port';
import { AppNotification } from '../../hooks/useNotifications';

/**
 * NotificationManager: The Domain Orchestrator for Notifications.
 * This class provides a clean, platform-agnostic API for the application
 * to interact with notifications, regardless of the underlying transport.
 */
export class NotificationManager implements INotificationPort {
  constructor(private adapter: INotificationPort) {}

  async getNotifications(userId: string, limit?: number): Promise<AppNotification[]> {
    return this.adapter.getNotifications(userId, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.adapter.getUnreadCount(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    return this.adapter.markAsRead(userId, notificationId);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.adapter.markAllRead(userId);
  }

  subscribe(
    userId: string,
    onInsert: (notification: AppNotification) => void,
    onUpdate: (notification: AppNotification) => void,
    onStatusChange: (status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR') => void
  ): () => void {
    return this.adapter.subscribe(userId, onInsert, onUpdate, onStatusChange);
  }
}
