---
title: "ZenStack v3 Migration & Sovereign Siphoning Notes"
status: "active"
created: 2026-04-18
updated: 2026-05-06
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# ZenStack v3 Migration & Sovereign Siphoning Notes

## 1. Why ZenStack "Failed" (The v2 vs v3 Gap)
During the Astro v6 migration, the ZenStack generation process appeared to fail (silent skipping of Zod plugins) because of the transition from **Static Generation** (v2) to **Dynamic Derivation** (v3).

### Key Findings:
- **Plugin Consolidation**: In ZenStack v3, the `@zenstackhq/zod` plugin is optimized for the `createSchemaFactory` API. Instead of writing dozens of `.ts` files to disk (static), it generates a single `schema.ts` metadata file.
- **Silent Defaults**: If a `plugin orm` is not configured or specifically pointed, ZenStack v3 may default to paths that are invisible in a monorepo structure.
- **Provider String Mismatch**: Version 3 strictly requires the `@zenstackhq/orm` and `@zenstackhq/zod` providers to be correctly referenced in the `schema.zmodel`.

### Prevention Checklist:
1. **Explicit Output**: Always use the `--output` CLI flag or the `output` property in `plugin orm` to point to `@repo/core`.
2. **SSOT Redirection**: Never generate artifacts inside the `database` package if you intend to use them in Expo or Astro. Generate them in the **Sovereign Core** (L0).
3. **Factory Adoption**: Use the `factory.makeModelSchema('Model')` pattern instead of importing static files. This ensures your Zod schemas are always in sync with the metadata.

## 2. Sovereign Core vs. Framework Contamination
As identified in the `structural_integrity_audit.md`, the `@repo/core` package is currently "Mixed." To achieve the goal of "making version changes low friction in the endless future," we must separate the **Sovereign Brain** from the **Framework Hands**.

### The Sovereign Kernel (L0 Resolution):
- **Layer 0 (Sovereign Kernel - @repo/schema)**: Immutable, dependency-free kernel containing the `schema.zmodel` and all generated artifacts (ORM metadata, Zod factories).
- **Layer 1 (Platform Logic - @repo/core)**: Consumes L0 types and validation logic. Agnostic to specific database drivers or framework specifics.
- **Layer 2 (Integration Drivers - @repo/database)**: Node-specific integration for server-side access, wrapping ZenStack with `pg` and `kysely`.

### Current Implementation State:
- [x] Establish `@repo/schema` as the single source of truth for all data contracts.
- [x] Standardize ZenStack v3 generation to `src/generated` via root-level `schema.zmodel`.
- [x] Purge all legacy generated wrappers and reports from `@repo/core`.
- [x] Standardize Zod v3/v4 bridge via `createSchemaFactory`.

## 3. Verification: Supabase Reality Check (as-of 2026-05-03)
This repo now has **one SSOT** for ZenStack artifacts:
- **Model Source**: `packages/schema/schema.zmodel`
- **Generated Artifacts**: `packages/schema/src/generated/*`
- **Consumer**: `@repo/core` and `@repo/database`
- **Kernel**: `@repo/schema`

### A) Repo-internal sync (zmodel → generated)
1. Regenerate into schema SSOT:
   - `pnpm -C packages/schema generate`
2. Validate types:
   - `pnpm -r check-types`

If this is clean, it only proves “our generated artifacts match our zmodel”, not that Supabase matches.

### B) Supabase DB sync (generated/zmodel ↔ remote Postgres)
Supabase expects you to use the **Supabase CLI** for linked remote operations:
- Supabase CLI getting started: https://supabase.com/docs/guides/cli/getting-started
- `supabase link` reference: https://supabase.com/docs/reference/cli/supabase-link
- `supabase db dump` reference: https://supabase.com/docs/reference/cli/supabase-db-dump

1. Install and login to Supabase CLI (token-based).
2. Link this repo to the hosted project:
   - `supabase link --project-ref <project-ref>`
   - If you don’t want an interactive prompt, set `SUPABASE_DB_PASSWORD` in your shell environment.
3. Dump the remote schema for inspection (safe/read-only):
   - `supabase db dump --linked --schema public -f supabase/remote_schema.sql`
4. Check for schema drift between your local migrations and the linked project (safe/read-only):
   - `supabase db diff --linked --schema public > supabase/remote_drift.sql`

### Notes on connection strings (when you need `DATABASE_URL`)
- Supabase provides multiple connection strings (direct vs pooler; session vs transaction) depending on client type:
  - https://supabase.com/docs/reference/postgres/connection-strings
  - https://supabase.com/docs/guides/database/psql
- When using Postgres clients/tools (or long-lived app servers), pick the appropriate connection string from the Supabase dashboard “Connect” panel.
