---
title: "Gurudevi Offline Authorization Architecture"
status: "active"
created: 2026-05-18
updated: 2026-05-18
author: "Naween"
tags: [reorganized]
---

# Sovereign Offline-First Authorization Architecture
**Version**: 2026.5  
**Status**: Authoritative Reference Specification  
**Strategy**: Cryptographically Signed Capability Snapshots with Double-Gate Server Enforcement  

---

## 1. Executive Summary

In a local-first, offline-ready ecosystem like **Sovereign (Gurudevi)**, network connectivity is a transient state, not a prerequisite. Standard web authorization architectures—which rely on real-time API authentication or stale server-issued tokens—fail completely in offline environments when a user creates or modifies resources dynamically.

To deliver a secure, robust, and zero-latency user experience, Sovereign operates a **Double-Gate Authorization Architecture**:
1. **The Server (Authoritative PDP):** Runs the strict, comprehensive **Cedar Policy Engine** to enforce security boundaries before database dispatch.
2. **The Client (Local Capability Snapshot):** Runs an $O(1)$ fast-path evaluator powered by a cryptographically signed **Permission Snapshot** synced directly into local SQLite via PowerSync, completely bypassing heavy WebAssembly runtimes on mobile (Hermes VM) to avoid static compilation crashes.

---

## 2. Core Architecture Pipeline

```mermaid
graph TD
    %% Offline Loop
    subgraph Client Device (Local PDP Fast-Path)
        Action[User Action: Edit/Delete Grade] -->|1. Request Check| Hook[useLocalPermission Hook]
        Hook -->|2. Query Snapshot| LocalDB[(Local SQLite / PowerSync)]
        LocalDB -->|3. Signed Snapshot| Hook
        Hook -->|4. Signature & Lease TTL Check| Evaluator[localEvaluator.native.ts]
        Evaluator -->|5. O(1) Capability Map check| Decide{Allowed?}
        
        Decide -->|Yes| LocalCommit[Commit Mutation to SQLite]
        LocalCommit -->|6. Sync Outbox Queue| SyncQueue[PowerSync Sync Queue]
        Decide -->|No| Block[Block UI Action]
    end

    %% Sync Reconnection
    subgraph Sovereign Server (Authoritative Gate)
        SyncQueue -->|7. Connection Restored| Gateway[Sanctuary API Gateway Hono]
        Gateway -->|8. Extract Security Context| Interceptor[index.ts Middleware]
        Interceptor -->|9. Authoritative Cedar check()| Cedar[Server Cedar Engine]
        Cedar -->|10. decision: Allow| MasterDB[(Supabase PostgreSQL)]
        Cedar -->|10. decision: Deny| Revert[Rollback Sync & Terminate]
    end

    style Evaluator fill:#ffaa00,stroke:#333,stroke-width:2px;
    style Cedar fill:#ff9900,stroke:#333,stroke-width:2px;
    style LocalDB fill:#3399ff,stroke:#333,stroke-width:2px;
```

---

## 3. The Capability Snapshot Design

Rather than attempting to compile and evaluate complex Cedar syntax locally in the client (which triggers Hermes WASM heap memory limitations and Metro AST scanning issues), the server exports a synchronous JSON matrix of capabilities when sync occurs. 

### SQLite Schema (`permission_snapshots` Table)
The schema is synced directly to the local SQLite state via PowerSync. A single row exists per active user session:
```typescript
// packages/core/src/adapters/powersync/schema.ts
export const permissionSnapshots = sqliteTable('permission_snapshots', {
  id: text('id').primaryKey(), // user-school compound id
  userId: text('user_id').notNull(),
  schoolId: text('school_id').notNull(),
  generatedAt: text('generated_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  permissions: text('permissions').notNull(), // Serialized JSON: Record<Resource, Record<Action, boolean>>
  signature: text('signature').notNull(),      // HMAC SHA-256 Server Cryptographic Signature
});
```

---

## 4. Platform-Specific Code Splitting (`.native.ts`)

Metro scans all `import(...)` dynamic statements statically during native compilation. To keep `@cedar-policy/cedar-wasm/web` completely isolated and prevent Hermes VM crashes, we leverage Metro's native file extension priority resolution:

1. **`localEvaluator.ts` (Web Path):** Uses dynamic imports of `@cedar-policy/cedar-wasm` to run the fully active engine on the browser/web client when required.
2. **`localEvaluator.native.ts` (Mobile Path):** Devoid of WASM or compiler modules. It queries the local PowerSync SQLite table, verifies the cryptographic signature, and executes an instant $O(1)$ JSON property check.

---

## 5. Layered Threat Vector Protections

Offline-first apps face high-risk edge cases (e.g. device theft, physical tampering). We address these with a **Defense-in-Depth Strategy**:

