# Sovereign Monorepo: Future-Proof Coding Patterns & Architectural Standards (2026-2030)

This document establishes the definitive, future-proof architectural standards and engineering patterns for the Gurudevi platform. It serves as a continuous reference and engineering contract for building ultra-resilient, local-first applications that function flawlessly in zero-connectivity environments (such as remote Sri Lankan schools) while maintaining absolute data integrity and granular authorization security.

---

## 1. The Core Engineering Manifesto

Sovereign is built around three fundamental tenets:
1. **0ms UI Latency (Action-First)**: The user interface must never block on a network request. All user interactions (attendance, mood logging, profiles) must write instantly to local native memory.
2. **Secure Resilience (Encrypted Safe Harbor)**: Critical personal wellbeing and school academic data must be protected with on-device page-level AES-256 encryption using keys secured by hardware security modules (SecureStore).
3. **Zero-Trust Client, Autonomous Server**: While the client performs autonomous local evaluation for instant UI response and feature gating, the backend gateway acts as the final gatekeeper, re-validating all incoming transactions against our declarative access-control engine.

---

## 2. High-Performance Local-First Data Loop

Our client-side data layer operates on a modern, zero-overhead **JSI direct-memory C++ interface** that links JavaScript straight to C++ memory structures, bypassing standard serialized JSON bridges.

```
                  ┌───────────────────────────────────┐
                  │          React UI Tree            │
                  └─────────────────▲─────────────────┘
                                    │ (useDrizzleQuery)
                                    │
                                    ▼ (Drizzle .toSQL() AST)
                  ┌───────────────────────────────────┐
                  │      Drizzle AST Compiler         │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼ (Compiled SQL & Parameters)
                  ┌───────────────────────────────────┐
                  │  PowerSync Reactive JSI Watcher   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼ (Direct C++ Memory Pointer)
┌─────────────────────────────── op-sqlite ───────────────────────────────┐
│                                                                         │
│   [SQLCipher AES-256] ──► [SQLite Core Core Engine]                     │
│            ▲                                                            │
│            │ (Background replication protocol)                          │
│   [@powersync/op-sqlite] ◄──► [Local Binary Outbox Queue]               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Future-Oriented Standards & Guardrails
*   **Compile-Once, Stream-Forever**: Never write raw string queries in the UI. Always compile queries using Drizzle AST engines and pipe them into PowerSync's `.watch()` stream to prevent runtime query-signature mismatches.
*   **Decoupled Environments (Dependency Injection)**: To maintain a fast Vitest testing suite and server-side safety in Node.js, native JSI libraries must **never** be imported directly into shared `@repo/core` libraries. Use the **Runtime Dependency Injection Pattern** (`injectNativePowerSyncDB`) to keep core packages pure, lightweight, and server-runnable.
*   **Index-First Schemas**: Because full-disk page encryption (SQLCipher) incurs a cryptographic cost, all local schemas must declare explicit indexes on primary search vectors and partition keys to avoid full-table sequential disk scans.

---

## 3. Local-First Authorization (Offline Cedar Engine)

To guarantee that authorization checks remain active off-grid, we use a hybrid **Edge PDP (Policy Decision Point)** model powered by Amazon's **Cedar Policy Engine**.

```
┌──────────────────────────────────────────────────────────────────┐
│                      Sovereign Mobile Client                     │
│                                                                  │
│  [User Action] ──► [Local Evaluator: check()] ──► [UI Response]  │
│                            ▲                                     │
│                            │ (Loads from Memory Cache)           │
│                    [Cedar WASM / JSI]                            │
│                            ▲                                     │
│                            │ (Replicated via PowerSync)          │
│                 [(SQLite: cedar_policies)]                       │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ (Outbox Replication Sync)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Hono sanctuary-api                        │
│                                                                  │
│         [Final Policy decision] ◄──► [Central Cedar Engine]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Standards for Cedar Integration
*   **WASM & Native Rust Bridging**: On-device evaluation uses Cedar compiled to WebAssembly (WASM) or exposed via a custom native C++ rust-bridge (JSI). This provides deterministic authorization decisions on the client in `<1ms`.
*   **Dynamic Policy Distribution**: Cedar policies (e.g., [principal.cedar](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/policies/school/principal.cedar)) are treated as syncable assets. Instead of static compilation, policies are stored in the replicated `gurudevi-powersync.db` under a `cedar_policies` table. When policies are modified in the cloud, they sync to the client in `<200ms` and re-initialize the local engine on the fly.
*   **Deterministic Attribute Mapping**: Client-side evaluation must construct rich entity context matching the central Cedar schema:
    ```typescript
    const principalEntity = {
      uid: { type: 'User', id: user.id },
      attrs: {
        capacity: user.capacity, // principal, teacher, etc.
        school_id: user.schoolId,
        classroom_ids: user.classroomIds
      }
    };
    ```

