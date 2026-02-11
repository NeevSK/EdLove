# Walkthrough - Glass Sanctuary UI Verification

The `gurudevi-mobile` app has been updated with the "Glass Sanctuary" design language. This includes new colors, glassmorphism effects (BlurView), and improved layout handling for Safe Areas.

## 1. Initial Launch & Layout
- [ ] **Launch App**: Ensure the app loads without crashing.
- [ ] **Safe Areas**: Check the top and bottom of the screen.
    - [ ] The Status Bar should not overlap content.
    - [ ] The Tab Bar (bottom) should sit *above* the home indicator on iPhone X+ (no "falling off").
    - [ ] The FAB (Lotus Button) should be reachable and not obscured.

## 2. Visual Design Checks
### Glassmorphism (Sanctuary Card)
Navigate to a screen with cards (e.g., Library or Home).
- [ ] **Glass Effect**: The cards should have a blurred, semi-transparent background (on iOS/High-Tier Android).
- [ ] **Borders**: Cards should have a subtle "Edge Light" border.
- [ ] **Shadows**: Shadows should be colored (ambient), not just black.

### Theming (Dark vs Light)
Toggle your device's system theme.
- [ ] **Dark Mode ("Bioluminescent")**:
    - [ ] Background should be deep/midnight blue.
    - [ ] Glass cards should feel "glowing" or "bioluminescent".
    - [ ] Text should be `sacredWhite`.
- [ ] **Light Mode ("Porcelain")**:
    - [ ] Background should be `creamSilence` or `lotusWhite`.
    - [ ] Glass cards should look like frosted glass/porcelain.
    - [ ] Text should be `charcoalTruth`.

## 3. Interaction & Physics
- [ ] **Press Card**: Tap and hold a Sanctuary Card.
    - [ ] **Lift**: The card should scale up slightly (1.0 -> 1.02).
    - [ ] **Response**: The animation should feel springy and organic.

## 4. Performance
- [ ] **Scroll Test**: Scroll through a list of cards quickly.
    - [ ] **FPS**: The scrolling should be smooth (target 60fps).
    - [ ] **Android**: If on a low-end Android device, ensure the "Glass" effect degrades to a solid color to maintain performance.

## Troubleshooting
- **Missing Blur?** Ensure you are not in "Low Power Mode" (as simulated by our `DeviceUtils`) or on a very old Android device.
- **Layout Issues?** If the Tab Bar looks wrong, try restarting the app to clear cached layout metrics.
