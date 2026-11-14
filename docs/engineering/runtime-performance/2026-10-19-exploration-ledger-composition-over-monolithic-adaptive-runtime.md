---
title: "Exploration Ledger: Composition Over Monolithic Adaptive Runtime & The Missing Dependency Paradox"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, adaptive-runtime, composition, ADPF, thermal, runtimes, nitro, p-queue]
---

# Exploration Ledger: Composition Over Monolithic Adaptive Runtime & The Missing Dependency Paradox

> **Status**: Raw Uncompressed Exploration Ledger (Stage 1 Ground Truth)  
> **Suite**: [`docs/engineering/runtime-performance/`](file:///c:/x/docs/engineering/runtime-performance/README.md)  
> **Registry**: [`docs/engineering/runtime-performance/INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)  
> **Core Insight**: The absence of a single public "adaptive runtime" npm dependency is not an ecosystem omission—it is an architectural signal that the machinery already lives in specialized layers, and composition is the convergent standard.

---

## 1. The Core Thesis: The Missing Dependency Paradox

> **"Yes — substantial parts have been solved, repeatedly, in the right layers. The absence of one public 'adaptive runtime' dependency is itself the signal, not a gap."**

The natural instinct when designing an adaptive mobile system is to search for an all-in-one library (e.g. `react-native-adaptive-runtime`). When none is found, teams often assume they must build a massive, monolithic scheduler from scratch.

This exploration refutes that assumption:
1. Physical resource scheduling belongs to the operating system (Android ADPF, iOS Jetsam/Thermal APIs).
2. Specialized execution belongs to existing engines (Hermes, Reanimated worklets, TanStack Query, PowerSync, `p-queue`).
3. What is genuinely missing is never the machinery—it is **the application-specific priority policy** that maps environmental signals to domain budgets.

---

## 2. Where the Machinery Already Lives (The Ecosystem Layer Map)

| Layer | What Already Owns It | Concrete Ecosystem Examples |
| :--- | :--- | :--- |
| **Hardware & OS Scheduling** | Android & iOS Kernels | Android Dynamic Performance Framework (ADPF), Thermal API, Android 15 Memory Budget Manager, `isLowRamDevice`, iOS `BGTaskScheduler`, Android `WorkManager`, iOS Jetsam / memory pressure notifications. |
| **JS Execution & Isolation** | React Native / Hermes Core | React Native New Architecture (Fabric + Bridgeless), Reanimated worklets (UI-thread execution), Multi-runtime Hermes isolation. |
| **Query, Cache & Retry** | Data Layer Libraries | TanStack Query (stale-while-revalidate, retry backoff, cache garbage collection), PowerSync (SQLite offline synchronization). |
| **Optional Async Work** | General JavaScript Primitives | `p-queue` (concurrency limits, priority queues, pause/resume), `requestIdleCallback`, `requestAnimationFrame`. |
| **Device Signals** | Expo + Community Modules | `expo-device` (`isLowRamDevice`, total memory), `expo-battery`, `expo-network`, `@react-native-community/netinfo`, `react-native-device-info`. |
| **Monitoring & Telemetry** | Expo + Community Observers | EAS Observe (`expo-observe`), `@ribcage/expo-performance`, Android Studio / Perfetto memory profilers. |

---

## 3. Precedents in Adjacent Ecosystems

### A. Game Engines: The Benchmark for Dynamic Quality Levers
* **Unity Adaptive Performance** (Android ADPF Provider):
  - Consumes Android Dynamic Performance Framework (ADPF) thermal headroom signals, performance hints, and Game Mode APIs.
  - Dynamically scales graphics quality levers in real-time: render resolution scaling, shadow distance, particle count, post-processing effects, and target framerate (60fps $\rightarrow$ 30fps).
* **Unreal Engine ADPF Plugin**:
  - Similar real-time thermal throttling prevention via CPU/GPU workload pacing.
* *Why it works for games*: Games possess standardized, universal levers (resolution, shaders, frame rate) and a single, unambiguous success metric: **sustain target framerate without thermal throttling**.

### B. Web Platform: Progressive Enhancement Hooks
* **`GoogleChromeLabs/react-adaptive-hooks`**:
  - Provides React hooks for Client Hints: Network Effective Connection Type (`4g`, `3g`, `2g`, `slow-2g`), Device Memory (`navigator.deviceMemory`), CPU Cores (`hardwareConcurrency`), and `Save-Data` header.
  - Pattern: Progressive enhancement and asset gating (delivering static images vs. interactive 3D models), rather than a full monolithic OS scheduler.

### C. React Native Specialized Modules (Pieces, Not a Monolith)
* **`margelo/react-native-runtimes`** (with Callstack):
  - Spawns named, isolated secondary Hermes runtimes.
  - Prevents heavy background calculations, large chat message processing, or data transformations from starving the main JavaScript event loop (`mqt_v_js`). Built on Nitro Modules.
* **`rough-native`**:
  - Explicit `MemoryMonitor` with adaptive cache sizing linked to native memory pressure levels (`TRIM_MEMORY_RUNNING_CRITICAL`, etc.).
* **Background Task Wrappers**:
  - Nitro-based wrappers around iOS `BGContinuedProcessingTask` and Android `WorkManager`.

---

## 4. Why There Is No Single Monolithic "Adaptive Runtime" Dependency

1. **Different Layers Own Different Resources**:
   - Physical CPU frequency scaling, thermal throttling, memory compaction, and process lifecycle termination belong exclusively to the OS kernel.
   - Any third-party library attempting to second-guess OS-level scheduling fights the underlying kernel and breaks across OEM flavors (Samsung OneUI, Xiaomi MIUI/HyperOS, Google Pixel).
2. **The Intelligence Is Intrinsically Application-Specific**:
   - A general-purpose library cannot know: *"Should a teacher opening an attendance register preempt background synchronization of tomorrow's lesson plans, and by what margin?"*
   - Games have predictable rendering levers. Education platforms, offline-first forms, and communication apps have entirely different, context-sensitive priority hierarchies.
3. **Composition Is the Convergent Standard**:
   - Complex general-purpose algorithms (queues, exponential backoff, database transactions, native worker scheduling) are already battle-tested in dedicated libraries.
   - The custom code required is merely the **thin policy layer** that translates signals $\rightarrow$ application budgets. Writing a bespoke scheduler is more expensive and fragile than configuring proven modules.
4. **The Native Compatibility & Maintenance Tax**:
   - Deep native schedulers must continuously track Android NDK changes, iOS SDK deprecations, React Native New Architecture releases (RN 0.88 Fabric/Bridgeless), Hermes memory internals, and Expo upgrades.
   - Ecosystem consensus favors relying on standard OS signals and letting the platform do the heavy lifting.

---

## 5. Concrete Strategic Directives for Gurudevi

1. **Reuse Proven Building Blocks**:
   - Signals: `expo-device`, `expo-battery`, `expo-network`, `NetInfo` (only if needed).
   - Work Admission: `p-queue` for optional background queues, TanStack Query for data caching, PowerSync for offline sync, `expo-background-task` for headless background work.
2. **Build Only the Thin Policy Layer**:
   - Author only the domain-specific mapping:
     `Signals (RAM, Battery, Network, Thermal)` $\longrightarrow$ `Budgets (Concurrency, Prefetch depth, Visual fidelity, Sync pause)`.
3. **Continuous Budgets Over Rigid 5-Tier Hardware Boxes**:
   - Avoid classifying devices into rigid, artificial tiers ("Tier 1 through 5").
   - Prefer independently adjustable, continuous budgets (e.g., max concurrent downloads, image cache ceiling, particle count) because real-world signals fluctuate continuously during a session.
4. **Cautious Native Escalation (The Measurement Gate)**:
   - Only implement custom C++ Nitro Modules or native Expo Modules if:
     1. A specific signal is genuinely missing from Expo (e.g. direct ADPF thermal headroom or OS memory pressure callbacks).
     2. Empirical measurements prove existing high-level APIs cannot satisfy the use case.
5. **Verify Compatibility with the Active Stack**:
   - Always verify native modules against the active monorepo baseline (**Expo SDK 58, React Native 0.88, React 19, New Architecture Fabric/Bridgeless**).
