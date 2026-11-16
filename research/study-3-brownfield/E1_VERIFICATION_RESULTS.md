# E1 Verification Results & Behavioral Invariance Ledger

**Subsystem:** Offline Permission Evaluation & Snapshot Cryptographic Verification  
**Module:** `packages/core/src/logic/permissions/signature.ts` & `localEvaluator.native.ts`  
**Anchor Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Execution Context:** `.tmp-worktrees/exp-e1`  
**Date:** 2026-11-11  

---

## 1. Post-Implementation Gate Results

All gates were executed inside `C:\x\.tmp-worktrees\exp-e1`:

```
+--------------------------------------------------------------------------------------------------+
| Verification Gate               | Target Suite                      | Passed / Total | Time   | Code |
+--------------------------------------------------------------------------------------------------+
| 1. Original Native Unit Suites  | localEvaluator.native*.test.ts    | 26 / 26        | 1.86s  | 0    |
|    - Snapshot PDP Unit Suite    | localEvaluator.native.test.ts     | 12 / 12        | 0.22s  | 0    |
|    - Dynamic Cedar WASM Suite   | localEvaluator.native.dynamic.ts  | 14 / 14        | 0.24s  | 0    |
| 2. E1 Independent Acceptance    | e1-integrity-acceptance.test.ts   | 19 / 19        | 1.18s  | 0    |
| 3. Authorization Parity Audit   | check-authorization-parity.mjs    | 58 res / 5 act | 0.11s  | 0    |
| 4. TypeScript Subsystem Check   | tsc (signature & evaluator)       | 0 errors       | 2.10s  | 0    |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Signature-Bypass Mutation Experiment

To verify that the refactored code retains high diagnostic sensitivity, the signature-bypass fault was introduced in `C:\x\.tmp-worktrees\exp-e1\packages\core\src\logic\permissions\localEvaluator.native.ts`:

```diff
-    if (!isSignatureValid) {
+    // MUTATION: signature check bypass
+    if (false && !isSignatureValid) {
       console.error('[LocalEvaluator.native] Cryptographic Tamper Detected on mobile permission snapshot!');
       return false;
     }
```

### Mutation Detection Results:
- **Native Unit Suite:** Detected and rejected!
  - `localEvaluator.native.test.ts`: FAILED at line 283 (`expected true to be false`).
  - `localEvaluator.native.dynamic.test.ts`: FAILED at line 135 (`expected true to be false`).
- **Independent Acceptance Suite:** Detected and rejected!
  - `ATC-02 (Invalid signature)`: FAILED (`expected true to be false`).
  - `ATC-03 (Causal short-circuit)`: FAILED (`expected true to be false`).
  - `ATC-04 (Tampered permissions)`: FAILED (`expected true to be false`).
  - All 16 other tests (scope, freshness, expiration, verb mapping) passed independently.
- **Recovery:** Reverting the mutation immediately restored 100% test pass rate (26/26 native, 19/19 acceptance).

---

## 3. Causal Short-Circuiting & Invariance Verification

1. **Downstream Query Halting:**
   Both `localEvaluator.native.test.ts` (line 285) and `e1-integrity-acceptance.test.ts` (line 209) assert:
   ```typescript
   expect(mockDrizzle.select).not.toHaveBeenCalled();
   ```
   Confirmed: When signature verification fails, downstream SQLite and Cedar policy queries are never reached.
2. **Behavioral Invariance Over Identical Fixtures:**
   - **Valid Snapshots (T01):** Grant access (`isAllowed === true`).
   - **Explicit Denies (T02):** Deny access (`isAllowed === false`).
   - **Mapped Verbs (T03):** Mapped correctly via `cedarActionFor`.
   - **Expired Snapshots (T14):** Denied access by orchestrator expiration check.
   - **Malformed Expiries (T15):** Denied access by `!Number.isFinite(expiresAt.getTime())`.
   - **User Mismatch (T05):** Denied access by orchestrator account boundary check.
   - **Bond Mismatch (T06):** Denied access by orchestrator bond boundary check.
   - **Entity Mismatch (T07–T09):** Denied access by orchestrator scope boundary check.
   - **Stale Policy Hash (T10–T12):** Denied access by orchestrator freshness check.

---

## 4. AMB-04 Investigation (Dynamic Cedar WASM Fallback)

As instructed, AMB-04 was investigated separately prior to declaring the baseline acceptable:

### Analysis of Logic ([`localEvaluator.native.ts` lines 130–188](file:///c:/x/.tmp-worktrees/exp-e1/packages/core/src/logic/permissions/localEvaluator.native.ts#L130-L188)):
- **If `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR !== 'true'`:** Dynamic Cedar is not evaluated; only the server-signed snapshot is used.
- **If `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`:**
  - If snapshot denies (`!isAllowed`), line 129 returns `false` immediately without evaluating WASM.
  - If snapshot allows (`isAllowed === true`), evaluator compiles local policies from SQLite and executes `evaluateShape2`.
  - If `evaluateShape2` throws an exception (e.g. WASM load failure, memory error, corrupted policy syntax in SQLite):
    ```typescript
    } catch (wasmError) {
      console.warn('[LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...', wasmError);
    }
    return isAllowed; // returns true!
    ```
- **Finding:**
  **AMB-04 is a confirmed genuine fail-open condition** relative to dynamic Cedar policies intended to restrict access. If an offline device has a restrictive local Cedar policy (e.g. lockdown or scheduled lockout) but the WASM engine crashes, the evaluator falls back to the static snapshot grant (`true`).
- **Adherence to Scope Restrictions:**
  Per user instructions ("If a genuine fail-open condition is confirmed, stop and report it without expanding E1"), this finding is formally recorded here. No changes to AMB-04 were introduced in E1.
