import type { CoreRuntimeEnvironment, PushNotificationProvider } from '@/types/runtime';
import type { IPushNotificationPort } from '@/logic/ports/pushNotification.port';

import type { DeepLinkManager } from '@/logic/managers/DeepLinkManager';

/**
 * PushNotificationManager: Orchestrates native push notifications.
 * Bridges the gap between native hardware tokens and sovereign identity.
 */
export class PushNotificationManager {
  constructor(
    private coreRuntime: CoreRuntimeEnvironment,
    private pushPort: IPushNotificationPort,
    private deepLink: DeepLinkManager,
  ) {}

  private get runtime(): PushNotificationProvider {
    return this.coreRuntime.notification;
  }

  private hasNotificationRuntime(): boolean {
    return (
      !!this.coreRuntime.notification &&
      typeof this.coreRuntime.notification.getPermissionsAsync === 'function' &&
      typeof this.coreRuntime.notification.requestPermissionsAsync === 'function' &&
      typeof this.coreRuntime.notification.getPushTokenAsync === 'function'
    );
  }

  /**
   * Initializes push notifications for the current user.
   * 1. Checks permissions.
   * 2. Retrieves the native push token.
   * 3. Registers the token with the sovereign identity provider.
   * 4. Sets up a listener for token changes.
   */
  async initialize(userId: string, deviceId: string): Promise<boolean> {
    try {
      if (!this.hasNotificationRuntime()) {
        if (__DEV__) {
          console.warn('PushNotificationManager: notification runtime unavailable, skipping init');
        }
        return false;
      }

      // 1. Setup Token Listener for refresh edge cases
      if (typeof this.runtime.addPushTokenListener === 'function') {
        this.runtime.addPushTokenListener((newToken) => {
          console.log('PushNotificationManager: Token refreshed', newToken);
          const platform = this.coreRuntime.device.getMetadata().platform ?? 'mobile';
          void this.pushPort.registerPushToken(userId, newToken, deviceId, platform);
        });
      }

      // 2. Setup Notification Listeners
      if (typeof this.runtime.addNotificationReceivedListener === 'function') {
        this.runtime.addNotificationReceivedListener((notification) => {
          console.log('PushNotificationManager: Notification received', notification);
          // Here we could trigger a local state sync or a toast
        });
      }

      if (typeof this.runtime.addNotificationResponseReceivedListener === 'function') {
        this.runtime.addNotificationResponseReceivedListener((response) => {
          console.log('PushNotificationManager: Notification clicked', response);

          // Extract URL from notification data payload
          // Expo payload structure: response.notification.request.content.data
          const data = response.notification?.request?.content?.data as
            | Record<string, unknown>
            | undefined;
          const targetUrl = typeof data?.url === 'string' ? data.url : undefined;

          if (targetUrl) {
            console.log('PushNotificationManager: Routing to deep link', targetUrl);
            void this.deepLink.handleURL(targetUrl);
          }
        });
      }

      const { status } = await this.runtime.getPermissionsAsync();

      if (status !== 'granted') {
        const request = await this.runtime.requestPermissionsAsync();
        if (request.status !== 'granted') return false;
      }

      const token = await this.runtime.getPushTokenAsync();
      if (!token) return false;

      const platform = this.coreRuntime.device.getMetadata().platform ?? 'mobile';

      await this.pushPort.registerPushToken(userId, token, deviceId, platform);
      return true;
    } catch (error) {
      console.error('PushNotificationManager: Initialization failed', error);
      return false;
    }
  }

  /**
   * Cleans up push notifications (e.g., on logout).
   */
  async cleanup(userId: string, deviceId: string): Promise<void> {
    try {
      if (!this.hasNotificationRuntime()) {
        return;
      }

      await this.pushPort.unregisterPushToken(userId, deviceId);

      await this.runtime.setBadgeCountAsync(0);
    } catch (error) {
      console.error('PushNotificationManager: Cleanup failed', error);
    }
  }

  /**
   * Sets the application badge count.
   */
  async setBadge(count: number): Promise<void> {
    if (!this.hasNotificationRuntime()) return;
    await this.runtime.setBadgeCountAsync(count);
  }
}
