---
title: "React Native Gesture Handler v3 Evolution Analysis & Gurudevi Mobile Migration Plan"
status: "active"
created: 2026-07-17
updated: 2026-07-17
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, gesture-handler, migration, reanimated, planning]
---

# React Native Gesture Handler v3 Evolution Analysis & Gurudevi Mobile Migration Plan

This document provides a comprehensive analysis of the evolution of `react-native-gesture-handler` (RNGH) across the v2 minor releases (v2.0 to v2.31+) and the major v3.0 release. It details deprecations, new APIs, architectural shifts, and maps out a file-specific migration plan for `gurudevi-mobile` and its shared repository packages.

---

## 1. RNGH Architectural Evolution & Feature Matrix

The history of React Native Gesture Handler is marked by two massive paradigm shifts:
1. **v1 to v2.0**: The shift from component wrappers (`<PanGestureHandler>`) to a builder-based declarative API (`Gesture.Pan().onUpdate(...)` with `<GestureDetector>`).
2. **v2 to v3.0**: The shift from builder-based chaining to a React Compiler-compatible, hook-first configuration model (`usePanGesture({...})`).

### Feature & Paradigm Matrix

| Metric / Feature | RNGH v1.x (Legacy) | RNGH v2.x (Builder API) | RNGH v3.x (Hook-First API) |
| :--- | :--- | :--- | :--- |
| **Declaration Method** | Wrapped Components (e.g. `<PanGestureHandler>`) | Builder Chaining (e.g. `Gesture.Pan().minDistance(5)`) | React Hooks (e.g. `usePanGesture({ minDistance: 5 })`) |
| **Detector Component** | Each gesture has its own wrapper component | Unified `<GestureDetector gesture={composed}>` | Unified `<GestureDetector gesture={composed}>` |
| **New Architecture (Fabric)** | Poor / Emulated support | Native support (Fabric-ready) | Fabric-optimized, New Architecture first |
| **React Compiler / React 19** | Incompatible | Prone to bailing out / stale references | **Fully Compatible** (React Compiler ready) |
| **Web Hover Support** | None | Introduced in v2.2 via `Gesture.Hover()` | Supported via `useHoverGesture()` hook |
| **Manual State Management** | Ref-based state setting | Introduced in v2.3 via `Gesture.Manual()` | Supported via `useManualGesture()` hook |

---

## 2. Chronological v2.x Minor Release Evolution
Before migrating to v3, it is critical to understand the evolutionary additions introduced throughout the v2.x lifecycle that pave the way for v3 capabilities:

* **v2.0.0**: **GestureDetector & Gesture Builder Epoch.** Moved gesture configurations to the UI thread, resolving long-standing lag issues across the native bridge. Introduced `Gesture.Simultaneous`, `Gesture.Exclusive`, and `Gesture.Race` compositions.
* **v2.2.0**: **Hover Gesture Added.** Introduced `Gesture.Hover()` to capture trackpad and mouse movements on React Native Web and Desktop targets without clicking.
* **v2.3.0**: **Manual Gesture & StateManager.** Introduced `Gesture.Manual()` for custom gestures where default state machines fail. Developers manually trigger transitions using `GestureStateManager` (e.g., `stateManager.activate()`).
* **v2.10.0 - v2.20.0**: **New Architecture Stabilization.** Native bridge logic was rewritten to compile natively using TurboModules on both iOS and Android.
* **v2.21.0 - v2.31.0**: **ReanimatedSwipeable Introduction.** Deprecated the old, resource-heavy, and bridge-dependent `Swipeable` wrapper from `react-native-gesture-handler/Swipeable` in favor of `@react-native-gesture-handler/ReanimatedSwipeable` (or `react-native-gesture-handler/ReanimatedSwipeable` in newer versions). It utilizes native Reanimated shared values to achieve fluid 60/120FPS swipe-to-delete behaviors.

---

## 3. Major v3.0.0 Breaking Changes & Refactoring Rules

### A. The Hooks-First Paradigm
In RNGH v2, gestures were declared using builder objects which were often recreated or mutated on every render, causing unwanted layout recalculations or breaking React's dependency trees. RNGH v3 replaces this with specific Hooks that accept a static or reactive configuration object:

