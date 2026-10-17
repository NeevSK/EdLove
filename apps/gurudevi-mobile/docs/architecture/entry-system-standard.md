---
title: "Gurudevi Mobile Entry System Standard"
status: "active"
created: 2026-10-17
updated: 2026-10-17
author: "Naveen"
scribe: "Codex"
tags: [architecture, expo-58, entry, startup, auth, onboarding, recovery, offline]
---

# Gurudevi Mobile Entry System Standard

## Purpose

This is the canonical contract for the journey from tapping the Gurudevi icon
to reaching an admitted, useful protected surface. It supersedes no historical
record by deletion: earlier architecture notes remain evidence of decisions and
must be read through the status map below.

The entry system exists to establish a safe, intelligible state before the app
asks someone to act. It must not make public entry depend on a remote request,
admit a stale or different account, or turn a recoverable fault into a blank
screen.

## Current implementation map

| Concern | Current owner | Rule |
| --- | --- | --- |
| Native launch hold | `app/_layout.tsx` and entry splash handoff | Prevent auto-hide at module scope; release only after a committed React frame. |
| Essential local boot | `src/entry/EntryStartupBoundary.tsx` / `src/boot/startupCoordinator.ts` | Runtime, catalog, and device-account scope are bounded and retryable. |
| Session lifecycle | `@repo/core/hooks/useAuthLifecycle` | Restores session, resolves account state, protects against stale async identity results. |
| Entry admission and redirect | `src/entry/bootstrapRouteState.ts` / `SessionRouteGate.tsx` | One gate decides public, onboarding, recovery, or app entry. |
| External route intent | `app/+native-intent.tsx` / pending intent store | Validate at ingress; resume only after admission. |
| Auth callback completion | `app/auth/callback.tsx` / `@repo/core` deep-link manager | Reconstruct the canonical native callback after Router normalization and exchange it exactly once through the shared validated policy. |
| Onboarding command and reconciliation | `@repo/ui/screens/OnboardingScreen` / `OnboardingWrapper` | Server authority decides permanent-account completion; guest admission remains local. |
| Protected optional services | `AuthenticatedAppServices` | Mount only after the route decision enters the protected app. |

## State model

The system composes four independent facts. It must not collapse them into a
single boolean such as `isReady`.

```text
runtime:     starting | ready | failed
identity:    unresolved | none | guest | authenticated | inactive | expired
admission:   public | onboarding-required | admitted | recovery-required
intent:      none | auth-callback | invite | qr | deferred
```

The entry coordinator derives one presentation outcome:

```text
native launch
  -> visible boot recovery OR public shell
  -> auth/callback/onboarding/recovery/protected shell
  -> capacity-specific first value
```

No screen may independently promote a user to the protected shell. Screens
submit commands and expose progress; `SessionRouteGate` owns navigation from
authoritative state.

## Non-negotiable invariants

1. Public first paint is local and accessible. Network, analytics, sync,
   notifications, capability hydration, and optional sign-in helpers cannot
   block welcome or visible recovery.
2. A valid access token is not admission. Protected routes require a current
   subject plus verified lifecycle, onboarding, and capability/guest admission
   state.
3. Cached state is scoped to the active subject. A snapshot belonging to
   account A can never admit account B.
4. A guest is locally admitted only after local onboarding, active capacity,
   and a valid guest lease. Guest data promotion is a recoverable workflow,
   not a navigation side effect.
5. Every incoming URL is classified and sanitized before it becomes a route.
   Deferred intents are resumed once, after admission, or expire safely.
6. Expo Router owns operating-system URL ingress. The callback route owns the
   one-time authenticated code exchange on both web and native; no provider
   may register a competing link listener.
7. Server-confirmed onboarding and local reconciliation are separate stages.
   If reconciliation fails, show retryable “progress saved” recovery rather
   than sending the user back through onboarding or requiring a restart.
8. Splash release occurs after a committed first frame through one native
   handoff service. Failure to hide the native splash is logged but cannot
   crash the visible recovery surface.
9. Optional protected services fail independently. Their failure cannot revoke
   baseline admitted entry unless the underlying admission authority changes.

## User journeys and required outcomes

| Journey | Required outcome |
| --- | --- |
| Cold or warm signed-out launch | An accessible welcome action is usable without waiting for identity or network. |
| Returning authenticated launch | Enter the protected shell only when current local/remote admission is verified; otherwise show recovery or onboarding. |
| Offline return | Admit only the matching subject with a valid cached capability snapshot; clearly represent freshness. |
| Sign-up, login, Google OAuth, or magic link | Preserve a valid deferred intent and route through the central gate after session change. |
| OAuth cancelled, callback invalid, or callback expires | Return to auth with a human recovery action; never leave a dead callback route. |
| New permanent account | Complete required onboarding before protected access. |
| Guest exploration | Persist local admission, respect lease expiry, and offer a safe upgrade path without mixing guest and permanent scopes. |
| Onboarding request times out after server commit | Reconcile server state and continue; do not create a duplicate bond. |
| Inactive or expired account | Clear protected state and show account recovery or public entry. |
| Invite or QR deep link | Validate at ingress, retain only a bounded pending intent, then resume after admission. |
| Forced update | Render a clear update surface without exposing protected interactions beneath it. |

