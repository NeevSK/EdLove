# Study 3: Initial Findings & Empirical Evidence Ledger (Phase 6)

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Offline Permission Evaluation & Authorization Snapshot Verification  
**Repository Target:** `EdLove` (`c:\x`)  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  

---

## 1. Observed Facts (Grounded in Verified Substrate)

| ID | Finding | Source / File | Commit / Ref | Evidence Status |
| :--- | :--- | :--- | :--- | :--- |
| **FACT-01** | The baseline repository HEAD commit contains the permanent corrections for causal test sensitivity and parity audit path alignment. | `git log -n 1` | `252bec65f746c362fec12472999cccfba187d0b9` | **Verified** (`git rev-parse HEAD` returns `252bec65f`) |
| **FACT-02** | The authorization parity checker references `AuthClient.ts` to assert that client-side anonymous sign-in invocation is preserved. | `scripts/check-authorization-parity.mjs` | `252bec65f` | **Verified** (L168 & L266 inspect `packages/core/src/logic/auth/AuthClient.ts`) |
| **FACT-03** | Anonymous authentication is actively enabled in Supabase configuration and invoked in the mobile welcome route. | `apps/gurudevi-mobile/supabase/config.toml`, `apps/gurudevi-mobile/app/welcome.tsx` | `162451467` | **Verified** (`enable_anonymous_sign_ins = true` in config.toml; L17 of welcome.tsx invokes `authAPI.signInAnonymously()`) |
| **FACT-04** | Pre-commit husky hooks currently fail when invoking ESLint 10 due to an external plugin crash in `eslint-plugin-sonarjs@4.2.2`. | `.husky/pre-commit`, `.lintstagedrc.cjs` | `252bec65f` | **Verified** (`TypeError: Cannot read properties of undefined (reading 'Void')` in type.js:202) |
| **FACT-05** | The native and dynamic permission test suites pass 100% (26 of 26 tests) on the clean baseline. | `packages/core/src/logic/permissions/__tests__/` | `252bec65f` | **Verified** (`pnpm --filter @repo/core test ...` exits with Code 0 in 2.39s) |

---

## 2. Experimental Results (Differential Mutation & Refactoring Runs)

| ID | Experiment / Mutation | Command Executed | Expected vs. Actual Result | Finding Status |
| :--- | :--- | :--- | :--- | :--- |
| **EXP-01** | **Original Signature-Bypass Mutation on Unrepaired Fixture** | `pnpm --filter @repo/core test localEvaluator.native.test.ts` | **Expected:** Fail<br/>**Actual:** Passed 12/12 (Exit 0) | **Defect Masking Discovered:** Test passed because mock lacked `policyVersion`, triggering an early policy-stale denial rather than evaluating the signature check. |
| **EXP-02** | **Signature-Bypass Mutation on Repaired Fixture** | `pnpm --filter @repo/core test localEvaluator.native.test.ts` | **Expected:** Fail<br/>**Actual:** Failed (Exit 1) at L275: `AssertionError: expected true to be false` | **Causal Detection Verified:** Both native test and dynamic Cedar test independently reject signature bypass. |
| **EXP-03** | **Allow/Deny Inversion Mutation** | `pnpm --filter @repo/core test localEvaluator.native*.test.ts` | **Expected:** Fail<br/>**Actual:** 9 of 26 tests failed (Exit 1) | **Symmetric Behavioral Coverage:** Both positive grants (`true` $\rightarrow$ `false`) and negative denials (`false` $\rightarrow$ `true`) are caught by unit and dynamic suites. |
| **EXP-04** | **Cedar Schema Action Deletion (`delete`)** | `node scripts/check-authorization-parity.mjs` | **Expected:** Fail<br/>**Actual:** Failed (Exit 1): `Cedar is missing action "delete"` | **Vocabulary Parity Verified:** Parity checker successfully prevents schema-level vocabulary drift. |
| **EXP-05** | **Behavior-Preserving Query Accessor Refactoring** | `node scripts/check-authorization-parity.mjs` vs. `pnpm test ...` | **Unit Tests:** Passed 26/26 (Exit 0)<br/>**Parity Checker:** Failed (Exit 1): `Local evaluator must verify the signed snapshot contract` | **Governance Fragility Verified:** Unchaining `db.query.permissionSnapshots.findFirst` to an aliased variable broke the static linter while runtime behavior remained 100% correct. |

---

## 3. Interpretations (Analytical Deductions)

1. **Outcome Correctness $\neq$ Causal Verification:**
   Asserting a broad terminal outcome (`expect(isAllowed).toBe(false)`) without verifying that the causal branch executed creates false confidence. In EXP-01, the test suite maintained a 100% pass rate while the cryptographic tamper branch was completely dead code.
2. **Lexical String Governance Imposes an Evolution Tax:**
   Static audits that check code via regex or string inclusion (`includes('permissionSnapshots.findFirst')`, `includes('this.authPort.signInAnonymously()')`) introduce high maintenance friction. They do not enforce architectural contracts; they enforce syntactic immutability.
3. **Behavioral Invariance Requires Stateful Boundary Assertions:**
   True evolution resilience is achieved when tests assert interaction with external boundaries (e.g. `expect(verifySpy).toHaveBeenCalledWith(...)`, `expect(mockDrizzle.select).not.toHaveBeenCalled()`) rather than source code strings or log messages.

---

## 4. Unresolved Questions

1. **E2 Policy Ambiguity:**
   When adding the domain verb `"archive"`, should `Lesson` records be treated as soft-archived (`"update"`) or deleted (`"delete"`)? This requires product authority clarification before implementation.
2. **E3 Security Boundary:**
   Does offline access in remote schools justify a bounded (e.g. 24-hour) read-only grace period when snapshots expire without connectivity, or must authorization fail closed immediately at the second of expiration?
3. **E4 Institutional Entity Resolution:**
   Should a School-scoped snapshot implicitly authorize child Classroom resources offline if local SQLite proves containment, or must every entity have an explicit server-issued snapshot record?

---

## 5. Recommendations for Subsequent Experimental Phases

1. **Do Not Implement E2–E4 Prematurely:**
   In accordance with the completion criterion, keep changes E2–E4 in proposed status until human review of the baseline and subsystem map is finalized.
2. **Formalize Acceptance Suites in an Isolated Directory:**
   Prior to implementing E1 through E4, author behavioral acceptance suites under `research/study-3-brownfield/acceptance-tests/` so that implementation agents cannot alter their own evaluation criteria.
3. **Execute All Four Conditions (A, B, C, D):**
   Compare the four developer paradigms across the exact same sequence to measure whether deterministic controls reduce long-term defects or merely accumulate brownfield maintenance overhead.
