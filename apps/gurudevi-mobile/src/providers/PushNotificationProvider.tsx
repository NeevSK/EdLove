import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { Runtime as coreRuntime, storage } from '@repo/core/native';
import { useAuth } from '@repo/core/logic';
import { router } from 'expo-router';
import { useEffect, useCallback } from 'react';

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
  const { session } = useAuth();

  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      // Handle foreground notification
      console.log('[PushNotification] Received:', notification);
      // Could update UI state, show in-app banner, etc.
    },
    [],
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      
      if (data?.deepLink) {
        // Handle deep link from notification
        router.push(data.deepLink);
      } else if (data?.path) {
        // Handle path-based navigation
        router.push(data.path);
      }
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
      
      // Store token locally and send to backend
      const tokenString = token.data;
      storage.set('expo_push_token', tokenString);
      
      // Send to backend (if we have a session)
      try {
        const { api } = await import('@repo/core/api/client');
        await api.notifications.registerToken(tokenString);
      } catch (e) {
        console.warn('[PushNotification] Failed to register token with backend:', e);
      }
      
      console.log('[PushNotification] Registered token:', tokenString);
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

    const notificationListener = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

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