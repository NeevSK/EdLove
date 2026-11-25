---
title: "React Native Screens v5 — New & Existing Best Capabilities Code Patterns"
status: "active"
created: 2026-11-25
updated: 2026-11-25
author: "Naween"
scribe: "Antigravity"
tags: [react-native-screens, v5, capabilities, patterns, mobile]
---

# React Native Screens v5 — New & Existing Best Capabilities Code Patterns

Grounded directly in the installed `react-native-screens@5.0.0-beta.2` TypeScript definitions (`node_modules/react-native-screens/src`) and `expo-router@58.0.32`.

---

## 1. Architecture Overview in `5.0.0-beta.2`

`react-native-screens` v5 separates the new modular native API from v4 compatibility:

- **Top-level v5 namespaces & components:** `Stack` (`Stack.Host`, `Stack.Screen`, `Stack.HeaderConfig`), `Tabs` (`Tabs.Host`, `Tabs.Screen`), `Split` (`Split.Host`, `Split.Column`, `Split.Inspector`), `FormSheet`, `PageSheet`, `ContainedModalProvider`, `ContainedModalOverContent`, `ContainedModalReplacingContent`, `ScrollViewMarker`.
- **Experimental subpath (`react-native-screens/experimental`):** `SafeAreaView`, `ScrollToTopGuard`.
- **Legacy compatibility (`src/legacy`):** Re-exported at top level so `expo-router` / `@react-navigation/native-stack` continue working seamlessly during ecosystem transition.

---

## 2. New v5 Capabilities & Patterns

### A. `ContainedModalProvider` + `ContainedModalOverContent` / `ContainedModalReplacingContent` (iOS, `@experimental`)
Presents a native modal **confined to the bounds of a specific container** (e.g., a single `Split.Column`, a card, or a sub-pane) rather than covering the entire app window.

```tsx
import {
  ContainedModalProvider,
  ContainedModalOverContent,
} from 'react-native-screens';

function ColumnWithLocalModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  return (
    <ContainedModalProvider containerId="workspace-detail" style={{ flex: 1 }}>
      {/* Underlying column content stays mounted and visible underneath */}
      <DetailBody />

      <ContainedModalOverContent
        isOpen={isOpen}
        targetContainerId="workspace-detail"
        onDidDisappear={onDismiss}
        onPresentationRejected={() => {
          // Dropped if provider is already presenting or ancestor is dismissing
        }}
      >
        <ConfirmPanel />
      </ContainedModalOverContent>
    </ContainedModalProvider>
  );
}
```

### B. `Stack` v5 (`Stack.Host`, `Stack.Screen`, `Stack.HeaderConfig`)
Native stack with explicit `activityMode` (`'attached' | 'detached'`), `replaceAnimation` (`'push' | 'pop'`), and configurable Android/iOS transition presets (`StackScreenAnimation` with `fade_from_edge`, timed presets, custom bezier/easing).

```tsx
import { Stack } from 'react-native-screens';

<Stack.Host>
  <Stack.Screen
    screenKey="overview"
    activityMode="attached"
    animation="default"
  >
    <OverviewContent />
    {/* On Android, HeaderConfig must be the last child of Stack.Screen */}
    <Stack.HeaderConfig title="Workspace" hidden />
  </Stack.Screen>
</Stack.Host>
```
> **Note for Gurudevi:** Keep `expo-router`'s `<Stack>` in `_layout.tsx` files so `Stack.Protected`, typed routes, and `useNavigator()` remain the single routing authority; use `Stack` v5 primitives directly only if building an isolated native sub-stack.

### C. `Split` (`Split.Host`, `Split.Column`, `Split.Inspector`) (iOS, `@experimental`)
Native multi-column split view (`UISplitViewController`) with 2–3 `Split.Column`s plus an optional `Split.Inspector` (iOS >= 26). A `Stack.Host` placed as the direct sole child of a `Split.Column` integrates natively with that column's navigation bar.

