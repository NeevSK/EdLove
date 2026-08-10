---
title: "Database Review Batch 04 - Student Grades Contract"
status: "complete-local-ready-for-application"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, grades, zenstack, zod]
---

# Database Review Batch 04 — Student Grades Contract

## Finding

The live authority is `student_grades`, and ZenStack already maps `Grade` to
that table. The Supabase grading repository was still querying a nonexistent
`grades` table. This was a real runtime parity bug, not harmless compatibility.

## Changes

- Repointed grade reads, writes, updates, and deletes to `student_grades`.
- Modeled the live metadata columns `graded_at`, `deleted_at`, and
  `idempotency_key` in ZenStack.
- Regenerated ZenStack artifacts; the Zod model schema derives from the updated
  contract.

No migration is required for these three columns because they already exist in
the live database. The earlier nullability migration remains separate and can
be applied independently.

## Verification

- `zen generate`: passed
- `zen check`: passed
- Core TypeScript: passed
- Sanctuary grading tests: 3/3 passed

## Next candidate

Review `user_preferences` next. It has live columns used by the historical
faceted-identity design (`language`, `theme`, `data_saver_mode`,
`orientation_seeds`, `deleted_at`) that are not currently modeled. First decide
which are active product settings and which should be removed; do not silently
drop them.
