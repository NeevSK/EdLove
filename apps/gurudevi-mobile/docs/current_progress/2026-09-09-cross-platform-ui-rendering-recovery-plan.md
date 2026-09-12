---
title: "Cross-Platform UI Rendering Recovery and Capability Hydration Plan"
status: "in-progress"
created: 2026-09-09
updated: 2026-09-09
author: "Codex"
tags: [ui, rendering, mobile, web, feature-flags, app-catalog, authz, entitlements, cedar]
---

# Cross-Platform UI Rendering Recovery and Capability Hydration Plan

## Executive summary

The mobile and web applications share the same entry shell and permission
evaluator. The AppCatalog is assembled during startup, and the web PowerSync
provider no longer hides the route tree while its database initializes. The
primary remaining failure is capability hydration: `sanctuaryFeature()` fails
closed until entitlement state and Cedar state are ready, but entitlement
hydration is not invoked by the live application and Cedar hydration is scoped
mostly to the workspace route. As a result, normal `can()` checks remain
`not_initialized`, causing self, community, library, and workspace surfaces to
be empty, locked, or reduced to fallback states on both platforms.

There is a second independent blank-screen path. When authenticated profile
resolution fails, `SessionRouteGate` returns `null` while the route policy is
still booting. The user receives no visible recovery state.

This plan establishes one capability lifecycle, one route admission contract,
truthful loading and failure UI, and cross-platform render tests. The baseline
rendering slice described below is now implemented; the remaining items are
the hardening and verification work required before calling the recovery done.

## Implemented baseline slice — 2026-09-09

- Added `CapabilityHydrationProvider` to the live entry tree. It hydrates
  entitlements per authenticated account and active perspective without
  clearing cached state during auth bootstrap.
- Mounted the existing `FeatureProvider` in the live tree so feature and
  permission consumers have a real provider on native and web.
- Added a narrowly scoped baseline policy: read-only shell surfaces can render
  for an active user while remote Cedar and entitlement state hydrates. Writes,
  paid capabilities, and privileged operations still fail closed.
- Established `SECOND_CLASS` as the default citizenship for normalized user
  contexts and `free` as the entitlement baseline; explicit first-class and
  third-class identities remain meaningful.
- Made role presentation capacity-aware for the self surface, so capacities
  such as student, teacher, guardian, principal, founder, and admin select a
  useful base UI without granting operations.
- Replaced the profile-boot blank path with a visible branded loading/error
  recovery state and made PowerSync startup non-blocking for route rendering.

The baseline policy is presentation-oriented. Server-side authorization and
protected data operations remain the security boundary and must continue to
evaluate the complete Cedar, entitlement, and citizenship context.

### G1 → G2 evidence now available

The route-gate suite remains a G1 harness when run through mocked host seams,
but it now has an explicit G2 scenario command:

```text
pnpm --filter gurudevi-mobile test:g2:capability
```

The scenarios cover visible protected bootstrap, public-route continuity,
index-route continuity, guarded redirect transition, and profile-failure retry
recovery. The assertions observe mounted output, redirect behavior, and the
retry action. This is G2 scenario evidence, not G3 component-real, G4
browser/Metro, or G5 device evidence. The next promotion is to run the same
scenario contract through the real app/provider tree and then through web and
Metro runtime lanes.

The declared G2 command currently passes 5/5 scenarios with zero runner
findings. The ordinary mobile Vitest, watch, UI, and Playwright scripts now
also declare their evidence level explicitly, so future results cannot be
reported without stating whether they are boundary or platform evidence.

### G3 component-real evidence now available

The preserved G1/G2 route suite is also included in the app-level G3 lane,
alongside a new real React lifecycle suite for
`CapabilityHydrationProvider`:

```text
pnpm --filter gurudevi-mobile test:g3:capability
```

The latest run passes 21/21 scenarios: five route-gate scenarios, three
hydration scenarios, one cross-platform feature-provider synchronization
scenario, and twelve capability-matrix scenarios covering all seven baseline
capacities, missing-citizenship defaulting, third-class baseline reads,
third-class local personal mutations, and fail-closed privileged decisions.
The provider, route-gate, and permission-hook
implementations execute with real React effects and state lifecycle. Auth,
Zustand stores, router, and branded host primitives remain narrow test seams;
this is therefore not G4 browser/Metro evidence or G5 device evidence.

