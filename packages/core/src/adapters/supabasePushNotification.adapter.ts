import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import type { IPushNotificationPort } from '../logic/ports/pushNotification.port';
import { APIError } from '../types/API';

/**
 * SupabasePushNotificationAdapter: Handles push token registration via Supabase.
 */
export class SupabasePushNotificationAdapter implements IPushNotificationPort {
  async registerPushToken(
    userId: string,
    token: string,
    deviceId: string,
    platform: string,
  ): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_push_tokens')
      .upsert(
        {
          user_id: userId,
          push_token: token,
          device_id: deviceId,
          platform,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'device_id',
        },
      );

    if (error) {
      throw new APIError('Failed to register push token', error.code, error);
    }
  }

  async unregisterPushToken(userId: string, deviceId: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_push_tokens')
      .delete()
      .eq('device_id', deviceId);

    if (error) {
      throw new APIError('Failed to unregister push token', error.code, error);
    }
  }
}
