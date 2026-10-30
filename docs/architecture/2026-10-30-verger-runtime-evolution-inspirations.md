---
title: "Verger Runtime Evolution: Internalizing Argent & Agent-Device Engineering Patterns"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Antigravity"
tags: [verger, cybernetics, runtime-performance, argent, agent-device, architecture, adaptation]
---

# Verger Runtime Evolution: Internalizing Argent & Agent-Device Engineering Patterns

> **Purpose:** Detailed architectural specification for transplanting proven mechanical, control-theory, and diagnostic patterns from external device automation tools (Software Mansion Argent & Callstack Agent-Device) directly into Verger’s pure-core metabolic runtime (`@repo/verger-core`).

---

## 1. Context & The Purity Invariant

**Verger** is the autonomous regulator inside Gurudevi that senses the phone, decides what each part of the app may spend, and publishes an immutable snapshot that downstream consumers read (visual policies, wallpaper, background sync, network limits).

### The Inviolable Core Constraint:
As governed by [`docs/engineering/runtime-performance/verger/playbook/README.md`](file:///c:/x/docs/engineering/runtime-performance/verger/playbook/README.md):
1. **`verger-core` remains 100% pure:** Zero React, zero React Native, zero Node, zero DOM. Time is injected.
2. **The reducer names no levers:** Levers and workloads are declared in host definitions; the reducer acts solely on abstract accounts, floors, and ladders.
3. **External tools stay outside:** We never import Argent or `agent-device` code into the runtime. We internalize their **mathematical principles, control loops, and diagnostic structures**.

---

## 2. The Four Internalization Pillars

```
┌────────────────────────────────────────────────────────┐
│                   EXTERNAL PROVEN ART                  │
├──────────────────────────┬─────────────────────────────┤
│ Callstack agent-device   │ Software Mansion Argent     │
│ • Settle / Quiet Window  │ • Observer Suppression      │
│ • Compact UI Diff Loop   │ • Fiber Tree & AST Mapping  │
│ • Semantic Predicates    │ • Native Kernel Correlation │
└─────────────┬────────────┴──────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌────────────────────────────────────────────────────────┐
│              INTERNALIZED IN VERGER RUNTIME            │
├────────────────────────────────────────────────────────┤
│ 1. Transient Hysteresis (Anti-Flapping Settle Window) │
│ 2. Autonomous Observer Silence (Self-Budget Shedding) │
│ 3. Workload Attribution in Mars Pathfinder Recorder    │
│ 4. Relief Metric Gate in Closed-Loop Simulator         │
└────────────────────────────────────────────────────────┘
```

---

### Pillar 1: Transient Hysteresis (Borrowed from `agent-device` `--settle`)

#### The Problem in Verger:
When a user flings a list, taps an accordion, or switches tabs, frame render times spike for 250–350ms during component mounting. If Verger reacts instantaneously to this transient spike, it triggers **lever flapping** (dropping the wallpaper or visual quality for a fraction of a second, then escalating it back up). Flapping causes noticeable visual stutter.

#### The Internalized Solution (`TransientHysteresis`):
In `@repo/verger-core/src/reducer.ts`:
* Introduce an internal `ContentionSettledWindow` (default: 400ms).
* When a frame drop or thermal bump is signaled, Verger checks whether the app is currently inside an active gesture or navigation burst (`gestureHold` or `transientMount`).
* If the disturbance subsides within the settled window, Verger **absorbs the burst** without stepping down the recovery ladder.
* Only persistent, sustained contention exceeding the settled window triggers metabolic load shedding.

---

### Pillar 2: Autonomous Observer Silence (Borrowed from Argent v0.31)

#### The Problem in Verger:
As Ashby’s second-order cybernetic loop establishes in [`second-order-loop.md`](file:///c:/x/docs/engineering/runtime-performance/verger/second-order-loop.md), Verger consumes the exact same CPU, memory, and battery it regulates. Under severe thermal throttling or memory pressure, continuing to poll CPU thread counters (`procfs`), dispatching telemetry pings, and taking `FrameMetrics` readings actively steals clock cycles from the struggling main thread.

#### The Internalized Solution (`ObserverSilence`):
In `@repo/verger-core/src/selfBudget.ts`:
Argent v0.31 added `skip auto-capture while a profiler records` to eliminate observer-induced disk I/O thrashing. Verger internalizes this as an absolute invariant:
* **The Rule:** *When the patient is suffocating, the doctor must stop measuring their pulse.*
* When `snapshot.frameState === 'drop'` AND `snapshot.thermal === 'critical'`:
  Verger activates the `emergencySilence` patch:
  1. Suspends thread contention sampling (`procfs` native thread monitors).
  2. Freezes in-memory flight tape formatting.
  3. Suppresses non-critical telemetry broadcasts.
  4. Yields 100% of available CPU quantum back to the UI thread until the device stabilizes.

---

### Pillar 3: Workload Attribution in Mars Pathfinder Flight Recorder (Borrowed from Argent AST Mapping)

#### The Problem in Verger:
Verger’s [`flightRecorder.ts`](file:///c:/x/packages/verger-core/src/flightRecorder.ts) maintains a fixed 48-line circular ring buffer of the last decisions before a crash or ANR:
```text
seconds | action | frame | thermal | memory | cap | reason | levels
14.2    | SIGNAL | drop  | hot     | normal | 60  | frames | wallpaper=2,sync=1
```
Currently, `reason: frames` tells you *that* frames dropped, but not *which domain workload* was executing at that exact moment.

#### The Internalized Solution:
Inspired by Argent’s `react-profiler-component-source`, Verger links active workloads to the flight tape:
* When a domain workload begins (e.g. `workload:attendance-batch-save` or `workload:heavy-wallpaper-render`), it registers its span with `Verger.dispatch('workload:start', { id })`.
* If a frame drop or memory trim occurs while a workload is active, the flight recorder stamps the attribution identifier:
```text
14.2 | SIGNAL | drop | hot | normal | 60 | frames[workload:heavy-wallpaper] | wallpaper=2
```
This gives production telemetry instant root-cause clarity without running external debuggers.

---

### Pillar 4: Mathematical Relief Verification (Borrowed from `agent-device` Semantic Predicates)

#### The Problem in Verger:
In automated test suites, tests often assert that a lever was stepped down, but fail to prove whether stepping down that lever actually fixed the problem.

#### The Internalized Solution:
In Verger’s closed-loop simulator ([`packages/verger-core/src/sim/closedLoop.ts`](file:///c:/x/packages/verger-core/src/sim/closedLoop.ts)):
* Inspired by `agent-device`'s iron rule (*"A bare screenshot is not verification"*), the simulator asserts **The Relief Metric**:
  $$\text{Relief}(L) = \frac{\Delta \text{Jank}}{\Delta t} > 0$$
* If stepping down a lever (e.g. dropping blur radius) produces zero measurable reduction in simulated plant temperature or jank within 10 seconds, the simulator marks that lever as **Dead / Ineffective** for that device profile.
* This guarantees that Verger never sacrifices UI visual quality for zero empirical gain.

---

## 3. Implementation Phasing

1. **Phase 1 (Tooling Bridge):** Update [DeviceService.ts](file:///c:/x/packages/platform-mcp/src/services/DeviceService.ts) to utilize the typed `@swmansion/argent/client` and `agent-device@0.21.33` for synthetic stress generation.
2. **Phase 2 (Verger Core Ingestion):** Implement `TransientHysteresis` and `ObserverSilence` in `@repo/verger-core`, validating against the 304 unit tests and the closed-loop stability suite.
3. **Phase 3 (Verification & Proof):** Replay an Argent journey while running Verger, confirming via Perfetto counter tracks that Verger stabilized the frame rate without dropping attendance data.

