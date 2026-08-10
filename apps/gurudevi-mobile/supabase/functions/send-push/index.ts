/**
 * Dispatches one notification to a user's registered transports.
 *
 * This function is intentionally server-only. It reads the existing
 * user_push_tokens table with the service role and sends browser subscriptions
 * through Web Push or native tokens through Expo's push gateway.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { object, string, optional, record, any, boolean, safeParse, type InferOutput } from 'https://esm.sh/valibot@0.36.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const vapidPublicKey = Deno.env.get('WEB_PUSH_VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('WEB_PUSH_VAPID_PRIVATE_KEY');
const vapidContact = Deno.env.get('WEB_PUSH_VAPID_CONTACT');
const dispatchSecret = Deno.env.get('PUSH_DISPATCH_SECRET');

if (vapidPublicKey && vapidPrivateKey && vapidContact) {
  webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);
}

const NotificationRequestSchema = object({
  user_id: string(),
  title: string(),
  body: string(),
  category: optional(string()),
  critical: optional(boolean()),
  data: optional(record(string(), any())),
});

type NotificationRequest = InferOutput<typeof NotificationRequestSchema>;

async function sendWeb(subscriptionJson: string, payload: NotificationRequest) {
  if (!vapidPublicKey || !vapidPrivateKey || !vapidContact) {
    throw new Error('Web Push VAPID configuration is missing');
  }

  await webpush.sendNotification(
    JSON.parse(subscriptionJson),
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }),
  );
}

async function sendNative(token: string, payload: NotificationRequest) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: 'default',
    }),
  });

  if (!response.ok) throw new Error(`Expo push gateway returned ${response.status}`);
}

Deno.serve(async (request) => {
  if (!dispatchSecret || request.headers.get('x-push-dispatch-secret') !== dispatchSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const result = safeParse(NotificationRequestSchema, rawPayload);
  if (!result.success) {
    return new Response('Invalid notification payload', { status: 400 });
  }
  const payload = result.output;

  const { data: preferences, error: preferencesError } = await supabase
    .from('user_preferences')
    .select('notification_settings')
    .eq('user_id', payload.user_id)
    .maybeSingle();


  if (preferencesError) return new Response('Preference lookup failed', { status: 500 });

  const settings = preferences?.notification_settings as {
    channels?: { push?: boolean };
    categories?: Record<string, { push?: boolean }>;
  } | null;
  if (settings?.channels?.push === false) return Response.json({ delivered: 0, suppressed: true });
  if (payload.category && settings?.categories?.[payload.category]?.push === false) {
    return Response.json({ delivered: 0, suppressed: true });
  }

  const { data: registrations, error: registrationsError } = await supabase
    .from('user_push_tokens')
    .select('device_id, push_token, platform')
    .eq('user_id', payload.user_id);
  if (registrationsError) return new Response('Registration lookup failed', { status: 500 });

  const results = await Promise.allSettled(
    (registrations ?? []).map(async (registration) => {
      try {
        if (registration.platform === 'web') {
          await sendWeb(registration.push_token, payload);
        } else {
          await sendNative(registration.push_token, payload);
        }
        return { deviceId: registration.device_id, delivered: true };
      } catch (error) {
        const status = error instanceof webpush.WebPushError ? error.statusCode : undefined;
        if (status === 404 || status === 410) {
          await supabase
            .from('user_push_tokens')
            .delete()
            .eq('user_id', payload.user_id)
            .eq('device_id', registration.device_id);
        }
        return { deviceId: registration.device_id, delivered: false };
      }
    }),
  );

  return Response.json({
    delivered: results.filter((result) => result.status === 'fulfilled' && result.value.delivered)
      .length,
    attempted: results.length,
  });
});
