# Phase 12: Master Findings & Architectural Topology

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** End-to-End Authorization Architecture Reconstruction  
**Status:** Grounded Architectural Specification & Executive Master Report  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Synthesis & Core Question Answers

This master report synthesizes the complete findings of the read-only authorization architecture investigation on Edlove. Below are the definitive, evidence-grounded answers to the 15 architectural questions posed in Section 13.

---

### Question 1: What is the primary authorization mechanism for online users?
* **Answer [OBSERVED]:**  
  Online authorization is a **two-tier model**:
  1. *Client-side presentation gating:* UI components synchronously evaluate permissions using `useSanctuaryFeature`, which reads an in-memory decision map (`useCedarDecisionStore`) populated from the local Ed25519-signed permission snapshot.
  2. *Server-side authoritative gating:* When an online mutation or RPC command is transmitted to `apps/sanctuary-api`, the backend API gateway enforces authorization using `security.authorize` / `authorizeCapability` (`apps/sanctuary-api/src/security/security.ts:641`), which executes compiled Cedar policies against live database context using the server-side `@cedar-policy/cedar-wasm/nodejs` engine.

---

### Question 2: What is the primary authorization mechanism for offline users?
* **Answer [OBSERVED]:**  
  The primary offline mechanism is the **server-signed permission snapshot**.  
  When an offline user performs a database mutation (insert, update, delete), the operation is intercepted by `secureDrizzleProxy.ts:97-120` and dispatched to `localEvaluator.native.ts:checkLocalPermission`. The evaluator verifies the Ed25519 signature of the local `permission_snapshots` SQLite row, checks that the snapshot has not expired (`expiresAt > now`), and verifies that the 2D boolean matrix permits the action for the resource type.

---

### Question 3: Does the client ever call a remote API specifically to ask "is user X authorized to perform action Y"?
* **Answer [OBSERVED]:**  
  **No.**  
  Inspection of the v1 contract (`packages/core/src/api/v1/contract.ts:40-85`) and API router (`apps/sanctuary-api/src/core/router.ts`) reveals that no `/authorize`, `can(...)`, or permission query endpoints exist. The client never queries the server to decide whether to render a button or permit an action. The client only calls `authority.refreshSnapshot({ bondId })` to obtain the signed 24-hour snapshot.

---

### Question 4: Is dynamic Cedar evaluation active in production builds today?
* **Answer [CONFIGURED/OBSERVED]:**  
  **No.**  
  Dynamic Cedar evaluation is gated by `process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`. In production build profiles (`apps/gurudevi-mobile/eas.json`), this flag is unset/false. Furthermore, inspection of production mobile bundles (`reports/device-runs/2026-10-22-a52-metropolitan-governor/entry.bundle`) confirms that Metro inlines this flag as `false === 'true'`, and the minifier dead-code prunes the entire dynamic Cedar branch from the production binary.

---

### Question 5: Can Cedar WASM run on React Native Hermes in the current project configuration?
* **Answer [OBSERVED]:**  
  **No.**  
  React Native 0.88 running on the standard Hermes JavaScript engine does not provide a native global `WebAssembly` implementation. The client evaluator (`cedarClientEvaluator.ts`) imports `@cedar-policy/cedar-wasm/web`, which relies on `fetch()` and `WebAssembly.instantiateStreaming`. On Hermes, calling this loader triggers an immediate runtime exception (`ReferenceError: WebAssembly is not defined`), which falls into the catch block. No native JSI WASM polyfill exists in the repository.

---

### Question 6: What happens when an offline user's snapshot expires while they are still offline?
* **Answer [OBSERVED]:**  
  **The client fails closed to a read-only state.**  
  When `expiresAt <= new Date()`, `localEvaluator.native.ts:114-121` logs `Mobile permission snapshot has expired. Access denied.` and returns `false`. All subsequent local database writes intercepted by `secureDrizzleProxy.ts` throw `SovereignError` (`LOCAL_WRITE_VIOLATION`, status 403). UI gates evaluating the expired snapshot also disable mutation controls. Local reads (`db.select()`) continue to function because reads bypass `secureDrizzleProxy`.

