---
title: "Account Lifecycle Foundation"
status: "accepted"
created: 2026-09-01
owners: [identity, mobile, web]
tags: [account-lifecycle, multi-account, local-first, powersync, device-management]
---

# Account Lifecycle Foundation

## Decision

Gurudevi treats account lifecycle as a domain foundation, not a collection of
Settings buttons. Product surfaces must use lifecycle commands and their
explicit state/results; they must not combine Supabase calls, device storage,
PowerSync cleanup, cache resets, and navigation ad hoc.

The following are distinct commands with distinct effects:

- sign out of the current device session;
- remove a remembered account from this device;
- sign out all local accounts;
- revoke a remote session or device;
- request account deactivation and reactivate within its defined window;
- request account deletion under retention and authority policy.

An account is distinct from identities, sessions, device presence, bonds, and
guardian/student relationships. Account status is explicit:
`active`, `deactivation_requested`, `deactivated`, `deletion_requested`,
`deletion_scheduled`, and `deleted`. Relationship state is separately
`pending`, `active`, `suspended`, `revoked`, or `historical`.

## Required implementation order

1. Define `AccountLifecycleService` command/result contracts and effects.
2. Route current logout, device removal, session revocation, deletion, and
   PowerSync/cache cleanup through those contracts.
3. Make non-anonymous identity bootstrap capture a remembered device account;
   make account switch a rollback-safe transaction.
4. Make browser device controls truthful: browser-session management only
   until a server-backed web adapter exists.
5. Add deactivation, then retention-aware deletion and reactivation.
6. Model guardian/child relationship lifecycle separately from person-account
   deletion or role changes.

## Invariants

- An account transition never leaves a hybrid view: old in-memory/query/sync
  state is cleared or safely retained by declared policy before routing.
- PowerSync ownership is per account and per device/browser profile.
- A current-account sign-out does not erase another remembered account.
- Deletion does not silently remove records subject to institutional retention
  or terminate a relationship that needs an authority decision.
- UI reports `confirming`, `submitting`, `offline-blocked`, `completed`, or a
  retryable failure. It never claims remote device/session/payment work on web
  when only a local adapter exists.

## Consequences

Internal screen modernization follows lifecycle and onboarding foundations.
This prevents individual settings/profile screens from creating their own
cleanup, recovery, and navigation logic. Existing feature documents that call
deletion complete are historical until the lifecycle verification matrix is
passed.