```javascript
// ❌ Old RNGH v2 Builder Pattern
const panGesture = Gesture.Pan()
  .minDistance(25)
  .onStart((e) => { ... })
  .onUpdate((e) => { ... })
  .onEnd((e) => { ... });

// ✅ New RNGH v3 Hook Pattern
import { usePanGesture } from 'react-native-gesture-handler';

const panGesture = usePanGesture({
  minDistance: 25,
  onActivate: (e) => { ... }, // Note: renamed from onStart
  onUpdate: (e) => { ... },
  onDeactivate: (e) => { ... }, // Note: renamed from onEnd
});
```

### B. Callback Renamings (State Transitions)
Callback names have been standardized to represent the actual native gesture state transitions:
* `onStart` $\rightarrow$ **`onActivate`** (fired when the gesture enters the `ACTIVE` state)
* `onEnd` $\rightarrow$ **`onDeactivate`** (fired when the gesture leaves the `ACTIVE` state)
* `onTouchesCancelled` $\rightarrow$ **`onTouchesCancel`**

### C. Deprecated / Removed APIs
* **`ForceTouchGesture` (Removed):** Deprecated due to hardware limitations on newer devices.
* **`onChange` (Removed):** The continuous modification callback has been combined into `onUpdate`.
* **Event `state` and `oldState` properties (Removed):** State monitoring is now handled natively; event objects no longer expose these legacy fields.
* **`PureNativeButton` & `createNativeWrapper` (Removed):** Component authors must use the new high-performance `<Touchable>` component.
* **Inverted Success Logic:** In v2, callbacks received a success parameter. In v3, this is replaced by checking `event.canceled`.

---

## 4. Gurudevi Mobile Target Migration Plan

Based on a workspace-wide codebase audit, four files implement gesture handling and must be refactored to RNGH v3 hooks.

### File 1: [DraggableCanvasSurface.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx)

* **Current Implementation:** Uses `Gesture.LongPress()` and `Gesture.Pan()` builder patterns.
* **Migration Actions:**
  1. Replace `Gesture.LongPress()` with `useLongPressGesture()`.
  2. Replace `Gesture.Pan()` with `usePanGesture()`.
  3. Rename `onStart` to `onActivate` inside the LongPress gesture.
  4. Rename `onEnd` to `onDeactivate` inside the Pan gesture.

```diff
- import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
+ import { GestureDetector, GestureHandlerRootView, useLongPressGesture, usePanGesture, Gesture } from 'react-native-gesture-handler';

-  const longPressGesture = Gesture.LongPress()
-    .minDuration(300)
-    .onStart(() => {
-      isDragging.value = true;
-      scale.value = withSpring(1.05);
-      zIndex.value = 100;
-      if (onDragStart) runOnJS(onDragStart)();
-    });
+  const longPressGesture = useLongPressGesture({
+    minDuration: 300,
+    onActivate: () => {
+      isDragging.value = true;
+      scale.value = withSpring(1.05);
+      zIndex.value = 100;
+      if (onDragStart) runOnJS(onDragStart)();
+    },
+  });

-  const dragGesture = Gesture.Pan()
-    .manualActivation(true)
-    .onUpdate((event: any) => {
-      if (!isDragging.value) return;
-      translateX.value = event.translationX;
-      translateY.value = event.translationY;
-    })
-    .onEnd(() => {
-      if (!isDragging.value) return;
-      if (onDragEnd) {
-        runOnJS(onDragEnd)(id, { x: translateX.value, y: translateY.value });
-      }
-      isDragging.value = false;
-      translateX.value = withSpring(0);
-      translateY.value = withSpring(0);
-      scale.value = withSpring(1);
-      zIndex.value = withTiming(1);
-    });
+  const dragGesture = usePanGesture({
+    manualActivation: true,
+    onUpdate: (event: any) => {
+      if (!isDragging.value) return;
+      translateX.value = event.translationX;
+      translateY.value = event.translationY;
+    },
+    onDeactivate: () => {
+      if (!isDragging.value) return;
+      if (onDragEnd) {
+        runOnJS(onDragEnd)(id, { x: translateX.value, y: translateY.value });
+      }
+      isDragging.value = false;
+      translateX.value = withSpring(0);
+      translateY.value = withSpring(0);
+      scale.value = withSpring(1);
+      zIndex.value = withTiming(1);
+    },
+  });
```

