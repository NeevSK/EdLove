---
title: "Runtime Adaptation Controller Design"
status: "draft"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [mobile, architecture, adaptation, efficiency, performance]
---

# Runtime Adaptation Controller Design

## Intent and existing seams

Design one operational controller from existing `@repo/core/efficiency`
`evaluateEfficiency` and the UI `RealityProvider` / `VisualCapabilities`
boundary. Do not introduce a second device-profile service. The existing
[startup work ledger](2026-10-19-startup-work-ledger.md), [startup audit](2026-10-19-low-end-startup-architecture-audit.md),
and [profiling source register](../research/2026-10-19-device-profiling-source-register.md)
provide the owners and evidence contract. The current implementation is a
small startup admission pilot, not the complete controller designed below or
a certified performance budget.

Keep three independent inputs:

1. **Stable capacity facts:** existing `RealityState.deviceTier` derives from
   total device RAM. Preserve its meaning as a RAM class; do not interpret it
   as CPU speed, free memory, or a benchmark score. Add confidence/unknown
   beside the existing tier so startup's current default `medium / 4 GB` is not
   mistaken for a detected device. Unknown capacity uses the conservative
   optional-work cap until a real reading arrives.
2. **Live pressure and conditions:** battery saver/level, network and app
   foreground state already have partial signal paths. Add explicit memory and
   thermal pressure only where platform support supplies them; missing data is
   `unknown`, never fabricated as normal. Pressure may tighten work admission
   regardless of the stable RAM class.
3. **Journey phase:** a small operational phase value (`boot`, `public-ready`,
   `protected-ready`, `settled`, `background`) comes from actual lifecycle
   owners. It is not device capacity or visual fidelity. Do not advance to
   `settled` on a timer or a synthetic benchmark.

Visual quality remains user preference plus `Reality` facts through
`VisualCapabilities`. Operational safety decisions live in the core efficiency
policy. Existing `evaluateEfficiency` is the final operation-specific guard;
the controller supplies its current context and an admission permit.

## Signal inventory: present and missing

| Signal | Present in installed app | Design treatment |
| --- | --- | --- |
| Total physical RAM | `expo-device ~58.0.5`; `Device.totalMemory`; bridged through `DeviceProvider.getTotalMemory()` and `RealityProvider`. | Stable capacity hint only. Current UI thresholds classify RAM as low/medium/high; this says nothing about available RAM or CPU capability. |
| CPU identity / throughput | Expo Device exposes supported CPU architecture strings and year class, but neither is a measured speed/capacity signal. No CPU benchmark should run at startup. | Record architecture for diagnostics if needed; do not feed a CPU tier into policy without a separately validated source. A52's observed 7.3 GiB is memory evidence only. |
| Current app heap / system memory pressure | No shared app port. RN 0.88 types `AppState` `memoryWarning`, but installed/platform behavior is not proven for Android. Expo Device `getMaxMemoryAsync` reports Java VM heap limit, not current free memory. | Add an optional native Android provider only if needed: event-driven trim/pressure signal through `ComponentCallbacks2.onTrimMemory`; an `ActivityManager.MemoryInfo.lowMemory` snapshot is available but Android advises against polling it. Missing signal stays unknown. |
| Thermal pressure | No Expo/runtime port found. Android `PowerManager` exposes thermal status/listener from API 29. | Optional native provider extension; listen for status transitions, map to coarse pressure buckets, treat unsupported API/device as unknown. Never derive heat from RAM or observed CPU frequency. |
| Network / foreground | UI `RealityProvider` subscribes to NetInfo and `AppState`; app state is also used by auth lifecycle. | Reuse event feeds via shared facts; avoid duplicate listeners. AppState inactive/background cancels disposable work immediately. |
| Power | `expo-battery ~58.0.3` is installed and the native Runtime exposes low-power-mode read/listener through `DeviceProvider`. Battery level/state APIs and listeners exist in the package; existing background sync and storage maintenance read these independently. | Consolidate snapshot ownership around existing runtime/Reality seam; distinguish low-power mode from numeric battery and charging. Android battery-level listener is coarse (low/okay threshold events), so do not assume precise continuous updates. |
| Disk free space | `EfficiencyContext.freeDiskBytes` exists; background sync currently passes `null`, maintenance reads its own source. | Preserve unknown; do not infer free space from DB size or cache budget. Pass only a supported reading. |

