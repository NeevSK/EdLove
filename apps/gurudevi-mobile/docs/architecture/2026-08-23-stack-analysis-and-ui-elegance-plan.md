---
title: "Stack Analysis and UI Elegance Implementation Plan"
status: "active"
created: "2026-08-23"
updated: "2026-08-23"
author: "Antigravity"
tags: [mobile, ui, elevation, animations, reanimated, haptics, styling]
---

# Stack Analysis & UI Elegance Implementation Plan (Phase 2 Focus)

## Stack Reality Check

Before writing a single line, we need to understand exactly what each library gives us today — and what we're underusing.

---

## Your Stack, Fully Mapped

| Library | Version | What it gives us for this task |
|---|---|---|
| **Tailwind CSS** | `4.3.0` | CSS Variables first-class. No `theme.extend` needed. `@property` cascade support. |
| **NativeWind** | `5.0.0-preview.4` | CSS-interop bridge — maps Tailwind classes → RN StyleSheet. `var()` works cross-platform via `vars()` from nativewind. |
| **Reanimated** | `4.5.0` | **CSS Animations API** (`.animationName`, `.animationDuration`). `:hover`, `:active`, `:focus` pseudoselectors (v4.5). `withSpring`, `FadeIn/Out`, `SlideInDown/Out`. Cross-platform. |
| **RNGH** | `3.0.2` | Hook-based gesture API. `Touchable` component (new). On v3 but some parts still use deprecated v2 builder patterns. |
| **rn-ease** | `^0.7.3` | Spring-physics scale/translate transitions. Currently used only in `SanctuaryCard`. |
| **expo-blur** | `~57.0.2` | `BlurView` with `tint` and `intensity`. `tint="systemMaterialDark"` is more OS-native. |
| **expo-glass-effect** | `~57.0.1` | **Underused.** Native iOS/Android frosted glass via system APIs — better perf than `expo-blur` for modals. |
| **expo-haptics** | `~57.0.1` | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` — missing from button interactions. |
| **React 19** | `19.2.3` | `use()`, Suspense, concurrent mode. Not directly relevant here. |
| **TypeScript** | `7.0.2` | Strictest types, `satisfies`, `infer extends`. |

---

## Critical Stack Findings That Change the Plan

### 1. Reanimated v4.5 — CSS Pseudoselectors Are Available NOW

`v4.5` gave us `:hover`, `:active`, `:focus` pseudoselectors for native. This is huge for button and interactive element feedback:

```tsx
// Reanimated 4.5 — works on native AND web
<Animated.View style={{
  backgroundColor: '#F6BF8C',
  ':active': { transform: [{ scale: 0.97 }], opacity: 0.85 },
  ':hover': { transform: [{ scale: 1.01 }] }, // web only, no-op on native
}} />
```

This replaces the `onPressIn`/`onPressOut` `useState` dance in `SanctuaryCard` entirely.

**CSS Animations API**: We can drive modal entrance animations with:
```tsx
<Animated.View style={{
  animationName: 'modal-enter',
  animationDuration: '200ms',
  animationTimingFunction: 'cubic-bezier(0.33, 1, 0.42, 0)',
}} />
```

### 2. `expo-glass-effect` for Native Backdrops

`expo-glass-effect ~57.0.1` uses `UIVisualEffectView` on iOS and `RenderScript` blur on Android — significantly better performance than `BlurView` for full-modal backdrops.

### 3. `expo-haptics` for Button Interactions

Every `Button` press and modal confirm/dismiss gets a subtle haptic feedback scaled by intent (`Light` for secondary, `Medium` for primary, `Warning` for negative).

---

## Revised Architecture — Stack-Aware

### Token Layer (Updated)

```
tokens.ts                  → Static fallbacks + new modalCard + scrim tokens
Theme.ts (phaseMatrix)     → Add modalCard per phase (fully opaque surface)
tailwind.config.js         → Add phase-modal-card, phase-scrim color keys  
CircadianProvider.tsx      → Inject --phase-modal-card + --phase-scrim vars
```

---

## Component-by-Component Changes

### Phase 2: Overlay/Backdrop — Stack-Optimised
- **Native:** Replace `BlurView` with `expo-glass-effect` `GlassView` for modal backdrops.
- Scrim fill: `tokens.colors.scrim` (`rgba(26, 22, 16, 0.82)`).
- **Web:** Backdrop: `rgba(26, 22, 16, 0.82)` + `blur(6px)`.

### Phase 3: Modal / Dialog — Reanimated CSS API for Entrance
- Card bg: `bg-phase-modal-card` (fully opaque).
- Shadow: multi-layer `modalShadow` token (`0 24px 48px -12px rgba(26,22,16,0.40)`).
- Entrance animation: Reanimated 4.5 CSS Animations API with `easing.decelerate` from `motion.ts`.
- Top rim border: `border-t-2 border-white/20` (light) / `border-t border-white/12` (dark).

### Phase 4: Actionsheet & Select
- `ActionsheetContent` bg: `bg-phase-modal-card`.
- Top rim: `border-t-2 border-white/20`.
- Drag indicator: `bg-phase-text-primary/25`.

### Phase 5: Button — Reanimated 4.5 `:active` + Haptics
- Reanimated 4.5 CSS `:active` pseudoselectors.
- `expo-haptics` call in `onPress`.
- Solid primary text: `text-phase-text-on-accent` (computed, not hardcoded white).
- Solid secondary bg: `bg-linen` (full opacity).

### Phase 6: Input — Context-Aware Background
- Default bg: `bg-linen` (`#E8E2CF` or `bg-phase-surface`).
- Placeholder: `tokens.colors.textMuted` (`#72695E`).
- Focus: Saffron border + native-safe shadow glow.

### Phase 7: Toast — Entrance Animation + Fix Outline
- Wrap in `Animated.View` with `FadeInUp.duration(duration.micro)` (150ms from `motion.ts`).
- Apply `toastShadow` token.

### Phase 8: Badge — Implement Styles
- Implement `variant`, `action`, `size` props with canonical Sanctuary palette.

### Phase 9: Card — Press via Reanimated + Fix Border
- Border: `border-phase-interactive/15` (was invisible `border-white/5`).
- Replace `rn-ease` spring scale with Reanimated 4.5 `:active` scale (`scale: 0.98` on press).
- Fix elevated shadow to Shadow Violet.
