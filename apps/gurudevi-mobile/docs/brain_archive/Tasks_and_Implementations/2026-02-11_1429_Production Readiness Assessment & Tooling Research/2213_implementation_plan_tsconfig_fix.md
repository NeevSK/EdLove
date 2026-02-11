# Fix tsconfig and Verify App Launch

## Goal
Resolve the `expo/tsconfig.base` resolution error in `apps/gurudevi-mobile/tsconfig.json` and ensure the application starts correctly after the monorepo reset.

## Proposed Changes

### [gurudevi-mobile]

#### [MODIFY] [tsconfig.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/tsconfig.json)
- Update `extends` to use a relative path to the hoisted `expo` package in the monorepo root: `../../node_modules/expo/tsconfig.base.json`.

## Verification Plan

### Automated Tests
- **Type Check**: Run `npx tsc --noEmit` in `apps/gurudevi-mobile` to verify the error is gone.
- **BDD Harness**: Run `pnpm test` in the root to ensure the BDD infrastructure is correctly detected.

### Manual Verification
- **App Launch**: Run `pnpm start` in `apps/gurudevi-mobile` to ensure the Expo development server starts without resolution errors.
- **IDE Check**: Confirm that the "File 'expo/tsconfig.base' not found" error disappears from the cursor context.
