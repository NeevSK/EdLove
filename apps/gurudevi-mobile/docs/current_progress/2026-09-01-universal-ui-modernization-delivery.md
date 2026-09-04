---
title: "Universal UI Modernization — Delivery Record"
status: "active"
created: 2026-09-01
updated: 2026-09-01
author: "Naveen"
scribe: "Codex"
tags: [universal-ui, expo-router, react-native-web, local-first, powersync, accessibility, delivery]
---

# Universal UI Modernization — Delivery Record

## Purpose and authority

This is the active delivery record for the route-shell and capability
modernization. It turns the work into small, reviewable milestones instead of
an open-ended sequence of UI repairs. It is the progress source of truth for
this program; it does not replace the domain, identity, storage, or native
build contracts linked below.

The target is a coherent experience across web and native for a local-first,
multi-device, multi-account product. A route is not complete because it
renders: it must have a truthful state model, accessible interaction, bounded
layout ownership, honest capability behavior, and evidence at the platforms it
claims to support.

## Existing contracts this record builds on

- [PowerSync Web / Native Boot Boundary](../architecture/2026-06-14-powersync-web-native-boot-boundary.md)
  defines platform-scoped data bootstrapping. UI work must not make PowerSync a
  root-render prerequisite.
- [Multi-Account Contract](2026-06-26-multi-account-contract.md) and
  [Canonical Account State Model](2026-06-26-canonical-account-state-model.md)
  define account lifecycle semantics.
- [Local-first architecture principles](../../../../docs/Core/local-first-architecture-principles.md)
  and [data state ownership map](../../../../docs/Core/data-state-ownership-map.md)
  define storage and synchronization ownership.
- [React Native Web sustainability plan](2026-07-14-react-native-web-sustainability-plan.md)
  and [web runtime baseline](../infra/2026-09-01-web-runtime-shim-and-watcher-baseline.md)
  record runtime and watcher evidence.
- [Interaction delight audit](2026-08-31-interaction-delight-audit-and-plan.md)
  remains the motion, sensory, and device-capability design record.
- [Universal UI route-shell decision](../../../../docs/decisions/2026-09-01-universal-ui-route-shell-contract.md),
  [runtime capability decision](../../../../docs/decisions/2026-09-01-web-runtime-capability-boundaries.md),
  and [public-flow completion decision](../../../../docs/decisions/2026-09-01-public-flow-completion-boundary.md)
  are binding architectural constraints for this delivery work.
- [Account lifecycle foundation](../../../../docs/decisions/2026-09-01-account-lifecycle-foundation.md)
  defines the account/device/session/relationship boundary that route shells
  must consume.

## Non-negotiable product contracts

### Universal route and interaction contract

- Every route has one identified vertical scroll owner. The document remains
  clipped; a route shell, list, or canvas owns scrolling deliberately. Nested
  competing vertical scroll containers are a defect.
- Decorative layers, closed portals, glows, and toasts never receive pointer
  input. A modal, sheet, or command surface owns focus and pointer interception
  only while open.
- Every meaningful action has visible idle, pending, success, recoverable
  error, unavailable, and retry/cancel behavior as applicable. Keyboard and
  pointer activation are equivalent on web.
- Native and web can render differently, but their route title, active state,
  visibility, permission decision, and navigation intent come from shared
  metadata rather than duplicate policy.

### Local-first, identity, and device contract

- Public routing must remain usable before an account or local database exists.
  An unavailable sync provider must never blank the root route tree.
- Storage, local data, queued work, and cached account context are scoped to
  the active account and platform boundary. Switching, sign-out, account
  removal, and device sharing must not reveal the prior account's view or data.
- Native uses its approved local-first PowerSync/SQLite path. Browser behavior
  uses only an explicitly supported browser adapter; it must not pretend to
  have performed native-only storage, permissions, or device work.
- Sync, refresh, offline, and conflict states are product states. A valid route
  remains visible during background refresh, with a non-blocking status and a
  recovery action where needed.

### Runtime and capability contract

- Expo Router, React Native, React Native Web, RNGH, Reanimated, Worklets, and
  Screens use their real approved runtimes. No no-op core runtime shim may be
  introduced to obtain a bundle.
