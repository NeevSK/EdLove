---
name: reanimated-4
description: "Authoritative engineering playbook for React Native Reanimated 4.8+ and React Native Worklets 0.14+ on the React Native New Architecture. Grounded in Software Mansion's official 4.8.0 release (November 18, 2026). Covers default Shared Element Transitions (SET), SharedTransitionBoundary, direct SharedValue children in Animated.Text, withTargetValues layout overrides, CSS gradient transitions, scheduleOnRN/scheduleOnUI scheduling, and React Compiler .get()/.set() shared value safety. Trigger on: 'Reanimated', 'Reanimated 4', 'Reanimated 4.8', 'useSharedValue', 'useAnimatedStyle', 'SharedTransitionBoundary', 'sharedTransitionTag', 'Animated.Text', 'withTargetValues', 'withSpring', 'withTiming', 'scheduleOnRN', 'scheduleOnUI', 'layout animation', or any React Native animation task."
---

# Reanimated 4.8+ Comprehensive Architecture & Capabilities Atlas

> **DATED SUBSTRATE EVIDENCE & VERIFIED SPECIFICATION (2026-11-18)**  
> **Package Baseline:** `react-native-reanimated@4.8.0+` & `react-native-worklets@0.14.0+`  
> **Runtime Target:** React Native 0.88+ (Strict New Architecture / Fabric), React 19, TypeScript 5.8+  
> **Upstream Authority:** Software Mansion official releases and documentation (`docs.swmansion.com/react-native-reanimated`)

---

## 1. The Core Paradigm Shift: "CSS-First" Decision Tree

Reanimated 4 is fundamentally a **CSS-First** animation engine on native platforms. The architectural recommendation from Software Mansion is: **Default to declarative CSS transitions and CSS animations; reach for shared values and worklets only when math, continuous gesture tracking, or canvas rendering is required.**

```
Does the effect require per-pixel GPU computation (particles, fluid, noise, 3D)?
├── YES → Use GPU Shaders (react-native-wgpu + TypeGPU)
└── NO  → Does it animate >100 elements (Android) or >500 (iOS)?
    ├── YES → Use Reanimated + Skia Canvas (draw to single surface)
    └── NO  → Is it driven by state / props / interaction (not continuous pan/drag)?
        ├── YES → Simple A→B property change?
        │   ├── YES → Use CSS Transition (transitionProperty + transitionDuration)
        │   └── NO  → Multi-step keyframe sequence?
        │       ├── YES → Use CSS Animation (animationName + keyframes)
        │       └── NO  → Use CSS Transition with multiple properties
        └── NO  → Continuous gesture tracking (Pan, Pinch, Scroll) or layout reads?
            ├── Simple touch feedback (press, hover, focus)?
            │   └── YES → Use CSS Transition with Pseudo-Selectors (:active, :hover)
            └── Continuous per-frame tracking or physics math?
                └── YES → Use Shared Value Animation (useSharedValue + useAnimatedStyle)
```

---

## 2. Complete Capabilities Spectrum

### A. Declarative CSS Transitions & Animations
- **`transitionProperty` & `transitionDuration`**: High-performance native transitions running purely on the Fabric UI thread.
- **Timing Functions**: `'linear'`, `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`, plus `cubicBezier(x1, y1, x2, y2)` and `steps(n, 'jump-start')`.
- **Discrete Transitions (`transitionBehavior: 'allow-discrete'`)**: For non-interpolatable keywords like `display`, `flexDirection`, `justifyContent`, flipping at the midpoint.
- **CSS Keyframes (`animationName`)**: Multi-step choreography (`'0%'`, `'50%'`, `'100%'` or `from`/`to`) with `animationIterationCount: 'infinite'`, `animationFillMode: 'forwards'`.
- **CSS Lifecycle Callbacks (4.6.0+)**:
  - `onCSSTransitionRun`, `onCSSTransitionStart`, `onCSSTransitionEnd`, `onCSSTransitionCancel`
  - `onCSSAnimationStart`, `onCSSAnimationIteration`, `onCSSAnimationEnd`, `onCSSAnimationCancel`
- **CSS Gradients (4.8.0+)**: `backgroundImage` transitions with `linear-gradient(...)`.

### B. Zero-State CSS Pseudo-Selectors (4.5.0+)
Eliminates React `useState` and SharedValues for interaction feedback:
- **`:active`**: Matches the pressed element and ancestors.
- **`:active-deepest`**: Matches only the innermost pressed control, preventing parent cards from vibrating when a child button is clicked.
- **`:hover`**: Follows mouse, trackpad, stylus, and touch-down.
- **`:focus` & `:focus-within`**: Keyboard / D-pad / text input focus.

```tsx
<AnimatedPressable
  style={{
    backgroundColor: { default: '#f3f4f6', ':active': '#e5e7eb' },
    transform: { default: [{ scale: 1 }], ':active': [{ scale: 0.96 }] },
    transitionProperty: ['backgroundColor', 'transform'],
    transitionDuration: 120,
  }}
/>
```

