---
title: "Tailwind v4 and NativeWind v5 Primitives Modernization Plan"
status: "active"
created: "2026-08-23"
updated: "2026-08-23"
author: "Antigravity"
tags: [mobile, ui, primitives, tailwind-v4, nativewind-v5, styling]
---

# Tailwind v4 & NativeWind v5 Primitives Modernization Strategy (Phase 1 Focus)

## Background & Architecture Reference
Per [ADR: UI Facade and Styling Engine Decision](../decisions/2026-08-12-ui-facade-and-styling-engine-decision.md) and our stack analysis:
- We are running Tailwind CSS `4.3.0` + NativeWind `5.0.0-preview.4` (using `react-native-css` with `styled()` primitives).
- Our public UI facade is `@repo/ui/gluestack` pointing to local source-owned primitives in `packages/ui/src/components/ui/`.

---

## 1. Comprehensive Audit of Tailwind v4 / NativeWind v5 Patterns

### 1.1 Legacy & Anti-Patterns to Eliminate
1. **Broken Native Box-Shadow Rings**:
   - `input/index.tsx` uses `ring-2 ring-phase-accent/20`.
   - *Issue*: Tailwind `ring-*` generates CSS box-shadow which is unsupported on React Native views.
   - *Fix*: Standardize focus state using explicit border styles (`border-phase-accent`) and native-safe focus glow.
2. **Unstyled / Empty Primitives**:
   - `badge/index.tsx` declares `variant`, `size`, `action` props but is just a bare `<View className={className} />`.
   - *Fix*: Implement full variant maps and size classes matching the Sanctuary design system.
3. **Dynamic String Class Interpolation**:
   - `text/index.tsx` does `text-${size}` dynamically.
   - *Issue*: Tailwind v4 compiler cannot statically analyze dynamic template strings without a safelist.
   - *Fix*: Static lookup tables (`sizeMap: Record<string, string>`).
4. **Hardcoded Contrast Violations**:
   - `button/index.tsx` sets `ButtonText` solid to hardcoded `text-white` regardless of button background.
   - *Issue*: On Saffron (`#F6BF8C`), white text fails WCAG contrast (2.1:1).
   - *Fix*: Use computed `--phase-text-on-accent` token.
5. **Token Architecture Integration**:
   - Split `--phase-elevated` into `--phase-modal-card` (fully opaque) and `--phase-scrim` (overlay) across `global.css`, `tailwind.config.js`, and `CircadianProvider.tsx`.

---

## 2. Step-by-Step Modernization Execution Plan

### Step 1: Token Engine Bridge (`global.css` + `CircadianProvider.tsx`)
- Update `packages/ui/src/global.css` with CSS-first variable definitions.
- Update `CircadianProvider.tsx` to inject `--phase-modal-card`, `--phase-scrim`, and `--phase-modal-border`.
- Update `packages/ui/tailwind.config.js` and `apps/gurudevi-mobile/tailwind.config.js`.

### Step 2: Form & Control Primitives Modernization
- **`input/index.tsx` & `text-input/index.tsx`**: Remove `ring-*`, fix background contrast (`bg-phase-surface` / `bg-linen`), fix placeholder token.
- **`button/index.tsx`**: Update variant maps for Tailwind v4, dynamic high-contrast text color, active states.
- **`checkbox/index.tsx` & `radio/index.tsx`**: Ensure consistent active/focus border states and indicator colors.
- **`select/index.tsx`**: Clean up backdrop, trigger, and content surface tokens.

### Step 3: Feedback & Presentation Primitives Modernization
- **`badge/index.tsx`**: Build complete variant (`solid`, `outline`), action (`primary`, `secondary`, `success`, `warning`, `error`, `muted`), and size (`sm`, `md`, `lg`) implementations.
- **`modal/index.tsx` & `overlay/index.tsx`**: Upgrade to `--phase-modal-card` and `--phase-scrim`.
- **`actionsheet/index.tsx`**: Upgrade surface, drag indicator, and item active states.
- **`toast/index.tsx`**: Fix outline variant and token bindings.
- **`text/index.tsx` & `heading/`**: Eliminate dynamic class interpolation.
