---
title: "Gurudevi Database Review Batch 02 — Classroom Membership History"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, review, classroom, membership, zenstack]
---

# Database Review Batch 02 — Classroom Membership History

## Scope

This batch covers two active classroom-domain tables whose live shape and current
application usage are sufficiently clear to model together:

| Table | Decision | Evidence |
| --- | --- | --- |
| `classroom_join_requests` | Adopt in ZenStack | Active enrollment repository; live columns include `role`, not `capacity` |
| `classroom_legacy_records` | Adopt in ZenStack | Active classroom history API; stable historical projection with typed achievement array |

## Changes

- Added `ClassroomJoinRequest` to ZModel with user/classroom relations, status
  indexes, and self/teacher/platform authorization rules.
- Added `ClassroomLegacyRecord` to ZModel with classroom/teacher relations and
  historical reporting fields.
- Updated the enrollment repository to write the live `role` column instead of
  the nonexistent `capacity` column for classroom join requests.
- Represented `top_achievements` as `String[]`, matching the current Zod contract,
  rather than using untyped JSON.

## Deliberately deferred

- `auth_identities`: security/bootstrap boundary used by identity resolution;
  needs a dedicated RLS and auth-trigger review.
- `classroom_note_events`: active temporal table, but repository writes
  `entity_id`/`operation`/`metadata` while the live inventory reports a different
  historical column vocabulary. It must be reconciled before modeling.
- `students`: remains a legacy/parallel roster candidate; no duplicate canonical
  student model is introduced.

## Validation and deployment

The ZModel and generated artifacts must pass locally. This batch is not considered
database-complete until its parity report has been run after the next planned
staging migration batch. No destructive operation is part of this review.