- Platform-specific functionality is recorded as `supported`, `adapter`, or
  `unavailable`, with an owning route, explicit failure UX, and a test. A fake
  cancellation or success is a defect.
- Sacred package versions and native configuration rules in `AGENTS.md` are
  unchanged by this program unless separately approved.

## Delivery map

| Milestone | Scope | Completion evidence | Status |
| --- | --- | --- | --- |
| 0. Foundation and containment | Root provider neutrality, real core web runtimes, portal/layer safety, router discovery guard, theme capability | Scoped type checks and interaction reproduction/repair evidence | In progress — initial fixes landed; systematic coverage remains |
| 1. Public Gateway Contract | Welcome, Auth, Onboarding end-to-end; consent, theme/language, guest/sign-in, recovery, completion/back paths | Browser suite at 375/768/1440 plus unit tests for persistence and controller state | In progress — Welcome uses the gateway shell; shared onboarding state/drafts landed; reconciliation and web layout remain |
| 2. Authenticated Shell Contract | Shared route metadata; native tabs and web rail/topbar; route lifecycle and Workspace refresh behavior | Route-tree, metadata, keyboard/focus, active-state, and Workspace parameter tests | Partially started; no shell redesign claimed |
| 3. Tab-route stabilization | Workspace, Self, Community, Library, Profile one at a time under scroll/layer contract | Per-route browser/native smoke and state/error review | Planned |
| 4. Capability migration | Owned registry and route-by-route browser adapter or unavailable state | Capability matrix tests; Metro alias removed only after owner-route proof | In progress — gateway-critical registry and truthful Stripe web state landed; no aliases removed |
| 5. Consolidation | Delete unreachable compatibility surfaces and duplicate source variants | Reachability proof, no route collisions, regression suite, documentation update | Planned |

## Milestone 1 — Public Gateway Contract

The public path is a complete user journey, not a set of isolated pages:

1. `/` or `/welcome` shows usable welcome content and consent handling.
2. Consent links, language, and theme controls work with pointer, keyboard, and
   persisted preference behavior.
3. Login, registration, and guest entry expose pending/error/retry feedback and
   never silently discard an action.
4. Back navigation preserves appropriate public state without leaking a prior
   account's authenticated state.
5. Onboarding resumes safely, supports back and recovery, and reaches a
   deterministic completed destination for the active account.
6. Sign-out or account removal returns to the correct public state after
   account-scoped cleanup; another locally stored account remains explicit, not
   implicitly selected.

Implementation slices:

1. Adopt `GatewayScreenShell` for Welcome web rendering and remove its
   independent viewport/scroll composition.
2. Make Auth action outcomes explicit and retain the guarded guest flow.
3. Make `LanguageProvider` the sole UI preference writer after i18n bootstrap;
   add persistence and accessible-control coverage.
4. Extract an onboarding controller/state model from rendering, then add the
   web renderer under the gateway scroll and layer contract.
5. Add the public-flow browser suite before calling this milestone complete.

## Lifecycle-first implementation order

Gurudevi is a multi-account, multi-device, local-first product. Route shells
and screens therefore sit on top of an account lifecycle, rather than defining
it themselves. The implementation order is binding:

1. Define and verify lifecycle transitions for bootstrap, sign-in, anonymous
   entry, onboarding, account switching, sign-out, deletion, deactivation,
   reactivation, device management, and guardian/child context changes.
2. Make active-account storage, PowerSync ownership, queued mutations, and
   route decisions follow that lifecycle. A transition must either finish with
   a recoverable state or preserve the prior safe state; it may not leave a
   hybrid account view.
3. Extract shared journey controllers from duplicated platform renderers. The
   first target is onboarding: one typed state model and draft repository,
   with native and web renderers reduced to platform presentation.
4. Apply the gateway scroll/layer contract to Welcome, Auth, and the rebuilt
   onboarding renderer. Prove their complete end paths in a real browser.
5. Use the resulting shell, lifecycle, and capability contracts when moving
   through authenticated internal routes one at a time.

Temporary breakage is acceptable only inside a bounded branch while the
affected lifecycle and recovery path are under active verification. It is not
acceptable to leave a public route, stored account state, or device state in a
partially migrated condition.

## Controller extraction rule

