---
title: "Performance Intelligence & Efficiency Audit: Intent vs. Symbolic Manifestation vs. Substrate Reality"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, expo-observe, nitro, efficiency, audit]
---

# Performance Intelligence & Efficiency Audit: Intent vs. Symbolic Manifestation vs. Substrate Reality

> **Location**: Part of the canonical [Runtime Performance Architecture](file:///c:/x/docs/architecture/runtime-performance/README.md) suite.  
> **Executive Summary**: This document conducts an exhaustive architectural reconciliation of Gurudevi's performance engineering. It evaluates the gap between what was conceived (**Intent**), what is written down in types and specifications (**Symbolic Manifestation**), and what actually executes on physical silicon (**Substrate Reality**).

---

## 1. The Tri-Layer Systems Audit

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: THE INTENT                             │
│ • Gurudevi owns performance intelligence & measurement schemas         │
│ • Telemetry pipe is interchangeable (OTLP export to owned collector)   │
│ • Dual Efficiency: Intrinsic (waste removal) before Adaptive (budget)  │
│ • Zero-regression performance gates in CI rejecting bloated PRs        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LAYER 2: SYMBOLIC MANIFESTATION (DOCS/TYPES)             │
│ • EXPO_OBSERVE_RUNBOOK.md, BEAST_MASTER_PLAN.md                        │
│ • packages/self/src/types/expo-observe.d.ts, apps/.../expo-observe.d.ts│
│ • packages/core/src/efficiency/{policy, workAdmission, visualBudget}   │
│ • packages/ui/src/context/RealityProvider.tsx (RealityState)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LAYER 3: SUBSTRATE REALITY (PHYSICAL SILICON)            │
│ • Observe wired in _layout.tsx, but app.json lacks endpointUrl (EAS)   │
│ • observeEfficiencyDecision routes to PostHog, not Observe             │
│ • TTI markers present in only 2 routes (welcome & self); missing in CRM │
│ • isPowerSyncEnabled is false; Attendance falls back to 15s HTTP loops │
│ • Empirical device audit: 1.53 GB PSS, 265% CPU, 86.6% mqt_v_js load   │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Subsystem Breakdown

| Subsystem | 1. Intent (Aspiration) | 2. Symbolic Manifestation (Types/Docs) | 3. Substrate Reality (Installed Code & Silicon) | Gap & Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Telemetry Ownership** | Gurudevi owns the performance intelligence, measurement schema, and experiment definitions. Expo Observe is an interchangeable OTLP transport. | Documented in `EXPO_OBSERVE_RUNBOOK.md`. Swift/Kotlin sources in `node_modules/expo-observe` check `extra.eas.observe.endpointUrl`. | `app.json` has **no** `endpointUrl` specified; metrics are hardcoded to EAS Observe. Policy decisions route to PostHog via `trackProductEvent`. | **Moderate (Lock-in / Split Brain)**: Telemetry is bifurcated across two external SaaS silos with no unified local store. |
| **Route & TTI Observability** | Every screen transition (Attendance, Gradebook, Classroom, Self) records cold/warm TTR and TTI against release budgets. | Runbook specifies: *"Call `markInteractive()` on every entry screen."* | `<ObserveInteractiveMarker />` is mounted in exactly **two** routes (`welcome.tsx`, `(tabs)/self/index.tsx`). **Zero** classroom/attendance screens instrument TTI. | **High (Pilot Blindness)**: The exact screens teachers will use on Monday have zero telemetry visibility. |
| **Adaptive Governor (Work Admission)** | Dynamic runtime governor throttles optional sync, background tasks, and prefetch under battery, memory, or thermal stress. | `packages/core/src/efficiency/workAdmission.ts` (state reducer), `visualBudget.ts`, and `RealityProvider.tsx`. | `OptionalStartupServices.tsx` successfully delays background sync and Google Sign-In via `resolveWorkAdmission` + `requestIdleCallback`. | **Working Core / Narrow Reach**: Startup warmups are governed, but screen-level optional tasks are unmonitored. |
| **Visual Budgets (Graphics Downgrade)** | Low-tier devices, battery saver, and low memory automatically strip blur, reduce canvas resolution, and disable particle effects. | `RuntimeVisualSignals` $\rightarrow$ `RuntimeVisualBudget` (`essential`, `balanced`, `rich`) in `visualBudget.ts`. | Only `WorkspaceWallpaper.tsx` and `MapScreen.tsx` inspect `useReality()`. All other screens render heavy NativeWind trees unconditionally. | **Unenforced**: High-end visual effects continue to execute on low-end hardware. |
| **Intrinsic Efficiency (Data Access)** | Fast local-first reactive queries via PowerSync + Drizzle SQLCipher; zero network wait on core classroom screens. | Architecture specs emphasize offline-first SQLite/PowerSync. | `isPowerSyncEnabled` in `featureFlags.ts:30` defaults to **`false`**. `AttendanceScreen.tsx` runs **10 `useState` hooks** and falls back to HTTP `orpcClient` with a 15s timeout. | **Critical (Freeze Hazard)**: Attendance screen will stall behind network spinners if classroom connectivity fluctuates. |
| **Automated CI Regression Gates** | Automated benchmarks and memory profiling in CI reject performance regressions before PR merge. | Monorepo SOPs and AGENTS.md Graduated Evidence Mandate. | `check:anti-slop`, `check:native-slop`, and `hermes-bench.mjs` test static rules and heap allocs for 2 components. No automated TTI regression tests. | **Contract Guarded, Runtime Unguarded**: Static syntax is validated, but runtime frame drops bypass CI. |

---

## 2. Deep Dive: Physical Substrate Findings

### A. The Expo Observe Native Wiring
Inspecting the installed Swift and Kotlin source code inside `node_modules/expo-observe`:
* **Swift**: `ObserveModule.swift` lines 35 & 108:
  ```swift
  let baseUrl = getManifestProperty("extra.eas.observe.endpointUrl", manifest) as? String
  ObservabilityManager.setEndpointUrl(baseUrl, projectId: projectId)
  // Maps to:
  // url.appendingPathComponent("\(projectId)/v1/metrics")
  // url.appendingPathComponent("\(projectId)/v1/logs")
  // url.appendingPathComponent("\(projectId)/v1/traces")
  ```
* **Kotlin**: `EventDispatcher.kt` lines 26–30:
  ```kotlin
  private fun metricsEndpointUrl(): String = "$baseProjectUrl/v1/metrics"
  private fun logsEndpointUrl(): String = "$baseProjectUrl/v1/logs"
  private fun tracesEndpointUrl(): String = "$baseProjectUrl/v1/traces"
  ```
* **Reality in `app.json`**:
  `apps/gurudevi-mobile/app.json` contains no `extra.eas.observe.endpointUrl`. All metrics flow directly to Expo-hosted infrastructure with default 90-day retention.

### B. Empirical Hardware Stress Evidence
From the device inspection on actual Android test hardware recorded in `reports/mobile-ux-audit/README.md`:
* **Heap & Memory**: `dumpsys meminfo` measured **1.53 GB PSS**, with **1.06 GB in native heap**.
* **CPU Saturation**: `top -H` showed **187% – 265% process CPU**.
* **Thread Contention**: The JavaScript thread (`mqt_v_js`) consumed **86.6% CPU**, the main/UI thread consumed **86.6% CPU**, and `RenderThread` consumed **63.3% CPU**.
* **Diagnosis**: The device was frozen not from external network calls, but from cascading JavaScript state re-evaluations and ungoverned startup synchronization loops.

---

## 3. Architectural Consolidation: Nitro Modules vs. Expo Modules API v2

### Architectural Evaluation

```
┌────────────────────────────────────────────────────────────────────────┐
│               CONSOLIDATED ARCHITECTURAL COMPARISON                    │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│ Attribute                │ Nitro Modules (JSI)  │ Expo Modules API v2  │
├──────────────────────────┼──────────────────────┼──────────────────────┤
│ Native Dispatch Overhead │ ~7 µs (100k calls:   │ ~70–120 ms (macro-   │
│                          │ 7ms total)           │ compiled reflection) │
│ Memory / Allocation      │ Zero allocations     │ Low allocations      │
│ Thread Context           │ Synchronous Hermes   │ Main thread / async  │
│                          │ & UI Worklet access  │ thread pool          │
│ Language Substrate       │ C++ / Nitrogen /     │ Swift / Kotlin       │
│                          │ Swift / Kotlin       │ (macros)             │
│ Ease of Integration      │ Complex (CMake, ABI  │ Native autolinking,  │
│                          │ pinning, Tier 1 pin) │ zero C++ boilerplate │
│ Ideal Role in Governor   │ High-frequency sense │ OS lifecycle & OTLP  │
│                          │ (heap, thermal, JSI) │ background dispatch  │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

### The Recommended Hybrid Governor Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   UNIFIED PERFORMANCE GOVERNOR                         │
│                    (@repo/core/governor facade)                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌─────────────────────────────────────┐  ┌───────────────────────────────┐
│       HIGH-FREQUENCY GOVERNOR       │  │      TELEMETRY & OTLP SINK    │
│       (Nitro Module / JSI)          │  │     (Expo Module / Observe)   │
├─────────────────────────────────────┤  ├───────────────────────────────┤
│ • Synchronous frame drop detection  │  │ • Cold/Warm launch markers    │
│ • Microsecond memory/heap snapshot  │  │ • Route TTI instrumentation   │
│ • Worklet-thread visual downgrade   │  │ • Background OTLP dispatch    │
│ • Deterministic work admission lock │  │ • Custom endpoint routing     │
└─────────────────────────────────────┘  └───────────────────────────────┘
```

#### Why Nitro for Sensing & Work Admission:
1. **Zero Observer Effect**: Calling `NitroGovernor.getSnapshot()` inside a React render hook or Reanimated worklet takes **nanoseconds**. It does not allocate JavaScript objects across the bridge or cause garbage collection stutter.
2. **Synchronous UI Downgrade**: If the device drops 3 consecutive frames, a Nitro Hybrid Object can synchronously signal the Reanimated worklet to downgrade animations to `essential` without waiting for an asynchronous React state cycle.

#### Why Expo Module / Expo Observe for Telemetry:
1. **Background Durability**: Expo Observe integrates directly with Android's `WorkManager` and iOS's `BGTaskScheduler` to flush telemetry even if the app process terminates.
2. **OTLP Standard**: It speaks standard OpenTelemetry JSON over HTTP, allowing transparent redirection to an owned collector via `extra.eas.observe.endpointUrl`.

---

## 4. Phase 1 (Before Monday) vs. Phase 2 (Post-Monday) Implementation Strategy

### Critical Invariant for Monday (October 26 Teacher Evaluation):
> **DO NOT introduce a new native C++ build or compilation step 5 days before the pilot.** Introducing Nitrogen code generation or native Android CMake changes right now creates unnecessary risk of `SIGABRT` crashes or binary incompatibility.

### Phased Delivery Roadmap

```
PHASE 1: IMMEDIATE PILOT HARDENING (Before Oct 26)
  [1] Consolidate existing TypeScript governor into @repo/core/governor
  [2] Instrument AttendanceScreen and TeacherClassroomDashboard with markInteractive()
  [3] Add defensive in-memory cache to loadGradeClassRegister (kill 15s HTTP stall)
  [4] Ensure OptionalStartupServices halts background sync during teacher interactions

PHASE 2: SOVEREIGN PERFORMANCE ENGINE (Post-Pilot)
  [1] Implement NitroPerformanceGovernor (C++ JSI sensing for heap, thermal, frame-rate)
  [2] Deploy OpenTelemetry Collector alongside apps/sanctuary-api
  [3] Configure extra.eas.observe.endpointUrl in app.json for long-term telemetry ownership
  [4] Wire automated release-build TTI regression gates in CI
```
