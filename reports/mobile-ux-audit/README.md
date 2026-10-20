# Gurudevi Mobile UX Audit — ADB Setup and Initial Surface

Date: 2026-10-19 (Asia/Colombo)
Device: Samsung Galaxy A52 (`R58T33Y0E3M`), Android 14 / API 34, connected over USB ADB
Installed package: `app.gurudevi.sanctuary.dev`

## Setup outcome

- ADB reports the physical device as `device`; Argent can discover and launch it.
- `adb reverse tcp:8082 tcp:8082` works. Metro runs on 8082 because 8081 is occupied by another app and was left untouched.
- The dev client reached the installed app's `MainActivity`. Metro `/status` returns `packager-status:running`, and the runtime appears in Metro's `/json/list`.
- Expo CLI initially failed on a missing transitive module. A scoped, offline/no-lockfile relink was incomplete; a serialized `pnpm install --filter gurudevi-mobile --force --lockfile=false --ignore-scripts --workspace-concurrency=1 --network-concurrency=1` completed and Expo CLI could then run. The install command explicitly disabled lockfile writes; the existing worktree has separate manifest and lockfile changes, so no attribution is made for those diffs.
- Metro was started in the `gurudevi-mobile` filter with Doppler, `EXPO_PUBLIC_DEV_BYPASS_AUTH=true`, and port 8082. No credentials were written to source or configuration.
- The in-app development bypass is guarded by `__DEV__`. It now refuses to replace an already active real profile/session, does not place fake credentials in shared auth-session state, and clears a persisted mock profile at the next cold startup. The bypass route intent is `/self` so it avoids the known Workspace Classroom hook-order failure.

## Screenshots

- [Expo development client selector](galaxy-a52-expo-dev-client.png)
- [Gurudevi blank startup shell](current-blank-shell.png)
- [Gurudevi transition after dev bypass](after-bypass-transition.png)

## Initial device state and scoring

On the first launch attempt, only the Gurudevi startup shell was reached. It was an empty light surface with an Expo Tools gear; the device accessibility tree exposed only that gear. This rating is historical and describes the initial setup failure, not the later Welcome or transition screen.

| Dimension | Score / 10 | Evidence |
|---|---:|---|
| Motion UX | 0 | No app transition or progress motion is visible. |
| Information architecture | 0 | No destination, hierarchy, or route content is exposed. |
| Interactions | 1 | Only Expo's developer Tools gear responds; no product interaction is available. |
| Feedback | 0 | No startup, loading, success, or failure feedback appears. |
| States | 0 | The app presents an undifferentiated blank surface rather than a visible startup state. |
| Errors and recovery | 0 | No error explanation or retry action is shown. |
| Visual clarity | 0 | The empty canvas communicates no product purpose or next action. |
| UI elegance | 1 | The neutral canvas is visually quiet, but there is no product UI to assess. |
| **Observed shell overall** | **0.3 / 10** | Mean of the eight dimensions, rounded to one decimal; this is a setup-blocked shell rating. |

## Blocker and evidence limits

The first attempt opened `MainActivity`, but stayed on a blank shell after Expo Reload; Argent's Android accessibility view reported only `Image "Tools"`. That initial state was later superseded: app JS startup traces confirmed essential startup, and `/welcome` became observable.

The app source and audit were updated after the initial capture. The UX audit remains incomplete: Welcome and the Library loading state have been visually reached, but the Library content has not loaded and no other destination is confirmed. The working tree contains many unrelated existing user changes; those changes were preserved.

## Welcome screen — live device audit

Screenshot: [welcome screen on Galaxy A52](welcome-galaxy-a52.png)

The route is `/welcome` on the device. The accessibility tree exposed the language controls, welcome heading and copy, three realm selectors, a short Self description, guest and login actions, terms/privacy links, and a **Quick Dev Bypass** button. The screenshot shows the bypass button drawn over the legal notice and device-trust line at the bottom. This is a development-only overlay, but its placement still corrupts the visible welcome layout during this authorized audit.