```tsx
import { Split } from 'react-native-screens';

<Split.Host preferredDisplayMode="oneBesideSecondary" showInspector={inspectorOpen}>
  <Split.Column>
    <SidebarList />
  </Split.Column>
  <Split.Column>
    <DetailPane />
  </Split.Column>
  <Split.Inspector>
    <InspectorPane />
  </Split.Inspector>
</Split.Host>
```

### D. `FormSheet` & `PageSheet` Standalone Native Modals
Declarative native sheet components (`presentation` driven by `isOpen` boolean transitions) supporting `detents`, `preferredCornerRadius`, `largestUndimmedDetentIndex`, `initialDetentIndex`, and `backgroundEffect` (iOS system materials).

```tsx
import { FormSheet } from 'react-native-screens';

<FormSheet
  isOpen={open}
  detents={[0.5, 1.0]}
  preferredCornerRadius={24}
  onDetentChanged={(e) => console.log(e.nativeEvent)}
>
  <SheetBody />
</FormSheet>
```

### E. `ScrollViewMarker` & iOS 26 `scrollEdgeEffects`
Marks the direct child `ScrollView` so native headers, tab bars, and iOS 26 `UIScrollEdgeEffect` (`automatic` | `hard` | `soft` | `hidden` per edge) coordinate cleanly with scrolling content.

```tsx
import { ScrollViewMarker } from 'react-native-screens';

<ScrollViewMarker
  style={{ flex: 1 }}
  scrollEdgeEffects={{ top: 'soft', bottom: 'automatic' }}
>
  <ScrollView>{children}</ScrollView>
</ScrollViewMarker>
```

### F. `TabsBottomAccessory` (iOS)
Renders a native accessory view above or inline with the collapsed bottom tab bar (`environment`: `'regular' | 'inline'`, `onEnvironmentChange`), backed by `UITabAccessory` on iOS 26.1+.

### G. `ScrollToTopGuard` & `SafeAreaView` (`react-native-screens/experimental`)
- `ScrollToTopGuard` (iOS): prevents status-bar tap scroll-to-top from triggering on unintended nested scroll views.
- `SafeAreaView`: native safe-area container integrated with `react-native-screens` insets.

---

## 3. Existing Best Capabilities We Should Use Consistently

| Capability | Pattern | Why It Matters |
| :--- | :--- | :--- |
| **`NativeTabs` (`expo-router/native-tabs`)** | Already in [NativeShellTabs.tsx](file:///c:/x/apps/gurudevi-mobile/src/components/navigation/NativeShellTabs.tsx) | Native `UITabBar` / Material bottom bar with `activityEnabled` (pauses inactive tabs) and `minimizeBehavior="onScrollDown"`. Note: v5 drops `templateSource`/`xcasset` iOS icon types in favor of `imageSource` (`renderingMode`) and `sfSymbol` (already using `sf`/`md` via `NativeTabs.Trigger.Icon`). |
| **`SHEET_SCREEN` (`formSheet` route)** | [sheetScreen.ts](file:///c:/x/apps/gurudevi-mobile/src/navigation/sheetScreen.ts) | Route-backed native sheets for `NAVIGATION_POLICY.presentation.preview_confirm.compact` (`sheet`) so deep links and `useFlowNavigator().open(...)` land on real native form sheets. |
| **`Stack.Protected` + `anchor`** | [EntryShell.tsx](file:///c:/x/apps/gurudevi-mobile/src/entry/EntryShell.tsx), [self/_layout.tsx](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/self/_layout.tsx) | Enforces auth/onboarding admission at the native stack level and guarantees back-stack overview anchors on deep links (`withAnchor: true`). |
| **`featureFlags` (`react-native-screens`)** | `featureFlags.experiment.*` | In v5.0.0-beta.2, `synchronousScreenUpdatesEnabled`, `synchronousHeaderConfigUpdatesEnabled`, `iosOrientationInheritanceFixEnabled`, and `iosPreventReattachmentOfDismissedScreens` are **on by default**. Avoid overriding them unless diagnosing a specific regression; `featureFlags.stable.debugLogging` can be toggled in dev diagnostics. |
