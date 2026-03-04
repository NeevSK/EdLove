# Web Navigation Stability: Onboarding History Fix

Fixes the "no index" error reported when using browser back/forward buttons during the onboarding journey.

## Problem
Currently, `App.tsx` conditionally renders either `Welcome` OR `Onboarding`. When moving from Welcome to Onboarding, the `Welcome` screen is physically removed from the Navigator. This breaks the browser's ability to go "Back" to `/` because the Navigator no longer contains a route for it, leading to the React Navigation "no index" crash.

## Proposed Changes

### [gurudevi-mobile]

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)
-   Refactor `RootStack.Navigator` children to keep `Welcome` and `Onboarding` stable as siblings when `onboardingCompleted` is false.
-   Ensure transitions between them use `navigation.navigate` instead of purely state-based component swapping.
-   Update `onNext` from `WelcomeScreen` to attempt a navigation call if the navigator is available.

## Verification Plan

### Manual Verification
-   Start the web app.
-   Land on `/` (Welcome).
-   Progress to `/onboarding`.
-   Use browser **Back** button to return to `/`.
-   Use browser **Forward** button to return to `/onboarding`.
-   Verify no "no index" error appears and the UI stays responsive.
