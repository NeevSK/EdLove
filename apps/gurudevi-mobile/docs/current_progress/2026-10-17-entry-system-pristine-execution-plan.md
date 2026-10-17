---
title: "Gurudevi Mobile Pristine Entry System Execution Plan"
status: "active"
created: 2026-10-17
updated: 2026-10-17
author: "Naveen"
scribe: "Codex"
tags: [entry, expo-58, react-native-0.88, auth, onboarding, recovery, first-value]
---

# Gurudevi Mobile Pristine Entry System Execution Plan

## Outcome

An icon tap reaches a useful, truthful surface quickly. Every intermediate
state has one owner, a human explanation, a safe recovery action, and a
bounded proof path. The system must remain usable on low-memory Android
hardware and must not make a living educational relationship subordinate to a
dashboard metric or an opaque automation flow.

## Evidence-based starting position

- Expo 58 exposes current Router route-state and protected-route capabilities;
  retain the existing central admission policy until its richer account and
  offline semantics are characterized.
- React Native 0.88 supplies React 19.3, New Architecture runtime changes,
  variable-font support, and current DevTools. None is a reason to introduce
  custom event dispatch, imperative native listeners, or a dependency upgrade.
- The current workspace dispatcher already resolves founder, principal,
  guardian, personal, commercial, and classroom paths with loading, retry,
  denial, and empty states.
- The present entry seam is still distributed: boot, admission, callback,
  deferred intent, onboarding reconciliation, and first-value selection do not
  yet share one typed presentation result.

## Non-goals

- No dependency upgrade, native project edit, or generated `android/`/`ios/`
  mutation in this program.
- No second auth listener, navigation writer, or parallel authorization model.
- No decorative continuous motion, artificial splash delay, or analytics that
  records callback payloads, identities, or educational activity as a proxy for
  human value.

## Target model

```text
EntrySnapshot (facts)
  runtime + identity + admission + offline freshness + intent + capacity
        ↓
resolveEntryPresentation (pure policy adapter)
        ↓
EntryPresentation
  boot | public | callback | onboarding | recovery | admitted
        ↓
one navigation adapter + one mounted presentation surface
```

The resolver does not replace `@repo/core` admission authority. It makes the
mobile composition of already-authoritative facts explicit, stable, and
testable.

## First-value contract

| Active capacity | First value owner | Required degraded state |
| --- | --- | --- |
| student | `/self` personal learning continuation | Saved local practice or clear offline status |
| teacher | workspace dispatcher → next classroom action | Permission retry, no-class empty state |
| guardian | workspace dispatcher → linked learner context | Explicit unavailable/empty state |
| principal/founder/admin | workspace dispatcher → operational priority | Permission retry and no-scope state |
| anonymous guest | `/self` safe exploration | Lease expiry and upgrade affordance |
| unknown/unresolved | `/self` safe fallback | Never infer institutional authority |

## Execution phases and exit gates

### P0 — Characterize before moving

- Add a route matrix covering cold/warm, online/offline, callback, invite, QR,
  guest, expired account, account swap, and interrupted onboarding.
- Verify actual installed dependency declarations and inspect every legacy
  pattern found by the repository deprecation ledger.
- Exit: no behavioral refactor begins without baseline assertions for each
  existing fallback.
- **Progress:** route/presentation matrix now characterizes cold signed-out,
  learner and institutional first-value entry, onboarding, recovery,
  mismatched-account offline rejection, and matching-account offline return.
  It also proves that anonymous sessions require completed local admission
  before protected content mounts, and that an expired deferred invite is
  purged instead of replayed. Expired guest cleanup now attempts every local
  cleanup operation and revokes the session even when one operation fails.
  The QR ingress now proves payload validation, persistence while admission is
  incomplete, one-time replay after admission, and no persistence for a
  rejected QR action. Interrupted onboarding now proves a server-saved setup
  remains recoverable after client reconciliation fails, and that a successful
  retry clears the recovery blocker. Native callback coverage proves that
  normalized callback parameters reach core validation, duplicate parameters
  remain rejectable, and both policy and transport failures expose a retry
  surface. G2 scenario contracts now prove invite → public admission →
  authenticated resumption and QR retention during account-mismatch restore.
  **P0 is complete at G1/G2/G3 only; it is not device evidence.**

