---
title: "Gurudevi Mobile and Shared Packages Dependency Audit"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, dependencies, taze, audit]
---

# Gurudevi Mobile Dependency Audit Report

This report documents the outdated and upgradeable packages within `gurudevi-mobile` and related packages across the monorepo, updated on June 10, 2026, following the automated safe minor/patch upgrade execution.

---

## 1. Executive Summary & Action Taken

An automated update for safe minor and patch dependencies has been executed:
* **Upgrade Run**: Bumps wrote successfully across the monorepo via `taze -r -w` and installed cleanly via `pnpm install`.
* **Key Upgrades Installed**:
  * `expo` bumped safely to `~56.0.9` (along with patch versions of expo modules).
  * Dev tools (`@biomejs/biome` to `2.4.16`, `turbo` to `2.9.17`, `eslint` to `^9.39.4`, `typescript-eslint` to `^8.61.0`).
  * Core packages (`@tanstack/react-query`/`query-core` to `^5.101.0`, `date-fns` to `^4.4.0`, `zustand` to `^5.0.14`).

---

## 2. Status of Specific Packages

### A. React Navigation Usage Audit
We checked if React Navigation (`@react-navigation/*`) is still in use:
* **Root Routing**: The application's entry-point is configured with `"main": "expo-router/entry"`, which boots into Expo Router using the route files under the `/app` directory. The root-level stack navigation setup in `App.tsx` and `src/navigation/*` is legacy.
* **Component-Level Usage**: We **do** still use React Navigation directly. Multiple shared components and packages import `useNavigation` from `@react-navigation/native` (e.g. `GlobalHeader.tsx`, `SanctuarySignal.tsx`, and `OnboardingScreen.tsx` under `packages/ui`).
* **Sub-dependency**: Expo Router relies heavily on React Navigation dependencies internally.

### B. React Native Gesture Handler (`react-native-gesture-handler`)
We checked if `react-native-gesture-handler` is used directly:
* **Direct Usage**: Yes, it is directly used in several core files:
  * [AttendanceSheet.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/classroom/src/components/AttendanceSheet.tsx) (imports `GestureHandlerRootView` and `Swipeable` for swiping items).
  * [MapScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/screens/MapScreen.tsx) (imports `GestureHandlerRootView`).
  * [AstroView.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/visualization/AstroView.tsx) (imports `Gesture` and `GestureDetector` for visual gestures).
  * [DraggableCanvasSurface.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx) (imports `Gesture`, `GestureDetector`, and `GestureHandlerRootView` for surface canvas navigation).
* **Indirect Usage**: It is also required internally by `react-native-reanimated` and other animation/gesture components.

---

## 3. Next Steps & Recommendations

1. **Keep React Navigation Dependencies**: Do not delete `@react-navigation/native` from dependencies, as shared components in `@repo/ui` and packages rely on its hooks, and Expo Router requires it.
2. **Review Expo SDK 55 to 56 Transition**: Align any remaining legacy shared package references targeting SDK 55 versions to ensure strict dependency resolution parity across the monorepo.
