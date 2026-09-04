---
title: "Account Lifecycle Experience — Phase 3"
status: "active"
created: 2026-09-01
owners: [identity, mobile, web, product]
tags: [account-lifecycle, ux, local-first, powersync, device-management]
---

# Account Lifecycle Experience — Phase 3

The durable cross-platform lifecycle sequence and ownership boundaries live in
`2026-09-01-account-lifecycle-roadmap.md`; this note records Phase 3 evidence
and blockers only.

## Current focus

Build the shared UI command-state controller and adopt it in one local-device
surface first. Phase 2 remains open in parallel for runtime validation; Phase
3 does not reinterpret its mocked checks as acceptance evidence.

The existing profile deletion button no longer invokes the legacy immediate
hard-delete RPC. Until the request/status policy is implemented, it explains
that deletion is unavailable instead of claiming a destructive action
succeeded.

Implemented in this first slice:

- `useAccountLifecycle` owns UI-neutral idle, pending, completed, and failed
  command state and prevents concurrent execution;
- `useAccountDeletion` adopts that controller and produces an explicit
  unsupported result for the unintegrated deletion capability;
- Profile blocks the destructive modal before the legacy RPC can be invoked.
- Profile logout and Device Account Manager current-device sign-out now use the
  controller and close/announce success only for a completed command;
- `useDeviceAccounts` preserves the underlying lifecycle result after its
  refresh, rather than discarding the executor outcome.

The server-authoritative deletion-request/status boundary is now staged in
`20260901100000_account_deletion_request_policy.sql`. It revokes authenticated
execution of the legacy `delete_user_account` RPC and creates idempotent,
RLS-protected request/status functions. The request records
`pending_verification`; it does not delete, deactivate, soft-delete, or sign
the user out. With the migration applied, the Profile UI now submits this
request-only command and reads its status on later visits. Real authenticated
browser/native contract testing remains required before store-readiness can be
claimed.

PIN interaction remains a native-only device concern.

## Objective

Turn safe lifecycle execution into a consistent user journey. Settings,
Profile, Device Security, account deletion, and recovery must present the same
command state and must not create their own cleanup or navigation behavior.

## Entry criteria

Phase 2 must prove that local device commands execute and clean up safely:

- remembered-account commands use the typed lifecycle contract;
- active account data is cleared through PowerSync before destructive local
  cleanup;
- browser and native expose the same local commands, with browser remote
  controls explicitly unavailable;
- all legacy global-sign-out callers are classified.

## Deliverables

1. Create one lifecycle controller for UI command state:
   `confirming`, `submitting`, `offline-blocked`, `failed`, and `completed`.
2. Migrate Profile/logout, Device Security, and deletion surfaces to that
   controller after each existing caller's scope is classified.
3. Introduce a server-backed account-status policy:
   `active`, `deactivation_requested`, `deactivated`,
   `deletion_requested`, `deletion_scheduled`, and `deleted`.
4. Require fresh authentication/MFA and authority/retention checks before
   deactivation or deletion; support reactivation only within an explicit
   policy window.
5. Add remote-device/session revoke adapters where supported. Browser may
   render server-backed devices once an adapter exists, but never synthesize
   them from local records.
6. Model guardian/child links as a separate invitation, consent, custody, and
   historical-relationship lifecycle.

## Deletion request boundary

- a verified, active account can create only one open request, even when two
  devices submit concurrently;
- anonymous, missing, and already inactive identities receive an explicit
  blocked result rather than a fake success;
- submitting a request returns `pending_verification`, which deliberately
  requires fresh authentication and product-policy evaluation before any
  deletion or deactivation work can occur;
- the request table is not directly readable or writable by browser roles;
  only narrowly granted, search-path-safe functions expose the caller's own
  status;
- a privileged worker and a product-approved retention/custody policy are
  still required to schedule, cancel, reactivate, or complete deletion.

The same migration includes `schedule_verified_account_deletion`, a
service-role-only transition used only after that future worker verifies the
request. It soft-deactivates `public.users` and records a future retention
deadline; it does not hard-delete the auth identity. A future purge worker is
required to delete or anonymize eligible data at that deadline, and must leave
any explicitly retained security, safeguarding, institutional, or legal record
categories intact.

Every request stores the public policy version that applied at submission.
The store-readiness gate and the retention-matrix prerequisite live in
`2026-09-01-account-deletion-store-readiness.md`.

## Verification matrix

- browser E2E: switch, remove inactive, remove active with fallback, sign out
  current, sign out all, reload, offline, failed storage, keyboard/focus;
- browser PowerSync: selected account OPFS runtime is cleared and another
  remembered account remains usable;
- native smoke: the same local commands plus PIN create/verify/update/remove;
- server contract tests: fresh-auth, retention, authority denial, scheduled
  deletion, reactivation, and remote-session failures.

## Non-goals

Phase 3 does not mass-rewrite internal screens. It creates the lifecycle UX
boundary those screens will adopt one at a time.
