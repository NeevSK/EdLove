---
title: "Tool Dossier: react-native-performance (oblador)"
status: "active"
classification: "historical-pioneer-superseded"
date: 2026-10-20
author: "Naveen"
scribe: "Antigravity"
tags: [performance, oblador, flipper, user-timing, w3c, startup-timing, hermes, obsolete-dependencies]
---

# Tool Dossier: `react-native-performance` (oblador)

> **Repository**: [`github.com/oblador/react-native-performance`](https://github.com/oblador/react-native-performance)  
> **Package**: `react-native-performance` (v7.0.0, September 2026)  
> **Author**: Joel Arvidsson (`oblador`)  
> **Parent Matrix**: [`../ecosystem-tooling-matrix.md`](file:///c:/x/docs/engineering/runtime-performance/ecosystem-tooling-matrix.md)  
> **Registry**: [`../INDEX.md`](file:///c:/x/docs/engineering/runtime-performance/INDEX.md)

---

## 1. Executive Summary & The Flipper Question

### You Asked: "Does this depend on Flipper, and wasn't Flipper removed?"
**Yes, exactly right.** 

Historically (2021–2023), `react-native-performance` rose to prominence because it was bundled with **`flipper-plugin-performance`**, which provided a visual timeline of app startup milestones and component renders inside Meta’s desktop Flipper app.

However, in the modern React Native ecosystem:
1. **Flipper Is Dead**: Meta deprecated Flipper in React Native 0.73 and **completely removed it in React Native 0.76+ and 0.88**. Modern debugging has standardized on **Chrome DevTools connected directly to Hermes via CDP** (press `j` in Expo CLI).
2. **The Flipper Plugin Is Obsolete**: While the core `react-native-performance` library updated to v7.0.0 (September 2026) to support the New Architecture without requiring Flipper, the desktop visualization plugin is effectively dead.

---

## 2. The Core Realization: "Sherlocked" by React Native 0.88 Core

When Joel Arvidsson built `react-native-performance` in 2021, React Native had **no built-in W3C User Timing API** and **no native startup milestones**. Developers had to install this library to get native iOS/Android code that measured `nativeLaunchStart` and `nativeLaunchEnd`.

### What Changed in React Native 0.88 (Hermes C++ Engine)
As documented in [`../2026-10-20-exploration-ledger-react-native-0.88-and-w3c-performance-apis.md`](file:///c:/x/docs/engineering/runtime-performance/2026-10-20-exploration-ledger-react-native-0.88-and-w3c-performance-apis.md), React Native core now implements the W3C Performance specifications **out of the box directly in C++ Hermes**:

```
┌────────────────────────────────────────────────────────────────────────┐
│      react-native-performance (oblador) vs. React Native 0.88 Core     │
├──────────────────────────────────┬─────────────────────────────────────┤
│ oblador/react-native-performance │ Native React Native 0.88 Core       │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • External third-party package   │ • Built directly into Hermes / C++  │
│ • Requires native pod/gradle link│ • Zero install, zero native config  │
│ • Relied on dead Flipper plugin  │ • Works natively with Chrome DevTool│
│ • Custom JS marks & measures     │ • Standard W3C performance.mark()   │
│ • Custom startup milestones      │ • performance.rnStartupTiming       │
│                                  │ • W3C PerformanceObserver API       │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Comparison of API Signatures

### 1. Startup Timing
* **`react-native-performance` (Legacy)**:
  ```typescript
  import performance from 'react-native-performance';
  const launchDuration = performance.getEntriesByName('nativeLaunch')[0].duration;
  ```
* **React Native 0.88 Core (Built-in Substrate)**:
  ```typescript
  // Zero imports needed — globalThis.performance
  const { startTime, executeJavaScriptBundleEntryPointStart, endTime } = performance.rnStartupTiming;
  const engineInitDuration = executeJavaScriptBundleEntryPointStart - startTime;
  ```

### 2. Custom Render Marks
* **`react-native-performance` (Legacy)**:
  ```typescript
  import performance, { PerformanceObserver } from 'react-native-performance';
  performance.mark('render_start');
  ```
* **React Native 0.88 Core (Built-in Substrate)**:
  ```typescript
  performance.mark('render_start');
  performance.measure('Render', 'render_start');
  const observer = new PerformanceObserver((list) => { ... });
  observer.observe({ entryTypes: ['measure', 'longtask'] });
  ```

---

## 4. Architectural Verdict for Gurudevi

### Recommendation: ❌ DO NOT INSTALL `react-native-performance`
1. **Redundant Abstraction**: Installing a third-party package to polyfill `performance.mark` and `performance.measure` when React Native 0.88 and Hermes already implement them natively violates the monorepo's **Anti-Slop Standard** (`AGENTS.md`).
2. **Zero Native Risk Before Monday**: Adding an external native module right before Monday's pilot introduces unnecessary native build risk and potential C++ namespace friction.
3. **The Sovereign Path**:
   * Use **`globalThis.performance.rnStartupTiming`** inside [`apps/gurudevi-mobile/src/boot/startupTelemetry.ts`](file:///c:/x/apps/gurudevi-mobile/src/boot/startupTelemetry.ts).
   * Use **`expo-observe`** (`<ObserveInteractiveMarker />`) for route TTI tracking and OTLP production forwarding.
   * Use **Chrome DevTools (`j`)** and `rn-terrain doctor:all` for development profiling.