> [!NOTE]
> Composition functions like `Gesture.Simultaneous(...)`, `Gesture.Exclusive(...)`, and `Gesture.Race(...)` still receive the gesture objects returned from the hooks as parameters (e.g. `Gesture.Simultaneous(longPressGesture, dragGesture)` remains valid).

---

### File 2: [AstroView.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/visualization/AstroView.tsx)

* **Current Implementation:** Dynamically instantiates gestures inside a `useMemo` block using `Gesture.Pinch()` and `Gesture.Pan()`.
* **Migration Actions:**
  1. Move gesture declarations to top-level hooks (`usePinchGesture` and `usePanGesture`).
  2. Remove the surrounding `useMemo` wrapping gesture instantiations (hooks manage their own cache state).
  3. Rename `onEnd` callbacks to `onDeactivate`.

```diff
-  const combinedGesture = useMemo(() => {
-    const pinch = Gesture.Pinch()
-      .onUpdate((e: any) => {
-        scale.value = savedScale.value * e.scale;
-      })
-      .onEnd(() => {
-        savedScale.value = scale.value;
-      });
-
-    const pan = Gesture.Pan()
-      .onUpdate((e: any) => {
-        translateX.value = savedTranslateX.value + e.translationX;
-        translateY.value = savedTranslateY.value + e.translationY;
-      })
-      .onEnd(() => {
-        savedTranslateX.value = translateX.value;
-        savedTranslateY.value = translateY.value;
-      });
-
-    return Gesture.Simultaneous(pinch, pan);
-  }, [scale, savedScale, translateX, savedTranslateX, translateY, savedTranslateY]);
+  const pinch = usePinchGesture({
+    onUpdate: (e: any) => {
+      scale.value = savedScale.value * e.scale;
+    },
+    onDeactivate: () => {
+      savedScale.value = scale.value;
+    },
+  });
+
+  const pan = usePanGesture({
+    onUpdate: (e: any) => {
+      translateX.value = savedTranslateX.value + e.translationX;
+      translateY.value = savedTranslateY.value + e.translationY;
+    },
+    onDeactivate: () => {
+      savedTranslateX.value = translateX.value;
+      savedTranslateY.value = translateY.value;
+    },
+  });
+
+  const combinedGesture = Gesture.Simultaneous(pinch, pan);
```

---

### File 3: [AttendanceSheet.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/classroom/src/components/AttendanceSheet.tsx)

* **Current Implementation:** Uses `Swipeable` from `react-native-gesture-handler/ReanimatedSwipeable`.
* **Migration Actions:**
  1. Confirm import path correctness: ensure it points to `react-native-gesture-handler/ReanimatedSwipeable` (or matches package configuration).
  2. Test gesture interaction with FlashList container to ensure there are no scroll interference regressions.

---

### File 4: [MapScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/screens/MapScreen.tsx)

* **Current Implementation:** Utilizes `GestureHandlerRootView` around the outer viewport container, but doesn't define raw gestures directly (they are delegated inside `AstroView`).
* **Migration Actions:**
  1. Keep `GestureHandlerRootView` wrapper intact.
  2. No code refactoring is needed in this file; it serves as a layout shell.

---

## 5. Verification and Verification Commands

After completing the migration code changes:

### A. Type Checking
Run the workspace TypeScript compiler check:
```powershell
pnpm --filter gurudevi-mobile check-types
```

### B. Linting & Formatting
Ensure compliance with ESLint and Biome code rules:
```powershell
pnpm --filter gurudevi-mobile lint
```

### C. Build Validation
Run an Expo dry run to ensure there are no build-time configuration or asset packing failures:
```powershell
pnpm --filter gurudevi-mobile build:web
```
