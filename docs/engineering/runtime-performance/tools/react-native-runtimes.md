---
title: "Tool Dossier: react-native-runtimes (@react-native-runtimes/core)"
status: "active"
classification: "experimental-research"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [runtime, performance, hermes, multi-threading, nitro-modules, cng, expo]
---

# Tool Dossier: `react-native-runtimes`

> **Canonical Substrate Reference**: `@react-native-runtimes/core`  
> **Ecosystem Hub**: [runtimes.margelo.com](https://runtimes.margelo.com)  
> **Source Repository**: `github.com/Szymon20000/react-native-runtimes`  
> **Parent Matrix**: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)

---

## 1. Metadata & Vital Statistics

| Dimension | Specification | Grounded Details |
| :--- | :--- | :--- |
| **Package Identifiers** | `@react-native-runtimes/core`, `@react-native-runtimes/state` | Core multi-runtime engine + C++ shared state layer |
| **Primary Authors / Maintainers** | Szymon Kapała, Szymon Chmal, Alex Shumihin, Ritesh Shukla | Margelo / Callstack Ecosystem |
| **Organization Backing** | **Margelo $\rightarrow$ Callstack** | Margelo merged with Callstack (Sept 2026), housing Nitro Modules & performance R&D |
| **Genesis Date** | May 27, 2026 | First public alpha (`0.1.0-alpha.0`) published to npm |
| **Latest Substrate Release** | `v0.1.0-alpha.2` (August 5, 2026) | Active pre-release status; tracks React Native New Architecture |
| **License** | **MIT** | Standard open-source permissions; zero SaaS/AI training restrictions |
| **Production Readiness Tier** | **Tier 4 (Experimental / Lab Alpha)** | Suitable for isolated spikes; **NOT** hardened for critical production releases |
| **Native Architecture Prereqs**| RN 0.76+, React 19, New Architecture (Fabric + TurboModules), Hermes engine | Hard requirement: crashes on Old Architecture or non-Hermes engines |
| **Native Interop Engine** | **Nitro Modules** (`react-native-nitro-modules`, `nitrogen ^0.35.7`) | Direct C++ JSI bindings without bridge serialization |

---

## 2. What It Does (Architectural Mechanism)

### The Single-Runtime Bottleneck in React Native
Traditionally, React Native runs the entirety of an application’s JavaScript code inside a single main Hermes runtime pinned to the JS thread. When heavy rendering, state hydration, or long JSON parsing monopolizes that runtime, frame drops and input latency occur on the UI thread.

```
Traditional Single-Runtime Architecture:
┌─────────────────────────────────────────────────────────┐
│  Main Hermes Instance (Single Heap, Single Event Loop)  │
│  UI Navigation ─── Component State ─── Sync / Math      │
└─────────────────────────────────────────────────────────┘
```

### The Multi-Hermes Solution
`react-native-runtimes` allows developers to instantiate **secondary, named Hermes VM instances** in parallel within the same OS process:

```
Multi-Runtime Architecture (react-native-runtimes):
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  Hermes Instance 0 (Main)   │   │  Hermes Instance 1 (Worker) │
│  Heap A (15MB)              │   │  Heap B (10MB)              │
│  UI & Navigation            │   │  Heavy Workload / List      │
└──────────────┬──────────────┘   └──────────────┬──────────────┘
               │                                 │
               └────────► [C++ Nitro Memory] ◄───┘
```

* **Surface Component**: `<OnRuntime name="worker-runtime">` mounts and renders subtrees inside the secondary runtime.
* **Shared State**: `@react-native-runtimes/state` uses Nitro C++ shared memory buffers to pass reactive primitives across Hermes boundaries without JSON serialization.

---

## 3. `react-native-runtimes` vs. `react-native-worklets` (Software Mansion)

