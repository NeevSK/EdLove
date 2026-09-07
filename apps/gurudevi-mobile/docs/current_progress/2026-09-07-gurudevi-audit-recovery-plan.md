---
title: "Gurudevi Audit Recovery — Phased Implementation Plan"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, mobile, recovery, audit, implementation, quality]
---

# Gurudevi Audit Recovery — Phased Implementation Plan

## Purpose

Restore trust and coherence in the currently audited Gurudevi mobile app before
continuing broad feature expansion. The plan turns the original audit reports
and their 120-item decomposition into small, verifiable implementation slices.

This plan supplements—not replaces—the Beast Master Plan. Beast remains the
performance and feature-expansion program; this is the prerequisite recovery
program that makes the existing product safe, honest, and operable first.

## Source of truth

Read in this order before work begins:

1. Repository-root `AGENTS.md`.
2. `../../temp/GURUDEVI_AUDIT_INDEX.md`.
3. `../../temp/GURUDEVI_GRANULAR_LINE_BY_LINE_CROSSLIST.md` for source-linked
   granular items L001–L120.
4. `../../temp/GURUDEVI_FIRST_ABSTRACTION_PATTERNS.md` and
   `../../temp/GURUDEVI_SECOND_ABSTRACTION_CONTROLS.md`.
5. The original six audit files in `../../temp/`; they remain authoritative for
   narrative evidence and code excerpts.
6. `2026-08-28-beast-master-plan.md`, the PowerSync plan, the Auth/Deep Link
   audit, the A11y Gate consolidation, and the production-hardening runbook.

Never treat the decomposed ledger as 120 independent root causes. It is a
tracking index; the original reports and current source establish truth.

## Program rules

- One product behavior or shared contract per PR. Do not mix dependency cleanup
  with user-facing reliability work.
- A user must never be told an action worked unless durable success is known.
- A failure must be visible, recoverable where possible, and distinguishable
  from an empty result.
- Preserve intentional PowerSync transaction atomicity and local-only table
  rules; verify queue admission before changing sync behavior.
- Do not run `expo install --fix`, `expo install --check`, or destructive
  prebuild commands. Do not edit generated native directories.
- Android builds are Debug by default and run only in WSL against the active
  workspace, as defined by `AGENTS.md`.
- Existing unrelated worktree changes are not part of this program.

## Phase 0 — Recovery control plane

**Objective:** establish a clean, reproducible view of the stack and the
baseline without changing product behavior.

| Work | Ledger | Deliverable | Exit evidence |
|---|---|---|---|
| Reconcile declared/resolved React and RN versions | GD-001, GD-002 | Single owner/version decision | Manifest, lockfile, and installed package metadata agree; focused checks pass. |
| Refresh stack documentation | GD-003 | Reviewed generated stack-map change | `stack-map:bootstrap` then `stack-map`; annotations reviewed. |
| Capture recovery baseline | GD-035, L047 | Baseline evidence appended to Beast baseline | Bundle, route, a11y, type, test, and device/Observe evidence where available. |
| Retry diagnostics in intended environment | — | Diagnostic log | Expo doctor/diagnostics result recorded with Doppler/network context. |

**Do not:** upgrade dependencies opportunistically. Version reconciliation is a
dedicated compatibility change with physical-device validation.

## Phase 1 — Trust-critical repairs

**Objective:** remove paths that lose user work, lie about success, bypass
entitlements, crash on common navigation, or permit irreversible accidental
actions.

Implement in this order:

