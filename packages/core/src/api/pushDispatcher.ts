export type PushDispatchPayload = {
  userId: string;
  title: string;
  body: string;
  category?: string;
  critical?: boolean;
  data?: Record<string, unknown>;
};

/** Delivers through Supabase so the API never handles VAPID private keys. */
export async function dispatchPush(payload: PushDispatchPayload): Promise<void> {
  const supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
  const secret = typeof process !== 'undefined' ? process.env.PUSH_DISPATCH_SECRET : undefined;
  if (!supabaseUrl || !secret) {
    console.warn('[push] SUPABASE_URL or PUSH_DISPATCH_SECRET is not configured; skipped');
    return;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-push-dispatch-secret': secret },
    body: JSON.stringify({
      user_id: payload.userId,
      title: payload.title,
      body: payload.body,
      category: payload.category,
      critical: payload.critical,
      data: payload.data,
    }),
  });

  if (!response.ok) throw new Error(`[push] Edge Function returned ${response.status}`);
}

export function dispatchPushSafely(payload: PushDispatchPayload): void {
  void dispatchPush(payload).catch((error) => console.error('[push] Dispatch failed:', error));
}
