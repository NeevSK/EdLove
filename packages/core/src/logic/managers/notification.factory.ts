import { NotificationManager } from './NotificationManager';
import { SupabaseNotificationAdapter } from '../../adapters/supabaseNotification.adapter';
import { PushNotificationManager } from './PushNotificationManager';
import { SupabasePushNotificationAdapter } from '../../adapters/supabasePushNotification.adapter';
import { coreRuntime } from '../runtimeRegistry';
import { deepLink } from './misc.factory';

/**
 * notification: The Global Sovereign Notification Instance.
 */
export const notification = new NotificationManager(new SupabaseNotificationAdapter());

/**
 * pushNotification: The Global Sovereign Push Notification Instance.
 */
export const pushNotification = new PushNotificationManager(
  coreRuntime as any,
  new SupabasePushNotificationAdapter(),
  deepLink,
);

