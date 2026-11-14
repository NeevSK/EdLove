---
title: "Intrinsic Code Efficiency Playbook: Eliminating Waste Before Regulating Workload"
status: "active"
created: 2026-10-20
updated: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [performance, intrinsic-efficiency, react-optimization, memory, lists, queries, classroom]
---

# Intrinsic Code Efficiency Playbook: Eliminating Waste Before Regulating Workload

> **Domain Suite**: [`docs/engineering/runtime-performance/`](file:///c:/x/docs/engineering/runtime-performance/README.md)  
> **Registry**: [`docs/engineering/runtime-performance/INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)  
> **The Doctrine**: *“Optimize waste first; adapt legitimate workload second.”* An adaptive controller can throttle optional background sync, but it cannot repair an un-memoized screen with 10 `useState` hooks, unindexed SQL queries, or 15-second network loops.

---

## 1. The Core Philosophy of Intrinsic Efficiency

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE DUAL EFFICIENCY INVARIANT                   │
├───────────────────────────────────┬────────────────────────────────────┤
│   LAYER 1: INTRINSIC EFFICIENCY   │   LAYER 2: ADAPTIVE EFFICIENCY     │
│       (Eliminate Waste First)     │       (Govern Workload Second)     │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Zero redundant state hooks      │ • Throttle background sync queue   │
│ • Local-first sub-ms queries      │ • Lower Skia particle counts       │
│ • Memoized render hierarchies     │ • Disable canvas blur on low RAM   │
│ • Recycled list cells (FlashList) │ • Defer image prefetch on cellular │
│ • Lean object & bitmap lifetimes  │ • Suspend non-critical idle tasks  │
└───────────────────────────────────┴────────────────────────────────────┘
```

**Why Layer 1 Must Come First**:
If Layer 1 is ignored, building an adaptive runtime merely wraps a sophisticated governor around broken, slow code. When a screen freezes, the governor might assume the phone is overheating, when in reality the JavaScript thread is drowning in cascading React re-renders or stalled on an HTTP timeout.

### 1.1 The 2026 Numeric Performance Targets ("Fast Is a Spec")

*"Feels snappy" is not an engineering specification.* Performance optimization requires hard numeric ceilings:

| Performance Dimension | Hard Numeric Ceiling | Verification Instrumentation |
| :--- | :--- | :--- |
| **Cold Start (TTI)** | **< 2.0s** on mid-tier Android (Pixel 6a / Helio G99); **< 1.2s** on iPhone 13 | `performance.rnStartupTiming` + `expo-observe` |
| **Sustained Scroll FPS**| **58+ FPS** on the 99th-percentile device during high-velocity list flings | Flashlight CLI / Hermes Sampling Profiler |
| **Input Response Latency** | **< 100ms** between CTA touch down and visual feedback / route transition | Chrome DevTools CDP / EventTarget timestamps |
| **Resident Memory (PSS/RSS)** | **< 180MB** for typical classroom session workflows | Android Studio Profiler / `dumpsys meminfo` |
| **Install Package Size** | **< 30MB** for the release APK / IPA bundle | APK Analyzer / EAS Build artifact reports |

---

## 2. The 6 Critical Waste Categories & Actionable Rules

### Category 1: React State Management & Render Cascades

* **The Anti-Pattern**: Screen components declaring 8–12 distinct `useState` hooks (e.g. `AttendanceScreen.tsx` declaring 10 state setters). Every state update triggers a cascading re-render of the entire view hierarchy.
* **The Rule**:
  1. **Consolidate Related State into a Reducer**: Replace multiple `useState` calls with a typed `useReducer` or a lightweight store. State transitions happen in atomic dispatches.
  2. **Isolate High-Frequency Leaf State**: Keep rapidly changing inputs (e.g. search bars, timers, active scanner frames) in isolated leaf components so the parent screen does not re-render.
  3. **Stabilize Callback References**: Wrap callbacks passed to child components or list items in `useCallback`. Never pass inline arrow functions (`onPress={() => ...}`) to items in large lists.
  4. **React 19 Props Over ForwardRef**: Pass `ref` directly as a prop; do not wrap components in `React.forwardRef`.

### Category 2: Data Access & Local-First Querying

* **The Anti-Pattern**: Core classroom operations (e.g. taking attendance or viewing rosters) making direct HTTP network requests over `orpcClient` with 15-second timeout loops while `isPowerSyncEnabled` is disabled (`false`).
* **The Rule**:
  1. **Local-First Zero-Latency Reads**: All classroom workflows must read directly from local SQLite / PowerSync tables. A screen must render instantly even in airplane mode.
  2. **Defensive In-Memory / MMKV Fallback**: If an operation must hit a server endpoint, wrap it with an immediate local cache fallback (via MMKV or in-memory snapshot) so that network drops on school Wi-Fi never leave teachers staring at a 15-second spinner.
  3. **Selective Column Projection**: Never execute `SELECT *` across thousands of records. Query only the columns required for the active view (e.g. `id`, `student_name`, `status`).
  4. **Deduplicate Queries via TanStack Query**: Never allow two components to independently trigger the same network/database fetch during screen mounting.

### Category 3: Virtualized List Performance

* **The Anti-Pattern**: Using standard `ScrollView` for student rosters, or using `FlatList` with unstable index keys (`key={index}`) which defeats cell recycling and forces full DOM-node remounting on scroll.
* **The Rule**:
  1. **Dataset Sizing Matrix**:
     * `< 100 items`: Standard `FlatList` with `getItemLayout` is acceptable.
     * `100–500+ items`: **`@shopify/flash-list` v2** is mandatory. FlashList v2 synchronously measures items for New Architecture (Fabric) without requiring `estimatedItemSize`.
     * `Fast-scroll chat / real-time feeds`: Use `legend-list` if blank-cell flashing occurs during aggressive scrolling.
  2. **Stable Key Extractors**: `keyExtractor={(item) => item.id}` must always return a stable, unique domain identifier.
  3. **Leaf Cell Memoization**: Wrap list row components in `React.memo` with a custom comparison function if props contain non-primitive objects.

### Category 4: Startup & Initialization Sequences

* **The Anti-Pattern**: Mounting all background services, Google Sign-In, sync managers, and analytics during the cold boot phase, saturating the JavaScript thread (`mqt_v_js` at 86.6% CPU) and delaying Time-to-Interactive (TTI).
* **The Rule**:
  1. **Two-Stage Startup Architecture**:
     * *Stage 0 (Critical Path)*: Auth verification, theme tokens, and primary screen layout only.
     * *Stage 1 (Deferred Warmups)*: Defer background sync, prefetching, and secondary modules using `requestIdleCallback` + `requestAnimationFrame` (as proven in [`OptionalStartupServices.tsx`](file:///c:/x/apps/gurudevi-mobile/src/boot/OptionalStartupServices.tsx)).
  2. **Never Run Sync During Active Workflows**: If a teacher opens a roll-call or starts a scanner session, immediately suspend background knowledge synchronization.

### Category 5: Memory Management & Object Lifetimes

* **The Anti-Pattern**: Retaining decoded bitmap images in memory after navigating away; forgetting to unsubscribe event listeners; accumulating unbounded caches.
* **The Rule**:
  1. **Bounded Cache Eviction Floors**: Media and document caches must enforce strict byte caps and an LRU (least-recently-used) eviction policy.
  2. **Release Decoded Media on Blur**: Clean up large Skia canvas objects, camera frames, and high-resolution student photos when a screen unmounts or moves out of focus.
  3. **Mandatory Listener Cleanup**: Every `useEffect` that attaches a listener (`AppState`, `NetInfo`, sensors, hardware keys) must return an explicit cleanup function.
  4. **Google Play 2027 Compliance**: Keep Anonymous RSS + Swap strictly under **2.0 GB** on 4 GB Android devices.

### Category 6: Thread Discipline & UI Worklet Offloading

* **The Anti-Pattern**: Running heavy array transformations, JSON parsing, or gesture math on the JavaScript event loop, causing frame drops below 60fps.
* **The Rule**:
  1. **16ms JS Budget**: Any single JavaScript execution block must finish within **16ms** (60fps) or **8ms** (120fps).
  2. **Native Gesture Handling**: Always use `Gesture.Pan()` with `<GestureDetector>` from `react-native-gesture-handler` v3.3. Never use legacy `<PanGestureHandler>`.
  3. **Worklet-Thread Animations**: Import worklets from `react-native-worklets`. Animations, pan transforms, and canvas updates must run on the UI thread without crossing the Hermes bridge.
  4. **Secondary Runtime Offloading**: For heavy background computations (large data exports or local search indexing), offload work to a secondary Hermes runtime (`react-native-runtimes`) or safe Rust (`ubrn`).

---

## 3. Pilot-Critical Checklist for Monday (October 26 Teacher Evaluation)

Before demonstrating Gurudevi to teachers, verify these immediate items on the core classroom surfaces:

- [ ] **Classroom Screen Instrumentation**: Mount `<ObserveInteractiveMarker />` or `useObserve().markInteractive()` on [`AttendanceScreen.tsx`](file:///c:/x/packages/classroom/src/screens/AttendanceScreen.tsx) and [`TeacherClassroomDashboard.tsx`](file:///c:/x/packages/classroom/src/screens/TeacherClassroomDashboard.tsx).
- [ ] **Attendance Defensive Cache**: Wrap [`loadGradeClassRegister`](file:///c:/x/packages/classroom/src/logic/gradeClassRegister.ts#L78) with an in-memory/MMKV cache to eliminate the 15-second network hang if school Wi-Fi is spotty.
- [ ] **State Consolidation**: Refactor the 10 `useState` hooks in `AttendanceScreen.tsx` into a clean state reducer to prevent re-render thrashing.
- [ ] **Sync Concurrency Suppression**: Ensure `OptionalStartupServices` verifies that background sync is paused while any attendance or gradebook screen is mounted.
- [ ] **Static Diagnostic Check**: Run `npx react-doctor@latest` and `node scripts/run-rn-terrain.mjs doctor:all` to ensure zero syntax or native configuration regressions.

---

## 4. Companion Documents & Exploration Ledgers
* Modern Substrate Delta: [`2026-10-20-exploration-ledger-expo-code-optimization-and-modern-delta.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-expo-code-optimization-and-modern-delta.md)
* Worklets Tool Dossier: [`tools/react-native-worklets.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-worklets.md)
* Runtimes Tool Dossier: [`tools/react-native-runtimes.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-runtimes.md)
* Ecosystem Master Matrix: [`ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)