| Dimension | Score / 10 | Evidence |
|---|---:|---|
| Motion UX | 4 | The screen is visually composed, but no entrance/selection motion was observed in the captured state. |
| Information architecture | 6 | Sanctuary, Self/Workspace/Community, guest entry, and login are distinct; the three realm pills read more like filters than destinations. |
| Interactions | 6 | Language selection, realm selection, guest entry, login, legal links, and dev bypass are exposed; end-to-end outcomes were not yet verified for all controls. |
| Feedback | 4 | Controls have clear labels, but no visible outcome was captured for a tap; no loading or success feedback is present in this state. |
| States | 4 | Welcome/unauthenticated state is clear, but other entry states remain unvisited. |
| Errors and recovery | 2 | No startup error is visible on this screen; recovery behavior has not been exercised. |
| Visual clarity | 5 | Strong illustration and restrained palette; the bottom dev overlay collides with legal/trust copy and compresses the footer. |
| UI elegance | 6 | Friendly, coherent visual language and clear primary guest CTA; footer collision materially reduces finish. |
| Accessibility | 5 | Main controls appear in the Android accessibility tree with labels; overlapping copy/button and the image-to-layout contrast need manual accessibility review. |
| **Observed welcome overall** | **4.7 / 10** | Mean of these nine dimensions, rounded to one decimal; includes the development-only overlay as rendered on device. |

### Bypass and route evidence

- On-device Quick Dev Bypass fired: Android JS logs contain `[DevAuthBypass] Activated dev mock session as teacher`.
- `SessionRouteGate` then reported `pathname: '/self'`, `decision: 'app'`, `onboardingCompleted: true`, and `sessionMode: 'auth'`.
- The device screenshot and accessibility tree still showed the welcome screen afterward. This is a route-to-render mismatch: navigation state says `/self`, while the visible tree continues to describe `/welcome`. `/self` is not yet accepted as visually reached.
- In the first attempt the bypass fixture generated schema warnings from `usePermissions`: required Bond fields were missing and `entity_type` was invalid. Those fixture issues were corrected; the latest device run no longer logs those warnings.
- Essential startup itself completed (platform bootstrap, catalog load/registration, and device-account initialization). This separates the earlier server/bundle setup failure from the current app-level route/render problem.

The audit remains incomplete. The Library loading state has now been verified and scored below. Self, Workspace, Community, Profile, settings, modal, offline, and recovery screens remain unvisited or unverified.

### Library — device loading state (2026-10-19)

Screenshot: [Library loading state on Galaxy A52](workspace-attempt.png). The physical Galaxy A52 reached `/library`; the live `SessionRouteGate` trace reported `decision: app`, `redirectTo: null`, and `onboardingCompleted: true`. The screen showed its Library header, Search/document-tools/map controls, the Browse/Collections/Contribute & Review selector, five bottom destinations, and three very faint flower placeholders in an otherwise empty content area. After waiting and a fresh app launch, the product content did not become available; one subsequent interaction left only a blank surface and the Expo Tools button. The latest device accessibility tree for that surface contains only Expo's Tools image, while the gate continues to report `/library` admitted. I do not count that blank surface as a separate destination. Device logs contained repeated gate renders (~0.48s apart) and ReactHost soft exceptions (`reactInstance is null` / context not ready); they did not contain a clear Library API error that identifies the underlying cause. The Argent JS debugger could not attach because Metro exposed no CDP target.

| Dimension | Score / 10 | Evidence |
|---|---:|---|
| Motion UX | 2 | Faint flower loading marks animate, but there is no visible progression or timeout. |
| Information architecture | 4 | Library purpose and three spaces are named; the large content region stays empty. |
| Interactions | 2 | Search, tools, map, space selector, and five tabs are shown; destination changes were not reliably confirmed. |
| Feedback | 1 | The placeholders imply loading without status, progress, or completion. |
| States | 1 | Loading persists through a 12-second observation and relaunch. |
| Errors and recovery | 0 | No visible failure explanation, retry, or fallback action appears in the stuck state. |
| Visual clarity | 2 | Header is legible, while the main surface gives almost no indication of what is happening. |
| UI elegance | 3 | The warm visual language is coherent; the nearly blank loading surface and low-contrast placeholders feel unfinished. |
| Accessibility | 2 | Header controls and navigation labels are exposed in the device tree; the loading state lacks useful status text. |
| **Observed Library loading state overall** | **1.9 / 10** | Mean of the nine dimensions; this scores the failed loading state, not a successfully loaded Library. |

This is G5 visual/device evidence for the Library loading state only. It does not prove the screen's data flow, normal/empty/error behavior, the other tabs, or production readiness. The ADB reverse setup and dev-client connection to Metro 8082 are verified; port 8081 remained untouched.

### Updated bypass attempt

