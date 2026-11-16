# Study 3: Open Questions, Cognitive Drift Analysis & Future Experiments

**Subsystem:** Edlove Authorization Subsystem  
**Scope:** Grounded Knowledge vs. Previous Misunderstandings vs. Empirical Unknowns  
**Status:** Canonical Open Questions Register  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Date:** 2026-11-11  

---

## 1. What We Know With High Confidence (Empirical Facts)

Across the three investigations, the following conclusions are supported by direct source code, test execution, binary inspection, and configuration artifacts:

1. **No Remote Check Endpoint:** The client never invokes an RPC endpoint to ask whether an action is permitted. UI presentation gating reads an in-memory decision store (`useCedarDecisionStore`) populated from a server-signed snapshot.
2. **Server-Side Authoritative Gate:** All server-side mutations and commands passing through `apps/sanctuary-api` are evaluated transactionally via Cedar Node.js WASM against live PostgreSQL state under row locks.
3. **Hermes Lacks WebAssembly:** The embedded `libhermesvm.so` in React Native 0.88.1 / Expo SDK 58 does not provide the global `WebAssembly` API. Invoking `WebAssembly.instantiate` throws `ReferenceError`.
4. **Dynamic Cedar is Dormant in Production:** `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset/false across `.env.example`, Doppler, and `eas.json`. It is dead-code eliminated from production bundles.
5. **Dynamic Cedar Cannot Elevate Privileges:** The dynamic Cedar branch is reached only after the static snapshot grants `isAllowed === true`. If the snapshot denies access, execution terminates immediately.
6. **Snapshot Delivery via API Response:** Direct snapshot delivery in the `authority.refreshSnapshot` oRPC response (commit `c6665f2cc`) decouples snapshot acquisition from PowerSync sync stream status.
7. **Monotonic Policy Versions:** The client rejects snapshots with older policy versions (commit `3b613f3c8`), preventing version rollback vulnerabilities.
8. **E1 Seam Extraction is Semantically Neutral:** Extracting `verifySnapshotCryptographicSignature` into a pure helper preserves all 8 evaluation gates and passes 26/26 native tests and 19/19 acceptance tests.

---

## 2. What We Previously Misunderstood (Cognitive Drift Analysis)

Understanding why previous analyses diverged is essential to prevent future regressions:

| Topic / Misunderstanding | Initial Assumption | Physical Reality Discovered | Why Did the Misunderstanding Occur? |
| :--- | :--- | :--- | :--- |
| **The Missing "AuthManager"** | `AuthManager.ts` was an authorization policy manager whose absence broke the parity checker. | `AuthManager` was an authentication service handling Supabase JWT tokens. Authorization is handled by Cedar. | **Term Overloading:** Confusing AuthN (authentication) with AuthZ (authorization). |
| **Parity Checker Guarantees** | `check-authorization-parity.mjs` was an authoritative security linter ensuring policy enforcement. | The script is a static string-matching regex tool. It passed 100% even when signature checks were deleted. | **Metric Laundering:** Confusing passing a static linter with verifying dynamic runtime behavior. |
| **AMB-04 Severity** | AMB-04 was a critical privilege escalation vulnerability allowing attackers to execute arbitrary writes. | Dynamic Cedar is only evaluated if the static snapshot allows. Fallback defaults to snapshot grant, not arbitrary write. | **Insufficient Seam Isolation:** Failing to notice the preceding `if (!isAllowed) return false;` guard at line 129. |
| **Hermes WASM Capabilities** | Documentation claimed "Hermes V1 brings native WASM to React Native 0.84+". | Upstream Meta research compiled Hermes *to* WASM, but the mobile binary lacks WASM execution primitives. | **Unverified Documentation:** Relying on aspirational roadmap docs rather than interrogating the compiled APK. |
| **Snapshot Sync Route** | Snapshots were replicated over PowerSync table synchronization. | Commit `c6665f2cc` shifted delivery directly into the oRPC response body. | **Architectural Evolution Lag:** Analyzing May 2026 designs without tracking November 2026 commits. |

---

## 3. What Still Lacks Empirical Evidence (Open Unknowns)

The following items could not be conclusively determined from existing repository artifacts and require dedicated empirical experiments:

### Unknown 1: Offline System Clock Manipulation
* **Issue:** `localEvaluator.native.ts:114` checks `new Date() <= expiresAt`. On an offline Android or iOS device, what prevents an unprivileged user from manually setting the device clock back by 30 days to revive an expired snapshot?
* **Current Evidence:** Source code inspection confirms that only standard JavaScript `new Date()` is queried. No native monotonic clock (`SystemClock.elapsedRealtime()`) or secure time service is called.
* **Required Experiment:** Deploy a test build to an Android emulator, set system time back, and verify whether expired snapshot writes are authorized.

### Unknown 2: PowerSync Reconnection Conflict Resolution Under Concurrent Offline Edits
* **Issue:** When two teachers edit the same attendance record offline in different classrooms, what exact conflict resolution strategy executes upon reconnection?
* **Current Evidence:** PowerSync uses SQLite triggers to buffer inserts/updates into `ps_crud`. The backend sync worker processes rows, but the exact conflict handler (Last-Write-Wins vs. Domain Merge) has not been verified under stress.
* **Required Experiment:** Simulate concurrent offline mutations to the same entity from two separate test clients and inspect the resulting PostgreSQL state.

### Unknown 3: Read Authorization at the Local SQLite Layer
* **Issue:** `secureDrizzleProxy.ts` explicitly bypasses security checks for `select` and `query`. Does an offline client have access to sensitive records that were synchronized to the device under a previous bond?
* **Current Evidence:** The proxy permits raw reads. PowerSync sync rules govern which rows are sent to the device, but once on SQLite, any local query can read them.
* **Required Experiment:** Audit PowerSync sync parameters to verify whether multi-tenant or multi-school data can leak into local SQLite tables.

---

## 4. Key Questions Requiring Human / Product-Owner Decisions

1. **Product Requirement for Offline ReBAC:**  
   *Does Edlove truly require fine-grained record-level ReBAC (e.g. "Teacher Alice can only edit Attendance for Classroom 4") while disconnected, or is role-level gating ("Teachers can mark attendance") combined with server-side reconciliation sufficient?*  
   *If role-level is sufficient, dynamic mobile Cedar can be formally retired.*
2. **Dynamic Cedar Engineering Path:**  
   *If offline record-level Cedar is mandatory, does the project authorize building a native C++ JSI / Nitro Module wrapping the Rust `cedar-policy` crate, given that WebAssembly cannot run on mobile Hermes?*
3. **E1 Promotion:**  
   *Do we promote the verified E1 refactoring (Option A pure cryptographic seam in `.tmp-worktrees/exp-e1`) to the primary branch `integrate/worlds-and-upstream`?*
