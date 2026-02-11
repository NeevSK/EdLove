# Surgical React Version Synchronization

## Goal
Resolve the "Incompatible React versions" crash by unifying the entire monorepo on **React 19.1.0** and **React Native 0.81.5**, as mandated by the project's "Ground Truth" document ([GURUDEVI_STACK_v3_1_FINAL.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/Docs%20v%203.0/Core/GURUDEVI_STACK_v3_1_FINAL.md)).

## User Review Required
> [!IMPORTANT]
> **Why we need an override:**
> My analysis of `packages/ui` shows it is requesting `^19.2.0`, which is pulling in `19.2.4` transitively. Exposure SDK 54's renderer is strictly locked to **19.1.0**. 
>
> To resolve this, we will:
> 1. Pin `react` to exactly `19.1.0` in `@repo/ui`.
> 2. Use a root `pnpm.overrides` to ensure ALL libraries (Navigation, Reanimated, etc.) use 19.1.0.

## Proposed Changes

### [Packages/UI]

#### [MODIFY] [package.json](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/package.json)
- Change `react` from `"^19.2.0"` to `"19.1.0"`.

### [Monorepo Root]

#### [MODIFY] [package.json](file:///c:/Users/Naween/projects/polymath-platform/package.json)
- Add `pnpm.overrides` to force `react`, `react-dom`, and `@types/react` to `19.1.0`.
- Ensure `react-native-renderer` is also covered.

## Verification Plan

### Automated Tests
- **Version Check**: Run `pnpm why react -r` to confirm NO version other than `19.1.0` exists in the tree.
- **BDD Harness**: Run `pnpm test` to ensure the testing tools (Jest 30, RNTL 14 Beta) still function with React 19.1.0.

### Manual Verification
- **App Launch**: Start the app with `npx expo start --clear` and verify the red screen error is gone.
- **Navigation Test**: Click through the app to ensure React Navigation works correctly with the forced 19.1.0 version.
