---
title: "Tool Dossier: expo-adaptive-glass"
status: "active"
classification: "tier-4-candidate-ui"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [glassmorphism, shaders, agsl, metal, adaptive-budget, ui, visual-degradation, expo-modules]
---

# Tool Dossier: `expo-adaptive-glass`

> **Canonical Substrate Reference**: `@rbayuokt/expo-adaptive-glass`  
> **Source Repository**: [`github.com/rbayuokt/expo-adaptive-glass`](https://github.com/rbayuokt/expo-adaptive-glass)  
> **Parent Matrix**: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)  
> **Related Exploration Ledger**: [`../2026-10-20-exploration-ledger-expo-adaptive-glass-and-visual-budgeting.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-expo-adaptive-glass-and-visual-budgeting.md)  
> **Architectural Spec**: [`../governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)

---

## 1. Metadata & Vital Statistics

| Dimension | Specification | Grounded Substrate Reality |
| :--- | :--- | :--- |
| **Package Identifier** | `@rbayuokt/expo-adaptive-glass` | Adaptive native glass surfaces for Expo & React Native |
| **Active Target** | **`latest`** (Expo SDK 57/58, React 19, RN 0.88 New Arch) | Standalone Expo Module with Swift & Kotlin native backends |
| **Primary Author** | R. Bayu Oktaryana (`@rbayuokt`) | Independent open-source engineer |
| **License** | **MIT** | Unrestricted open source |
| **Architectural Weight Tier** | **Tier 4 (UI Leaf Component / Candidate)** | Not pinned in core spine; evaluated for UI navigation & modals |
| **Native Prerequisites** | Expo Modules API, Swift (iOS), Kotlin (Android), dev client (no Expo Go) | Uses public Apple APIs & Android RenderEffect / AGSL |
| **Peer Matrix Compatibility**| Tested with Expo SDK 57/58, React Navigation 7, Expo Router tabs | Clean integration with zero C++ STL collision risk |

---

## 2. Core Architectural Problem: The Android Blur Dilemma

Glassmorphic interfaces (frosted sheets, liquid glass cards, and backdrop blur) are natively simple on Apple hardware, but historically catastrophic on Android:

1. **The iOS Advantage:** iOS provides hardware-composited private backing stores (`UIVisualEffectView` and iOS 26 `UIGlassEffect`), which capture everything behind a view without JS or CPU overhead.
2. **The Android Failure Mode:** Android's `RenderEffect.createBlurEffect(...)` (API 31+) operates on the view's **own RenderNode**, NOT the composited surface behind it. If a card applies `RenderEffect`, it blurs its *own* children (labels, icons), not the background.
3. **The Low-End Crash:** Running real-time Skia or un-governed blur shaders across multiple scrolling cards on low-end Android GPUs (Mali/PowerVR) drops frame rates from 60 FPS down to 10–18 FPS.

### How `expo-adaptive-glass` Solves It

`expo-adaptive-glass` solves both issues via a twin architecture:
1. **The Dual RenderNode Backdrop Pattern:** `<GlassBackdrop>` isolates the background in an offscreen hardware-accelerated target. Sibling `<GlassSurface>` views sample this node, applying AGSL/RenderEffect blur *beneath* their own children.
2. **The Adaptive Visual Governor:** Surfaces scale down from liquid glass to acrylic to flat opacity based on real-time device thermal and frame-rate metrics.

---

## 3. The 5 Quality Tiers & Cross-Platform Renderers

| Tier | iOS 26+ | iOS 15.1–25 | Android 13+ (API 33+) | Android 12 (API 31–32) | Android 11 / `isLowRamDevice()` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ultra`** | Public `UIGlassEffect` + finger-following highlight | `UIBlurEffect` + sheen & rim | Backdrop `RenderNode` + AGSL shader lens + blur | Backdrop `RenderNode` + blur | Acrylic fallback |
| **`high`** | `UIGlassEffect` (50% edge bending) | `UIBlurEffect` + light sheen | Backdrop + AGSL shader (light) | Backdrop + blur | Acrylic fallback |
| **`medium`**| System glass (no moving highlight) | Plain blur | Plain blur | Plain blur | Acrylic fallback |
| **`low`** | Static acrylic | Static acrylic | Static acrylic fill + hairline | Static acrylic fill + hairline | Static acrylic fill |
| **`minimal`**| Flat translucent fill | Flat translucent fill | Flat translucent fill | Flat translucent fill | Flat translucent fill |

---

## 4. Architectural Invariants & Mechanics

### 4.1 Component-Level Priority Shedding
Surfaces declare their intrinsic visual necessity:
```tsx
<GlassSurface priority="critical" style={styles.navBar}>...</GlassSurface>
<GlassSurface priority="high" style={styles.activeCard}>...</GlassSurface>
<GlassSurface priority="normal" style={styles.feedItem}>...</GlassSurface>
<GlassSurface priority="low" style={styles.badge}>...</GlassSurface>
<GlassSurface priority="decorative" style={styles.ambientBlob}>...</GlassSurface>
```
When thermal throttling or frame drops occur:
- `decorative` falls to flat opacity immediately.
- `low` and `normal` drop to static acrylic together, ensuring lists don't suffer from "half-glass / half-acrylic" visual fragmentation.
- `critical` keeps live glass longest.

### 4.2 The Scroll-Freeze Invariant (Anti-Thrashing)
- **Problem:** Toggling shaders mid-scroll triggers layout recalculations and GPU pipeline stalls, causing visual flickering and deeper frame drops.
- **Rule:** Allocations are **strictly frozen** while scrolling. Re-planning executes only when scroll velocity reaches zero.

### 4.3 Sensor Decoupling & Pure TypeScript Governor
- **Sensors:** Swift (`CADisplayLink`, `ProcessInfo`) and Kotlin (`OnFrameMetricsAvailableListener`, `PowerManager`, `onTrimMemory`) push raw measurements across the bridge.
- **Policy Engine:** Lives in `src/quality/` in pure TypeScript, without native or React dependencies. It is 100% testable in headless unit test runners (Jest / Vitest).
- **Subscription:** Components subscribe via `useSyncExternalStore`, re-rendering only when their own tier allocation changes.

---

## 5. Polymath Monorepo Evaluation & Roadmap

### 5.1 Monday, October 26 Pilot Stance: ARCHITECTURAL ADOPTION ONLY
- **Verdict:** **DO NOT install `@rbayuokt/expo-adaptive-glass` native module before Monday.**
- **Rationale:**
  1. The Teacher Evaluation Pilot focuses on attendance, grading, and offline data sync (`AttendanceScreen.tsx`). It does not require liquid glass sheets.
  2. Introducing a new native module risks native build pipeline churn (Swift/Kotlin compilation and prebuild overhead) during a freeze window.
- **Actionable Takeaways Adopted for Pilot:**
  - Adopt the **Scroll-Freeze Invariant** into `@repo/core/verger` to lock Tutii mascot physics and list overscan during active scroll.
  - Adopt the **Priority-Shed Contract** in `@repo/ui/tokens` so components gracefully drop from transparent blur to solid token fills (`#1E293B`) under `Low` governor states.

### 5.2 Post-Pilot Roadmap (Wave 2 / Q4 2026)
- Evaluate `@rbayuokt/expo-adaptive-glass/navigation` (`GlassNavigationTabBar`) for the Gurudevi Sanctuary root tabs.
- Leverage its AGSL lens shaders for premium interactive widgets (switches, sliders, and floating sheets).