After a fresh force-stop and launch, essential startup completed and `/welcome` rendered. The environment bypass activated, and `SessionRouteGate` reported `/self`, `decision: app`, `redirectTo: null`, and `onboardingCompleted: true`. The device did not render Self content: it stayed on the full-screen mint transition surface with a pulsing mark and Expo Tools control. The captured Android accessibility tree continued to expose the Welcome tree and an `Opening your sanctuary` busy element, while the JS debugger accepted a connection but timed out even on a trivial runtime evaluation. This confirms that the route decision advanced but does **not** confirm a usable route commit. See [the transition screenshot](after-bypass-transition.png).

The invalid Bond schema warnings seen in the first attempt are no longer present after the mock Bond fields/entity id were corrected. The bypass also no longer installs fake access/refresh tokens into shared auth-session state. It refuses activation when a non-mock profile/session is already active, and stale persisted mock profiles are cleaned during startup. These guards are source-level and G1-tested; the phone run did not yet prove the stale-profile cleanup across a process restart.

The route-gate G1 boundary suite reports 15/15 assertions passed. This proves only the gate behavior under test mocks; it does not prove Expo Router committing a destination on device. Targeted Oxlint found existing diagnostics in `bootstrapRouteState.ts` (`Date.now` during render and synchronous state updates inside an effect); the full app typecheck also has 36 pre-existing errors elsewhere. No claim of app-wide verification is made.

The transition surface scores poorly as an app state because it gives no text, route destination, cancel/retry action, or visible recovery path:

| Dimension | Score / 10 | Evidence |
|---|---:|---|
| Motion UX | 3 | A pulse animates, but it never resolves into the destination. |
| Information architecture | 0 | No product location or destination is identified. |
| Interactions | 1 | Expo Tools remains visible; no product action is reachable. |
| Feedback | 2 | The pulse implies work, but gives no message or progress detail. |
| States | 1 | A transition state appears, but it is not bounded or terminal. |
| Errors and recovery | 0 | No cause, retry, cancel, or return action is exposed. |
| Visual clarity | 1 | The color and mark are legible, but the screen conveys no next step. |
| UI elegance | 2 | The animation is restrained; the indefinite blank surface makes it feel broken. |
| **Observed transition overall** | **1.3 / 10** | Mean of these eight dimensions, rounded to one decimal. |

Expo 57/58 processes are not implicated by this device evidence. A second Metro occupying another port or another installed app does not by itself explain this route/render mismatch. Running multiple Metro servers can cause a device to fetch the wrong bundle when an app is pointed at the wrong port; here the connected debugger identified the project root as `C:\x\apps\gurudevi-mobile` on port 8082, while the other app on 8081 was left untouched.

### Dev-client recovery and current result (2026-10-19)

The development launcher initially showed its previous-crash warning. My first manual URL submission was empty (the launcher explicitly reported `Invalid URL host: ""`); after entering the host and setting `adb reverse tcp:8082 tcp:8082`, it connected to the dev server and started `MainActivity`. This confirms the launcher/ADB path is recoverable. The app intermittently rendered the Library shell, but its content stayed in a loading state and a later fresh launch showed the blank light shell with Expo Tools visible. The earlier native `DevLauncherAppLoader` startup exception occurred on a force-stop/relaunch path and should not be generalized as the root cause of the current render instability.

Evidence: [launcher URL entry](devlauncher-url-field-final.png), [intermittent Library loading screen](workspace-attempt.png), [blank shell after fresh launch](relaunch-state.png), [current blank shell with Expo Tools only](current-final-blank.png). The initial startup-shell score remains 0.3/10 on the same eight dimensions listed above.

### Interaction verification follow-up (2026-10-19)

The earlier Library score above was too generous about interactions. A new device pass confirmed the route rendered, but did **not** establish a working Library. From the visible `/library` surface, I tapped Search, Collections, and Open document tools through Argent; I also sent a direct ADB tap to the section selector. The app stayed on the same Browse shell each time. The fresh accessibility tree labels these controls clickable, but the resulting UI never changed. No destination was counted as explored from these attempts. After a Metro JS reload, the launcher returned to an Expo Tools-only blank surface while the Android JS logs continued to report `/library`, `decision: app`. A low-risk app restart and reconnect restored `/library` once, so the UI failure is intermittent and the reload did not recover it.

Evidence: [post-reload blank DevTools surface](2026-10-19-post-reload-devtools-blank.png), [screen after Search tap](2026-10-19-library-search-tap.png), [screen after Collections tap](2026-10-19-library-collections-tap.png). These files are G5 visual/device observations; they do not prove why taps fail. Argent’s JS debugger connected to Metro on 8082, but runtime evaluation timed out; no JS exception or specific data request failure has been identified yet.

