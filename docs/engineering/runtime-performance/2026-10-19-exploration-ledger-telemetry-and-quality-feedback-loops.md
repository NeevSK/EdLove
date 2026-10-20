---
title: "Exploration Ledger: Telemetry Ownership, Dual Efficiency & Automated Quality Feedback Loops"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, telemetry, feedback-loops, react-doctor, rn-terrain, quality-gates]
---

# Exploration Ledger: Telemetry Ownership, Dual Efficiency & Automated Quality Feedback Loops

> **Status**: Raw Uncompressed Exploration Ledger (Stage 1 Ground Truth)  
> **Suite**: [`docs/engineering/runtime-performance/`](file:///c:/x/docs/engineering/runtime-performance/README.md)  
> **Objective**: Exhaustively record the architectural thesis and investigate how `react-doctor` and `rn-terrain` fit into the monorepo's automated engineering quality loops.

---

## 1. The Core Architectural Thesis (Raw Uncompressed Record)

### A. Ownership of Performance Intelligence
* **The Problem**: Who owns Gurudevi's performance intelligence? If Expo Observe collects the telemetry, how much control do we actually hold?
* **The Doctrine**: **Gurudevi owns the performance policy, experiment definitions, and measurement schema. Expo Observe is one interchangeable measurement provider—not the brain of the system.**
* **The Control Taxonomy**:
  * *What we control directly*: Custom event instrumentation, event attributes, application metadata, SDK sampling/dispatch settings, integration toggles, independent telemetry database (if operated), and all runtime adaptive decisions.
  * *What we do not control directly*: Expo-hosted telemetry storage and infrastructure, provider-level data retention (EAS Observe has a fixed 90-day retention window).
* **The Custom OTLP Discovery**:
  * Expo Observe transmits via OpenTelemetry Protocol (OTLP/HTTP) with JSON payloads.
  * Native build configuration supports redirecting telemetry via an embedded endpoint (`extra.eas.observe.endpointUrl`) to an owned **OpenTelemetry Collector** (routing to our own long-term storage, clickhouse/timescale, and custom dashboards).
  * *Trade-off*: Custom endpoints are embedded at native build time; operating an owned collector requires infrastructure maintenance; EAS attribution features are tied to EAS project builds.
  * *Monday Pilot Decision*: Maintain existing Expo Observe integration with a **portable measurement schema**; avoid rerouting native binary endpoints 5 days before the pilot.

### B. The Dual Efficiency Principle (Waste vs. Workload)
* **The Warning**: An adaptive controller can reduce optional workloads, but it **cannot magically repair** poorly designed components, excessive database queries, unnecessary rendering, or inefficient algorithms.
* **The Order of Operations**:
  ```
  [1. Intrinsic Efficiency] ───► [2. Adaptive Efficiency]
     (Optimize Waste First)         (Govern Workload Second)
  ```
  * **Intrinsic Efficiency**: Make necessary work waste-free (algorithms, SQL queries, re-renders, startup sequences, memory object lifetimes, de-duplication).
  * **Adaptive Efficiency**: Adjust how much optional work is attempted under varying device conditions (prefetching, cache limits, optional concurrency, visual effects, background sync).
  * *Failure Mode*: If this order is inverted, the team risks building an extraordinarily sophisticated controller around broken, slow application code.

### C. Automated Engineering Quality System (Evidence Over Vibe)
* **The Core Invariant**: AI agents reading code and declaring "it looks fine" is insufficient. The toolchain must enforce empirical evidence.
* **The 7-Layer Quality Matrix**:
  1. *Static Analysis*: Unsafe patterns, type errors, dialect violations (every commit).
  2. *Architecture Checks*: Dependency cycles, forbidden cross-package imports, duplicate subsystem ownership (every commit).
  3. *Unit & Integration Tests*: Behavioral regressions, state corruption, data errors (every commit).
  4. *Performance Regression Tests*: Operation latency, memory allocation volume, query frequency (pre-merge).
  5. *Release-Build Profiling*: JS thread stalls (`mqt_v_js`), native bottlenecks, layout thrashing (during performance sprints).
  6. *Device Benchmarks*: Actual performance on low-end hardware under thermal/memory stress (pre-release/pilot).
  7. *Production Telemetry*: Real-world user metrics across devices and networks (post-deployment).

### D. The Three Feedback Loops
1. **Development Loop**: AI agent proposes code $\rightarrow$ automated checks and benchmarks evaluate it $\rightarrow$ regressions are rejected before merge.
2. **Runtime Loop**: Installed app senses local device conditions $\rightarrow$ adjusts permitted optional work deterministically $\rightarrow$ continues functioning even without network connectivity.
3. **Research Loop**: Aggregated performance results across cohorts $\rightarrow$ guides the next engineering sprint (never self-modifying autonomous code deployed directly to teachers).

### E. What NOT to Rush: Deterministic, Versioned Policies
* **Anti-Pattern**: Introducing a self-optimizing AI runtime that dynamically rewrites its own policies based on incoming telemetry. This introduces non-deterministic instability, stochastic oscillation, and unreproducible failures.
* **Approved Pattern**: **Deterministic, versioned, explainable policies**. Every governor decision must answer:
  1. *Which condition was observed?*
  2. *Which rule was triggered?*
  3. *What budget changed?*
  4. *What operation was affected?*
  5. *Did the change improve performance?*

---

## 2. Temporal Grounded Investigation: `react-doctor` & `rn-terrain`

The user inquired:
> *"Can we leverage react doctor and rnterrain for this as well?"*

### A. What is `react-doctor`? (Million.js Ecosystem)
* **Tool Profile**: `react-doctor` is an automated diagnostic code-quality scanner created by the Million.js team specifically for AI coding agents and CI pipelines.
* **Capabilities**:
  * Scans React and React Native / Expo AST trees for hidden performance landmines:
    - **Effect Traps**: `useEffect` data fetching anti-patterns and un-cleaned subscriptions.
    - **Re-render Cascades**: Un-memoized object/function props passed to virtualized lists.
    - **State Proliferation**: Multi-state waterfalls that trigger synchronous layout thrashing.
  * Integrates with AI coding agents (`npx react-doctor@latest install`) to act as an automated linter gate.
* **Fit in our Monorepo**:
  * Fits squarely into **Layer 1 (Static Analysis) & Layer 4 (Performance Regression)** of our Development Feedback Loop.
  * Can be run on modified files in `packages/classroom` and `apps/gurudevi-mobile` to catch state and effect traps before code is committed.

### B. What is `rn-terrain`? (The Sovereign Monorepo Bridge)
* **Tool Profile**: `c:/projects/rn-terrain` is our existing sovereign upstream intelligence and native proof engine.
* **Capabilities in our Workspace** (via [`scripts/run-rn-terrain.mjs`](file:///c:/x/scripts/run-rn-terrain.mjs)):
  * **`check:doctor`** (`node scripts/run-rn-terrain.mjs doctor:all apps/gurudevi-mobile`): Deep native module audit across Fabric, TurboModules, and native configurations.
  * **`check:hermes`** (`node scripts/run-rn-terrain.mjs verify:hermes`): Validates Hermes bytecode compatibility and prevents syntax constructs that trigger Hermes de-optimizations.
  * **`check:yoga`** (`node scripts/run-rn-terrain.mjs verify:yoga`): Audits Flexbox layout trees and prevents layout feedback loops.
  * **`audit-seams.mjs`**: Uses `@ast-grep/napi` via `rn-terrain`'s `IntegrativeSeamsEngine` to audit cross-thread worklet execution, gesture recognizers, and window insets.
  * **TCDI (Temporal Convolutional Dependency Intelligence)**: Predicts multi-package compatibility hazards before they trigger native `SIGABRT` crashes.
* **Fit in our Monorepo**:
  * Fits squarely into **Layer 2 (Architecture Checks) & Layer 5 (Release-Build Profiling)**.
  * It already exists in our toolchain (`package.json` scripts: `pnpm run check:doctor`, `pnpm run check:hermes`, `pnpm run check:yoga`).

---

## 3. How `react-doctor` + `rn-terrain` Integrate into the Quality Suite

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

---

## 4. Immediate Practical Recommendations

1. **For Monday's Pilot (Immediate Protection)**:
   * Run `node scripts/run-rn-terrain.mjs doctor:all apps/gurudevi-mobile` to verify zero native configuration defects.
   * Run `npx react-doctor@latest` against [`packages/classroom/src/screens/AttendanceScreen.tsx`](file:///c:/x/packages/classroom/src/screens/AttendanceScreen.tsx) to identify the exact re-render triggers.
2. **For Long-Term CI (Post-Pilot)**:
   * Embed `react-doctor` and `rn-terrain verify:hermes` into `pnpm run check:anti-slop` to form an unbreakable automated pre-merge performance gate.