---

## 4. Speculative Write Reconciliation ("Pressure Theory")

When offline, the client accepts writes and localizes them immediately to the local database, displaying a speculative "Save Successful" UI. We enforce a **Two-Tier Synchronization Lifecycle**:

```
[UI Trigger: Attendance Save]
             │
             ▼
[Local Secure C++ Write: op-sqlite] (Completes in 2ms)
             │
             ├─► [PowerSync Outbox Row Inserted] (Triggers network drain attempt)
             └─► [UI Renders Checked Student]
             │
      (Offline Phase)
             │
   (Connection Restored)
             │
             ▼
[PowerSync background Outbox Drain]
             │
             ▼
[Hono Server Gateway: sanctuary-api]
             │
             ▼ (ZenStack / Cedar Policy Re-Validation)
┌────────────────────────────┴────────────────────────────┐
│                                                         │
│               Permitted?                                │
│               /        \                                │
│             YES         NO                              │
│             /             \                             │
│            ▼               ▼                            │
│  [Committed to Cloud PG]  [Gateway Blocked & Rollback]  │
│  [Synced to Outbox Done]  [Sync conflict Triggered]     │
│                           [Client State Rectified]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sync & Conflict Reconciliation Rules

1. **ReBAC Gateway Safeguards**: The Hono gateway runs every transaction against declarative **ZenStack** policy rules (`schema.zmodel`):
   ```typescript
   @@allow('write', auth().bonds?[capacity == 'teacher' && entity_id == classroom.school_id])
   ```
   If a client drifts or attempts a transaction that violates modern active rules, the Hono gateway rejects the write, and the outbox triggers a **Secure Rollback** event, reverting the local database state and alerting the user.

2. **Idempotency Requirements**: All sync transactions must supply a unique, client-generated UUID (`id`) and temporal metadata (`updated_at`). Server writes use `UPSERT` syntax bound to transaction-log timestamps to ensure out-of-order offline actions do not overwrite newer online transactions.

---

## 5. Summary of Future Stack Components

| Technology | Role | 2026-2030 Status & Rationale |
| :--- | :--- | :--- |
| **Drizzle ORM** | Client SQLite Interface | **Gold Standard**. Lightweight, zero-codegen, compiles to clean AST SQL strings, handles integer-to-boolean mapping natively. |
| **PowerSync** | Replication & Sync Engine | **Gold Standard**. Replicates PG shapes to clients via binary protocols, watches transaction logs for real-time reactivity. |
| **op-sqlite (JSI)** | Client C++ DB Engine | **Gold Standard**. Replaces deprecated `quick-sqlite`. Bridges SQLite directly to C++ memory, supporting SQLCipher and FTS5. |
| **Amazon Cedar** | Granular Auth Engine | **Gold Standard**. Written in Rust, compiled to WASM/JSI. Allows unified, deterministic evaluation on both browser and device. |
| **Zustand + MMKV** | Client UI State | **Gold Standard**. Retains synchronous key-value state for UI layout, tokens, and active outbox counts. |
