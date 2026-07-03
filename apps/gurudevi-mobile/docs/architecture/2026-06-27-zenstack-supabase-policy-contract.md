---
title: "ZenStack and Supabase Policy Contract"
status: "active"
created: 2026-06-27
updated: 2026-06-27
author: "Naween"
scribe: "Antigravity"
tags: [architecture, policy, supabase, zenstack, rls, governance]
---

# ZenStack and Supabase Policy Contract

## Purpose
This document defines how we prevent split-brain authorization between ZenStack and Supabase.

---

## 1. Split-Brain Responsibility Mapping

| Security Dimension | ZenStack Layer (Semantic/App Auth) | Supabase Postgres/RLS Layer (Perimeter Hardening) |
| :--- | :--- | :--- |
| **Primary Focus** | Nuanced product logic, ReBAC, user capacities, tenant membership checks. | SQL query bypass prevention, service paths, structural constraints. |
| **Auth Context** | Inferred via `auth()` helper (e.g. `auth().id == id` or `auth().bonds?`). | Enforced via `get_my_id()`, `auth.uid()`, and Postgres functions. |
| **Failure Mode** | Returns client-side validation or empty results in ORM query. | Blocks requests at connection level with SQL access-denied error. |

---

## 2. Definitive Policy Rules

### A. Tenant-Scoped Data (e.g., `schools`, `classrooms`)
* **ZenStack Rule**: Restrict reads and writes based on active member tenancy (e.g. check bonds).
* **Supabase Rule**: Implement a broad perimeter policy that blocks reads/writes from non-school members.
* **Invariant**: Supabase RLS is the fallback gatekeeper. ZenStack implements the application-level filters.

### B. User-Owned Data (e.g., `users`, `mood_logs`, `fire_journal`)
* **ZenStack Rule**: Allow owners (`auth().id == user_id`) full access.
* **Supabase Rule**: Mirror this rule exactly using `auth.uid() = user_id` or `get_my_id() = user_id`.
* **Note**: This is an **Intended Mirror** category. The duplication is necessary to protect raw SQL access and client-side sync streams.

### C. Public Read Data (e.g., `feature_flags`, `school_registry`)
* **ZenStack Rule**: Allow public reads (`@@allow('read', true)`).
* **Supabase Rule**: Enable RLS and define a policy allowing public or authenticated `SELECT`, but restrict `ALL` other actions to administrators (`has_capacity('admin')`).
* **Warning**: Never leave RLS disabled (as currently seen on `feature_flags`).

### D. System / Audit Trails (e.g., `sentinel_audit_logs`)
* **ZenStack Rule**: Restrict all access except for platform administrators.
* **Supabase Rule**: RLS set to service-role only or write-only for clients, reads restricted to superusers.

---

## 3. Operational Invariants for Developers & Agents

1. **Do not use one-sided updates**: A policy change in `schema.zmodel` requires an equivalent RLS migration plan, and vice versa.
2. **Never turn off RLS**: If a table needs public access, enable RLS and add a policy allowing `SELECT using (true);`.
3. **Use the correct context**:
   * ZModel uses: `auth()`
   * Supabase RLS uses: `get_my_id()` or `auth.uid()`
4. **Soft Deletion Handling**:
   * ZModel must explicitly filter on `deleted_at == null` unless a recovery flow is queried.
   * Supabase RLS must automatically filter out soft-deleted records for standard roles, or rely on views/triggers.
