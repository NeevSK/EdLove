---
title: "Account Lifecycle Foundation — Phase 1"
status: "active"
created: 2026-09-01
owners: [identity, mobile, web]
tags: [account-lifecycle, multi-account, device, powersync, local-first]
---

# Account Lifecycle Foundation — Phase 1

## Objective

Turn existing fragmented account and device behavior into one safe foundation
without changing destructive server policy yet. This phase makes commands,
local account capture, and browser capability claims explicit. It does not
introduce account deletion, deactivation, or guardian relationship migrations.

## Starting facts

- Route bootstrap correctly distinguishes public, onboarding-needed, and ready
  states, but lifecycle cleanup is distributed.
- Device-account storage and rollback-safe switching exist, but verified
  sign-in does not capture a remembered account in production.
- Normal logout and device-account logout have different uncoordinated cleanup
  behavior.
- Browser device/security adapters provide local browser state, not a remote
  device/session inventory.
- PowerSync is account-scoped on web, but lifecycle commands do not yet own
  its cleanup consistently.

## Atomic delivery slices

### A. Lifecycle command contracts

Create platform-neutral command, phase, result, and effect contracts for:

- sign out current device;
- remove remembered account from this device;
- sign out all local accounts;
- revoke a remote session;
- request deactivation;
- request deletion.

This slice is domain-only. It must not claim any command is server-supported
before an adapter exists. Tests cover state transitions and forbidden effects.

Status: implemented in `@repo/core` with typed unsupported results and effect
target validation. Existing cleanup paths are intentionally not wired yet.

### B. Verified account capture

After a non-anonymous authenticated identity has been resolved, capture its
remembered device record using scoped session data. Do not capture anonymous
or unresolved identities. Test idempotency, account-switch safety, expired
token handling, and no cross-account storage exposure.

Status: implemented after verified identity bootstrap. It excludes anonymous,
sandbox/demo, unresolved, and principal-mismatched sessions, and retries a
failed registry write on a later auth refresh.

### C. Truthful browser device management

Browser UI may manage this browser's remembered accounts and session only. It
must not display synthesized records as remote devices or offer revoke/unlink
actions that merely alter local storage. Unsupported remote controls present a
clear unavailable explanation and an action to continue in the mobile app.

Status: implemented. Browser security presents local browser-account controls
only and explicitly marks remote device/session actions unavailable. Lifecycle
capability lookup now distinguishes web from native support; no browser adapter
is allowed to claim a native remote action succeeded.

## Explicitly deferred

- Unifying all existing logout/delete cleanup behind the lifecycle service.
- Server account-status migration, fresh-auth/MFA gate, retention policy,
  deactivation/reactivation, and deletion scheduling.
- Guardian/child invitation, consent, custody, and audit-history lifecycle.
- PowerSync mutation queue policy during account removal or deletion.

## Acceptance evidence

1. Command contracts are typed and unit-tested.
2. Verified sign-in captures one remembered account exactly once without
   changing anonymous behavior.
3. Account switch and failed token restoration leave no hybrid account state.
4. Browser device UI distinguishes local capability from remote capability.
5. Focused core/mobile type checks, tests, and lint pass.
6. The delivery record is updated with only verified facts and remaining gaps.

## Exit condition

Phase 1 exits when all three slices pass their tests and we can begin a
separate integration slice that routes existing cleanup paths through the
lifecycle service. It does not exit merely because settings screens render.
