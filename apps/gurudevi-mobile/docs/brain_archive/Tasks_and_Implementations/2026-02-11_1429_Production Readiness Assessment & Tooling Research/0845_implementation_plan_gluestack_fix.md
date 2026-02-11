# Implementation Plan: Resolving Gluestack Export Errors

The user reports that `App.tsx` has errors related to missing `Spinner` and `Center` exports from `@gluestack-ui/themed`, despite these exports being physically present in `node_modules`.

## Proposed Changes

### [Component Name]

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)
- Reformat the `@gluestack-ui/themed` import to use direct sub-module paths for `Spinner` and `Center`. This bypasses the resolution bottleneck in the aggregate index.
- Example: `import { Spinner } from '@gluestack-ui/themed/build/components/Spinner';`

## User Review Required

> [!WARNING]
> I detected a `package-lock.json` file in `apps/gurudevi-mobile`, which suggests an `npm install` was run in a `pnpm` workspace. This can cause inconsistent `node_modules` and resolution errors in some IDEs.
> I recommend deleting `apps/gurudevi-mobile/node_modules` and `apps/gurudevi-mobile/package-lock.json`, then running `pnpm install` from the root.

## Verification Plan

### Automated Tests
- Run `npx tsc App.tsx --noEmit --esModuleInterop --jsx react-jsx --skipLibCheck --target esnext --moduleResolution node` to ensure type resolution works under standard flags.
- Verify `AuthScreen.tsx` (which uses the same imports) continues to resolve correctly.

### Manual Verification
- The user will check if the red squiggles in `App.tsx` disappear after the import rewrite.
