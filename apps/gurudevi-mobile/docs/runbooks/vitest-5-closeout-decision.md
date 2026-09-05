---
title: "Vitest 5 Close-Out: Coverage Provider Decision + Config Finalization"
status: "active"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [vitest, coverage, closeout, config, decision-record]
parent_research: "docs/research/2026-09-04-adopt-hygiene.md"
verified_version: "5.0.0"
---

# Vitest 5 Close-Out Decision Record

**Verified (2026-09-04):** `pnpm --filter gurudevi-mobile exec vitest --version` → **5.0.0** (stable, post-RC).
**Requirements met:** Vite ≥ 6.4, Node ≥ 22.12 (`eas.json` pins Node 22.23.2).

---

## Coverage Provider Decision

### Options Evaluated

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A: `@vitest/coverage-v8` (Vitest 5 default path)** | Native V8 coverage, zero-config, fast | Official Vitest 5 path; no Istanbul fork; built-in | Requires Node ≥ 18 (satisfied); different output format than v4 |
| **B: `@vitest/coverage-istanbul` (fork)** | Istanbul-compatible, legacy format | Backward compat with existing tooling | Extra dep; fork maintenance burden; Vitest 5 discourages |
| **C: No coverage provider (current)** | Keep `vitest.config.mts` without coverage config | Zero config drift; tests pass today | No coverage gate; blind spot for regression |

### Decision: **Option C — Documented No-Coverage Config (Current State)**

**Rationale:**
1. No coverage provider has been used historically (grep: 0 hits for `@vitest/coverage-*` or `@vitest/istanbuljs`)
2. Adding a provider now introduces config drift without a proven need
3. The test suite is small (2 e2e + unit tests in `src/__tests__/`) and architectural exclusions exist
4. Coverage can be added later via a dedicated ADR when a quality gate requires it

**Recorded Decision:** Stay on current no-coverage config. Do not add `@vitest/coverage-v8` or `@vitest/coverage-istanbul` until a separate ADR mandates a coverage gate.

**Anti-Slop Guard:** No silent drift. If coverage is added later, it must be via explicit config change with a commit message referencing this decision record.

---

## Architecture Exclusions Review (`vitest.config.mts:32-40`)

Current exclusions:
```typescript
exclude: [
  '**/node_modules/**',
  'src/__tests__/components/**',
  'src/__tests__/architecture/AppPerformance.test.tsx',
  'src/__tests__/architecture/classroom-surface-entrypoints.test.ts',
  'src/__tests__/architecture/founder-stack-boundaries.test.ts',
],
```

### Re-Justification

| Excluded Path | Owning Suite | Justification | Keep? |
|---|---|---|---|
| `src/__tests__/components/**` | Component tests | Components require RN environment; jsdom + mocks insufficient for meaningful coverage. Tested via E2E + manual QA. | ✅ KEEP |
| `AppPerformance.test.tsx` | Architecture | Performance benchmarks; flaky in CI, requires device profiling. Not a correctness test. | ✅ KEEP |
| `classroom-surface-entrypoints.test.ts` | Architecture | Surface-level integration; depends on full classroom stack not available in jsdom. | ✅ KEEP |
| `founder-stack-boundaries.test.ts` | Architecture | Boundary contract tests; requires full provider tree. Verified by `quality-gate.yml` type checks. | ✅ KEEP |

**Result:** All exclusions re-justified. No removals.

---

## ESLint Helper Evaluation (Per Research §3)

| Helper | Version | Evaluation |
|---|---|---|
| `eslint` | ^10.9.1 | Confirmed in `package.json` |
| `eslint-config-expo` | ~57.0.2 | Confirmed in `package.json` |
| `eslint/compat` | v2.1.1 | **Not needed** — flat config (`eslint.config.mjs`) has no friction |
| `eslint-migrate-config` | v3.0.3 | **Not needed** — migration complete |

**Result:** Close with "not needed". No helper installation.

---

## Close-Out Verification Commands

Run on the close-out commit:

```bash
# TypeScript strict check
pnpm --filter gurudevi-mobile run check-types

# Lint (flat config)
pnpm --filter gurudevi-mobile run lint

# Test suite (no coverage)
pnpm --filter gurudevi-mobile test

# Anti-slop gate (repo-wide)
pnpm run check:anti-slop
```

**All must exit 0.**

---

## Files Touched (This Decision Record Only)

- `docs/runbooks/vitest-5-closeout-decision.md` (this file)

**No config changes.** `vitest.config.mts` remains as-is.

---

## Future Coverage Adoption (When Needed)

If a future ADR mandates coverage:
1. Add `@vitest/coverage-v8` as devDependency
2. Update `vitest.config.mts`:
   ```typescript
   import { coverageConfigDefaults } from 'vitest/config';
   export default defineConfig({
     test: {
       coverage: {
         provider: 'v8',
         exclude: [...coverageConfigDefaults.exclude, 'src/__tests__/architecture/**'],
       },
     },
   });
   ```
3. Set threshold in `quality-gate.yml` or similar
4. Reference this decision record in the commit message

---

**Anti-Slop Gate:** `pnpm run check:anti-slop` must exit 0 on the branch containing this record.