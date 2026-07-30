# A11y Remediation Draft (WCAG 2.2 Alignment)

This draft identifies specific code adjustments needed to hit WCAG 2.2 targets based on the visual audit of the Sanctuary v3 theme.

## 1. Typography Adjustments
| Token | Type | Current | Proposed | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `willow` | Muted Text | `#72695E` | `#665E54` | Increases contrast from 4.2:1 to **4.8:1**. Passes AA without breaking the "Antique Willow" aesthetic. |
| `emberRed` | Error Text | `#FF6347` | (Overlay Fix) | Keep hex; add 10% `sacredWhite` background pill to `FormControlErrorText` to increase perceptual contrast. |

## 2. Component Hardening (Proposed)

### A. focus Ring visibility
Update `Theme.ts` to increase the opacity of the focus shadow.
*   **Target**: `shadowFocus`
*   **Change**: Increase from `0.15` to **`0.40`**.
*   **Effect**: Makes the focus state clearly visible on both Vellum and Ink backgrounds.

### B. Contrast for High-Vibrancy Buttons
Update `SanctuaryButton` logic to ensure text contrast on Saffron types.
*   **Logic**: If `type="primary"` (Saffron), override text color to `inkTruth` regardless of theme mode.
*   **Rationale**: Saffron is too light for white text; it requires dark "ink" text for readability.

### C. Error Message Accessibility
Wrap `FormControlErrorText` in a utility that provides a "Contrast Shield."
*   **Implementation**:
    ```tsx
    // Proposed change in form-control/index.tsx
    const FormControlErrorText = ({ children }: any) => (
      <View className="bg-white/40 px-2 py-0.5 rounded-sm self-start">
        <Text className="text-phase-danger text-sm font-semibold">
          {children}
        </Text>
      </View>
    );
    ```

## 3. Visual Checklist for Implementation
- [ ] Update `Theme.ts` colors and shadow opacities.
- [ ] Audit `SanctuaryButton` for forced dark-text on light-background variants.
- [ ] Add `accessibilityIgnoresInvertColors` to `LotusLogo` and other brand assets.
- [ ] Verification: Re-run `pnpm --filter @repo/ui lint:eslint`.
