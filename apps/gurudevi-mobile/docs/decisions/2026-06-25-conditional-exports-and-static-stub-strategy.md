---
title: "ADR 004: Conditional Exports and Static Stub Strategy for @repo/ui"
status: "active"
created: 2026-06-25
updated: 2026-06-25
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, shims, astro, vite]
---

# ADR 004: Conditional Exports and Static Stub Strategy for @repo/ui

## Context

Our monorepo features four Astro v7 web applications:
1. `apps/gurudevi-marketingWeb`
2. `apps/edlove-web`
3. `apps/intuitui-web`
4. `apps/neevsk-web`

These applications share UI components via `@repo/ui`. However, `@repo/ui` contains React Native components and imports mobile-native libraries (such as `react-native-reanimated`, `expo-modules-core`, `react-native-screens`, and `@shopify/react-native-skia`) that fail to resolve or execute in standard browser/SSR contexts without being shimmed.

Historically, this was managed using ad-hoc, inline configuration overrides and local shims within each individual application. This led to configuration drift, complex build overrides, and brittle module resolution structures.

## Decision

We have officially transitioned to a unified **Conditional Exports and Static Stub** strategy:

1. **Centralized Stubbing**: All mobile-native libraries are shimmed inside a single type-safe file in the UI library: [native-web-stub.ts](file:///C:/Users/Naween/projects/polymath-platform/packages/ui/src/shims/native-web-stub.ts).
2. **Dedicated Web Entry Point**: We introduced a clean web entry point for the shared component library: [index.web.ts](file:///C:/Users/Naween/projects/polymath-platform/packages/ui/src/index.web.ts) which cleanly exports only web-compatible components and proxies the necessary static stubs.
3. **Conditional Package Exports**: We updated the `@repo/ui` [package.json](file:///C:/Users/Naween/projects/polymath-platform/packages/ui/package.json) to declare platform-based entry points using package conditional exports, routing `"browser"` environments to the web entry point.
4. **Clean Slate Configurations**: We removed all inline shims and overrides from the individual applications' configurations, reverting them to their pristine vanilla state and resolving dependencies cleanly via package aliases pointing to the central `@repo/ui` shims.

---

## Centralized Stubs Design

The stubs in [native-web-stub.ts](file:///C:/Users/Naween/projects/polymath-platform/packages/ui/src/shims/native-web-stub.ts) cover the core APIs of the following libraries:

### 1. `react-native-reanimated`
*   Mocked hooks: `useSharedValue` (returns `{ value: initialValue }`), `useAnimatedStyle` (returns `{}`).
*   Mocked animations: `withTiming`, `withDelay`, `withSpring`, `withSequence`, `withRepeat`, `cancelAnimation`.
*   Layout animations: `FadeIn`, `FadeOut`, `FadeInDown`, `FadeInUp`, `SlideInDown`, `SlideInUp`, `SlideOutDown`, `SlideOutUp`, etc.
*   Components: `Animated` object with stubbed components (`View`, `Text`, `Image`, `ScrollView`).

### 2. `expo-modules-core`
*   Core classes: `EventEmitter`, `NativeModule`, `SharedObject`, `SharedRef`.
*   Errors: `UnavailabilityError`, `CodedError`.
*   Functions: `requireNativeModule`, `requireOptionalNativeModule`, `requireNativeViewManager`, `registerWebModule`, `reloadAppAsync`, `installOnUIRuntime`.
*   Globals: `Platform` (OS: 'web'), `NativeModulesProxy`, `DeviceEventEmitter`.

### 3. `react-native-screens`
*   Methods: `enableScreens`, `enableFreeze`, `screensEnabled`, `freezeEnabled`.
*   Views: `ScreenContainer`, `Screen`, `ScreenStack`, `ScreenStackHeaderConfig`, `ScreenStackHeaderSubset`.

### 4. `@shopify/react-native-skia`
*   Drawing Canvas and shape components exported as HTML `div` mock elements.

### 5. `react-native` Deep Subpaths
*   We resolved missing deep module references (e.g. `react-native/Libraries/Utilities/codegenNativeComponent`, `react-native/Libraries/ReactNative/AppContainer`) by aliasing them directly to our central `native-web-stub.ts`.
*   We created a wrapper [react-native-web-shim.ts](file:///C:/Users/Naween/projects/polymath-platform/packages/ui/src/shims/react-native-web-shim.ts) that merges standard `react-native-web` exports with missing utilities (such as `TurboModuleRegistry`) to allow third-party SVGs and native packages to compile on the web without crashing.

---

## Configuration Integration

All four applications share a unified alias structure mapped in their respective `astro.config.mjs` files:

```javascript
alias: {
  'react-native/Libraries/Utilities/codegenNativeComponent': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'react-native/Libraries/TurboModule/TurboModuleRegistry': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'react-native-reanimated': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'react-native-screens/experimental': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'react-native-screens': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'expo-modules-core': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  '@shopify/react-native-skia': fileURLToPath(new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url)),
  'react-native': fileURLToPath(new URL('../../packages/ui/src/shims/react-native-web-shim.ts', import.meta.url)),
}
```

---

## Build Outcomes

*   **`apps/edlove-web`**: **SUCCESS** (19 pages compiled)
*   **`apps/intuitui-web`**: **SUCCESS** (4 pages compiled)
*   **`apps/neevsk-web`**: **SUCCESS** (14 pages compiled)
*   **`apps/gurudevi-marketingWeb`**: **SUCCESS** (Astro/Vite compilation and static prerendering succeeded; Vercel packaging has minor Windows symlink permission restrictions which do not affect module exports).
