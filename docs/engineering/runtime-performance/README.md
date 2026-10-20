---
title: "Runtime Performance Architecture & Adaptive Governor Doctrine"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, engineering, governor, nitro, ubrn, expo-observe, OTLP]
---

# Runtime Performance Architecture & Adaptive Governor Doctrine

> **Domain Suite**: `docs/engineering/runtime-performance/`  
> **Registry & Inventory**: See **[`INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)** for all specifications, audit reports, and implementation plans.  
> **Target Applications**: `apps/gurudevi-mobile`, `@repo/core`, `@repo/ui`

---

## 1. Domain Overview & Mission

Runtime performance in the Polymath Platform is governed by an empirical doctrine: **make waste elimination an intrinsic code discipline, while dynamically adapting optional workloads to physical device conditions.**

This suite serves as the engineering source-of-truth for:
1. **Telemetry Ownership**: Owning the measurement schemas and performance policies while leveraging pluggable OTLP transports (Expo Observe $\rightarrow$ self-hosted OpenTelemetry Collector).
2. **Unified Governance**: Consolidating isolated state reducers, environmental context, and telemetry markers into a single typed facade: **`@repo/core/governor`**.
3. **Hardware-Grounded Scaling**: Balancing resource budgets across CPU, GPU, RAM, battery, and cellular data.

---

## 2. Core Architectural Philosophy: The Dual Efficiency Principle

```
               ┌────────────────────────────────────────────────────────┐
               │              THE DUAL EFFICIENCY PRINCIPLE             │
               └───────────────────────────┬────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌────────────────────────┐                     ┌────────────────────────┐
       │   INTRINSIC EFFICIENCY │                     │  ADAPTIVE EFFICIENCY   │
       │     (Optimize Waste)   │                     │  (Govern Legitimate)   │
       ├────────────────────────┤                     ├────────────────────────┤
       │ • Zero redundant state │                     │ • Throttle background  │
       │ • Local-first queries  │                     │ • Scale visual budget  │
       │ • Memoized render trees│                     │ • Concurrency ceilings │
       │ • Lean object lifetimes│                     │ • Defer idle warmups   │
       └────────────────────────┘                     └────────────────────────┘
```

### The Invariant Order of Operations:
1. **Optimize Waste First (Intrinsic)**: An adaptive controller cannot magically compensate for an un-memoized component running 10 `useState` hooks, unindexed SQL queries, or a 15-second network retry loop. Intrinsic waste must be removed at the algorithm, state-management, and query layers.  
   👉 *See the actionable guide: **[`intrinsic-code-efficiency-playbook.md`](file:///c:/x/docs/engineering/runtime-performance/intrinsic-code-efficiency-playbook.md)**.*
2. **Govern Legitimate Workload Second (Adaptive)**: Once waste is minimized, the governor dynamically throttles optional, non-critical workloads (mesh gradients, particles, background sync, prefetching) in response to physical device constraints (low RAM, thermal throttling, low battery).  
   👉 *See the master dependencies matrix: **[`ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)**.*

---

## 3. The Native Tooling Matrix: Rust (`ubrn`) vs. C++ (`Nitro`)

| Subsystem Requirement | Best Engine | Technical Rationale |
| :--- | :--- | :--- |
| **High-Frequency Hardware Sensing** (Thermal, RAM, Frame Drops) | **C++ / Nitro Modules** (`react-native-nitro-modules`) | Sub-microsecond synchronous JSI execution (~7 µs per call). Direct native Swift/Kotlin access to Android ART & Apple APIs without JNI overhead. |
| **Reanimated Worklet Dynamic Downgrade** | **C++ / Nitro Modules** | Nitro Hybrid Objects can be held and executed directly on UI / Worklet threads. |
| **Heavy Domain Engines & Cryptography** | **Rust via `ubrn`** (`uniffi-bindgen-react-native`) | Memory safety, zero GC pauses, fearless multi-threading, and 100% shared code across iOS, Android, WASM, and Node.js. |
| **Durable Telemetry & OTLP Background Flushing** | **Expo Module / Expo Observe** | Native integration with Android `WorkManager` & iOS `URLSession` to flush telemetry even on app termination. |

