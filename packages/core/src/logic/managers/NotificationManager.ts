import type { INotificationPort } from '@repo/core/logic/ports/notification.port';
import type { AppNotification, NotificationStatus } from '@repo/core/types';

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

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any,
  ): Promise<void> {
    return this.adapter.createNotification(userId, type, title, message, metadata);
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
    onStatusChange: (status: NotificationStatus) => void,
  ): () => void {
    return this.adapter.subscribe(userId, onInsert, onUpdate, onStatusChange);
  }
}
