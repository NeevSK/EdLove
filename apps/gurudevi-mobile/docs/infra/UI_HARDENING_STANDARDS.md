# Guidance: Sovereign UI Hardening (Sanctuary V3)

This document defines the quality and performance gates for all UI components in the Gurudevi Sanctuary.

## 1. The Performance Gate (The 2GB Rule)

Gurudevi targets rural devices with as little as 2GB RAM. Components must observe these constraints:

*   **No Dynamic Blurs**: Use semi-transparent solid colors instead of `BlurView`.
*   **Shadow Management**: Avoid complex shadows in lists. Use thin `borderWidth: 1` + `borderColor: sanctuary.shades.border`.
*   **FlashList Usage**: All vertical registries MUST use `@shopify/flash-list`. `FlatList` is prohibited for student lists or attendance registries.

## 2. Accessibility (A11y) Exhaustive Checklist

Every component must pass these checks before merging:

- [ ] **Role**: Appropriate `accessibilityRole` (button, header, search, image).
- [ ] **Label**: `accessibilityLabel` clearly describes the action, not the icon name.
- [ ] **State**: `accessibilityState` reflecting `disabled`, `selected`, or `busy`.
- [ ] **Hit Slop**: Minimum hit area of 44x44 for touch interaction.

## 3. Token Adherence (Zero-Hex Policy)

**Hardcoded hex values are strictly prohibited.**

*   **Logic**: All styles must be derived from `packages/ui/src/tokens.ts`.
*   **Semantic Names**: Use `colors.institutional.primary` not `colors.blue.500`.
*   **Typography**: Use the `getFontFamily` utility from `constants/Fonts.ts` to ensure consistent Sinhala/Tamil rendering.

## 4. Platform Sovereignty

*   **Logic Isolation**: No `react-native` imports in any file within `@repo/core/logic`.
*   **Native Compatibility**: Ensure components using `packages/ui` have a meaningful fallback or "Headless" version for Web (Next.js) compatibility.

---
*Reference: Sanctuary V3 Design Tokens*