### Reusable testing-model contribution

This slice contributes a repeatable promotion pattern to the repository:

1. Keep the same scenario names and assertions in the lower G1/G2 lane.
2. Promote the actual component/provider implementation into the G3 lane.
3. Exercise the domain as a matrix, not a single happy-path identity.
4. Declare the evidence level in the package script and report the exact
   engine, seams, scenario count, and limitations.
5. Promote the unchanged scenario contract to G4 browser/Metro and G5 device
   lanes instead of creating a second, weaker test definition.

That model makes a green result useful without allowing a mocked result to be
mistaken for platform or device proof.

### Hardening findings closed — 2026-09-09

- Anonymous users can no longer use the bootstrap fallback; a principal is
  required before baseline UI is exposed.
- Capacity-specific dashboards are no longer treated as universal baseline
  surfaces. Bootstrap exposes generic sanctuary/library/community reads while
  role-specific surfaces wait for their actual authorization context.
- Web now runs the same feature-flag recomputation/subscription lifecycle as
  native instead of using a no-op provider.
- Entitlement and feature-flag responses ignore stale requests after an
  account, perspective, or context change.
- Capability hydration exposes a visible retry notice while preserving the
  baseline shell.
- The G3 matrix now covers the anonymous boundary, all supported capacities,
  free/second-class defaults, and fail-closed privileged operations.
- Removed the unused `useDomainFeatures()` hook-order violation so registry
  consumers cannot call a hook from a changing `.map()` list.
- Third-class is now modeled as local-only rather than UI-denied: baseline
  reads and personal sanctuary mutations remain available, while the
  local-first query path and PowerSync gate prevent account/cloud retention.
  Shared/community mutations still require an authenticated synchronized
  identity because they cannot be meaningfully local-only.
- Web now uses a browser-native local persistence adapter backed by
  `localStorage`, with an in-memory fallback for SSR, private browsing, or
  storage-quota/security failures. The fallback preserves the current tab
  session without pretending that data was durably saved.

### Verification limits still open

- The current evidence is G1/G2/G3 component/runtime evidence. It does not
  prove browser CSS/Metro behavior (G4), native device behavior (G5), or
  production assurance (R1).
- The repository-wide evidence audit still reports unclassified test scripts
  in unrelated packages; the capability scripts added here are classified.
- The repository anti-slop gate still reports inherited findings across the
  broad dirty worktree, including unrelated app changes. The touched
  capability files pass the scoped Biome check; the full gate is not green.

## Evidence and confirmed findings

### 1. Access evaluation fails closed before capability hydration

`isFeatureAccessContextReady()` requires both a loaded Cedar snapshot and a
verified or cached entitlement snapshot:

- `packages/core/src/logic/permissions/accessContext.ts:31-36`
- `packages/core/src/logic/permissions/sanctuaryFeature.ts:69-75`

`usePermissions()` supplies those values from Zustand stores and then routes
all `can()` checks through `sanctuaryFeature()`:

- `packages/core/src/logic/permissions/hooks/usePermissions.ts:152-204`

Therefore a normal `can()` call returns false while either source is not ready,
even when the subject is a baseline personal or guest-read capability.

### 2. Entitlement hydration is now session-scoped and recoverable

`CapabilityHydrationProvider` invokes `loadEntitlements()` for the active
account/perspective and exposes a retryable notice when the remote snapshot
fails. The store also ignores stale responses after an account or perspective
change. This closes the original boot omission while preserving a safe
baseline shell:

- `packages/core/src/providers/CapabilityHydrationProvider.tsx`
- `packages/core/src/store/useEntitlementStore.ts`
- `apps/gurudevi-mobile/src/entry/EntryShell.tsx`

The remaining proof gap is platform runtime validation of that provider tree,
not an unconnected entitlement call.

### 3. Cedar hydration is route-local rather than session-scoped

`useCedarDecisionStore.loadDecisions()` is invoked by the workspace dispatcher
and during perspective switches. Self, community, and library can render
before that route is entered and therefore see `snapshotLoaded=false`:

- `packages/core/src/store/useCedarDecisionStore.ts:47-159`
- `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx`
- `packages/core/src/store/usePerspectiveStore.ts:146-183`

