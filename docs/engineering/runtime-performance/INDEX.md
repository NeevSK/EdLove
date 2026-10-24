---
title: "Runtime Performance Document Index & Registry"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, index, catalog, registry]
---

# Runtime Performance Document Index & Registry

> **Domain**: `docs/engineering/runtime-performance/`  
> **Overview**: For conceptual guidance and architectural doctrines, see **[`README.md`](file:///c:/x/docs/engineering/runtime-performance/README.md)**.

---

## 1. Document Inventory

### A. Core Specifications & Empirical Audits
| Document | Title | Purpose | Status | Updated |
| :--- | :--- | :--- | :--- | :--- |
| **[`governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)** | Performance Governor Technical Specification | Interface contracts for `@repo/core/governor`, JSI sensing, and OTLP sink. | Active Spec | 2026-10-19 |
| **[`2026-10-19-audit-intent-vs-reality.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-19-audit-intent-vs-reality.md)** | Performance Intelligence & Efficiency Audit | Tri-layer audit: Intent vs. Symbolic Manifestation vs. Substrate Reality. | Active Audit | 2026-10-19 |
| **[`2026-10-19-exploration-ledger-telemetry-and-quality-feedback-loops.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-19-exploration-ledger-telemetry-and-quality-feedback-loops.md)** | Telemetry Ownership & Quality Feedback Loops | Uncompressed exploration ledger; `react-doctor` & `rn-terrain` audit. | Active Ledger | 2026-10-19 |
| **[`2026-10-19-exploration-ledger-composition-over-monolithic-adaptive-runtime.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-19-exploration-ledger-composition-over-monolithic-adaptive-runtime.md)** | Composition Over Monolithic Adaptive Runtime | Uncompressed exploration ledger: ADPF, Unity/Chrome precedents, thin policy vs monolithic engine. | Active Ledger | 2026-10-19 |
| **[`2026-10-20-exploration-ledger-expo-code-optimization-and-modern-delta.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-expo-code-optimization-and-modern-delta.md)** | Expo Code Optimization & Modern Substrate Delta | Uncompressed exploration ledger: 10 traditional rules vs Expo SDK 58 / RN 0.88 reality check. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-expo-official-lag-reduction-and-react-compiler.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-expo-official-lag-reduction-and-react-compiler.md)** | Official Expo Lag Reduction & React Compiler | Uncompressed exploration ledger: Evan Bacon doctrine, Chrome DevTools, barrel file ban, React 19 `use`, worklets. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-ecosystem-consensus-and-list-benchmarks.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-ecosystem-consensus-and-list-benchmarks.md)** | 2026 Ecosystem Consensus & List Benchmarks | Uncompressed exploration ledger: FlashList v2 vs LegendList benchmark, Reanimated 4, EAS bytecode diffing. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-paper-architecture-vs-material-design.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-paper-architecture-vs-material-design.md)** | Paper Architecture vs Material Design (M2/M3/M3 Expressive) | Disambiguation: React Native Paper renderer vs Fabric, and Google Material Design 2 vs 3 vs Expressive. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-react-native-0.88-and-w3c-performance-apis.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-react-native-0.88-and-w3c-performance-apis.md)** | React Native 0.88 Release & W3C Performance APIs | Meta Oct 19 release: Web-based event dispatching, variable fonts, rnStartupTiming, PerformanceObserver. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-rapidnative-2026-playbook-and-numeric-baselines.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-rapidnative-2026-playbook-and-numeric-baselines.md)** | RapidNative 2026 Playbook & Numeric Baselines | Concrete numeric specs (<2.0s TTI, 58+ FPS, <180MB RAM), 9-step priority ladder, when not to optimize. | Active Ledger | 2026-10-20 |
| **[`2026-10-20-exploration-ledger-expo-adaptive-glass-and-visual-budgeting.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-expo-adaptive-glass-and-visual-budgeting.md)** | `expo-adaptive-glass` & Hardware-Adaptive Visual Budgeting | Liquid glass on iOS 26 vs AGSL/RenderEffect on Android, priority shedding (`critical` to `decorative`), scroll-freeze rule. | Active Ledger | 2026-10-20 |

### A2. Verger (the adaptive runtime): vision and lineage
| Document | Title | Purpose | Status | Updated |
| :--- | :--- | :--- | :--- | :--- |
| **[`verger/vision-feasibility-and-plan.md`](verger/vision-feasibility-and-plan.md)** | Gurudevi Adaptive Runtime: Vision, Feasibility and Plan | Why verger exists (the lieutenant to the OS), its atoms, signals, demand registry, architecture, control testing and phases. | Active Design | 2026-10-24 |
| **[`verger/stage-and-chairs.md`](verger/stage-and-chairs.md)** | Verger: the stage and the chairs | Canonical build doctrine: a full, modular foundation of ten layers; specific choices are data placed later. Lists the open choices. | Active Doctrine | 2026-10-24 |
| **[`verger/pipeline.md`](verger/pipeline.md)** | Verger: the pipeline, needed against built | One-page top-down pipeline (sense to new policy version); needed against built per stage; requisite variety (every disturbance seen and countered); affordance. Kept current. | Active Status | 2026-10-24 |
| **[`verger/second-order-loop.md`](verger/second-order-loop.md)** | Verger: the second-order loop | Verger watches and changes its own adapting (outcomes of moves, its own cost, self-reduction); telemetry as its eyes; prior art connected; implementation plan. | Active Doctrine | 2026-10-24 |
| **[`verger/lineage-and-recovery.md`](verger/lineage-and-recovery.md)** | Verger: Lineage and Recovery | Prior art (Odyssey, MAPE-K, brownout, lite apps) and the mission-critical lessons behind the recovery ladder. | Active Design | 2026-10-24 |

Decisions: [`docs/decisions/2026-10-21-adaptive-runtime-resource-economy.md`](../../decisions/2026-10-21-adaptive-runtime-resource-economy.md).

### B. Device & Resource Efficiency Baselines
| Document | Title | Scope | Status | Updated |
| :--- | :--- | :--- | :--- | :--- |
| **[`memory-efficiency-guidance.md`](file:///c:/x/docs/engineering/runtime-performance/memory-efficiency-guidance.md)** | Gurudevi Memory-Efficiency Guidance | Google Play 2027 memory thresholds, dumpsys meminfo, PSS/RSS tracking. | Active Guide | 2026-08-31 |
| **[`device-efficiency-guidance.md`](file:///c:/x/docs/engineering/runtime-performance/device-efficiency-guidance.md)** | Gurudevi Device-Efficiency Guidance | Bounded storage, battery-saver states, and metered network degradation. | Active Guide | 2026-08-31 |
| **[`memory-efficiency-implementation-plan.md`](file:///c:/x/docs/engineering/runtime-performance/memory-efficiency-implementation-plan.md)** | Memory-Efficiency Implementation Plan | Dalvik/native heap allocation reductions, nursery GC stress mitigation. | Active Plan | 2026-08-31 |
| **[`device-efficiency-implementation-plan.md`](file:///c:/x/docs/engineering/runtime-performance/device-efficiency-implementation-plan.md)** | Device-Efficiency Implementation Plan | Media cache eviction floors and background sync coordination. | Active Plan | 2026-08-31 |
| **[`gurudevi-mascot-low-end-performance.md`](file:///c:/x/docs/engineering/runtime-performance/gurudevi-mascot-low-end-performance.md)** | Mascot Adaptive Performance Contract | Skia canvas budgets, raster asset caching, and low-end GPU scaling. | Active Spec | 2026-08-31 |

### C. Tooling Catalogs & Actionable Playbooks
| Document | Title | Purpose | Status | Updated |
| :--- | :--- | :--- | :--- | :--- |
| **[`ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)** | Ecosystem Tooling Matrix | Comprehensive catalog of all tools, native bridges, scanners, maintainers, health, and RN 0.88/Expo 58 compatibility. | Active Catalog | 2026-10-20 |
| **[`intrinsic-code-efficiency-playbook.md`](file:///c:/x/docs/engineering/runtime-performance/intrinsic-code-efficiency-playbook.md)** | Intrinsic Code Efficiency Playbook | Actionable rules for the 6 waste categories (state cascades, local-first reads, lists, memory, startup) & Monday pilot checklist. | Active Playbook | 2026-10-20 |

### D. In-Depth Tool Dossiers (`tools/`)
| Document | Subject / Package | Maintainer / Pedigree | Production Status | Updated |
| :--- | :--- | :--- | :--- | :--- |
| **[`tools/react-native-runtimes.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-runtimes.md)** | `react-native-runtimes` (`@react-native-runtimes/core`) | Margelo / Callstack (Szymon Kapała et al.) | Tier 4 (Experimental Alpha) — CNG analysis & blast radius | 2026-10-20 |
| **[`tools/react-native-worklets.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-worklets.md)** | `react-native-worklets` (`react-native-worklets@0.13.0`) | Software Mansion (Tomasz Zawadzki et al.) | Tier 1 (Critical Native Sacred Pin) — Reanimated 4 dialect | 2026-10-20 |
| **[`tools/react-native-performance.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-performance.md)** | `react-native-performance` (`oblador`) | Joel Arvidsson (`oblador`) | Superseded by Native RN 0.88 Core W3C APIs (Dead Flipper dependency) | 2026-10-20 |
| **[`tools/expo-adaptive-glass.md`](file:///c:/x/docs/engineering/runtime-performance/tools/expo-adaptive-glass.md)** | `expo-adaptive-glass` (`@rbayuokt`) | R. Bayu Oktaryana (`@rbayuokt`) | Tier 4 (UI Leaf Component) — Adaptive visual budget & AGSL/Metal shaders | 2026-10-20 |

---

## 2. Monorepo Cross-References

### Engineering Runbooks (`docs/engineering/`)
* **[`../rn-js-react-profiling.md`](file:///c:/x/docs/engineering/rn-js-react-profiling.md)** — React DevTools flamegraphs, Hermes sampling profiler, and memory leak hunting.
* **[`../rn-perf-surface-map.md`](file:///c:/x/docs/engineering/rn-perf-surface-map.md)** — Lists (FlashList v2 vs LegendList), Rust UniFFI (`ubrn`), and RN thread models.
* **[`../ui-thread-discipline.md`](file:///c:/x/docs/engineering/ui-thread-discipline.md)** — Reanimated worklets, gesture recognizers, and eliminating UI-thread stalls.

### App-Level Runbooks (`apps/gurudevi-mobile/`)
* **[`../../apps/gurudevi-mobile/docs/Learning/EXPO_OBSERVE_RUNBOOK.md`](file:///c:/x/apps/gurudevi-mobile/docs/Learning/EXPO_OBSERVE_RUNBOOK.md)** — Production EAS Observe monitoring, source maps, and TTI instrumentation.

### Empirical Evidence Registers (`reports/`)
* **[`../../reports/mobile-ux-audit/README.md`](file:///c:/x/reports/mobile-ux-audit/README.md)** — Hardware inspection log (`1.53 GB PSS`, `265% CPU`, `mqt_v_js` thread load).
