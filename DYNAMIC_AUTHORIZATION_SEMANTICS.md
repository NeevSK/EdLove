# DYNAMIC_AUTHORIZATION_SEMANTICS.md

## Dynamic Authorization Semantics & Feature-Flag Exposure in Gurudevi Mobile

### 1. Feature-Flag Exposure: `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR`

The feature flag `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` controls whether the native mobile evaluator (`localEvaluator.native.ts`) attempts to query local SQLite `cedarPolicies` and invoke the Cedar WASM engine.

#### Effective Value Analysis by Build Profile

| Build Profile | Source Configuration | Value | Effective Boolean Result | Dynamic Code Active? |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | `.env.example`, Doppler `gurudevi-mobile:dev` | `false` / unset | `false` | ❌ Inactive (Dormant) |
| **Preview** | `eas.json` (`build.preview`), Doppler `gurudevi-mobile:stg` | unset | `false` | ❌ Inactive (Dormant) |
| **Production** | `eas.json` (`build.production`), Doppler `gurudevi-mobile:prd` | unset | `false` | ❌ Inactive (Dormant) |

#### Empirical Verifications:
1. `apps/gurudevi-mobile/.env.example` line 67:
   ```env
   EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR=false
   ```
2. Doppler Project `gurudevi-mobile` audit (configs `dev`, `prd`):
   ```text
   Doppler Error: Could not find requested secret: EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR
   ```
3. `apps/gurudevi-mobile/eas.json`:
   The variable is omitted from all build profiles (`development`, `preview`, `performance`, `production`).

**Conclusion:** Across all official build and deployment profiles, `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'` evaluates strictly to `false`. The dynamic Cedar execution path is dormant in production and normal development builds.

---

### 2. Isolated Fixture Comparison Matrix (The 8 Scenarios)

The table below documents the exact behavioral pathway for each authorization fixture under `localEvaluator.native.ts`:

| # | Scenario / Fixture Condition | Snapshot Status | Dynamic Policy Status | Execution Pathway | Final Decision | Security / Semantics Classification |
| :-: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | **Dynamic Cedar allows** | Valid, Signed, `isAllowed: true` | Valid policy, WASM loads, evaluates `allow` | Dynamic Evaluation | **ALLOW (`true`)** | **Dynamic Authorization** (Both snapshot and dynamic policy permit) |
| **2** | **Dynamic Cedar denies** | Valid, Signed, `isAllowed: true` | Valid policy, WASM loads, evaluates `deny` | Dynamic Evaluation | **DENY (`false`)** | **Dynamic Restriction** (Dynamic policy narrows snapshot grant) |
| **3** | **WASM initialization fails** | Valid, Signed, `isAllowed: true` | WASM missing/throws at `import()` or `init` | Static Fallback | **ALLOW (`true`)** | **Static Fallback (Fail-Safe)** (Catches `wasmError`, returns snapshot grant) |
| **4** | **WASM evaluation throws** | Valid, Signed, `isAllowed: true` | Malformed policy syntax or WASM panic | Static Fallback | **ALLOW (`true`)** | **Static Fallback (Fail-Safe)** (Catches `wasmError`, returns snapshot grant) |
| **5** | **Local policy store is empty** | Valid, Signed, `isAllowed: true` | `cedarPolicies` table has 0 rows | Static Fallback | **ALLOW (`true`)** | **Static Fast-Path** (Skips dynamic evaluation when no policies exist) |
| **6** | **Policy size > 100 KB limit** | Valid, Signed, `isAllowed: true` | `policySizeBytes > 102400` bytes | Static Fallback | **ALLOW (`true`)** | **Memory Boundary Fallback** (Protects low-end RAM budget, uses snapshot) |
| **7** | **Static snapshot allows** | Valid, Signed, `isAllowed: true` | Flag `false` or unset (Production default) | Static Evaluation | **ALLOW (`true`)** | **Static Production Fast-Path** ($O(1)$ JSON dictionary check) |
| **8** | **Static snapshot denies** | Valid, Signed, `isAllowed: false` | Irrelevant | Default Denial | **DENY (`false`)** | **Immutable Default Denial** (Dynamic evaluation is NEVER entered) |

---

### 3. Detailed Architectural Semantics Walkthrough

#### Scenario 1: Dynamic Cedar Allows
- **Preconditions**:
  1. Valid, unexpired `PermissionSnapshot` exists for the active `userId`, `schoolId`, `activeEntityId`, and `activeEntityType`.
  2. Snapshot Ed25519 signature is verified against `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY`.
  3. Snapshot grants permission for the requested action (`isAllowed === true`).
  4. `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`.
  5. Local SQLite `cedarPolicies` contains rules within the 100 KB safety limit.
  6. Cedar WASM engine successfully compiles and evaluates Shape 2 request to `allow`.
