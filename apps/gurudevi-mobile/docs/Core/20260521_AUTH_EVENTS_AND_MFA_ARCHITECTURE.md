---
title: "Auth Events and MFA Architecture"
status: "active"
created: 2026-05-22
updated: 2026-05-22
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Auth Events and MFA Architecture

This note captures the current auth-method logging and MFA direction for Gurudevi.

## What exists now

- Social login remains the primary UX entry point.
- Passkeys are available as an account-level credential path.
- TOTP is supported through Supabase MFA.
- Auth-method usage is logged through the existing device/security audit trail.
- The audit trail is surfaced through a dedicated `list_my_auth_events()` read model.

## Database model

Auth events are not stored in a separate table yet. They are written into the existing `security_audit_logs` table with `AUTH_%` action names, then filtered by the read model.

This keeps the system simple while still giving us:

- one security timeline,
- one RLS policy set,
- one offline queue path,
- one source of truth for device and auth history.

## RLS and security

- Writes happen through `log_my_device_audit(...)`, which is `SECURITY DEFINER`.
- The function checks that the actor is the current authenticated account.
- The function also checks the device is owned or linked to that account.
- Reads happen through `list_my_auth_events(...)`, which only returns rows for `public.get_my_id()`.

## TOTP flow

TOTP is a second-factor path, not the front door.

Recommended lifecycle:

1. User signs in with Google, Microsoft, password, or passkey.
2. Once authenticated, user enrolls a TOTP factor.
3. The app shows the QR code or secret only during enrollment.
4. The user enters the 6-digit code from an authenticator app.
5. Supabase verifies the factor and promotes the session to `aal2`.

This is a good fit for Gurudevi because social login still handles onboarding and UX, while TOTP adds step-up security for sensitive actions.

## Implementation notes

- Passkeys and TOTP are both optional layers.
- Shared-device safety still comes from account-scoped local storage and local App PIN / biometric unlock.
- Auth-event logging should stay best-effort so sign-in never fails because audit logging failed.

