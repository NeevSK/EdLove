/**
 * IPushNotificationPort: The Sovereign Push Notification Interface.
 * Decouples the application logic from the underlying push notification transport.
 */
export interface IPushNotificationPort {
  /**
   * Registers a device push token for a user.
   */
  registerPushToken(
    userId: string,
    token: string,
    deviceId: string,
    platform: string,
  ): Promise<void>;

  /**
   * Unregisters a device push token.
   */
  unregisterPushToken(userId: string, deviceId: string): Promise<void>;
}
