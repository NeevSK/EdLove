---
title: "Ecosystem Tooling Matrix: Runtime Performance, Native Engines & Diagnostic Sentinels"
status: "active"
created: 2026-10-20
updated: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [performance, tooling, dependencies, nitro, ubrn, expo-observe, react-doctor, rn-terrain]
---

# Ecosystem Tooling Matrix: Runtime Performance, Native Engines & Diagnostic Sentinels

> **Domain Suite**: [`docs/engineering/runtime-performance/`](file:///c:/x/docs/engineering/runtime-performance/README.md)  
> **Registry**: [`docs/engineering/runtime-performance/INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)  
> **Purpose**: Master reference catalog of all performance tools, native bridges, diagnostic scanners, and hardware APIs evaluated for Gurudevi. Details capabilities, maintainers, health/maturity, and compatibility with the active **Expo SDK 58 / React Native 0.88 (New Architecture)** stack.

---

## 1. Tooling & Dependency Master Matrix

| Tool / Technology | Primary Capability | Maintainer / Author | Health & Maturity | Expo SDK 58 / RN 0.88 Fit | Role in Gurudevi Recipe |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`react-native-nitro-modules`** (0.37.1) | Zero-overhead C++/JSI bindings via Nitrogen code generator (~7 µs dispatch). | Margelo (Marc Rousavy) | **Production (Tier 1 Sacred Pin)** | Fully compatible (New Arch / Bridgeless). Requires C++ STL pinning. | **Phase 2 Governor Sensing**: Instant native heap, thermal state, and UI-worklet visual downgrades. |
| **`uniffi-bindgen-react-native` (`ubrn`)** | Generates TurboModule JSI/C++ bindings from safe Rust crates using Mozilla UniFFI. | Mozilla & Filament | **Production / High** | Compatible (TurboModule output). Requires Rust toolchain in CI. | **Heavy Domain & Sync Engines**: Offline cryptography, vector index math, cross-platform algorithms. |
| **Expo Modules API v2** (`expo-modules-core`) | Swift macros & Kotlin annotations with build-time reflection (~70–120 ms). | 650 Industries (Expo) | **Core / Production** | Native to SDK 58. Autolinked out of the box. | **Standard Native Extensions**: Platform permissions, notifications, audio/video modules. |
| **`expo-observe`** (~58.0.15) | Production TTI, cold/warm TTR, route transitions, and JS error telemetry via OTLP. | 650 Industries (Expo) | **Production (GA Aug 2026)** | First-party Expo SDK 58 module. Autolinked. | **Telemetry Sensor**: Production launch timing and route TTI markers; redirects to owned OTLP collector. |
| **OpenTelemetry Collector** (OTLP/HTTP) | Ingestion proxy that filters, validates, samples, and routes telemetry to long-term DBs. | CNCF / OpenTelemetry | **Industry Standard** | Backend service (runs alongside `apps/sanctuary-api`). | **Sovereign Telemetry Ownership**: Long-term ClickHouse/Timescale retention beyond EAS 90-day ceiling. |
| **`react-doctor`** | Diagnostic AST scanner detecting 10x `useState` traps, un-memoized lists, and effect loops. | Million.js Team (Aiden Bai) | **Active Community (2026)** | CLI / Dev tool. Zero runtime dependency footprint. | **Development Quality Gate**: Run on PRs and modified screens to catch state proliferation before merge. |
| **`rn-terrain` Engine** | Sovereign native proof engine: `doctor:all`, `verify:hermes`, `verify:yoga`, `@ast-grep/napi`. | Sovereign Monorepo (`c:/projects/rn-terrain`) | **Internal Toolchain** | Integrated via `scripts/run-rn-terrain.mjs`. | **Native Architecture Gate**: Prevents C++ STL collisions, bytecode de-optimizations, and layout loops. |
| **Android ADPF** (Dynamic Performance Framework) | Native thermal headroom signals, performance hints, and CPU/GPU clock pacing. | Google / Android Open Source | **Android OS Core (API 31+)** | Supported on physical Android 12+ devices. | **Hardware Signal**: Provides continuous thermal headroom to throttle optional background workloads. |
| **`margelo/react-native-runtimes`** ([Dossier](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-runtimes.md)) | Spawns named, isolated secondary Hermes runtimes for heavy background processing. | Margelo & Callstack (Szymon Kapała et al.) | **Tier 4 (Experimental Alpha v0.1.0)** | Compatible via Nitro + official Expo Config Plugin. | **Thread Isolation (Post-Pilot)**: Offloads heavy crypto or vector AI without blocking main event loop. |
| **`rough-native`** | Native `MemoryMonitor` with adaptive cache scaling linked to OS memory pressure signals. | Callstack Community | **Specialized Utility** | Native Android/iOS hook. | **Memory Governor**: Triggers cache eviction when OS broadcasts `TRIM_MEMORY_RUNNING_CRITICAL`. |
| **`p-queue`** | Promise-based queue with strict concurrency ceilings, priority weights, and pause/resume. | Sindre Sorhus | **Ubiquitous JS Standard** | Pure TypeScript/JS. Zero native dependencies. | **Work Admission Governor**: Enforces `PROVISIONAL_MAX_OPTIONAL_CONCURRENCY = 1` for background tasks. |
| **TanStack Query** (v5) | Stale-while-revalidate data fetching, cache garbage collection, and query retry backoff. | TanStack (Tanner Linsley) | **Gold Standard** | Cross-platform JS/TS. Active in monorepo. | **Read-Side Cache**: Deduplicates server queries, manages GC timeouts, and provides query deduplication. |
| **PowerSync + Drizzle SQLCipher** | Offline-first SQLite replication with JSI-based page-level AES-256 encryption. | JourneyApps & Drizzle Team | **Production Core** | Uses `@op-engineering/op-sqlite` (New Arch). | **Local-First Classroom Storage**: Replaces slow HTTP network calls with sub-millisecond local SQLite queries. |
| **`@shopify/flash-list`** (v2) | High-performance virtualized list with synchronous layout measurement and cell recycling. | Shopify | **Production Standard** | Ground-up rewrite for New Architecture (Fabric). | **Virtualized Classrooms**: Smooth 60fps scrolling for student rosters exceeding 300+ items. |
| **`@legendapp/list`** (LegendList) | Pure JS/TS virtualized list with fine-grained reactivity, zero native linking, & chat support. | LegendApp (Jay Meistrich) | **High / Emerging Standard** | Universal (Old & New Arch). Zero native deps. | **Heterogeneous Feeds & Chat**: Variable-height community feeds and chat without inverted layout hacks. |
| **`react-native-worklets`** (0.13.0, [Dossier](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-worklets.md)) | Micro-threading engine: compiles JS closures with `'worklet'` for UI & worker execution. | Software Mansion (Tomasz Zawadzki et al.) | **Production (Tier 1 Sacred Pin)** | New Architecture / Bridgeless Hermes native. | **Micro-Threading Governor**: Executes synchronous 60/120fps UI worklets, gestures, and Mascot physics. |
| **`react-native-reanimated`** (4.7.1) | 60/120fps UI-thread animation engine executing inside Hermes worklets. | Software Mansion | **Production (Tier 1 Sacred Pin)** | Requires `react-native-worklets@0.13.0`. | **UI Worklet Governor**: Dynamically scales particle counts and canvas blur without waking the JS thread. |
| **`react-native-performance`** ([Dossier](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-performance.md)) | User Timing polyfill and native launch milestones with Flipper plugin. | Joel Arvidsson (`oblador`) | **Superseded by RN 0.88 Core** | Core RN 0.88 now includes native W3C `performance` & `rnStartupTiming`. | **Historical Pioneer (Do Not Install)**: Avoid redundant native dependencies when Hermes provides native APIs. |
| **Flashlight CLI** | Android lighthouse-style performance auditor: measures average FPS, CPU, and RAM. | BamLab | **Production Diagnostic** | Android ADB host tool. Zero app footprint. | **Release Benchmark Gate**: Measures physical device regression before pilot deployments. |
| **`@rbayuokt/expo-adaptive-glass`** ([Dossier](file:///c:/x/docs/engineering/runtime-performance/tools/expo-adaptive-glass.md)) | Native adaptive liquid glass & frosted acrylic with priority shedding & scroll-freeze. | R. Bayu Oktaryana (`@rbayuokt`) | **Active Open Source (2026)** | Compatible with Expo 57/58, Swift & Kotlin native backends. | **Adaptive Visual Budget Model**: Invariants adopted for Governor; component candidate for Wave 2 navigation. |

---

## 2. Architectural Recipes: How Tools Combine into Systems

### Recipe A: The Zero-Overhead Hardware Governor (Phase 2 Post-Pilot)
```
[Android ADPF / iOS Thermal API]
               │
               ▼
   [Nitro C++ Hybrid Object]  ──(Synchronous ~7 µs JSI)──►  [PerformanceGovernor Facade]
               │                                                          │
               ▼                                                          ▼
[Reanimated Worklet (UI Thread)]                            [p-queue Concurrency Governor]
(Downgrades particles to essential)                         (Pauses background sync & prefetch)
```

### Recipe B: The Sovereign Telemetry Pipeline
```
[User Interaction / Screen Transition]
               │
               ▼
     [useObserve().markInteractive()]  (Route TTI marker)
               │
               ▼
      [expo-observe Native Module]  (Dispatches OTLP JSON)
               │
               ▼ (extra.eas.observe.endpointUrl)
  [Our OpenTelemetry Collector]  (apps/sanctuary-api proxy)
               │
               ▼
[ClickHouse / Timescale / Grafana]  (Owned long-term data retention >90 days)
```

### Recipe C: The Pre-Merge Anti-Regression Quality Gate
```
[Git Commit / PR Proposed]
               │
               ├────────────────────────► [pnpm run check:anti-slop] (Dialects & imports)
               ├────────────────────────► [npx react-doctor@latest] (Component state & renders)
               └────────────────────────► [node scripts/run-rn-terrain.mjs doctor:all] (C++ STL & Fabric)
```
