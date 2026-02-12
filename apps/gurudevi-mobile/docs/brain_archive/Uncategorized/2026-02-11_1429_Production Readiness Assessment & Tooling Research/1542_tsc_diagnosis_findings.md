# TypeScript Compilation Error Diagnosis - Findings

## Date
February 10, 2026 - 15:41 IST

## Summary
Full project `tsc --noEmit` compilation consistently fails with `RangeError: Maximum call stack size exceeded`, indicating a deep recursion or circular type dependency. However, **individual files and modules compile successfully**, revealing genuine TypeScript errors.

---

## What We Found

### 1. Stack Overflow Issue
- **Full Project Build**: `pnpm exec tsc --noEmit` → Stack overflow (100% failure rate)
- **Root Cause**: Likely a circular type reference or deeply nested generic type in the dependency graph
- **Not Caused By**: Library conflicts (resolved via `skipLibCheck: true`)

### 2. Successful Individual Compilations
The following compiled **without stack overflow**:
- ✅ `src/store/useStore.ts` - **0 errors**
- ✅ `src/lib/api/index.ts` - **0 errors**
- ✅ `src/lib/api/auth.ts` - **0 errors**
- ❌ `src/navigation/TabNavigator.tsx` - **35 errors** (but compiled)
- ❌ `App.tsx` - **21 errors** (but compiled)

### 3. Known Errors (From Individual Runs)
#### `TabNavigator.tsx` (35 errors)
- Missing `children` prop in React components
- Module resolution issues with `./SelfScreen`
- `--jsx` flag not set errors

#### `App.tsx` (21 errors)  
- Missing `children` prop in `NavigationContainer`
- `resolveJsonModule` issues with i18n config

### 4. `tsconfig.json` Updates Applied
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

---

## Proposed Solution Strategy

### Option A: Bypass Full Build (Recommended for Now)
Since individual files compile, we can:
1. **Temporarily disable full `tsc` checks** in CI/CD
2. **Use Metro bundler** as the primary error checker (it will catch runtime issues)
3. **Fix errors file-by-file** using targeted `tsc [filename] --noEmit`
4. **Revisit the stack overflow** after fixing the 56+ known errors

### Option B: Find & Fix the Circular Type (Long-term)
1. Use `tsc --extendedDiagnostics` to trace the recursion
2. Identify the specific type causing infinite inference
3. Refactor the problematic type (likely in a shared types file or complex generic)

---

## Immediate Next Steps

1. **Fix the 56+ known errors** in `TabNavigator.tsx` and `App.tsx`
2. **Run individual file checks** on all screens and components
3. **Use Metro bundler** (`pnpm expo start`) to validate runtime correctness
4. **Return to stack overflow** only after codebase is cleaner

---

## Status
- ✅ Diagnosis complete
- ⏳ Awaiting decision on fix strategy
- 📋 **56+ concrete errors identified** and ready to fix
