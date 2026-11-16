# Phase A: Authorization Concept Disambiguation & Glossary

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Authorization, Identity & Offline Policy Engine  
**Status:** Grounded Architectural Specification  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Summary

A primary source of cognitive drift and false assumptions in previous authorization studies on Edlove was semantic overloading. Terms like "authorization", "Cedar", "local", and "auth" were used interchangeably to describe fundamentally distinct architectural layers, physical processes, and security boundaries.

This glossary provides formal, unambiguous definitions for the 15 core architectural concepts and analyzes the critical overloaded terms discovered across the codebase.

---

## 2. The 15 Core Architectural Concepts

### Concept 1: Authentication (AuthN) vs. Authorization (AuthZ)
* **Authentication (AuthN) [OBSERVED]**: The verification of identity. In Edlove, authentication establishes *who* the caller is. It is handled by Supabase Auth (JWT credentials, passkeys, phone OTP) and resolved into an immutable Edlove Account UUIDv8 (`public.users.id`). 
  * *Code Substrate:* `packages/core/src/store/useAuthStore.ts`, `apps/sanctuary-api/src/security/security.ts:250-320` (`assertIdentity`).
* **Authorization (AuthZ) [OBSERVED]**: The evaluation of permissions. It establishes *what* an authenticated identity, acting within a specific civic capacity (Bond), is permitted to do with a given resource under active policy.
  * *Code Substrate:* `packages/policies/src/engine/evaluator.ts`, `apps/sanctuary-api/src/security/security.ts:548-680` (`authorize`, `authorizeCapability`).

### Concept 2: Policy Decision Point (PDP) vs. Policy Enforcement Point (PEP)
* **Policy Decision Point (PDP) [OBSERVED]**: The logical component that evaluates applicable policies, principal attributes, action descriptors, and resource context to render a boolean decision (`allow` or `deny`). Edlove has two distinct PDPs:
  1. *Server PDP:* `@cedar-policy/cedar-wasm/nodejs` evaluating compiled Cedar policies inside `apps/sanctuary-api`.
  2. *Offline Local PDP:* `packages/core/src/logic/permissions/localEvaluator.native.ts` evaluating signed snapshot entries (and conditionally `cedarClientEvaluator.ts` via WASM).
* **Policy Enforcement Point (PEP) [OBSERVED]**: The boundary interceptor that intercepts an operation, queries the PDP, and enforces the outcome by blocking execution or throwing an exception. Edlove has three distinct PEPs:
  1. *Server Gateway PEP:* `apps/sanctuary-api/src/security/security.ts:741` (`authorizeCommand`).
  2. *Client Local Database PEP:* `packages/core/src/adapters/powersync/secureDrizzleProxy.ts:100-180` (intercepting Drizzle `insert`, `update`, `delete`).
  3. *Client UI Presentation PEP:* `packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts` (gating visible UI components, buttons, and navigation flows).

### Concept 3: Server Cedar vs. Client Cedar
* **Server Cedar [OBSERVED]**: The production-authoritative Cedar policy engine running in Node.js on `apps/sanctuary-api`. It loads `@cedar-policy/cedar-wasm/nodejs`, parses `.cedar` policies from `@repo/policies`, queries real-time database context under transaction locks, and renders definitive authorization decisions.
  * *Code Substrate:* `apps/sanctuary-api/src/security/security.ts:570-600`, `packages/policies/src/engine/evaluator.ts`.
* **Client Cedar [OBSERVED/CONFIGURED]**: An experimental module designed to run Cedar policy evaluation directly on native mobile clients using `@cedar-policy/cedar-wasm/web`. It evaluates raw policy strings stored in the SQLite `cedarPolicies` table.
  * *Code Substrate:* `packages/core/src/logic/permissions/cedarClientEvaluator.ts`, `packages/core/src/logic/permissions/localEvaluator.native.ts:131-180`.
  * *Status:* Disabled by default in production build configurations (`EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR`).

### Concept 4: Static Permission Snapshot vs. Dynamic Cedar Policy Evaluation
* **Static Permission Snapshot [OBSERVED]**: A pre-computed, bounded matrix of permissions issued by `apps/sanctuary-api` for an active civic bond. The server iterates over all known resources and actions in the registry, evaluates Cedar server-side, signs the resulting JSON matrix with an Ed25519 private key, and issues it with a 24-hour expiration (`expiresAt = now + 86400000`).
  * *Code Substrate:* `packages/policies/src/snapshot/generator.ts`, `apps/sanctuary-api/src/security/security.ts:480-530`.
* **Dynamic Cedar Policy Evaluation [OBSERVED]**: The evaluation of raw Cedar DSL rules at the moment of access, parameterized by real-time instance attributes (e.g., checking whether `resource.school_id == principal.school_id`).
  * *Code Substrate:* `packages/core/src/logic/permissions/cedarClientEvaluator.ts:70-130` (`evaluateShape2`).

