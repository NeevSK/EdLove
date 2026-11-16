# Study 3: Architectural Decision Register & Finding Dispositions

**Subsystem:** Edlove Authorization Subsystem  
**Scope:** Reconciled Engineering Decisions, Dispositions & Risk Governance  
**Status:** Canonical Decision Register  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  
**Date:** 2026-11-11  

---

## 1. Executive Summary

This register records the formal disposition of all empirical findings and architectural claims identified across Studies 1, 2, and 3. Each disposition assigns an explicit engineering action or governance status to prevent ambiguous interpretations during subsequent implementation phases.

---

## 2. Master Finding Disposition Matrix

| Finding ID | Subject / Topic | Empirical Finding Summary | Assigned Disposition | Actionable Next Step / Governance Note |
| :-: | :--- | :--- | :--- | :--- |
| **DISP-01** | **Remote AuthZ Queries** | The client has no remote `/authorize` endpoint; UI uses local snapshots, server enforces commands. | **Accept as Established** | Architecture freeze: Do not create remote check endpoints for client UI rendering. |
| **DISP-02** | **Dynamic Cedar in Prod** | `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is inactive across all profiles and pruned from production bundles. | **Requires No Action in Current Production Configuration** | Maintain current flag default (`false`). Do not enable in production without a supported engine. |
| **DISP-03** | **Hermes WASM Incompatibility** | Embedded mobile Hermes (`libhermesvm.so`) lacks WebAssembly support; web loader fails. | **Accept as Established** | Recognize that `@cedar-policy/cedar-wasm/web` cannot execute on React Native mobile devices. |
| **DISP-04** | **AMB-04 Vulnerability Framing** | AMB-04 is a fail-open flaw relative to dynamic restrictions, but cannot elevate privileges beyond snapshots. | **Correct Previous Interpretation** | Downgrade severity from "critical privilege escalation" to "dormant architectural flaw". |
| **DISP-05** | **AMB-04 Remediation** | When dynamic Cedar throws, line 178 falls back to static `isAllowed` (`true`). | **Requires Security Review & Product-Owner Decision** | Frame trade-offs between fail-closed fallback vs. maintaining current snapshot availability. |
| **DISP-06** | **E1 Seam Extraction** | Option A pure helper extraction preserves exact evaluation sequence and passes all 45 tests. | **Accept as Established (Pending Human Approval)** | Promote E1 from worktree `.tmp-worktrees/exp-e1` to primary branch when authorized. |
| **DISP-07** | **Parity Checker Validity** | `scripts/check-authorization-parity.mjs` checks string names, not runtime evaluation or signatures. | **Correct Previous Interpretation** | Do not rely on parity script as evidence of behavioral correctness. Retain as a structural linter. |
| **DISP-08** | **Snapshot Delivery Channel** | Snapshots are delivered via oRPC response (`authority.refreshSnapshot`), not sync streams. | **Accept as Established** | Reconciled via commit `c6665f2cc`. Eliminates sync stream dependency for login. |
| **DISP-09** | **Policy Monotonicity** | Client verifies Ed25519 signature before SQLite insert and rejects older policy versions. | **Accept as Established** | Reconciled via commit `3b613f3c8`. Rollback vulnerability is resolved. |
| **DISP-10** | **Drizzle Proxy Read Bypass** | `secureDrizzleProxy.ts` intercepts only writes (`insert`, `update`, `delete`); reads bypass checks. | **Accept as Established** | Document that read authorization relies on PowerSync server-side publication rules. |
| **DISP-11** | **Client Clock Rewind Gap** | An offline user can manually roll back Android system clock to prevent snapshot expiration. | **Retain as Unresolved** | Future hardening: Investigate trusted hardware monotonic clock heuristic. |
| **DISP-12** | **Future of Dynamic Mobile Cedar** | Dynamic Cedar is dormant; whether to deprecate it or replace it with native Rust/JSI is open. | **Requires Product-Owner Decision** | Do not decide prematurely. Objectively frame Path 1 (Pure Snapshots) vs. Path 2 (Native Rust JSI). |

---

## 3. Revised AMB-04 Assessment

### Historical vs. Reconciled Framing
* **Initial Formulation:**  
  *"AMB-04 allows unauthorized users to perform arbitrary database writes if WASM evaluation fails, creating a high-severity privilege escalation vulnerability on mobile devices."*
* **Reconciled Grounded Assessment:**  
  AMB-04 is **not an arbitrary privilege escalation vulnerability** in Edlove:
  1. **The Static Snapshot Barrier:** In `localEvaluator.native.ts:128-130`, if a user's server-signed snapshot denies permission (`isAllowed === false`), execution exits immediately. The dynamic Cedar code block is never entered. An unprivileged user (e.g. Student) can never mark attendance or edit tuition records by causing a WASM crash.
  2. **The Restriction-Only Seam:** Dynamic Cedar was architected solely to apply *additional restrictions* (Shape 2 instance-level checks) on top of an existing server-signed grant.
  3. **The Fail-Open Mechanism:** If and only if the static snapshot granted permission (`isAllowed === true`), and dynamic Cedar was enabled, an unhandled WASM error causes line 178 to log a warning and return `isAllowed` (`true`). Access is granted because the static snapshot permitted it.
  4. **The Zero-Exposure Reality:** In all audited production build profiles, `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset/false. The code path is never traversed in production.