### C. Shared Element Transitions (SET) - Default-On (4.8.0)
- **Direct View Transport**: Animates the live native view directly across screen boundaries, keeping active video streams, Skia canvas, and state intact.
- **`<SharedTransitionBoundary isActive={isFocused}>`**: Decouples transitions across native stacks, bottom tabs, modals, and sheets; renders `display: 'contents'`.
- **Customizations**: `SharedTransition.fadeContent()`, `SharedTransition.custom()`, `.progressAnimation()`, `.defaultTransitionType()`.

### D. UI-Thread Reactive Typography (`Animated.Text` - 4.8.0)
- Accepts direct SharedValue children: `<Animated.Text>{counterSharedVal}</Animated.Text>`.
- Updates text buffers on the Fabric UI thread without JS virtual DOM reconciliation or component re-renders.

### E. Entering & Exiting Layout Animations (4.8.0 Updates)
- **`.withTargetValues(...)` (4.8.0)**: Overrides final layout destinations (e.g. `FadeIn.duration(400).withTargetValues({ opacity: 0.85 })`).
- **`.withInitialValues(...)`**: Overrides initial entrance origins.
- **List Animations**: `Animated.FlatList` with `itemLayoutAnimation={LinearTransition}`.
- **`LayoutAnimationConfig`**: Scoped subtree skipping (`skipEntering`, `skipExiting`).

### F. Scroll-Driven & Event Hooks
- **`useScrollOffset`**: Declarative UI-thread scroll measurement without manual scroll handlers.
- **`scrollTo`**: Thread-safe UI-thread programmatic scrolling.
- **`useFrameCallback`**: 120 FPS game-loop callback passing `frameInfo.timeSincePreviousFrame` for physics.

### G. Multithreading & Worklets 0.14+ Architecture
- **Three-Runtime Topology**:
  1. **RN Runtime (JS Thread)**: React reconciler, navigation, application business logic.
  2. **UI Runtime (Main Thread)**: Animations, gestures, frame callbacks, Fabric shadow updates.
  3. **Worker Runtime (Background)**: Dedicated worker threads for heavy computation, parsing, data transformation.
- **Direct Thread Scheduling APIs**:
  - `scheduleOnRN(fn, ...args)`: Worklet to JS thread hop (**NEVER use `runOnJS`**).
  - `scheduleOnUI(worklet, ...args)`: JS to UI thread hop (**NEVER use `runOnUI`**).
  - `scheduleOnRuntime(runtime, fn, ...args)`: Offload to background worker.
  - `runOnUIAsync` / `runOnRuntimeAsync`: Promise-based execution across runtimes.
  - `runOnUISync` / `runOnRuntimeSync`: Synchronous blocking execution across runtimes.
- **Shared Memory**: `createSerializable` and `Synchronizable` for lockless or synchronized data sharing.
- **Worklets Bundle Mode**: Enables bundling full third-party npm libraries onto worklet worker runtimes.

### H. Skia & GPU Shader Integration
- **Skia Retained & Immediate Mode**: Bind Reanimated shared values directly to `@shopify/react-native-skia` elements.
- **TypeGPU / WebGPU (`react-native-wgpu`)**: GPU compute shaders (`@typegpu/noise`, `@typegpu/sdf`) driven by Reanimated for particle systems and high-density simulations.

---

## 3. Strict Dialect Veto & Architectural Invariants

| ❌ Instant Veto (Legacy Dialect) | ✅ Approved Pattern (Reanimated 4.8+) | Reason |
| :--- | :--- | :--- |
| `import { runOnJS } from 'react-native-reanimated'` | `import { scheduleOnRN } from 'react-native-worklets'` | `runOnJS` is completely removed in v4. |
| `import { runOnUI } from 'react-native-reanimated'` | `import { scheduleOnUI } from 'react-native-worklets'` | Re-exports are deprecated; import directly from `react-native-worklets`. |
| `sharedVal.value = 10` | `sharedVal.set(10)` | React 19 Compiler memoization & setter safety. |
| `const x = sharedVal.value` | `const x = sharedVal.get()` | React 19 Compiler getter safety. |
| `<PanGestureHandler>` | `<GestureDetector gesture={Gesture.Pan()}>` | RNGH 3.4+ declarative builder. |
| `useAnimatedGestureHandler` | `Gesture.Pan().onUpdate(...)` | Removed in modern RNGH. |
| `Layout` transition | `LinearTransition` | Generic `Layout` is deprecated. |
| React state for button press animations | CSS `:active` with `transitionProperty` | Eliminates JS re-render overhead. |
| React state for live counter text | `<Animated.Text>{sharedVal}</Animated.Text>` | Zero-rerender UI-thread text layout. |
| Manual snapshot clones for screen transitions | `<SharedTransitionBoundary isActive={...}>` | Stable native SET moves live view directly. |

---

## 4. Verification Gate

```powershell
# 1. Skill Doctor Integrity Audit
node scripts/skill-doctor.mjs --strict

# 2. Typecheck with UTF-8 Output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; pnpm --filter @repo/ui typecheck

# 3. Native Animation Tests
pnpm --filter @repo/ui test src/components/native/__tests__/reanimated48.test.tsx
```
