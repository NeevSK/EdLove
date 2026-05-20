import type { CoreRuntimeEnvironment, PushNotificationProvider } from '../../types/runtime';
import type { IPushNotificationPort } from '../ports/pushNotification.port';

import type { DeepLinkManager } from './DeepLinkManager';

/**
 * PushNotificationManager: Orchestrates native push notifications.
 * Bridges the gap between native hardware tokens and sovereign identity.
 */
export class PushNotificationManager {
  private runtime: PushNotificationProvider;

  constructor(
    coreRuntime: CoreRuntimeEnvironment,
    private pushPort: IPushNotificationPort,
    private deepLink: DeepLinkManager,
  ) {
    this.runtime = coreRuntime.notification;
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
      // 1. Setup Token Listener for refresh edge cases
      this.runtime.addPushTokenListener(async (newToken) => {
        console.log('PushNotificationManager: Token refreshed', newToken);
        await this.pushPort.registerPushToken(userId, newToken, deviceId, 'mobile');
      });

      // 2. Setup Notification Listeners
      this.runtime.addNotificationReceivedListener((notification) => {
        console.log('PushNotificationManager: Notification received', notification);
        // Here we could trigger a local state sync or a toast
      });

      this.runtime.addNotificationResponseReceivedListener(async (response) => {
        console.log('PushNotificationManager: Notification clicked', response);

        // Extract URL from notification data payload
        // Expo payload structure: response.notification.request.content.data
        const data = response.notification?.request?.content?.data as
          | Record<string, unknown>
          | undefined;
        const targetUrl = typeof data?.['url'] === 'string' ? data['url'] : undefined;

        if (targetUrl) {
          console.log('PushNotificationManager: Routing to deep link', targetUrl);
          await this.deepLink.handleURL(targetUrl);
        }
      });

      const { status } = await this.runtime.getPermissionsAsync();

      if (status !== 'granted') {
        const request = await this.runtime.requestPermissionsAsync();
        if (request.status !== 'granted') return false;
      }

      const token = await this.runtime.getPushTokenAsync();
      if (!token) return false;

      // Platform is usually detected via runtime or injected
      const platform = 'mobile'; // Default for now, can be refined

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
    await this.runtime.setBadgeCountAsync(count);
  }
}
