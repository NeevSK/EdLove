# Implementation Plan: UI Abstraction Layer

**Objective**: Create `src/ui/index.ts` as single source of truth for UI components to solve TypeScript stack overflow and optimize bundle size.

---

## Proposed Changes

### [NEW] [src/ui/index.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/ui/index.ts)

Create the main UI abstraction layer with direct imports from Gluestack UI components.

**Contents**:
- Layout components (Box, Center, HStack, VStack)
- Loading states (Spinner)
- Typography (Text, Heading)  
- Form components (Input, Button, Select)
- Provider (GluestackUIProvider)

**Pattern**: Use direct imports like `'@gluestack-ui/themed/build/components/Box'` instead of aggregate index.

---

### [NEW] [src/ui/README.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/ui/README.md)

Create usage guide and documentation for the UI abstraction layer.

**Contents**:
- Usage rules (DO/DON'T examples)
- How to add new components
- Why this pattern exists
- Common troubleshooting

---

### [MODIFY] [tsconfig.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/tsconfig.json)

Add path alias for clean imports.

**Changes**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)

Migrate from direct Gluestack imports to UI abstraction layer.

**Before**:
```tsx
import { GluestackUIProvider, Box } from '@gluestack-ui/themed';
import { Spinner } from '@gluestack-ui/themed/build/components/Spinner';
import { Center } from '@gluestack-ui/themed/build/components/Center';
```

**After**:
```tsx
import { GluestackUIProvider, Box, Spinner, Center } from '@/ui';
```

---

### [MODIFY] [src/screens/AuthScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx)

Migrate from direct Gluestack imports to UI abstraction layer.

**Pattern**: Replace all `@gluestack-ui/themed` imports with `@/ui` imports.

---

### [MODIFY] [src/screens/OnboardingScreen.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/OnboardingScreen.tsx)

Migrate from direct Gluestack imports to UI abstraction layer.

**Pattern**: Replace all `@gluestack-ui/themed` imports with `@/ui` imports.

---

## Verification Plan

### Automated Tests

1. **TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   **Expected**: No stack overflow, compilation completes in < 30s

2. **Bundle Analysis**:
   ```bash
   npx expo export --platform android
   npx source-map-explorer dist/bundles/*.js
   ```
   **Expected**: Gluestack UI bundle < 150KB

3. **Runtime Verification**:
   ```bash
   npm test
   ```
   **Expected**: All BDD tests pass (auth_refinement, invitation_welcome)

### Manual Verification

1. **Import Resolution**: Verify imports work in VS Code (no red squiggles)
2. **App Launches**: Run `npm start` and verify app loads without errors
3. **UI Renders**: Check that all screens render correctly with new imports

---

## Success Criteria

- [ ] `src/ui/index.ts` created with all current components
- [ ] `src/ui/README.md` created with usage guide
- [ ] `tsconfig.json` updated with path alias
- [ ] `App.tsx` migrated to use `@/ui` imports
- [ ] `AuthScreen.tsx` migrated to use `@/ui` imports
- [ ] `OnboardingScreen.tsx` migrated to use `@/ui` imports
- [ ] TypeScript compilation completes without stack overflow
- [ ] All tests pass
- [ ] Bundle analysis shows Gluestack UI < 150KB

---

## Rollback Plan

If issues arise:

1. Revert `src/ui/index.ts` to re-export from aggregate:
   ```typescript
   export * from '@gluestack-ui/themed';
   ```

2. Full rollback via git:
   ```bash
   git revert <commit-hash>
   ```
