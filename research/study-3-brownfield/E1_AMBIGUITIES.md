# E1 Behavioral Ambiguities & Edge-Case Vulnerabilities

**Subsystem:** Offline Permission Evaluation & Authorization Snapshot Verification  
**Module:** `packages/core/src/logic/permissions/localEvaluator.native.ts`  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Purpose:** Document latent behavioral ambiguities and potential defects identified during baseline characterization.

---

## 1. Ambiguity Catalog

### AMB-01: Non-Deterministic Snapshot Resolution for Unbonded Contexts
- **Location:** [`localEvaluator.native.ts` lines 45–57](file:///c:/x/packages/core/src/logic/permissions/localEvaluator.native.ts#L45-L57)
- **Current Logic:**
  ```typescript
  const snapshotRecord = await db.query.permissionSnapshots.findFirst({
    where: and(
      eq(permissionSnapshots.userId as any, activeUserId),
      ...(activeBondId
        ? [eq(permissionSnapshots.activeBondId as any, activeBondId)]
        : schoolId
          ? [eq(permissionSnapshots.schoolId as any, schoolId)]
          : []),
    ),
  });
  ```
- **Observed Behavior:**
  When a user operates without an active bond (`activeBondId == null`) and without an explicit `schoolId`, the query filters solely by `userId`.
- **Ambiguity / Defect:**
  If SQLite contains multiple snapshots for this user (e.g., from multiple enrolled institutions or historical sessions), `findFirst` returns an arbitrary record depending on SQLite index ordering. The subsequent entity check on line 77 (`snapshotRecord.activeEntityId !== activeEntityId`) will either pass or fail non-deterministically based on which record SQLite returned, rather than querying for the specific entity.

---

### AMB-02: Policy Version Freshness Asymmetry (Bonded vs. Unbonded)
- **Location:** [`localEvaluator.native.ts` lines 86–100](file:///c:/x/packages/core/src/logic/permissions/localEvaluator.native.ts#L86-L100)
- **Current Logic:**
  ```typescript
  const currentPolicyVersion = await db.query.policyVersion?.findFirst?.();
  if (
    (activeBondId &&
      (!currentPolicyVersion?.hash ||
        !snapshotRecord.policyVersion ||
        snapshotRecord.policyVersion !== currentPolicyVersion.hash)) ||
    (!activeBondId &&
      currentPolicyVersion?.hash &&
      snapshotRecord.policyVersion !== currentPolicyVersion.hash)
  ) {
    return false;
  }
  ```
- **Observed Behavior:**
  - **If `activeBondId` is present:** Both `currentPolicyVersion.hash` and `snapshotRecord.policyVersion` are strictly required and must match. If the database hash is absent, access is denied.
  - **If `activeBondId` is absent:** If the database `currentPolicyVersion.hash` is absent, the check evaluates to `false` and does not deny access. A snapshot with `policyVersion = null` is allowed.
- **Ambiguity / Defect:**
  Unbonded guest or standalone sessions have weaker policy freshness invariants than bonded institutional sessions.

---

### AMB-03: Outer Catch Blanket Masking (Coarse Error Handling)
- **Location:** [`localEvaluator.native.ts` lines 192–195](file:///c:/x/packages/core/src/logic/permissions/localEvaluator.native.ts#L192-L195)
- **Current Logic:**
  ```typescript
  } catch (error) {
    console.error('[LocalEvaluator.native] Local snapshot fallback evaluation failed:', error);
    return false;
  }
  ```
- **Observed Behavior:**
  Any exception—including database connection errors, malformed permissions JSON (`JSON.parse` syntax error), missing crypto libraries, or unexpected runtime exceptions—is caught and mapped to `false`.
- **Ambiguity / Defect:**
  While failing closed is secure, it collapses five entirely different categories of failure into a single outcome, preventing upstream telemetry from distinguishing corrupted snapshot payloads from hardware or storage failures.

---

### AMB-04: Fail-Open Risk on Dynamic Cedar Fallback
- **Location:** [`localEvaluator.native.ts` lines 181–186](file:///c:/x/packages/core/src/logic/permissions/localEvaluator.native.ts#L181-L186)
- **Current Logic:**
  ```typescript
  } catch (wasmError) {
    console.warn(
      '[LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...',
      wasmError,
    );
  }
  return isAllowed;
  ```
- **Observed Behavior:**
  When dynamic Cedar WASM evaluation throws an error (e.g. memory exhaustion, invalid Cedar policy syntax in SQLite), the evaluator falls back to the static snapshot permission grant (`isAllowed = true`).
- **Ambiguity / Defect:**
  If a dynamic Cedar policy was intended to *restrict* a snapshot grant (e.g., revoking access based on classroom schedule or lockdown status), a WASM crash silently bypasses the restriction and grants access.

---

### AMB-05: Unreferenced `temporalHints` Schema Field
- **Location:** [`packages/core/src/adapters/powersync/schema.ts`](file:///c:/x/packages/core/src/adapters/powersync/schema.ts) & [`localEvaluator.native.ts`](file:///c:/x/packages/core/src/logic/permissions/localEvaluator.native.ts)
- **Observed Behavior:**
  `temporalHints` is synced to SQLite and verified by `verifySnapshotSignature`, but `checkLocalPermission` never reads or acts upon it.
- **Ambiguity / Defect:**
  The schema and cryptographic payload allocate storage and CPU cycles for temporal hints, but the PDP logic currently ignores them.
