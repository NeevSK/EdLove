# Trübe-Art: Implementation Realignment (Post-2026 Mandate)

This document serves as the authoritative architectural record for the Trübe-Art rendering engine, following the transition from a Skia-only fallback to a high-performance **Triple-Tier Rendering Hierarchy**.

## I. The Triple-Tier Rendering Hierarchy

Trübe-Art intelligently substrates across three distinct hardware paths based on device capability:

### 1. Tier 1: "Full-Metal" (Native C++)
The highest-priority path for flagship hardware (API 31+).
- **Core Engine:** `TrubeCore.cpp` (C++) governs the "Soul" of the surfaces.
- **Bridge:** Zero-allocation Nitro HybridObject uniform mirror.
- **Time Driver:** Native **Kells Time Protocol** with sub-millisecond precision and deep entropy modulation (47s period).
- **Substrate:** Direct Vulkan (Android) or Metal (iOS) blitting via `react-native-wgpu`.

### 2. Tier 2: The "Anyhow" Bridge (WebGPU)
Standardized, cross-platform GPU path for mid-to-high-tier devices.
- **Engine:** `WebGPUDriver.ts` utilizing `typegpu`.
- **Management:** High-efficiency `GPUBuffer` writes via the standardized WebGPU Queue.
- **Parity:** Guarantees that the soul remains "living" even without custom C++ integration on specific platforms.

### 3. Tier 3: High-Fidelity Fallback (Skia)
Rock-solid reliability for the broader device spectrum.
- **Engine:** Skia Runtime Effects (SkSL).
- **Orchestration:** Leverages the same TSL (Three Shading Language) source to ensure absolute visual parity with higher tiers.

---

## II. Key Architectural Components

### [Native Substrate Bridge]
The `NativeSubstrateRenderer` and `UnifiedRenderer` serve as the central dispatch points. They monitor:
1. **Device API Level:** Enforces the API 29 floor (Tier 3 fallback for < API 29).
2. **Backend Readiness:** Real-time probing of `TrubeGPUDriver` (Nitro) and `WebGPUDriver` (TypeGPU).
3. **Frame Telemetry:** Automatic failover to Skia if the native substrate fails to emit a frame within 500ms.

### [Entropy & Aliveness]
"Living Light" is achieved through the **Kells Principle**. Uniforms (`time`, `entropy`, `intensity`) are flushed from the UI thread directly into the native engine cache, ensuring that generative visuals are deterministic yet never repeat perfectly.

---

## III. Directives for Development

1. **TSL-First:** Always write shaders in TSL. The compiler will generate the necessary SkSL and WGSL.
2. **Tier-Awareness:** Every ornament or motif must be tested against all three tiers.
3. **Performance Floor:** High-performance features must not break the Skip failover path.
4. **Aliveness:** Static frames are a failure state. If a surface isn't moving, it is not "Trübe".
