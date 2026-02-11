# BDD Implementation Plan: Stage 1 - The Canal of Initiation

## Goal
Establish a robust, "Pure BDD" infrastructure in the `gurudevi-mobile` app and implement the first set of step definitions for the "Invitation Welcome" flow, ensuring behavioral validation of the selective entry system.

## User Review Required
> [!IMPORTANT]
> **Behavioral Focus:**
> These tests will verify the app from the user's perspective (e.g., "The user sees the Welcome screen"). This ensures that even as we refactor internal logic, the experience remains stable.
>
> **Tooling:**
> I am using `jest-cucumber` for Gherkin support and `@testing-library/react-native` for user-centric UI testing.

## Proposed Changes

### [gurudevi-mobile]

#### [NEW] [jest.config.js](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/jest.config.js)
- Configure Jest to use `jest-expo` preset and handle `.feature` files.

#### [NEW] [src/features/invitation_welcome.feature](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/features/invitation_welcome.feature)
- Gherkin specification for the onboarding journey via deep-link invitation.

#### [NEW] [src/__tests__/steps/invitation_welcome.steps.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/__tests__/steps/invitation_welcome.steps.tsx)
- Implementation of the "Glue Code" to verify the onboarding UI.

#### [NEW] [src/__tests__/mocks/supabase.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/__tests__/mocks/supabase.ts)
- Mocks for Supabase auth and database calls during testing.

## Verification Plan

### Automated Tests
- **BDD Execution**: Run `pnpm test` from the `apps/gurudevi-mobile` directory.
- **Verification**: The tests should pass, confirming that the "Invitation Welcome" flow is correctly mapped to the UI.

### Manual Verification
- **App Startup**: Ensure the app still launches correctly with `pnpm start --clear` (no side effects from test infrastructure).
