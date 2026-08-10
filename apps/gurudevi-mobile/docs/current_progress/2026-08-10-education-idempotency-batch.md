---
title: "Education Contract and Idempotency Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, education, attendance, grading, idempotency, parity]
---

# Education Contract and Idempotency Batch

## Evidence

The linked database currently has no rows in `lessons`, `lesson_materials`,
`student_grades`, or `attendance`; therefore the hardening decision is based
on declared defaults and active repository behavior. PostgreSQL declares:

- `lessons.order_index` nullable with default `0`;
- `lesson_materials.is_pinned` nullable with default `false`;
- `student_grades.graded_at` required with a current-time default;
- `attendance.idempotency_key` nullable without a default.

## Contract decision

- Align lessons and materials with their existing ZModel defaults by making
  `order_index` and `is_pinned` required.
- Align Grade with the live database by making `graded_at` required with the
  existing current-time default.
- Keep attendance's natural composite key
  (`classroom_id`, `student_id`, `date`) as the primary retry-safe upsert
  identity. Add the existing idempotency metadata to ZModel and give it a
  database UUID default for transport/audit correlation; it is not used as a
  replacement for the attendance natural key.

The canonical reusable idempotency helper and PowerSync envelope are documented
in `2026-08-10-idempotency-audit.md`. No table is given an idempotency column
merely because it is writable; the strategy must match the mutation semantics.
