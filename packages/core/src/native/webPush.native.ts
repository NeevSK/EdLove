export interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type WebPushPermission = 'denied' | 'unsupported';

export function getWebPushPermission(): WebPushPermission {
  return 'unsupported';
}

export async function registerWebPushSubscription(
  _vapidPublicKey?: string,
  _serviceWorkerPath?: string,
): Promise<WebPushSubscription | null> {
  return null;
}

export async function unregisterWebPushSubscription(): Promise<void> {
  return undefined;
}
