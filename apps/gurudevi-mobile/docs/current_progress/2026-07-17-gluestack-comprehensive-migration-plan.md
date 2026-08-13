---
title: "Gluestack UI Evolution Analysis & Gurudevi Mobile Migration Plan"
status: "superseded"
created: 2026-07-17
updated: 2026-08-11
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, gluestack, nativewind, migration, planning]
superseded_by: "../infra/2026-08-11-gluestack-v5-stack-audit.md"
---

> Superseded by [Gluestack UI v5 and NativeWind v5 Stack Audit](../infra/2026-08-11-gluestack-v5-stack-audit.md), which keeps the useful historical plan context but updates its claims against the current source tree and upstream documentation.

# Gluestack UI Evolution Analysis & Gurudevi Mobile Migration Plan

This document provides a comprehensive comparative analysis of the Gluestack UI versions (v2, v3, and v5), details what changed, why and how the styling subsystems evolved, and outlines a concrete migration plan tailored for the `gurudevi-mobile` application and the `@repo/ui` workspace package.

---

## 1. Gluestack UI Evolution Matrix (v1 to v5)

| Metric / Feature | Gluestack UI v1 | Gluestack UI v2 & v3 | Gluestack UI v5 (Latest) |
| :--- | :--- | :--- | :--- |
| **Primary Styling Engine** | `@gluestack-style/react` (Runtime JS engine) | NativeWind v4 (Tailwind CSS v3 compiler wrapper) | NativeWind v5 (Tailwind CSS v4 CSS-first compiler) |
| **Component Delivery** | Monolithic npm package (`@gluestack-ui/themed`) | Copy-pastable modular components (shadcn-like CLI) | Hardened, unified native components |
| **Styling Paradigm** | Styled components & Inline Utility props (e.g., `px="$4"`) | Tailwind ClassNames (`className="px-4"`) | CSS Variables Theme-First ClassNames |
| **Evaluation Overhead** | High (Heavy runtime Javascript calculation) | Moderate (Build-time class mappings + runtime styles) | Minimal (Pure native CSS Custom Properties, no JS runtime) |
| **Next.js Support** | Fully Supported | Supported (via custom Turbopack configuration) | **Not Supported** (Dropped in favor of native-first rendering) |
| **React & RN Stack** | React 18, React Native <= 0.84 | React 18, React Native <= 0.85 | React 19.2+, React Native 0.86+, Expo SDK 57+ |

---

## 2. Comprehensive Version Changelog Analysis

### A. Gluestack UI v2 (The Tailwind Paradigm Shift)
* **What Changed:** Transitioned from a proprietary CSS-in-JS style engine (`@gluestack-style/react`) to a NativeWind / Tailwind CSS-driven model.
* **Why:** The runtime JS styling engine incurred a heavy performance cost (especially on low-end Android devices) due to style calculations and layout recalculations on the main thread.
* **How:** Introduced the `@gluestack-ui/themed` to Tailwind conversion layer. Instead of consuming a bundled monolith, users initialized components into their local code structure via the `gluestack-ui init` CLI.
* **Deprecations:** 
  * Descendant styling constraints (`_text`, `_icon` nesting helpers).
  * Direct utility style props (e.g., `bg="$backgroundDark900"` replaced by `className="bg-background-900"`).
  * Runtime theme providers/configs (`gluestack-ui.config.ts` replaced by `tailwind.config.js`).

### B. Gluestack UI v3 (Performance & ARIA Harmonization)
* **What Changed:** Internal architecture refactoring under a "Source-to-Destination" structure. Reduced static bundle size, stabilized RSC (React Server Components) support, and optimized Next.js Turbopack pipelines.
* **Why:** V2 projects still suffered from dual-version fragmentation and dependency bloat between `react-native-aria` and core layout elements.
* **How:** ARIA utilities were directly integrated into `@gluestack-ui/core`. Export targets were structured under `@gluestack-ui/core` and `@gluestack-ui/utils`.
* **Deprecations:** Export footprints of raw package dependencies were narrowed down to reduce bundle footprint on initial page loads.

