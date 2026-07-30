---
title: "Legacy FeatureFlag Schema Retirement Runbook"
status: "draft"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [feature-lifecycle, schema-retirement, supabase, growthbook]
---

# Legacy `FeatureFlag` schema retirement runbook

## Why this remains a separate production action

The repository lifecycle audit finds zero non-schema runtime consumers of the legacy `FeatureFlag` model and `feature_flags` table. The deployed database snapshot still contains the table, however, and generated ORM artifacts still expose the model. Removing those artifacts without confirming production ownership, row retention requirements, and rollback coverage would be an unsafe destructive migration.

## Required evidence before removal

Run the repeatable read-only check with a controlled operator connection:

```bash
FEATURE_LIFECYCLE_DB_URL="postgresql://..." pnpm feature-lifecycle:schema-check -- --execute
```

PowerShell:

```powershell
$env:FEATURE_LIFECYCLE_DB_URL = 'postgresql://...'
pnpm feature-lifecycle:schema-check -- --execute
Remove-Item Env:FEATURE_LIFECYCLE_DB_URL
```

The script sets PostgreSQL connection details through environment variables rather than placing the password in the `psql` command arguments. It never performs a write. If `psql` is unavailable, run the equivalent SQL below with an approved database tool.

```sql
select count(*) as feature_flag_rows from public.feature_flags;
select max(updated_at) as last_legacy_write from public.feature_flags;
```

Capture the result and confirm:

1. no production service, job, edge function, dashboard, or external integration reads or writes `public.feature_flags`;
2. any rows are exported to the approved audit/archive location if retention is required;
3. the GrowthBook organization contains the authoritative replacement records where applicable;
4. the application release containing the GrowthBook-only rollout path has been deployed and observed through one normal release window;
5. the database backup and restore point are known before applying the migration.

The repository-side proof is `pnpm audit:feature-lifecycle -- --strict` (or `pnpm audit:feature-lifecycle`, which already invokes strict mode through the package script): it must report zero legacy schema runtime references.

## Removal sequence

1. Freeze new writes to the legacy table at the database/API boundary.
2. Export and checksum any retained rows.
3. Apply a reviewed migration that drops the table only after the production evidence above is approved.
4. Remove the `FeatureFlag` model from `packages/schema/schema.zmodel` through the normal schema generation workflow.
5. Regenerate ORM artifacts; do not hand-edit generated files.
6. Run the strict lifecycle audit, package tests, schema generation checks, and application smoke tests.
7. Keep this runbook and the migration as the historical record; never recreate the old model as a second rollout authority.

## GrowthBook archival command

Before archival, an operator can compare the scoped GrowthBook management inventory with the local manifest:

```bash
GROWTHBOOK_FEATURES_ENDPOINT="https://growthbook.example/api/v2/features" \
GROWTHBOOK_API_KEY="..." \
pnpm audit:feature-lifecycle:control-plane
```

The command is read-only. Use `GROWTHBOOK_FEATURE_SCOPE_PREFIX` when the endpoint contains features owned by multiple applications. The endpoint must return the complete scoped inventory in one supported JSON response; duplicate keys, malformed responses, non-HTTPS endpoints outside localhost, and requests exceeding `GROWTHBOOK_API_TIMEOUT_MS` (10 seconds by default) fail the audit. It reports active remote orphans and local keys missing from GrowthBook; it never archives or deletes anything.

Retirement must carry an explicit reason in the operator record:

```bash
pnpm feature-lifecycle:archive -- --key=isExampleFlag --apply --reason="Release branch removed after general availability."
```

The command remains dry-run by default, validates the manifest disposition and zero-reference audit, and requires server-only credentials when `--apply` is used.

## Rollback

Rollback is a database restore or a reviewed table recreation from the retained export. It is not a reason to restore Supabase/global-config evaluation in application code; GrowthBook remains the sole rollout authority.
