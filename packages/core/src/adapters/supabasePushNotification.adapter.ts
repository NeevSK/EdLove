import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type { IPushNotificationPort } from '@repo/core/logic/ports/pushNotification.port';
import { APIError } from '@repo/core/types/API';

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
    const { error } = await supabaseClient.from('user_push_tokens').upsert(
      {
        user_id: userId,
        push_token: token,
        device_id: deviceId,
        platform,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      },
    );

    if (error) {
      throw new APIError('Failed to register push token', error.code, error);
    }
  }

  async unregisterPushToken(_userId: string, deviceId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('user_push_tokens')
      .delete()
      .eq('user_id', _userId)
      .eq('device_id', deviceId);

    if (error) {
      throw new APIError('Failed to unregister push token', error.code, error);
    }
  }
}
