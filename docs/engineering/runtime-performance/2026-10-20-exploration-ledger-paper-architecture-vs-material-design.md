---
title: "Exploration Ledger: Disambiguating 'Paper' (RN Core Architecture vs. Material Design 2/3/Expressive)"
status: "active"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, paper, fabric, material-design, md2, md3, md3-expressive, react-native-paper]
---

# Exploration Ledger: Disambiguating "Paper" (RN Core Architecture vs. Material Design)

> **Context**: Resolving the dual meaning of "Paper" in React Native and mapping the evolution of Google's Material Design (M2 vs. M3 vs. M3 Expressive).  
> **Parent Suite**: [`../README.md`](file:///c:/x/docs/engineering/runtime-performance/README.md)  
> **Registry**: [`../INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)

---

## 1. The Great Name Collision: What Does "Paper" Mean?

In the React Native ecosystem, the term **"Paper"** refers to two completely unrelated things that are frequently confused:

```
                          ┌─────────────────────────────┐
                          │   WHAT DOES "PAPER" MEAN?   │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│ MEANING 1: RN RENDER ENGINE     │             │ MEANING 2: CALLSTACK UI LIBRARY │
│ "Paper" vs. "Fabric"            │             │ `react-native-paper`            │
├─────────────────────────────────┤             ├─────────────────────────────────┤
│ • React Native's Old Arch       │             │ • Google Material Design UI kit │
│ • Asynchronous JSON Bridge      │             │ • Buttons, AppBars, Dialogs     │
│ • UIManager + ShadowNode        │             │ • MD2 (v4) vs. MD3 (v5+)        │
│ • DROPPED in Reanimated 4 & 0.88│             │ • A third-party component lib   │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 2. Meaning 1: The Core React Native Architecture ("Paper" vs. "Fabric")

When Software Mansion, Meta, or Expo state:
> *"Reanimated 4 dropped support for Paper"* or *"Expo 58 requires Fabric and retires Paper"*

They are **NOT** talking about UI buttons or Material Design. They are talking about the **internal C++ rendering pipeline**:

| Architectural Feature | Paper (The Old Architecture Renderer) | Fabric (The New Architecture Renderer) |
| :--- | :--- | :--- |
| **Communication Bridge** | **Asynchronous JSON Serialization** (The "JSON Tax") | **Synchronous Direct Memory (C++ JSI)** |
| **Layout & Measurement** | Asynchronous (causes layout jumps & white flashes) | **Synchronous Yoga Layout** (zero visual tearing) |
| **Shadow Tree** | Mutated asynchronously on background thread | **Immutable C++ Shadow Tree** with atomic commits |
| **Concurrent React** | Unsupported (causes state tearing with React 19) | **Full Support** for React 19 Suspense & Transitions |
| **Current Status (2026)** | 🪦 **Deprecated & Removed** in RN 0.76+ / RN 0.88 | 🟢 **Mandatory Standard** across Gurudevi monorepo |

---

## 3. Meaning 2: Google's Material Design Evolution (M2 vs. M3 vs. "M4")

When discussing Material Design in mobile UI engineering, the progression spans three major eras:

```
[2018: Material 2 (M2)] ──► [2021-2024: Material 3 (M3 / You)] ──► [2025-2026: Material 3 Expressive]
  • Skeuomorphic Ink          • Dynamic Monet Color Extraction      • Shape Morphing (~35 new shapes)
  • Rigid Elevation Shadows   • Tonal Surface Containers            • Spring-Based Motion Physics
  • Geometric Sans Type       • Pill-Shaped Rounded Buttons         • Variable Type (Roboto Flex)
```

### 1. Material 2 (MD2 — 2018)
* **Visual Signature**: Heavy white surfaces, harsh drop-shadow elevations (1dp–24dp), rigid 48dp touch targets, bright primary/secondary accent colors.
* **Component Library**: Handled in `react-native-paper` version 4 (`theme.version = 2`).

### 2. Material 3 / "Material You" (MD3 — 2021 to 2024)
* **Visual Signature**: Replaced harsh drop shadows with **tonal color elevation** (cards tinted with surface tones). Pill-shaped buttons, dynamic wallpaper color extraction (Monet), expressive typography.
* **Component Library**: Default standard in `react-native-paper` version 5 (`theme.version = 3`).

### 3. Did Google Release "Material 4"?
* **No — Google Released "Material 3 Expressive" (2025–2026)**:
  Rather than forcing a disruptive breaking brand migration ("M4"), Google introduced **Material 3 Expressive**:
  * **Shape Morphing**: ~35 dynamic shapes for avatars, floating action chips, and progressive loaders.
  * **Spring Motion Physics**: Standardized spring-based transition curves that make interactive sheets and gestures feel tactile and responsive.
  * **Jetpack Compose First**: Google transitioned its legacy Android Views library (`MDC-Android 1.14.0`) to maintenance mode, establishing Jetpack Compose as the exclusive platform for future Material evolution.

---

## 4. Gurudevi Substrate Relevance: What Do We Use?

| Layer | Substrate Decision in Gurudevi | Rationale |
| :--- | :--- | :--- |
| **Rendering Engine** | **Fabric (New Architecture)** | Gurudevi is 100% Bridgeless/Fabric on Expo 58 / RN 0.88. Old "Paper" is completely eradicated. |
| **UI Design System** | **Gurudevi Sovereign Tokens (`@repo/ui/tokens`)** | We do **not** use `react-native-paper` or generic Material Design. Gurudevi features custom sanctuary themes, diurnal warmth, Tutii motion curves, and Apple HIG/NativeWind tokens. |
| **Motion Physics** | **`react-native-worklets` + Reanimated 4** | Adopts spring-based motion curves equivalent to the modern expressive physics standards. |

---

## 5. Cross-References
* List & Engine Upstream: [`2026-10-20-exploration-ledger-ecosystem-consensus-and-list-benchmarks.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-ecosystem-consensus-and-list-benchmarks.md)
* Worklets Tool Dossier: [`tools/react-native-worklets.md`](file:///c:/x/docs/engineering/runtime-performance/tools/react-native-worklets.md)
* Tooling Master Matrix: [`ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)
