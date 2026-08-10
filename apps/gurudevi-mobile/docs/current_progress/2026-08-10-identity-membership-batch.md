---
title: "Identity, Membership, and Offline Projection Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, identity, bonds, classroom-membership, powersync, parity]
---

# Identity, Membership, and Offline Projection Batch

## Authority decision

- `bonds` remains the authorization and perspective authority for school and
  classroom capabilities.
- `classroom_students` is the active classroom membership record. It supports
  both teacher-created shadow students (`student_id` nullable) and later account
  claims (`student_id` plus `claimed_at`).
- Invite-code claiming remains an online, transactional operation. Offline
  state may display the last synchronized bond/membership projection and queue
  user intent, but it must not mint bonds or consume invite codes locally.
- The separate `students` table is not merged into `classroom_students` in this
  batch; its relationship to the active product flow still needs evidence.

## Implementation

- Added local Drizzle/PowerSync representations for `bonds` and
  `classroom_students`.
- Modeled the verified active `school_join_requests` table in ZenStack and
  corrected the repository to write its actual `role` column rather than the
  non-existent `capacity` column.
- Modeled live `school_memberships` as institutional affiliation/tenure and
  added its offline projection. It remains distinct from authorization bonds.
- Prepared timestamp/status hardening after linked-database zero-null scans.
- Added indexes for the actual offline lookup shapes: user bonds, entity-scoped
  bonds, classroom/status membership, and student/status membership.
- The sync gateway already recognizes the server table names, so this closes a
  concrete local contract gap without changing RPC authority.
- Repaired `scripts/check-schema-drift.mjs` to use the linked Supabase CLI
  instead of a stale `DATABASE_URL`, ignore relational fields as physical
  columns, parse model declarations correctly, and recognize derived Cedar
  authorization fields. The audit now exits successfully.

## Sync scoping and validation boundary

The repository previously contained only the PowerSync vendor example
(`mytable`), and `service.yaml` did not reference `sync-config.yaml`. That was
not evidence of a safe publication. The source-controlled contract now makes
the relationship explicit:

- `bonds` and `school_memberships` sync only for the authenticated `user_id`.
- `classroom_students` syncs for the authenticated student, classroom teacher,
  platform admins, and school principals/section heads through bond joins.
- No global wildcard stream is permitted.

PowerSync Sync Streams support `auth.user_id()` and SQL joins in edition 3.
The config is source-controlled but still needs a non-production
validation/deployment check against the linked PowerSync instance before it is
treated as active. The typed Zod boundary is
`packages/core/src/logic/schemas/identity.schema.ts`; the identity handler now
parses bond projections before they enter the API payload/context.

Join-request rows remain online workflow data rather than an offline authority;
they are intentionally not added to the local projection in this batch.

No identity or membership data was deleted or relabeled as legacy.
