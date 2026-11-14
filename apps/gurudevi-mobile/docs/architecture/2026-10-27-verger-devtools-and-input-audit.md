---
title: "Verger, Expo debugging tools, and native input audit"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Codex
tags: [verger, devtools, gestures, audit, evidence]
---

# Scope and outcome

Maintain Mode audit of Expo debugging affordances, optional Verger integration,
and mobile press/gesture contracts. No runtime code, dependencies, gestures, or
existing capture behavior changed. This is a bounded source and contract audit,
not an exhaustive device certification of every screen.

Installed substrate inspected: React Native 0.88.0, RNGH 3.4.0, Reanimated 4.7.1,
Worklets 0.13.0. App manifest: Expo ~58.0.17. Research used broad official tool
documentation followed by exact release tags and installed implementation files.

## What is already integrated

| Affordance | Current repository evidence | Gap or intended use |
| --- | --- | --- |
| JS long tasks | `packages/verger-react/src/longTasks.ts`; mounted by `VergerRoot` | Runtime observer, feature-detected; not UI-worklet execution profiling |
| Event Timing / input delay | `packages/verger-react/src/inputDelay.ts`; `processingStart - startTime`, threshold 104 ms | Already implemented; `verger/sensing.md` still labels this missing. Slow entries only; not a complete interaction stream |
| JS stalls outside long-task reporting | `jsSamplers.ts`, visible-app event-loop sampler | Timer estimate, not native input delivery latency |
| Hermes heap / GC | `jsSamplers.ts`, optional `getInstrumentedStats` | Selected statistics, not heap snapshots or allocation stacks |
| Touch presence | `packages/verger-react-native/src/VergerRoot.tsx` | One root `View`, start/move responder capture, returns false, throttled to 250 ms. Presence only; no press-success, end/cancel, accessibility activation, or native modal coverage guarantee |
| Native performance sensing | `packages/verger-android`; existing frame/thread/thermal/memory sources | Native signals complement JS observations; this audit does not attest their device accuracy |
| Screen and scroll context | `GurudeviVerger` screen announcer; existing Verger scroll-presence seam | Reuse these rather than adding per-screen capture wrappers |
| Bounded recording / lab | `recordEvents`, `Verger.recording()`, `labReport`, existing Verger lab | Existing integration point for optional diagnostic correlation |

The installed RN `src/private/webapis/performance/PerformanceObserver.js` and
`EventTiming.js` contain Event Timing and duration-threshold support. The existing
input-delay adapter feature-detects support and stays inert without it.

## Expo and React Native DevTools coverage

These tools serve different purposes; availability in DevTools does not imply a
supported production subscription API for every panel.

| Tool or affordance | Repository coverage found | Verger disposition |
| --- | --- | --- |
| Developer menu, reload, Fast Refresh | Expo development workflow | Operator controls; do not use as regulator inputs |
| SDK 58 `EXPO_NO_DEV_MENU=1` | Documented upstream; launch adoption not established here | Use for reproducible agent/device journeys |
| FPS/RAM/heap/view-count overlay | Native and JS Verger sensing overlap partially | Do not scrape overlay; compare against native tools during profiling |
| Element inspector, touchable highlighting | Developer tooling | Diagnose occluding views, target geometry, and touch ownership; highlight does not prove press delivery |
| Console, Sources, breakpoints, caught exceptions | Supplied by DevTools | Debug missing callbacks; debugger pauses distort performance samples |
| Network inspector | DevTools/Expo tooling; no Verger panel ingestion found | Correlate request timings with a journey; retain device network signals for regulation |
| Performance timeline, React tracks, User Timings, CPU samples | Runtime long-task/input observers cover only part | Add optional short correlation sessions, not continuous CPU profiling |
| Components, render highlighting, React Profiler | DevTools | Development-only diagnosis of render/commit cost; no runtime bridge found |
| Memory snapshots and allocation profiles | Hermes summary sampler is not equivalent | Explicit diagnostic sessions; not continuous control-loop inputs |
| Light/dark emulation introduced in RN 0.86 | Available upstream | Appearance test control, not a sensing source |
| Rozenite / Expo dev-tool plugins | Plugin dependency and `src/devtools.js` exist | Registration code alone is not proof of integration: no caller of that file was found in the searched app JS/TS source. Verify package exports and entry/Metro wiring before using it |
| VS Code Expo debugger | Upstream alternative using inspector protocol | Optional developer workflow; no Verger ingestion required |
| Old React Native Debugger / remote JS execution | Expo documents incompatibility with Hermes | Do not introduce it into this stack |
| Android Studio / Xcode native profiling | External native tools | Required to distinguish UI thread, native recognizer, and worklet problems from JS stalls |
| Production crash reporting | Separate operational concern in Expo guide | No new crash-reporting integration audited or claimed here |

