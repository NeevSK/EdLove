---
title: "Sovereign Push Notifications"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# Sovereign Push Notifications

This document outlines the architecture and usage patterns for native push notifications within the Gurudevi platform.

## Architecture

The system follows a **Port-and-Adapter** (Hexagonal) architecture to ensure that native delivery mechanisms are decoupled from business logic.

- **Port**: `PushNotificationProvider` (Defines the interface for native capabilities).
- **Adapter**: `nativeNotificationProvider` (Implements the port using `expo-notifications`).
- **Manager**: `PushNotificationManager` (Orchestrates token lifecycle, permissions, and deep link routing).
- **Sovereign Link**: Push tokens are registered against the user's **Sovereign Identity** in the `user_push_tokens` table.

## The Lifecycle

### 1. Registration
When a user logs in, `App.tsx` initializes the `PushNotificationManager`.
1. It requests/verifies native permissions.
2. It retrieves the native `ExpoPushToken`.
3. It registers the token + `device_id` in the Supabase `user_push_tokens` table.

### 2. Delivery (Backend)
To send a notification, the backend (or an Inngest function) should:
1. Query `user_push_tokens` for a specific `user_id`.
2. Send the payload to the Expo Push Service using the retrieved tokens.

### 3. Handling (Interaction)
When a user clicks a notification:
1. `PushNotificationManager` catches the response.
2. It looks for a `url` field in the `data` payload.
3. If present, it hands the URL to `DeepLinkManager` for contextual navigation.

## Usage Patterns

### Sending a Notification (Payload Example)
```json
{
  "to": "ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "New Community Post",
  "body": "Neev posted a new update in the Sanctuary.",
  "data": {
    "url": "gurudevi://sanctuary/community/post/123"
  },
  "sound": "default",
  "badge": 1
}
```

### Routing Logic
We use **Sovereign URLs** for all routing. Always use the `gurudevi://` scheme or the platform's public URL in the `data.url` field to ensure cross-platform compatibility.

## Security & Privacy

### Respecting User Preferences (FAANG-Style Control)

Before sending a notification, the dispatcher MUST check the `user_preferences` table for the target user.

- **Global Kill-switch**: Check `notification_settings.channels.push`.
- **Category Gating**: Check `notification_settings.categories[category].push`.
- **Quiet Hours**: If `notification_settings.quiet_hours.enabled` is true, suppress non-critical notifications between `start` and `end` times.

Example logic (Pseudocode):
```typescript
const prefs = await profileManager.getUserPreferences(userId);
if (!prefs.notification_settings.channels.push) return; // Opted out of all push
if (!prefs.notification_settings.categories[category].push) return; // Opted out of this category

if (prefs.notification_settings.quiet_hours.enabled && isWithinTime(prefs.notification_settings.quiet_hours)) {
  if (isNotCritical(notification)) return; // Silenced during quiet hours
}
```

### Trust Levels
The system is designed to integrate with `DeviceIdentity`. For sensitive notifications:
- The backend can check the `last_seen_at` and `platform` of the token.
- Future iteration: The app can gate notification display based on the device's `TrustLevel` (e.g., requiring Biometric/Hardware-bound identity).

### Unregistration
Tokens are automatically unregistered when:
1. The user logs out (`pushNotification.cleanup()`).
2. The user revokes permissions (handled by the OS, then cleaned up by the backend on delivery failure).

## Database Schema (`user_push_tokens`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Link to `public.users` |
| `push_token` | TEXT | The native Expo Push Token |
| `device_id` | TEXT | Unique identifier for the device session |
| `platform` | TEXT | e.g., 'mobile', 'web' |
| `last_seen_at` | TIMESTAMPTZ | Updated on every token refresh/sync |
