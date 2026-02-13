# Environment Engine & High Hierarchy Implementation Plan

## Objective
Establish the **Environment Engine** as the foundational "connective tissue" of the Gurudevi app. This engine dynamically reorganizes the UI based on Role, Time (Temporal), Language, Reality (Hardware/Signal), and The Veil (Privacy).

---

## User Review Required
> [!IMPORTANT]
> - **Universal Context Parameters**: We are moving toward a **"High Hierarchy" Architecture**. The app will dynamically reorganize based on six pillars: **Role, Time (Temporal), Language, Reality (Hardware/Signal), The Veil (Privacy), and Personality**.
> - **The Veil (Privacy Toggle)**: A global "Veil" that masks sensitive data instantly if the environment (e.g., student nearby) requires it.
> - **Reality Tiers**: The app will automatically switch between **"Glass Sanctuary"** (High-end) and **"Paper Sanctuary"** (Low-end/Save-data) modes based on a hardware/network audit.
> - **One Reality, Different Views**: Screens are NOT just permission-gated copies. They must reflect the specific **Information Hierarchy** of each role's "Care Work."
> - **Bio-Resonance Layer**: Implementation of **Adaptive Haptics** (Crisp for Day, Breathing for Night) and **Visual Unfolding** (petal-like transitions).

---

## Proposed Changes

### Mobile App (Gurudevi Mobile)

#### [NEW] [EnvironmentContext.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/context/EnvironmentContext.tsx)
- **Centralized Engine**: Unifies `useTheme`, `i18n`, `useRole`, and `useReality` into a single reactive hook.
- **Dynamic Reorganization**: Components subscribe to a single "Environment" state rather than multiple disparate stores.

#### [MODIFY] [Profile/Settings]
- **[NEW] [AppSettingsSection.tsx]**: A consolidated settings panel for Theme (Matrix), Language, and Reality (Fidelity).
- **[NEW] [FidelityToggle.tsx]**: User control for "Visual Fidelity" (Auto/High/Low) to override the Reality Guard.

#### [MODIFY] [Shared/Components]
- **[NEW] [EnvironmentGuard.tsx]**: A wrapper that simplifies/enhances components based on hardware tier.
- **[NEW] [LotusPetalFAB.tsx]**: Updated for **Ecosystem Pulsing** (glimmers based on external signals).
- **[NEW] [NetworkMonitor.tsx]**: Persistent indicator of connection quality with "Data Saver" auto-switch.
- **Visual Unfolding**: Implement a library of **Petal-like Transitions** (scaling/opacity) for all UI entrances.

#### [MODIFY] [Utils/Haptics]
- **[NEW] [adaptiveHaptic.ts]**: A utility that modulates haptic intensity and duration based on the **Temporal Phase**.

#### [AUDIT] [Role Coverage]
- **Information Hierarchy**: Screens for **Founder, Admin, Section Head** must be aligned with their role's specific "Care Work" (e.g., System Integrity, Ecosystem Health).
- **Missing Screen Check**: Ensure `Classroom`, `Community`, and `Library` have valid views for all roles.

---

## Verification Plan

### Manual Verification
1. **The Guest Entry**: Welcome -> "Explore as Guest" -> Home -> Verify Terms footer was acknowledged.
2. **Network Test**: Toggle Airplane mode -> Verify the Network Monitor responds correctly.
3. **Temporal Shift**: Manually override time to 8 PM -> Verify theme shifts to "Night" and haptics become "Breathing."
4. **Fidelity Test**: Toggle "Low Fidelity" in Settings -> Verify Glassmorphism/Blur effects disappear.
