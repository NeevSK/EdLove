---
title: "Fluid Responsive Web Architecture & Gateway Shell Implementation Plan"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Antigravity"
tags: [web, responsive, design-system, tailwind, ui]
---

# Fluid Responsive Web Architecture & Gateway Shell Implementation Plan

## Executive Summary & Rationales

The web screens in `@repo/ui` previously suffered from abrupt viewport threshold snapping, clipping on viewport resize, and inconsistent magic numbers (`width < 900`, `width < 1024`). While `packages/ui` maintained a design token system and reactive hooks (`useBreakpoint`, `canvasBreakpoints`), the web implementations of `WelcomeScreen`, `AuthScreen`, `OnboardingScreen`, and `NotificationsScreen` had fragmented into custom, one-off layouts with static paddings.

This document formalizes the multi-layered fluid responsive architecture, eliminating hardcoded binary breakpoint snapping in favor of continuous fluid typography and scaling (`clamp()`), container queries (`@container`), and a unified structural gateway shell (`GatewayScreenShell`).

---

## 1. Architectural Rationales

### 1.1 The Pitfalls of Binary Breakpoints in Split-View Web Apps
- **Clipping / Dead Zones**: Fixed paddings (e.g. `paddingHorizontal: 56`) paired with static headline sizes (`fontSize: 52`) cause right-side cards to be pushed off-screen or squished between 600px and 1024px.
- **Abrupt Jumps**: Single boolean switches (`isNarrow`) cause jarring layout jumps rather than fluid transitions.
- **Inaccurate Web Semantics**: Native device-detection hooks (`useResponsive()`) classify landscape viewports based on device aspect ratio thresholds rather than window widths, leading to unexpected behavior on web resize.

### 1.2 Multi-Layered Responsive Solution Strategy
1. **Continuous Fluid Layer (Layer 1 - CSS `clamp()` & Tokens)**:
   - Sizing, paddings, gaps, and headlines scale smoothly across any window width via CSS math without sudden jumps.
2. **Container Adaptability Layer (Layer 2 - CSS `@container` & Tailwind v4)**:
   - Cards and components evaluate their immediate parent container width rather than the root viewport width, enabling true component composability across split panes, modals, and drawers.
3. **Structural Layout Layer (Layer 3 - Reactive Hook `useGatewayLayout` & `GatewayScreenShell`)**:
   - React only switches fundamental DOM layout flows (side-by-side vs stacked columns) using the single source of truth (`canvasBreakpoints.tabletMin: 768`).

---

## 2. Technical Contracts & Implementation Breakdown

### 2.1 Clean-Up & Foundations (`packages/ui/src/components/layout.ts`)
- Remove dead / non-reactive `useBreakpointWeb()` (which read `window.innerWidth` once without resize listeners).
- Add web-specific reactive helper `useResponsiveWeb()` referencing `canvasBreakpoints` without native orientation coupling.

### 2.2 Shared Gateway Hook (`packages/ui/src/hooks/useGatewayLayout.ts`)
- Lightweight reactive hook reading window dimensions via React Native Web's reactive dimensions listener.
- Provides `isSplit` thresholded strictly at `canvasBreakpoints.tabletMin` (768px).

### 2.3 Shared Gateway Shell (`packages/ui/src/components/GatewayScreenShell.web.tsx`)
- Standardized web layout container managing `min-height: 100vh`, header (`GatewayHeader`), footer (`GatewayFooter`), fluid scroll container, and `@container` contextual split/stack flow.
- Integrates fluid CSS custom properties:
  - `--gateway-px: clamp(16px, 5vw, 56px)`
  - `--gateway-py: clamp(20px, 4vw, 48px)`
  - `--gateway-headline: clamp(28px, 5vw, 52px)`
  - `--gateway-card-max: min(480px, 100%)`

### 2.4 Screen Refactoring
1. **`WelcomeScreen.web.tsx`**:
   - Refactor to use `GatewayScreenShell` with `LeftPanel` and `RightPanel`.
   - Remove obsolete static `styles.twoCol`, `styles.narrowContent`, and ad-hoc dimension checks.
2. **`OnboardingScreen.web.tsx`**:
   - Refactor split / narrow switching to `useGatewayLayout`.
   - Update `ONBOARDING_STYLES` to use fluid container constraints and responsive `@media` fallbacks.
3. **`AuthScreen.web.tsx`**:
   - Remove dead `isNarrow` / unused imports.
   - Clean up grid container to respect fluid padding bounds.
4. **`NotificationsScreen.web.tsx`**:
   - Ensure content wrapper centers with fluid margin auto and responsive grid spacing.

---

## 3. Verification Strategy

1. **Type Checking**: Full monorepo TypeScript verification:
   ```powershell
   pnpm --filter @repo/ui run check-types
   ```
2. **Viewport Range Testing**:
   - Ultra-wide desktop (>= 1440px): spacious, properly capped content widths.
   - Standard desktop (1024px - 1439px): balanced two-column presentation.
   - Compact tablet (768px - 1023px): compact side-by-side with fluid padding reduction.
   - Phablet & mobile (< 768px): clean stacked view with centered auth/action cards.
