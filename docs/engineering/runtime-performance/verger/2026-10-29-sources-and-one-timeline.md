---
title: "Verger sources and one timeline: every signal we can get, on one clock"
status: active
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
tags: [verger, sensing, devtools, expo-observe, android, perfetto, clocks]
---

# Verger sources and one timeline

Verger can only decide as well as it sees. This page lists, per source, the most it can give,
what we capture today, and the gap; then how all of it lands on **one clock** so a tap, a frame,
a JS task, a network call, a heat reading and a Verger decision line up exactly. Grounded in the
installed packages (paths below) and current docs, 2026-10-29. Builds on
[sensing.md](sensing.md) and the [intent and evidence roadmap](2026-10-28-intent-to-evidence-and-refinement-roadmap.md) (P1: sources and clocks).

## The finding that makes this possible

On Android, React Native 0.88's `performance.now()` is `std::chrono::steady_clock::now()` from
the clock's epoch (`ReactCommon/react/timing/primitives.h`, `HighResTimeStamp::now`), not from app
start. That is `CLOCK_MONOTONIC`, the clock Java's `System.nanoTime()` reads, and CDP trace event
timestamps are built from the same `HighResTimeStamp`. So **JS, native and DevTools traces share
one clock** and can be joined exactly.

Two things in our code discard this today:

- `VergerSense.kt` subtracts its own `originNs` from `System.nanoTime()`.
- `verger-android/src/mapping.ts` stamps each native event with JS `performance.now()` at
  receipt, adding bridge latency to every native reading.

Both are fixed by carrying the raw monotonic milliseconds. The equality is to be **proved on a
phone** (one JS and one native read in the same tick, difference under 1 ms) before any join is
marked exact.

## Sources

