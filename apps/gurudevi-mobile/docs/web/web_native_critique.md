---
title: "Package Topology & Web-Native Critique"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Package Topology & Web-Native Critique

This artifact analyzes the current distribution of packages across Mobile and Web and identifies opportunities for **"UX Vacations"**—areas where we can leverage superior web-native technology instead of settling for mobile-centric shims.

## 1. Current Dependency Distribution
The codebase is currently estimated at **82% Mobile-Centric** on the web.

| Layer | Primary Package (Current) | Category | Web Experience |
| :--- | :--- | :--- | :--- |
| **Logic/State** | `zustand`, `@supabase/js` | Common | ✅ High Fidelity |
| **Storage** | `expo-sqlite`, `react-native-mmkv` | Shimmed | ⚠️ Performance Bottleneck |
| **UI Framework**| `gluestack-ui`, `react-native-web` | Shimmed | ⚠️ "Stretched" Mobile UI |
| **Analytics** | `posthog-react-native` | Mobile-First | ⚠️ Missing Web Features |
| **Navigation** | `@react-navigation/native` | Mobile-First | ⚠️ History/URL friction |
| **Graphics** | `@shopify/react-native-skia` | Mobile-First | ❌ Heavy / Non-standard |

## 2. The "UX Vacation" Map (Refactor Opportunities)
To move from "functional web" to "premium web," we should target these specific areas for web-native replacements.

### A. Storage Architecture (Un-shimming)
- **Mobile**: `expo-sqlite` / `mmkv`
- **Web Vacation**: [IndexedDB / Dexie.js](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/api/database.web.ts)
- **Impact**: Sub-10ms searching on 10,000+ records.

### B. Interactive Visualizations
- **Mobile**: `react-native-svg` / `victory-native`
- **Web Vacation**: **D3.js** or **Three.js**
- **Impact**: Fluid, interactive knowledge maps that leverage GPU and pointer events (hover, zoom) which feel clunky when shimmed from mobile.

### C. Layout & Typography
- **Mobile**: Flexbox (RN)
- **Web Vacation**: **CSS Grid** & **Container Queries**
- **Impact**: True multi-column desktop layouts that respond to pane sizes rather than just window width.

### D. Component Primitives
- **Mobile**: `gluestack-ui` (React Native Based)
- **Web Vacation**: **Radix UI** or **Headless UI**
- **Impact**: Accessible, keyboard-navigable components that follow ARIA standards natively, rather than approximating them through accessibility props.

## 3. Implementation Strategy: "The 20% Impact"
We don't need to refactor 100%. We target the **20% of the UI** that defines the user's perception of "Quality."

1.  **Library Visualizer**: Swap shimmed SVG for **D3.js** on web.
2.  **Global Command Palette**: Replace RN-based search with a native React/Web implementation using **Kbar** or similar.
3.  **Local Database**: Already begun with **IndexedDB** in `@repo/library`.
4.  **Theming**: Shift from `Gluestack` tokens to **CSS Variables** in `SanctuaryGlobalStyles` for zero-runtime style shifts.

## 4. Structural Refactoring Pattern: "The Divergent View"
To break the 80/20 mobile-parity barrier, we must move away from "Single-File Universal Components" for complex items.

**The Current Pattern (Convergent)**:
`MyComponent.tsx` -> Uses Gluestack/RN -> Shimmed for Web.
*Result: "Stretched Mobile" feel.*

**The Proposed Pattern (Divergent)**:
1. `MyComponent.tsx`: Shared logic/hooks.
2. `MyComponent.native.tsx`: Gluestack/RN for high-performance mobile UI.
3. `MyComponent.web.tsx`: **Radix UI + Tailwind/Vanilla CSS** for desktop-first UX (Keyboard-first, Hover-aware).

### High-Priority Targets for Divergence:
- **Navigation Bar**: Mobile (Bottom Tab) vs. Web (Side Navigation / Command Palette).
- **Modals/Portals**: Mobile (Drawer/Sheet) vs. Web (Floating Centered / Context Menus).
- **Data Tables**: Mobile (FlashList) vs. Web (Grid with Virtualization + Multi-select).

## 5. Idealistic Web Audit: The "Aesthetic Decay" of Shims
As an idealistic web developer, the current "universal" approach has three major structural failures that go beyond simple package choices:

### A. The "FOUC" of JS-Theming (Flash of Unstyled Content)
- **Problem**: The theme is resolved in JS via `useTheme`. On web, this causes a "flash" of white before the sanctuary vellum or ink colors apply.
- **Ideal Fix**: **CSS Variables**. The theme must be injected as `:root` variables in `SanctuaryGlobalStyles.tsx`. Tailwind should then reference these `var(--color-accent)` tokens.

### B. The "Yoga" Constraint (Layout Performance)
- **Problem**: React Native relies on the Yoga engine (Flexbox). This ignores **CSS Grid**, **Aspect-Ratio**, and **Subgrid**, which are much more performant for complex dashboard layouts.
- **Ideal Fix**: Use **Tailwind Grid** primitives in `.web.tsx` files. Avoid `View` with `flex: 1` as a catch-all layout tool.

### C. The "App-ness" Barrier (PWA & SEO)
- **Problem**: The app feels like a "guest" in the browser. No Service Worker for offline usage (PWA), and no meaningful `<meta>` or OpenGraph tags injected per-route.
- **Ideal Fix**: Implement a **Workbox Service Worker** for the web app to cache the knowledge vault (IndexedDB sync + static assets), making it feel as robust as the mobile app.
