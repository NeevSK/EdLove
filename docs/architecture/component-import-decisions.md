# Component Capabilities & Import Decisions — Sonner & Zeego Analysis

> **Repo Location**: [`docs/architecture/component-import-decisions.md`](file:///c:/x/docs/architecture/component-import-decisions.md)
> **Strategy Execution**: Fused Sonner's 3D card depth-scaling animation pipeline directly into our native Gurudevi [`ToastProvider.tsx`](file:///c:/x/packages/ui/src/providers/ToastProvider.tsx).

---

## 1. Toast Engine Strategy — Design Integrity + Sonner Depth Capabilities

### Design & Styling vs Capability Fusion

* **Design & Styling (100% Retained Gurudevi Native Tokens)**:
  - We preserve our exact Gurudevi Sanctuary visual design (`tokens.colors.toastSurface`, custom borders, typography, error/warning/success variants).
* **Sonner 3D Card Stacking Animation (Fused)**:
  - Integrated Sonner's exact visual depth math into `ToastProvider.tsx` using `react-native-reanimated` (`useAnimatedStyle`):
    ```typescript
    const scale = reverseIndex === 0 ? 1 : Math.max(0.85, 1 - reverseIndex * 0.05);
    const translateYOffset = reverseIndex === 0 ? 0 : -reverseIndex * 8;
    const opacity = reverseIndex > 3 ? 0 : 1 - reverseIndex * 0.2;
    ```
* **Our Error Aggregation & Control (Retained)**:
  - Keeps duplicate error aggregation (`×2`, `×5` pill badges) and manual dismiss controls.

---

## 2. Native Context Menu Strategy — `zeego` Integration

* **Zeego Capabilities**: Invokes real native OS context menus (`UIContextMenuConfiguration` on iOS, `PopupMenu` on Android) with native OS haptics and native blur backdrops.
* **Execution**: Add `zeego` to `apps/gurudevi-mobile` and `@repo/ui` so our native dropdowns (`LotusDropdown`, etc.) render true native OS menus.
