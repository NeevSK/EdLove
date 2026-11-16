# STUDY 3: INVESTIGATION RECONCILIATION AND ARCHITECTURAL FREEZE

**Subsystem:** Edlove Authorization Subsystem  
**Scope:** Cross-Investigation Reconciliation (E1, AMB-04, and Architecture Topology)  
**Status:** Unified Reconciled Engineering Model  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Date:** 2026-11-11  

---

## 1. Baseline and Repository Preservation Record

This reconciliation synthesizes three independent investigation streams conducted across isolated contexts:
1. **E1 Experiment:** Snapshot integrity verification refactoring and causal test sensitivity.
2. **AMB-04 Investigation:** Dynamic Cedar, Hermes WASM compatibility, and authorization fallback semantics.
3. **End-to-End Architecture Reconstruction:** Complete topology trace from UI components to database commit.

### Repository Baseline Verification
| Dimension | Recorded State | Substrate Source |
| :--- | :--- | :--- |
| **Primary Checkout HEAD** | `252bec65f746c362fec12472999cccfba187d0b9` | `git rev-parse HEAD` in `C:/x` |
| **Primary Working-Tree Status** | Clean on authorization core (`localEvaluator.native.ts` and `signature.ts` are untouched; working branch: `integrate/worlds-and-upstream`) | `git status --short` in `C:/x` |
| **E1 Worktree Directory** | `C:/x/.tmp-worktrees/exp-e1` | Isolated git worktree (`.tmp-*/` gitignored) |
| **E1 Worktree HEAD** | `252bec65f746c362fec12472999cccfba187d0b9` (detached HEAD) | `git -C .tmp-worktrees/exp-e1 rev-parse HEAD` |
| **E1 Working-Tree Status** | Exactly 1 unstaged modified file: `packages/core/src/logic/permissions/signature.ts` | `git -C .tmp-worktrees/exp-e1 status --short` |

### Provenance of Reconciled Investigation Artifacts
* **AMB-04 Reports (Root Directory):**
  * `C:/x/HERMES_RUNTIME_CAPABILITIES.md` (Hermes engine WASM capabilities & APK binary extraction)
  * `C:/x/CEDAR_WASM_INITIALIZATION.md` (WASM package exports, loader internals & failure analysis)
  * `C:/x/MOBILE_RUNTIME_RESULTS.md` (Debug APK inspection, `libhermesvm.so` symbol analysis)
  * `C:/x/DYNAMIC_AUTHORIZATION_SEMANTICS.md` (8-fixture behavioral matrix & flag evaluation)
  * `C:/x/AMB04_REVISED_ASSESSMENT.md` (Revised risk assessment and operational scope)
* **Architecture Investigation Reports (`research/study-3-brownfield/architecture-investigation/`):**
  * `MASTER_FINDINGS.md` (Answers to Section 13 questions & evidence-coded topology)
  * `ONLINE_AUTHORIZATION_TRACE.md` (Hop-by-hop execution of online read/write operations)
  * `OFFLINE_AUTHORIZATION_TRACE.md` (10-stage offline snapshot lifecycle and airplane mode trace)
  * `DYNAMIC_CEDAR_ARCHITECTURE.md` (Compilation limits, flag inlining, and 9 decision branches)
  * `HERMES_RUNTIME_COMPATIBILITY.md` (Web vs. Node target exports & Hermes runtime constraints)
  * `AUTHORIZATION_STATE_MACHINE.md` (10-scenario state machine, transition guards, and fail-safes)
  * `AUTHORITY_AND_CONSISTENCY_MODEL.md` (4-Tier authority hierarchy and monotonicity invariants)
  * `AUTHORIZATION_VERIFICATION_COVERAGE.md` (Verification levels across paths & checker gaps)
  * `AUTHORIZATION_EVOLUTION_HISTORY.md` (Git commit history from CASL to Cedar v1)
  * `INDEPENDENT_ARCHITECTURE_COMPARISON.md` (Hypothesis shift and cognitive drift analysis)
  * `AUTHORIZATION_GLOSSARY.md` (Disambiguation of 15 overloaded concepts)
* **E1 Experiment Reports (`research/study-3-brownfield/`):**
  * `E1_IMPLEMENTATION.md` (Option A pure cryptographic seam extraction)
  * `E1_VERIFICATION_RESULTS.md` (26/26 native unit tests, 19/19 acceptance tests, mutation results)
  * `E1_DIFF_REVIEW.md` (Unified diff and line-by-line architectural review)

---

## 2. Claim Reconciliation Matrix

