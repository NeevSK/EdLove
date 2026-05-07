# Systematic Healing Agent Operations: Gluestack v2 → v3

This document outlines the systematic, automated procedure for "healing" the codebase following the Gluestack v3 / NativeWind migration. Follow these operations to achieve a zero-error build state.

## Operation 1: Data-Driven Audit
Before any code changes, run the analysis script to map the state of errors.

```powershell
# Run the analysis
node scripts/refactor/analyze-errors.mjs packages/self/type_errors_self_v5.txt
```

## Operation 2: Codemod - The Primitives Sweep
Target the most frequent Type Errors (TS2322) where legacy props are passed to v3 primitives.

### Target Patterns:
1.  **`sx` Prop Removal**: Convert `sx={{ ... }}` to `className="..."` or `style={{ ... }}`.
2.  **Layout Prop Migration**: Move `p`, `m`, `px`, `py`, `mt`, `mb`, `gap`, `justifyContent`, `alignItems` into `className`.
3.  **Text Prop Migration**: Move `size`, `bold`, `italic`, `color` into `className`.

### Mapping Strategy (Reference: apps/gurudevi-mobile/docs/Core/ui-development-guide.md):
- `$1` -> `1` (e.g., `p-1`)
- `$2` -> `2` (e.g., `p-2`)
- `$4` -> `4` (e.g., `p-4`)
- `justifyContent="center"` -> `justify-center`
- `alignItems="center"` -> `items-center`

## Operation 3: Component API Alignment
Resolve breaking changes in component APIs.

### 1. Toast API
Gluestack v3 Toast (`ToastContextType`) has a changed signature for `.show()`.
- Use the `useSanctuaryToast` hook from `@repo/ui` which handles the v3 complexity.

### 2. HStack / VStack
- Change `spacing` to `space` or use `className="gap-X"`.

## Operation 4: Import Normalization
Ensure all UI primitives are sourced from `@repo/ui`.

```tsx
// ❌ Legacy
import { Box } from '@gluestack-ui/themed';
// ✅ Modern
import { Box } from '@repo/ui';
```

## Operation 5: Iterative Package Verification
Run type-checking on the specific package being healed.

```powershell
# Example: Healing the 'self' package
pnpm --filter @repo/self exec tsc --noEmit
```

## Agent Instructions for Surgical Healing
When the agent is tasked to "Heal [File]", it must:
1.  Read the file and identify any `sx` or legacy props.
2.  Cross-reference with the `tsc` error message for that file.
3.  Apply the `className` conversion using Tailwind classes corresponding to the theme tokens.
4.  Remove any unused imports (like `Theme` if no longer needed for styles).
5.  Verify the fix by re-running the package-level `tsc`.

### Operation 3: Universal Prop Sweep (SAFE)
**Strategy**: Migrate legacy literal props (`color`, `textAlign`, `mt`, etc.) to NativeWind utilities.
- **Script**: `node scripts/refactor/universal-sweep.mjs <path>`
- **Safety Rule**: **NEVER** match props with logic (`?`, `:`, `&&`). Only match simple string literals or word-based braces.
- **Outcome**: Resolves ~80% of prop-based type errors.

### Operation 4: Primitive Mapping (The Bridge)
**Strategy**: Swap standard React Native primitives for Sanctuary UI primitives to enable `className` type safety.
- **Task**: 
  - Change `import { View } from 'react-native'` to use `Box` from `@repo/ui`.
  - Change `import { Text } from 'react-native'` to use `Text` from `@repo/ui`.
- **Outcome**: Fixes "Property className does not exist" errors on inherited components.

## Operation 7: Decision Strategy & Thresholds

To maximize stability and prevent "yo-yo" error counts, apply the following threshold-based strategy:

### 1. The Script Threshold (> 100 Errors)
When a package has **more than 100 cumulative errors**, use **Iterative Multi-Stage Sweeps**.
- **Strategy**: Develop sequential script versions (e.g., `heal-self-v4`, `v5`, `v6`).
- **Logic**: Each version should target a specific, documented category (e.g., imports in v4, syntax boundaries in v5, colors in v6).
- **Validation**: Run `audit-errors.ps1` after each script version to measure progress.

### 2. The Manual Threshold (< 100 Errors)
When a package drops **under 100 cumulative errors**, transition to **File-by-File Surgical Healing**.
- **Strategy**: Manually resolve remaining TS errors one file at a time using `replace_file_content`.
- **Reasoning**: Below this threshold, regex-based scripts often introduce more "edge-case" breakage than they solve.
- **Commit**: Commit individual files as they reach a zero-error state.

### 3. Verification & Commit Workflow
- **Fix Individual**: Resolve errors for a specific package.
- **Commit Early**: Use `git commit --no-verify` to preserve progress once a package's base dependencies (like `@repo/ui`) are clean.
- **Full Verification**: Only perform a full Turbo build check once the manual pass for the target package is complete.

---
*Created on 2026-04-17 for Gurudevi Platform Healing.*
*Update: Established Multi-Stage Sweep System and Error Threshold Strategy.*

