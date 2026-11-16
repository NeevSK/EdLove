# Phase H: Authorization Verification Coverage Map

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Verification Architecture, Test Suites & Parity Checkers  
**Status:** Grounded Architectural Specification  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Summary: The Structural vs. Behavioral Verification Gap

A primary finding across Studies 1, 2, and 3 is the existence of a profound **verification gap** in the authorization subsystem:
* **The Structural Parity Illusion:** The project maintains an automated authorization parity checker (`scripts/check-authorization-parity.mjs`). However, this checker performs only static regex and AST parsing (e.g., verifying that names in `caslCapabilities.ts` match Cedar action strings). As proven in Study 1 and Study 2, it does not execute code, does not verify causal paths, and passes even when signature verification or evaluation logic is completely broken.
* **The Causal Test Deficit:** Prior to the fixes in commit `252bec65f`, existing unit tests frequently asserted only `expect(isAllowed).toBe(false)`, which passed identically for unhandled exceptions, expired tokens, or signature bypasses without proving causal branch execution.

---

## 2. Comprehensive Verification Coverage Matrix

| Execution Path / Seam | Verification Level | Test Suite / Checker | What is Actually Verified | What Escapes Verification |
| :--- | :--- | :--- | :--- | :--- |
| **1. Cedar Action / Resource Parity** | Structural Check Only | `scripts/check-authorization-parity.mjs` | String literal correspondence between Cedar policies and TypeScript registries. | Syntax validity of policies; runtime evaluation semantics; signature validity. |
| **2. Server-Side Cedar Evaluation** | Real-Engine Unit Test | `apps/sanctuary-api/src/security/__tests__/capability.test.ts`, `security.test.ts` | Server Cedar WASM engine correctly allows/denies role-level and domain-namespaced actions. | Database transaction rollback on concurrency conflicts; network latency. |
| **3. Snapshot Generation & Signing** | Real-Engine Integration Test | `apps/sanctuary-api/src/security/__tests__/snapshot.test.ts` | Server generates valid JSON snapshot and signs it with Ed25519 private key. | Mobile client deserialization quirks; Hermes date parsing edge cases. |
| **4. Snapshot Ingestion & Monotonicity** | Real Unit Test | `packages/core/src/logic/permissions/__tests__/snapshotRefresh.test.ts` | Client verifies Ed25519 signature before SQLite insert; rejects older policy versions. | Concurrent refresh collisions during ongoing write transactions. |
| **5. Mobile Evaluator (Valid Snapshot)** | Mocked Unit Test | `packages/core/src/logic/permissions/__tests__/localEvaluator.native.test.ts` | Returns `true` when valid mock snapshot matches action and resource. | Real SQLite WAL locks; real PowerSync triggers. |
| **6. Mobile Evaluator (Invalid Signature)** | Real Cryptographic Unit Test | `localEvaluator.native.test.ts` (post-`252bec65f`) & `e1-integrity-acceptance.test.ts` | Signature verification explicitly rejects tampered payload; causal failure asserted. | Tampering with in-memory Zustand store after initial load. |
| **7. Mobile Evaluator (Expired Snapshot)** | Real Unit Test | `e1-integrity-acceptance.test.ts` (ATC-04) | Expired `expiresAt` timestamp triggers fail-closed `false`. | Clock skew / user manually resetting device clock backwards. |
| **8. Dynamic Cedar Shape 1 (Role)** | Real WASM Unit Test | `cedarClientEvaluator.engine.test.ts` | Evaluates `@cedar-policy/cedar-wasm/web` inside Node.js Vitest environment. | Execution on native Hermes VM on Android/iOS (fails on mobile). |
| **9. Dynamic Cedar Shape 2 (Instance)** | Real WASM Unit Test | `cedarClientEvaluator.test.ts` | Checks instance attributes (`school_id`, `active_entity_id`) against Cedar AST. | Memory footprint and performance under low-end mobile devices. |
| **10. Local Write Interception (Drizzle PEP)** | Unit Test with Mock DB | `packages/core/src/adapters/powersync/__tests__/secureDrizzleProxy.test.ts` | Intercepts `insert`/`update`/`delete`; throws `LOCAL_WRITE_VIOLATION` on deny. | Raw SQL bypasses (`db.run(sql)`) not routed through Drizzle builder. |
| **11. 4-Pillar UI Presentation Gating** | React Hook Unit Test | `packages/core/src/logic/permissions/__tests__/useSanctuaryFeature.hooks.test.ts` | Evaluates composite flags, entitlements, citizenship, and Cedar decision. | Visual clipping or button clickability when styles fail to apply. |
| **12. Physical Device End-to-End** | Maestro UI Automation | `apps/gurudevi-mobile/maestro/flows/` | User login, screen transitions, and navigation across primary tabs. | Low-level cryptographic tamper injection or offline packet corruption. |

---

## 3. Verification Gaps & Defect Vulnerability Analysis

### Gap 1: Structural Parity vs. Runtime Semantics
* **Vulnerability:** `scripts/check-authorization-parity.mjs` checks file strings. If an engineer renames a Cedar action or deletes a policy file, the parity checker passes as long as the mock string matches.
* **Escaped Fault:** Deleting the `delete` action from Cedar DSL in Study 2 was caught only because the script happened to check a hardcoded list of actions, not because of behavioral execution.

### Gap 2: Vitest Web Engine vs. Native Hermes Substrate
* **Vulnerability:** `cedarClientEvaluator.test.ts` passes 100% in CI! Why? Because Vitest runs in Node.js where `WebAssembly` is globally available and polyfilled.
* **Escaped Fault:** Running the exact same code on React Native Hermes fails immediately with `ReferenceError: WebAssembly is not defined`. CI gives a false sense of security regarding mobile dynamic Cedar readiness.

### Gap 3: Device Clock Tampering
* **Vulnerability:** Snapshot expiration relies on `new Date() <= expiresAt`. On an offline Android device, an unprivileged user can manually change the device system clock back by 30 days in Android Settings.
* **Escaped Fault:** An expired snapshot can be artificially revived indefinitely offline because there is no trusted monotonic hardware clock check (e.g. `SystemClock.elapsedRealtime()`).

---

## 4. CI Workflow Integration

| Workflow | Path | Trigger | Authorization Checks Run | Mandatory Gate? |
| :--- | :--- | :--- | :--- | :--- |
| **Quality Gate** | `.github/workflows/quality-gate.yml` | Pull Request | `pnpm --filter @repo/sanctuary-api test`, `pnpm test` | **Yes (Blocking)** |
| **PR Guard** | `.github/workflows/pr-guard.yml` | Pull Request | Linting, Biome, Dependency Boundaries | **Yes (Blocking)** |
| **EAS Release** | `.github/workflows/eas-release.yml` | Tag / Dispatch | Builds mobile binary; dynamic Cedar excluded | **Yes** |
| **Parity Check** | Standalone Script | Manual / `pnpm check-all` | `pnpm run audit:authorization-parity` | **Optional in PR Guard** |
