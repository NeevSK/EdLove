---
title: "Supabase and ZenStack Schema Policy Gap Analysis"
status: "active"
created: 2026-06-27
updated: 2026-06-27
author: "Naween"
scribe: "Antigravity"
tags: [architecture, database, supabase, zenstack, rls, schema, audit, gap-analysis]
---

# Supabase and ZenStack Schema & Policy Gap Analysis (Exhaustive & Atomic)

This document contains a field-by-field, type-by-type, and policy-by-policy audit of key entities in the Gurudevi system, comparing the remote Supabase database (`qzoawolfkuwiuyaoiybz`) with [`packages/schema/schema.zmodel`](file:///c:/Users/Naween/projects/polymath-platform/packages/schema/schema.zmodel).

---

## May 2026 Supabase "Private by Default" Warning

> [!IMPORTANT]
> In May 2026, Supabase transitioned to a **Private by Default** model where new tables in the `public` schema are no longer automatically exposed to the Data API.
> * For existing projects like this one, this change will be automatically enforced on **October 30, 2026**.
> * **Action Required**: Any tables we declare (like a future `guardians` fix) must have explicit API grants:
>   ```sql
>   GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_name TO authenticated, anon;
>   ```

---

## 1. Field-by-Field Schema Audit

### Table: `public.users` vs. Model: `User`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `uuid_generate_v4()` | Matches | None |
| `email` | `text` | `String` | YES | `null` | Matches | None |
| `full_name` | `text` | `String` | NO | `'Sanctuary User'` | Matches | None |
| `display_name` | `text` | `String` | YES | `null` | Matches | None |
| `first_name` | `text` | `String` | YES | `null` | Matches | None |
| `last_name` | `text` | `String` | YES | `null` | Matches | None |
| `identity_state` | `text` | `String` | YES | `'anonymous'` | Matches | None |
| `username` | `text` | `String` | YES | `null` | Matches | None |
| `avatar_url` | `text` | `String` | YES | `null` | Matches | None |
| `bio` | `text` | `String` | YES | `null` | Matches | None |
| `phone` | `text` | `String` | YES | `null` | Matches | None |
| `index_number` | `text` | `String` | YES | `null` | Matches | None |
| `nic_number` | `text` | `String` | YES | `null` | Matches | None |
| `public_profile` | `boolean` | `Boolean` | YES | `true` | Matches | None |
| `profile_completed`| `boolean` | `Boolean` | YES | `false` | Matches | None |
| `is_anonymous` | `boolean` | `Boolean` | NO | `false` | Matches | None |
| `capacity` | `text` | `String` | YES | `null` | Matches | None |
| `citizenship` | `text` | `String` | YES | `'WANDERER'` | Matches | None |
| `pricing_tier` | `text` | `String` | YES | `'FREE'` | Matches | None |
| `is_thuthimal` | `boolean` | `Boolean` | YES | `false` | Matches | None |
| `thuthimal_gifter`| `text` | `String` | YES | `null` | Matches | None |
| `thuthimal_gifted_at`| `timestamp`| `DateTime` | YES | `null` | Matches | None |
| `experience_years`| `integer` | `Int` | YES | `null` | Matches | None |
| `subjects_taught`| `ARRAY` | `String[]` | YES | `'{}'::text[]` | Matches | None |
| `qualifications` | `ARRAY` | `String[]` | YES | `'{}'::text[]` | Matches | None |
| `tenant_kind` | `text` | `String` | YES | `null` | Matches | None |
| `onboarding_completed`| `boolean`| `Boolean` | YES | `false` | Matches | None |
| `onboarding_completed_at`| `timestamp`| `DateTime` | YES | `null` | Matches | None |
| `school_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `metadata` | `jsonb` | `Json` | YES | `null` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | NO | `now()` | Matches | None |
| `updated_at` | `timestamp`| `DateTime` | NO | `now()` | Matches | None |
| `last_seen_at` | `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `escrowed_recovery_key`| `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `tier_id` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_at` | `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_by` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deletion_reason`| `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |

---

### Table: `public.schools` vs. Model: `School`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `gen_random_uuid()` | Matches | None |
| `name` | `text` | `String` | NO | `null` | Matches | None |
| `handle` | `text` | `String` | YES | `null` | Matches | None |
| `avatar_url` | `text` | `String` | YES | `null` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | YES | `now()` | Matches | None |
| `created_by` | `uuid` | `String` | YES | `null` | Matches | None |
| `tenant_kind` | `text` | `String` | NO | `'customer'` | Matches | None |
| `type` | `text` | `String` | YES | `null` | Matches | None |
| `is_sample` | `boolean` | *Missing* | YES | `false` | **Structural Drift** | Add to `schema.zmodel` |
| `census_id` | `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `custom_branding`| `jsonb` | *Missing* | YES | `'{}'::jsonb` | **Structural Drift** | Add to `schema.zmodel` |
| `last_census_sync`| `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `sync_status` | `text` | *Missing* | YES | `'synced'` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_at` | `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_by` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deletion_reason`| `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| *Missing* | *Missing* | `status` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `updated_at` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `official_type`| - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `province_id` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `district_id` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `city` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `address` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `student_type` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `religious_affiliation` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `student_count`| - | - | **Extra in ZModel** | Remove or add to physical DB |

---

### Table: `public.classrooms` vs. Model: `Classroom`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `uuid_generate_v4()` | Matches | None |
| `school_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `grade_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `teacher_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `section_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `name` | `text` | `String` | NO | `null` | Matches | None |
| `handle` | `text` | `String` | YES | `null` | Matches | None |
| `subject` | `text` | `String` | YES | `null` | Matches | None |
| `description` | `text` | `String` | YES | `null` | Matches | None |
| `color_theme` | `text` | `String` | YES | `'blue'` | Matches | None |
| `is_archived` | `boolean` | `Boolean` | YES | `false` | Matches | None |
| `academic_year` | `text` | `String` | NO | `to_char(now(), 'YYYY')` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | NO | `now()` | Matches | None |
| `updated_at` | `timestamp`| `DateTime` | NO | `now()` | Matches | None |
| `created_by` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_at` | `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_by` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deletion_reason`| `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| *Missing* | *Missing* | `syllabus_version`| - | - | **Extra in ZModel** | Remove or add to physical DB |

---

### Table: `public.community_groups` vs. Model: `Group`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `uuid_generate_v4()` | Matches | None |
| `school_id` | `uuid` | `String` | NO | `null` | Matches | None |
| `name` | `text` | `String` | NO | `null` | Matches | None |
| `description` | `text` | `String` | YES | `null` | Matches | None |
| `join_policy` | `text` | `String` | YES | `'open'` | Matches | None |
| `is_public` | `boolean` | `Boolean` | YES | `true` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | YES | `now()` | Matches | None |
| `created_by` | `uuid` | `creator_id` | YES | `null` | **Naming Drift** | Rename `creator_id` to `created_by` in ZModel |
| `group_type` | `text` | `type` | YES | `'general'` | **Naming Drift** | Rename `type` to `group_type` in ZModel |
| `classroom_id` | `uuid` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `image_url` | `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `member_count` | `integer` | *Missing* | YES | `0` | **Structural Drift** | Add to `schema.zmodel` |
| `handle` | `text` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| *Missing* | *Missing* | `visibility` | - | - | **Extra in ZModel** | Remove visibility or map to `is_public` |
| *Missing* | *Missing* | `updated_at` | - | - | **Extra in ZModel** | Remove or add to physical DB |

---

### Table: `public.community_posts` vs. Model: `Post`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `uuid_generate_v4()` | Matches | None |
| `school_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `group_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `author_id` | `uuid` | `String` | YES | `null` | Matches | None |
| `content` | `text` | `String` | NO | `null` | Matches | None |
| `media_url` | `text` | `String` | YES | `null` | Matches | None |
| `media_type` | `text` | `String` | YES | `null` | Matches | None |
| `post_type` | `text` | `String` | YES | `'text'` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | YES | `now()` | Matches | None |
| `updated_at` | `timestamp`| `DateTime` | YES | `now()` | Matches | None |
| `author_role` | `text` | `author_tier`| YES | `null` | **Naming Drift** | Rename `author_tier` to `author_role` in ZModel |
| `poll_data` | `jsonb` | *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| `deleted_at` | `timestamp`| *Missing* | YES | `null` | **Structural Drift** | Add to `schema.zmodel` |
| *Missing* | *Missing* | `visibility` | - | - | **Extra in ZModel** | Remove visibility |

---

### Table: `public.student_guardian_relationships` vs. Model: `StudentGuardianRelationship`

| Field/Column | DB Type | ZModel Type | Nullable (DB) | Default (DB) | Drift Classification | Action / Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | NO | `gen_random_uuid()` | Matches | None |
| `student_id` | `uuid` | `String` | NO | `null` | Matches | None |
| `guardian_id` | `uuid` | `String` | NO | `null` | **Relational Drift** | Points to `users.id` physically, but `Guardian` model in ZModel |
| `relationship_type`| `text` | `String` | NO | `'parent'` | Matches | None |
| `created_at` | `timestamp`| `DateTime` | NO | `now()` | Matches | None |
| *Missing* | *Missing* | `permissions` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `custody_level`| - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `effective_date`| - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `termination_date`| - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `is_active` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `updated_at` | - | - | **Extra in ZModel** | Remove or add to physical DB |
| *Missing* | *Missing* | `school_id` | - | - | **Extra in ZModel** | Remove or add to physical DB |

---

## 2. Policy-by-Policy Code Audit

### Table: `public.users`

* **Supabase RLS Policies**:
  1. `Allow anon to insert their own profile` -> INSERT using `(get_my_id() = id)`
  2. `Users can update safe profile fields` -> UPDATE using `(id = get_my_id())` checking that system fields like `capacity` are unchanged.
  3. `Users can update their own profile` -> UPDATE using `(get_my_id() = id)`
  4. `Users can view their own profile` -> SELECT using `(get_my_id() = id)`
  5. `user_insert_own` / `user_select_own` / `user_update_own` -> matching `id = get_my_id()`
* **ZModel Authorization Rules**:
  * `@@allow('all', auth() == null && is_anonymous == true)`
  * `@@allow('all', auth() != null && auth().id == id)`
  * `@@allow('all', auth() != null && auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'])`
  * `@@allow('read', true)`
* **Audit Gap Analysis**: **Intentional overlap & Policy Drift**. The ZModel allows everyone to `read` any profile (Discovery). However, Supabase RLS policies restrict SELECT to only the user's own profile (`get_my_id() = id`) or if they are authenticated. This creates a conflict: client code query for other users' profiles via the Supabase Data API will fail, despite ZModel allowing it.
* **Remediation**: Add a public SELECT policy on `public.users` in Postgres to match ZModel's public reading policy, or restrict ZModel's read permissions to authenticated/same-school users.

---

### Table: `public.schools`

* **Supabase RLS Policies**:
  1. `Users can create a school` -> INSERT checking `created_by = auth.uid()`
  2. `Users can view their own school` -> SELECT checking `id = get_my_active_school_id() OR created_by = auth.uid()`
* **ZModel Authorization Rules**:
  * `@@allow('read', auth() != null)`
  * `@@allow('create', auth() != null)`
  * `@@allow('all', auth().id == created_by || auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'])`
* **Audit Gap Analysis**: **Severe Policy Drift**. ZModel allows any authenticated user to `read` any school row. But Supabase RLS limits reading to ONLY the active school of the user or if they created the school. This will cause desync where queries for unrelated schools return empty lists on the client side.
* **Remediation**: Align ZModel read rules to require `id == auth().school_id` or school bonds.

---

### Table: `public.classrooms`

* **Supabase RLS Policies**:
  1. `Teachers manage their classrooms` -> ALL using `teacher_id = get_my_id()`
  2. `classrooms_owner_all` -> ALL using `get_my_id() = created_by OR get_my_id() = teacher_id`
* **ZModel Authorization Rules**:
  * `@@allow('read', auth() != null)`
  * `@@allow('all', auth() != null && (auth().id == teacher_id || auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'] || auth().bonds?[entity_id == this.school_id && (capacity == 'principal' || capacity == 'section_head')]))`
* **Audit Gap Analysis**: **Severe Policy Drift**. ZModel allows all authenticated users to read classrooms. But Supabase RLS restricts classroom reads to only the teacher or the creator. Students will NOT be able to view their classrooms via direct Supabase API reads.
* **Remediation**: Update Postgres RLS policy on `classrooms` to allow reads for students enrolled via `classroom_students` table.