> [!CAUTION]
> **Native ABI Invariant**: As verified by `rn-terrain doctor:all`, running Nitro Modules (C++20 prefab) alongside Expo Modules Core packages dual C++ STL runtimes. Native modifications must adhere to Tier 1 Sacred Pins (`AGENTS.md`) and must never be applied ad-hoc before release milestones.

---

## 4. The 3 Tri-Loop Feedback Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│               THE CONSOLIDATED QUALITY GATE PIPELINE                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│         REACT-DOCTOR          │         │          RN-TERRAIN           │
│   (Component & State AST)     │         │   (Native & Seam AST Engine)  │
├───────────────────────────────┤         ├───────────────────────────────┤
│ • Catches 10x useState traps  │         │ • check:doctor (Fabric/Config)│
│ • Flags un-memoized lists     │         │ • check:hermes (Bytecode)     │
│ • Detects useEffect waterfalls│         │ • check:yoga (Layout loops)   │
│ • Health score (0–100)        │         │ • audit:seams (Worklet/JSI)   │
└───────────────────────────────┘         └───────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             SOVEREIGN PLATFORM GOVERNOR (@repo/core/governor)          │
│ • Enforces admission policy during runtime                             │
│ • Emits OTLP telemetry to Expo Observe / Owned Collector               │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Development Loop**: AI agent / engineer proposes code $\rightarrow$ `react-doctor` and `rn-terrain` verify AST contracts $\rightarrow$ regressions are rejected before merge.
2. **Runtime Loop**: Installed app senses local device pressure $\rightarrow$ adjusts permitted optional work deterministically $\rightarrow$ continues functioning without network connectivity.
3. **Research Loop**: Aggregated cross-device results in an owned telemetry store guide future engineering iterations.

---

## 5. Two-Track Delivery Roadmap

### Track 1: Pilot-Critical Hardening (Target: Monday Oct 26 Evaluation)
* **Status**: Immediate P0 Priority.
* **Scope**: Pure TypeScript consolidation into `@repo/core/governor` using existing abstractions (`workAdmission`, `visualBudget`, `RealityProvider`, `Observe`). Zero native compilation risk.
* **Deliverables**:
  1. Add `<ObserveInteractiveMarker />` or `useObserve().markInteractive()` to [`AttendanceScreen.tsx`](file:///c:/x/packages/classroom/src/screens/AttendanceScreen.tsx) and [`TeacherClassroomDashboard.tsx`](file:///c:/x/packages/classroom/src/screens/TeacherClassroomDashboard.tsx).
  2. Implement in-memory defensive caching on [`loadGradeClassRegister`](file:///c:/x/packages/classroom/src/logic/gradeClassRegister.ts#L78) to eliminate the 15-second HTTP timeout hazard during school roll-call.
  3. Ensure `OptionalStartupServices` suspends background synchronization during active teacher workflows.

### Track 2: Sovereign Performance Engine (Target: Post-Pilot Horizon)
* **Status**: Strategic Post-Evaluation Architecture.
* **Scope**: Native JSI integration, custom telemetry backend, automated CI gates.
* **Deliverables**:
  1. Build `NitroPerformanceGovernor` for instant C++ hardware sensing (native heap, thermal throttling, frame-drop sentinels).
  2. Stand up an OpenTelemetry Collector cluster alongside `apps/sanctuary-api`.
  3. Set `extra.eas.observe.endpointUrl` in [`app.json`](file:///c:/x/apps/gurudevi-mobile/app.json) for 100% owned, long-term telemetry retention.
  4. Integrate release-mode TTI and nursery GC allocation assertions into CI via `react-doctor` and `rn-terrain`.