| Threat Vector | Security Control | Technical Mechanism |
| :--- | :--- | :--- |
| **Locked Device Theft** | SQLCipher Page Encryption | AES-256 key locked inside Apple/Android Secure Enclave with `WHEN_UNLOCKED` accessibility. |
| **Unlocked Device Theft** | Biometric Step-Up | Cedar policies dictate sensitive updates require step-up authentication, forcing FaceID/Fingerprint offline checks. |
| **The "Airplane Mode" Bypass** | Cryptographic Lease TTL | Client security session enforces an offline lease timeout (e.g., 24 hours). If exceeded, local trust status drops to `stale` or `restricted`. |
| **Device Compromise / Rooting** | Secure Integrity Purge | Play Integrity / DeviceCheck fires root triggers that instantly wipe decryption keys, destroying the local SQLite cache. |
| **Remote Revocation (Kill Switch)** | PowerSync High-Priority Sync | Admin sets `is_trusted = false` on server. The next second of network connectivity replicates this status and locks local PDP. |

---

## 6. Authoritative Audit Leak Resolution (100% Green & Tested)

The monorepo's four core architectural security leaks are resolved Authoritatively by the server's **Cedar Double Gate Middleware** in `apps/sanctuary-api`:

### 1. Leak: Students seeing all lessons across all schools
* **Resolution:** [student.cedar](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/policies/school/student.cedar#L25-L36) constrains lesson reads strictly to the classrooms the student is enrolled in:
  ```cedar
  permit(
    principal,
    action == Action::"read",
    resource
  ) when {
    principal.capacity == "student" &&
    (resource is Lesson || resource is Material) &&
    resource has classroom_id &&
    principal has classroom_ids &&
    principal.classroom_ids.contains(resource.classroom_id)
  };
  ```

### 2. Leak: Students seeing teacher leave records
* **Resolution:** **Default Deny** enforces complete privacy. The student policy exports zero permits for `StaffLeave`.

### 3. Leak: Parents can't see child's grades
* **Resolution:** [parent.cedar](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/policies/school/parent.cedar#L1-L12) establishes parent access scoped strictly to active child student IDs:
  ```cedar
  permit(
    principal,
    action == Action::"read",
    resource
  ) when {
    principal.capacity == "parent" &&
    resource is Grade &&
    resource has student_id &&
    principal has child_student_ids &&
    principal.child_student_ids.contains(resource.student_id)
  };
  ```

### 4. Leak: GradeHead and SectionHead are ghost roles
* **Resolution:** [gradeHead.cedar](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/policies/school/gradeHead.cedar) and [sectionHead.cedar](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/policies/school/sectionHead.cedar) fully define their respective administrative scopes (reading Classrooms and Attendance Records).

---

## 7. Guidelines for Future Developers

When modifying or introducing new authorization logic:

> [!IMPORTANT]
> **1. Modify Cedar Schema First:**
> If you introduce a new resource, declare it inside the `appliesTo` list in [schema.cedarschema](file:///c:/Users/Naween/projects/polymath-platform/packages/policies/src/schema/schema.cedarschema). 
> If you add new context checks (e.g. location, IP range), always define them as **optional fields** in `SecurityContext` to prevent parsing breaks.

> [!TIP]
> **2. Add Policies Under packages/policies/src/policies/school:**
> Maintain role isolation. Do not mix principal rules. If you need teacher-specific actions, write them strictly inside `teacher.cedar`.

> [!WARNING]
> **3. Never import @cedar-policy in packages/core/src/logic/permissions/localEvaluator.native.ts:**
> The mobile evaluator must remain lightweight, executing pure synchronous checks on the `permissionSnapshots` SQLite table to prevent compile-time crashes.

---

## 8. Sovereign Authorization Invariants

To keep semantic and operational drift completely bounded and controlled, the engineering team must strictly enforce the following architectural invariants:

### Invariant 1: Authoritative Single-Source Generation
* **Rule:** The `generateSnapshot` engine must exclusively derive capabilities by calling the canonical Cedar `check()` function.
* **Why:** This ensures that the snapshot is a mathematical projection of the exact same rules that run on the server, avoiding any manual logic duplication or ad hoc client-side reinterpretation.

### Invariant 2: Defensive Default-Deny Fallback
* **Rule:** If a requested resource or action is missing from the precomputed snapshot matrix (e.g. dynamic runtime attributes or new features), the local evaluator must immediately **fail safe** and **deny access**.
* **Why:** In local-first software, the absent state of a permission must never translate to "granted." It must default to a strict deny, pushing the user to verify via online check on reconnection.

### Invariant 3: Expiry and Degradation of Trust Lease
* **Rule:** A Permission Snapshot has a strict temporal lease (e.g. 24 hours). Once `expiresAt` is surpassed:
  * The local evaluator must downgrade the device trust level to `stale` or `restricted`.
  * Write mutations for critical resources (e.g., modifying Grades or Attendance) must be blocked locally until a fresh, server-signed snapshot is obtained.
* **Why:** Prevents "Airplane Mode" authorization bypasses and limits the window of opportunity for physically compromised or stolen offline devices.

### Invariant 4: Dual-Gate Invariance
* **Rule:** No mutation committed to the PowerSync outbox is authoritative. Every synced write **MUST** be intercepted by the edge Hono middleware and verified through a real-time Cedar `check()` before SQL execution.
* **Why:** The server is the ultimate security boundary. Local client-side checks only exist for user convenience and immediate UI reactivity; they can never be trusted as the system's authority.