### P1 — Typed mobile presentation adapter

- Introduce an AMBER-zone pure adapter in `src/entry` that translates the
  existing `BootstrapRouteState` and current route target into an explicit
  presentation kind.
- Keep `getAuthRouteTarget` and `SessionRouteGate` as authority during the
  characterization period; the adapter cannot mutate navigation or state.
- Exit: exhaustive G1 cases prove one presentation for every known route
  outcome and preserve current redirects byte-for-byte.

### P2 — Split gate responsibility without changing policy

- Extract presentation rendering and deferred-intent resumption from
  `SessionRouteGate`; retain one route writer.
- Add structural Expo Router protected routes only after proving they preserve
  boot, callback, recovery, guest, and offline semantics.
- Exit: no protected provider mounts before admission and no direct deep link
  can bypass policy.
- **Progress:** presentation and navigation decisions are now pure entry
  adapters. `SessionRouteGate` remains the sole side-effect owner: it drains
  pending intents and writes routes only after the pure adapter selects the
  target. Structural protected-route migration remains deferred until device
  evidence can prove the richer offline and recovery semantics.

### P3 — Durable onboarding admission

- Model onboarding command submission, server commitment, local reconciliation,
  and retry as explicit stages.
- Retain user-entered progress across recoverable network failure and expose
  account-safe recovery.
- Exit: G2 proof covers timeout-after-commit, duplicate retry, guest upgrade,
  and account switch.
- **Current seam:** client-side processing guards and repeatable server state
  do not provide a subject-bound completion receipt for timeout-after-commit.
  The required RED-zone contract and G2 cases are specified in
  [`2026-10-17-onboarding-admission-idempotency-rfc.md`](../architecture/2026-10-17-onboarding-admission-idempotency-rfc.md).
- **Progress:** approved implementation now sends an optional final-step UUID
  key, uses an account-scoped `operation_receipts` record for durable replay,
  and returns a completion receipt. No key exists for incomplete steps; a new
  authenticated subject receives a new key. The local server runner has not
  yet completed its receipt-replay test within the automation window, so P3
  remains incomplete pending that G2 result and device proof.

### P4 — First-value dispatch

- Preserve the workspace dispatcher as the institutional resolver.
- Add role-specific first-action selection only after each target has a real
  offline, empty, permission-denied, and retry contract.
- Exit: routing never pretends a generic dashboard is meaningful first value.
- **Progress:** every declared institutional capacity with an existing workspace
  surface now enters that dispatcher. Parent, leadership variants, and developer
  capacity normalize to their already-owned guardian, principal, and founder
  destinations; librarians and nurses retain the dispatcher’s explicit staff
  list fallback. A mounted dispatcher contract proves those redirects, the
  permission-retry control, and the no-classroom empty state. This is G3 under
  substituted permission/router/native primitives, not proof of a live Cedar
  snapshot or device rendering.

### P5 — Physical proof and operations

- Produce Android release-build evidence: cold/warm start, airplane mode,
  native callback, interrupted onboarding, and font scaling.
- Measure non-sensitive stage timing: native handoff, visible boot, admission,
  and first actionable surface.
- Exit: G5 evidence on the supported Android device plus staged telemetry.
- **Current blocker:** Android 14 device `SM A525F` is connected, but no
  Gurudevi development or release build is installed. Device inventory could
  not be queried through the current automation endpoint, so no app launch,
  callback dispatch, splash observation, or G5 claim was attempted.

## Hostile review gate

Reject a change if it answers any of these with “probably”:

1. Which account owns every cached input at this transition?
2. What does the person see if the network returns 503 after the server commits?
3. Does it create another route writer, deep-link listener, or entitlement
   authority?
4. Can a low-RAM Android device render it without a continuous GPU/JS loop?
5. What G-level evidence proves this exact path rather than a nearby happy path?

## Current operational goal

P0, P1, P2, and P4 now have source-level contracts. P3 has an approved,
partially verified server/client implementation; P5 remains blocked until a
Gurudevi development or release build is installed on the supported Android
device. Refuse P3–P5 completion claims until their respective server and
physical evidence exists. This is deliberately stricter than declaring success
from a unit-test-only routing change.
