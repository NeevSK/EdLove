# State Discipline, Form Engine Audit, and Component Strategy — Gurudevi Platform

> **Repo Location**: [`docs/architecture/state-and-component-strategy.md`](file:///c:/x/docs/architecture/state-and-component-strategy.md)
> **Purpose**: Definitive governance for State Management boundaries, Native Context Menus (`zeego`), Form Engine audit (`@tanstack/react-form`), Toast system analysis (`SanctuaryToast`), and Tier 1 single-package recommendations.

---

## 1. State Discipline & Boundary Architecture

To prevent architectural entropy across `@repo/core`, `@repo/ui`, and `apps/gurudevi-mobile`, state is strictly scoped into 3 non-overlapping tiers:

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: GLOBAL APP STATE (Zustand)                              │
│ • User Session / Auth Tokens                                    │
│ • Global Theme & Locale Settings                                │
│ • App-Wide Feature Flags & Network Connectivity                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: LOCAL HIGH-FREQUENCY REACTIVITY (Legend State)           │
│ • Virtualized List Subscriptions (@legendapp/list)             │
│ • Real-time counters, touch coordinates & gesture states        │
│ • Fine-grained item toggles (Zero re-renders on parent screen)  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ TIER 3: COMPONENT ISOLATED STATE (React useState / useReducer)   │
│ • Modal / Sheet open/close toggles                              │
│ • Micro UI interaction states (Hover, Focus)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Native Context Menus — `zeego` Strategy

* **The Question**: Should we import `zeego` from npm or fork it into our repo (`@repo/ui`)?
* **Analysis**: `zeego` relies on native iOS (`UIContextMenuConfiguration`) and Android (`PopupMenu`) bridges. It hasn't had frequent breaking releases recently because native OS context menu APIs are highly stable.
* **Verdict**: **Fork & Vendor into `@repo/ui`**.
  - **Why**: Importing un-maintained third-party native wrappers directly creates friction during Expo SDK upgrades (Expo 57+). 
  - Vendors `zeego` primitives directly under `@repo/ui/src/native-menu` so we have full control over native iOS/Android bridge updates and custom styling matching our Gurudevi design system tokens.

---

## 3. Form Engine Audit — `@tanstack/react-form`

* **Audit Finding**: Inspection of [`packages/form-builder/package.json`](file:///c:/x/packages/form-builder/package.json#L35) reveals that we **DO NOT use React Hook Form**. We explicitly standardized on **`@tanstack/react-form`** (`^0.20.0`) alongside `@intuitui-labs/form-builder-engine`!
* **Architectural Justification**:
  - We standardized on `@tanstack/react-form` because it is **framework-agnostic, headless, and strictly typed** with direct Zod integration (`@tanstack/zod-form-adapter`).
  - It handles field-level async validation, dynamic field arrays, and cross-field dependencies without requiring un-controlled DOM mutations.
* **Verdict**: **RETAIN `@tanstack/react-form`**. Do NOT introduce React Hook Form. Strengthen `@repo/form-builder`'s existing `@tanstack/react-form` bindings.

---

## 4. Toast System Audit — `SanctuaryToast`

* **Audit Finding**: Inspection of [`packages/ui/src/components/SanctuaryToast.tsx`](file:///c:/x/packages/ui/src/components/SanctuaryToast.tsx) shows we already have a **custom, highly-refined toast implementation**:
  - Built with `react-native-reanimated` (`withSpring`, `withTiming`).
  - Supports safe area insets via `SafeAreaInsetsContext`.
  - Fully accessible with `useAccessibility` and `isReduceMotionEnabled` support.
  - Native worklets integration via `runOnJS`.
* **Verdict**: **KEEP `SanctuaryToast`**. Do NOT replace with `sonner-native`.
* **Refinement Plan**: Upgrade `SanctuaryToast` to support a stacked queue mechanism (allowing multiple toasts to stack vertically with depth-scaling) while preserving our existing Sanctuary design tokens.

---

## 5. Additional Single-Package Recommendations (Tier 1 Audit)

With `zeego` (vendored), `@tanstack/react-form` (retained), and `SanctuaryToast` (retained), here are the remaining high-value single-package tools to import:

### A. `react-native-redash` (William Candillon)
* **npm**: [react-native-redash](https://www.npmjs.com/package/react-native-redash) | **GitHub**: [wcandillon/react-native-redash](https://github.com/wcandillon/react-native-redash)
* **Purpose**: Helper math functions for Reanimated 4 and Skia 2.6 (`canvas`, `bezier`, `vector`, `spring`).
* **Value**: Replaces custom math functions in `@repo/ui` components like `SkiaGlowAura`.

### B. `react-native-avoid-softinput` / `react-native-keyboard-controller` (Already Installed)
* **Inspection**: Our `package.json` already has `react-native-keyboard-controller` (`1.21.9`) and `react-native-avoid-softinput` (`^9.0.0`) installed.
* **Value**: Outstanding native keyboard tracking and smooth animation avoiding.

### C. `victory-native` (Formidable Labs)
* **npm**: [victory-native](https://www.npmjs.com/package/victory-native) | **GitHub**: [FormidableLabs/victory-native](https://github.com/FormidableLabs/victory-native)
* **Purpose**: Hardware-accelerated Skia charts engine.
* **Value**: Renders smooth 60–120 FPS analytical charts on mobile using our pre-installed `@shopify/react-native-skia` (`2.6.5`).
