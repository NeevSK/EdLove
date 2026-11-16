# Phase D: Dynamic Cedar Architecture & Feasibility

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Dynamic Cedar Policy Evaluation (`cedarClientEvaluator.ts`)  
**Status:** Grounded Architectural Specification  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Summary & Architectural Intent

Dynamic Cedar evaluation on native clients was introduced in May/June 2026 (`cedarClientEvaluator.ts`, `localEvaluator.native.ts`) to solve a fundamental limitation of static permission snapshots:

* **The Static Matrix Limitation [DOCUMENTED/OBSERVED]:**  
  A static permission snapshot pre-computes **Shape 1 (Role-Level)** capabilities:  
  *"Can a teacher update attendance?"* -> `true`.  
  However, it cannot easily pre-compute **Shape 2 (Instance-Level)** relationships:  
  *"Can Teacher Alice update Attendance Record #49281 in Classroom #12?"*  
  Evaluating instance-level rules requires checking dynamic attributes (e.g., `resource.school_id == principal.school_id` and `principal.classroom_ids.contains(resource.classroom_id)`).

To evaluate Shape 2 rules offline, the architecture proposed replicating raw Cedar DSL policies into a local SQLite table (`cedar_policies`) and executing `@cedar-policy/cedar-wasm/web` directly on the mobile device.

However, our empirical investigation demonstrates that:
1. **Dynamic Cedar is disabled in production:** Controlled by `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR`, which is unset (`undefined`/`false`) in production build profiles.
2. **Dynamic Cedar operates solely as an additional restriction layer:** It is only invoked if the static snapshot has *already* granted `isAllowed = true`.
3. **Fail-Open Failure Modes (AMB-04):** If dynamic Cedar crashes or fails, it falls back to the static snapshot (`return isAllowed`), thus failing open relative to the dynamic instance restriction.

---

## 2. Structural Substrate & Compilation Boundaries

### 1. Feature Flag Inlining
* **Flag Name:** `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR`
* **Declaration & Check [OBSERVED]:** `packages/core/src/logic/permissions/localEvaluator.native.ts:131`
* **Metro Bundler Inlining [OBSERVED]:** In `apps/gurudevi-mobile`, Metro and Babel inline `EXPO_PUBLIC_*` variables at compile time. In production bundles (e.g., `reports/device-runs/2026-10-22-a52-metropolitan-governor/entry.bundle`), this expression compiles directly to `false === 'true'`, eliminating the dynamic Cedar branch entirely from the bundle AST.

### 2. SQLite Schema: `cedarPolicies`
* **Table Definition [OBSERVED]:**
  ```ts
  // packages/schema/src/sqlite/schema.ts
  export const cedarPolicies = sqliteTable('cedar_policies', {
    id: text('id').primaryKey(),
    version: text('version').notNull(),
    content: text('content').notNull(),
    updatedAt: text('updated_at').notNull(),
  });
  ```

### 3. Memory & Compilation Boundary: 100KB Limit
* **Safety Threshold [OBSERVED]:** `localEvaluator.native.ts:140-143`
  ```ts
  const rawPolicyString = localPolicies.map((p) => p.content).join('\n\n');
  const policySizeBytes = Buffer.byteLength(rawPolicyString, 'utf8');

  // Safe Boundary check to protect lower-end Android memory
  const MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024;
  if (policySizeBytes <= MAX_LOCAL_POLICY_SIZE_BYTES) { ... }
  ```
* **Rationale [OBSERVED/DOCUMENTED]:** Parsing large Cedar policy sets in WASM on memory-constrained Android devices (e.g., 2GB RAM budget) causes Hermes GC stutter and Out-Of-Memory (OOM) crashes. If policies exceed 100KB, dynamic evaluation is bypassed.

---

## 3. The 9 Failure & Decision Branches in `localEvaluator.native.ts`

The execution flow through `localEvaluator.native.ts:128-185` contains 9 distinct operational branches:

