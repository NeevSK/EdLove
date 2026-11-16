# E1 Acceptance Test Specification

**Subsystem:** Offline Permission Evaluation & Snapshot Cryptographic Verification  
**Module Under Test:** `packages/core/src/logic/permissions/localEvaluator.native.ts`  
**Harness Location:** `research/study-3-brownfield/acceptance-tests/e1-integrity-acceptance.test.ts`  
**Config Location:** `research/study-3-brownfield/acceptance-tests/vitest.config.ts`  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Status:** Prepared, Verified against Baseline (19/19 passing), Awaiting Human Authorization for E1 Implementation

---

## 1. Architectural Strategy & Design Principles

The E1 acceptance suite enforces independent verification of the local permission evaluation pipeline before, during, and after extracting snapshot integrity verification into a pure helper (`verifySnapshotIntegrity`).

### Core Design Rules:
1. **Implementation Agnosticism:** The tests treat `checkLocalPermission` as a black/gray-box PDP function. Tests do not assert on console log outputs, regex strings, or internal helper variable names.
2. **Causal Sensitivity (Beyond Outcome Assertions):** Simple boolean assertions (`expect(isAllowed).toBe(false)`) have low diagnostic entropy. The harness employs spy telemetry on `verifySnapshotSignature` and database query spies (`mockDrizzle.select`) to empirically prove that execution halted at the integrity gate rather than an unrelated upstream check.
3. **Physical Isolation:** The harness resides strictly outside the production source tree in `research/study-3-brownfield/acceptance-tests/` with its own hermetic Vitest configuration, preventing contamination of production packages.
4. **Differential Invariant Verification:** Once human approval is granted to extract the pure helper in E1, this acceptance suite will execute against both the original monolith and the refactored implementation to mathematically guarantee zero behavioral drift.

---

## 2. Test Case Catalog & Truth Table Traceability

The 19 automated acceptance tests (`ATC-01` through `ATC-19`) map directly to the 21 truth table rows established in `E1_BEHAVIORAL_CONTRACT.md`:

| Case ID | Suite Category | Contract Row | Description & Preconditions | Expected Assertion | Causal Verification Method |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **ATC-01** | Signature Verification | T01, T13 | Verifier receives complete snapshot payload matching DB state | `isAllowed === true` | `verifySpy` called once with full 10-field payload + signature. |
| **ATC-02** | Signature Verification | T13 | Snapshot cryptographic signature is corrupted or invalid | `isAllowed === false` | Fails closed on invalid signature. |
| **ATC-03** | Signature Verification | T13 | Invalid signature halts evaluation immediately | `isAllowed === false` | `verifySpy` called; `mockDrizzle.select` is NOT called (causal proof). |
| **ATC-04** | Signature Verification | T13 | Attacker tampers with permissions payload retaining valid signature | `isAllowed === false` | Ed25519 payload hash mismatch triggers rejection. |
| **ATC-05** | Decision Outcomes | T01 | Valid snapshot with explicit positive permission (`read: true`) | `isAllowed === true` | Valid static grant passes through gate 8/9. |
| **ATC-06** | Decision Outcomes | T02 | Snapshot contains explicit negative permission (`read: false`) | `isAllowed === false` | Gate 8 short-circuits on boolean false. |
| **ATC-07** | Decision Outcomes | T03 | Domain action mapping (`resolve` $\rightarrow$ `read`) | `isAllowed === true` | `cedarActionFor` resolves mapped action correctly. |
| **ATC-08** | Scope Isolation | T04 | Snapshot record does not exist in SQLite database | `isAllowed === false` | Gate 1 fails closed on `null` record. |
| **ATC-09** | Scope Isolation | T05 | Snapshot belongs to a different `userId` (account boundary) | `isAllowed === false` | Gate 2 fails closed on user mismatch. |
| **ATC-10** | Scope Isolation | T06 | Snapshot `activeBondId` does not match active user session | `isAllowed === false` | Gate 3 fails closed on bond mismatch. |
| **ATC-11** | Scope Isolation | T07–T09 | Snapshot `activeEntityId` does not match active entity | `isAllowed === false` | Gate 4 fails closed on entity mismatch. |
| **ATC-12** | Freshness Boundaries | T10, T11 | Bonded session snapshot `policyVersion` does not match DB hash | `isAllowed === false` | Gate 5 fails closed on stale policy version. |
| **ATC-13** | Freshness Boundaries | T12 | Bonded session lacks database policy hash | `isAllowed === false` | Gate 5 fails closed when policy substrate unverified. |
| **ATC-14** | Temporal Boundaries | T14 | Snapshot `expiresAt` timestamp is in the past | `isAllowed === false` | Gate 7 fails closed on expired token. |
| **ATC-15** | Temporal Boundaries | T15 | Snapshot `expiresAt` string is unparseable (`'not-a-date'`) | `isAllowed === false` | Gate 7 fails closed on `NaN` timestamp. |
| **ATC-16** | Fault Tolerance | T16 | Permissions column contains corrupted / invalid JSON string | `isAllowed === false` | Outer boundary catches SyntaxError and fails closed. |
| **ATC-17** | Fault Tolerance | T17 | Permissions dictionary contains non-boolean value (`'granted'`) | `isAllowed === false` | Gate 8 defaults non-boolean values to false. |
| **ATC-18** | Fault Tolerance | T18 | Requested resource is not declared in snapshot permissions | `isAllowed === false` | Gate 8 defaults undeclared resources to false. |
| **ATC-19** | Fault Tolerance | T21 | SQLite database throws unhandled Disk I/O or locking error | `isAllowed === false` | Outer catch handles error and returns false without crash. |

*(Note: T19 and T20 cover dynamic Cedar WASM engine evaluation, which is verified in `localEvaluator.native.dynamic.test.ts` where WASM runtime initialization is exercised).*

---

## 3. How to Execute the Acceptance Suite

### In Main Repository Checkout:
```powershell
pnpm --filter @repo/core exec vitest run --config ../../research/study-3-brownfield/acceptance-tests/vitest.config.ts
```

### In Isolated Worktree (`.tmp-worktrees/exp-e1`):
```powershell
pnpm --prefix C:/x/.tmp-worktrees/exp-e1/packages/core exec vitest run --config C:/x/research/study-3-brownfield/acceptance-tests/vitest.config.ts
```

---

## 4. Current Baseline Verification Record

- **Test Files Run:** 1 (`e1-integrity-acceptance.test.ts`)
- **Total Tests:** 19
- **Passing:** 19
- **Failing:** 0
- **Execution Time:** ~1.25s
- **Verification Result:** Passed cleanly on commit `252bec65f746c362fec12472999cccfba187d0b9`.
