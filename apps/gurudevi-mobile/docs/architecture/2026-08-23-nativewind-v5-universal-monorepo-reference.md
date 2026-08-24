---
title: "NativeWind v5 & Tailwind v4 Monorepo and Universal Cross-Platform Architecture Reference"
status: "active"
created: "2026-08-23"
updated: "2026-08-23"
author: "Antigravity"
tags: [mobile, web, nativewind-v5, tailwind-v4, monorepo, universal, react-native, expo-57]
---

# NativeWind v5 & Tailwind v4 Monorepo & Universal Cross-Platform Reference

## 1. Core Architectural Engine in v5
NativeWind v5 is a fundamental rewrite designed for Tailwind CSS v4 and React Native 0.86+ (Expo SDK 57):
1. **Engine**: Driven by `react-native-css` using `styled()` rather than Babel-based JSX rewriting.
2. **Configuration**: CSS-first via `@theme` and `@import` rules inside `global.css`.
3. **Compilation Pipeline**: Integrated into Metro via `withNativewind(config)` in `metro.config.js`; `nativewind/babel` is completely eliminated.
4. **Theme Customization**: Transitioned from `vars()` (deprecated in v5) to `VariableContextProvider` and standard CSS variable polyfills via `var(--...)`.

---

## 2. Universal (Web vs. Native) Inconsistencies & Known Pitfalls

| Category | Native Behavior (iOS/Android) | Web Behavior (React Native Web) | Unified Solution / Rule |
|---|---|---|---|
| **Box-Shadow & Rings** | `ring-*` creates CSS multi-layered box-shadows which crash or fail silently on native views. | `ring-*` renders as standard CSS `box-shadow`. | **Never use `ring-*` in cross-platform primitives.** Use explicit `border-*` or focus borders with single-layer shadow tokens. |
| **Style Cascading & Text Colors** | `<View>` does **not** inherit or cascade text styles to nested `<Text>` elements. | Standard CSS inheritance allows text classes on `<div>`/`<View>` to cascade down. | **Always attach text styles directly to `<Text>` components** (e.g. `ButtonText`, `BadgeText`). |
| **Flex Direction Defaults** | React Native defaults to `flex-col`. | Browser defaults to `flex-row`. | **Always specify explicit flex direction** (`flex-col` or `flex-row`) on styled flex containers. |
| **`rem` vs `px` Scaling** | NativeWind converts `1rem` = `14px` (matching default RN Text). | Browser standard is `1rem` = `16px`. | Use explicit `px` / design token units in theme definitions to ensure 1:1 parity. |
| **Hover & Active States** | `:hover` has no effect on touch native; `:active` requires proper pressable integration. | `:hover` and `:active` trigger natively on mouse events. | Leverage **Reanimated 4.5 CSS Pseudoselectors** or standard `Pressable` state wrappers for unified press feedback. |
| **Blur Filters** | CSS `backdrop-filter: blur(...)` does not work on native `View`s without native blur views. | Supported natively by modern web browsers. | Use `UniversalModal.web.tsx` for web CSS backdrop-filter, and native `expo-glass-effect` / `BlurView` for mobile. |

---

## 3. Monorepo (`packages/ui` + `apps/gurudevi-mobile`) Rules

1. **Content Paths in Tailwind Configuration**:
   - `packages/ui/tailwind.config.js` and app config must explicitly include all consuming packages:
     ```js
     content: [
       './src/**/*.{js,jsx,ts,tsx}',
       '../../apps/gurudevi-mobile/src/**/*.{js,jsx,ts,tsx}',
       '../classroom/src/**/*.{js,jsx,ts,tsx}',
       '../library/src/**/*.{js,jsx,ts,tsx}',
       '../admin/src/**/*.{js,jsx,ts,tsx}',
     ]
     ```
2. **CSS Entrypoint SSOT**:
   - `packages/ui/src/global.css` is the single source of truth for `@import` and `@theme` declarations.
   - Consumed at app entrypoint (`apps/gurudevi-mobile/index.ts` and `app/_layout.tsx`) via `import '@repo/ui/global.css';`.
3. **LightningCSS & Metro Pinning**:
   - Monorepo package resolution relies on `resolver.unstable_enablePackageExports = true`.
   - NativeWind v5 transforms are managed once in the app's Metro configuration.

---

## 4. Modern Primitive Implementation Checklist

- [ ] Wrap native components using `styled(RNComponent)`.
- [ ] For components taking container style props (e.g. `ScrollView`, `FlatList`), declare `contentContainerClassName: 'contentContainerStyle'`.
- [ ] Do not use dynamic template literal classes (`text-${size}`). Use static dictionary maps.
- [ ] Use explicit border and background variables (`bg-[var(--phase-modal-card)]`, `border-phase-interactive/20`).
- [ ] Ensure all action buttons and badges compute contrast with `getTextOnBackground` or `--phase-text-on-accent`.