Platform renderers must not independently own domain transitions, persistence
formats, API completion ordering, or recovery policy. A shared controller owns
those decisions; renderers own presentation, platform input, and platform-only
feedback. A large platform file is a refactoring signal when it mixes both
classes of responsibility, not a reason to duplicate another renderer.

## Working method and handoff protocol

Each implementation slice must name:

- its route(s) and account/device states;
- its scroll owner and interactive layers;
- the state transitions it owns, including offline, pending, error, retry,
  cancellation, and unavailable behavior;
- its web/native capability status and any adapter;
- focused tests plus the platform evidence still required.

Implementation agents receive one slice at a time. An independent review
checks the changed surface against these contracts before integration. The
lead updates this record with facts only: completed evidence, known gaps, and
the next bounded slice. Broad UI rewrites, dependency updates, and shim
deletion are not accepted as substitutes for that process.

## Verification gates

After each batch, run the proportionate checks for touched packages:

1. Type check, focused unit tests, lint/format check, and the anti-slop gate.
2. Expo Router discovery: no helper/default-export warnings or duplicate URL
   stems.
3. Browser verification at 375px, 768px, and 1440px for target journeys:
   pointer hit targets, Tab focus, Enter/Space, scroll-to-end, modal focus and
   pointer isolation, persisted language/theme, and displayed error/retry.
4. Native smoke where the slice touches native behavior: five tabs, header
   actions, gesture/animation behavior, and native theme transition.
5. Local-first/account verification where state is stored or synchronized:
   reload, offline, queued work, account switch, sign-out, account deletion,
   and no cross-account view/data leakage.

## Current facts and open risks

Completed foundation work includes removal of the root Gluestack facade,
portal pointer isolation on web, closed modal isolation, real core web runtime
resolution for RNGH/Reanimated/Worklets/Screens, theme transition adapters,
route-tree hygiene, initial shared navigation metadata, and account-scoped
onboarding draft storage on web and native. These are
foundational fixes, not a claim that all screen renderers are modernized.

The latest independent onboarding audit confirmed the canonical completion path
as `app/onboarding` → `OnboardingWrapper` → platform renderer → root route
guard → `/self`. It also established the next required slice: a shared
controller and account-scoped draft repository, followed by native migration
before the web renderer is rebuilt. The web renderer still has competing scroll
surfaces and completion can strand a remotely completed user when profile
reconciliation fails. Neither issue is accepted as cosmetic debt.

The first controller extraction is complete: native and web onboarding now use
one typed journey reducer, bounded step transitions, completion states, and a
validated account-owned draft format that reads both historical renderer
formats. This does not claim the renderer, API mutation ordering, or profile
reconciliation is fully shared yet; those are the next extraction slice.

The account lifecycle audit found real but fragmented session and device
machinery. The next lifecycle foundation must unify conflicting logout and
PowerSync cleanup paths, wire non-anonymous account capture into bootstrap,
and distinguish remote device/session management from browser-local controls.
Deactivation/reactivation and retention-aware deletion are not currently
implemented; guardian/student links require their own auditable relationship
lifecycle rather than account-deletion side effects.

The active implementation detail is [Account Lifecycle Foundation — Phase
1](2026-09-01-account-lifecycle-foundation-phase-1.md). It limits the next
batch to lifecycle contracts, verified remembered-account capture, and
truthful browser device management before any destructive-policy migration.
Lifecycle contracts and verified account capture are complete; browser device
management is explicitly local-only. Lifecycle capability lookup distinguishes
native adapter work from web unavailability; no browser adapter may claim a
native remote action succeeded.

Known open risks:

- Onboarding still duplicates API mutation ordering and renderer structure.
  It requires explicit `saving → remotely-complete → reconciling → completed
  | needs-retry` behavior and a one-scroll-owner web renderer.
- Browser capability ownership remains distributed across Metro aliases; no
  bulk shim removal is authorized.
- Existing tests establish some contracts but do not yet prove the full public
  flow, responsive interaction, or account/device lifecycle.
- The existing PowerSync web/native record contains historical fallback detail;
  browser PowerSync adoption must be verified as a separate capability decision
  before UI code depends on it.

## Update rule

Update this document only when a milestone or a verification fact changes.
Link detailed implementation notes rather than duplicating them here. If a new
decision changes a non-negotiable contract, add a short ADR under
`docs/decisions/` and link it above.