---

### Question 7: If an administrator revokes a user's permissions on the server, how long until the offline client enforces the revocation?
* **Answer [OBSERVED]:**  
  **Up to 24 hours (until snapshot expiration), or upon next network reconnection.**  
  Snapshots are issued with a 24-hour lifetime (`generator.ts:45`). Because the client cannot receive push notifications while offline, it continues to trust the cryptographically valid snapshot until `expiresAt`. If the user attempts to sync mutations after reconnecting, the server re-evaluates the bond against live PostgreSQL state; the server rejects the queued mutations with HTTP 403 `FORBIDDEN` and deletes the active bond on the device.

---

### Question 8: What is the exact role of `secureDrizzleProxy.ts` in authorization?
* **Answer [OBSERVED]:**  
  `secureDrizzleProxy.ts` acts as the **Local Policy Enforcement Point (PEP)** for client database mutations:
  1. *Reads:* Methods `select` and `query` are passed directly through to the underlying database without security checks (lines 93-96).
  2. *Writes:* Methods `insert`, `update`, and `delete` are wrapped in a proxy builder (lines 97-170). When executed, the proxy checks for a valid `CapabilityToken` (ADR-012); if absent, it executes the registered `_permissionValidator` (`checkLocalPermission` in `localEvaluator.native.ts`). If the validator returns `false`, it throws `LOCAL_WRITE_VIOLATION` (403), preventing unauthorized writes from committing to SQLite.

---

### Question 9: How do ZenStack policies relate to Cedar policies?
* **Answer [OBSERVED]:**  
  **They are separate, disconnected policy layers.**  
  ZenStack schemas (`packages/schema/schema.zmodel`) define declarative `@@allow` and `@@deny` rules intended for Prisma/PostgreSQL Row Level Security (RLS). However, `apps/sanctuary-api` does not use ZenStack ORM; it uses direct PostgreSQL queries via `pg.Pool` and enforces access control imperatively using **Cedar**. ZenStack policies are legacy artifacts from earlier iterations (POA/CASL), whereas Cedar is the modern canonical authorization engine.

---

### Question 10: What is the relationship between `useSanctuaryFeature` and `checkLocalPermission`?
* **Answer [OBSERVED]:**  
  * `useSanctuaryFeature.ts` is the **Client Presentation Gate (UI PEP)**. It is a React hook that reads synchronously from `useCedarDecisionStore` (memory) and combines Cedar decisions with Feature Flags, Entitlements, and Citizenship Tiers to determine whether buttons, screens, and tabs are visible or interactive.
  * `checkLocalPermission` (`localEvaluator.native.ts`) is the **Local Database Write Gate (Data PEP)**. It executes asynchronously during Drizzle mutations, querying SQLite, verifying the Ed25519 signature, checking expiration, and validating write permissions before any row is written to disk.

---

### Question 11: How does the system handle concurrent writes to the same resource by different offline users?
* **Answer [DOCUMENTED/OBSERVED]:**  
  **Local acceptance followed by server-side reconciliation via PowerSync.**  
  Both offline clients authorize writes locally against their independent local snapshots and commit them to their local SQLite WAL. When both devices reconnect:
  1. PowerSync streams the mutations from `ps_crud` to the backend.
  2. The backend sync worker processes mutations serially inside PostgreSQL transactions under row-level locks (`SELECT ... FOR UPDATE`).
  3. The server re-evaluates Cedar authorization for each user.
  4. If both are authorized, last-write-wins (LWW) or domain-specific conflict handlers reconcile the records. If an offline user was unauthorized, their write is rejected, and PowerSync rolls back their local SQLite row.

---

