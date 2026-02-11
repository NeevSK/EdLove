# Implementation Plan - User Role Alignment & Onboarding Integration

Align the application with its intended user role architecture and integrate the onboarding flow.

## Proposed Changes

### Database Logic Alignment

#### [MODIFY] [InvitationWelcomeScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/InvitationWelcomeScreen.tsx)
- Change table name from `user_roles` to `users`.
- Use `.update()` instead of `.insert()` since the trigger ensures the record already exists.
- Set `role`, `organization_name` (school_name), and potentially `onboarding_completed: true` if joining via invitation skips onboarding.

### Onboarding Integration

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)
- Fetch `onboarding_completed` from the `users` table during initial session check.
- Update global store to track onboarding status.
- Conditionally render `OnboardingScreen` if `session` exists but `onboarding_completed` is false.

#### [MODIFY] [useStore.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/store/useStore.ts)
- Add `onboardingCompleted` state and `setOnboardingCompleted` action.

### Specialized Role UI Refinement

#### [MODIFY] [UserStatsCard.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/profile/UserStatsCard.tsx)
- Add explicit handling for `founder` and `admin` roles.
- `founder` might see "Legacy Impact" or "Guardian" stats.
- `admin` might see "System Pulse" or "Sanctuary Health" stats.

#### [MODIFY] [SelfScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/SelfScreen.tsx)
- Map `founder` and `admin` to specialized views or group them with `principal` for leadership wellbeing.

## Verification Plan

### Automated Tests
- Run existing BDD tests: `npm test src/__tests__/steps/invitation_welcome.steps.tsx`
- Update BDD tests to reflect the change from `insert` to `update` on the `users` table.

### Manual Verification
1. Sign up as a new user.
2. Verify redirection to `OnboardingScreen`.
3. Complete onboarding.
4. Verify redirection to `Main` TabNavigator.
5. Check `Profile` screen to see role specific stats for `teacher`, `student`, and (manually via DB) `founder`.
