# GitHub Copilot Workspace Prompt (AGGRESSIVE - Full Migration)

**Copy this entire prompt into a new GitHub Issue, then assign it to Copilot Workspace**

---

## Title
🚀 UNIFIED WHOLE CODEBASE REFACTOR - UI Abstraction & Type Stability

## Description

### Context
We are executing a fundamental architectural shift for the `gurudevi-mobile` app. Our goal is a **UNIFIED WHOLE CODEBASE REFACTOR** to solve TypeScript stack overflow issues, optimize bundle size for low-end devices (2GB RAM), and establish a clean, future-proof component architecture.

**The Strategy**: Centralize ALL UI dependencies in `src/ui/index.ts` using direct sub-module imports, bypassing the heavy Gluestack aggregate index.

### Scope: TOTAL CODEBASE REFACTOR
**MIGRATE EVERY SINGLE FILE** in the `apps/gurudevi-mobile` directory (~60+ files) that uses Gluestack UI components.

This is NOT just a search-and-replace; it is a project-wide audit to ensure:
1. **Zero Direct Imports**: No file is allowed to import from `@gluestack-ui/themed` directly.
2. **Total UI Abstraction**: Every UI primitive (Box, Text, Button, etc.) MUST come from `@/ui`.
3. **Type Consistency**: Ensure that all files using our new store (`src/store/useStore.ts`) and mocks (`src/__tests__/mocks/supabase.ts`) are type-consistent with the new architecture.

### Target Files
- All screens: `src/screens/**/*.tsx`
- All components: `src/components/**/*.tsx`
- All hooks: `src/hooks/**/*.ts`
- Root entry points: `App.tsx`, `index.ts` (if applicable)
- Test files: `src/__tests__/**/*.tsx`, `src/features/**/*.steps.tsx`
- Any other `.ts` or `.tsx` file in the project.

### Pattern to Enforce

**STRICT RULE**: Only `src/ui/index.ts` can touch `@gluestack-ui/themed`.

**CORRECT**:
```tsx
import { Box, VStack, Button, Text } from '@/ui';
```

**FORBIDDEN**:
```tsx
import { Box } from '@gluestack-ui/themed';
```

### Critical Implementation Rules

1. **Inventory Management**: Before migration, scan the codebase for ALL Gluestack components currently in use.
2. **Populate Abstraction Layer**: If a component (e.g., `Actionsheet`, `Fab`, `Progress`) is missing from `src/ui/index.ts`, add it using the direct import pattern:
   ```typescript
   export { ComponentName } from '@gluestack-ui/themed/build/components/ComponentName';
   ```
3. **Group & Document**: Organize `src/ui/index.ts` into logical sections (Layout, Typography, Forms, Overlays, etc.) and update `src/ui/README.md`.
4. **No Logic Changes**: This is a structural refactor. Do not modify business logic or styles unless necessary for type stability.

### Verification & Stability Goals

1. **Targeted TSC Passing**: Verify that each directory (screens, components, hooks) passes `npx tsc --noEmit --skipLibCheck`.
2. **BDD Regression Testing**: Run `npm test`. All existing features (Auth, Invitations) MUST pass 100%.
3. **Path Alias Integrity**: Ensure all imports use the `@/` alias for internal project paths.

### Suggested Execution Path

1. **Phase 1: Component Audit**: Identify every single Gluestack component used in the project and ensure it's in `src/ui/index.ts`.
2. **Phase 2: Global Migration**: Systematically update ALL files to use `@/ui`.
3. **Phase 3: Type & Store Alignment**: Ensure the store and supabase mocks are correctly utilized in the refactored files.
4. **Phase 4: Final Verification**: Run targeted builds and BDD tests.

### Critical Rules

1. **Check `src/ui/index.ts` FIRST**: Before migrating any file, verify all components it uses are exported from `src/ui/index.ts`