### Concept 5: Remote Authorization vs. Offline Authorization
* **Remote Authorization [OBSERVED]**: Authorization performed by the backend API when processing an incoming RPC command. The client does not call an isolated authorization check; rather, authorization is embedded in the command execution lifecycle.
  * *Code Substrate:* `apps/sanctuary-api/src/security/security.ts:741` (`authorizeCommand`).
* **Offline Authorization [OBSERVED]**: Authorization performed locally on the client without network access, enabling disconnected operations. Local writes to SQLite are checked against the locally cached, cryptographically verified permission snapshot.
  * *Code Substrate:* `packages/core/src/logic/permissions/localEvaluator.native.ts:98-195`.

### Concept 6: Authorization Storage vs. Synchronization vs. Distribution
* **Authorization Storage [OBSERVED]**: The local persistence layer holding authorization data on the client. Implemented via SQLite tables managed by PowerSync / expo-sqlite: `permission_snapshots` (for pre-computed snapshots) and `cedar_policies` (for raw policy strings).
  * *Code Substrate:* `packages/core/src/logic/permissions/snapshotRefresh.ts`, `packages/schema/src/sqlite/schema.ts`.
* **Authorization Synchronization [OBSERVED/DOCUMENTED]**: Background replication of database tables between PostgreSQL and local SQLite via PowerSync streams. Historically intended to replicate snapshots and policies.
* **Authorization Distribution [OBSERVED]**: The mechanism by which the authorization snapshot reaches the device. In current architecture, distribution is decoupled from general data sync: it is delivered directly in the response payload of the `authority.refreshSnapshot` oRPC procedure.
  * *Code Substrate:* `packages/core/src/api/v1/contract.ts:63-80`, `apps/sanctuary-api/src/security/security.ts:500-530`, commit `c6665f2cc`.

### Concept 7: Policy Versioning vs. Snapshot Expiration vs. Fallback Behavior
* **Policy Versioning [OBSERVED]**: Tracking the semantic version of the Cedar policy ruleset (e.g., `"2026-05-18.1"`). The client enforces monotonicity: a snapshot carrying an older policy version cannot overwrite a newer version already stored in SQLite.
  * *Code Substrate:* `packages/core/src/logic/permissions/snapshotRefresh.ts:65-80`, commit `3b613f3c8`.
* **Snapshot Expiration [OBSERVED]**: A temporal boundary (epoch timestamp) after which a snapshot becomes invalid regardless of signature validity. The evaluator rejects expired snapshots with fail-closed semantics (`return false`).
  * *Code Substrate:* `packages/core/src/logic/permissions/localEvaluator.native.ts:114-121`.
* **Fallback Behavior [OBSERVED/CONFLICTING]**: What happens when an evaluation step encounters an unexpected error. 
  * *Evaluator Level:* The top-level try/catch fails closed (`return false`).
  * *Dynamic WASM Level (AMB-04):* If dynamic WASM fails or throws, it falls back to the static snapshot's boolean decision (`return isAllowed`), which is fail-open relative to dynamic restrictions.

### Concept 8: Civic Bond (Capacity & Entity Binding)
* **Civic Bond [OBSERVED]**: The central authorization tuple linking an authenticated User to an Entity (e.g., a School, Classroom, or Family) in a specific Capacity (e.g., `'teacher'`, `'student'`, `'guardian'`, `'admin'`). In Edlove, permissions are never granted directly to a user in isolation; they are granted to a User through an active Bond.
  * *Code Substrate:* `packages/core/src/types/Identity.ts`, `apps/sanctuary-api/src/security/security.ts:70-130`.

### Concept 9: Capability Token (ADR-012)
* **Capability Token [OBSERVED]**: A short-lived, in-memory cryptographic or state token authorizing a specific high-velocity operation batch without re-evaluating full policy on every write.
  * *Code Substrate:* `packages/core/src/adapters/powersync/secureDrizzleProxy.ts:38-55` (`isTokenValid`, `_activeToken`).

### Concept 10: 4-Pillar UI Gate
* **4-Pillar UI Gate [OBSERVED]**: The composite presentation gate evaluated by `useSanctuaryFeature.ts` before rendering sensitive UI controls:
  1. *Feature Flags:* Global and per-user feature rollout flags (`useFeatureStore`).
  2. *Entitlements:* School subscription tiers and billing status (`useEntitlementStore`).
  3. *Citizenship Tier:* User trust level: `FIRST_CLASS`, `SECOND_CLASS`, `THIRD_CLASS` (`resolveBondCitizenship`).
  4. *Cedar Decision:* Offline permission snapshot decision (`useCedarDecisionStore`).

### Concept 11: Shape 1 vs. Shape 2 Cedar Authorization
* **Shape 1 (Role-Level Capability) [OBSERVED]**: A static authorization query asking: *"Can this capacity perform action A on resource type R?"* Does not require specific resource instance attributes. Evaluated using a placeholder resource ID (`__cedar_shape1_check__`).
  * *Code Substrate:* `packages/core/src/logic/permissions/cedarClientEvaluator.ts:60-95`.
