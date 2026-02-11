# Walkthrough - Theme & Style Initialization Fixes

## Overview
Addressed several critical runtime errors related to React Native styling, hook usage, and theme initialization.

## Changes

### 1. Fixed Invalid Hook Calls (`useMemo`)
moved top-level `const styles = useMemo(...)` definitions **inside** the component body for the following files. This resolves the "Invalid hook call" error.

- `src/components/shared/SanctuaryCard.tsx`
- `src/components/self/ShadowAgentDrawer.tsx`
- `src/components/shared/ErrorMessage.tsx`

### 2. Restored Missing Styles
Re-added missing `styles` definitions that were causing crashes in:
- `src/components/library/LibraryResourceCard.tsx`
- `src/components/self/MoodLotus.tsx`
- `src/components/shared/LotusDropdown.tsx`

### 3. Fixed Invalid Theme Keys
Corrected invalid property accesses on the `Theme` object (e.g., `sapphireGlow`, `typography.bodyMedium`) in:
- `src/components/classroom/ClassroomList.tsx`

### 4. Fixed LibraryScreen Configuration Error
Resolved "Objects are not valid as a React child" error in `LibraryScreen.tsx` by passing a valid `TouchableOpacity` component to `GlobalHeader`'s `rightAction`, instead of a plain object.

## Verification
- Verified `pnpm start` runs without immediate crashes.
- Validated that the `LibraryScreen` renders correctly.
