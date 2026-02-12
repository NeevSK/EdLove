# Fix Mobile Warnings and Issues

## Goal Description
Fix the `ReanimatedError` caused by incorrect `Easing` import and address the `SafeAreaView` deprecation warning.

## Use Review Required
> [!NOTE]
> `SafeAreaView` usage was not found in the `src` directory. The warning likely originates from a dependency (e.g., `@gluestack-ui` or an older navigation library). I will focus on fixing the distinct `Easing` error first. If the `SafeAreaView` warning persists, we may need to update dependencies or ignore it if it's upstream.

## Proposed Changes

### Mobile App (`apps/gurudevi-mobile`)

#### [MODIFY] [LotusPetalFAB.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/LotusPetalFAB.tsx)
-   Change `import { Easing } from 'react-native';` to `import { Easing } from 'react-native-reanimated';`.
-   Verify other usage of `Easing` aligns with Reanimated.

## Verification Plan

### Manual Verification
1.  **Run the app**: User needs to run `npx expo start` (already running, may need reload).
2.  **Observe**: Check if the "Easing function is not a worklet" error disappears.
3.  **Check Warnings**: See if `SafeAreaView` warning remains.
