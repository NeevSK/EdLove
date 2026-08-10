---
title: "Gurudevi Database Review Batch 01 — Active Domain Candidates"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, review, zenstack, launch]
---

# Database Review Batch 01 — Active Domain Candidates

## Review method

This is an evidence-backed recommendation batch, not an automatic schema change.
Each object was checked against the linked database inventory, current source-code
references, and Gurudevi migration references. Name matches are text evidence and
must still be confirmed against the actual query/mutation path before adoption.

## Proposed ZenStack candidates

These objects have both active implementation evidence and migration history. They
are strong candidates for ZModel, subject to field-level parity and authorization
review.

| Object | Evidence | Proposed decision | Why |
| --- | --- | --- | --- |
| `students` | 390 text refs / 93 migration refs | `legacy-consolidation-review` | The live shape is a shadow roster (`full_name`, `index_number`, `notes`) while current ZModel uses `users` + `classroom_students`; do not create a duplicate `Student` model yet |
| `submissions` | 45 / 74 | `adopt-in-zenstack` | Assessment workflow and grading migrations |
| `notifications` | 130 / 48 | `adopt-in-zenstack` | Product notifications and notification triggers |
| `timetable` | 47 / 26 | `adopt-in-zenstack` | Classroom scheduling and guest/local data paths |
| `announcements` | 59 / 6 | `adopt-in-zenstack` | Community/classroom announcement reads and server handlers |
| `community_comments` | 9 / 42 | `adopt-in-zenstack` | Community repository, hooks, and active migrations |
| `student_observations` | 10 / 40 | `adopt-in-zenstack` | Teacher insights and longitudinal/student migrations |
| `staff_attendance` | 16 / 21 | `adopt-in-zenstack` | Staff APIs, presence hooks, and management migrations |
| `collection_nodes` | 10 / 30 | `adopt-in-zenstack` | Library API/hooks and temporal library migration |
| `direct_messages` | 10 / 30 | `adopt-in-zenstack` | Active messaging screens/API and messaging migrations |
| `direct_conversations` | 4 / 29 | `adopt-in-zenstack` | Parent entity for active direct messaging |
| `auth_identities` | 3 / 31 | `adopt-in-zenstack` | Identity adapter plus identity/RLS migrations; security review required |
| `student_profiles` | 2 / 34 | `adopt-in-zenstack` | Identity/profile migration chain; confirm current ownership before modeling |

## Security-domain candidates requiring special review

| Object | Evidence | Proposed decision | Current concern |
| --- | --- | --- | --- |
| `device_registry` | 0 / 43 | `security-domain-review` | Strong migration ownership but no direct current-code references found |
| `device_accounts` | 0 / 42 | `security-domain-review` | Security infrastructure may be accessed indirectly through functions/triggers |
| `teacher_profiles` | 0 / 35 | `security-domain-review` | Identity normalization history; no direct current-code reference |
| `principal_profiles` | 0 / 31 | `security-domain-review` | Identity normalization history; no direct current-code reference |

These must not be deleted or blindly ignored. We need to inspect functions,
triggers, RPCs, and auth flows before deciding whether they become ZenStack models,
remain security-owned SQL tables, or are legacy remnants.

## Deferred domain candidates

`tags`, `edges`, `districts`, `provinces`, `reminders`, and `staging` have meaningful
references but appear to belong to library, geography, notification, or ETL
subsystems rather than the first Gurudevi launch contract. They remain
`needs-review`; they are not being ignored.

## Required next checks before changing ZModel

For each proposed candidate:

1. inspect the live columns, constraints, indexes, and foreign keys;
2. compare actual current queries and mutations with the table shape;
3. identify the correct RLS policy owner;
4. decide whether PowerSync needs the entity locally;
5. model the entity and fields in ZModel;
6. generate ZenStack artifacts and run parity;
7. backfill/enforce nullability only after staging verification.

## Current decision

`AssignmentSubmission` and `Notification` were added to ZModel because both have
active read/write paths and explicit migration/RLS ownership. The corresponding
generated ZenStack artifacts pass validation.

The staging migration
`apps/gurudevi-mobile/supabase/migrations/20260810120000_model_active_submission_fields.sql`
adds the `photo_url` column required by current submission code and adds the
submission/notification query indexes. It has not been deployed.

The post-change parity audit correctly reports:

- `submissions.photo_url` and `classroom_students.notes` are now present after
  the applied migrations;
- notification nullability differences that require data/backfill review before
  enforcing the ZModel contract;
- `students` still intentionally unresolved as a likely legacy/parallel roster.

`invite_codes` is now modeled as a read contract in ZModel. Its claim operation
remains a database RPC because claiming must atomically consume the code, create
the school bond, and update institutional identity state. Application adapters
map the database column `role` to the domain-facing `capacity` name; they no
longer read or write the nonexistent `capacity`/`used` database columns.

The next staging migration,
`apps/gurudevi-mobile/supabase/migrations/20260810140000_reconcile_inventory_items_rls.sql`,
restores scoped RLS policies for `inventory_items`. The table is modeled against
its actual live school-scoped columns; the separate `classroom_inventory` name
used by an older API path remains a distinct unresolved code/database mismatch.

Therefore this batch is model-complete but not database-complete. No destructive
changes or production deployment were performed.