| # | Architectural / Security Claim | AMB-04 Evidence | Architecture Evidence | Source Evidence | Runtime Evidence | Configuration Evidence | Reconciled Status | Confidence | Consequence / Decision |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | **No Remote AuthZ Check:** The client calls a remote API endpoint (e.g. `/authorize`) when online to check permissions. | Not directly investigated (focused on mobile local engine). | `contract.ts` and `router.ts` expose zero permission query procedures. | `packages/core/src/api/v1/contract.ts:40-85` | Zero network requests made by `useSanctuaryFeature` during UI rendering. | API contract schema specifies only `session`, `scopes`, `entry`, `createInitialBond`, `syncCredentials`, and `refreshSnapshot`. | **CONTRADICTED (Refuted)** | **HIGH** | Accept as established. Do not design or expect client-to-server per-check authorization traffic. |
| **2** | **Dynamic Cedar Production Status:** Dynamic Cedar policy evaluation actively executes on mobile devices in production. | `MOBILE_RUNTIME_RESULTS.md`: `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset/false across all profiles. | `DYNAMIC_CEDAR_ARCHITECTURE.md`: Pruned by Terser minifier in production bundle. | `localEvaluator.native.ts:131` | Production bundle `entry.bundle` inlines `false === 'true'`. | `eas.json` build profiles omit flag; Doppler `prd` has no secret. | **CONTRADICTED (Refuted)** | **HIGH** | Dynamic Cedar is dormant in deployed builds. No immediate production hazard exists. |
| **3** | **Hermes WebAssembly Execution:** The embedded Hermes VM in Edlove mobile can execute `@cedar-policy/cedar-wasm`. | `HERMES_RUNTIME_CAPABILITIES.md`: `globalThis.WebAssembly` is `undefined` in Hermes; `libhermesvm.so` has 0 WASM symbols. | `HERMES_RUNTIME_COMPATIBILITY.md`: Loader invokes `fetch()` and `WebAssembly.instantiateStreaming`, both unsupported on mobile. | `cedar_wasm.js:70`, `cedarClientEvaluator.ts:67` | `WebAssembly.instantiate` throws `ReferenceError: Property 'WebAssembly' doesn't exist`. | `app-debug.apk` contains zero `.wasm` files. | **CONTRADICTED (Refuted)** | **HIGH** | Web WASM cannot run on mobile Hermes today without native C++/JSI polyfills. |
| **4** | **AMB-04 Production Risk Severity:** AMB-04 allows unprivileged users to bypass all authorization and escalate privileges. | `AMB04_REVISED_ASSESSMENT.md`: Dynamic Cedar is guarded by static snapshot allow (`!isAllowed` exits immediately). | `MASTER_FINDINGS.md`: Fallback returns static snapshot decision (`true`), failing open only relative to dynamic restrictions. | `localEvaluator.native.ts:128-185` | 26 unit tests pass; mutation tests confirm static deny is never bypassed. | Flag is inactive in production (`eas.json`). | **REVISED (Nuanced)** | **HIGH** | Downgrade from "critical privilege escalation" to "dormant architectural flaw". Fails open only for dynamic restrictions. |
| **5** | **Snapshot Distribution Mechanism:** Snapshots are distributed exclusively via PowerSync background table sync. | Not investigated in detail. | `c6665f2cc` shifted distribution directly to `authority.refreshSnapshot` oRPC response. | `contract.ts:63-80`, `snapshotRefresh.ts:40-80` | Snapshot stored in SQLite upon RPC response; verified before insertion. | PowerSync connector `v1Connector.adapter.ts` operates independently of snapshot receipt. | **REVISED** | **HIGH** | Client snapshot acquisition does not depend on background sync streams. |
| **6** | **Drizzle Proxy Scope:** `secureDrizzleProxy.ts` intercepts all queries, including reads. | Not investigated. | `ONLINE_AUTHORIZATION_TRACE.md`: `select` and `query` pass through directly without security checks. | `secureDrizzleProxy.ts:93-96` | Characterization tests confirm `db.select()` triggers zero validator calls. | N/A | **CONTRADICTED (Refuted)** | **HIGH** | Local authorization protects *writes* (`insert`, `update`, `delete`). Reads are open locally from SQLite. |
| **7** | **Dynamic Cedar Privilege Escalation:** An attacker can insert permissive Cedar rules into SQLite to elevate privileges. | `DYNAMIC_AUTHORIZATION_SEMANTICS.md`: Snapshot deny exits at line 129 before dynamic code. | `DYNAMIC_CEDAR_ARCHITECTURE.md`: Dynamic Cedar only acts as a restrictive filter. | `localEvaluator.native.ts:129` | Fixture #8 confirms static deny returns `false` regardless of local SQLite rules. | N/A | **CONTRADICTED (Refuted)** | **HIGH** | Local policy injection cannot elevate permissions beyond server-signed snapshot grants. |
| **8** | **E1 Semantic Invariance:** E1 helper extraction modifies authorization evaluation semantics. | Not investigated in AMB-04 stream. | `E1_IMPLEMENTATION.md`: Pure extraction preserves exact 8-gate evaluation sequence. | `signature.ts:26-145`, `localEvaluator.native.ts:50` | 26/26 native tests, 19/19 acceptance tests pass; signature bypass caught. | N/A | **CONFIRMED** | **HIGH** | E1 is purely a structural refactoring of the cryptographic boundary; zero behavioral change. |
| **9** | **Parity Checker Behavioral Validity:** `check-authorization-parity.mjs` verifies runtime policy correctness. | Mentioned in historical context. | `AUTHORIZATION_VERIFICATION_COVERAGE.md`: Checker is static AST/regex parser only. | `scripts/check-authorization-parity.mjs` | Passed 100% in Study 2 when signature check was completely removed. | N/A | **CONTRADICTED (Refuted)** | **HIGH** | Structural parity script does not guarantee behavioral or cryptographic correctness. |
| **10** | **Clock Rollback Protection:** Client snapshot expiration cannot be bypassed by resetting device system clock. | Not investigated. | `AUTHORIZATION_VERIFICATION_COVERAGE.md`: Expiration relies solely on `new Date()`. | `localEvaluator.native.ts:114` | Setting device clock back allows expired snapshot to be evaluated as valid. | N/A | **CONTRADICTED (Refuted)** | **MEDIUM** | Retain as unresolved gap. System lacks trusted hardware monotonic clock heuristic. |
| **11** | **Server Trust of Client AuthZ:** Server trusts client offline authorization decisions during sync replay. | Not investigated. | `AUTHORITY_AND_CONSISTENCY_MODEL.md`: Server never trusts client decisions. | `security.ts:741` (`authorizeCommand`) | Server re-evaluates Cedar against live PostgreSQL under transaction lock. | Server rejects unprivileged mutations upon reconnection. | **CONTRADICTED (Refuted)** | **HIGH** | Server is 100% authoritative. Offline authorization is purely an optimistic local barrier. |
| **12** | **Metro WASM Bundling:** Metro bundles `cedar_wasm_bg.wasm` into the mobile APK. | `CEDAR_WASM_INITIALIZATION.md`: `app-debug.apk` contains zero `.wasm` files. | `HERMES_RUNTIME_COMPATIBILITY.md`: `assetExts.push('wasm')` was added for web sqlite, not mobile. | `apps/gurudevi-mobile/metro.config.js:83` | Direct archive scan of `app-debug.apk` confirms 0 wasm files. | Dynamic `new URL()` cannot be traced by Metro bundler scanner. | **CONTRADICTED (Refuted)** | **HIGH** | The compiled WASM binary is not packaged into mobile application releases. |

