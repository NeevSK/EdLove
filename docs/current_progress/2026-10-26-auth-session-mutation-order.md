---
title: "Auth session mutation and logout ordering"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, session, logout, verification]
---

# Feature spec

Blast zone RED: `packages/core/src/logic/managers/AuthManager.ts`, its factory
and tests; authorized by the user's existing full auth implementation/proceed
instruction. Reuse IAuthPort, existing platform teardown and resetScopedStores.
Native credential/session writes are centralized in the Supabase adapter via
AuthManager. The Next.js browser auth implementation has a separate boundary.
No private SDK call, deprecated custom lock, new dependency or provider protocol.
New functions have cognitive complexity below 15.

Verified user lookup also enters this queue: auth-js may remove the current
session when that request reports a missing session. Direct SDK user lookups in
the identity adapter remain outside this manager boundary and need follow-up.

Serialize application session mutations and the entire logout operation in one
manager-owned queue. Rejection must not poison later requests. Login/set-session,
OTP/exchange, guest creation/conversion, MFA session updates and credential writes
must not overlap logout. Retain anonymous single-flight behavior. Guest checks
and conversion remain inside their serialized operation. Read-only session access
stays available to provider callbacks and authenticated API requests.

Logout releases runtime, attempts provider revocation while credentials still
exist, then clears derived account state. All relevant boundaries are attempted
and sanitized failures aggregate. Scope others retains the current runtime/state.
Replace the factory's destructive device-wide storage.clearAll with the existing
resetScopedStores boundary: preserve registry, remembered credentials, preferences
outside that established reset and principal-owned durable commands. Rename the
injected `storage.clearAll` config to `localState.clear`; its only production
consumer is this factory. This is an intentional preproduction contract break,
not a compatibility fallback; update existing assertions without weakening them.

The installed auth-js 2.117.2 signOut reads the session when dispatched and removes
it after awaited remote logout; refresh commit guards do not protect a concurrent
new sign-in from this removal. Custom locks are explicitly deprecated. Prove this
seam using the actual installed SDK with simulated HTTP/storage as well as queued
manager scenarios. Required cases: deferred logout vs every supported session
mutation, failed logout followed by login, ordering of runtime/provider/state,
scope others, no loss of outgoing provider credentials before revocation, and no
device-wide storage wipe. External auth events, account capture's durable writes
and cross-tab browser ownership remain distinct acceptance work.

The factory's browser check must use DOM presence rather than `window`: installed
React Native defines `globalThis.window`. Preserve the browser path while ensuring
native logout actually awaits PowerSync release. The SDK fixture supplies a native-
like window without a document, injects a substituted database handle, and checks
that close happens before remote logout.

Include `packages/core/src/lib/authStorage.ts` and a focused boundary suite in this
same credential-storage seam. Its current read/write/delete catches silently turn
storage failure into absence or apparent success, so SDK logout can claim local
removal when deletion failed. Propagate sanitized failures while preserving normal
synchronous reads and asynchronous fallback. Keep the SDK removal-failure scenario
visible through AuthManager's aggregate result; never release ownership via an
unsafe timeout while an SDK mutation can still finish later.

## Implementation and verification

AuthManager now queues session mutations, verified-user lookup and full logout.
Guest preconditions/conversion execute inside their queued operation; anonymous
single-flight and existing-guest reuse remain. The queue advances after rejection.
Logout releases the runtime, calls the provider while credentials remain, then
resets derived local state. Existing per-boundary sanitized aggregate reporting
and scope-others behavior are retained. The production factory now uses
resetScopedStores instead of wiping the storage adapter, and checks DOM presence
so a native `window` does not bypass runtime release. The credential adapter now
rejects sanitized persistence failures instead of reporting absence/success.

- G1 boundary / Vitest 5.0.5: 76/76 cases across manager, credential persistence
  and existing lifecycle bootstrap suites succeeded. The manager matrix covers
  23 queued public entry points plus guest preconditions, queue recovery and
  anonymous single-flight. Auth/identity/React-hook/storage dependencies are
  substituted where configured. Existing assertions were strengthened for logout
  ordering; failure names/order changed to reflect provider-before-state cleanup.
  No test was skipped or weakened, and unsafe port assertions were replaced by
  complete fixtures checked with `satisfies IAuthPort`/`IIdentityPort`.
- G2 stateful / Vitest with actual Supabase JS/auth-js 2.117.2, actual production
  factory/AuthManager/SupabaseAuthAdapter/auth-storage adapter, and substituted
  HTTP, identity/telemetry, native database handle and memory persistence: 3/3
  cases succeeded. HTTP 200, HTTP 503 and credential-removal failure all retain
  outgoing credentials until dispatch, await runtime release despite a native-
  like window, delay incoming login until logout is terminal, then retain B's SDK
  session, remembered device fixtures and an A-owned paused outbox command. Failures
  report incomplete logout rather than success. Three existing G2 scope lifecycle
  cases also succeeded; the combined five-file selection completed 82/82 cases.
  Proves these contracts with the named real SDK/adapters and substitutions.
  Does not prove real JWT verification, provider revocation, native persistence,
  cross-tab/browser behavior, hosted API admission or physical-device runtime.
- G0 static: forced core declarations, scoped Biome, explicit complexity-15 checks
  and scoped duplication checks succeed. Workspace types retain seven community
  errors outside these changes. ESLint cannot initialize SonarJS 4.2.2 S1154.
  Broad anti-slop remains red at 48 native findings; CNG succeeds. Test-evidence
  and version-drift audits succeed. Device-evidence audit uses a baseline fixture,
  providing no new G5 evidence. Logs: `reports/auth-session-order-*.log`.

Grounded sources: installed auth-js 2.117.2 `GoTrueClient.ts` signOut/_signOut,
_removeSession and option declarations; React Native `setUpGlobals.js`; current
factory and adapter sources; [Supabase's versioned 2.117.2 release](https://github.com/supabase/supabase-js/releases/tag/v2.117.2).
The SDK fixture initially exposed malformed synthetic JWT encoding; the fixture
was corrected to base64url encoding without changing production verification.
No provider setting, credential, hosted database, deployment or billing state
changed. Raw diff review includes earlier uncommitted changes preserved in place.

Remaining: direct identity-adapter SDK getUser calls (which can remove sessions),
autonomous/external auth events, overlapping telemetry attribution, device account
capture/switch/removal ownership, PowerSync queue preservation during account
switch, request cancellation/deadlines, actual provider/session acceptance and
the wider release gates. A never-settling SDK boundary intentionally retains
ownership; releasing its queue on a racing timeout would permit stale teardown.
The full programme remains active.