The permission source needed by the whole authenticated shell must be hydrated
at the authenticated account/perspective boundary, not by one destination
screen.

### 4. FeatureProvider is now mounted on both platforms

`EntryShell` mounts the provider and the implementation uses one shared
recompute/subscription lifecycle for native and web. The previous web no-op
path is gone, so registry and rollout decisions update from the same context:

- `packages/ui/src/providers/FeatureProvider.tsx`
- `apps/gurudevi-mobile/src/entry/EntryShell.tsx`

### 5. The route gate previously rendered nothing after a profile error

When a session exists without a usable cached capability snapshot and profile
resolution reports an error, route readiness remains false:

- `apps/gurudevi-mobile/src/boot/sessionRouteReadiness.ts:41-50`

The route gate previously returned `null` for non-public paths:

- `apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx:18-24`

This was a direct blank-screen path on both native and web. It now renders a
visible retryable branded state and the G2/G3 route suites cover the recovery
transition.

### 6. AppCatalog registration is present and early

Startup registers the catalog before `EntryShell` mounts:

- `apps/gurudevi-mobile/src/entry/EntryStartupBoundary.tsx:74-105`
- `apps/gurudevi-mobile/src/boot/startupCoordinator.ts:55-71`
- `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts:25-38`

The registry is therefore not the first suspected cause. Its role is declaring
domain metadata; it does not load authorization, entitlements, or runtime flag
state.

### 7. Two previously identified web/native hazards are already addressed

The web PowerSync provider now keeps its children mounted when the database is
not ready:

- `apps/gurudevi-mobile/src/providers/PowerSyncProvider.web.tsx:86-94`

The working tree also contains a no-op identity guard for empty FAB cleanup in
`packages/ui/src/context/FABContext.tsx`. That addresses the documented
`Maximum update depth exceeded` shell crash and should be verified separately,
not confused with capability hydration.

## Current render chain

```text
Expo Router root
  -> EntryStartupBoundary
     -> bootstrapPlatform
     -> registerAppCatalog
     -> initializeDeviceAccounts
  -> EntryShell
     -> GlobalProvider
        -> AuthProvider / useAuthLifecycle
     -> SessionRouteGate
        -> Stack routes
           -> native or web tab shell
              -> domain screen
                 -> usePermissions().can()
                    -> sanctuaryFeature()
                       -> Cedar + entitlement + flags
```

The chain currently has no single owner responsible for hydrating all inputs
needed by the final evaluator.

## Target invariants

The implementation is complete only when these statements are true:

1. The public welcome/auth/onboarding routes can render without Cedar,
   entitlement, PowerSync, analytics, or optional native services.
2. An authenticated account is not admitted to protected content until its
   profile identity is tied to the current session.
3. Authenticated capability hydration has one owner and one lifecycle. Domain
   screens do not independently bootstrap Cedar or entitlements.
4. Every capability source has explicit states: `unknown`, `loading`,
   `verified`, `cached`, `stale`, and `error` where applicable.
5. No route gate returns a blank `null` state for a recoverable condition.
6. A denied feature renders an intentional empty, locked, upgrade, or
   unavailable state rather than disappearing accidentally.
7. Guest baseline exploration is an explicit policy decision, not an accidental
   side effect of an uninitialized authorization context.
8. Mobile and web use the same policy result while retaining platform-specific
   renderers and capability adapters.
9. AppCatalog registration is validated once at boot and never used as a
   substitute for runtime hydration.
10. A fresh browser tab, a cold native launch, an offline cached launch, an
    expired snapshot, a signed-out launch, and an account switch all have a
    visible outcome.

## Holistic implementation plan

### Phase 0 - Establish a reproducible baseline

Owner: app/platform maintainers.

1. Capture the current state for these journeys on web and native:
   - signed-out welcome;
   - authenticated account with a valid profile;
   - authenticated account with profile/API failure;
   - account with no entitlement snapshot;
   - account with cached entitlement and Cedar snapshots;
   - workspace, self, community, and library entry.
2. Record the route path, visible state, console/logcat errors, and the values
   of `manifestLoaded`, entitlement `readiness`, Cedar `snapshotLoaded`, and
   feature snapshot presence.
3. Preserve existing uncommitted user changes. Do not run destructive Expo
   regeneration or dependency repair commands.

