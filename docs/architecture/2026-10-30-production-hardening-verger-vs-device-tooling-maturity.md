---
title: "Production Hardening: Verger Runtime Maturity vs. Battle-Tested Device Tooling"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Antigravity"
tags: [verger, runtime-performance, production-hardening, argent, agent-device, maturity-audit]
---

# Production Hardening: Verger Runtime Maturity vs. Battle-Tested Device Tooling

> **Core Thesis:** The presence of an abstraction, a test file, or a type definition in a codebase (`hysteresis.test.ts`, `selfRules.ts`, `outcomes.ts`) does **not** equal production maturity. While Verger's architectural direction has clear parity with the highest standards of the ecosystem, external tools like Callstack’s **`agent-device`** and Software Mansion’s **`argent`** have faced thousands of hours against real-world device fragmentation, thermal throttling on low-end chipsets, dropped frames, and OS quirks.
> This audit conducts an exhaustive, reality-grounded comparison between Verger's theoretical mechanisms and the battle-hardened implementations in `agent-device` and `argent`, establishing the concrete engineering steps required to elevate Verger from model simulation (G2) to hardware reality (G5).

---

## 1. The Epistemic Trap: File Presence $\neq$ Production Maturity

In software architecture, an agent or engineer frequently commits the **Epistemic Fallacy**: finding a file in the tree (e.g. `packages/verger-core/src/flapping.test.ts`) and declaring the problem "solved."

As documented in `playbook/open-items.md`:
* Verger’s native Kotlin sensors (`VergerSense.kt`, `VergerModule.kt`) had **never been compiled against a real Android SDK** prior to Phase F.
* Every single threshold in `DEFAULT_VERGER_CONFIG` (memory classes, weak-link network bandwidth, thermal cutoffs, battery temperature units) remains **provisional**.
* Verger's stability proofs are predominantly **G2 (model-evidence inside a node test harness)**.

Contrast this with the tools facing production reality:
* **Callstack `agent-device` (v0.21.33):** Developed through hundreds of CI pipelines across physical device farms, encountering real Android 14/15 accessibility service crashes, IME layout shifting, and OEM custom skins (Samsung OneUI, Xiaomi MIUI).
* **Software Mansion `argent` (v0.31.0):** Engineered by the authors of React Native Reanimated and Gesture Handler, designed to survive real Hermes GC pauses, native thread deadlocks, and IPC socket exhaustion.

Parity of **direction** confirms our architectural intuition is sound. But the **depth of implementation** must be rigorously hardened.

---

## 2. Exhaustive Parity & Maturity Audit: The 5 Critical Arenas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MATURITY GAP & PARITY AUDIT                           │
├─────────────────────┬───────────────────────────┬───────────────────────────┤
│ Operational Arena   │ Verger Internal Status    │ Hardened Production Art   │
├─────────────────────┼───────────────────────────┼───────────────────────────┤
│ 1. Settle Dynamics  │ Virtual mock time in      │ agent-device `--settle`   │
│    & Flapping       │ Vitest (`hysteresis.test`)│ dirty-bit raster wait     │
│                     │                           │                           │
│ 2. Observer Load    │ Abstract duty ratio       │ Argent v0.31 auto-capture │
│    & Self-Cost      │ calculation (`selfCost`)  │ suppression during trace  │
│                     │                           │                           │
│ 3. Relief Metrics   │ 3-move heuristics in code │ Perfetto kernel-level     │
│    & Dead Levers    │ (`selfRules.ts`)          │ thread & slice proof      │
│                     │                           │                           │
│ 4. Clock Sync       │ Process-relative at_ms    │ agent-device `logs mark`  │
│    & Trace Fusion   │ (no wall-clock bridge)    │ unified device log-clock  │
│                     │                           │                           │
│ 5. Workload         │ Abstract reason strings   │ Argent live Fiber walk &  │
│    Attribution      │ in 48-line ring buffer    │ AST Tree-sitter lookup    │
└─────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

### Arena 1: Settle Dynamics vs. Flapping Hysteresis

* **Verger’s Current State:**
  * Contains `hysteresis.test.ts`, `flapping.test.ts`, and a 400ms hold on gesture events (`gestureHold`).
  * *The Limitation:* It operates entirely on injected discrete timestamps in memory (`now() + 400`). It assumes frame metrics arrive in clean, orderly batches. On real Android hardware, `FrameMetricsListener` reports asynchronously; a GC pause can deliver 5 dropped frames at once *after* the gesture has already finished.
* **`agent-device`’s Battle-Hardened Mechanic:**
  * Uses the **`--settle` protocol**. It does not merely wait for a hardcoded timer. It polls native surface flinger buffers until the screen dirty-rate drops below a threshold (`minStableMs`), verifying that both animations and pending microtasks have finished before sampling.
* **Hardening Action for Verger:**
  * Upgrade Verger’s `gestureHold` into a **dynamic settlement envelope**. Do not release the gesture freeze on a static timeout; verify that `FrameMetrics` inter-arrival jitter has dropped back into the steady-state 16.6ms window before lifting quality levers.