> **Source**: [Margelo Official Guide: Comparison with react-native-worklets](https://runtimes.margelo.com/docs/guides/vs-worklets)

Margelo and Callstack explicitly clarify that these two technologies are **complementary, not competing**, because they operate on completely different granularities:

```
┌────────────────────────────────────────────────────────────────────────┐
│               WORKLETS vs. RUNTIMES: THE DIVISION OF LABOR             │
├──────────────────────────────────┬─────────────────────────────────────┤
│ react-native-worklets (SWM)      │ react-native-runtimes (Margelo)     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Micro-Threading / Frame-Pacing │ • Macro-Threading / Subtree Boundary│
│ • Runs on UI Thread (or Worker)  │ • Complete Secondary React Engine   │
│ • Synchronous, 60/120fps precise │ • Asynchronous render & state trees │
│ • Lightweight Hermes functions   │ • Loads ENTIRE JS application bundle│
│ • Best for: Gestures, animations,│ • Best for: Isolating entire screens│
│   physics, raw parallel compute  │   or separating business logic from │
│                                  │   the UI renderer                   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### 1. What Worklets Win At
* **Frame-precise UI interactions**: Worklets execute synchronously on the main UI thread during gesture sweeps, scroll events, and layout transitions.
* **Raw parallel compute**: If you need to run mathematical calculations, data sorting, or signal filtering in parallel, **use `react-native-worklets` (`createWorkletRuntime`)**. Spinning up a runtime just for compute is an anti-pattern.

### 2. What Runtimes Win At (The 3 Canonical Architectures)
According to Margelo, `react-native-runtimes` is designed for three progressive architectures:
1. **Critical Subtree Offloading**: Wrapping an expensive list (e.g. `LegendList` or complex stock charts) in `<OnRuntime>` so main-thread navigation and drawers never stutter.
2. **Dual-Thread Rendering**: Splitting screens across two threads (e.g. in a chat app, conversation drawer renders on Runtime 0 while the message feed renders on Runtime 1).
3. **Pure Business Logic Separation (The Optimal Architecture)**:
   - **Runtime 1 (Headless Background)**: Prewarmed natively at app launch. Holds WebSocket connections, SQLite/PowerSync reads, and network fetching.
   - **Runtime 0 (Main Rendering)**: Serves cached data from Nitro shared state without ever being interrupted by background business logic.

### 3. The Critical Catch: Whole-Bundle Reload
Margelo explicitly notes:
> *"Should I spin up 10 runtimes to compute something faster? No. Each runtime is a full React Native environment — it loads the entire bundle, runs a React renderer, and registers native modules."*

Because each runtime loads the **entire JavaScript bundle** into memory, spinning up secondary runtimes in memory-constrained devices (like budget Android phones in schools) carries a severe RAM penalty.

---

## 4. The Bare RN vs. Expo CNG Conflict

### The Conflict Encountered in Quick-Start Guides
The official documentation ([runtimes.margelo.com/docs/getting-started/quick-start](https://runtimes.margelo.com/docs/getting-started/quick-start)) instructs developers:
> *"Open `MainApplication.kt` (Android) and `AppDelegate.mm` (iOS) and paste Kotlin / Objective-C++ code to prewarm your runtimes..."*

This directly clashes with the **Expo Continuous Native Generation (CNG)** doctrine and [`AGENTS.md`](file:///c:/x/AGENTS.md) Rule 3:
* **The CNG Rule**: `android/` and `ios/` are ephemeral build directories. Editing them manually is strictly vetoed by `pnpm run check:cng`. Any manual edit will be obliterated by `expo prebuild --clean` or EAS Cloud builds.

### The Grounded Solution: Official Expo Config Plugin
Inspection of `@react-native-runtimes/core`'s package manifest reveals:
```json
{
  "expo": {
    "plugin": "./plugin/build/index.js"
  },
  "peerDependencies": {
    "@expo/config-plugins": ">=9.0.0"
  }
}
```
**Developers do NOT need to touch Kotlin or Swift.**
In an Expo project, the setup is 100% declarative via `app.json`:
```json
{
  "expo": {
    "plugins": [
      "@react-native-runtimes/core"
    ]
  }
}
```
During `expo prebuild`, the config plugin automatically:
1. Validates that `newArchEnabled` is `true`.
2. Asserts that `jsEngine` is set to `hermes`.
3. Injects the necessary native hooks into `MainApplication.kt` and `AppDelegate.mm` deterministically.

---

## 5. Silicon & Physical Memory Reality (The Hidden Costs)

While running work on a separate thread sounds appealing, multi-Hermes execution introduces steep hardware trade-offs:

1. **Memory Inflation on Low-End Hardware**:
   - Each Hermes VM instance allocates **4MB to 12MB of baseline native RAM** for runtime structures, garbage collector heaps, and bytecode lookup tables.
   - On budget Android devices (2GB–3GB RAM), having 2–3 active Hermes runtimes dramatically increases the risk of OS Low Memory Killer (`LMK`) termination.
2. **Context & Heap Isolation**:
   - React Context, Zustand stores, and TanStack Query caches **cannot be shared by reference** across runtimes.
   - Any state shared across runtimes must be explicitly managed via Nitro shared state atoms. Passing functions, React elements, or complex closures across runtimes throws runtime exceptions.
3. **Hermes Garbage Collector Multi-Thread Pauses**:
   - Multiple runtimes mean multiple independent garbage collectors running asynchronously, increasing CPU contention on entry-level multi-core chipsets (e.g. MediaTek Helio G-series).

---

## 6. Toolchain & C++ Conflicts in Gurudevi (`[STL_COLLISION]`)

Running `rn-terrain doctor:all apps/gurudevi-mobile` revealed an active toolchain friction:
```
[STL_COLLISION] Nitro C++20 prefab vs Expo Modules Core dual STL runtime
```
* `react-native-runtimes` depends on `nitrogen ^0.35.7` and `react-native-nitro-modules`.
* Introducing experimental multi-threaded C++ JSI runtimes into an environment already managing Nitro modules and Expo SDK 58 modules carries high risk of native `SIGABRT` memory corruption.
* Debugging is severely impaired: Chrome DevTools and Hermes inspector struggle to attach to multiple simultaneous Hermes debug sockets over ADB.

---

## 7. Verdict & Gurudevi Application Roadmap

### Production Readiness Rating: 🔴 DO NOT USE IN PRODUCTION (YET)
* **Status**: Alpha release (`0.1.0-alpha.2`), pre-1.0 API stability.
* **Maintainer Attention**: High architectural pedigree (Margelo/Callstack), but active API churn expected.

### Is It Needed for Gurudevi Classroom Screens? **NO.**
Our empirical audit of [`AttendanceScreen.tsx`](file:///c:/x/packages/classroom/src/screens/AttendanceScreen.tsx) and [`gradeClassRegister.ts`](file:///c:/x/packages/classroom/src/logic/gradeClassRegister.ts) proved:
* Frame drops and load latency are caused by **10 unmemoized `useState` hooks**, **15-second HTTP timeout loops**, and **lack of local MMKV caching**.
* Spinning up a secondary Hermes runtime to run an unmemoized component does not fix the component; it just doubles the memory footprint while keeping the same logic flaws.

### When Is It Justified Post-Pilot?
Multi-runtime architecture is justified only for genuine off-thread compute:
1. **Background Cryptographic Synchronization**: Encrypting and batch-signing 5,000 student attendance records before sync.
2. **Local AI / Vector Inference**: Running on-device semantic search or embeddings without dropping UI animation frames.
3. **Heavy Canvas/Skia Render Buffers**: Offscreen procedural graph rendering for Research Atlas.

---

## 8. Related Playbooks & Ledgers
* Master Matrix: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)
* Architecture Spec: [`../governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)
* Layer 1 Intrinsic Fixes: [`../intrinsic-code-efficiency-playbook.md`](file:///c:/x/docs/engineering/runtime-performance/intrinsic-code-efficiency-playbook.md)