2. **Add Missing Components**: If a component is NOT in `src/ui/index.ts`, you MUST add it using the direct import pattern:
   ```typescript
   // In src/ui/index.ts
   export { ComponentName } from '@gluestack-ui/themed/build/components/ComponentName';
   ```
   
   **Common components you'll likely need to add**:
   - `Card`, `CardBody`, `CardHeader`, `CardFooter`
   - `Modal`, `ModalBackdrop`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`
   - `Avatar`, `AvatarImage`, `AvatarFallbackText`
   - `Badge`, `BadgeText`, `BadgeIcon`
   - `Divider`
   - `Image`
   - `Link`, `LinkText`
   - `Progress`, `ProgressFilledTrack`
   - `Radio`, `RadioGroup`, `RadioIndicator`, `RadioIcon`, `RadioLabel`
   - `Checkbox`, `CheckboxIndicator`, `CheckboxIcon`, `CheckboxLabel`
   - `Switch`
   - `Textarea`, `TextareaInput`
   - `Tooltip`, `TooltipContent`, `TooltipText`
   - `Actionsheet`, `ActionsheetBackdrop`, `ActionsheetContent`, `ActionsheetItem`
   - `Fab`, `FabIcon`, `FabLabel`
   - `Icon`
   - `Slider`, `SliderTrack`, `SliderFilledTrack`, `SliderThumb`

3. **Organize `src/ui/index.ts`**: Group related components together with clear section comments (see existing structure)

4. **Preserve ALL Functionality**: Do NOT change any logic, styles, or behavior - ONLY the import statements

5. **Update `src/ui/README.md`**: After adding new components, update the "Currently Available Components" section

### Reference Documents

**MUST READ** before starting:
- `apps/gurudevi-mobile/Docs v 3.0/current_progress/ui_abstraction_layer_architecture.md` - Full architecture explanation and WHY we're doing this
- `apps/gurudevi-mobile/Docs v 3.0/current_progress/implementation_plan_ui_abstraction.md` - Implementation plan
- `apps/gurudevi-mobile/Docs v 3.0/current_progress/walkthrough_ui_abstraction.md` - Examples of completed migrations
- `apps/gurudevi-mobile/src/ui/README.md` - Usage guide

### Verification Strategy

**IMPORTANT**: Full `npx tsc --noEmit` will FAIL due to unrelated stack overflow issues. Use targeted verification instead.

1. **After Each Batch of Files** (recommend batches of 10-15 files):
   ```bash
   # Example for screens
   npx tsc src/screens/**/*.tsx --noEmit --skipLibCheck
   
   # Example for components
   npx tsc src/components/**/*.tsx --noEmit --skipLibCheck
   ```
   **Expected**: No import-related errors

2. **Final BDD Test Suite**:
   ```bash
   npm test
   ```
   **Expected**: All tests pass (especially `auth_refinement.steps.tsx` and `invitation_welcome.steps.tsx`)

3. **Visual Diff Review**: Ensure only import statements changed, no logic modifications

### Suggested Workflow

1. **Phase 1: Discovery**
   - Scan all files in `src/` for `@gluestack-ui/themed` imports
   - Build a comprehensive list of ALL components used across the codebase
   - Add ALL missing components to `src/ui/index.ts` in one go

2. **Phase 2: Migration** (in batches)
   - Batch 1: `src/screens/**/*.tsx` (highest priority)
   - Batch 2: `src/components/shared/**/*.tsx`
   - Batch 3: `src/components/self/**/*.tsx`
   - Batch 4: `src/components/community/**/*.tsx`
   - Batch 5: `src/components/profile/**/*.tsx`
   - Batch 6: `src/components/principal/**/*.tsx`
   - Batch 7: `src/components/grading/**/*.tsx`
   - Batch 8: `src/components/classroom/**/*.tsx`
   - Batch 9: `src/hooks/**/*.ts`
   - Batch 10: Any remaining files

3. **Phase 3: Verification**
   - Run targeted TypeScript checks per batch
   - Run full BDD test suite
   - Update `src/ui/README.md` with final component list

### Success Criteria

- [ ] ALL files in `src/` (except `src/ui/index.ts`) migrated to `@/ui` imports
- [ ] ALL used components exist in `src/ui/index.ts` with direct imports
- [ ] No new TypeScript import errors introduced
- [ ] BDD tests still pass (100% pass rate)
- [ ] `src/ui/README.md` updated with complete component inventory
- [ ] Clean, reviewable PR diff (only import changes, no logic changes)

### Performance Target

- **Estimated Files**: ~50-60 files
- **Estimated Components to Add**: ~30-40 new components to `src/ui/index.ts`
- **Expected Time**: 20-40 minutes (for AI agent)
- **Human Review Time**: 30-60 minutes

### Notes for the AI Agent

- **DO NOT** run full `npx tsc --noEmit` - it will fail due to unrelated issues
- **DO** use targeted TypeScript checks per directory/batch
- **DO** commit incrementally if possible (one commit per batch)
- **DO** preserve exact formatting and logic - only change imports
- **DO** add detailed commit messages explaining what was migrated
- **DO NOT** try to "fix" or "improve" any existing code - this is ONLY an import refactor
- If you encounter a component that doesn't exist in Gluestack UI's build directory, flag it in the PR description for human review

### Risk Mitigation

- This is a **low-risk, high-reward** task
- Worst case: PR is closed, no harm done
- Best case: 5-10 hours of manual work saved
- Middle case: Cherry-pick successful batches, manually fix problematic ones

---

**Assign this issue to GitHub Copilot Workspace to begin FULL automated migration**

**Expected Outcome**: A single PR with ~50-60 file changes, all following the same pattern, ready for human review and merge.
