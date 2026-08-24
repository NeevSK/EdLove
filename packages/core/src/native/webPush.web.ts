export interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type WebPushPermission = NotificationPermission | 'unsupported';

function base64UrlToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value.replace(/-/g, '+').replace(/_/g, '/')}${padding}`;
  const raw = globalThis.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function toSubscription(value: PushSubscription): WebPushSubscription | null {
  const json = value.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return null;

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

export function getWebPushPermission(): WebPushPermission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/**
 * Request or reuse a browser push subscription.
 * The caller must provide the public VAPID key from a trusted configuration
 * source and should invoke this from an explicit notification-settings action.
 */
export async function registerWebPushSubscription(
  vapidPublicKey: string,
  serviceWorkerPath = '/sw.js',
): Promise<WebPushSubscription | null> {
  if (
    typeof window === 'undefined' ||
    typeof Notification === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return null;
  }

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register(serviceWorkerPath, { scope: '/' });
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey) as unknown as BufferSource,
    }));

  return toSubscription(subscription);
}

export async function unregisterWebPushSubscription(serviceWorkerPath = '/sw.js'): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration(serviceWorkerPath);
  const subscription = await registration?.pushManager.getSubscription();
  await subscription?.unsubscribe();
}
