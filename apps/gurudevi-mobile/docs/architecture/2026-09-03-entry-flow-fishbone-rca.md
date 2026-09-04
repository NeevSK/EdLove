---
title: "Gurudevi Android Entry Flow Fishbone RCA"
status: "active"
created: 2026-09-03
updated: 2026-09-03
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, expo, react-native, metro, watchman, architecture, rca]
---

# Gurudevi Android Entry Flow — Fishbone RCA

## Observed failure

On the physical Android device, Metro serves the development-client bundle and
the JavaScript runtime completes its essential boot sequence. MMKV initializes
and `SplashScreen.hideAsync()` resolves. The native Android splash is then
removed, but no application route becomes visible or accessible; the screen is
an empty light surface.

The device-visible symptom is a foreground React shell / first-route commit
failure. The investigation subsequently found Metro file-map cache corruption
and a Watchman configuration defect that make the development evidence slow and
unreliable; they are contributing tooling faults, not yet proven to be the
production blank-screen cause.

## Evidence

- Watchman returns a healthy named-pipe socket and active roots.
- Metro bundles `index.ts` and subsequent deferred modules successfully.
- Device logcat records all six essential boot milestones, MMKV initialization,
  and successful native splash dismissal.
- The device accessibility dump after the splash is dismissed contains only the
  Android development-client tools overlay, not welcome-screen text or controls.
- No fatal native exception or unresolved-module error appears in logcat.

### Tooling findings added during remediation

- Metro's persisted file map reported `Unable to deserialize cloned data`, then
  fell back to a full filesystem crawl. The cache must be cleared through
  `expo start --clear`; it is not a signal to rebuild an APK.
- The Metro file-map option is `useWatchman`; the prior `config.watchman`
  assignment was not the setting Metro reads when choosing its crawler.
- The workspace Watchman configuration used glob-like nested `node_modules`
  entries. `ignore_dirs` is literal directory configuration, so those entries
  were replaced with exact workspace-relative paths and the overlapping app and
  workspace watches were replaced by one workspace-root watch.
- React Native 0.76+ requires Android API 24 (Android 7) as its minimum.
  Gurudevi's Android 8–11 audience remains supported by that floor; Android
  12 is not a New Architecture requirement.

## Fishbone

```text
                                      Empty first frame after native splash
                                                        |
  -----------------------------------+-----------------+-------------------------------
  |                                  |                 |                              |
Root-shell contract             Error visibility   Routing ownership             Startup load
  |                                  |                 |                              |
  |-- _layout owns boot, auth,        |-- Observe error |-- index route previously    |-- custom main entry imports
  |   navigation guards, telemetry,   |   boundary had  |   owned a Lottie timeout     |   polyfills, globals, a task
  |   permissions, UI providers,      |   no fallback;  |   and animation callback      |   registration, CSS, then
  |   and device effects              |   a child error |-- declarative redirect and    |   expo-router/entry
  |-- ready state means only that     |   could become  |   imperative guard redirects  |-- root also starts optional
  |   core runtime registered, not    |   a blank root  |   are independent writers     |   services immediately after
  |   that a navigable frame exists   |-- multiple      |   to navigation state          |   boot
  |                                  |   boundaries    |-- route readiness waits on     |-- large eagerly imported graph
  |                                  |   hide ownership|   auth/profile/capabilities    |   before first route
  |                                  |                 |                              |
  -----------------------------------+-----------------+-------------------------------
  |                                  |                 |                              |
Provider composition            Native / JS boundary   Tooling / graph integrity
  |                                  |                 |                              |
  |-- 10+ providers precede Stack     |-- preventAutoHide, a 12 s     |-- custom Metro resolver scans
  |-- PortalProvider always mounts     |   backstop, and post-boot       |   the entire pnpm virtual store
  |   an absolute native host          |   hide effect own the same      |-- Expo / RN / router / observe
  |-- screen needs theme, i18n,        |   native resource               |   and compiler are at very new,
  |   mascot, toast and UI contexts    |-- app-level Lottie was a        |   tightly coupled versions
  |   before it can paint              |   second splash state machine   |-- Metro config is both resolver,
  |                                    |                                  |   runtime-env bridge and watcher policy
```

## Causal findings

### P0 — Root layout violates the thin-shell boundary

`app/_layout.tsx` decides boot state, performs startup registration, controls
native splash dismissal, owns auth-based redirects, invokes device
authentication, configures observability, schedules background work, renders
global providers, and declares navigation. These operations have different
failure and readiness semantics. A `ready` boot state can be reached while a
downstream provider or route is not renderable, which is exactly what the
device demonstrates.

### P0 — Error handling can erase the only diagnostic surface

The root was wrapped in `ObserveErrorBoundary` without a fallback. Its
implementation renders the supplied fallback after a child render error; an
omitted fallback therefore renders nothing. This makes a foreground render
failure indistinguishable from a routing failure. The normal Gurudevi
`ErrorBoundary` already has a recoverable diagnostic UI and should be the
visible foreground boundary.

### P0 — There is no single owner of entry routing

The app has an index-route transition, a global auth route guard, and auth
screens that redirect after identity actions. Each uses router mutations.
Their readiness sources differ: core runtime registration, session resolution,
profile resolution, entitlement resolution, animation completion, and timers.
This permits redirects during an uncommitted navigator state and makes the
entry journey nondeterministic.

### P1 — Native splash has three competing state machines