---

## 3. Deep Reconciliation of Core Architectural Issues

### A. Authorization Topology & Operational Seams
The codebase contains four distinct authorization layers operating across different connectivity states:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Client Presentation Gating (UI PEP)                                      │
│ • Component: useSanctuaryFeature.ts -> useCedarDecisionStore.ts             │
│ • State: In-memory Zustand decision map loaded from SQLite snapshot        │
│ • Operational Mode: BOTH ONLINE & OFFLINE (synchronous, 0 network hops)     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Local Database Write Gate (Data PEP)                                     │
│ • Component: secureDrizzleProxy.ts -> localEvaluator.native.ts              │
│ • State: Intercepts db.insert/update/delete; validates signed snapshot     │
│ • Operational Mode: BOTH ONLINE & OFFLINE (intercepts all mobile writes)    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Server Gateway Authoritative Gate (API PEP/PDP)                          │
│ • Component: apps/sanctuary-api/src/security/security.ts:authorizeCommand   │
│ • State: Evaluates live Cedar AST via @cedar-policy/cedar-wasm/nodejs       │
│ • Operational Mode: ONLINE ONLY (executes inside PostgreSQL transactions)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. Snapshot Issuance & Distribution                                         │
│ • Component: authority.refreshSnapshot -> snapshotRefresh.ts                │
│ • State: Server pre-computes 2D matrix, Ed25519 signs, returns via RPC      │
│ • Operational Mode: ONLINE TRANSITION (stores 24h snapshot into SQLite)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Key Reconciliation Finding:**  
  There is **no online remote check** for UI buttons or screen navigation. The client uses its local snapshot whether the phone has 5G WiFi or is in Airplane Mode. The only time the server evaluates policy for a client action is when an RPC command or PowerSync sync upload is processed by `apps/sanctuary-api`.

