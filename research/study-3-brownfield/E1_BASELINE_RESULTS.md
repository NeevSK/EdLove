# E1 Baseline Verification Results

**Experiment:** Study 3 — E1 Acceptance Test Preparation  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Subsystem:** Offline Permission Evaluation & Snapshot Cryptographic Verification  
**Target File:** `packages/core/src/logic/permissions/localEvaluator.native.ts`  
**Date of Run:** 2026-11-11  
**Execution Environment:** Windows x64, Node.js v24.22.2, pnpm 10.4.1, Vitest 5.1.0  

---

## 1. Summary of Baseline Verification Gates

All verification gates were executed against the pristine baseline commit `252bec65f746c362fec12472999cccfba187d0b9` across both the primary repository checkout and the isolated worktree (`.tmp-worktrees/exp-e1`):

```
+--------------------------------------------------------------------------------------------------+
| Gate                            | Target Module                     | Passed / Total | Time   | Code |
+--------------------------------------------------------------------------------------------------+
| 1. Authorization Parity Audit   | check-authorization-parity.mjs    | 58 res / 5 act | 0.11s  | 0    |
| 2. Native Snapshot PDP Suite    | localEvaluator.native.test.ts     | 12 / 12        | 0.24s  | 0    |
| 3. Dynamic Cedar WASM Suite     | localEvaluator.native.dynamic.ts  | 14 / 14        | 0.24s  | 0    |
| -- Combined Native Unit Total   | (Combined vitest execution)       | 26 / 26        | 2.33s  | 0    |
| 4. Independent Acceptance Suite | e1-integrity-acceptance.test.ts   | 19 / 19        | 1.25s  | 0    |
| 5. Isolated Worktree Execution  | (.tmp-worktrees/exp-e1)           | 19 / 19        | 1.66s  | 0    |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Gate-by-Gate Detailed Empirical Logs

### Gate 1: Authorization Parity Audit
- **Command:** `node scripts/check-authorization-parity.mjs`
- **Exit Code:** `0`
- **Output:**
  ```text
  Authorization parity audit passed (58 resources, 5 actions; ZenStack/Cedar/snapshot checks plus 6 SQL migration classifications, without live privilege verification).
  ```
- **Finding:** Parity passes with zero drift following the path repair to `AuthClient.ts` in commit `252bec65f`.

---

### Gate 2 & 3: Native Permission Evaluation Unit Suites
- **Command:**
  ```powershell
  pnpm --filter @repo/core test src/logic/permissions/__tests__/localEvaluator.native.test.ts src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts
  ```
- **Exit Code:** `0`
- **Output:**
  ```text
   ✓ src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts (14 tests) 240ms
   ✓ src/logic/permissions/__tests__/localEvaluator.native.test.ts (12 tests) 243ms

   Test Files  2 passed (2)
        Tests  26 passed (26)
     Duration  2.39s (import 71%, transform 19%, tests 8%, worker 1%)
  ```
- **Diagnostic Precision Observation:**
  Following the causal sensitivity fix in `localEvaluator.native.test.ts`, the tamper test confirms:
  1. `verifySnapshotSignature` is called with the exact tampered payload.
  2. Access is denied (`isAllowed === false`).
  3. `mockDrizzle.select` is NOT called (confirming policy queries are never reached).

---

### Gate 4: Independent E1 Acceptance Test Suite
- **Command:**
  ```powershell
  pnpm --filter @repo/core exec vitest run --config ../../research/study-3-brownfield/acceptance-tests/vitest.config.ts
  ```
- **Exit Code:** `0`
- **Output:**
  ```text
   RUN  v5.1.0 C:/x/research/study-3-brownfield/acceptance-tests

   ✓ e1-integrity-acceptance.test.ts (19 tests) 38ms

   Test Files  1 passed (1)
        Tests  19 passed (19)
     Duration  1.25s (import 78%, transform 17%, tests 4%, worker 1%)
  ```
- **Test Coverage Breakdown:**
  - **Suite 1 (Signature Verification & Causal Short-Circuiting):** 4 tests (ATC-01 through ATC-04) — all passed.
  - **Suite 2 (Decision Outcomes & Verb Mapping):** 3 tests (ATC-05 through ATC-07) — all passed.
  - **Suite 3 (Scope & Identity Isolation):** 4 tests (ATC-08 through ATC-11) — all passed.
  - **Suite 4 (Policy Freshness & Temporal Expiration):** 4 tests (ATC-12 through ATC-15) — all passed.
  - **Suite 5 (Payload Malformation & Fault Tolerance):** 4 tests (ATC-16 through ATC-19) — all passed.

---

### Gate 5: Isolated Worktree Verification (`.tmp-worktrees/exp-e1`)
- **Command:**
  ```powershell
  pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core exec vitest run --config C:/x/research/study-3-brownfield/acceptance-tests/vitest.config.ts
  ```
- **Exit Code:** `0`
- **Output:**
  ```text
   RUN  v5.1.0 C:/x/research/study-3-brownfield/acceptance-tests

   ✓ e1-integrity-acceptance.test.ts (19 tests) 35ms

   Test Files  1 passed (1)
        Tests  19 passed (19)
     Duration  1.66s (import 77%, transform 19%, tests 3%, worker 1%)
  ```
- **Finding:** The worktree environment has zero discrepancy from the primary checkout and is completely ready for isolated experimentation.

---

## 3. Preparation Verification Checklist

| Criterion | Requirement | Status | Evidence |
| :--- | :--- | :---: | :--- |
| **Behavioral Contract** | Exhaustive truth table covering all conditions | **COMPLETE** | `E1_BEHAVIORAL_CONTRACT.md` (21 truth rows T01–T21). |
| **Ambiguity Catalog** | Identify latent edge cases and potential defects | **COMPLETE** | `E1_AMBIGUITIES.md` (AMB-01 through AMB-05 documented). |
| **Acceptance Suite** | Implementation-agnostic tests under isolated directory | **COMPLETE** | `acceptance-tests/e1-integrity-acceptance.test.ts` (19 tests). |
| **Test Config** | Hermetic test execution configuration | **COMPLETE** | `acceptance-tests/vitest.config.ts`. |
| **Worktree Isolation** | Dedicated git worktree anchored to baseline | **COMPLETE** | `E1_WORKTREE.md` (`.tmp-worktrees/exp-e1` @ `252bec65f`). |
| **Baseline Ledger** | Empirical logs across all gates | **COMPLETE** | `E1_BASELINE_RESULTS.md` (this document). |
| **Production Source Invariant** | Zero modifications to production source code | **CONFIRMED** | `git status` shows zero tracked modifications in `packages/core`. |
| **Human Review Gate** | Stop and request human confirmation before implementing E1 | **ENFORCED** | Refactoring has NOT been started. Awaiting user approval. |
