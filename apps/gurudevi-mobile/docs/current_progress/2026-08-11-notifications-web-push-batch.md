---
title: "Notification Delivery and Web Push Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, notifications, web-push, expo, parity, multi-account]
---

# Notification Delivery and Web Push Batch

## Evidence

- `notifications` is the in-app notification inbox and is already subscribed to
  Supabase Realtime by the shared notification adapter.
- `user_push_tokens` exists in the live database with zero rows, but was absent
  from the tracked migration history and ZenStack model.
- The live token registry has native/web-compatible columns: `push_token`,
  `device_id`, `platform`, `last_seen_at`, and `created_at`.
- The existing web implementation already has a browser Push API adapter,
  `/sw.js`, an explicit settings action, and a server-side `send-push` Edge
  Function. It must not use an Expo token on web.

## Contract decision

- Keep one notification inbox for all clients.
- Use Supabase Realtime for foreground/in-app updates on web and mobile.
- Use Expo/FCM/APNs tokens for native background delivery.
- Use a Web Push subscription serialized into `push_token` for browser
  background delivery. The service worker displays and routes the notification.
- Make token uniqueness account-scoped: `(user_id, device_id)`, not only
  `device_id`. This is required because one browser/device can host multiple
  accounts.
- Keep token registration explicit in notification settings on web; do not ask
  for browser permission during app startup.

## Remaining runtime work

- Configure the VAPID public/private/contact secrets and dispatch secret.
- Deploy the `send-push` Edge Function.
- Verify HTTPS, service-worker scope, browser permission, registration, and a
  real delivery in staging.
- Add delivery telemetry and endpoint cleanup after the first staging run.

