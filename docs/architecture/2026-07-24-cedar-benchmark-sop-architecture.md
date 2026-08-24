---
title: "On-Device Cedar Policy Authorization & A/B Benchmarking SOP Architecture"
status: "active"
created: 2026-07-24
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture, historical]
---

# On-Device Cedar Policy Authorization & A/B Benchmarking SOP Architecture

## Architecture Overview
This document specifies the implementation and benchmarking standard for evaluating complex ABAC/RBAC Cedar policies directly on mobile devices using Rust JNI exports in Expo 57 / React Native 0.86 applications.

```
┌─────────────────────────────────────────────────────────────┐
│ React Native / Expo 57 UI Layer (app/index.tsx)             │
│   - Constructs Cedar Request & Entities JSON                │
│   - Triggers 1,000x Async Loop                             │
│   - Computes JS Roundtrip Average (performance.now())       │
└──────────────────────────────┬──────────────────────────────┘
                               │ JNI Bridge (Async Expo Module)
┌──────────────────────────────▼──────────────────────────────┐
│ Kotlin Module (app/CedarBenchModule.kt)                    │
│   - Calls nativeEvalRaw / nativeEvalCedarling                │
│   - Catches native exceptions & rejects Promises             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Pure C JNI (no C++ glue)
┌──────────────────────────────▼──────────────────────────────┐
│ Rust Dynamic Library (src/lib.rs)                           │
│   - Panic Shield: std::panic::catch_unwind                  │
│   - Microsecond Timing: std::time::Instant::now()           │
│   - Cedar Engine: cedar-policy 4.11.2                       │
│   - Cedarling PDP: cedarling 0.0.11                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Specifications & Requirements

### 1. Strict Crate Version Constraints
- `cedar-policy = "4.11.2"`
- `cedarling = "0.0.11"`
- `jni = "0.22.4"`
- `serde = { version = "1.0", features = ["derive"] }`
- `serde_json = "1.0"`

### 2. Evaluated Complex Policy Scenarios
The benchmark evaluates real-world Polymath policy complexity (such as `teacher.cedar`):
- **Array Containment (`contains`):** Checking principal assigned classrooms against resource `classroom_id`.
  `principal.classroom_ids.contains(resource.classroom_id)`
- **Contextual ABAC:** Conditional evaluation of contextual security flags (e.g. `device_trust == "high"` when creating grades).
  `if (action == Action::"create" && resource is Grade) then (context has device_trust && context.device_trust == "high") else true`

---

## Safety & Memory Discipline

1. **JNI Exception Safety:**
   All native functions must wrap internal Rust execution within `std::panic::catch_unwind`. Unhandled Rust panics crossing the FFI boundary cause immediate undefined behavior or process crashes. On panic or error, throw a native Java `java/lang/Exception` and safely return a null pointer.

2. **Local Reference Management:**
   When looping in Rust JNI code or receiving string references, avoid leaking `jstring` or `jobject` references across calls.

3. **Single Cedarling Boot Instance:**
    Cedarling requires a boot sequence via `BootstrapConfigRaw`. The instance is safely wrapped in a thread-safe `static RwLock<Option<Cedarling>>` / `lazy_static!` block in Rust.

---

## Benchmark Metrics & Interpretation

| Metric | Source | Description |
| :--- | :--- | :--- |
| **JS Roundtrip Average ($\mu s$)** | React Native (`performance.now()`) | Total end-to-end latency from JavaScript invocation to native resolution, including bridge overhead and serialization. |
| **Rust Execution Average ($\mu s$)** | Rust (`std::time::Instant::now()`) | Pure policy decision computation time inside the Rust engine. |

By comparing these two metrics over 1,000 continuous iterations, the benchmark explicitly isolates Rust engine performance from React Native bridge and JSON serialization overhead.