Exit gate: each failure can be reproduced by a named test fixture or a
documented manual journey.

### Phase 1 - Create one authenticated capability coordinator

Owners: `packages/core`, `apps/gurudevi-mobile`.

1. Add a small session-scoped coordinator responsible for:
   - current auth subject ID;
   - active perspective/bond scope;
   - entitlement loading;
   - Cedar decision loading;
   - feature-flag recomputation/subscription;
   - cancellation and account-generation protection.
2. Invoke it from the authenticated shell boundary after profile identity is
   confirmed, not from individual screens.
3. Use the active perspective to derive a single canonical scope object. A
   perspective switch must invalidate the old scope atomically and load the
   new scope before protected surfaces claim readiness.
4. Keep the public route tree independent from this coordinator. Guests may
   use a separate explicit baseline policy.
5. Ensure remote failures preserve a valid fresh cache, mark the source
   `cached` or `stale`, and expose a retryable error when no safe cache exists.

Exit gate: all authenticated entry paths converge on the same coordinator and
no screen needs to call `loadDecisions()` or `loadEntitlements()` to become
renderable.

### Phase 2 - Mount the flag lifecycle correctly

Owners: `apps/gurudevi-mobile/src/entry/EntryShell.tsx`,
`packages/core/src/providers/GlobalProvider.tsx`, `packages/ui` if needed.

1. Mount `FeatureProvider` beneath `AuthProvider`, because the native provider
   calls `usePermissions()` and requires the auth context.
2. Keep the web provider non-blocking. It may hydrate and subscribe, but it
   must never withhold the route shell.
3. Verify GrowthBook/default/operational-flag behavior when the remote rollout
   service is unavailable.
4. Add a log/breadcrumb containing flag snapshot age and source, without
   emitting sensitive user data.

Exit gate: flag changes update the store after auth/perspective changes, and a
remote flag outage leaves the app with a truthful fallback rather than a blank
surface.

### Phase 3 - Separate route admission from feature presentation

Owners: `apps/gurudevi-mobile/src/entry`, `packages/core/src/logic/auth`,
`packages/ui`.

1. Extend the route state model with a visible capability-bootstrap state:
   `loading`, `cached`, `ready`, `recoverable-error`, and `blocked`.
2. Replace `SessionRouteGate`'s recoverable `return null` branch with a branded
   startup recovery surface containing:
   - concise explanation;
   - retry action;
   - offline/cached indication where relevant;
   - sign-out or account-recovery action only where policy allows.
3. Keep redirect policy pure and testable. Route components should not issue
   competing auth redirects.
4. Prevent stale account A data from being shown while account B is resolving.

Exit gate: no authenticated route can produce a blank screen solely because
profile, entitlement, or authorization resolution failed.

### Phase 4 - Make domain rendering capability-aware

Owners: domain packages and `packages/ui`.

1. Define a shared `CapabilityPresentation` contract for `available`,
   `loading`, `locked`, `upgrade_required`, `disabled`, `unsupported`,
   `empty`, and `error` states.
2. Update self, community, library, and workspace entry surfaces to consume
   that contract rather than treating `can=false` as an empty array.
3. For each domain, document:
   - registry entry and owner;
   - route owner;
   - capability subject/action;
   - required platform support;
   - entitlement/tier requirements;
   - guest behavior;
   - fallback state and recovery action.
4. Ensure a surface with no data still renders its heading, context, and
   intentional empty state.
5. Keep platform adapters honest: unavailable native capabilities on web must
   render an unavailable state, not silently disappear.

Exit gate: every primary tab has a visible result for loading, denied,
unavailable, empty, offline, and success states on both platforms.

### Phase 5 - Harden perspective and account transitions

Owners: `packages/core/src/store`, authenticated shell.

1. Introduce a monotonic account/perspective generation token shared by profile,
   entitlement, Cedar, and flag loaders.
2. Ignore late results from an old user or old bond.
3. Clear or quarantine old decisions before exposing the new perspective.
4. Keep personal perspective semantics explicit; do not infer them from a
   missing active bond in several different places.
5. Test sign-out, account A to B, personal to institutional, and institutional
   to personal transitions.

Exit gate: no cross-account capability leakage and no transition blanking.

### Phase 6 - Observability and operational recovery

Owners: core monitoring and app entry.

