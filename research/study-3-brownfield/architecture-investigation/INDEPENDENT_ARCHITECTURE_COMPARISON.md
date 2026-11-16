# Phase J: Independent Architecture Comparison

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Architectural Hypothesis Verification & Cognitive Drift Analysis  
**Status:** Grounded Architectural Specification  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Summary

Throughout Studies 1, 2, and the initial phase of Study 3, our understanding of Edlove's authorization architecture shifted dramatically as empirical evidence was gathered. Many initial assumptions were formed by reading documentation, high-level names, or structural checker scripts, which concealed the physical realities of the codebase.

This report compares our progressive understanding across three evaluation stages:
* **Stage 1 (Start of Study 1):** The "Idealized Cedar Architecture" (assumed dynamic client Cedar, parity checker authority, remote check endpoints).
* **Stage 2 (Study 2 Real Repository Verification):** The "Disillusioned Fault Phase" (discovered parity script drift, broken test sensitivity, AMB-04 fail-open).
* **Stage 3 (Study 3 End-to-End Reconstruction):** The "Empirical Grounded Architecture" (two-tier model, dormant dynamic Cedar, snapshot response delivery, Hermes incompatibility).

---

## 2. Evolution of Architectural Hypotheses

```
┌─────────────────────────────────┐
│ Stage 1: Idealized Architecture │
│ • Client queries remote AuthZ   │
│ • Parity checker enforces rules │
│ • Dynamic Cedar runs on mobile  │
└─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Stage 2: Disillusioned Faults   │
│ • Parity checker had ENOENT     │
│ • Causal test blindness         │
│ • AMB-04 identified fail-open   │
└─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Stage 3: Grounded Architecture  │
│ • No remote AuthZ endpoint      │
│ • Dynamic Cedar is dormant      │
│ • Hermes lacks native WASM      │
│ • Signed snapshots are primary  │
└─────────────────────────────────┘
```

---

## 3. Systematic Verification of Hypotheses

### Category 1: Assumptions Confirmed by Empirical Evidence

| Hypothesis | Initial Assumption | Empirical Substrate / Finding | Evidence Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **H-01: Cryptographic Snapshots** | Mobile client relies on signed snapshots for offline execution. | `packages/core/src/logic/permissions/localEvaluator.native.ts:100` verifies Ed25519 signature of `permission_snapshots` row. | [OBSERVED] | **CONFIRMED** |
| **H-02: Parity Checker Limitations** | `scripts/check-authorization-parity.mjs` does not verify runtime semantics. | Mutation testing in Study 1 & 2 proved the checker passes even when evaluator signatures are bypassed. | [OBSERVED] | **CONFIRMED** |
| **H-03: Local Drizzle Write PEP** | Direct database writes on mobile are intercepted before SQLite commit. | `packages/core/src/adapters/powersync/secureDrizzleProxy.ts:90-180` wraps Drizzle builder and throws `LOCAL_WRITE_VIOLATION` on deny. | [OBSERVED] | **CONFIRMED** |
| **H-04: Server-Side Cedar Authority** | Server uses real Cedar WASM for backend mutations. | `apps/sanctuary-api/src/security/security.ts:641` evaluates `@cedar-policy/cedar-wasm/nodejs` inside PostgreSQL transactions. | [OBSERVED] | **CONFIRMED** |

---

### Category 2: Assumptions Refuted by Empirical Evidence

| Hypothesis | Initial Assumption | Empirical Substrate / Finding | Evidence Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **H-05: Remote Check Endpoint** | Mobile client calls a remote API (e.g. `/authorize`) when online to check permissions. | **REFUTED.** `packages/core/src/api/v1/contract.ts` contains zero authorization query endpoints. UI gates read locally cached snapshots. | [OBSERVED] | **REFUTED** |
| **H-06: Active Dynamic Mobile Cedar** | Dynamic Cedar evaluation is actively running on mobile devices to enforce instance-level rules. | **REFUTED.** `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset/false in production builds (`eas.json`). Code is pruned by bundler minifier. | [CONFIGURED] | **REFUTED** |
| **H-07: Hermes WASM Readiness** | React Native Hermes can evaluate `@cedar-policy/cedar-wasm/web`. | **REFUTED.** Standard Hermes builds lack global `WebAssembly`. Calling `__wbg_init()` throws runtime `ReferenceError`. | [OBSERVED] | **REFUTED** |
| **H-08: AuthManager Role** | `AuthManager.ts` was an authorization policy manager that went missing. | **REFUTED.** `AuthManager` was an authentication/session service (now `useAuthStore`). Parity checker was misconfigured to look for it. | [OBSERVED] | **REFUTED** |

---

### Category 3: Assumptions Revised with Empirical Nuance

| Hypothesis | Prior Understanding | Grounded Understanding with Nuance | Evidence Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **H-09: Ambiguity 04 (Fail-Open Severity)** | AMB-04 allows unprivileged users to bypass all authorization if dynamic Cedar crashes. | **REVISED WITH NUANCE.** Dynamic Cedar is only invoked *after* static snapshot evaluation returns `isAllowed === true`. Thus, a WASM crash falls back to the static snapshot, not arbitrary access. However, it *does* fail open relative to dynamic instance-level restrictions. | [OBSERVED] | **REVISED** |
| **H-10: Snapshot Sync Mechanism** | Snapshots are distributed via PowerSync table sync streams. | **REVISED WITH NUANCE.** While stored in a PowerSync-managed SQLite table, snapshots are delivered directly in the oRPC response to `authority.refreshSnapshot` (commit `c6665f2cc`), bypassing sync dependencies. | [OBSERVED] | **REVISED** |

---

## 4. Genuine Architectural Gaps Identified

1. **The Instance-Level Offline Gap [DOCUMENTED/OBSERVED]:**  
   Because dynamic Cedar is inactive on mobile, Edlove currently has **no mechanism to enforce Shape 2 instance-level restrictions offline**. If a static snapshot grants a teacher permission to edit attendance records, that teacher's offline mobile device can edit *any* attendance record in their local SQLite database, even for classrooms they do not teach! The server catches this only upon reconnection and sync replay.
2. **The Offline Clock Tamper Gap [INFERRED]:**  
   Expiration checking in `localEvaluator.native.ts:114` relies entirely on `new Date()`. An offline attacker can roll back the device's system clock in Android OS settings to prevent snapshot expiration indefinitely.
3. **The Non-Hermes Web Test Illusion [OBSERVED]:**  
   Vitest runs dynamic Cedar tests in Node.js, where WebAssembly is supported. This creates the illusion that client-side dynamic Cedar is functional, while in reality it cannot run on physical mobile hardware without native polyfills.