### C. Gluestack UI v5 (CSS-First & Zero-JS Styling)
* **What Changed:** Alignment with React 19.2 and NativeWind v5 (Tailwind CSS v4). Adopted a pure CSS variables approach to styling native elements.
* **Why:** In previous iterations, React Native styling still relied on generating stylesheet objects at runtime. Tailwind v4/NativeWind v5 bypasses JavaScript runtime evaluation by compiling directly to platform-native CSS engines.
* **How:** 
  * Replaced `cssInterop` configuration helpers with NativeWind's unified `styled()` function wrapper.
  * Consolidates configuration into the global stylesheet `@theme` directive instead of JavaScript configuration files (`tailwind.config.js`).
* **Deprecations & Breaking Changes:**
  * Next.js support was officially dropped to concentrate developer resources on native Expo/React Native platforms.
  * Direct exports of `cssInterop` from the `'nativewind'` entry point were removed (moved to `react-native-css-interop`).

---

## 3. Gurudevi Mobile Specific Migration Plan

The dependency stack in `@repo/ui` has already been upgraded to Gluestack UI v5 (`5.0.3`) and Tailwind v4 (`4.3.0`). However, the components and styling subsystems are in a hybrid state (containing legacy stubs and v2-style `cssInterop` setups). The following steps must be completed to clean up the workspace:

### Task A: Purge Legacy Code Subsystems
Delete the unused compatibility wrappers that are no longer part of the canonical build path:
1. Delete the entire directory [components-legacy](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components-legacy/).
2. Delete the entire directory [gluestack-legacy](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/gluestack-legacy/).
3. Remove the legacy imports/references from the `@repo/ui` ESLint configurations in [eslint.config.mjs](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/eslint.config.mjs).

### Task B: Refactor Components from `cssInterop` to `styled()`
Systematically migrate all 38 custom components under `@repo/ui/src/components/ui/` to eliminate imports from `'react-native-css-interop'`.
* **Before (Deprecated wrapper pattern):**
  ```typescript
  import { cssInterop } from 'react-native-css-interop';
  import { View } from 'react-native';
  cssInterop(View, { className: 'style' });
  export const Box = View;
  ```
* **After (NativeWind v5 canonical pattern):**
  ```typescript
  import { styled } from 'nativewind';
  import { View } from 'react-native';
  export const Box = styled(View);
  ```

### Task C: Transition `tailwind.config.js` to Global CSS `@theme` Variables
Move token configurations out of JavaScript-based config files and place them in the global CSS theme namespace.
1. Locate [global.css](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/global.css).
2. Refactor colors and radius values into Tailwind CSS v4 variables:
   ```css
   @import "tailwindcss";

   @theme {
     --color-gurudevi-teal: #7DD4C0;
     --color-sage-green: #8BBF7A;
     --color-warm-amber: #DDA15E;
     --radius-lg: 16px;
   }
   ```
3. Remove or prune legacy `tailwind.config.js` objects to avoid double compilation paths.

### Task D: Prune Outdated Types & Readme Files
1. Update [README.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/ui/README.md) to remove any outdated references advising imports from `@gluestack-ui/themed` or deep paths under `node_modules`.
2. Delete or prune outdated typescript declaration files: [gluestack-ui.d.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/types/gluestack-ui.d.ts).

---

## 4. Verification & Validation Protocol

After executing the plan, the codebase must be validated using the local test engines:
1. **TypeScript Build Validation:**
   ```powershell
   pnpm exec tsc --build --noEmit
   ```
2. **Lint & Formatting Validation:**
   ```powershell
   pnpm run lint
   ```
3. **Application Build Test:** Ensure the Metro packager compiles without syntax errors:
   ```powershell
   pnpm --filter gurudevi-mobile exec expo export
   ```
