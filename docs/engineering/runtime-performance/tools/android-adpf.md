---
title: "Tool Dossier: Android Dynamic Performance Framework (ADPF)"
status: "active"
classification: "platform-native-api"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [android, adpf, thermal-headroom, performance-hint, cpu-clocks, hermes, power-management]
---

# Tool Dossier: Android Dynamic Performance Framework (ADPF)

> **Canonical Platform Reference**: Android 12+ (API 31+), Android 13/14 (API 33/34), Android 15/16 (API 35+)  
> **Source Hub**: [developer.android.com/games/optimize/adpf](https://developer.android.com/games/optimize/adpf)  
> **Parent Matrix**: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)  
> **Architectural Spec**: [`../governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)  
> **Related Exploration Ledger**: [`../2026-10-19-exploration-ledger-composition-over-monolithic-adaptive-runtime.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-19-exploration-ledger-composition-over-monolithic-adaptive-runtime.md)

---

## 1. Metadata & Vital Statistics

| Dimension | Specification | Grounded Substrate Reality |
| :--- | :--- | :--- |
| **API Identifier** | Android Dynamic Performance Framework (`android.os.PerformanceHintManager`, `android.os.PowerManager`) | Direct Android OS C++ / Java kernel-to-framework pipeline |
| **Minimum OS Baseline** | **Android 12 (API level 31)** | Thermal Headroom introduced in API 30/31; Performance Hints in API 31 |
| **Modern Additions** | Android 14/15/16 (API 34–36) | Target frame-time work duration hints, ADPF Game Mode integration, Performance Class 14+ |
| **Primary Maintainer** | Google Android Performance & GPU Systems Team | Upstream Android Open Source Project (AOSP) |
| **License** | Apache 2.0 (AOSP) | Open source OS standard |
| **Native Prerequisites** | C++ NDK headers (`<android/thermal.h>`, `<android/performance_hint.h>`) or Kotlin wrappers | Direct NDK or JNI integration |
| **Role in Gurudevi Governor** | **Primary Hardware Sensor (Android)** | Supplies predictive thermal headroom and workload sizing to `@repo/core/governor` |

---

## 2. What It Does (Architectural Mechanism)

ADPF is Google's low-overhead interface between the Android OS power governor (DVFS - Dynamic Voltage and Frequency Scaling) and intensive user-space rendering engines. 

Unlike legacy polling of battery temperatures or CPU clocks (which is laggy, inaccurate, and drains power), ADPF provides **two-way predictive communication**:

```
                       ┌──────────────────────────────────────────────┐
                       │           Android OS (DVFS Kernel)           │
                       └──────────────┬────────────────────────▲──────┘
                                      │                        │
       1. Predictive Thermal Headroom │                        │ 2. Actual vs Target
          (0.0 = Cold, 1.0 = Severe)  │                        │    Frame Duration Hint
                                      ▼                        │
                       ┌───────────────────────────────────────┴──────┐
                       │   Gurudevi Performance Governor (@repo/core) │
                       │    (JSI Native Hook via Nitro / Expo Module) │
                       └──────────────┬───────────────────────────────┘
                                      │
                         Adapts Visuals & Concurrency:
                         - High (Headroom < 0.70): 120fps, mascot physics, blur
                         - Balanced (0.70–0.85): 60fps, simplify physics
                         - Low (Headroom >= 0.85): 30fps, shed background sync
```

### 2.1 The Two Primary ADPF Pillars

#### Pillar A: The Thermal Headroom API (`getThermalHeadroom`)
```kotlin
// Native Kotlin / NDK Sensor Loop
val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
val forecastSeconds = 10 // Forecast 10 seconds into the future!
val headroom = powerManager.getThermalHeadroom(forecastSeconds)
```
- **Range:** Returns a float from `0.0f` to `1.0f` (and up to `2.0f` during thermal throttling).
  - `< 0.70`: Device is operating cool. Full physics, particles, and prefetching permitted.
  - `0.70 – 0.85`: Device warming up. Initiate predictive shed (limit list overscan, drop blur to acrylic).
  - `0.85 – 1.00`: Approaching severe thermal throttling. CPU/GPU will soon drop clock speeds violently.
  - `> 1.00`: Device is actively throttling. Lock UI to minimal budget, pause all background sync.
- **Why It's Revolutionary:** It is **predictive**. It tells the app what *will* happen in 10 seconds if current work continues, allowing the app to shed workload *before* the OS drops GPU clock speeds and stutters frames.

#### Pillar B: The Performance Hint API (`PerformanceHintManager`)
```kotlin
val hintManager = context.getSystemService(Context.PERFORMANCE_HINT_SERVICE) as? PerformanceHintManager
val session = hintManager?.createHintSession(threadIds, targetWorkDurationNanos)

// At end of frame / worklet:
session?.reportActualWorkDuration(actualDurationNanos)
```
- **Bidirectional Pacing:** The engine tells Android: *"I need 16.6ms per frame"*. If a frame only takes 8ms, Android scales down CPU clocks to save battery. If work spikes, Android boosts CPU clusters just in time to avoid dropped frames.

---

## 3. Grounded Integration with React Native & Hermes

In React Native 0.88 New Architecture, ADPF cannot be called from high-frequency JavaScript because JS thread hops introduce 5–15ms of jitter. 

Instead, ADPF integrates via a **zero-overhead JSI sensor hook**:
1. **Thread Registration:** The Hermes UI thread (`mqt_v_js` or Fabric C++ render thread) registers its native `pthread_t` ID with `PerformanceHintManager.Session`.
2. **Thermal Polling:** Thermal headroom is sampled on a low-frequency native cadence (every 2.5 seconds or on `OnFrameMetricsAvailableListener` breach).
3. **JSI Exposure:** The float value (`headroom: number`) is synchronously exposed to `@repo/core/governor` via a fast JSI getter (`NitroModules.getThermalHeadroom()`), costing `< 5 µs`.

---

## 4. Gurudevi Monorepo Adoption Stance

1. **Monday Oct 26 Pilot (Freeze Window):**
   - **Do NOT inject custom C++ NDK ADPF bindings.** 
   - Instead, use standard Android high-level callbacks: `PowerManager.isPowerSaveMode` and `ComponentCallbacks2.onTrimMemory(level)` via existing bridge events.
2. **Phase 2 Post-Pilot (Q4 2026):**
   - Implement `NitroThermalBridge` in `@repo/core` to read `getThermalHeadroom(10)` synchronously for seamless visual scaling on physical Android hardware.
