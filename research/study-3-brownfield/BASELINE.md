# Study 3: Baseline Specification (Phase 0)

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem Domain:** Offline Permission Evaluation & Authorization Snapshot Verification  
**Target Repository:** `EdLove` (Polymath Platform Monorepo)  
**Execution Timestamp:** 2026-11-11T22:00:00+05:30  

---

## 1. Commit and Source Provenance

- **Current HEAD Commit SHA:** `252bec65f746c362fec12472999cccfba187d0b9`
- **Branch:** `integrate/worlds-and-upstream`
- **Permanent Corrections Included in History:**
  - Commit `252bec65f746c362fec12472999cccfba187d0b9`: `fix(tests, governance): repair invalid-signature test causal sensitivity and resolve auth parity checker drift`
  - Modifies:
    1. `packages/core/src/logic/permissions/__tests__/localEvaluator.native.test.ts` (repaired fixture preconditions with valid policy version and future expiry; replaced wording-coupled console assertion with wording-independent behavioral assertions: `verifySnapshotSignature` invoked, decision denied, database policy query aborted).
    2. `scripts/check-authorization-parity.mjs` (repaired path to active `AuthClient.ts` after architectural refactoring of `AuthManager.ts`).

---

## 2. Working Tree Status

- **Subsystem Files Status:** `Clean` (All files under `packages/core/src/logic/permissions`, `packages/policies`, and `scripts/check-authorization-parity.mjs` are identical to HEAD commit `252bec65f`).
- **Global Monorepo Status:** Uncommitted tracking modifications exist in adjacent packages (`apps/gurudevi-web`, `packages/verger-core`, `apps/gurudevi-mobile/app/+native-intent.tsx`, and documentation drafts).
- **Isolation Requirement:** To preserve baseline integrity and prevent contamination of ongoing working-tree changes, all experimental runs must execute inside isolated `git worktree` instances anchored to commit `252bec65f746c362fec12472999cccfba187d0b9`.

---

## 3. Toolchain & Runtime Environment

| Component | Verified Specification | Execution Command | Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.22.2` | `node -v` | Confirmed |
| **pnpm** | `12.16.1` | `pnpm -v` | Confirmed |
| **TypeScript** | `7.1.0-beta` | `pnpm exec tsc -v` | Confirmed |
| **Vitest** | `5.1.0` | `pnpm --filter @repo/core exec vitest -v` | Confirmed |
| **OS Platform** | Windows 11 (x64) | PowerShell host | Confirmed |

---

## 4. Baseline Gate Executions

### Gate 1: Static Parity Audit (`check-authorization-parity.mjs`)
- **Command:** `node scripts/check-authorization-parity.mjs`
- **Exit Code:** `0`
- **Execution Duration:** `107.68 ms`
- **Raw Output:**
  ```text
  Authorization parity audit passed (58 resources, 5 actions; ZenStack/Cedar/snapshot checks plus 6 SQL migration classifications, without live privilege verification).
  ```
- **Finding:** Parity checker passes clean across all 58 declared resources and 5 core authorization actions.

### Gate 2: Behavioral Permission Test Suites (Native & Dynamic)
- **Command:** `pnpm --filter @repo/core test src/logic/permissions/__tests__/localEvaluator.native.test.ts src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts`
- **Exit Code:** `0`
- **Execution Duration:** `2.39 s` (reporter duration: 3.9 s)
- **Test Summary:**
  - `src/logic/permissions/__tests__/localEvaluator.native.test.ts`: 12 passed (12)
  - `src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts`: 14 passed (14)
  - **Total:** 26 passed, 0 failed (100% pass rate)

---

## 5. CI Workflow Intersections

| Workflow | Path | Trigger Event | Mandatory Gate? | Subsystem Checks Executed |
| :--- | :--- | :--- | :---: | :--- |
| **Monorepo Clockwork Guard** | `.github/workflows/pr-guard.yml` | `pull_request`, `push` to `main-dev` | **Yes (Blocking)** | `pnpm check-types`, `pnpm run audit:api-quality`, `pnpm run check:anti-slop`, `node --test scripts/tests/authorization-authorities.test.mjs` |
| **Deep Quality Audit** | `.github/workflows/quality-gate.yml` | Scheduled (`cron: 0 6 * * 1`), `workflow_dispatch` | **No (Scheduled)** | `pnpm run audit:authorization-parity`, `pnpm test`, `pnpm test --coverage` |

---

## 6. Environmental Limitations & Observed Tooling Flaws

1. **Pre-commit Linter Crash (ESLint 10 vs. SonarJS):**
   When invoking standard `git commit`, the husky pre-commit hook runs `lint-staged`, which executes `eslint --fix`. This currently crashes with:
   ```text
   TypeError: Cannot read properties of undefined (reading 'Void')
       at eslint-plugin-sonarjs/cjs/helpers/type.js:202:59
   ```
   **Impact:** Commits must be made with `--no-verify` or via MCP maintenance tools until `eslint-plugin-sonarjs` is updated or ESLint 10 compatibility is reconciled in `.lintstagedrc.cjs`.
2. **Dynamic Cedar WASM Substrate:**
   Dynamic Cedar policy evaluation tests (`localEvaluator.native.dynamic.test.ts`) require `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`. When disabled, the evaluator defaults strictly to static signed snapshots.
