---
title: "Performance Governor Technical Specification"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, specification, governor, nitro, expo-observe, JSI]
---

# Performance Governor Technical Specification

> **Package**: `@repo/core/governor` (with native bindings in `apps/gurudevi-mobile`)  
> **Status**: Approved Architectural Spec  
> **Target SDK**: Expo SDK 58 / React Native 0.88 / Nitro Modules 0.37.1

---

## 1. Architectural Mission

The **Performance Governor** is the centralized control plane for runtime performance, workload admission, and system telemetry across Gurudevi. It eliminates the fragmentation between isolated state reducers, environmental hooks, and telemetry silos by providing a single, deterministic facade.

```
+-------------------------------------------------------------------------+
|                           APPLICATION CALLERS                           |
|       (Entry screens, Reanimated worklets, Background services)         |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                 @repo/core/governor (Unified Facade)                    |
|                                                                         |
|  .sense()                 -> Synchronous hardware snapshot              |
|  .admit(workDescriptor)   -> Deterministic work admission decision      |
|  .visualBudget()          -> 'essential' | 'balanced' | 'rich'          |
|  .markInteractive(route)  -> OTLP TTI & TTR instrumentation             |
|  .report(telemetryEvent)  -> Unified OTLP log / metric emitter          |
+-------------------+---------------------------------+-------------------+
                    |                                 |
                    v                                 v
+---------------------------------------+ +-------------------------------+
|       HIGH-FREQUENCY SENSING          | |     TELEMETRY & TRANSPORT     |
|       (Nitro Modules / JSI)           | |    (Expo Observe / OTLP)      |
|                                       | |                               |
| • Sub-microsecond native C++ calls    | | • Persistent SQLite queue     |
| • Direct Hermes & Worklet thread JSI  | | • Background WorkManager      |
| • Native heap, thermal, frame drops   | | • Configurable OTLP endpoint  |
+---------------------------------------+ +-------------------------------+
```

---

## 2. Interface Contracts

### A. Sensing Contract (`GovernorSnapshot`)

```typescript
export type DeviceThermalState = 'nominal' | 'fair' | 'serious' | 'critical';
export type DeviceMemoryTier = 'low' | 'medium' | 'high';
export type WorkAdmissionPhase = 'boot' | 'public-ready' | 'protected-ready' | 'settled';

export interface GovernorSnapshot {
  readonly timestamp: number;
  readonly deviceTier: DeviceMemoryTier;
  readonly freeMemoryBytes: number;
  readonly totalMemoryBytes: number;
  readonly thermalState: DeviceThermalState;
  readonly isBatterySaver: boolean;
  readonly isLowBattery: boolean; // < 20% & unplugged
  readonly isMeteredNetwork: boolean;
  readonly isOnline: boolean;
  readonly activePhase: WorkAdmissionPhase;
}
```

### B. Work Admission Contract (`admit`)

```typescript
export type WorkCategory =
  | 'user-critical'      // Attendance save, grade submission (never deferred)
  | 'ui-transition'     // Route navigation, screen mount
  | 'background-sync'   // PowerSync/knowledge sync (deferrable under load)
  | 'media-prefetch'    // Pre-caching images/audio
  | 'storage-cleanup'   // Vacuum, compaction (idle only)
  | 'telemetry-flush';  // Batch export

export interface WorkAdmissionResult {
  readonly allowed: boolean;
  readonly maxConcurrency: number;
  readonly reason: string;
}

export function admitWork(
  category: WorkCategory,
  snapshot: GovernorSnapshot,
): WorkAdmissionResult;
```

**Deterministic Policy Matrix**:

| Category | Boot Phase | Settled / Normal | Constrained (Low RAM / Battery Saver) | Severe (Thermal Critical / Offline) |
| :--- | :--- | :--- | :--- | :--- |
| **`user-critical`** | Allowed (Priority 0) | Allowed | Allowed | Allowed |
| **`ui-transition`** | Allowed | Allowed | Allowed (Reduced motion) | Allowed (No blur/motion) |
| **`background-sync`** | **Deferred** | Allowed (Concurrency 2) | **Deferred** | **Deferred** |
| **`media-prefetch`** | **Deferred** | Allowed (Concurrency 1) | **Deferred** | **Deferred** |
| **`storage-cleanup`** | **Deferred** | Idle frames only | **Deferred** | **Deferred** |

### C. Visual Budget Contract (`getVisualBudget`)

```typescript
export interface VisualBudget {
  readonly tier: 'essential' | 'balanced' | 'rich';
  readonly allowBlur: boolean;
  readonly allowComplexGradients: boolean;
  readonly allowParticles: boolean;
  readonly maxCanvasPixelRatio: number;
  readonly minFrameIntervalMs: number; // 16ms (60fps) -> 33ms (30fps)
}
```

---

## 3. Implementation Phasing

### Phase 1: Pure TypeScript Consolidation (Before Monday Oct 26)
* Wraps the existing pure TypeScript reducers from `packages/core/src/efficiency/` (`workAdmission.ts`, `visualBudget.ts`, `policy.ts`) into the unified facade.
* Hooks into `RealityProvider.tsx` for React context consumption.
* Binds `markInteractive` directly to `expo-observe`'s `useObserve()`.
* **Zero native dependencies modified**: Zero risk of native crash.

### Phase 2: Native Nitro Engine & OTLP Collector (Post-Pilot)
* Generate `NitroPerformanceGovernor` Hybrid Object via Nitrogen:
  - Synchronous JSI hooks for `android.os.Debug.getPss()` and Apple `task_info`.
  - Native thermal state listeners (`PowerManager.addThermalStatusListener`).
  - Frame-rate cadence sentinel hooked directly into Android `Choreographer` and iOS `CADisplayLink`.
* Point `app.json` `extra.eas.observe.endpointUrl` to an in-house OpenTelemetry Collector proxy running alongside `apps/sanctuary-api`.
