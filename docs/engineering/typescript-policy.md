# TypeScript Policy — Polymath Platform

**Status**: Active
**Created**: 2026-10-04
**Owner**: Platform Team

---

## Strictness Floor (Mandatory for All Packages)

All packages **must** extend `packages/typescript-config/base.json` which enforces:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true
}
```

These are non-negotiable minimums. New packages cannot opt out.

---

## Current Configuration

| Setting | Value | Source |
|---------|-------|--------|
| `strict` | `true` | `packages/typescript-config/base.json` |
| `noUncheckedIndexedAccess` | `true` | `packages/typescript-config/base.json` |
| `exactOptionalPropertyTypes` | `false` | **See Gap Below** |
| `noImplicitOverride` | `true` | `packages/typescript-config/base.json` |
| `noPropertyAccessFromIndexSignature` | `true` | `packages/typescript-config/base.json` |

---

## Gap: `exactOptionalPropertyTypes` — NOT YET ENABLED

### What It Does

When `exactOptionalPropertyTypes: true`, TypeScript distinguishes between:

```ts
interface User {
  name: string;           // required
  email?: string;         // optional — may be undefined OR missing
  phone?: string | undefined;  // optional — explicitly undefined allowed
}
```

With the flag **off** (current): `email?` and `phone?` are treated identically — both can be `undefined` or omitted.

With the flag **on**: 
- `email?` means the property may be **absent** (key not present) OR `undefined`
- `phone?` means the property may be **present with value `undefined`** but cannot be absent

This catches bugs where code assumes a property exists but it was never set.

### Why Not Enabled Yet

**~500 errors** across the monorepo. Enabling repo-wide would block all development.

Root causes:
1. **External types** (React Native, Expo, Supabase) don't use exact optionals
2. **Legacy code** uses `?` and `| undefined` interchangeably
3. **Zod schemas** and inferred types produce non-exact optionals
4. **Test utilities** and mocks often omit optional properties

### Migration Plan (Per-Package, Not Repo-Wide)

Per AGENTS.md: *"exactOptionalPropertyTypes is the next target (~500-error burn-down; adopt per-package with a dedicated cleanup, do NOT flip repo-wide)."*

#### Phase 1: Low-Hanging Fruit (Target: Q4 2026)
Enable in packages with **zero external dependencies** and **modern code**:
- `packages/typescript-config` ✅ (config package)
- `packages/schema` (pure Zod schemas)
- `packages/policies` (pure logic)

#### Phase 2: Core Logic (Target: Q1 2027)
Enable in core domain packages after Phase 1 validation:
- `packages/core` (after profiling)
- `packages/ui` (after component audit)

#### Phase 3: App Layer (Target: Q2 2027)
Enable in applications last (most external deps):
- `apps/gurudevi-mobile`
- `apps/edlove-web`
- `apps/gurudevi-marketingWeb`
- `apps/sanctuary-api`

### Per-Package Adoption Checklist

Before enabling in a package:

1. **Audit current errors**: `pnpm --filter <pkg> exec tsc --noEmit 2>&1 | grep -c "exactOptionalPropertyTypes"`
2. **Fix internal code**: Replace `prop?: Type` with `prop?: Type | undefined` where explicit undefined is needed
3. **Update test mocks**: Ensure mocks include all optional properties explicitly
4. **Run full suite**: `pnpm --filter <pkg> check-types && pnpm --filter <pkg> test`
5. **Document exceptions**: Any remaining `// @ts-expect-error` must have justification comment
6. **Update package tsconfig**: Add `"exactOptionalPropertyTypes": true` to package's `tsconfig.json`

### Tracking

| Package | Status | Error Count | Target |
|---------|--------|-------------|--------|
| `packages/typescript-config` | ✅ Ready | 0 | Q4 2026 |
| `packages/schema` | 🔄 Planned | ~15 | Q4 2026 |
| `packages/policies` | 🔄 Planned | ~8 | Q4 2026 |
| `packages/core` | ⏳ Blocked | ~280 | Q1 2027 |
| `packages/ui` | ⏳ Blocked | ~120 | Q1 2027 |
| `apps/*` | ⏳ Blocked | ~85 | Q2 2027 |

---

## Branded Types Over Primitives (Enforced)

Per AGENTS.md: *"Types over assertions. No `any`, no `as unknown as X`. Model the domain (`UserId`, not `string`) and let signatures be honest."*

### Required Patterns

```ts
// ❌ Bad
function getUser(id: string) { }

// ✅ Good
type UserId = string & { readonly __brand: unique symbol };
function getUser(id: UserId) { }
```

### Branding Utility

Use `packages/core/src/lib/brand.ts`:

```ts
import { brand } from '@repo/core/lib/brand';

type UserId = brand<string, 'UserId'>;
type SessionId = brand<string, 'SessionId'>;
```

All new domain identifiers **must** use branded types.

---

## No `any` / No Unsafe Assertions

```ts
// ❌ Forbidden
const data: any = fetchData();
const user = data as User;

// ✅ Required
const data = fetchData(); // properly typed
const user = parseUser(data); // with Zod schema validation
```

Use Zod schemas for all external boundaries (API, DB, config, env).

---

## Package Configuration Template

Every package's `tsconfig.json` must extend the base:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "tsBuildInfoFile": ".tsbuildinfo",
    "outDir": "dist",
    "rootDir": "src",
    // exactOptionalPropertyTypes: true  // Enable per package when ready
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

---

## CI Enforcement

- `pnpm check-types` runs on every PR (via `pr-guard.yml`)
- `exactOptionalPropertyTypes` errors are **not** treated as warnings — they block merge
- Per-package adoption tracked in this document

---

## Related Documents

- `AGENTS.md` — Quality Regulation, TypeScript policy
- `packages/typescript-config/base.json` — Strictness floor
- `docs/engineering/typescript-migration-plan.md` — Detailed migration steps (future)