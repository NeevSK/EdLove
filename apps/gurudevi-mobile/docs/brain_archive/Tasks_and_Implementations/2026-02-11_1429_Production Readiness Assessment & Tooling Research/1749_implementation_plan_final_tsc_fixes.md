# Final TypeScript Stabilisation: Zero-Error Build

This plan outlines the final steps to resolve all remaining TypeScript compilation errors in the `gurudevi-mobile` project, following the successful mitigation of the stack overflow issue.

## Proposed Changes

### [Component] Shared & UI Components

#### [MODIFY] [ScreenWrapper.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/ScreenWrapper.tsx)
- Standardize React type imports to resolve namespace conflicts (`React.ReactNode` vs `import(...).ReactNode`).
- Ensure `children` is correctly typed as `React.ReactNode`.

#### [MODIFY] [LibraryScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/LibraryScreen.tsx)
- Update `SanctuaryInput` props to match its definition, specifically handling `autoFocus` and `leftIcon` types correctly.

### [API] Data Layer

#### [MODIFY] [dailyContent.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/lib/api/dailyContent.ts)
- Add explicit type casting to Supabase RPC responses to resolve `{} | null` assignability issues.

---

## Verification Plan

### Automated Tests
- Run the full project TypeScript build with elevated stack size:
  ```powershell
  node --stack-size=10000 ./node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --skipLibCheck
  ```
- **Success Criteria**: Zero errors in the output.

### Manual Verification
- None required for these type-level fixes as they do not change runtime logic.