1. **Lifecycle and route authority proposal** — priority architecture slice.
   - Map all live sign-out, account-recovery, and account-switch callers before
     changing any behavior. The target is one coordinator with one
     account-scoped device-cleanup invariant; it must not silently bypass
     device-account cleanup during recovery.
   - Make the pure bootstrap-route contract in
     `packages/core/src/logic/auth/bootstrapRoutes.ts` the sole authority for
     bootstrap routing. Route code may consume its result, not recreate it from
     a mixture of Context and persisted Zustand state.
   - Split responsibilities currently concentrated in
     `packages/core/src/hooks/useAuthLifecycle.ts`: session observation,
     profile hydration, telemetry, account recovery, and device-account
     capture must have explicit owners and contracts.
   - Retire duplicate/obsolete lifecycle paths only after their live consumers,
     deep-link handling, and sync wiring are proven replaced. The unused native
     `useAuthLifecycle` export was removed after workspace-wide import tracing;
     `apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx` was retired
     after its live-needed deep-link and sync services were recovered in the
     entry shell. Its remaining composition had no importers.
   - This is a RED-zone proposal first under the Gurudevi quality gate: write
     a feature spec and targeted contract tests, obtain human approval, then
     implement in small PRs. Do not refactor `app/_layout.tsx` into another
     lifecycle owner.
2. **Entitlement and route safety** — GD-031, GD-011.
   - Make the premium-gated AI route canonical for both tab and deep-link entry.
   - Replace implicit Settings navigation props with a typed route adapter or
     router-native navigation path; cover every entry route.
3. **Write truthfulness** — GD-005, GD-006, GD-007, GD-019.
   - Gradebook, Mood, Voice Journal, and admin forms must retain input on
     failure, report the result, and only close/reset after success.
4. **Destructive and side-effect truthfulness** — GD-017, GD-018, GD-010.
   - Require a native confirmation for cycle deletion.
   - Use the canonical clipboard adapter before success feedback.
   - Remove or visibly gate the fabricated streak until it is derived from data.

**Exit evidence:** lifecycle/route tests cover cold bootstrap, account recovery,
account switching, and every sign-out caller; tests cover rejection, offline,
and soft-failure paths; no success toast/modal close/reset occurs on a failed
action; a physical-device smoke validates Settings, AI entitlement, clipboard,
and delete confirmation.

## Phase 2 — Shared feedback and state contracts

**Objective:** stop the same failure shape from reappearing in every domain.

| Contract | Ledger | Required implementation outcome |
|---|---|---|
| Mutation outcome | GD-004–GD-009, GD-019 | Typed `success | queued | failed` result; visible feedback; no console-only recovery. |
| Load state | GD-008, GD-009, GD-020 | Explicit loading, error/retry, empty, and stale states; error never masquerades as empty. |
| Account/logout boundary | GD-012–GD-016 | One documented user-feedback path, account-scoped cleanup invariant, and queue-admission tests. |
| UI boundary | GD-024 | Replace local stand-ins with `@repo/ui` primitives; keep shared changes narrowly scoped. |
| FAB contract | GD-014 | Either mount the intended renderer and test it or formally retire the registration contract. |

Start with a small shared helper only after proving it replaces at least two
real duplicated paths. Do not create a new abstraction for one component.

**Exit evidence:** static scan has no unqualified native `alert()` or newly
introduced console-only async catch; focused component tests demonstrate
failure/retry behavior; relevant package checks pass.

## Phase 3 — Accessible and humane core journeys

**Objective:** make Auth, account deletion, Self, and workspace controls usable
with screen readers, dynamic type, and small touch targets.

| Slice | Ledger | First screens |
|---|---|---|
| Auth recovery | GD-025, GD-027, GD-028 | AuthScreen: labels, roles, password guidance, existing-account handoff preserving email. |
| Account deletion | GD-026 | DeleteAccountModal: modal semantics, control states, processing announcement. |
| Self content | GD-029 | Mood picker, Voice Journal, Joy/Gratitude/Fire Journal controls and state announcements. |
| Workspace controls | GD-030 | Teacher dashboard, Student/Guardian workspace controls; hitSlop for compact icon actions. |

Use the existing A11y Gate consolidation as the mathematical/ergonomic
standard. Do not add a competing accessibility utility.

