import { SupabaseNotificationAdapter } from '@/adapters/supabaseNotification.adapter';
import { SupabasePushNotificationAdapter } from '@/adapters/supabasePushNotification.adapter';
import { coreRuntime } from '@/logic/runtimeRegistry';
import { deepLink } from '@/logic/managers/misc.factory';
import { NotificationManager } from '@/logic/managers/NotificationManager';
import { PushNotificationManager } from '@/logic/managers/PushNotificationManager';

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