Network and Performance panels arrived in RN 0.83, not 0.86. RN 0.86 added
DevTools improvements including appearance emulation. Expo's network panel has
different coverage and integration limits from the RN network panel; do not
assume every request source appears in both.

## Confirmed findings and input risks

1. **Failing workspace contract.** Running
   `pnpm --filter gurudevi-mobile exec vitest run src/__tests__/architecture/workspace-drag-modern-api.test.ts --maxWorkers=2`
   produced 1 passed / 1 failed. The test requires `usePanGesture`, but
   `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` uses
   `Gesture.Pan()` and builder composition despite comments claiming hook migration.
   This is a source-policy failure, not proof that a phone press fails.
2. **Mixed callback dialect in the action sheet.**
   `packages/ui/src/components/ui/actionsheet/index.tsx` uses builder `onEnd`
   but reads `event.canceled`. Installed builder `gesture.ts` defines the second
   `success` argument; `eventReceiver.ts` passes false on cancellation. The
   newer hook API uses `event.canceled`. As written, cancellation can satisfy
   `!event.canceled` and close a sheet dragged beyond the threshold. Source
   mismatch confirmed; real UI reproduction remains required.
3. **Gesture activation and cleanup need scenario checks.** The workspace
   long-press and pan are simultaneous; pan activation is not delayed by the
   long-press condition, only its updates are ignored until `isDragging`.
   Check ordinary child taps and scrolling, long-press without pan activation,
   cancellation and interruption. Cleanup lives in pan `onEnd`; this audit does
   not prove every long-press path reaches it.
4. **Builder API remains supported but deprecated.** Installed RNGH
   `handlers/gestures/gestureObjects.ts` explicitly marks builders deprecated;
   `v3/index.ts` exports hook gestures. Installed `v3/detectors/GestureDetector.tsx`
   routes builder objects to its legacy detector, so a builder is not automatically
   a runtime incompatibility. The repository's supplied AGENTS ledger still says
   to always use `Gesture.Pan()`; that conflicts with installed deprecations and
   the workspace test. Record the conflict before a separate migration; do not
   perform a broad replacement under this audit.
5. **Worklets boundary is mostly aligned in the sampled components.** Drag/FAB/
   achievement callbacks use `scheduleOnRN` from Worklets. The action sheet's
   `runOnJS` also comes from Worklets, where the installed package exports it;
   its name alone is not an invalid-import finding. Babel explicitly loads the
   Worklets plugin. Native binary/JS version alignment was not measured.
6. **Animated hit testing is conditional.** Reanimated documents changed touch
   detection with synchronous non-layout prop-update flags and recommends RNGH
   Pressable in that situation. The shared UI Pressable wraps RN Pressable.
   Installed static defaults have both synchronous flags false; no app override
   was found in the searched JS/TS/JSON. Do not claim this is the historical cause
   or globally replace Pressable without inspecting the actual built flags.
7. **Optional sensing has an overhead gap.** `VergerRoot` installs the JS observers
   and samplers based on launch-time `runs`, while `sensorOf` maps their events to
   the `longTasks` sensor for reducer filtering. Filtering events is not the same
   as stopping observers/timers when that sensor is disabled or the runtime is
   later killed. A future optional diagnostics implementation must reconcile
   actual subscription lifetime with activation and stop, and test both.

RNGH 3.4 release notes specifically cover transformed-child detector bounds,
native-view takeover cancellation, ACTION_CANCEL, root pointerEvents, initial
manual activation, fling-stop press suppression and press-in/out timing. These
are regression scenarios to exercise, not evidence that a dependency bump alone
fixed this application. A tap stopping a fling may intentionally not press.

## Optional integration design

Extend existing Verger adapters and lab rather than importing DevTools internals
into pure `verger-core` or scraping a panel.