| Library dimension | Revised score / 10 | Device evidence |
|---|---:|---|
| Motion UX | 1 | Very faint flower marks animate without communicating load progress. |
| Information architecture | 3 | Library title and three spaces are named, but the active content never becomes usable. |
| Interactions | 0 | Search, Collections, and document-tools taps did not produce a visible state or route change. |
| Feedback | 0 | No press response, loading completion, or failure message. |
| States | 0 | The shell remains empty; Metro reload can leave the app on a DevTools-only blank surface. |
| Errors and recovery | 0 | No in-app explanation or retry path for the observed failure. |
| Visual clarity | 2 | The header is legible, but a large empty canvas and faint indicators obscure the actual state. |
| UI elegance | 3 | The warm style is coherent; the inert empty screen undermines the finish. |
| Accessibility | 2 | Controls have accessible labels and `clickable` semantics, but the tested controls still did not act. |
| **Observed Library failure state** | **1.2 / 10** | Mean across the nine dimensions above; this is not a score for a verified working Library. |

#### Version and upstream checks

- Local manifests and installed packages report Expo SDK `58.0.13`, Expo Router `58.0.22`, React Native `0.88.0`, and Gesture Handler `3.3.0`. The installed development package reports app version `1.0.0`, matching `app.json`; this does not independently identify the SDK compiled into the APK, so a native/JS version mismatch remains unproven.
- Expo’s [SDK 57 to 58 Router migration guide](https://docs.expo.dev/router/migrate/sdk-57-to-58/) says SDK 58 changes navigation-state construction and recommends component-bound `useRouter()`. It says native async-route defaults are unchanged and warns against old nested-navigation parameter conventions. The [SDK 58 Router API](https://docs.expo.dev/versions/v58.0.0/sdk/router/) lists the project’s Router API surface. Neither document describes a general Android tap regression.
- The Expo Router [issue #48626](https://github.com/expo/expo/issues/48626) reported timing-dependent dropped routing-queue actions against Router 57.0.9 and a `null` route; Expo’s response says the proposed array-identity change was already on `main` and could not reproduce that report. This issue does not explain a local reducer like Library’s section selector failing to update, and this project is on Router 58.0.22.
- Gesture Handler’s [3.3.0 release notes](https://github.com/software-mansion/react-native-gesture-handler/releases) include an Android fix for button presses when a scroll takes over touch. The Library selector, header Search, and document action use the repository’s `@repo/ui` `Pressable` wrapper around React Native `Pressable`, not a Gesture Handler Pressable; I have no evidence yet that this release fix is the cause here.

#### Runtime responsiveness diagnosis (2026-10-19)

A fresh Argent tap at the accessibility-derived Search coordinate returned successfully, but the search field did not appear. A fresh tap on Collections changed the captured screen into a mostly blank content state; the selector remained in the accessibility tree with Browse still reported. The screen did not settle within Argent's 5-second idle check, so the accessibility snapshot and pixels are not a consistent post-action state. This is stronger evidence of a changing/unresponsive render than of an input event that never arrived.

ADB `top -H` sampled the same app process twice during this inspection: process RSS was about 1.6 GB; `mqt_v_js` consumed 86.6% CPU and the main/UI thread another 86.6%, with RenderThread at 63.3% in the later sample. Values are instantaneous Android `top` samples, not an averaged benchmark. The native profiler could not start because the phone's shell user is denied package-list access for secondary Android user 150. Argent's JS debugger accepted a connection but timed out on trivial evaluation. These observations support severe runtime saturation as a plausible explanation for unresponsive input and unsettled visuals, but they do not identify the hot JavaScript function or establish causality.

The native logs for this process show a Firebase default-app initialization warning (no default options), a ReactHost soft exception earlier during startup, and tiny graphics-buffer allocation errors from WebView/Dawn. They do not show a JS fatal, out-of-memory exception, or a named Library request failure. The device screen still contains the Expo Tools floating control, but visual capture confirms the Library is underneath it; it is not evidence that Expo Tools replaced the app route.

Source inspection found the Library's section selector is an ordinary `@repo/ui` wrapper over React Native `Pressable`; its press handler dispatches a local reducer action. Router is not involved in that selector transition. Search is also a local UI action before any filtering/network query. Thus Router queue issues and Gesture Handler's scroll-steal press fix remain unsubstantiated explanations for these failures. The Library invokes several queries and a sync on entry, and its `useStore(selector)` facade still subscribes to all domain stores; these are source-level leads for later profiling, not a confirmed hot path. No API, SDK, or native dependency upgrade is justified by current evidence.

No additional route or screen has passed the acceptance bar of a visible, settled destination with a working primary control. The Library failure scores above remain provisional scores for the observed failure state only.

The revised Library score supersedes the earlier 1.9 score. Continue treating all other screens as unverified until their controls and route changes respond on the device.

#### Focused isolation and latest device retest (2026-10-19)

I inspected the installed `react-native-css@3.1.0-rc.0` runtime, not only the warning text. Its native `updateRules` implementation explicitly says a component whose class adds/removes CSS variables can have its state reset and children remounted. The Library space selector changes a CSS-variable-backed `bg-phase-interactive` class as `activeSection` changes. I added the runtime's documented `will-change-variable` marker to that selector and its label. This is a targeted mitigation for the observed class-variable transition; it did not resolve the larger runtime failure. After Metro reload the product accessibility tree disappeared, and after a clean dev-client reconnect the screen again became blank. The guarded selector has therefore **not** passed a physical interaction test yet.

I ran a 5-second Android `simpleperf` sample against the debuggable app after the Argent profiler could not attach. It recorded 24,650 samples with no loss. About 68% of inclusive samples were on the Hermes JS thread (`hoost_make_fcontext` / Hermes VM); the visible stack is in `RuntimeScheduler_Modern` and Hermes execution, with the JavaScript source frames unavailable in this stripped native profile. A separate instantaneous `top` sample reported about 114% app CPU and 1.4 GB RSS. Argent runtime evaluation continued to time out, and the app accessibility tree contained only Expo Tools. This confirms the JS runtime is saturated on-device; it does not identify the JavaScript function causing the hot loop. No native fatal exception or OOM was observed.

The Library's data path also remains unresolved: `useLibrary` starts several React Query requests, and `LibraryScreen` starts `knowledgeSync.performSync()` on mount. The device log records `Starting Knowledge Sync...` but neither completion nor failure. Since `performSync` awaits SQLite initialization before it logs a Supabase result, the stuck boundary could be local SQLite initialization or a pending request; current network capture did not distinguish them.

The development mock profile and its route fixture now explicitly carry `is_anonymous: true` and `citizenship: 'THIRD_CLASS'`. `isLocalOnlyIdentity` therefore treats both as local-only, so the fake teacher cannot activate `PowerSyncProvider`'s account sync path as if it were a real account. The fixture still uses the normal dev-only demo route state and does not write its token into the shared auth store. G1 boundary / Vitest: the new identity-boundary test and `SessionRouteGate.test.tsx` reported 17/17 assertions passed; this proves those pure identity and mocked route contracts, not native sync isolation under a running device.

The compatibility evidence is specific: NativeWind's current v5 troubleshooting page labels v5 a pre-release “not intended for production,” and documents testing on Expo 57.0.22 / React Native 0.86.3, not this app's Expo 58.0.13 / RN 0.88.0. NativeWind issue [#1536](https://github.com/NativeWind/nativewind/issues/1536) is closed with a “needs reproduction” label; issue [#1711](https://github.com/NativeWind/nativewind/issues/1711) contains reports of conditional shadow/opacity classes breaking navigation, but its reproduction targets NativeWind 4 and Expo 53/55 and has conflicting maintainer reports (one clean repro could not reproduce on NativeWind 4.2.3). These are useful leads, not proof that the same bug explains this app. The Library selector uses React Native Pressable and its interaction is local reducer state, so Expo Router and Gesture Handler remain unproven causes. No dependency cohort was upgraded or downgraded.

Latest blank-state evidence: [ADB screenshot after the guarded-selector rebuild](2026-10-19-library-final-retest.png). The prior Library score remains a score of the failed state; no other product route has passed an on-device interaction check.

#### Fresh-process retest after the prior report (2026-10-19)

I force-stopped and relaunched only the dev app (no app-data clear and no Metro restart). The fresh JS runtime again entered `/library` and displayed the header, three Library spaces, bottom tabs, and three faint flower loading placeholders. The selected section remained Browse. Argent tapped Collections and then the bottom Workspace tab; the accessibility tree and screenshot still showed the same Library route and Browse selection. The current screenshot is [the post-Workspace retest](2026-10-19-library-after-workspace-retest.png). This reproduces the failure across a new process and both a local section control and a route tab.

At 11:38–11:40 local device time, instantaneous Android `top` samples showed 187–265% process CPU and about 1.1–1.4 GB RSS. `dumpsys meminfo` later measured 1.53 GB PSS, including roughly 1.06 GB native heap. These are point samples under a development build, not a production benchmark. A debugger evaluation of `1+1` and a network-log capture timed out after the fresh launch. The log contains `Starting Knowledge Sync...` at 11:37:45 but no matching completion or failure by the retest; the current log window also contains repeated `/library`, `decision: app` route-gate entries and no fatal JS exception. This confirms the loading UI and runtime unresponsiveness reproduce on a new process, but does not identify whether the CPU/heap growth comes from React rendering, native rendering, CSS processing, or a specific data operation.

The current installed pair remains `nativewind@5.0.0-rc.0` + `react-native-css@3.1.0-rc.0`; NativeWind's [RC release notes](https://github.com/nativewind/nativewind/releases/tag/v5.0.0-rc.0) and [compatibility notes](https://github.com/nativewind/nativewind/blob/main/docs/rc-compatibility.md) specify an Expo 57.0.22 / RN 0.86.3 test target. That is a real compatibility gap against this Expo 58.0.13 / RN 0.88.0 app, but not proof of causality. The newly found Gesture Handler [issue #4581](https://github.com/software-mansion/react-native-gesture-handler/issues/4581) concerns v3 `GestureDetector` taps nested inside native scrolling containers; the tested Library controls are React Native `Pressable`s, so it does not match the control implementation. Expo Router [issue #48626](https://github.com/expo/expo/issues/48626) describes dropped navigation-queue work on SDK 57 with an idle JS thread; it does not explain a local selector reducer failing while this process is heavily saturated. No dependency update or broad version rollback is justified from this evidence alone.

The UX score remains 1.2/10 for the **observed broken Library state**, not a successfully explored Library. The bypass route and G1 mock-identity guards are established in source and targeted tests; the mobile session proves entry into `/library`, but does not yet prove a usable app or safe behavior through real authentication transitions. The overall mobile audit remains incomplete.

Verification on this revision: G1 boundary / Vitest, `gurudevi-mobile` `devAuthBypass.test.ts` + `SessionRouteGate.test.tsx`: 2 files, 17 assertions passed; `@repo/library` suite: 3 files, 14 assertions passed. These cover mocked contracts and library unit behavior, not the stalled Android runtime. `git diff --check` passes for the modified `auth.tsx` and `LibraryScreen.tsx`; a whole-repository check still reports pre-existing whitespace issues in unrelated files.

#### Demo API wiring fix and second device retest (2026-10-19)

Source tracing found that the Library's existing demo fixtures were unreachable: `packages/library/src/api/library.ts` wrapped its API only with the temporal proxy, while demo interception is performed by `createResonantProxy`. As a result, the mock Library identity still made live Library requests. I connected the established resonant proxy around the existing temporal proxy, added fixture responses for Library counts, item lookup, bookmarks, and search, and gated Library Supabase realtime plus its initial SQLite/Supabase sync while demo mode is active. This scope uses existing mock data and does not add a fake auth token or change real identity/session behavior.

The physical-device retest remains failed. After force-stopping and relaunching only the dev app (without clearing app data or restarting either Metro), the device entered `/library`; its screenshot showed the Library header/spaces and three faint loading marks, but no resources. Argent dispatched a tap to Collections; the resulting screenshot and accessibility tree still reported Browse selected. A debugger evaluation of `1 + 1` timed out again. The current screenshot is [the post-demo-proxy retest](2026-10-19-library-after-demo-proxy-retest.png). The existing stale-mock guard clears a persisted mock profile after process death unless the explicit development bypass flag is present. I also wired that existing explicit flag into startup so a flagged dev build reactivates the demo identity before the app shell mounts; the cold-launch run used here does not prove that flagged path or the new mock interceptor ran, but it reproduces the unresponsive Library shell.

Upstream issue checks were narrowed to current evidence: Expo Router issue [#48626](https://github.com/expo/expo/issues/48626) is an SDK 57 navigation-queue report with an idle JS thread and blank route, which does not match this local selector reducer plus high process-memory readings. RNGH issue [#4581](https://github.com/software-mansion/react-native-gesture-handler/issues/4581) concerns `GestureDetector` gestures inside native scroll containers; the Library selector uses `@repo/ui`'s React Native `Pressable`. NativeWind's [v5 RC release](https://github.com/nativewind/nativewind/releases/tag/v5.0.0-rc.0) and [compatibility notes](https://github.com/nativewind/nativewind/blob/main/docs/rc-compatibility.md) target Expo 57.0.22 / RN 0.86.3, while this app has Expo 58.0.13 / RN 0.88.0; that gap remains a credible compatibility risk, not an isolated root cause. No SDK or native dependency was changed.

Verification: G1 / Vitest, `@repo/core` `demoProvider.test.ts`: 1 file / 18 assertions passed, including a proxy short-circuit check; `gurudevi-mobile` bypass + route gate: 2 files / 18 assertions passed; `@repo/library`: 3 files / 14 assertions passed after the realtime subscription adjustment. `@repo/library` `tsc --noEmit` cannot provide a clean signal in this checkout: it fails with broad existing `@repo/ui/primitives` missing-export/module-resolution errors and unrelated type errors. This device run is not a G5 pass for taps or Library content. The Library score remains 1.2/10 for the observed broken loading state, and the wider mobile audit remains incomplete.

#### Developer Sandbox correction (2026-10-19)

The previous sections refer to a temporary Quick Dev Bypass that fabricated a local demo identity. That was not the app's Developer Sandbox. At the user's direction, I removed that bypass's welcome/auth buttons, startup reactivation, fabricated-session route handling, mock identity helper, and tests that asserted the bypass behavior. The existing `safeBack('/welcome')` auth navigation and the normal session/deep-link route policy remain. The sandbox implementation and its shared parser/tests are retained.

The documented sandbox path is the hidden `dev::sandbox` trigger in the onboarding name step. It opens the existing role/pricing/citizenship console. Saving runs the normal onboarding subject resolution, initial bond creation, profile update (for authenticated identities), and onboarding completion APIs. It does not manufacture an auth token or skip account policy. The dev console is enabled by `__DEV__` or `EXPO_PUBLIC_ENABLE_DEV_SANDBOX=true`.

I could not complete a fresh device run through that path in this pass. The connected Galaxy A52 (Android 14, serial `R58T33Y0E3M`) still runs the previously loaded bundle on `/library`. An Android `gurudevi://onboarding` intent was delivered to the app, but the visible route remained `/library`; this is not evidence that the newly cleaned source bundle works or that the sandbox trigger is broken. A fresh Metro/app launch is blocked because the supported launcher requires a Doppler token that is not available in this session. I did not clear app data or fabricate Supabase configuration. Consequently there is no sandbox screenshot or G5 claim yet.

Verification on the source revision: G1 / Vitest, `gurudevi-mobile` SessionRouteGate: 1 file / 13 tests passed; G1 / Vitest, `@repo/ui` onboarding fast-track and intent parser: 2 files / 8 tests passed. These validate mocked route policy and the sandbox trigger/parser contracts, not the native console's touch behavior or its API completion on device. The app-wide audit remains incomplete.

#### Corrected fresh-device Developer Sandbox run (2026-10-19)

Correction to the prior Doppler-blocked note above: the local Doppler CLI session did provide the configured `gurudevi-mobile/dev` environment without printing or committing secrets. I started a fresh Expo 58.0.13 dev-client Metro session on port 8082 and connected the Samsung Galaxy A52 (Android 14, serial `R58T33Y0E3M`) through ADB reverse. The app bundled and loaded the source revision with Quick Dev Bypass removed.

The touch path is no longer accurately described as wholly broken. On the fresh bundle, the Welcome screen's **Explore as Guest** control responded, guest name entry accepted `dev::sandbox`, and Continue opened the existing **Developer Sandbox Console**. This confirms the hidden sandbox trigger and physical touch work along this path. Screenshots: [Welcome](2026-10-19-welcome-fresh-metro.png), [Developer Sandbox Console](2026-10-19-developer-sandbox-console.png).

The console visibly exposes display name, Teacher/Student/Principal/Admin, Free/Pro/Institutional, Wanderer/Second Class/First Class, optional School ID, Cancel, and Fast-Track Profile. I did not confirm an intentional press of Fast-Track Profile or a completed profile save. The app subsequently landed back on onboarding Step 1 with an empty name field and a persistent “Opening your sanctuary” busy state; the latest tree still exposed Back to Welcome and a disabled Continue. Screenshot: [stalled onboarding](2026-10-19-onboarding-stalled.png). A later route attempt did not produce a settled destination. Treat sandbox entry as G5 interaction evidence, and sandbox save / downstream navigation as unverified.

**Observed-state UX scores (0–10; provisional, one device/session):**

| Screen/state | Motion | IA | Interaction | Feedback | States/errors | Visual clarity | Elegance | Accessibility | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Welcome, guest entry | 5 | 6 | 6 | 5 | 5 | 6 | 6 | 5 | 5.5 |
| Developer Sandbox Console, initial view | 4 | 6 | 4 | 3 | 4 | 6 | 5 | 4 | 4.5 |
| Onboarding Step 1, stalled busy state | 1 | 3 | 1 | 1 | 0 | 2 | 2 | 2 | 1.5 |

The Sandbox score is deliberately conservative: the screen rendered and the trigger path responded, but role/pricing/citizenship selection and Fast-Track completion were not verified. The stalled state has no useful recovery or explanation while busy; Continue remains disabled and repeated `SessionRouteGate` logs had previously been observed during this run. These are visual/interaction audit judgments, not automated quality metrics. The Expo Tools floating control overlaps part of the Welcome/sandbox content and should be hidden or repositioned in future product screenshots and dev evaluation.

The sandbox uses the real guest onboarding subject and existing onboarding APIs. For anonymous guest sessions, the existing API boundary stores the guest identity/bond locally; this is not a persisted authenticated account. No production identity, token, or server profile was fabricated. Prior G1 route-gate and onboarding trigger tests remain relevant as mocked contract evidence; they do not prove save completion on device.

Metro remains available on port 8082 for this active device investigation. No app data was cleared. The wider screen exploration and UX audit remain incomplete because no stable post-sandbox destination could be inspected.

#### Post-sandbox blocker diagnosis (2026-10-19)

A data-preserving Android force-stop/relaunch and then a real `gurudevi:///self` deep-link attempt both reproduced the same result. The app process remained foregrounded. Android accessibility initially saw a blank shell and then only the `Opening your sanctuary` overlay; it never exposed Self screen controls. The route gate's own logs repeatedly reported `pathname: /self`, `decision: app`, `redirectTo: null`, `sessionMode: anonymous`, `onboardingCompleted: true`, and `isLocalGuestReady: true`. Logs repeated approximately every 0.32–0.46 seconds for minutes. A later instantaneous `top` sample showed approximately 124% app CPU and 1.6 GB RSS. Argent's JS component-tree and network-log inspection each timed out waiting for JavaScript runtime evaluation. This supports a JavaScript/render/route-commit saturation failure, but does not identify the hot component or prove the exact cause.

The onboarding backend is not missing for this guest path. Source inspection of `packages/core/src/api/onboarding.ts` shows that `createInitialBond` and `completeOnboarding` detect a Supabase anonymous session and persist the bond, display name, and completion flag using `updateLocalGuestIdentity`; the server oRPC onboarding endpoints are used by the non-anonymous branch. Device logs confirm the guest is locally ready and the route policy admits it. Thus this is not evidence of a 404, unavailable server snapshot, or missing guest onboarding API. Network interception could not complete because the JS debugger timed out, so I cannot claim that no unrelated requests occur after entry.

`SessionRouteGate` replaces `/onboarding` with the first admitted route. On the guest path, the identity/profile store has no resolved server profile/capacity, so `getFirstValueRoute` falls back to `/self`; that is the route selected on device. The `/self` screen source renders `SelfFloor` when no feature param is present, but it never became visible in the Android accessibility tree. A deep link to `/library` was also immediately kept at `/self` by the admitted route state and did not escape the blank transition. The on-device view therefore stops after onboarding completion at the route/render boundary.

Sandbox limitation: `handleDevFastTrack` stores the selected role in the local guest bond, but the `pricing_tier`, `citizenship`, and profile fields are only sent through `identityAPI.modifyUserProfile` for non-anonymous identities. The sandbox UI currently appears to offer these dimensions to guests without applying them to their local identity. This is a separate source-level gap; I did not alter guest identity semantics or fabricate profile data.

Recovery attempt: force-stop + normal launch, preserving all app data; then `gurudevi:///self` and `gurudevi:///library` intents. Result: `/self` admission remains valid, but the UI still shows only the opening overlay/blank shell. No intentional backend call, app-data clear, native rebuild, or dependency change was used. Keep the audit incomplete until a component-level profiler or a build/runtime isolation identifies and resolves the render saturation.
