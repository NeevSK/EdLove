---
title: "React Native Screens — Current Code Patterns & Locations Audit"
status: "active"
created: 2026-11-25
updated: 2026-11-25
author: "Naween"
scribe: "Antigravity"
tags: [react-native-screens, expo-router, navigation, audit, mobile]
---

# React Native Screens — Current Code Patterns & Locations Audit

This document inventories every navigation, screen, stack, tab, sheet, modal, and deep-link pattern currently used in `apps/gurudevi-mobile` and its shared UI/core packages following the upgrade of `react-native-screens` to `5.0.0-beta.2`.

---

## 1. Dependency & Package Configuration

| Surface | Value / State | Location |
| :--- | :--- | :--- |
| App dependency | `"react-native-screens": "5.0.0-beta.2"` | [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L249) |
| Expo install exclude | `"react-native-screens"` excluded from `expo install` auto-pin | [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L335) |
| Workspace override | `react-native-screens: '5.0.0-beta.2'` + `minimumReleaseAgeExclude` | [pnpm-workspace.yaml](file:///c:/x/pnpm-workspace.yaml#L45) & [line 218](file:///c:/x/pnpm-workspace.yaml#L218) |
| Router version | `expo-router`: `~58.0.32` (declares `^4.30.1 \|\| ^5.0.0-beta.1`) | [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L187) |
| React Native / Expo | `react-native`: `0.88.1`, `expo`: `~58.0.26`, `react`: `19.3.1` | [apps/gurudevi-mobile/package.json](file:///c:/x/apps/gurudevi-mobile/package.json#L138) |
| Web stub | No-op `enableScreens` / `enableFreeze` stub comments | [packages/ui/src/shims/native-web-stub.ts](file:///c:/x/packages/ui/src/shims/native-web-stub.ts#L165-L168) |

> **Direct imports:** `apps/gurudevi-mobile/src`, `apps/gurudevi-mobile/app`, and native Android/iOS files contain **zero** direct imports from `react-native-screens` or `com.swmansion.rnscreens`. All screen primitives are consumed through `expo-router` (`Stack`, `Tabs`, `NativeTabs`) and `@swmansion/react-native-bottom-sheet` (for kit `Sheet`).

---

## 2. Stack Navigators & Access Boundaries

| Pattern | How It Works | Location |
| :--- | :--- | :--- |
| **Root 5-Zone Protected Stack** | `EntryStack` uses `expo-router`'s `<Stack>` with `<Stack.Protected guard={...} redirectTo={...}>` across 5 zones (always-open, public/auth, recovery, onboarding, admitted app). | [EntryShell.tsx](file:///c:/x/apps/gurudevi-mobile/src/entry/EntryShell.tsx#L276-L321) |
| **Composition-only Root Layout** | `_layout.tsx` configures `SplashScreen` + `Observe.configure` (`expo-router` integration) and renders `<EntryStartupBoundary />`. | [app/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/_layout.tsx#L1-L37) |
| **Self Nested Stack** | `<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>` with `unstable_settings = { anchor: 'index' }`. | [app/(tabs)/self/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/self/_layout.tsx#L11-L25) |
| **Workspace Nested Stack** | Same transparent-ground `<Stack>` with `anchor: 'index'`, plus per-screen `presentation: 'modal'` options for `demo-fee` and `workforce-role`. | [app/(tabs)/workspace/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx#L12-L37) |
| **Modal Group Stack** | `<Stack screenOptions={{ presentation: 'modal', headerShown: false }}>` for `(modal)/create-form`. | [app/(modal)/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(modal)/_layout.tsx#L6-L14) |

---

## 3. Tab Navigators (Dual Variant A / B)

| Pattern | How It Works | Location |
| :--- | :--- | :--- |
| **Variant A: JS Tabs + Kit Chrome** | `<Tabs>` from `expo-router/js-tabs` with custom `WorldHeader`, `ShellTabBar` (`docked` \| `floating` \| `rail`), `tabBarHideOnKeyboard: true`, `sceneStyle: { backgroundColor: 'transparent' }`, and `tabLongPress` catalog sheets. | [app/(tabs)/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/_layout.tsx#L543-L609), [ShellTabBar.tsx](file:///c:/x/apps/gurudevi-mobile/src/components/shell/ShellTabBar.tsx#L24-L76) |
| **Variant B: Native System Tabs** | `<NativeTabs>` from `expo-router/native-tabs` (`NativeShellTabs`) with `activityEnabled`, `minimizeBehavior`, `NativeTabs.Trigger.Icon` (`sf`/`md`), `Label`, and `Badge`. Used when `shellChoice.variant === 'native'` and `layout.tabs !== 'rail'`. | [NativeShellTabs.tsx](file:///c:/x/apps/gurudevi-mobile/src/components/navigation/NativeShellTabs.tsx#L41-L95) |
| **Shared Element Boundary** | `<SharedTransitionBoundary isActive={true}>` wraps the tabs shell for Reanimated 4.8+ cross-navigator transitions. | [app/(tabs)/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/_layout.tsx#L529) |

---

## 4. Sheets, Modals & Overlays

| Pattern | Implementation | Location |
| :--- | :--- | :--- |
| **Route-Level Form Sheet (`SHEET_SCREEN`)** | `NativeStackNavigationOptions` with `presentation: 'formSheet'`, `sheetAllowedDetents: [0.5, 1]`, `sheetGrabberVisible: true`, `sheetCornerRadius: 24` sourced from `NAVIGATION_POLICY.sheet`. | [sheetScreen.ts](file:///c:/x/apps/gurudevi-mobile/src/navigation/sheetScreen.ts#L10-L15), [navigationPolicy.ts](file:///c:/x/packages/core/src/flows/navigationPolicy.ts#L58) |
| **Kit `Sheet` Component** | Wraps `@swmansion/react-native-bottom-sheet` (`ModalBottomSheet`) for in-screen sheets (`YouSheet`, `WorldPicker`, `AssistantSheet`, `TabFeatureCatalogSheet`, `PerspectiveSwitcherSheet`). | [Sheet.tsx](file:///c:/x/packages/ui/src/components/native/Sheet/Sheet.tsx#L1-L105) |
| **Legacy Primitives `Modal`** | Gluestack/UI `Modal` used for `Breathing Reset` in `(tabs)/_layout.tsx` and `SchoolInviteCodeModal`. | [app/(tabs)/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/_layout.tsx#L713-L769) |
| **RN Core `Modal`** | `react-native` `Modal` used for `AppVersionGateOverlay`. | [AppVersionGateOverlay.tsx](file:///c:/x/apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx#L35-L65) |

---

## 5. Imperative, Flow & Deep-Link Navigation

| Pattern | How It Works | Location |
| :--- | :--- | :--- |
| **Checked Navigator (`useNavigator`)** | Wraps `expo-router`'s `useRouter()` with `checkInternalHref`, `withAnchor` on `push`, `prefetch` (`warm`), `dismissTo`, and Sentry/monitoring reporting on refusal. | [navigator.ts](file:///c:/x/packages/ui/src/components/native/navigation/navigator.ts#L36-L90) |
| **Declarative Redirect (`<GoTo>`)** | Validates `Destination` with `checkInternalHref` before rendering `<Redirect href={...} />`. | [GoTo.tsx](file:///c:/x/packages/ui/src/components/native/navigation/GoTo.tsx#L12-L25) |
| **Flow Navigator (`useFlowNavigator`)** | Resolves `FLOW_REGISTRY` steps + `SizeClass` (`compact` vs `regular`) via `NAVIGATION_POLICY` and dispatches through `useNavigator()`. | [useFlowNavigator.ts](file:///c:/x/apps/gurudevi-mobile/src/navigation/useFlowNavigator.ts#L26-L77) |
| **Deep Link Ingress (`+native-intent`)** | Classifies incoming URLs, validates internal routes via `checkInternalHref`, stashes pending intents, and fails closed to `/`. | [+native-intent.tsx](file:///c:/x/apps/gurudevi-mobile/app/+native-intent.tsx#L18-L79) |

---

## 6. Notable Gaps & Observations

1. **Panels (`NAVIGATION_POLICY.panels.mobile`) are `false`:** `sub_detail` on `regular` (tablet) falls back to `push` because no `Split` / `unstable-split-view` layout exists yet ([navigationPolicy.ts](file:///c:/x/packages/core/src/flows/navigationPolicy.ts#L36-L42)).
2. **`SHEET_SCREEN` is defined but unused:** `SHEET_SCREEN` in [sheetScreen.ts](file:///c:/x/apps/gurudevi-mobile/src/navigation/sheetScreen.ts) is not yet spread onto any `<Stack.Screen options={SHEET_SCREEN} />` route.
3. **No `ScrollViewMarker` or iOS 26 `scrollEdgeEffects`:** Scrollable screens under headers/tab bars do not yet use `ScrollViewMarker` for native edge effects or scroll-to-top coordination.
4. **Windows test path bug:** `anchors.test.ts` fails on Windows because `path.relative` yields `\` instead of `/` ([anchors.test.ts](file:///c:/x/apps/gurudevi-mobile/src/__tests__/navigation/anchors.test.ts#L24)).
