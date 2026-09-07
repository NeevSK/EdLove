---
title: "Account Lifecycle Authority — User, Device, and Query Cache"
status: "implemented-code"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, auth, device-accounts, query-cache, lifecycle]
---

# Account Lifecycle Authority — User, Device, and Query Cache

## Authority map

`deviceAccounts` is the sole authority for user-initiated device-account switching and sign-out. It coordinates persisted sessions, active scope, PowerSync account cleanup, scoped stores, local Supabase session removal, and device-security audit/revocation work. User-facing identity and recovery paths delegate to it; they do not call the generic auth adapter directly.

`AuthQueryCacheBoundary`, mounted inside the existing `QueryClientProvider` and after `GlobalProvider`, owns one app-only concern: clearing React Query data when the authenticated subject changes. It does not clear on first mount, avoiding a startup race or needless cache purge.

## Removed authority

The unused `globalLogoutAndPurge` implementation was removed. It duplicated local sign-out and scoped-state cleanup while having no live callers. Retaining it would have preserved a second, inconsistent contract.

## State transitions

| Transition | Device/account authority | Query cache behavior |
| --- | --- | --- |
| Initial restore | `deviceAccounts.initialize` before entry mount | Preserved |
| Account A → B | `deviceAccounts.switchTo` | Cleared once |
| Sign out current account | `deviceAccounts.signOutCurrentAccount` | Cleared once |
| Account recovery sign out | Same current-account operation | Cleared once |

## Verification

- Focused mobile lifecycle tests verify cache preservation on first mount, one clear on subject change, and one clear on sign-out.
- Existing device-account tests verify current-account removal and local session cleanup.
- A physical-device walkthrough is still required for saved-account switching, sign-out, and a subsequent sign-in before release.
