---
title: "Supabase and ZenStack Foundation Audit"
status: "active"
created: 2026-06-27
updated: 2026-06-27
author: "Naween"
scribe: "Antigravity"
tags: [architecture, supabase, zenstack, rls, schema, audit]
---

# Supabase and ZenStack Foundation Audit

## Scope & Verification Status

This audit documents the database schema and security status for the Gurudevi mobile application.

* **Database Connection Status**: **LIVE VERIFIED**
  * The remote Supabase database was directly inspected in this session using the `polymath-platform-mcp` database gateways (`list_projects`, `list_tables`, `execute_sql`).
  * Project Ref: `qzoawolfkuwiuyaoiybz`
  * Region: `ap-south-1`
  * Postgres Version: `17.6.1.063`

---

## 1. Migration History Alignment

We queried both the remote database migration log and the local `supabase/migrations` directory to verify alignment.

### Migration Status Summary
* Total Local Migration Files: 118
* Total Applied Remote Migrations: 124
* **Desync Status**: **DRIFTED**

### Mismatches Identified

#### A. Applied Remote-Only Migrations (Present in remote database, missing locally)
These migrations have been applied to the remote database but do not exist as files in our local branch (`expo-56-expo-router-migration`):
* `20260506082411`
* `20260506083209`
* `20260508054217`
* `20260508060058`
* `20260522151255`
* `20260522151304`
* `20260522203710`
* `20260522204153`
* `20260522204209`
* `20260522205120`
* `20260522215317`
* `20260522215438`

#### B. Local-Only Migrations (Not yet applied to remote database)
These migration files exist locally but are not registered on the remote database:
* `20260522130000_readd_user_role.sql`
* `20260522140000_refine_user_role_defaults.sql`
* `20260522150000_migrate_role_to_capacity.sql`
* `20260523000000_personal_classrooms.sql`
* `20260523010000_fix_user_profile_sync_after.sql`
* `20260523020000_add_bonds_unique_constraint.sql`

---

## 2. Remote Database Objects Inspected

We verified the existence of the core business tables in the remote database:
* `public.users` (198 rows)
* `public.bonds` (43 rows)
* `public.schools` (0 rows)
* `public.classrooms` (0 rows)
* `public.personal_classrooms` (45 rows)
* `public.community_groups` (0 rows)
* `public.community_posts` (0 rows)
* `public.student_guardian_relationships` (0 rows)
* `public.feature_flags` (0 rows)

*Note: The `guardians` table is completely missing from the remote database schema.*

---

## 3. High-Risk Vulnerabilities & Drift Findings

1. **Relational Schema Drift**:
   * ZModel still references a separate `Guardian` model/table that does not exist physically.
   * ZModel's `StudentGuardianRelationship` references this non-existent `Guardian` model, whereas the Postgres schema points `guardian_id` directly to `users.id`.
2. **Missing Policies (RLS Locked Out)**:
   * Tables like `inventory_items` have RLS enabled on the remote database but have zero policies defined. This prevents client reads/writes entirely.
3. **No RLS Protection**:
   * The `feature_flags` table has RLS disabled on the remote database, exposing it to direct write access from any client connection.
4. **Soft-Delete Columns**:
   * Physical tables (`users`, `schools`, `classrooms`) support soft deletion (`deleted_at`, `deleted_by`, `deletion_reason`), which are not declared in `schema.zmodel`. ZenStack cannot filter these records out automatically.

---

## 4. Remediation Plan

1. **Align ZenStack Models**:
   * Edit `schema.zmodel` to add the missing soft-delete columns to `User`, `School`, and `Classroom`.
   * Refactor ZModel's guardian relationships to remove the `Guardian` model and point `guardian_id` directly to `User`.
2. **Synchronize Migrations**:
   * Reconcile the drifted migrations. Pull down the missing remote migrations to prevent overwrites or local database push errors.
3. **Audit/Hardening Migrations**:
   * Create a new SQL migration to:
     * Enable RLS on `feature_flags` with a default `SELECT` policy for authenticated users and write policies restricted to admins.
     * Deploy basic perimeter RLS policies for `inventory_items`.
