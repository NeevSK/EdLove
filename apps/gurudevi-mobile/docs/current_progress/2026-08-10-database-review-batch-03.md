---
title: "Database Review Batch 03 - Core Nullability"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, zenstack, nullability]
---

# Database Review Batch 03 — Core Nullability

## Scope

This batch tightens nullability for active core tables where the ZModel already
requires a value and a live-data query confirmed zero null rows.

## Evidence

The linked Supabase database returned `null_count = 0` for every targeted column
in `users`, `assignments`, `student_grades`, `classroom_join_requests`,
`classroom_legacy_records`, `notifications`, and `inventory_items`.

## Changes

- Added `20260810160000_harden_core_schema_nullability.sql`.
- Made `InventoryItem.updated_at` required and managed by ZenStack's
  `@updatedAt` contract.
- Regenerated ZenStack artifacts.

The migration uses `ALTER COLUMN ... SET NOT NULL` and therefore fails loudly if
new null rows appear before application. It does not rewrite existing data or
use broad destructive operations.

## Verification

- `zen generate`: passed
- `zen check`: passed
- Core TypeScript: passed
- Live post-cleanup parity snapshot: score `86/100`
- RLS lockouts: `0`

## Next batch

After applying this migration, rerun parity and move to the remaining active
extra columns (`student_grades`, preferences, library nodes/collections) one
bounded domain at a time. Do not tighten all remaining nullability mismatches in
one migration; several are historical or intentionally optional and require
domain evidence first.