| Source | The most it can give | Clock | Captured today | Gap |
|---|---|---|---|---|
| **RN DevTools, CDP Tracing** (RN 0.88 `jsinspector-modern`) | JS CPU samples (`Profile`, `ProfileChunk`), task and microtask runs, user timing (`blink.user_timing`, React's performance tracks), frames (`BeginFrame`, `DrawFrame`, `frame_sequence`), screenshots (`disabled-by-default-devtools.screenshot`), resource events | monotonic, µs | Only by manual export and import (`importReactNativeDevToolsTrace`) | Capture automatically: a Metro middleware tap, and headless `Tracing.start`/`end` on request |
| **RN DevTools, CDP Network** | HTTP request, response, timings, failures, bodies (`getResponseBody`), and WebSocket create, handshake, frames, close | monotonic | Nothing from CDP | Tap it; bodies off by default (privacy) |
| **RN DevTools, Runtime, Log, ReactNativeApplication** | Console calls, log entries, system state changes, trace requests | monotonic | Not tapped | Tap it |
| **Hermes, Memory and profiler panels** | Heap snapshots, sampling heap, CPU profiles (per RN DevTools docs; the Hermes agent ships in the native artifact, not verifiable from installed JS) | monotonic | No | Request on demand from the tap; large, dev-machine only |
| **In-app `PerformanceObserver`** (RN 0.88 `webapis/performance`) | `mark`, `measure`, `event` (Event Timing), `longtask`, `resource` (Resource Timing), `performance.memory`, `performance.rnStartupTiming` | monotonic, ms | `longtask`, `event`, JS heap | `resource`, `mark`/`measure`, `rnStartupTiming` unread |
| **Expo Observe** (`expo-observe` 58.0.16) | Cold and warm TTR, TTI per route (Expo Router integration), custom events, JS errors, EAS Update downloads, network traces, Reanimated errors; sends to EAS Observe or an OpenTelemetry backend | wall clock | Router integration on; `logEvent` from startup telemetry | Outbound only, no local read-back. Record its EAS client id in our session manifest so dashboards join ours; network traces and Reanimated integration are off |
| **Expo dev tools plugins** (`@expo/devtools` 58.0.2) | Two-way WebSocket between app and a dev-machine page through Metro (`useDevToolsPluginClient`) | n/a (transport) | Not used | The live channel phone ⇄ laptop for our capture |
| **Android, sensed by `verger-android`** | FrameMetrics stages, per-thread CPU (procfs), `statm`, trims, `ActivityManager.MemoryInfo`, thermal status and headroom, battery saver, battery broadcast, network capabilities, data usage (`TrafficStats`), CPU headroom (API 36), exit reasons, display modes | monotonic (origin-shifted today) | Yes | Raw clock (above) |
| **Android, not yet read** | `android.os.Trace` sections and counters (Verger decisions visible in Perfetto); battery current and energy counters (`BatteryManager` properties); `ProfilingManager` system trace, stack sampling, heap profile, heap dump (API 35+; not on the A52, API 34); GPU headroom (API 36, deliberately unread so far); Perfetto system trace over adb (scheduler, CPU frequency, thermal zones, power rails, GPU frequency) | Perfetto: BOOTTIME with clock snapshots to MONOTONIC | No | Add `Trace` markers first (cheap, makes every Perfetto trace line up with Verger); the rest on demand |

## One timeline

```text
 phone                                                    dev machine
 ─────                                                    ───────────
 JS (performance.now)  ──┐                                 Metro middleware CDP tap
 native (nanoTime raw) ──┼─► local capture (SQLite) ◄────► (Tracing, Network, Runtime, Log)
 Verger decisions      ──┘        │   @expo/devtools          │
 android.os.Trace markers         └──────── channel ──────────┼─► dev-machine store (SQLite)
                                                              │     joined on monotonic ms
 Perfetto / ProfilingManager traces (BOOTTIME + snapshots) ───┘     summary back to phone lab
 Expo Observe (wall clock) ── joined by EAS client id + a session clock pair, labelled estimated
```

Rules (from the roadmap's P1, kept):

1. Monotonic milliseconds are the join key. Perfetto converts BOOTTIME to MONOTONIC through its
   own clock snapshots. Wall-clock sources join through a (wall, monotonic) pair taken at
   session start and are labelled `estimated`.
2. A source is joined as exact only after its mapping is measured on the device.
3. Every source reports its state: disabled, unavailable, pending, silent, capped, dropped,
   failed. Silent is not unsupported.
4. Raw detail stays separate from the windows the reducer uses; finer observation never means
   faster control.
5. Exhaustive level only. Normal (release) phones keep bounded field telemetry.

## Build order

1. **One clock.** Native events carry raw monotonic ms; JS keeps receipt time beside it, so
   bridge latency becomes a measurement. G5 proof: JS and native difference on the A52.
2. **Read what is free in-app:** `resource`, `mark`/`measure`, `rnStartupTiming`; record the
   EAS client id and a session clock pair in the manifest.
3. **`android.os.Trace` markers** for Verger decisions, lever moves and screen changes.
4. **Metro CDP tap** writing the dev-machine store; headless `Tracing.start`/`end` on request.
5. **`@expo/devtools` channel:** phone capture streams to the store; joined summary back.
6. **On demand:** Perfetto over adb and `ProfilingManager` (API 35+), Hermes heap and profile.

Each step: G1/G2 tests for parsing, ordering and clocks; G5 on the A52 for capture and the join.

**Built 2026-10-29 (steps 1 to 3):**

- Step 1: `VergerSense` stamps frame windows and every payload (`sensedAtMs`) on raw
  CLOCK_MONOTONIC; events carry `sensedAt` beside `at`; the capture records `bridge_delay_ms`;
  `readMonotonicMs` and `probeVergerClocks` record a `verger-clock-probe` at each exhaustive
  launch. This also fixes the gain probe (`measureGain`), which compared a sensor-origin window
  time with `at` and so never measured a gain on a phone.
- Step 2: `observeDevelopmentTimings` records Resource Timing (origin and path only, ids masked),
  marks, measures and `rnStartupTiming`; the session manifest records Expo Observe's
  `clientId` beside its existing clock pair (`timeOriginMs`).
- Step 3: each published decision is a `verger:<action>` user-timing mark (DevTools timeline)
  and `verger.*` counter tracks via `traceCounters` (`decisionCounters`; Perfetto, only while
  a system trace records). RN's own Perfetto path for marks is compiled out (`WITH_PERFETTO`
  unset), hence the native counters.

Evidence: G0/G1 — Verger gate ALL_PASS=1 (597 cases), new mapping, counter, timing and level
tests. Not yet: the Kotlin changes are uncompiled here (`pnpm verger:android-jvm` and a dev
client build), and the clock equality, bridge delay and Perfetto tracks are unproved on a phone.

## Open choices (Naveen's)

- Network bodies and screenshots in the store: off by default here; on per session?
- Size limits for the phone and dev-machine stores (the phone store has no quota today).
- Whether Expo Observe's network traces go on in production (sampled, sent to EAS).

## Sources

- [React Native DevTools](https://reactnative.dev/docs/react-native-devtools), [RN 0.83 release](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
- [Expo Observe, SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/observe/), [EAS Observe metrics](https://docs.expo.dev/eas/observe/reference/metrics.md)
- [ProfilingManager](https://developer.android.com/reference/android/os/ProfilingManager), [SystemHealthManager API 36 changes](https://developer.android.com/sdk/api_diff/36/changes/android.os.health.SystemHealthManager)
- [Perfetto clock sync](https://cobalt.googlesource.com/cobalt/+/HEAD/third_party/perfetto/docs/concepts/clock-sync.md)
