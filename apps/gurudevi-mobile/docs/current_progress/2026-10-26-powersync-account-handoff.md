---
title: "PowerSync account handoff failure containment"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, powersync, accounts, verification]
---

# Feature spec

Maintain mode; Blast Zone AMBER. Targets:
`packages/core/src/adapters/powersync/singleActivePowerSyncRuntime.ts`, its
existing tests, `apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx` and
a component boundary regression test. Reuse the existing queue, SDK close/
disconnect/clear methods, account-scoped factory and React state/context.
Complexity below 15. No new package, native artifact or route-shell change.

Current `closeActive()` drops ownership before awaiting cleanup. A rejection
therefore lets the next queued activation create a second database while the
previous one may still be alive. Keep the previous handle until release
completes, mark it as releasing, and force retries before any activation,
including the same account. Preserve an explicit pending clear through failure.
After successful clear, close the remaining database handle: installed common
SDK 2.3.1 explicitly documents that clear leaves the database queryable.
The old test expecting no close after clear must change because that assertion
encoded the handle leak; retain its explicit-clear assertion and strengthen it
with ordering/close evidence. Do not delete or skip it.

The provider currently stores a bare database in React state, leaving the old
context available during an account transition. Store its account with it and
require exact ownership plus active handle identity before providing context.
Stale asynchronous initialization must not publish itself. Existing offline
operation and upload acknowledgments remain unchanged. A failed cleanup must
surface an error and withhold the new account's context; it must not silently
discard the old handle or clear an offline queue.

Evidence required: deferred/rejected cleanup, retry, queued switches, same-account
retry, explicit clear/close order and failure; G3 React account transitions with
database/native/auth substitutes. These do not establish real native SQLite,
SDK checksum/cache behavior or physical-device acceptance.

## Implementation and evidence

The serialized runtime retains ownership after release failure and rejects a
replacement until release succeeds. A pending explicit clear survives failure;
a completed clear is not repeated when closing subsequently fails. Unsupported
release/clear capabilities reject loudly. The provider publishes only the exact
active database belonging to the current account. It uses the existing explicit
adapter exports for schema and database injection; this also avoids the mobile
test resolver's unresolved generic `@repo/core/powersync` facade alias.

- G1 boundary / Vitest with database, network and auth substitutions: 46/46
  cases across runtime, connection lifecycle and connector suites succeeded.
  Proves the specified release/retry/credential contracts under substitutions;
  does not prove native SQLite or hosted SDK replay.
- G3 component / React test renderer with native database, factory, auth store,
  Drizzle and connection substitutions: 8/8 new provider cases succeeded.
  The combined provider/recovery selection completed 23/23 cases. Proves context
  isolation during deferred/rejected close, A-to-B-to-A, stale initialization,
  disabled/signed-out/local-only state and offline connection failure. Does not
  prove real native threads, private cache teardown or device rendering.
- G0 static: forced core declaration build, scoped Biome checks and explicitly
  enabled cognitive-complexity checks succeeded. Scoped jscpd found zero clones.
  Full mobile typechecking still reports 21 errors outside the changed files;
  workspace typechecking reports seven community errors. ESLint cannot initialize
  SonarJS 4.2.2 S1154 (`reading 'Void'`), so it supplies no lint acceptance.
- The broad anti-slop gate exits 1 with 48 native findings; CNG succeeds. Logs:
  `reports/auth-account-handoff-{mobile-types,workspace-types,eslint,anti-slop,duplication}.log`.

The raw runtime/provider/test diff was reviewed, including the strengthened
clear-then-close expectation. No test was skipped or removed. The shared database
facade's retained references need a separate lifecycle review. Actual SDK cache,
offline replay, membership revocation and physical-device acceptance remain open.

## Follow-up spec: shared facade ownership

AMBER targets: both existing `database.ts`/`database.web.ts` facades, the serialized
runtime, native provider and their boundary/component tests. Reuse the existing
injection seam with an optional ownership contract; existing two-argument
injections retain their behavior. Owned accessors reject a releasing or
wrong-account handle. Logout delegates release to the same queue and targets the
captured database, so delayed A cleanup cannot release B or erase B's injection.
Retain the failed handle for retry without exposing it. No route-shell, schema,
credential, package or offline-queue policy change. Complexity remains below 15.
Required proof: inactive facade rejection, cleanup failure/retry, queued delayed
release after replacement, successful replacement during awaited legacy cleanup,
and provider wiring with current store ownership. Existing bootstrap/proxy tests
must continue to run; real SDK/device acceptance remains a separate gate.

Scoped duplication inspection found the existing parallel facade injection and
release blocks grow into a detected clone. Extend this same blast radius with
`databaseRegistry.ts`: one typed registry, used by both existing platform
facades, owns injected database/Drizzle references and conditional cleanup.
Keep platform bootstrap and fallback construction in their existing facades.

## Shared facade implementation and evidence

Both platform facades now use `PowerSyncDatabaseRegistry`. The optional owned
injection rejects inactive access and delegates logout to the serialized runtime.
`deactivateIfCurrent` checks the captured handle inside the queue. A completed
release clears registry references only if they still belong to that handle.
Securing a replacement finishes before its references are installed. The native
provider's ownership predicate also checks the current store account, enabled
flag and local-only state, so it denies reads before React effect cleanup runs.

Two-argument injections retain legacy disconnect-only and explicit-clear behavior,
including clear without close. Owned native injection instead uses the queue's
clear-then-close contract. A legacy object with no release method now rejects
loudly instead of the browser facade silently forgetting it. Platform bootstrap,
mock fallback and secure-write interception remain in place. Removed singleton
state/release branches were consolidated, not discarded.

- G1 boundary / Vitest with SDK, bootstrap and security-proxy substitutions in
  the new ownership suite: 12/12 cases across both facades. The combined six-file
  selection completed 49/49 cases, including runtime targeting, existing bootstrap,
  secure-proxy and sync-integration regressions. Proves inactive accessor denial,
  release failure/retry, replacement preservation, queued stale cleanup and legacy
  compatibility under substitutions. Does not prove actual SDK files or device IO.
- G3 component / React test renderer with native/auth/network substitutions:
  9/9 provider cases, 24/24 combined with recovery. The added case checks the
  injected ownership predicate against current store identity before rerender,
  then checks that the old captured release cannot close the replacement.
- G0 static: forced core declaration build and scoped Biome/complexity checks
  succeeded. Workspace types still report seven community errors; mobile types
  report 21 errors outside changed files. ESLint still cannot initialize SonarJS
  4.2.2 S1154. jscpd reports one 103-token clone in thin platform facade exports;
  injected state and release implementation are shared, but duplication acceptance
  is not claimed. Logs are `reports/auth-shared-runtime-*.log`.
- Broad anti-slop still exits 1 with 48 native findings; CNG succeeds. Version
  drift and test-evidence command audits exit 0. Device-evidence command exits 0
  against its certified baseline fixture: this is a fixture audit, not a G5 run
  for this change.

Remaining acceptance includes already-captured query/client handles, late auth
callbacks that invoke global cleanup after a newer login, actual SDK cache/offline
replay, membership revocation and physical devices. No hosted target, credential,
deployment, billing setting or database contents changed in this follow-up.