**Exit evidence:** 48dp or explicit hitSlop for compact controls; screen-reader
labels/hints/state announcements; 100%, 140%, and 200% font-scale review;
focused native device walkthrough.

## Phase 4 — Lifecycle, data, and observability coherence

**Objective:** turn timing and boundary assumptions into tested contracts.

1. GD-022: register and reconcile auth listener/fetch behavior with a race test.
   The Phase 1 coordinator/route-authority work is the prerequisite; Phase 4
   completes race, expired-session, and telemetry outcome verification.
2. GD-013/GD-015: verify the canonical sign-out coordinator in multi-account,
   offline, and recovery cases; distinguish “started” audit events from
   completed outcomes.
3. GD-016: prove local-only tables cannot enter the upload queue; retain
   unsupported-table atomic rollback testing.
4. GD-036: test magic-link callback handling on a native development client.
5. GD-020: add visible stale/error state to analytics polling.
6. GD-021: rebuild the current startup graph from live source, then act only on
   measured bottlenecks.

**Exit evidence:** deterministic tests for auth and queue boundaries; a
multi-account logout/device test; deep-link device evidence; observability
shows freshness and failures rather than console-only logs.

## Phase 5 — Measured architecture simplification

**Objective:** reduce accidental complexity without destabilizing the New
Architecture/offline stack.

- GD-032: document each SQLite engine’s owner, platform, data class, and sync
  behavior. Remove nothing until no consumer and migration safety are proven.
- GD-033: migrate direct icon consumers to the bridge, then remove only unused
  icon dependencies.
- GD-034: use existing style-stack audits to decide whether the NativeWind/CSS
  overlap can be reduced; production preview risk needs an explicit decision.
- GD-023: retire only truly unused exports after current-source evidence.

**Exit evidence:** dependency/stack annotations updated, bundle and native graph
delta captured, all touched platform paths tested, and no sacred pin changed
without explicit approval.

## Runtime stabilization track — Metro color resolution

The NativeWind / `react-native-css` singleton Metro resolution change is a
separate runtime fix, not evidence that the color issue is fully closed. The
current diagnosis log records no fresh `Input` exception or `rgb(NaN, NaN,
NaN)` warning immediately after device reload, but the phone locked before the
signed-in tab shell could be exercised.

Before marking this resolved:

1. Unlock the device and traverse the signed-in tab shell and SVG/icon-heavy
   screens with Metro logging active.
2. Capture a clean device-log/Metro evidence window.
3. If invalid-brush warnings recur, capture the concrete component stack and
   repair that call site; do not suppress the warning or broadly replace phase
   variables.
4. Record final evidence in
   `2026-09-07-native-color-runtime-diagnosis.md` and the audit worklog.

## Phase 6 — Resume Beast expansion

Resume Beast P1–P7 only after Phases 0–4 are green. The recovery plan does not
cancel the Beast roadmap; it provides the product-trust foundation needed for
Self, Workspace, Library, Community, and growth work to compound safely.

## Definition of done for each PR

- Maps its changes to GD and L IDs.
- States the user-visible success, failure, offline, and retry behavior.
- Adds or strengthens tests; does not weaken existing tests or gates.
- Runs the smallest relevant test/lint/type commands, then required package
  checks and `pnpm run check:anti-slop`.
- Uses device validation for native behavior, accessibility, deep links, or
  destructive actions.
- Updates the granular cross-list status, coverage matrix, worklog, and this
  plan when a phase milestone changes.

## Way forward

Start with a Phase 0 short PR that only establishes truth. Next, create a
RED-zone lifecycle/route-authority proposal with contract tests but no broad
refactor. After approval, take Phase 1 in narrow PRs: lifecycle coordinator and
bootstrap authority; entitlement/navigation; grade/mood/voice; destructive
actions; admin soft-failure forms. This sequence reduces systemic user harm
without entangling performance work or dependency churn.
