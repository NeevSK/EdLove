import { classifyRouteIntent, pendingIntentStore } from '@repo/core/logic';
import { checkInternalHref } from '@repo/core/routing/internalHref';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

function extractNotificationTarget(
  response: Notifications.NotificationResponse | null,
): { id: string; target: string } | null {
  if (!response) return null;
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const raw = typeof data?.deepLink === 'string' ? data.deepLink : data?.path;
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  return { id: response.notification.request.identifier, target: raw.trim() };
}

function stashValidatedNotificationTarget(raw: string): void {
  let candidatePath: string | null = null;
  if (raw.startsWith('/')) {
    candidatePath = raw;
  } else {
    const intent = classifyRouteIntent(raw);
    if (intent.kind === 'internalRoute') {
      candidatePath = intent.path;
    }
  }
  if (!candidatePath) return;

  const checked = checkInternalHref(candidatePath, 'mobile');
  if (!checked.ok) return;

  pendingIntentStore.getState().setPendingIntent({
    targetPath: checked.href,
    intentKind: 'generic',
    params: { path: checked.href },
    originalUrl: raw,
  });
}

/**
 * Cold-start & foreground push notification tap bridge.
 *
 * Captures `Notifications.getLastNotificationResponseAsync()` once on launch and
 * listens to notification tap responses, stashing validated targets into
 * `pendingIntentStore` so `SessionRouteGate` drains them safely after admission.
 * Deliberately does NOT request push permissions on mount.
 */
export function ColdPushIntentBridge() {
  const handledIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleResponse = (response: Notifications.NotificationResponse | null) => {
      const extracted = extractNotificationTarget(response);
      if (!extracted || handledIdsRef.current.has(extracted.id)) return;
      handledIdsRef.current.add(extracted.id);
      stashValidatedNotificationTarget(extracted.target);
    };

    void Notifications.getLastNotificationResponseAsync()
      .then(handleResponse)
      .catch((error: unknown) => {
        console.warn('[push-bridge] unable to read cold-start notification response:', error);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