* **Shape 2 (Instance-Level Permission) [OBSERVED]**: An instance-specific query asking: *"Can this user perform action A on specific resource instance X?"* Requires real resource attributes loaded from local SQLite.
  * *Code Substrate:* `packages/core/src/logic/permissions/cedarClientEvaluator.ts:100-145`.

### Concept 12: Fail-Closed vs. Fail-Open Semantics
* **Fail-Closed [OBSERVED]**: A security design principle where any unexpected error, missing credential, invalid signature, or expired state defaults to DENY (`isAllowed = false`, HTTP 403, or HTTP 503).
* **Fail-Open [OBSERVED]**: A design where an error causes the system to grant access or bypass a restriction. Observed in the dynamic Cedar WASM exception handler relative to dynamic restrictions.

### Concept 13: Local Evaluator Orchestrator
* **Local Evaluator Orchestrator [OBSERVED]**: The core native decision function `checkLocalPermission` registered with the database proxy. It chains: (1) bond validation, (2) snapshot lookup, (3) Ed25519 signature verification, (4) expiration check, (5) static matrix lookup, (6) optional dynamic Cedar WASM evaluation, and (7) top-level fail-closed catch.
  * *Code Substrate:* `packages/core/src/logic/permissions/localEvaluator.native.ts:35-195`.

### Concept 14: In-Memory Decision Store (`useCedarDecisionStore`)
* **In-Memory Decision Store [OBSERVED]**: A Zustand client store that loads the active snapshot from SQLite during app boot, verifies its signature, parses the JSON permissions matrix, and provides synchronous `getDecision(action, subject)` access for React components.
  * *Code Substrate:* `packages/core/src/store/useCedarDecisionStore.ts`.

### Concept 15: PowerSync Local Write Interceptor
* **PowerSync Local Write Interceptor [OBSERVED]**: The architectural mechanism (`createSecureDrizzleProxy`) wrapping the Drizzle ORM database instance on the client. It permits raw reads without restriction but intercepts all writes (`insert`, `update`, `delete`) and executes the registered `_permissionValidator` before executing the SQL statement.
  * *Code Substrate:* `packages/core/src/adapters/powersync/secureDrizzleProxy.ts:90-180`.

---

## 3. Analysis of Overloaded Terminology

### 1. `AuthManager.ts` / `AuthClient` (AuthN vs. AuthZ Overload)
* **The Confusion [OBSERVED]:** In Study 1, the test suite failure was attributed to a missing `AuthManager.ts` in `scripts/check-authorization-parity.mjs`.
* **The Reality [OBSERVED]:** `AuthManager` (now refactored into `useAuthStore` and `apps/sanctuary-api/src/security/security.ts:assertIdentity`) was an **authentication** and session management service. It handled JWT tokens, Supabase logins, and user profiles. It did NOT evaluate permissions or enforce Cedar policies. The parity checker was conflating session authentication with authorization parity.

### 2. `checkLocalPermission` (Offline vs. Local Overload)
* **The Confusion [INFERRED]:** The name implies that `checkLocalPermission` is only used when the user is disconnected (offline).
* **The Reality [OBSERVED]:** `checkLocalPermission` is executed for **every local Drizzle write** on mobile, whether the device is offline or online with full 5G WiFi! Because the mobile app uses a Local-First / Offline-First architecture (PowerSync), all database mutations write to local SQLite first. Thus, `checkLocalPermission` is the local write PEP regardless of network state.

### 3. "Cedar" (Engine vs. DSL vs. Client Evaluator vs. Snapshot Overload)
* **The Confusion [DOCUMENTED]:** Documentation often states "Edlove uses Cedar for authorization."
* **The Reality [OBSERVED]:** "Cedar" refers to four distinct artifacts:
  1. *Cedar DSL:* The policy syntax files defined in `packages/policies/cedar/`.
  2. *Cedar Server Engine:* `@cedar-policy/cedar-wasm/nodejs` evaluating policies inside `apps/sanctuary-api`.
  3. *Cedar Snapshot Generator:* The batch compiler in `packages/policies/src/snapshot/generator.ts` that runs the engine server-side to generate static matrices.
  4. *Cedar Client Evaluator:* `@cedar-policy/cedar-wasm/web` in `packages/core/src/logic/permissions/cedarClientEvaluator.ts` (currently inactive in production).

### 4. "Permission" (Database Row vs. Token vs. Action vs. Entitlement)
* **The Confusion [OBSERVED]:** Different modules define "permission" differently:
  * In `permission_snapshots`: A boolean cell in a 2D JSON matrix: `permissions[resourceType][action] === true`.
  * In `secureDrizzleProxy`: A valid `CapabilityToken` with expiry and hash.
  * In `@repo/policies`: A Cedar action (e.g., `'Action::"create_attendance"'`).
  * In `useSanctuaryFeature`: A compound result combining Flags, Entitlements, Citizenship, and Cedar.
  * In `packages/schema/schema.zmodel`: A ZenStack `@@allow` / `@@deny` policy rule mapped to PostgreSQL RLS.
