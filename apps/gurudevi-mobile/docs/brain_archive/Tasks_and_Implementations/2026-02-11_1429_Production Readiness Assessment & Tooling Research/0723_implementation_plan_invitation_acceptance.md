# Implementation Plan - Invitation Acceptance Logic

## Goal Description
Implement the functionality for users to accept invitations on the `InvitationWelcomeScreen`. This involves calling Supabase to save the assigned role and navigating the user to the main application area.

## Proposed Changes

### Feature Layer
#### [MODIFY] [invitation_welcome.feature](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/features/invitation_welcome.feature)
- Added 'Accepting an invitation' scenario.

### Component Layer
#### [MODIFY] [InvitationWelcomeScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/InvitationWelcomeScreen.tsx)
- Import `supabase` client.
- Implement `handleJoin` function that:
    1. Updates the `user_roles` table in Supabase.
    2. Navigates to the `Main` screen on success.
- Connect `Button`'s `onPress` to `handleJoin`.

### Test Layer
#### [MODIFY] [invitation_welcome.steps.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/__tests__/steps/invitation_welcome.steps.tsx)
- Implement step definitions for the new 'Accepting an invitation' scenario.
- Use mocks to verify the Supabase update call was made with correct parameters.

## Verification Plan

### Automated Tests
1. **BDD Suite:** Run `pnpm test src/__tests__/steps/invitation_welcome.steps.tsx`
    - Verify that both 'Arriving via invitation' and 'Accepting an invitation' scenarios pass.
    - Capturing output to `bdd_acceptance_report.txt`.

### Manual Verification
1. Open the app via a deep link (simulated).
2. Click "Join the Sanctuary".
3. Check console logs or Supabase dashboard (if running) to verify the role update.
