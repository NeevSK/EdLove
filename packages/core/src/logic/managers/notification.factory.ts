import { SupabaseNotificationAdapter } from '@repo/core/adapters/supabaseNotification.adapter';
import { SupabasePushNotificationAdapter } from '@repo/core/adapters/supabasePushNotification.adapter';
import { deepLink } from '@repo/core/logic/managers/misc.factory';
import { NotificationManager } from '@repo/core/logic/managers/NotificationManager';
import { PushNotificationManager } from '@repo/core/logic/managers/PushNotificationManager';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';

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
