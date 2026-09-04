---
title: "Account Lifecycle Integration — Phase 2"
status: "needs-runtime-validation"
created: 2026-09-01
owners: [identity, mobile, web]
tags: [account-lifecycle, multi-account, powersync, local-first]
---

# Account Lifecycle Integration — Phase 2

## Current status

Implementation and focused checks are complete, but Phase 2 is not accepted
until it has real runtime evidence. Mocked storage and PowerSync tests do not
prove browser OPFS cleanup, route transitions, or native PIN behavior.

### Required real validation

- browser: sign out current, remove inactive, remove active with fallback,
  sign out all, reload, keyboard actions, error feedback, and OPFS cleanup;
- native: the same local-account commands plus PIN create, verify, update,
  and protected-account removal;
- failure cases: unavailable storage, failed local session clear, failed
  PowerSync clear, and expired fallback session.

## Objective

Make the existing remembered-account implementation the first concrete
executor of the lifecycle contract. This replaces a disconnected contract plus
ad-hoc local cleanup with one accountable local-device path; it does not
change server deletion or account-status policy.

## Retained foundations

- verified identity capture and per-account session storage;
- rollback-safe account switching;
- per-account PowerSync runtime ownership on native and web;
- truthful browser security UI;
- explicit lifecycle command and effect types from Phase 1.

## Integration rule

The same three local commands are supported on web and native:

1. `sign-out-current-device` removes only the active local session/account;
2. `remove-remembered-account` removes one selected local account and keeps a
   valid fallback account when available;
3. `sign-out-all-local-accounts` removes every remembered account on this
   installation.

Each command completes only after its declared local effect has executed.
For active-account removal and sign-out-all, the active PowerSync runtime uses
`disconnectAndClear()` before session scope changes. That clears the local
account database without pretending to revoke a remote session.

## Deliberate boundaries

- `AuthManager.signOut()` remains untouched: its legacy global-storage policy
  must be separately migrated after every caller is classified. Routing it
  into the local-device command now could silently remove other remembered
  accounts.
- remote session revoke, deactivation, deletion, reactivation, and guardian
  relationship transitions remain unavailable until server-backed adapters and
  authority/retention policy exist.
- browser and native share the local command contract; parity does not mean
  browser claims unavailable remote-device controls.

## Acceptance evidence

- contract tests prove the three local commands are supported on both
  platforms;
- device-account tests prove sign-out-all clears the active PowerSync runtime,
  clears local sessions, and records the single install-session revocation;
- focused typecheck, lint, and anti-slop checks are run before this slice is
  marked complete.

## Remaining closure work

- classify the legacy global-sign-out callers before changing their storage
  policy; Profile is a user-initiated current-device logout and now uses the
  local lifecycle executor. `useIdentity.signOut` is an exported legacy API
  with no in-repository invocations, so it remains unchanged until its public
  contract is intentionally versioned;
- complete native PIN create, verify, update, and protected-account removal;
- remove dead offline confirmation states: local-device cleanup must work
  offline, while optional remote audit work remains queued/best effort;
- execute the required real runtime validation against a running app.
