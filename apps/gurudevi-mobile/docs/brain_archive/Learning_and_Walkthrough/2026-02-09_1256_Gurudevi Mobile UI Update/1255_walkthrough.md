# Glass Sanctuary UI Implementation

I have refactored the Gurudevi mobile app to align with the "Glass Sanctuary" design aesthetic.

## 1. Theme & Design Tokens
- Updated `gluestack-ui.config.ts` with the new **Sanctuary Palette**:
  - **Dark Mode (Bioluminescence)**: `voidIndigo`, `deepIndigo`, `midnightBlue`
  - **Light Mode (Porcelain)**: `creamSilence`, `lotusWhite`, `sandStone`
  - **Core**: `sanctuarySaffron` (Gold), `gurudeviBlue` (Electric), `gurudeviViolet` (Wisdom)

## 2. Core Components

### `SanctuaryCard`
- **Glassmorphism**: Now uses `expo-blur` with `BlurView` for a true glass effect on supported devices.
- **Performance**: Automatically falls back to a solid "Deep Ocean" or "Porcelain" background on low-end devices or Android if optimization requires it.
- **Micro-interactions**: Added a subtle "lift" animation and haptic feedback on press.

### `SanctuaryButton`
- **Updated Colors**: Primary actions now use `sanctuarySaffron` (Gold), secondary use `gurudeviBlue` or `deepIndigo`.
- **Haptic Feedback**: Integrated into interaction flows.

### `LotusPetalFAB`
- **Floating Physics**: The FAB now floats above the Tab Bar with proper safe area insets.
- **Breathing Animation**: Improved the organic breathing effect.
- **Context Awareness**: Shows relevant icons/actions based on the active tab (e.g., "Log Mood" for Self, "Create Lesson" for Classroom).

## 3. Layout & Navigation

### `ScreenWrapper`
- **Global Background**: Implemented a shared wrapper that provides the "Atmosphere" background (Linear Gradient for high-end, Solid for low-end).
- **Safe Area**: Properly handles status bar and notch insets using `react-native-safe-area-context` without double-padding.

### `TabNavigator`
- **Glass Tab Bar**: Updated the tab bar to have a glass-like border and dynamic height that respects the home indicator area.

## 4. Performance

### `DeviceUtils.ts`
- **Device Tier Detection**: HEURISTIC to detect High/Mid/Low performance devices based on model and RAM.
- **Low Power Mode**: `IS_LOW_POWER_MODE` constant disables expensive effects (Blur, Gradients) on older devices to ensure 60fps scrolling.

## Next Steps
- **Verify on Device**: Run the app on a physical iOS/Android device to check the Blur effect and SafeArea insets.
- **Fine-tune Animations**: Adjust the spring physics of the FAB and Cards if they feel too bouncy.
- **Migrate Screens**: Ensure all screens use `<ScreenWrapper>` to inherit the new background.