- **Pathway**: Enters **Dynamic Evaluation**.
- **Outcome**: Returns `true`.

#### Scenario 2: Dynamic Cedar Denies
- **Preconditions**: Same as Scenario 1, but Cedar policy rules or entity attributes dictate a deny decision (e.g. user capacity matches, but a forbidding rule or missing role binding denies access).
- **Pathway**: Enters **Dynamic Evaluation**.
- **Outcome**: Returns `false`.
- **Significance**: Dynamic Cedar functions monotonically as an *authorization restriction filter*: it can narrow an existing snapshot grant, but cannot grant privileges that the snapshot forbids.

#### Scenario 3: WASM Initialization Fails
- **Preconditions**: Snapshot is verified and grants permission (`isAllowed === true`), flag is `'true'`, but WASM initialization throws (e.g. `ReferenceError: Property 'WebAssembly' doesn't exist` in Hermes).
- **Code Trace**:
  ```typescript
  try {
    // ... evaluateShape2() throws ...
  } catch (wasmError) {
    console.warn(
      '[LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...',
      wasmError,
    );
  }
  return isAllowed; // returns true
  ```
- **Pathway**: Enters **Static Fallback**.
- **Outcome**: Returns `true`.
- **Semantics**: Fails safe to the cryptographically verified server snapshot.

#### Scenario 4: WASM Evaluation Throws
- **Preconditions**: Snapshot is verified and grants permission (`isAllowed === true`), flag is `'true'`, but `evaluateShape2()` throws during evaluation (e.g., syntax error in a synced policy string or schema parsing failure).
- **Code Trace**: Caught by the identical `catch (wasmError)` handler.
- **Pathway**: Enters **Static Fallback**.
- **Outcome**: Returns `true`.

#### Scenario 5: Local Policy Store is Empty
- **Preconditions**: Snapshot is verified and grants permission (`isAllowed === true`), flag is `'true'`, but `localPolicies.length === 0` in SQLite.
- **Code Trace**:
  ```typescript
  if (localPolicies.length > 0) { ... }
  return isAllowed;
  ```
- **Pathway**: Enters **Static Fallback** (skips dynamic evaluation entirely).
- **Outcome**: Returns `true`.

#### Scenario 6: Policy Store Exceeds Safety Limit
- **Preconditions**: Snapshot is verified and grants permission (`isAllowed === true`), flag is `'true'`, but `policySizeBytes > 100 * 1024` (100 KB memory protection ceiling).
- **Code Trace**:
  ```typescript
  const MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024;
  if (policySizeBytes <= MAX_LOCAL_POLICY_SIZE_BYTES) { ... }
  return isAllowed;
  ```
- **Pathway**: Enters **Static Fallback** (skips WASM compilation to prevent out-of-memory crashes on low-tier Android hardware).
- **Outcome**: Returns `true`.

#### Scenario 7: Static Signed Snapshot Allows
- **Preconditions**:
  1. Snapshot is verified and grants permission (`isAllowed === true`).
  2. `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset or `'false'` (the standard deployed condition).
- **Code Trace**:
  ```typescript
  if (process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true') { ... } // SKIPPED
  return isAllowed; // returns true
  ```
- **Pathway**: Enters **Static Evaluation**.
- **Outcome**: Returns `true`.

#### Scenario 8: Static Signed Snapshot Denies
- **Preconditions**:
  - Case A: No snapshot in local DB (`snapshotRecord === null`).
  - Case B: Snapshot user, bond, or entity ID does not match active session.
  - Case C: Snapshot policy version is stale.
  - Case D: Snapshot Ed25519 signature is invalid or tampered with.
  - Case E: Snapshot has expired (`expiresAt <= new Date()`).
  - Case F: Snapshot permissions JSON contains `false` (or does not contain) the requested action.
- **Code Trace**:
  ```typescript
  if (typeof isAllowed === 'boolean') {
    if (!isAllowed) return false; // Immediate exit!
    if (process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true') { ... }
  ```
- **Pathway**: Enters **Default Denial**.
- **Outcome**: Returns `false`.
- **CRITICAL INVARIANT**: If the snapshot denies access, the dynamic Cedar code block is **never entered**, regardless of the `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` setting or local policy contents. A client cannot elevate privileges by inserting permissive Cedar rules into local SQLite.
