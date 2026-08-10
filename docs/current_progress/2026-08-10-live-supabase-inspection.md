---
title: "Live Supabase Inspection — Gurudevi"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, supabase, live-inspection, rls, parity, security]
---

# Live Supabase Inspection — Gurudevi

## Scope and provenance

This is a read-only inspection of the linked Supabase project performed on
2026-08-10 through Supabase CLI 2.105.0. It records live database evidence
separately from the historical imported audit and local migration files.

The remote connection was verified with a live SQL query. A full `supabase db
dump --linked` export was attempted but requires Docker Desktop on this Windows
host; the structural facts below were exported through read-only catalog queries
instead. No remote schema mutation was performed during this inspection.

## Live structural snapshot

| Measure | Live result |
| --- | ---: |
| Public tables | 166 |
| Public views/materialized views | 7 |
| Public tables with RLS enabled | 156 |
| Public tables without RLS | 10 |
| Security-definer public functions | 62 |
| Security-definer public functions without configured search path | 21 |
| Tables granted to `anon` | 77 |
| Tables with `anon` DML grants | 77 |

Tables without RLS are currently `app_config`, `ecosystem_events`,
`feature_flags`, `key_persons`, `package_alternatives`, `package_companions`,
`package_conflicts`, `packages`, `spatial_ref_sys`, and `student_observations`.
`spatial_ref_sys` is extension-owned; the other nine require explicit
classification as SQL-owned infrastructure, control-plane data, or user data.

## Target-domain findings

- `student_grades`, `attendance`, `submissions`, `notifications`,
  `classroom_join_requests`, `user_preferences`, `user_growth_state`, and
  `student_longitudinal_events` have live columns matching the current bounded
  parity work, including non-null grade/attendance fields and active notification
  and idempotency fields.
- Inventory RLS is deployed live with separate school-read and school-manage
  policies scoped through bonds; this is a verified remote result.
- Attendance has student self-read and teacher classroom-management policies.
- `classroom_join_requests` currently exposes only an authenticated own-request
  SELECT policy in the inspected policy set; teacher/admin management behavior
  needs explicit verification before being marked complete.
- Notifications have own-row SELECT and UPDATE policies, but the UPDATE policy
  has no `WITH CHECK` clause. This is a hardening candidate because updates must
  not be able to move ownership fields.
- User preferences have an `ALL` own-user policy with no `WITH CHECK` clause;
  verify whether the table is immutable in its ownership columns or split the
  policy before changing it.
- Longitudinal events have an elevated-read policy that checks school bonds and
  guardian relationships. Cross-classroom/grade boundaries still require
  authenticated test cases; catalog evidence alone is insufficient.

## Advisor findings

The live Supabase advisors reported mutable search paths on multiple functions,
including `assign_user_role`, `capture_student_longitudinal_event_generic`,
`get_student_longitudinal_history`, `get_my_id`, and
`generate_mapping_share_token`. They also reported duplicate-equivalent indexes
on `nodes` and `student_longitudinal_events`, plus multiple permissive policy
sets. These are queued as bounded security/performance migrations; they were not
changed automatically because function ownership, trigger behavior, and policy
semantics need review.

## Code boundary result

The application-side Supabase boundary is now clean:

```text
node scripts/check-supabase-boundaries.mjs --strict
Supabase boundary check passed: no non-allowlisted client imports found.
```

The canonical client is now owned by
`packages/core/src/adapters/supabaseClient.ts`. The former API barrel alias was
removed; Hono contracts, explicit ports, PowerSync, and approved adapters remain
the intended request paths.

## Next safe actions

1. Add a migration proposal for the 21 public security-definer functions missing
   a fixed search path, starting with functions that are callable by exposed
   roles.
2. Verify the nine non-extension tables without RLS and the 77 `anon` grants;
   revoke or add RLS only from an explicit access matrix.
3. Add authenticated RLS tests for classroom join-request management, guardian
   grade/attendance access, and longitudinal cross-classroom denial.
4. Resolve duplicate-equivalent indexes after checking query plans and write
   costs; do not drop an index solely from advisor output.

