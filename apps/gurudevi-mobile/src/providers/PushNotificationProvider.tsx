import { handleDeepLink } from '@repo/core/logic/deeplink/handleDeepLink';
import { storage } from '@repo/core/native';
import * as Notifications from 'expo-notifications';
import { type Href, router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import { dispatchDeepLink } from '@/lib/deepLinks/dispatchDeepLink';
import { trackDeepLink } from '@/lib/deepLinks/trackDeepLink';
import { normalizeAcceptedInternalRoute } from '@/lib/deepLinks/urlPolicy';

/**
 * PushNotificationProvider
 *
 * Handles push notification registration, incoming notifications,
 * and notification responses (taps).
 */

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    // Handle foreground notification
    console.log('[PushNotification] Received:', notification);
    // Could update UI state, show in-app banner, etc.
  }, []);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      const target = typeof data?.deepLink === 'string' ? data.deepLink : data?.path;
      if (typeof target !== 'string') return;

      void (async () => {
        if (target.startsWith('/')) {
          const route = normalizeAcceptedInternalRoute(target);
          if (route) router.push(route as Href);
          return;
        }


        await dispatchDeepLink(target, {
          handleURL: handleDeepLink,
          track: trackDeepLink,
        });
      })().catch((error: unknown) => {
        console.warn('[PushNotification] Failed to dispatch notification target', error);
      });
    },
    [],
  );

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[PushNotification] Permission not granted');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      });

      // Backend registration requires a new admitted notification capability.
      const tokenString = token.data;
      storage.set('expo_push_token', tokenString);
    } catch (e) {
      console.error('[PushNotification] Registration error:', e);
    }
  }, []);

  // Register for push notifications on mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      void registerForPushNotifications();
    }
  }, [registerForPushNotifications]);

  // Set up notification listeners
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const notificationListener = Notifications.addNotificationReceivedListener(
      handleNotificationReceived,
    );
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [handleNotificationReceived, handleNotificationResponse]);

  // Register background notification task (iOS)
  if (Platform.OS === 'ios') {
    Notifications.setNotificationCategoryAsync('default', [
      {
        identifier: 'OPEN',
        buttonTitle: 'Open',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  return <>{children}</>;
}

// Helper to send local notification (for offline reminders, etc.)
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: Notifications.NotificationTriggerInput,
) {
  if (Platform.OS === 'web') return;

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: trigger || null,
  });
}

export default PushNotificationProvider;
