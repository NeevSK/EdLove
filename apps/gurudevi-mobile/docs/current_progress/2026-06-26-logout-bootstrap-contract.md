---
title: "Logout and Bootstrap Contract"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [auth, logout, bootstrap, route-policy]
---

# Logout and Bootstrap Contract

## Canonical behavior

- Logout returns the user to the public welcome surface.
- Any persisted auth/session state is cleared before the app can re-enter protected routes.
- Onboarding-incomplete accounts re-enter onboarding after auth success.
- Onboarding-complete accounts re-enter the app root after auth success.

## Current sequence

1. `AuthManager.signOut()` runs platform teardown hooks.
2. `AuthManager.signOut()` clears storage.
3. `AuthManager.signOut()` records the sign-out audit event.
4. `AuthManager.signOut()` calls the auth provider sign-out.
5. Expo Router bootstrap redirects back to `/welcome` for guests or `/self` for ready accounts.

## Product rule

Logout should behave like a reset of the public entry contract, not like a special auth exception.
