---
title: "Remembered account session token rotation"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, accounts, recovery, verification]
---

# Feature spec

Maintain mode; AMBER. Target core accounts/deviceAccounts.ts,
hooks/useAuthLifecycle.ts and their existing boundary/SDK tests. Reuse the device
transaction queue, current-session continuity guard, remembered-session storage
and canonical profile bootstrap. No dependency, endpoint or schema change.
Functions stay within cognitive complexity 15.

The same-subject TOKEN_REFRESHED path must retain the current access/refresh pair
for the active remembered canonical account, while preserving its profile and
scope. It must not choose an account from provider subject alone, create an
unverified binding, activate a removed account, or invoke another SDK refresh.
The existing remembered binding and active account must match the session
subject; no binding means normal canonical bootstrap/capture is required.
Local bookkeeping never grants server permission.

Retention runs through the existing device queue with current-session checks
before writing. Changed sessions and storage failures reject. The lifecycle
exposes retention failure through profileError with a sanitized message and
guards asynchronous results against newer auth events. Recovery clears only
that retention error, preserving unrelated profile errors.

Required evidence: owner-bound retention, missing/wrong binding, stale token,
storage failure and recovery, no registry/scope rewrite, missing-binding bootstrap,
stale error isolation, and actual SDK refresh rotation followed by A-to-B-to-A
switching and restored-client use of remembered credentials. State all simulated
network/storage boundaries and do not claim hosted revocation or native durability.

## Implementation and grounding

retainRefreshedSession runs on the existing device-account queue. It requires
an authenticated current session and an active remembered record matching both
canonical account and provider subject. It updates only that record's existing
credential-storage key, with continuity checks around the write. It returns null
when no binding exists; it never creates or selects an account itself.

The lifecycle's same-subject refresh path now retains the token pair. If no
binding is found, existing canonical profile bootstrap and capture handle it.
The normal path preserves profile/scope without remote profile lookup. Storage
failure appears as a sanitized profileError; a successful retry clears only that
specific error. Auth-event generation checks prevent an old completion/error
from reapplying after newer sign-out, sign-in or unmount.

Installed auth-js 2.117.2 saves the refreshed session before emitting
TOKEN_REFRESHED and resolves the refresh deferred after notification. The existing
SupabaseAuthAdapter invokes application callbacks without returning their promise
to the SDK. The retention operation never calls refreshSession itself. This is
grounded in the installed GoTrueClient source, not an assumed callback-lock API.
The [session guidance](https://supabase.com/docs/guides/auth/sessions) describes
rotation/reuse handling, and the [advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
requires token storage to track refresh. No dependency or hosted setting changed.

## Verification

- G1 / Vitest 5.0.5 with mocked SDK/network/storage and React-hook functions:
  45/45 cases across device-account and lifecycle bootstrap files succeed.
  New cases cover the bound write, four missing/wrong binding cases, stale
  refresh rejection, storage failure/retry, bootstrap fallback, sanitized error
  recovery and two stale-completion outcomes. This is not React component mounting.
  Log: reports/auth-remembered-token-rotation-tests.log.
- G2 / actual Supabase JS/auth-js 2.117.2 and actual callback adapter/device
  service: the extended SDK scenario succeeds independently, and remains in the
  regression selection. A simulated issuer accepts only its latest refresh
  token and rotates it on use. The SDK refreshes A, the callback retains the
  pair, switching to B retains both accounts, an outgoing capture denies, and
  expired-access switching back to A uses the newly retained refresh token.
  A fresh SDK client subsequently refreshes from the next remembered pair.
  Synthetic HTTP, identity, secure storage, scoped reset and native cleanup are
  substituted; clock advancement forces expiry. JWT signatures are synthetic.
  This proves client use of the correct rotated credentials under the fixture,
  not hosted reuse-window/revocation policy or OS process-death recovery.
  Log: reports/auth-remembered-token-rotation-sdk.log.
- G1/G2 / Vitest: expanded account/lifecycle/runtime/outbox/AuthManager selection
  completes 151/151 cases across 12 files. Existing factory scenarios use actual
  SDK plus simulated HTTP/memory persistence, separately from the new direct-
  adapter scenario. Log: reports/auth-remembered-token-rotation-regression.log.
- G0 / installed TypeScript: forced core production declaration build exits 0;
  test files are excluded by its config. Biome checks five files with complexity
  maximum 15. Source duplication finds zero clones; raw diff/removals reviewed
  and scoped whitespace check exits 0. Prior uncommitted lifecycle changes are
  preserved. No test, account action, route or fallback was removed.
- Workspace types retain seven community errors; SonarJS fails initialization
  reading Void; broad anti-slop passes CNG then stops at 48 native findings.
  Version-drift and test-evidence audits exit 0. Device audit uses the certified
  baseline layout fixture and gives no new G5 evidence. rn-terrain recommends
  HUMAN_TRIAGE at 90% confidence, so no automatic policy acceptance is claimed.

## Remaining acceptance

Hosted refresh/reuse behavior, encrypted native persistence, real mounted-client
login/switch/restore and physical-device/OS process death remain open. The queue
is process-local and does not coordinate independent browser tabs or processes.
A storage write interrupted after provider rotation still needs real-device
recovery evidence; a failed retention is visible and retryable, not silently
claimed durable. Inactive database cleanup, telemetry actor attribution, broader
gates and the remaining identity programme are still required. No external state
changed; the full goal remains active.
