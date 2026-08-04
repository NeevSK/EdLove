# Expo & React Native Engineering Playbook (expo-rn-expert)

Authoritative engineering guidelines for building cross-platform React Native (web and mobile) applications with Expo SDK 56 and Expo Router.

---

## 1. Core Architecture & Standards

### A. Modern TypeScript & Type Safety
*   **Strict Mode**: Avoid the use of `any` types. If a type is unknown or complex, define custom interfaces, types, or use generics.
*   **Imports**: Prefer absolute path aliasing via `tsconfig.json` imports (e.g. `@repo/ui/*` or `@/components/*`) to preserve refactorability.
*   **Component Structure**: Always use functional components with explicitly typed props (`React.FC<Props>` or inline destructured types).

---

## 2. Navigation with Expo Router

*   **File-Based Conventions**: Adhere strictly to the `app/` folder routing layout rules:
    *   Shared layout primitives must reside in `_layout.tsx` wrappers.
    *   Route targets should use clean, semantic naming (e.g., `app/(auth)/login.tsx`).
*   **Link Primitives**: Utilize `<Link>` from `expo-router` instead of manual programmatic navigation hooks where possible, to enable declarative, type-safe path transitions.
*   **Query Parameters**: Define clean, validated typings for search params using Zod schemas when resolving deep-link inputs.

---

## 3. Universal Layouts & Viewport Scrolling

To eliminate viewport cutoffs and frozen scrolls on high-performance web/mobile layouts (specifically high-constrained web browsers), adhere to the following adaptive viewport layout rules:

### A. The Flexible Scrolling Principle
> [!IMPORTANT]
> Never lock layout heights in complex component shells. Avoid hardcoded `flex: 1` heights that prevent content from expanding naturally.

*   **AdaptiveScrollContainer**: Wrap scrolling lists in robust adaptive boxes using:
    ```tsx
    import { ScrollView, StyleSheet } from 'react-native';
    
    // Always supply explicit content container styles instead of top-level container styles
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
    ```
*   **Web Overrides**: For web-targeted builds, utilize CSS overrides to neutralize rigid viewport constraints and restore natural HTML document scrolling:
    ```css
    html, body, #root {
      height: auto;
      min-height: 100%;
      overflow-y: auto;
    }
    ```

---

## 4. Performance & Resource Loading

*   **Asset Preloading**: Pre-fetch all visual assets (icons, fonts, images) inside the Root Layout wrapper before releasing the native Splash Screen (`expo-splash-screen`).
*   **List Rendering**: Always implement `FlashList` from `@shopify/flash-list` rather than standard `FlatList` for long-scroll interfaces to guarantee 60fps item recycle performance on lower-tier Android and iOS mobile hardware.
*   **Inline Functions**: Prevent inline JSX arrow functions or inline object declarations inside render blocks to avoid triggering redundant garbage collection sweeps.