### Risk Disposition:
* **Production Risk:** **NEGLIGIBLE / ZERO** (Dormant code path).
* **Architecture Risk:** **MODERATE** (If enabled in the future, it would fail open relative to fine-grained instance restrictions).
* **Remediation Trigger:** Do NOT modify production code in this freeze. Remediate only when addressing the broader dynamic Cedar roadmap.

---

## 4. Objective Framing: The Future of Dynamic Mobile Cedar

We explicitly **reject premature architectural decisions** (e.g. unilaterally deleting dynamic Cedar or immediately writing a complex C++ JSI module). Instead, we define the two architectural paths for Product Owner and Security evaluation:

### Option A: The Pure Sovereign Snapshot Architecture (Recommended for Near-Term)
* **Doctrine:** Formally deprecate client-side dynamic Cedar. Rely 100% on the server-signed Ed25519 `PermissionSnapshot`.
* **Mechanism:**
  - Prune `cedarClientEvaluator.ts` and the dynamic branch from `localEvaluator.native.ts`.
  - ReBAC / instance-level write rules are enforced authoritatively on the server during PowerSync sync reconciliation (`security.authorizeCommand`).
* **Advantages:**
  - Zero WebAssembly overhead, zero Hermes engine crashes, zero startup lag.
  - Sub-millisecond ($O(1)$) dictionary lookups.
  - Minimal attack surface on low-end mobile devices.
* **Trade-off:** An offline user can edit any record within their granted role category until reconnection, where unauthorized mutations are rolled back.

### Option B: The Native Rust / Nitro TurboModule Architecture (Long-Term If Required)
* **Doctrine:** Retain on-device dynamic Cedar by compiling the official Rust `cedar-policy` crate into a native C++ TurboModule via Nitro Modules or React Native JSI.
* **Mechanism:**
  - Bypass WebAssembly entirely. Execute native ARM64/x86_64 machine code directly from the JavaScript thread.
* **Advantages:**
  - True offline instance-level authorization (Shape 2) without server round-trip.
  - 10x–50x faster execution than WebAssembly in browser.
* **Trade-off:**
  - Substantial engineering effort, native binary size increase (~5MB per ABI), and C++ build complexity across iOS and Android.

---

## 5. Disposition Sign-Off & Freeze

All 12 finding dispositions are formally recorded. The authorization subsystem is **FROZEN** against speculative changes pending human approval of the E1 seam extraction.
