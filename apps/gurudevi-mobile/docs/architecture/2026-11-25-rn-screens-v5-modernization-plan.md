---
title: "React Native Screens v5 — Implementation & Modernization Plan"
status: "active"
created: 2026-11-25
updated: 2026-11-25
author: "Naween"
scribe: "Antigravity"
tags: [react-native-screens, v5, modernization, implementation-plan, mobile]
---

# React Native Screens v5 — Implementation & Modernization Plan

This plan sequences the adoption of `react-native-screens@5.0.0-beta.2` in `apps/gurudevi-mobile` while preserving `AGENTS.md` invariants (`useNavigator()`, `useFlowNavigator()`, `NAVIGATION_POLICY`, CNG pipeline, and `@repo/ui` boundaries).

---

## Phase 0 — Baseline Verification & Native Rebuild (Immediate)

1. **Confirm Dependency & Lockfile State (Done)**
   - `react-native-screens` is `5.0.0-beta.2` in [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L249) and [pnpm-workspace.yaml](file:///c:/x/pnpm-workspace.yaml#L218).
   - `tsc --build --noEmit` in `apps/gurudevi-mobile` reported **0** navigation/screens type errors.
2. **Fix Windows Path Separator in `anchors.test.ts`**
   - Update [anchors.test.ts](file:///c:/x/apps/gurudevi-mobile/src/__tests__/navigation/anchors.test.ts#L24) to normalize `relative(APP, file).replace(/\\/g, '/')` so all 27 navigation tests pass on Windows and Linux.
3. **Native Dev Client Rebuild (CNG)**
   - Because `react-native-screens` v5 reorganizes native Android (`com.swmansion.rnscreens.legacy`) and iOS (`ios/legacy/`) sources, rebuild native dev binaries (`pnpm --filter gurudevi-mobile run android` / `ios` or `build:dev`) before device testing.
   - Smoke-test:
     - Cold boot splash handoff -> `EntryStack` 5-zone `Stack.Protected` transitions
     - `NativeShellTabs` (`variant === 'native'`) and `ShellTabBar` (`variant === 'custom'`)
     - `self` and `workspace` nested stack push/pop/anchor back-navigation
     - `workspace/demo-fee` & `(modal)/create-form` modal presentations

---

## Phase 1 — Quick Wins Using Existing + v5 Native Primitives

1. **Wire `SHEET_SCREEN` onto Confirm / Sheet Routes**
   - Audit `FLOW_REGISTRY` steps with `purpose: 'preview_confirm'` (compact = `'sheet'`).
   - Spread `SHEET_SCREEN` from [sheetScreen.ts](file:///c:/x/apps/gurudevi-mobile/src/navigation/sheetScreen.ts) onto those `<Stack.Screen options={SHEET_SCREEN} />` declarations so `useFlowNavigator().open(...)` and route layouts agree.
2. **Adopt `ScrollViewMarker` in `RoomPage` / `PageFrame`**
   - Wrap primary scrollable room content in `ScrollViewMarker` (with a safe platform/kit wrapper in `@repo/ui/components/native`) to enable iOS 26 `scrollEdgeEffects` and clean native header/tab-bar scroll coordination.
3. **Add `ScrollToTopGuard` on Nested Horizontal/Secondary ScrollViews**
   - Use `ScrollToTopGuard` from `react-native-screens/experimental` inside `@repo/ui` horizontal carousels / nested lists so status-bar tap always scrolls the primary vertical feed.

---

## Phase 2 — Tablet & Regular-Width `Split` Panel Enablement

1. **Prototype `Split` / `expo-router/unstable-split-view` for `regular` Size Class**
   - `NAVIGATION_POLICY.panels.mobile` is currently `false` ([navigationPolicy.ts](file:///c:/x/packages/core/src/flows/navigationPolicy.ts#L41)).
   - Evaluate `expo-router/unstable-split-view` (or `Split.Host` + `Split.Column` on iOS / adaptive two-pane on Android) for `workspace` (`sub_detail` routes like `commercial/[batchId]`, `inventory`, `welfare`).
2. **Pair `ContainedModalProvider` with Split Columns**
   - Inside each `Split.Column`, wrap content in `ContainedModalProvider` so `preview_confirm` dialogs (`ContainedModalOverContent`) stay scoped to the active column on tablets instead of blocking the entire screen.
3. **Flip `NAVIGATION_POLICY.panels.mobile = true`** once verified on tablet + foldable form factors.

---

## Phase 3 — Sheet & Modal Consolidation

1. **Retire Legacy `@repo/ui/primitives` `Modal` in `(tabs)/_layout.tsx`**
   - Replace the legacy `Modal` for `Breathing Reset` in [app/(tabs)/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/_layout.tsx#L719-L769) with either a route-backed modal/sheet or `@repo/ui/components/native` `Dialog`/`Sheet` (aligning with `check:ui-boundaries`).
2. **Evaluate `FormSheet` vs `@swmansion/react-native-bottom-sheet` in Kit `Sheet`**
   - Keep `ModalBottomSheet` in [Sheet.tsx](file:///c:/x/packages/ui/src/components/native/Sheet/Sheet.tsx) as the default while `5.0.0-beta` stabilizes; benchmark `FormSheet` as a zero-JS-overhead alternative for simple detent sheets.

---

## Phase 4 — `NativeShellTabs` & v5.0.0 GA Readiness

1. **Explore `TabsBottomAccessory` for `NativeShellTabs`**
   - Evaluate `TabsBottomAccessory` (iOS 26.1+) for compact inline status / active-task indicators when `NativeShellTabs` is active.
2. **Track `react-native-screens` `5.0.0` GA & `expo-router` Updates**
   - Once `5.0.0` exits beta, remove the `5.0.0-beta.2` pre-release pin in [pnpm-workspace.yaml](file:///c:/x/pnpm-workspace.yaml#L218) and [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L249) and align with `expo@58` `bundledNativeModules.json`.