1. Emit structured breadcrumbs for:
   - startup stage;
   - catalog registration;
   - profile resolution;
   - entitlement resolution;
   - Cedar resolution;
   - route admission decision;
   - first visible surface.
2. Include source/status/age and safe identifiers only. Never log tokens,
   permission payloads, or personal data.
3. Add a development-only capability inspector to show the current state of
   each gate without exposing secrets in production.
4. Add a watchdog warning if the route tree remains in a non-public loading
   state beyond the UX budget.

Exit gate: a blank report can be diagnosed from one sanitized startup trace.

## Verification matrix

### Pure contract tests

- `isFeatureAccessContextReady()` for every source-status combination.
- Guest baseline policy versus authenticated authorization policy.
- Route admission for loading, profile error, cached capability, stale
  capability, inactive account, onboarding, and ready states.
- Registry validation and flag lifecycle metadata.
- Scope and generation-token rejection for late async results.

### Component tests

- Startup recovery surface renders instead of `null`.
- FeatureProvider recomputes native flags and remains non-blocking on web.
- Each primary tab renders a visible loading/error/empty/locked state.
- FAB registration cleanup does not cause an update loop.

### Integration tests

- Cold signed-out web launch.
- Cold signed-out native launch.
- Authenticated launch with fresh entitlement and Cedar data.
- Authenticated launch with no remote network but valid cached snapshots.
- Authenticated launch with no cache and capability failure.
- Workspace to self/community/library navigation.
- Perspective switch and sign-out/account switch.

### Runtime checks

- Web dev smoke test with browser console capture and screenshot.
- Native debug build and physical-device launch, following the repository
  WSL 2 debug-build instructions.
- Verify the first visible frame, not only process startup.
- Run touched-package type checks, lint, tests, and the repository anti-slop
  gate before implementation is considered complete.

## Suggested implementation sequence

1. Add pure capability and route-state tests that reproduce the current false
   and blank outcomes.
2. Implement the authenticated capability coordinator and wire entitlement
   plus Cedar hydration into it.
3. Mount and verify `FeatureProvider`.
4. Replace the invisible route-gate branch with recovery UI.
5. Migrate primary domain surfaces to explicit capability presentation states.
6. Add account/perspective generation protection.
7. Add observability, browser smoke coverage, and physical-device validation.
8. Run the full quality gate and review deletions/guard changes separately.

## Non-goals and cautions

- Do not remove authorization or entitlement checks to make screens appear.
- Do not make every feature public merely to bypass an uninitialized state.
- Do not move security decisions into the AppCatalog; the catalog declares
  requirements, while runtime policy evaluates them.
- Do not make PowerSync, analytics, GrowthBook, or optional native services a
  prerequisite for public first paint.
- Do not edit `android/` or `ios/` directly, and do not use destructive Expo
  clean regeneration without explicit approval.

## Definition of done

The plan is complete when a fresh signed-out browser and native launch show a
public surface, an authenticated launch shows a visible loading state followed
by at least one intentional surface, every capability failure is visible and
retryable, and the same policy outcomes are demonstrated by automated tests on
web and native. A blank root or blank protected tab is a failed acceptance
criterion, even if the JavaScript process remains alive.

## Guest retention contract (2026-09-09)

Guests are exploratory users, not blocked users. They can read baseline
sanctuary content and create personal local data. A third-class/anonymous
identity is intentionally local-only: its personal writes stay on the current
device and are never sent through PowerSync or the account sync endpoint.

On web, the current small-state adapter is browser `localStorage` with an
in-memory fallback when storage is unavailable. This is not React Native
AsyncStorage: AsyncStorage is the native asynchronous key/value adapter. A
future IndexedDB/WASM SQLite store is the right upgrade for larger structured
journals and offline datasets; it should remain behind the same storage port.

The app shell now shows every local-only user a non-blocking account notice:
exploration and local personal writes continue, while account creation/sign-in
is offered for cross-device retention and cloud synchronization. Shared/cloud
writes must still require an account and must not be represented as locally
published content.

PowerSync is safe to enable for synchronized identities: native and web
providers refuse initialization for local-only identities, and the sync API
rejects anonymous/third-class uploads. A remaining migration policy item is
needed before automatic class changes are supported: queued data from a
previous synchronized identity must be quarantined and only uploaded after an
explicit user consent step.