1. Keep normal operation on the existing cheap observers and native readings.
   Send app observations through `dispatch`, device readings through `signal`.
   Missing/unsupported evidence must remain unknown.
2. Offer a development-only diagnostic session using the existing bounded
   recording. Export a shared session marker/time origin and User Timing marks
   for selected screen, interaction, and Verger decision events. This is a
   proposed correlation bridge, not an implemented feature. Feature-detect APIs,
   bound records, clean up on stop/background, and measure instrumentation cost.
3. Capture press outcome at the existing press primitive or domain action where
   success is known; count start, completion, cancellation and outcome separately.
   Do not collect typed text, labels or coordinates merely to establish presence.
4. Retain the root presence fallback until a replacement proves native modal,
   RNGH-only gesture, continuous drag, cancellation, accessibility and off-mode
   behavior. Event Timing filters fast events and is delivered after processing;
   it cannot alone replace timely presence or prove a successful press.
5. A native input observation adapter is worth prototyping if wrapper elimination
   remains useful, but no portable non-intercepting root API was established in
   this audit. It needs explicit lifecycle/coverage contracts and device proof;
   do not substitute a global competing RNGH recognizer or private RN patch.
6. Migrate gesture relations as coherent groups if approved: upstream forbids
   relations between hook and builder APIs. Preserve taps, drag persistence,
   haptics, cancellation reset and scroll ownership. No per-frame JS forwarding.

## Verification and next device work

- G0 static / TypeScript: `pnpm verger:check` completed all five Verger package
  typechecks and printed `ALL_PASS=1`.
- G1/G2/G3 / Vitest 5.0.5: the same gate reported 517/517 tests across 62 files
  (304 core, 25 Android contracts, 18 web adapters, 136 Gurudevi host, 10 UI,
  14 mobile runtime, 10 web integration). Engines include substituted native APIs
  and jsdom. This proves those configured contracts, not native gesture delivery.
- G0 source contract / Vitest: separate workspace-drag architecture suite
  1/2 passed; missing `usePanGesture` assertion failed. No assertion was weakened.
- Device discovery / Argent: zero devices and zero AVDs returned. No G5 claim.
  No physical tap, native cancellation or transformed-hit-area check was possible.
- Repository checks: CNG, native-slop, version-drift and test-evidence commands
  exited 0. Native-slop reported only 3 audited files; this is not a whole-app
  gesture certification. `audit:device-evidence` exited 0 against a saved baseline
  fixture and rewrote its timestamp; the generated change was restored, and that
  command is not fresh G5 evidence.
- Full `check:anti-slop` exited 1 at Fallow: 336 dead-code issues, 814 complexity
  findings and 620 clone groups across 1,851 changed files relative to its
  merge-base. Later chained checks did not execute. This documentation-only
  audit did not repair or weaken that repository gate. Logs are in the Windows
  temporary directory under `verger-input-audit-*.log`.

Next connected-device matrix: runtime off/shadow/active; RN and RNGH buttons;
quick tap, repeated tap, long press/release without movement, drag and interruption;
scroll and fling-stop; keyboard dismissal; sheet/modal/portal; translated/scaled
targets; accessibility activation; foreground/background. Assert the intended
action outcome as well as presence and latency. Record native build identity and
actual static flags; repeat performance measurements without an attached debugger.

## Sources checked on 2026-10-27

- [Expo debugging and profiling tools](https://docs.expo.dev/debugging/tools/)
- [React Native DevTools](https://reactnative.dev/docs/react-native-devtools)
- [RN 0.86 release, June 11, 2026](https://reactnative.dev/blog/2026/06/11/react-native-0.86)
- [RNGH 3.4.0 release, October 16, 2026](https://github.com/software-mansion/react-native-gesture-handler/releases/tag/v3.4.0)
- [RNGH hook migration and relation restrictions](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/upgrading-to-3/)
- [Reanimated 4.7.1 release](https://github.com/software-mansion/react-native-reanimated/releases/tag/4.7.1)
- [Reanimated performance and hit-testing caveat](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)
- [Worklets 0.13.0 release](https://github.com/software-mansion/react-native-reanimated/releases/tag/worklets-0.13.0)

Installed package files, rather than unversioned documentation alone, ground the
callback signatures, API exports, observer options, and static flag defaults above.
