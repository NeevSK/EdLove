import { supabaseNotificationAdapter } from '@repo/core/adapters/supabaseNotification.adapter';
import type { INotificationPort } from '@repo/core/logic/ports/notification.port';

/** The account's notifications: list, unread count, mark as read, live updates. */
export const notifications: INotificationPort = supabaseNotificationAdapter;