```
[Snapshot isAllowed === true]
              │
              ▼
    ┌───────────────────┐
    │ Branch A: Flag?   │── No ('false') ──> Return isAllowed (true) [STATIC PASS]
    └───────────────────┘
              │ Yes ('true')
              ▼
    ┌───────────────────┐
    │ Branch B: Empty?  │── Yes (0 rows) ──> Fall through ──> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
              │ No (>0 rows)
              ▼
    ┌───────────────────┐
    │ Branch C: >100KB? │── Yes (>100KB) ──> Fall through ──> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
              │ No (<=100KB)
              ▼
    ┌───────────────────┐
    │ Branch D: WASM?   │── Fails to load ─> Catch wasmError -> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
              │ Loaded
              ▼
    ┌───────────────────┐
    │ Branch E: Parse?  │── Syntax error ──> Catch wasmError -> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
              │ Valid syntax
              ▼
    ┌───────────────────┐
    │ Branch F: Attrs?  │── Schema error ──> Catch wasmError -> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
              │ Context built
              ▼
    ┌───────────────────┐
    │ Branch G: Deny    │── Cedar says DENY ──> Return false [FAIL-CLOSED]
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │ Branch H: Allow   │── Cedar says ALLOW ──> Return true [PERMITTED]
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │ Branch I: Runtime │── Uncaught error ──> Catch wasmError -> Return isAllowed (true) [FAIL-OPEN]
    └───────────────────┘
```

---

## 4. Branch Evaluation Matrix (AMB-04 Empirical Analysis)

| Branch | Trigger Condition | Code Path | Decision Returned | Console Log Output | Security Posture (Relative to Dynamic Policy) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Branch A: Disabled** | `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR !== 'true'` | `localEvaluator.native.ts:131` | `return isAllowed` (`true`) | None | **Bypassed.** Only static snapshot is enforced. |
| **Branch B: Empty DB** | `localPolicies.length === 0` in SQLite | `localEvaluator.native.ts:136` | `return isAllowed` (`true`) | None | **Fail-Open.** Dynamic policies missing, operation permitted. |
| **Branch C: Too Large** | `policySizeBytes > 102400` bytes | `localEvaluator.native.ts:143` | `return isAllowed` (`true`) | None | **Fail-Open.** Protection bypassed to avoid mobile OOM. |
| **Branch D: WASM Load Error** | `@cedar-policy/cedar-wasm/web` import or `mod.default()` fails | `cedarClientEvaluator.ts:27`, `localEvaluator:177` | `return isAllowed` (`true`) | `console.warn('[LocalEvaluator.native] WASM evaluation failed/unsupported...')` | **Fail-Open.** Dynamic engine failed; falls back to static allow. |
| **Branch E: Syntax Error** | Cedar parser rejects malformed policy string | `cedarClientEvaluator.ts:137` throws | `return isAllowed` (`true`) | `console.warn(...)` | **Fail-Open.** Malformed policy does not block operation. |
| **Branch F: Attribute Error** | Zod entity attribute parsing fails | `cedarClientEvaluator.ts:108` throws | `return isAllowed` (`true`) | `console.warn(...)` | **Fail-Open.** Missing entity attributes bypass check. |
| **Branch G: Dynamic Deny** | Cedar AST evaluation yields `decision === 'deny'` | `localEvaluator.native.ts:175` | `return false` | `console.log('[LocalEvaluator.native] Cedar WASM evaluation succeeded.')` | **Fail-Closed.** Dynamic restriction successfully enforced! |
| **Branch H: Dynamic Allow** | Cedar AST evaluation yields `decision === 'allow'` | `localEvaluator.native.ts:175` | `return true` | `console.log(...)` | **Permitted.** Both static snapshot and dynamic Cedar allow. |
| **Branch I: Runtime Exception** | Unhandled exception inside WASM execution | `localEvaluator.native.ts:177` catches | `return isAllowed` (`true`) | `console.warn(...)` | **Fail-Open.** Engine crash falls back to static snapshot. |

---

## 5. Architectural Findings & Implications

1. **The Asymmetric Gate [OBSERVED]:**  
   Dynamic Cedar can **never elevate privileges**. If the static snapshot denies an action (`isAllowed === false`), `localEvaluator.native.ts:130` immediately returns `false`. Dynamic Cedar is never called. It was architected strictly as an *additional filter*.
2. **The Ambiguity 04 Reality [OBSERVED]:**  
   AMB-04 identified that the `catch (wasmError)` block returns `isAllowed`. Because this block is only entered when `isAllowed === true`, any crash, syntax error, or unhandled WASM fault grants the write access. If a policy was written to *revoke* access to a specific record (e.g., student expelled), a WASM failure causes the system to allow the write.
3. **Production Dormancy [CONFIGURED]:**  
   Because `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is inactive in production builds, Branches B through I are never traversed in real devices today. Mobile clients rely entirely on Branch A and the static signed snapshot.
