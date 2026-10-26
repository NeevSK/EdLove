# Exploration Ledger: `expo-adaptive-glass` & Hardware-Adaptive Visual Budgeting

**Date:** 2026-10-20  
**Status:** Ingested & Evaluated  
**Target Substrate:** Expo SDK 58 / React Native 0.88 / Fabric Architecture  
**Source URL:** [https://github.com/rbayuokt/expo-adaptive-glass](https://github.com/rbayuokt/expo-adaptive-glass)  
**Author / Maintainer:** `@rbayuokt` (R. Bayu Oktaryana)  
**Related Workspace Documents:**
- [`governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md)
- [`gurudevi-mascot-low-end-performance.md`](file:///c:/x/docs/engineering/runtime-performance/gurudevi-mascot-low-end-performance.md)
- [`intrinsic-code-efficiency-playbook.md`](file:///c:/x/docs/engineering/runtime-performance/intrinsic-code-efficiency-playbook.md)
- [`tools/expo-adaptive-glass.md`](file:///c:/x/docs/engineering/runtime-performance/tools/expo-adaptive-glass.md)

---

## 1. Context & Executive Summary

The user provided the repository `https://github.com/rbayuokt/expo-adaptive-glass`, an open-source Expo module that renders adaptive native liquid glass, acrylic, and frosted surfaces across iOS and Android.

Historically, glassmorphism and real-time backdrop blur have been the #1 cause of catastrophic frame drops on Android React Native apps. While iOS has native hardware-composited blur (`UIVisualEffectView` and public iOS 26 `UIGlassEffect`), Android's `RenderEffect` blurs a view's *own* node rather than the background, frequently causing frame rates on mid-range and low-end Android hardware to collapse from 60 FPS to 12–18 FPS.

`expo-adaptive-glass` solves this through an **Adaptive Quality Governor** that scores hardware capacity upfront, continuously monitors live frame metrics and thermal state, and sheds visual fidelity based on declared component priorities (`critical` down to `decorative`).

---

## 2. Deep Technical Breakdown: How It Works

### 2.1 Cross-Platform Graphics Pipeline Parity

| Layer / Platform | High-End Implementation | Mid-Range Implementation | Low-End / Fallback (`low` / `minimal`) |
| :--- | :--- | :--- | :--- |
| **iOS 26+** | Native `UIGlassEffect` + `UIGlassContainerEffect` | `UIVisualEffectView` materials | Static translucent view + Core Animation sheen |
| **Android 13+ (API 33+)** | Sibling `RenderNode` + AGSL `RuntimeShader` + `RenderEffect.createBlurEffect()` | Sibling `RenderNode` + plain `RenderEffect` blur | Static `acrylic` (semi-opaque fill + static hairline highlight) |
| **Android 12 (API 31–32)** | Sibling `RenderNode` + plain `RenderEffect` blur | Sibling `RenderNode` + plain `RenderEffect` blur | Static `acrylic` |
| **Android 11 & older / `isLowRamDevice()`** | Flat `acrylic` (zero live blur shaders) | Flat `acrylic` | Flat `acrylic` |
| **Web / Expo Go** | Translucent CSS / `View` fallback | Translucent CSS / `View` fallback | Translucent CSS / `View` fallback |

### 2.2 The Android Backdrop Compositing Problem Solved

On iOS, views can blur the underlying window canvas automatically. On Android, `android.graphics.RenderEffect.createBlurEffect()` blurs the target `View`'s own draw calls—meaning a card with blur will blur its own children (text, icons), not the wallpaper underneath!

`expo-adaptive-glass` introduces `<GlassBackdrop>`:
```tsx
<View style={{ flex: 1 }}>
  {/* The backdrop canvas captured once per frame */}
  <GlassBackdrop style={StyleSheet.absoluteFill}>
    <Image source={wallpaper} style={StyleSheet.absoluteFill} />
  </GlassBackdrop>

  {/* GlassSurface is a sibling in front of the backdrop */}
  <GlassSurface priority="high" style={styles.card}>
    <Text>Clear readable content on top</Text>
  </GlassSurface>
</View>
```
On Android, `GlassBackdrop` isolates the background into a dedicated `RenderNode`. Sibling `GlassSurface` instances read from that shared node and apply blur/refraction shaders *before* rendering their own children. On iOS, `GlassBackdrop` is a transparent no-op `View`, maintaining 100% unified JSX.

---

## 3. The 4 Non-Negotiable Invariants of Adaptive Visuals

Studying the architecture of `expo-adaptive-glass` reveals 4 foundational principles that directly validate and enrich our monorepo's [`governor-architecture-spec.md`](file:///c:/x/docs/engineering/runtime-performance/governor-architecture-spec.md):

### Invariant 1: The Scroll-Freeze Rule (Anti-Thrashing)
> *"While a list moves, allocations are frozen and re-planned only once it stops, so cards don't swap material mid-scroll."*

- **The Failure Mode:** If frame drops during scroll trigger an immediate downgrade from live blur to acrylic, the UI flashes violently as shaders toggle on and off while the user's thumb is down. The re-layout of toggling effects causes further frame drops, creating a fatal thrashing loop.
- **The Invariant:** All visual quality tiers are strictly locked during active gestures and list momentum. Frame drops are accumulated into a sliding window, and tier re-allocation executes only when velocity reaches 0.

### Invariant 2: Component-Level Priority Shedding
> Components declare an intrinsic importance: `critical` → `high` → `normal` → `low` → `decorative`.

- When the device encounters thermal throttling or sustained frame drops:
  1. `decorative` (background glow orbs, ambient ripples) shed to flat opacity first.
  2. `low` (card borders, secondary badges) shed next.
  3. `normal` (list items, cards) shed together so lists maintain visual uniformity.
  4. `critical` (floating navigation bar, active modal sheets) keep their glass the longest.

### Invariant 3: Pure TypeScript Policy + Native Sensor Decoupling
> *"Native code measures and draws. It never decides a tier. Every decision comes from the TypeScript policy, which is why the whole thing is testable without a device."*

- Native Android (`Window.OnFrameMetricsAvailableListener`, `PowerManager`, `onTrimMemory`) and iOS (`CADisplayLink`, `ProcessInfo`) emit raw telemetry into an event stream.
- The state machine lives entirely in pure TypeScript (`src/quality/`), decoupled from React and native modules.
- It is 100% unit-tested with Vitest/Jest, eliminating brittle device-only debugging for governor logic.

### Invariant 4: Fine-Grained Subscription via `useSyncExternalStore`
- The root `GlassProvider` calculates the budget.
- Individual surfaces subscribe using React 18/19 `useSyncExternalStore`.
- A surface **only re-renders** if its own specific allocated tier changes, completely avoiding whole-tree re-render cascades when global telemetry shifts.

---

## 4. Synthesis & Relevance to Polymath Monorepo

### 4.1 Comparison: Gurudevi Governor vs. `expo-adaptive-glass`

| Dimension | Gurudevi Platform (`@repo/core/verger`) | `expo-adaptive-glass` (`@rbayuokt`) |
| :--- | :--- | :--- |
| **Scope** | Whole-app runtime (Tutii mascot, lists, sync, telemetry, UI tokens) | Specialized UI surface rendering (glass, acrylic, lens) |
| **Native Shaders** | Tier 1 Skia (`react-native-skia`) & Reanimated 4 Worklets | Hand-rolled Swift Metal & Kotlin AGSL shaders |
| **Tier Definitions** | `High` (120fps/full physics), `Balanced` (60fps/simple), `Low` (30fps/static) | `auto`, `ultra`, `high`, `medium`, `low`, `minimal` |
| **Degradation Action** | Mascot physics $\rightarrow$ Lottie $\rightarrow$ static WebP; List overscan shed | Glass $\rightarrow$ AGSL $\rightarrow$ NativeBlur $\rightarrow$ Acrylic fill |

### 4.2 Monday October 26 Pilot Recommendation

1. **Do NOT install `@rbayuokt/expo-adaptive-glass` into `apps/gurudevi-mobile` before Monday:**
   - It introduces custom Swift/Kotlin native modules, which violates our pre-pilot stability freeze (risk of Gradle/NDK collision or ABI drift).
   - Our attendance pilot screens (e.g. `AttendanceScreen.tsx`) do not require liquid glass sheets.
2. **DO adopt its architectural invariants into `@repo/core/verger`:**
   - **Scroll-Freeze:** Enforce scroll-freeze inside `useDeviceGovernor` when adapting list overscan and Tutii mascot spring physics.
   - **Priority-Shed Contract:** Ensure our tokens allow UI elements to downgrade gracefully (e.g. transparent blur backdrop $\rightarrow$ solid token background `#1E293B`).
3. **Post-Pilot Roadmap (Wave 2 / Q4 2026):**
   - Evaluate `expo-adaptive-glass` for the Gurudevi Sanctuary Bottom Tab Bar (`GlassNavigationTabBar`) once baseline pilot validation is complete.
