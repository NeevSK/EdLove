# GitHub Copilot Workspace Prompt (AGGRESSIVE - Full Migration)

**Copy this entire prompt into a new GitHub Issue, then assign it to Copilot Workspace**

---

## Title
🚀 FULL UI Abstraction Layer Migration - All ~50+ Files

## Description

### Context
We've implemented a UI Abstraction Layer (`src/ui/index.ts`) to solve TypeScript stack overflow issues and optimize bundle size for low-end Android devices (2GB RAM, spotty 3G/4G in Sri Lankan schools). The abstraction layer uses direct imports from Gluestack UI components instead of the aggregate index.

**Already Migrated** ✅:
- `App.tsx`
- `src/screens/OnboardingScreen.tsx`

**Scope: MIGRATE ALL REMAINING FILES** (~50+ files across the entire `src/` directory)

This includes:
- All screens (`src/screens/**/*.tsx`)
- All components (`src/components/**/*.tsx`)
- All hooks (`src/hooks/**/*.ts`)
- Any other files importing from `@gluestack-ui/themed`

**Exclude**:
- `src/ui/index.ts` (this IS the abstraction layer, don't touch it)
- Test files (`*.test.tsx`, `*.steps.tsx`) - migrate these too, but they're lower priority

### Task
**Migrate EVERY file in `src/` that imports from `@gluestack-ui/themed` to use `@/ui` imports instead.**

### Pattern to Follow

**BEFORE** (❌ Don't do this):
```tsx
import { Box, Button, Text, VStack } from '@gluestack-ui/themed';
```

**AFTER** (✅ Do this):
```tsx
import { Box, Button, Text, VStack } from '@/ui';
```

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
