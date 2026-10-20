---
title: "Tool Dossier: react-native-worklets (Software Mansion)"
status: "active"
classification: "tier-1-sacred-pin"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [worklets, reanimated, multithreading, ui-thread, sacred-pin, software-mansion, hermes]
---

# Tool Dossier: `react-native-worklets`

> **Canonical Substrate Reference**: `react-native-worklets@0.13.0`  
> **Ecosystem Hub**: [docs.swmansion.com/react-native-worklets](https://docs.swmansion.com/react-native-worklets)  
> **Source Repository**: `github.com/software-mansion/react-native-reanimated` (`packages/react-native-worklets`)  
> **Parent Matrix**: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)  
> **Sibling Dossier**: [`react-native-runtimes.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-runtimes.md)

---

## 1. Metadata & Vital Statistics

| Dimension | Specification | Grounded Substrate Reality |
| :--- | :--- | :--- |
| **Package Identifier** | `react-native-worklets` | Standalone multithreading substrate extracted from Reanimated |
| **Installed Version** | **`0.13.0`** (Strict Tier 1 Sacred Pin) | Pinned in `apps/gurudevi-mobile/package.json` |
| **Primary Authors / Maintainers** | Software Mansion (Tomasz Zawadzki, Krzysztof Magiera et al.) | Core architects of Reanimated, RNGH, and Screens |
| **Genesis & Evolution** | Extracted from Reanimated core in late 2024 / early 2025 for Reanimated v4 | Unbundled so any library (Skia, VisionCamera) can use worklets without animation baggage |
| **License** | **MIT** | Unrestricted open source |
| **Production Readiness Tier** | **Tier 1 (Critical Native Architecture / Sacred Pin)** | Battle-tested in millions of production apps globally |
| **Native Architecture Prereqs**| RN 0.76+, React 19, New Architecture (Bridgeless / Fabric), Hermes engine | Deep C++ JSI / Hermes bytecode integration |
| **Paired Dependencies** | `react-native-reanimated@4.7.1`, `react-native-gesture-handler@3.3.0` | Invariant peer dependency cohort |

---

## 2. What It Does (Architectural Mechanism)

### The Worklet Paradigm: Micro-Threading via JS Closures
Unlike traditional web workers (which require separate script files and message-passing serialization), a **Worklet** is a standard JavaScript function with a `'worklet'` directive:

```tsx
function onPinchUpdate(scale: number) {
  'worklet';
  // Runs synchronously on the UI thread at 60/120fps!
  scaleValue.value = scale;
}
```

### Under the Hood: Compilation & C++ JSI Dispatch
1. **Compilation (`babel-plugin-worklets` / `worklets-oxc-plugin`)**:
   - The build tool transforms any function tagged with `'worklet'` into a serialized worklet closure (`__closure`).
   - Outer variables captured by the function are explicitly packaged as shareable references.
2. **Execution (`WorkletRuntime`)**:
   - Worklets execute inside specialized lightweight Hermes runtimes:
     - **UI Runtime (`isUIRuntime`)**: Pinned to the platform main UI thread for frame-accurate gesture recognition.
     - **Worker Runtime (`createWorkletRuntime('worker')`)**: Pinned to dedicated background threads for compute.
3. **Zero Full-Bundle Reload**:
   - Crucially, unlike `react-native-runtimes` (which re-loads the *entire* multi-megabyte app bundle), a Worklet runtime loads **only the specific bytecode closure needed**.

---

## 3. Worklets vs. Multi-Runtimes: The Division of Labor

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
│ • Zero bundle duplicate reload   │ • Separate heap, separate React root│
│ • Best for: Gestures, animations,│ • Best for: Isolating entire screens│
│   physics, raw parallel compute  │   or background sync engines        │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 4. The Reanimated 4 Dialect Invariant (`AGENTS.md` Rule 7)

A primary source of regressions when upgrading to React Native 0.88 and Reanimated 4 is **import drift**.

### The Strict Invariant Gate
In Reanimated 3, multithreading primitives were exported directly from `react-native-reanimated`. In Reanimated 4, this is **deprecated and forbidden**:

| ❌ FORBIDDEN (Triggers Step 5 Gate Veto) | ✅ REQUIRED (Grounded Substrate) |
| :--- | :--- |
| `import { runOnJS } from 'react-native-reanimated'` | `import { runOnJS } from 'react-native-worklets'` |
| `import { runOnUI } from 'react-native-reanimated'` | `import { runOnUI } from 'react-native-worklets'` |
| `import { createWorkletRuntime } from 'react-native-reanimated'` | `import { createWorkletRuntime } from 'react-native-worklets'` |
| `import { makeShareableCloneRecursive } from 'react-native-reanimated'` | `import { createShareable } from 'react-native-worklets'` |

* Enforced automatically by [`scripts/check-native-slop.mjs`](file:///c:/x/scripts/check-native-slop.mjs) (`REANIMATED_WORKLET_IMPORT_DRIFT`).

---

## 5. Memory Model: Shareables & Synchronizables

Passing data between the React Native JavaScript thread and a Worklet runtime cannot use raw JavaScript references (different heaps). `react-native-worklets` provides two core primitives:

1. **`createShareable(value)`**:
   - Freezes immutable values or wraps mutable values in a thread-safe C++ wrapper (`ShareableRef`).
   - Primitives (numbers, booleans, strings) are automatically shareable.
2. **`createSynchronizable(value)`**:
   - Bidirectional synchronized values that can be read and written across threads with atomic locking.
3. **`SharedValue` (via Reanimated)**:
   - High-level reactive wrapper built on top of worklet shareables.

---

## 6. Role in Gurudevi Architecture

### 1. The Tutii Mascot Motion Engine
Gurudevi's brand mascot (`tutii`) runs continuous micro-interactions, idle breathing, and interactive eye-tracking.
* By executing inside `runOnUI` worklets, Tutii moves at a locked 60fps/120fps **even if the main JS thread is frozen during attendance sync or database indexing**.

### 2. The Phase 2 Worklet Governor (Synchronous Frame Shedding)
When the OS reports thermal throttling (`ADPF` / `ThermalState`), the Performance Governor signals worklets directly:
```tsx
// Inside UI Worklet (Zero JS bridge latency)
if (governorThermalTier.value === 'critical') {
  activeParticles.value = 0;       // Instantly disable particle emitters
  enableBlurShader.value = false;  // Fallback to solid color
}
```

---

## 7. Related Playbooks & Ledgers
* Sibling Dossier: [`react-native-runtimes.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-runtimes.md)
* Master Matrix: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)
* Architecture Spec: [`../governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)
* UI Thread Guide: [`../../ui-thread-discipline.md`](file:///c:/x/docs/engineering/ui-thread-discipline.md)
