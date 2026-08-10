---
title: "Migration Safety Verification Batch"
status: "complete"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [gurudevi, migrations, staging, replay, release-safety]
---

# Migration Safety Verification Batch

Added `pnpm run audit:migration-state`, a read-only check comparing local
migration filenames with the linked Supabase migration history. It detects
duplicate IDs, locally pending migrations, mismatched records, and remote-only
migrations.

The linked project currently reports the local and remote histories aligned,
including the latest school CRUD and invite migrations.

## Staging replay procedure

1. Create or refresh a disposable staging database from a sanitized snapshot.
2. Run `supabase db reset` only against that disposable local/staging target.
3. Apply migrations in timestamp order and inspect failures before changing code.
4. Run schema generation, type-check, parity, trust, behavior, and query-plan
   audits.
5. Run authenticated fixture tests with staging-only users.
6. Record the result before production deployment; never use `db push` as the
   release mechanism.
