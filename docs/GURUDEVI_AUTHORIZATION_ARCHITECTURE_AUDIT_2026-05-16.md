# Sovereign Authorization Audit Report

This report provides a comprehensive, evidence-based audit of the Sovereign monorepo's authorization architecture as of February 2026.

---

## LAYER 1 — SCHEMA & DATA LAYER

### ZenStack v3 Policy Expressions
The system primary enforces data-layer access control via `@@allow` rules in `packages/schema/schema.zmodel`.

*   **Location**: `packages/schema/schema.zmodel`
*   **Key Policy Patterns**:
    *   **Self-Ownership**: `@@allow('all', auth().id == user_id)` (common in `MoodLog`, `UserPreferences`).
    *   **Bond-Based ReBAC**: `@@allow('read', auth().bonds?[capacity == 'principal' && entity_id == school_id])`.
    *   **Institutional Traversal**: `@@allow('read', auth().bonds?[entity_id == this.classroom.school_id && (capacity == 'principal' || capacity == 'section_head')])` (found in `Attendance` and `Classroom` sub-resources).
    *   **Platform Admin**: `@@allow('all', auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'])`.

### Supabase RLS Policies
Supabase RLS is configured in two locations:
1.  **Master Baseline**: `apps/gurudevi-mobile/supabase/migrations/20260211170000_master_baseline.sql`
    *   Uses a `role` column in the `public.users` table.
    *   Example: `USING (id = auth.uid() OR school_id = (SELECT get_auth_user_school_id()))`.
2.  **ZenStack Generated**: ZenStack generates RLS policies based on the `.zmodel` file.
    *   The `rebac_purge_legacy.sql` migration explicitly drops the `role` and `authority` columns, signaling a complete transition to the `bonds` system.

### Consistency Audit
*   **Contradiction Found**: The SQL baseline (`20260211170000_master_baseline.sql`) relies heavily on a `role` column (e.g., `'teacher'`, `'principal'`). However, the ZenStack model (`User` model) has **no `role` column**; it uses `citizenship` and `bonds`.
*   **Technical Debt**: There is a mismatch between the "Legacy Baseline" and the "Modern ReBAC" model. If the ZenStack policies are applied without purging the legacy ones, certain tables may have double-enforcement that leads to unexpected `403` errors if the `role` column is out of sync with the `bonds` data.

---

## LAYER 2 — SERVER / BFF LAYER

### CASL Definition & Source of Truth
*   **Definition**: CASL abilities are defined in `packages/core/src/logic/permissions/composer.ts` and domain-specific files in `packages/core/src/logic/permissions/abilities/*.ts`.
*   **Source of Truth**: The `UserContext` (derived from the database `users` and `bonds` tables). 
*   **Construction**: Abilities are derived **dynamically** at runtime. There is no hardcoded role-to-permission mapping that doesn't pass through the `bonds` traversal logic.

### Enforcement Mechanism
*   **ZenStack Middleware**: In `apps/sanctuary-api/src/index.ts`, a middleware injects an "Enhanced Prisma Client" (`db`) into the Hono context. This client automatically filters all queries based on the authenticated user's identity.
*   **POA (Policy-Oriented Architecture)**: The BFF uses a `poaProxy.ts` that wraps API calls. It validates the "Contract" (e.g., `selfContract.logMood`) against the user's CASL abilities before the handler is even executed.

### Manual Guards
*   The system has moved away from manual `if (role === 'admin')` checks. Handlers in `packages/core/src/api/handlers/` are remarkably clean, relying entirely on the injected `db` for ReBAC enforcement.

---

## LAYER 3 — CLIENT LAYER

### Permission Consumption
*   **Primary Hook**: `usePermissions` in `packages/core/src/logic/permissions/hooks/usePermissions.ts`.
*   **Usage**: Screens like `FullProfileScreen.tsx` use `context.active_bond?.capacity` to gate UI elements (e.g., showing the "Give Thuthimal" button only for teachers).

### Offline Authorization Logic
*   **Guest Mode**: Managed via `GuestDataManager.ts`. 
*   **Logic**: Guest data (Moods, Journal, Timetable) is stored in local MMKV storage. No server-side authorization occurs in this state. 
*   **Sync Logic**: `SyncManager.tsx` handles the "Outbox" pattern. Authorization is "Pre-validated" on the client before being queued, and "Post-validated" by ZenStack when replayed against the server.

---

## LAYER 4 — RELATIONSHIP & HIERARCHY MODELING

### Traversal Logic
The hierarchy is modeled through **Bonds**.
*   **Bond Structure**: `(user_id, entity_type, entity_id, capacity)`.
*   **Hierarchy Traversal**: Instead of recursive SQL queries, ZenStack rules look up one level. 
    *   *Example*: To see a Student's attendance, the system checks if the user has a bond with `entity_id` equal to the `classroom.school_id`.
*   **Gaps**: The hierarchy for `Province -> District -> Zone -> Division` exists in the `SchoolRegistry` (static metadata) but is **not fully modeled** as a relational hierarchy in the `School` model. Access control currently stops at the `School` level.

---

## LAYER 5 — AUDIT FINDINGS

### 1. Legacy Role Fragmentation
The SQL baseline still references a `role` column that the modern ReBAC system is trying to purge. This is the highest-risk area for "False Negatives" (where a user is authorized in ReBAC but blocked by a legacy RLS policy).

### 2. Coarse vs. Fine Grained Tension
*   **POA (Coarse)**: Blocks entire methods (e.g., "Can I call `getAttendance`?").
*   **ZenStack (Fine)**: Filters rows (e.g., "Which attendance records can I see?").
*   **Observation**: The system is currently robust because it uses both, but the `POAProxy` lacks the ability to check "Instance-level" permissions (e.g., "Can I call `updateClassroom` for *this specific* ID?") without performing a database read, which it currently delegates to ZenStack.

### 3. Bond Synchronization Risk
The `AuthStore` on the client holds a copy of the user's `bonds`. If a user's role is revoked on the server (e.g., fired from a school), the client-side CASL abilities will remain active until the next `resolveIdentity` call or token refresh. The `POAProxy` provides a safety net here as the server-side ZenStack will still block the actual data write.

### 4. "Wanderer" Shadow State
Anonymous users ("Wanderers") have a flat, unrestricted permission model for **local-only** data. The transition from Wanderer to "Citizen" (Authenticated) is handled by a data-migration trigger in the database, but the client-side `usePermissions` must carefully handle the "Hydration Gap" during this transition.

---

**Audit Status: COMPLETED**
*Architecture is highly coherent and follows modern ReBAC principles. Main risk is legacy SQL policy remnants in the Supabase baseline.*