---

### B. AMB-04 Reconciliation & Risk Scope
* **Static Permission Guard:** In `localEvaluator.native.ts:128-130`:
  ```typescript
  if (typeof isAllowed === 'boolean') {
    if (!isAllowed) return false; // Static Deny exits immediately!
  ```
  If the static snapshot denies permission, dynamic Cedar is **never called**.
* **Dynamic Invocation:** Dynamic Cedar is invoked only if `isAllowed === true` AND `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`.
* **Exception Fallback:**
  ```typescript
  } catch (wasmError) {
    console.warn('[LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...', wasmError);
  }
  return isAllowed; // returns true!
  ```
* **Reconciled Vulnerability Assessment:**  
  AMB-04 is **not an arbitrary privilege escalation vulnerability**. An attacker cannot gain permissions that their server-assigned role lacks. However, AMB-04 **is a genuine fail-open flaw relative to dynamic instance-level restrictions**. If a local Cedar policy was synchronized to revoke or restrict access to a specific record (e.g., student transferred out), a WASM engine crash bypasses that restriction and permits the write.
* **Production Exposure:** In audited production artifacts (`eas.json`, production bundles), the flag is unset/false. Therefore, **production exposure is currently ZERO (dormant)**.

---

### C. Hermes Runtime Compatibility Reconciliation
We must strictly distinguish the layers of the execution stack:
1. **Hermes Engine Capability:** Upstream Hermes (React Native 0.88.1) does not support WebAssembly. `libhermesvm.so` contains zero WASM VM code.
2. **Actual Embedded Binary:** Interrogation of `app-debug.apk` confirmed `libhermesvm.so` has 0 occurrences of `webassembly` symbols.
3. **JavaScript Runtime Global:** In-app probe results confirm `typeof globalThis.WebAssembly === 'undefined'`.
4. **Package Initialization:** `@cedar-policy/cedar-wasm/web/cedar_wasm.js` relies on `new URL(..., import.meta.url)` and `fetch()`, which fail in React Native.
5. **Metro Asset Bundling:** `metro.config.js` has `assetExts.push('wasm')`, but Metro never bundles the 4.45 MB binary because it is dynamically referenced, not statically imported.
6. **Cedar Policy Execution:** Executing `WebAssembly.instantiate` throws `ReferenceError: Property 'WebAssembly' doesn't exist`.
* **Reconciliation Finding:** Dynamic Cedar cannot execute on the current mobile runtime. Passing unit tests in Vitest run under Node.js V8, creating a false impression of mobile readiness.

---

### D. Feature-Flag Provenance & Build Inlining
* **`.env.example`:** Declares `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR=false`.
* **Doppler:** Audited configs (`dev`, `prd`) have no entry for this secret.
* **EAS Configuration (`eas.json`):** Omits the variable from all profiles.
* **Metro / Babel Inlining:** Babel replaces `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` with `false`.
* **Minified Bundle (`entry.bundle`):** The expression evaluates to `false === 'true'`, and the minifier prunes lines 132–183.
* **Reconciliation Finding:** The configuration provenance is unambiguous across all environments. The flag is statically false.

---

### E. E1 Refactoring Relationship
* **Seam Characterization:** E1 extracted `verifySnapshotCryptographicSignature` from `signature.ts` as a pure, dependency-explicit helper.
* **Semantic Neutrality:** The extraction did not modify the 8-gate evaluation sequence, temporal expiration checks, or error handling.
* **Independence:** E1 does **not** touch `localEvaluator.native.ts:178` (`catch (wasmError)`). E1 and AMB-04 are completely orthogonal.

---

### F. Remaining Architectural Gaps Reconciled
1. **Read Authorization:** Reads are unauthenticated at the local SQLite layer (`secureDrizzleProxy` bypasses `select`). Security relies on PowerSync sync rules not distributing unauthorized rows to the device.
2. **Offline Clock Tampering:** An offline user can rewind the Android system clock to keep an expired snapshot valid.
3. **Dynamic Offline ReBAC:** Because dynamic Cedar is dormant and WASM is unsupported, Edlove cannot currently enforce offline record-level ownership rules.