---

### Arena 2: Self-Cost Budgeting & Observer Suppression

* **Verger’s Current State:**
  * Has `selfCost.ts` and `selfBudget.ts`. Over budget, it sheds `threads` and `longTasks` sensing before handing over to static floors.
  * *The Limitation:* The trigger is purely arithmetic (reducer duty ratio > 0.002). It does not know if the *operating system* is throttling CPU cores due to heat.
* **`argent`’s Battle-Hardened Mechanic:**
  * Discovered that active telemetry capture while recording CPU traces causes severe I/O thrashing and drops frames. In v0.31, Argent explicitly implemented **capture suppression**: during high-stress tracing, all non-vital background polling is silenced.
* **Hardening Action for Verger:**
  * Link Verger’s `selfBudget` directly to **hardware distress signals**, not just its own internal clock:
    * When `thermal === 'critical'` or `frameState === 'drop'`, Verger must automatically enter **Emergency Self-Throttling**: widening sensor polling windows and suppressing non-critical telemetry logging so the application has maximum CPU headroom to recover.

---

### Arena 3: Outcome Ledgers & Dead Lever Detection

* **Verger’s Current State:**
  * Implements `outcomes.ts` (`relieved` / `not-relieved`) and `selfRules.ts` (`ineffectiveAfterMoves: 3`).
  * *The Limitation:* A lever is declared "ineffective" if stepping it down 3 times does not clear pressure. But what if external background sync was the true culprit, not the UI lever? Verger risks permanently disabling a useful visual lever based on an unverified attribution.
* **`argent` & `agent-device` Production Mechanic:**
  * External tools verify cause-and-effect through **kernel Perfetto slices** and **atomic assertions**: they correlate the exact timestamp of an action with Linux CPU frequency scaling and thread scheduling.
* **Hardening Action for Verger:**
  * In the Phase F phone harness, use Argent's Perfetto trace recording to empirically validate whether stepping down a lever (e.g. `wallpaper=2`) actually reduces GPU composition time on the Samsung A52 Mali GPU. Calibrate the `ineffectiveAfterMoves` threshold against real kernel data before freezing it into production.

---

### Arena 4: Clock Synchronization & Evidence Bridges

* **Verger’s Current State:**
  * Verger’s Mars Pathfinder flight recorder (`flightRecorder.ts`) stamps lines with `seconds = Math.round((snapshot.at - sessionStartAt) / 100) / 10`.
  * *The Problem:* This clock is purely process-relative (`System.nanoTime()` or `performance.now()`). It has **zero correlation to the device’s wall-clock or ADB timestamps**. When an engineer inspects an Android `logcat` or an external Perfetto trace, matching a Verger decision to an OS event requires manual guessing.
* **`agent-device` Production Mechanic:**
  * Uses **`agent-device logs mark <message>`**. It injects explicit markers directly into the Android logcat stream. Because the marker lives in the same logcat ring-buffer as the application's native logs, all timing is unified to the exact microsecond of the OS log-clock.
* **Hardening Action for Verger:**
  * In Phase F test harnesses and `DeviceService`, inject `logs mark "verger-step:<action>"` before and after synthetic stress events. This provides a unified temporal anchor across ADB, Perfetto, and Verger flight tapes.

---

### Arena 5: Workload Attribution & Live Runtime Visibility

* **Verger’s Current State:**
  * Verger records abstract reasons (`frames`, `thermal`, `memory`).
  * *The Limitation:* When reviewing crash reports or ANR traces, seeing `reason: frames` tells you that the UI dropped frames, but leaves developers blind to *which* screen component was responsible.
* **`argent` Production Mechanic:**
  * Uses live Fiber tree walks (`react-profiler-fiber-tree`) and host-side Tree-sitter AST queries (`react-profiler-component-source`) to map jank directly to component source files and line numbers.
* **Hardening Action for Verger:**
  * Connect Verger’s workload registry (`host.ts`) to active navigation screen names and critical domain workflows (e.g. `workload:attendance-batch-save`). Stamp the active workload ID into the flight recorder line so production diagnostics pinpoint the exact domain culprit.

---

## 3. The Implementation & Hardening Roadmap

To graduate Verger from theoretical correctness to hardened production reality:

1. **Step 1 (Tooling Gateway Hardening - Today):**
   * Fix `packages/platform-mcp/src/services/DeviceService.ts`: Remove dangerous `shell: true`, map all `agent-device` and `argent` CLI verbs to their verified parameter schemas, and restore caret dependency bounds (`^0.31.0` and `^0.21.33`).
2. **Step 2 (The Automated Gateway Suite):**
   * Write exhaustive unit tests in `DeviceService.test.ts` verifying argument construction, escaping, and error handling.
3. **Step 3 (The Phase F Phone Crucible):**
   * Build the physical development client for the Samsung A52 (`pnpm verger:android-jvm`).
   * Run synthetic stress journeys using `agent-device` (`--settle`) and `argent` (`e2e-execute`) while capturing Perfetto traces.
   * Calibrate Verger's provisional thresholds against empirical hardware telemetry.

