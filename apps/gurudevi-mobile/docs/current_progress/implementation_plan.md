# Guest Exploration & Sanctuary Commit Flow

## Objective
Implement a "Progressive Discovery" flow for the Gurudevi Sanctuary: **Welcome -> Onboarding -> Guest Home (Explore) -> Auth (Commit)**.

## User Review Required
> [!IMPORTANT]
> - **Guest Terms Acceptance**: Even as a Guest, users will need to accept the "Sacred Privacy Pact" (Terms/Privacy) before entering the Home screen. This will be integrated into the Welcome or Onboarding transition.
> - **"Skip to Explore"**: We will add clear "Skip" or "Explore as Guest" buttons on both the Welcome screen and the Auth/Signup screen for maximum flexibility.
> - **State Persistence**: Guest data (like the "Call me" name) will be saved in `AsyncStorage` so it persists while they explore and is ready for the final Account Creation.
> - **Auth Nudge**: We will implement a subtle but beautiful lock mechanism on features like "Log Mood" or "Join School" that requires a full account.

## Proposed Changes

### Mobile App (Gurudevi Mobile)

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)
- **Navigation Root**: Handle `isGuest` state. If `!session` but `hasAcceptedTerms`, allow access to `TabNavigator` in guest mode.
- **Deep Link Listener**: Capture `invite_code`, `school`, and `role` to pre-seed the guest profile.

#### [MODIFY] [WelcomeScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/WelcomeScreen.tsx)
- Add **"Explore as Guest"** button.
- Integrate a simple "By continuing as a guest, you agree to..." footer.

#### [MODIFY] [OnboardingScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/OnboardingScreen.tsx)
- **Screen 0**: Update copy to **"How should we call you within the app?"**.
- **Skip Logic**: Ensure "Skip to Home" correctly persists the name (if entered) and sets `hasAcceptedTerms`.

#### [MODIFY] [AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx)
- **UI Flip**: Google Login at the top, Email secondary.
- **Explicit Agreement**: Add a checkbox for Terms & Privacy that **must** be checked before signing up.
- **Guest Fallback**: Add a "Wait, I want to explore more first" link to return to Guest mode.

#### [NEW] [SanctuaryLock.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/SanctuaryLock.tsx)
- A reusable component to wrap auth-required features with a "Join the Sanctuary" prompt.

## Verification Plan

### Manual Verification
1. **The Guest Entry**: Welcome -> "Explore as Guest" -> Home -> Verify Terms footer was acknowledged.
2. **The Commit**: Guest Home -> Wellbeing Tab -> Try "Log Mood" -> Verify Auth Nudge appears.
3. **The Identity**: Onboarding "Name" Screen -> Enter name -> Skip -> Auth later -> Verify name is remembered.
4. **Deep Link**: Open app via `gurudevi://invite?school=Truthimal` -> Verify school is captured in guest state.
