---
title: "Database Review Batch 05 - User Preferences"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, preferences, cleanup]
---

# Database Review Batch 05 — User Preferences

## Decision

`user_preferences` is active and should remain modeled in ZenStack. Its current
authority is account-level preference data: favorites, hidden features, prompt
settings, notification settings, and check-in times.

The old `language`, `theme`, `data_saver_mode`, `orientation_seeds`, and
`deleted_at` columns have no active runtime consumers. Language and device
presentation settings are handled locally by the mobile app. They are removed
by a non-CASCADE migration so unexpected database dependencies fail loudly.

## Evidence

Live null scans returned zero null rows for every required modeled field before
constraints were prepared.

## Prepared change

[20260810170000_remove_legacy_user_preference_columns.sql](../../supabase/migrations/20260810170000_remove_legacy_user_preference_columns.sql)

It both tightens the active fields and removes the stale columns.

## Remaining work estimate

The latest parity snapshot has 287 findings:

- 115 nullability mismatches — many can be batched after null scans.
- 59 extra columns — mostly domain-by-domain cleanup or modeling.
- 107 extra tables — many are intentionally outside the current ZenStack
  bounded context and need classification, not automatic deletion.
- 6 extra views — likely read/reporting surfaces; inspect before modeling.

The largest genuine domains remaining are Library (`nodes`, `collections`, 64
findings combined), growth state (14), and active feature flags (6). Those are
larger design batches, not quick cleanup tasks.

## Efficient method from here

Use a four-stage domain batch:

1. Inventory runtime reads/writes and database dependencies.
2. Query live nulls/row counts/indexes before changing constraints.
3. Choose exactly one action per field: model, tighten, migrate/rename, or
   remove loudly.
4. Generate/check locally; apply migrations in a batch; run one parity audit.

This keeps the work safe without repeating a full audit after every field.