### Question 12: What is the fail-closed vs fail-open behavior of every component in the authorization chain?
* **Answer [OBSERVED]:**
  * `apps/sanctuary-api` (`security.authorize`): **Fail-Closed.** Missing tokens, unknown scopes, Cedar denials, and evaluation errors throw HTTP 403 `FORBIDDEN` or HTTP 503 `UNAVAILABLE`.
  * `snapshotRefresh.ts` (API response handler): **Fail-Closed.** Invalid Ed25519 signatures or rolled-back policy versions reject the snapshot and do not save to SQLite.
  * `localEvaluator.native.ts` (Snapshot evaluation): **Fail-Closed.** Missing bonds, missing snapshots, invalid signatures, expired timestamps, and top-level errors return `false`.
  * `secureDrizzleProxy.ts` (Database proxy): **Fail-Closed.** Denied permissions throw `LOCAL_WRITE_VIOLATION` (403).
  * `localEvaluator.native.ts:178` (`catch (wasmError)`): **Fail-Open relative to dynamic rules.** If dynamic Cedar WASM crashes, it falls back to `isAllowed` from the static snapshot.

---

### Question 13: Is the authorization parity checker checking the right things?
* **Answer [OBSERVED]:**  
  **No.**  
  `scripts/check-authorization-parity.mjs` is a static AST/regex parsing linter. It checks that string literals representing actions in TypeScript registries have matching lines in `.cedar` files. It does not execute the policy engine, does not verify cryptographic signatures, does not test database proxies, and does not test runtime failure modes. It passed completely in Study 2 even when signature checks were deleted. It checks structural naming consistency, not authorization security.

---

### Question 14: What was the architectural intent of having both static snapshots and dynamic Cedar evaluation?
* **Answer [DOCUMENTED/OBSERVED]:**  
  To balance **performance vs. precision**:
  * *Static Snapshots:* Provide sub-millisecond, zero-dependency, crash-proof Shape 1 (role-level) permission gating for 95% of UI and CRUD operations without loading heavy WASM binaries on mobile.
  * *Dynamic Cedar:* Intended to handle complex Shape 2 (instance-level) relationship constraints (e.g., verifying student enrollment status or record ownership) directly on the device using raw Cedar policies when fine-grained offline write safety is required.

---

### Question 15: What is the minimum set of changes required to make the offline authorization subsystem production-ready?
* **Answer [OBSERVED/INFERRED]:**  
  The minimum production-hardening roadmap requires exactly 4 targeted interventions:
  1. **Seam Extraction (E1 Implementation):** Extract snapshot signature verification into a pure, dependency-explicit helper (`verifySnapshotCryptographicSignature` in `signature.ts`) to enable isolated cryptographic verification.
  2. **Remediate AMB-04:** Modify `localEvaluator.native.ts:178` so that if dynamic Cedar evaluation fails or throws, it fails closed (`return false`) or requires an explicit fallback policy rather than silently defaulting to static `isAllowed`.
  3. **Hermes Native Packaging:** Either formally deprecate client-side dynamic Cedar and rely 100% on server-signed snapshots, or package Cedar using a native C++ JSI runtime module (e.g., Rust-compiled Nitro module) instead of web WASM.
  4. **Monotonic Hardware Clock Check:** Replace `new Date()` with an anti-tamper monotonic clock heuristic (comparing last recorded sync time and hardware uptime) to prevent device clock rollback bypasses.

---

## 2. End-to-End Architectural Topology Diagram

The diagram below maps the complete authorization execution topology.  
**Edge Style Legend:**
* **Solid Edges (`──>`):** Empirically verified by code inspection and tests [OBSERVED].
* **Dashed Edges (`- - >`):** Configured via build profiles or environment variables [CONFIGURED].
* **Dotted Edges (`...>`):** Documented in architecture specifications or inferred [DOCUMENTED/INFERRED].

