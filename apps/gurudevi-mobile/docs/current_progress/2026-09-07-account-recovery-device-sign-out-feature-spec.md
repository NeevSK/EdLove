---
title: "Feature Spec — Account Recovery Device Sign-Out"
status: "implemented"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, auth, account-recovery, device-accounts, red-zone]
---

# Feature Spec — Account Recovery Device Sign-Out

## Blast zone

RED — account lifecycle crosses the mobile route and `@repo/core` device-account
boundary.

## Target file

`apps/gurudevi-mobile/app/account-recovery.tsx`

## Reuses

- `deviceAccounts.signOutCurrentAccount()` from
  `@repo/core/accounts/deviceAccounts`.
- Existing device-account tests, including current-account removal and
  local-session cleanup.
- `SessionRouteGate` for the post-sign-out public-route transition.

## Does not

- Does not add auth work to `app/_layout.tsx`.
- Does not change the bootstrap route contract.
- Does not change PowerSync, Supabase, native configuration, dependencies, or
  saved-account switching behavior.
- Does not introduce a new logout abstraction for one caller.

## Behavior contract

When an inactive-account user selects sign-out from account recovery, the app
removes the active device account through the existing account-lifecycle
operation, clears the local session/account-scoped state, then navigates to
`/welcome`. On failure, the user remains on recovery and the control becomes
available again. Other remembered accounts are preserved by the existing
`signOutCurrentAccount` contract.

## Complexity budget

One call-site substitution; no new function or branching. The broader
sign-out-coordinator decision remains a separately reviewed recovery slice.

## Verification

- Focused device-account tests prove current-account removal and retained
  non-active-account behavior.
- Mobile typecheck/lint and anti-slop checks run after the complete change set.
- Native device walkthrough remains required before release.
