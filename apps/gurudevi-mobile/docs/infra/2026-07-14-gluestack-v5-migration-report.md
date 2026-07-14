---
title: "Gluestack UI v5 and Styling Subsystem Migration Report"
status: "active"
created: 2026-07-14
updated: 2026-07-14
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, gluestack, ui, styling, migration]
---

# Gluestack UI v5 and Styling Subsystem Migration Report

This document reports on the structural changes, immediate workarounds, and long-term migration vectors introduced by upgrading the workspace UI primitives to **Gluestack UI v5** and **NativeWind v5 / Tailwind CSS v4** styling engine.

---

## 1. What We Did
* **Upgraded dependencies:** Bumped `gluestack-ui` to version `5.0.3` inside [@repo/ui package.json](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/package.json) dev/peer lists, fully aligning with React 19.2, React Native 0.86, and Expo SDK 57.0.4 parameters.
* **Workspace alignment:** Enforced overrides in [pnpm-workspace.yaml](file:///c:/Users/Naween/projects/polymath-platform/pnpm-workspace.yaml) for `@expo/ui` and `expo-router` to collapse dual-version fragmentation of components between SDK 56 and SDK 57.

---

## 2. Structural Changes in Gluestack v5 & NativeWind v5
* **CSS-First Architecture:** Gluestack v5 operates entirely on NativeWind v5 (Tailwind CSS v4). It moves away from JavaScript-driven runtime styling configurations in favor of native CSS custom properties.
* **API Deprecations & Removals:** 
  * The `cssInterop` utility is deprecated.
  * The export for `cssInterop` has been **completely removed** from the main `'nativewind'` entry point.
  * NativeWind v5 delegates interop capabilities to its peer package `react-native-css-interop` (renamed to `react-native-css` in downstream specs, but exported with compatibility layers).

---

## 3. How We Handled Immediate Compile Failures
* **Dependency registration:** Added `"react-native-css-interop": "0.1.22"` explicitly to the dependencies block of `@repo/ui` to make type definitions accessible.
* **Imports redirection:** Patched all 38 custom components in [@repo/ui/src/components/ui/](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/ui/) to import `cssInterop` directly from `'react-native-css-interop'` instead of `'nativewind'`.
* **Typing resolution:** Verified typescript compilation checks pass cleanly across all projects:
  ```powershell
  pnpm exec tsc --build --noEmit
  ```

---

## 4. Remaining Long-Term Actions
To remove deprecated bridging layers and fully embrace the native Tailwind v4 performance characteristics, the following actions must be taken:

### A. Migrate from `cssInterop` to `styled()`
The deprecated `cssInterop` wrapper pattern should be systematically refactored to use NativeWind's new unified `styled()` function wrapper:
```typescript
// Replace this:
import { cssInterop } from 'react-native-css-interop';
cssInterop(ThirdPartyComponent, { className: 'style' });
export const MyComponent = ThirdPartyComponent;

// With this:
import { styled } from 'nativewind';
export const MyComponent = styled(ThirdPartyComponent);
```

### B. Migrate `tailwind.config.js` to CSS-First Variables
While your existing `tailwind.config.js` theme options are parsed through Tailwind's compatibility layer, you should eventually move custom variables into `@theme` blocks inside your global CSS file:
```css
@theme {
  --color-gurudevi-blue: #7DD4C0;
  --color-sage-green: #8BBF7A;
  --radius-comfortable: 16px;
  --spacing-lg: 24px;
}
```
This migration bypasses runtime JavaScript evaluation overhead, resulting in faster initial mount times on native layout screens.
