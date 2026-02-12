# Implementation Plan - Gurudevi Glass Sanctuary UI Upgrade

## Goal Description
Upgrade the `apps/gurudevi-mobile` UI to match the "Glass Sanctuary" design spec. This involves moving from a solid, standard color palette to a glassmorphism-based, bioluminescent/porcelain aesthetic with specific "dual-physics" materials for light and dark modes.

## User Review Required
> [!IMPORTANT]
> **Performance Impact**: Adding excessive blur views (Glassmorphism) on Android can have performance penalties. We will optimize `SanctuaryCard` to degrade gracefully or use lighter implementations if needed.

> [!WARNING]
> **Color Changes**: The existing "Sanctuary Saffron" (Orange) will be replaced or demoted in favor of "Gurudevi Gold" (#D4AF37) as the master thread. This is a brand identity shift.

## Proposed Changes

### Configuration & Dependencies
#### [MODIFY] [package.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/package.json)
- Add `expo-blur` dependency.
- Add `expo-linear-gradient` (if not already present).
- Add `expo-device` for performance tier detection.
- Ensure `react-native-safe-area-context` is installed and updated.

### Layout & Navigation Fixes
#### [MODIFY] [TabNavigator.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/TabNavigator.tsx)
- Wrap `Tab.Navigator` or individual screens in a `SafeAreaView` (from `react-native-safe-area-context`) with `edges={['bottom']}` to prevent tab bar from falling off on iPhone X+.
- Adjust `tabBarStyle` height calculations to include `insets.bottom`.

#### [MODIFY] [LotusPetalFAB.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/LotusPetalFAB.tsx)
- Use `useSafeAreaInsets()` to dynamically position the FAB above the bottom safe area.
- Add `KeyboardAvoidingView` or keyboard listeners if FAB needs to move out of the way.

#### [NEW] [ScreenWrapper.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/ScreenWrapper.tsx)
- Create a global wrapper component that:
    - Handles `SafeAreaView` edges consistently.
    - Provides a unified background (Gradient/Solid based on theme).
    - Checks device performance tier.

### Performance & Device Logic
#### [NEW] [DeviceUtils.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/utils/DeviceUtils.ts)
- Implement `getDeviceTier()` using `expo-device`.
- Return `HIGH`, `MID`, `LOW` tiers.
- `LOW` tier disables BlurView, complex animations, and heavy shadows.

### Theme System
#### [MODIFY] [Theme.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/constants/Theme.ts)
- **Colors**:
    - Update `sanctuarySaffron` to `#D4AF37` (Gold).
    - Add `gurudeviBlue` (`#3B82F6`) and `gurudeviViolet` (`#8B5CF6`).
    - Define `bioluminescent` (Dark) and `porcelain` (Light) palettes as per spec.
- **Shadows**:
    - Implement `ambient` and `focus` shadow tokens with color (not just black/gray).
- **Typography**:
    - Update headers to `Inter` (if not already), weight 800, tracking `-0.04em`.

### Components
#### [MODIFY] [SanctuaryCard.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/SanctuaryCard.tsx)
- Wrap content in `<BlurView>`.
- Implement conditional styling for "Glass Border" and "Edge Light".
- Update shadow logic to use new colored shadow tokens.
- Add "Noise" texture support if possible (or simulate with semi-transparent overlay).

#### [MODIFY] [SanctuaryButton.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/SanctuaryButton.tsx)
- Update default colors to match new Gold/Blue scheme.
- Add `glass` variant if needed.

#### [MODIFY] [gluestack-ui.config.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/gluestack-ui.config.ts)
- Sync new tokens with Gluestack config if necessary.

## Verification Plan

### Manual Verification
1.  **Card Physics**:
    -   Open `Library` tab (likely has cards).
    -   Verify "Glass" effect (blur background).
    -   Verify "Edge Light" (border color).
    -   Press a card and verify "Lift" animation + "Glow" intensification.
2.  **Dark/Light Mode**:
    -   Toggle system theme.
    -   **Dark**: Check for "Bioluminescent" feel (Dark Blue/Black glass, glowing borders).
    -   **Light**: Check for "Porcelain" feel (White glass, crisp shadows).
3.  **Typography**:
    -   Check Headers for "Swiss" feel (Tight tracking, Bold).
4.  **Performance**:
    -   Scroll a list of cards to ensure 60fps (especially on Android).