Sources: installed package declarations for Expo Device/Battery and RN AppState;
[Expo SDK 58 Battery](https://docs.expo.dev/versions/v58.0.0/sdk/battery/),
[Expo SDK 58 Device](https://docs.expo.dev/versions/v58.0.0/sdk/device/),
[RN AppState](https://reactnative.dev/docs/appstate), Android [memory pressure](https://developer.android.com/reference/android/app/ActivityManager#getMemoryInfo(android.app.ActivityManager.MemoryInfo))
(see `getMemoryInfo` and trim callbacks), and [thermal status](https://developer.android.com/reference/android/os/PowerManager#addThermalStatusListener(android.os.PowerManager.OnThermalStatusChangedListener)).
Android runtime profiler APIs are diagnostic evidence; the shipped controller
must not depend on a debug profiler or Perfetto being attached.

## Shipped pilot and remaining design

`OptionalStartupServices` is now the first runtime consumer of
`@repo/core/efficiency` work admission. It samples the existing total-RAM
capacity hint, `Reality.isBatterySaverMode`, and `AppState`; it asks for
admission only from a requestAnimationFrame followed by an idle callback. Its
two jobs are background-sync registration and optional Google sign-in setup.
The shared `scheduleOptionalStartupWork` preserves a one-at-a-time lane,
deduplicates already-started task IDs through its progress record, catches a
task failure through the supplied owner callback, and cancels queued frame/idle
callbacks on cleanup. An already-started dynamic import is not abortable.

The current pilot passes `pressure: 'unknown'` and treats its frame+idle point
as `phase: 'settled'` for that optional lane. This is explicitly not the
product's Observe interactive/TTFD event or proof of screen readiness. The
30-second recovery window is declared but not exercised by this fixed-unknown
pilot; `reduceWorkAdmission` recovery behavior is tested independently. The
reducer latches constrained/severe observations and requires a caller-supplied
healthy observation window to recover; app background and non-settled phases
deny work, severe pressure denies work, otherwise the provisional concurrency
remains one. Unknown capacity is recorded, but does not by itself deny this
optional lane.

This pilot does not yet implement a generic bounded job queue, priority/demand
ordering, thermal or memory pressure inputs, pressure-driven cancellation, or
cross-producer integration. These remain proposals below. Do not describe the
pilot as adaptive to live CPU/memory pressure.

Current G1 boundary evidence: `workAdmission.test.ts` 8 tests,
`optionalStartupWork.test.ts` 4 tests, and startup coordinator plus telemetry
tests 12 tests. These establish reducer/scheduler contracts under test
substitutions, not physical timing or pressure-signal correctness.

**Cadence proposal:** read immutable capacity once after runtime bootstrap;
refresh event-driven facts on their existing NetInfo/AppState/power listeners;
read battery snapshot on app activation and immediately before background
dispatch. An Android pressure/thermal extension should be listener-based;
avoid periodic memory polling. Recompute admission on fact, phase, queue, and
job completion events only. These are low-overhead starting assumptions to
measure, not certified costs.

## Controller contract

**Inputs:** `capacity {ramTier, detected}`, `pressure {lowPowerMode, batteryLevel,
charging, memory, thermal}`, `network {type, metered}`, `appState`, explicit
`journeyPhase`, and job requests `{id, operation, priority, required,
abortable, dedupeKey}`. Represent every optional signal as value plus
`known/unknown` and observation time. Only lifecycle/job owners can update
journey phase; the controller never guesses readiness from elapsed time.

**Outputs:** derived visual facts remain in `Reality` and
`VisualCapabilities`; operational snapshot returns current phase, pressure
bucket, deferred reason, cancellation IDs and a maximum optional-job
concurrency. Keep it as a stable snapshot, not a per-frame React signal.

The initial proposed cap is at most **one optional job at a time** while
capacity or pressure is unknown or constrained. A higher cap is gated on
repeatable trace evidence; it is deliberately not inferred from RAM alone.
Essential route work and direct user actions outrank optional work. Queue
ordering is stable: required/user-visible priority first, then FIFO within
priority; deduplicate replaceable refresh/prefetch jobs by key. Bound queue
length and discard only explicitly disposable work; durable mutations stay in
their persisted queue.

### Deterministic admission and pressure transitions

```text
onFactsChanged(facts):
  phase = facts.phase                       // explicit owner transition
  pressureNow = combine(known low-power,
                        known battery below existing LOW_BATTERY_LEVEL,
                        memory warning/trim, known thermal bucket)
  if severe memory/thermal or app leaves active:
      latch pressure immediately; cancel abortable optional jobs
  else if pressureNow is constrained:
      latch constrained immediately
  else if all known recovery conditions hold continuously for proposed 30s:
      clear latch                            // provisional hysteresis, measure later
  publish only if phase, latch, admission cap, or visual bucket changed
  pump()

pump():
  never schedule durable user mutation behind optional work
  if not active: admit no disposable foreground work
  if phase before settled or severe pressure latched: admit no optional jobs
  if constrained/unknown: retain the provisional optional concurrency cap of one
  else choose next stable-priority job while under optional concurrency cap
  ask evaluateEfficiency(job.operation, current context) before dispatch
  defer if its policy denies, otherwise dispatch with AbortSignal when supported
  on pressure/phase regression: abort disposable jobs; retain durable commands
```

`30s` is a proposed recovery debounce, not a proven threshold. Severe signals
enter immediately; recovery requires known healthy conditions to avoid
oscillation. Existing `LOW_BATTERY_LEVEL` and metered/offline policy remain the
policy source; this design does not silently change those values.

## Integration and limits

- Extend `EfficiencyContext`/policy in `packages/core/src/efficiency` with
  operational pressure and phase inputs; keep direct user actions eligible.
  Keep durable mutations on their correctness-preserving path instead of
  relabeling them as optional jobs. Never disable encryption, account scoping,
  outbox durability, retry/lease invariants, or required local writes under
  pressure.
- Adapt facts through current `coreRuntime.device`, `RealityProvider` and
  `collectRealitySignals`; retain `RealityState.deviceTier` and UI policy as the
  only stable visual capacity representation. The UI gets updates only when a
  derived bucket changes, never from CPU-frequency samples or animation frames.
- Introduce an optional-job admission/queue boundary at existing producers:
  `EntryStartupBoundary` deferred imports, capability/feature hydration,
  background sync, storage maintenance and media prefetch. `PowerSyncProvider`
  activation and authenticated outbox are correctness/account lifecycle work;
  coordinate their scheduling without making the DB or durable commands
  disposable. `SessionRouteGate` reports journey readiness, not a new policy.
- Startup instrumentation now emits fixed `startup_stage` events for the five
  coordinator stages (`bootstrapPlatform`, `runtimeRegistration`, `loadCatalog`,
  `registerAppCatalog`, `initializeDeviceAccounts`) using Expo Observe. It
  emits only stage/outcome/finite duration; unavailable timing omits the
  duration attribute. It is capped at 64 events per process and observer
  failures warn once without changing startup outcome. This does not yet mark
  screen interactivity/TTFD or optional-job durations. Existing
  `observeEfficiencyDecision` rate-limits non-allow decisions; future pressure
  telemetry should aggregate and emit on bucket changes, never per frame/job
  or with account identifiers.
- Unknown startup capacity is conservatively limited to one optional job after
  the actual settled phase; missing thermal/memory pressure does not invent a
  fault state or CPU tier. Existing per-operation rules still defer work when
  required battery/network/disk context is missing.
- Any native Android provider extension needs the normal config-plugin/CNG path
  and API-level capability fallback; no direct generated `android/` edits.
  Signal costs, cadence, cancellation responsiveness and thresholds remain
  proposals until release-like evidence on the target cohort exists.

## Interaction evidence and diagnostic sessions

The runtime controller must be observable without turning every user gesture
into a high-volume analytics event. Use two deliberately separate paths.

### Always-on, bounded evidence

Expo Observe already provides release-build startup and router navigation
measurements. The existing `startup_stage` event is an example of the shape:
fixed event name, fixed low-cardinality attributes, a finite per-process cap,
and no account, text-entry, resource-ID, URL-query, or request-body data.

Add controller events only when the published operational snapshot changes:

| Event | Fixed attributes | Purpose |
| --- | --- | --- |
| `runtime_admission_changed` | `phase`, `pressure_bucket`, `optional_cap`, `reason` | Explains a decision to defer or permit optional work. |
| `optional_work_finished` | `job_id`, `outcome`, `duration_bucket` | Shows whether a named disposable startup job completed after admission. |
| `interaction_settled` | `interaction_kind`, `route_pattern`, `outcome`, `duration_bucket` | Connects a named product action to its visible completion boundary. |

Each producer must have a strict event budget and use duration buckets rather
than unbounded raw timings in normal sampling. Events are sampled, batched by
the installed Observe SDK, and never flushed synchronously from a press
handler. Existing route and startup metrics remain the source for raw timing
distributions. Existing Sentry breadcrumbs may retain a short, sanitised error
trail; they are not a substitute for a performance trace.

### Explicit diagnostic session

For an engineer-controlled reproduction, a short-lived local diagnostic session
can record a circular, in-memory timeline. It starts only through a development
or internal performance build control, has a hard event and elapsed-time cap,
and exports only when the tester intentionally captures it. It records:

- a generated session token and monotonic timestamps;
- semantic interaction IDs chosen by owned surfaces, never arbitrary button
  labels or user content;
- handler start, route change, named async-operation start/end, render-ready
  boundary, error boundary, and controller decision markers;
- the coarse runtime facts and work-admission decision at each marker.

It does not record typed text, user/account IDs, server payloads, full URLs,
auth headers, database rows, or every render. The production application keeps
diagnostic capture off unless a future product policy explicitly authorizes it.

React Native 0.88 exposes `PerformanceObserver` event entries with input delay,
processing duration, presentation delay, and an interaction ID. A small
observer may enrich an active diagnostic session with those native timing
phases, after verifying the installed type/runtime support on the target build.
It cannot identify product intent by itself, so owned press/navigation seams
must provide the semantic ID. It also cannot tell us per-tap CPU or memory.

For CPU, native frames, scheduling, GC, and memory attribution, pair a
diagnostic session with the existing bounded Perfetto capture. Both artifacts
use the same monotonic time base and session token. The resulting report says
that a trace interval overlaps an interaction; it does not claim an exact CPU
cost per tap unless the trace itself supports that attribution.

### Implementation order

1. Stabilize the current Self route failure and establish the internal
   performance APK as a release-like baseline.
2. Define `RuntimeFacts`, `WorkAdmissionSnapshot`, and a stable list of
   optional job IDs in core. The reducer stays synchronous and side-effect free.
3. Add controller-change and optional-job completion events with caps and
   sampling. Verify their event volume and failure behavior without a network.
4. Add explicit diagnostic-session start/stop/export in the internal build,
   then instrument one full journey: tap `Wellbeing` -> route/work boundary ->
   visible settled result or error.
5. Add listener-based Android memory/thermal facts through a config-plugin
   native extension only after the baseline identifies a need. The controller
   treats their absence as `unknown` and never polls them on a timer.
6. Compare one policy experiment at a time against the same recorded journey:
   baseline, conservative admission, then any pressure-aware variant. Keep a
   variant only if timing, error rate, memory, energy, and user-visible
   completion remain acceptable.
