import { IdentityManager } from './IdentityManager';
import { SupabaseIdentityAdapter } from '../../adapters/supabaseIdentity.adapter';
import { NotificationManager } from './NotificationManager';
import { SupabaseNotificationAdapter } from '../../adapters/supabaseNotification.adapter';
import { DeviceSecurityManager } from './DeviceSecurityManager';
import { SupabaseDeviceSecurityAdapter } from '../../adapters/supabaseDeviceSecurity.adapter';

/**
 * identity: The Global Sovereign Identity Instance.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());

/**
 * notification: The Global Sovereign Notification Instance.
 */
export const notification = new NotificationManager(new SupabaseNotificationAdapter());

/**
 * deviceSecurity: The Global Sovereign Device Security Instance.
 */
export const deviceSecurity = new DeviceSecurityManager(new SupabaseDeviceSecurityAdapter());