The code uses `preventAutoHideAsync`, a 12-second force-hide backstop, and a
post-boot hide effect; it also previously had a JavaScript Lottie splash route.
The native splash must have one owner and one condition: the first stable app
frame has committed. Timeouts may report a failure state, but must not reveal
an empty application root.

### P1 — Provider work is on the critical visual path

The Stack is behind core auth, environment, sound, deep-link, push,
mascot, query, portal, feature, and telemetry-adjacent providers. Several
perform effects or initialize external state. The welcome route should be able
to render with only theme/localization primitives; network identity,
notifications, background sync, analytics and capability checks must begin
after the first public frame.

### P1 — Custom entry and Metro configuration amplify blast radius

`index.ts` runs shims, background-task registration, CSS and polyfills before
`expo-router/entry`. `metro.config.js` additionally owns public-runtime file
creation, custom pnpm discovery, resolver aliasing, watcher policy and runtime
environment injection. Each is defensible in isolation, but together they make
first-frame failures difficult to localize and increase the chance that a
development-only fix changes production startup.

## Repair architecture

Build the entry journey as a strict, observable pipeline:

```text
native splash
  -> minimal router root (one visible error boundary)
  -> public welcome frame
  -> asynchronous session classification
  -> one route decision
  -> authenticated/onboarding shell
  -> optional services after interactive
```

The public welcome route must never wait for a profile, capabilities, push,
analytics, PowerSync, or background task. Authenticated routes may wait for the
single session-classification result and display an explicit loading/error
state.

## Verified stack contract (September 2026)

The target is **Expo SDK 57 with Expo Router 57 as the sole application
navigation owner**. React Navigation 7 remains an implementation dependency of
Expo Router and may remain transitively installed for compatible libraries, but
application and workspace-package code must not import `@react-navigation/*`
or create a second navigation container. SDK 56+ explicitly moved those
application APIs to `expo-router` entry points.

The project already has the compatible top-level versions for this direction:

| Concern | Installed app version | Canonical ownership |
| --- | --- | --- |
| Expo | `~57.0.19` | application runtime |
| Expo Router | `~57.0.18` | only navigator / deep-link owner |
| React Native | `0.86.x` resolved by lockfile | Expo SDK runtime |
| React Navigation | `7.3.0` transitive | Expo Router internals / third-party peer only |
| Expo Observe | `~57.0.18` | optional instrumentation around the Router root |
| NativeWind | `5.0.0-preview.4` | one styling runtime owned by the app |
| react-native-css | `3.0.7` | NativeWind v5 support runtime |
| gluestack | local Gurudevi facade | component API only, not a second runtime or router owner |

Important current deviations:

- `Observe.configure()` is called in a component effect. Expo's SDK 57 guidance
  requires router instrumentation to be configured at module scope before the
  first screen mounts; configuring it after mount can throw.
- `pnpm why` reports four Expo Router, three Reanimated, two NativeWind,
  two react-native-css, and two React Navigation peer instances across the
  monorepo. A virtual-store instance is not automatically a runtime bug, but
  Metro's custom global fallback resolver turns it into a high-risk source of
  non-deterministic resolution. The app must own the singleton runtime packages;
  shared packages should express them as compatible peers or avoid importing
  them from their public entry points.
- The local `GluestackUIProvider` is not the upstream gluestack runtime. It is
  a compatibility façade over Gurudevi-owned primitives and a custom portal.
  Treat it as product code during the reconstruction; do not simultaneously
  migrate it as if it were gluestack v2/v3.
- The custom `index.ts` entry is supported by Expo Router only when it remains
  a small, deterministic side-effect layer and imports `expo-router/entry`
  last. Background-task registration and broad polyfills need a separate audit
  before remaining on the foreground entry path.

### Canonical initial topology

```text
index.ts
  └─ only unavoidable polyfills; import expo-router/entry last

app/_layout.tsx
  └─ Observe configuration at module scope (optional)
  └─ one native splash owner
  └─ minimal stable providers
  └─ <Stack>

app/(public)/welcome.tsx
  └─ paints without session, network, PowerSync, notifications or background work

app/(app)/_layout.tsx
  └─ protected authenticated routes and authenticated-only providers
```

## Recovery sequence

1. Create a red-zone entry-shell specification and lock a minimal acceptance
   test: physical device reaches an accessible welcome action within a bounded
   time on a fresh install, offline and online.
2. Reduce `_layout.tsx` to composition only. Move boot effects, native-splash
   ownership, post-interactive services and auth decision logic into focused
   modules/providers.
3. Replace all entry-time router mutations with one declarative route gate.
   The gate owns public, onboarding, inactive-account and application targets.
4. Keep one native splash owner. Remove app-level splash animation from routing;
   any brand animation belongs inside a committed, visible screen.
5. Mount public UI before authenticated-only providers. Make diagnostic UI
   impossible to suppress by an observability boundary.
6. Reintroduce providers and optional services one at a time, verifying device
   accessibility tree, visible screenshot and route decision at each stage.
7. Simplify the entry module and separate Metro runtime-env generation from
   resolver/watcher policy, then validate Fast Refresh independently.

## Acceptance evidence required

- Native splash disappears only after a visible React frame has committed.
- `/welcome` exposes its primary and login actions in the Android accessibility
  tree on fresh launch.
- Guest and authenticated entry choices have exactly one route transition.
- Offline launch reaches a useful public or cached-account state, never blank.
- Route errors render a recoverable Gurudevi error state with diagnostic detail.
- Watchman-driven edit updates arrive without restarting Metro.