## First-value contract

Admission is not the product outcome. Once an active bond is available, the
first destination must be capacity-aware and intentionally small:

| Capacity | First useful surface |
| --- | --- |
| Learner | Continue today’s self/practice activity. |
| Educator | The next class, attendance, or current classroom action. |
| Guardian | Linked learner status or action. |
| School leader | Highest-priority operational signal. |
| Guest | Safe local exploration plus a clear upgrade affordance. |

The admission gate now sends founder, principal, teacher, administrator, and
guardian capacities to the existing `/workspace` dispatcher; that dispatcher
owns the capacity-specific operational surface and its loading, error,
permission-denied, and empty states. Students, guests, unresolved capacity,
and unknown future capacities retain `/self` as the safe personal fallback.
This is an intentionally conservative first-value contract: it establishes
correct entry ownership now without pretending that every role-specific first
action is already designed.

## Delivery sequence

The execution authority and current phase gates are maintained in
[`2026-10-17-entry-system-pristine-execution-plan.md`](../current_progress/2026-10-17-entry-system-pristine-execution-plan.md).

### Phase 0 — Truth ledger and characterization

- Maintain this document and a test-backed route/intent matrix.
- Mark historical documents in their frontmatter when a later canonical
  authority replaces their active instruction; do not delete history.
- Characterize current launches, callback paths, guest flows, recovery, and
  account switching before refactoring.
- **Status:** active. Callback policy is characterized; the complete state and
  device matrix remains open.

### Phase 1 — Launch ownership

- Keep only runtime/catalog/device-account scope in essential boot.
- Centralize native splash release behind the testable handoff adapter.
- Reach public interaction or visible retry without waiting for remote profile
  resolution.
- Establish release-build cold-start budgets and device evidence.
- **Status:** partially implemented. The native handoff is centralized and
  visible fallback exists; release-build/device evidence remains required.

### Phase 2 — Typed entry decision

- Introduce a pure typed resolver for runtime, identity, admission, and intent
  facts.
- Make route loops and protected-provider premature mounts impossible by test.

### Phase 3 — Account transition integrity

- Treat sign-in, OAuth, magic link, guest promotion, sign-out, and account
  swap as named workflows with cancellation, resume, and cache teardown.

### Phase 4 — Resumable onboarding admission

- Add idempotency and reconciliation contracts for initial bond and completion.
- Present explicit “saved, reconnecting admission” recovery after a committed
  server result cannot yet be reflected locally.

### Phase 5 — First value and operations

- Route admitted people to capacity-specific first value.
- Measure startup, admission, callback, onboarding reconciliation, deep-link,
  and recovery outcomes without sensitive payloads.

## Evidence requirements

| Level | Required proof |
| --- | --- |
| G1 | Pure entry decisions, account isolation, timeouts, retries, and route policy. |
| G2 | Offline return, guest upgrade, callback resume, account swap, and interrupted onboarding scenarios. |
| G3 | Mounted provider/route recovery interactions. |
| G4 | Release-like Android and iOS bundles plus Maestro launch flows. |
| G5 | Physical-device cold launch, warm launch, airplane mode, OAuth callback, and update-gate evidence. |
| R1 | Staged-release startup and recovery telemetry with no sensitive identifiers or payloads. |

## Historical-document status map

| Document | Reading status |
| --- | --- |
| `architecture/2026-09-03-entry-shell-reconstruction-spec.md` | Historical target topology; its acceptance criteria remain useful, but this standard owns current behavior. |
| `architecture/2026-06-26-welcome-auth-onboarding-flow.md` | Historical and already marked superseded; preserve its product intent only where compatible with current active-bond admission. |
| `architecture/bootstrap-and-entrypoint-standard.md` | Supporting implementation detail; this standard owns cross-boundary entry decisions. |
| `current_progress/2026-09-07-essential-startup-deadline-feature-spec.md` | Implemented narrow startup-safety slice; not the whole entry-system authority. |
| `current_progress/2026-09-07-bootstrap-route-state-adapter-feature-spec.md` | Supporting route-adapter record; retain for its bounded contract. |

## Hostile review questions

Before any entry-system change, answer all of these from source and tests:

- What happens if the network drops, stalls, or returns 503 at this exact
  transition?
- Can a callback, intent, cache, profile, entitlement, or pending write from
  account A influence account B?
- Does this change delay public first interaction, mount a protected provider,
  or create a second navigation writer?
- If the server committed but the client timed out, how is the outcome
  reconciled without duplicate durable work?
- What does the user see and do if every optional service fails?
- What physical-device evidence proves this beyond mocked code?