```mermaid
flowchart TD
    subgraph Client_Presentation [Client UI & Presentation Layer]
        UI[React UI Screen / Button]
        Hook[useSanctuaryFeature Hook]
        Store[(useCedarDecisionStore Memory)]
        UI -->|1. Check Visibility| Hook
        Hook -->|2. Fast Sync Read| Store
    end

    subgraph Client_Storage_PEP [Client Local Database PEP Layer]
        Form[User Form Submission]
        Proxy[secureDrizzleProxy Interceptor]
        Sqlite[(Local SQLite WAL DB)]
        UploadQueue[PowerSync ps_crud Queue]
        
        Form -->|3. db.insert / update / delete| Proxy
        Proxy -->|12. Permitted: Commit SQL| Sqlite
        Sqlite -->|13. Capture Mutation Trigger| UploadQueue
    end

    subgraph Client_Local_PDP [Client Offline PDP Orchestrator]
        NativeEval[localEvaluator.native.ts]
        SigCheck[signature.ts: verifySignature]
        SnapTable[(SQLite permission_snapshots)]
        DynamicEval[cedarClientEvaluator.ts]
        
        Proxy -->|4. Validate Write| NativeEval
        NativeEval -->|5. Read Snapshot Row| SnapTable
        NativeEval -->|6. Cryptographic Check| SigCheck
        SigCheck -->|7. Verified Valid| NativeEval
        NativeEval -->|8. Expiry Check now < expiresAt| NativeEval
        NativeEval -->|9. Static Matrix Check| NativeEval
        
        NativeEval -.->|10. IF EXPO_PUBLIC_DYNAMIC_CEDAR=true| DynamicEval
        DynamicEval -.-x|11. Web WASM Fails on Hermes| NativeEval
        NativeEval -->|11a. Fallback to Snapshot ALLOW| Proxy
    end

    subgraph Server_Gateway [Sanctuary API Server Gateway]
        RPC[oRPC Procedure Handler]
        AssertId[security.ts: assertIdentity]
        AuthzCap[security.ts: authorizeCapability]
        ServerWasm[Cedar Engine @cedar-policy/cedar-wasm/nodejs]
        Postgres[(PostgreSQL Production DB)]
        Signer[Ed25519 Snapshot Signer]
        
        Form ==>|Direct Online RPC Command| RPC
        RPC -->|Assert JWT & UUIDv8| AssertId
        AssertId -->|Verify Session| Postgres
        RPC -->|Authorize Command| AuthzCap
        AuthzCap -->|Lock Scope & Load Attrs| Postgres
        AuthzCap -->|Execute Cedar Policy| ServerWasm
        ServerWasm -->|Decision: ALLOW| AuthzCap
        AuthzCap -->|Commit Transaction| Postgres
    end

    subgraph Snapshot_Distribution [Snapshot Issuance & Distribution]
        RefreshRPC[authority.refreshSnapshot Procedure]
        RefreshHandler[snapshotRefresh.ts Client Handler]
        
        RefreshRPC -->|Batch Pre-Compute| ServerWasm
        RefreshRPC -->|Ed25519 Sign Payload| Signer
        Signer -->|Direct oRPC Response Body| RefreshHandler
        RefreshHandler -->|Verify Sig & Version| SnapTable
        SnapTable -->|Boot Load| Store
    end

    subgraph PowerSync_Reconciliation [PowerSync Sync Reconciliation]
        SyncWorker[PowerSync Backend Worker]
        UploadQueue -.->|Reconnection Upload Stream| SyncWorker
        SyncWorker ==>|Re-Authorize with Live Cedar| AuthzCap
    end

    classDef observed fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef configured fill:#fff3e0,stroke:#f57c00,stroke-width:2px,stroke-dasharray: 5 5;
    classDef documented fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,stroke-dasharray: 2 2;
    classDef danger fill:#ffebee,stroke:#c62828,stroke-width:2px;

    class UI,Hook,Store,Form,Proxy,Sqlite,NativeEval,SigCheck,SnapTable,RPC,AssertId,AuthzCap,ServerWasm,Postgres,Signer,RefreshRPC,RefreshHandler observed;
    class DynamicEval,UploadQueue,SyncWorker configured;
