# FEATURE SPEC: Entry-shell reconstruction

## Blast Zone

RED — `apps/gurudevi-mobile/app/_layout.tsx`, entry module, routing ownership,
and global providers.

## Objective

Make a fresh Android launch reliably reach an accessible public welcome screen,
then route a user through sign-in or guest onboarding without blank frames,
redirect races, or a dependency on optional background services.

## Canonical ownership

| Concern | Single owner | Explicitly not owned by |
| --- | --- | --- |
| File routing / deep links | Expo Router | custom React Navigation container |
| Native splash lifecycle | entry shell | route screens, timers, Lottie callbacks |
| Entry route decision | one session gate | welcome, auth, onboarding, global effects independently |
| Public first paint | public route group | profile, PowerSync, push, analytics, background tasks |
| Authenticated services | app route group / post-interactive effects | root layout’s first render |
| Visible failure UI | Gurudevi error boundary | blank observability fallback |
| Observability | module-scope configuration and route-local marker | post-mount root setup |

## Required topology

```text
index.ts
  ├─ minimal unavoidable platform shims only
  └─ expo-router/entry (last)

app/_layout.tsx
  ├─ module-scope Observe setup (when enabled)
  ├─ native splash ownership
  ├─ root diagnostic boundary
  └─ Stack

app/(public)/
  ├─ welcome
  ├─ auth
  └─ public-form

app/(entry)/index.tsx
  └─ one declarative decision from session classification

app/(app)/
  ├─ authenticated provider composition
  ├─ tabs
  └─ authenticated-only effects
```

Route group names are illustrative; the implementation may retain public URLs.
The route URL contract is preserved while internal ownership changes.

## Provider placement inventory

| Provider / concern | Current placement | Required placement | Reason |
| --- | --- | --- | --- |
| `ObserveRoot` | root | root | instrumentation only; configure before mount |
| visible `ErrorBoundary` | root | root | must surface failures, not erase them |
| `SafeAreaProvider` | public shell | root or public shell | safe visual primitive only |
| theme / language / minimal UI context | root/public shell | root/public shell | public welcome needs them |
| `ToastProvider` / `ExternalLinkProvider` | root | public shell after minimal contexts | interactive UI service, not a routing owner |
| `GlobalProvider` / `AuthProvider` | root after boot | session classifier boundary | supplies the one entry decision |
| `DeepLinkProvider` | root before Stack | after navigator + session gate | it performs cold-start and foreground `router.push()` calls |
| `PushNotificationProvider` | root before Stack | protected app group | it registers notifications and can navigate from responses |
| `SoundFeedbackProvider` | root | public/app leaf where needed | should not delay first paint |
| `MascotProvider` | root | public/app leaf where needed | welcome may use a static asset without global state |
| `FeatureProvider` | root around all Stack routes | protected app group | subscribes to permission/flag state |
| `PowerSyncProvider` | tabs | protected app group | correct direction; retain behind authentication |
| background sync / storage eviction / Google sign-in | root boot aftermath | post-interactive service host | no first-frame ownership |

## Reuse

- `getAuthRouteTarget` as the pure route classification policy.
- `getSessionRouteReadiness` for safe cached/offline classification.
- `completeEssentialStartup` only for core-runtime registration.
- `scheduleNativeSplashHandoff` as the single native-splash mechanism, after
  reconciling it with the root layout.
- Route-specific `ErrorBoundary` and `RouteErrorBoundary` surfaces.

## Must not

- Add a `NavigationContainer` or direct application imports from
  `@react-navigation/*`.
- Gate welcome rendering on identity, entitlement, push, analytics, PowerSync,
  task registration, background sync or remote network responses.
- Add a second splash timer or a route-level Lottie navigation callback.
- Replace existing sacred native runtime versions.
- Edit generated `android/` or `ios/` directories.

## Ordered implementation milestones

1. Introduce a minimal root layout that renders the navigator and one visible
   diagnostic boundary. Verify a static public route on device before adding
   session logic.
2. Make native splash hide only after that static route has committed a frame.
   Remove competing hide calls and app-level splash routing.
3. Add the public route group and verify welcome, auth, and guest action
   controls in Android accessibility output.
4. Introduce one declarative entry gate over the pure route decision helper.
   Test public, anonymous, authenticated-onboarding, authenticated-ready,
   inactive-account and offline-cached cases.
5. Move authenticated providers and side effects under the protected app group.
   Reintroduce them in dependency order, verifying each device step.
6. Move optional services to post-interactive effects and configure Observe at
   module scope if retained.
7. Simplify foreground entry imports and isolate background-task registration.
8. Validate Watchman Fast Refresh, production release startup, and the full
   real-device entry journey.

## Acceptance criteria

- On a cold Android launch, an accessible welcome action is visible before any
  remote identity request needs to settle.
- `SplashScreen.hideAsync` has exactly one application call site.
- Entry routing has exactly one writer for any session state transition.
- A thrown root/provider/route error yields a visible recovery UI, never an
  empty native surface.
- Guest flow reaches onboarding; sign-in reaches onboarding or `/self` based on
  the classified identity; back navigation returns to a meaningful public route.
- Watchman detects shared-package edits and Fast Refresh updates the device
  without restarting Metro.
- The complete focused test suite, type checks, lint, and anti-slop gate pass.
