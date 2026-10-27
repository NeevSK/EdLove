---
title: "EdLove Account UUIDv8: Authority Completion Record"
status: "superseded"
created: 2026-10-23
updated: 2026-10-25
superseded_by: "2026-10-25-canonical-uuidv8-account-cutover.md"
author: "Naveen"
scribe: "Codex"
tags: [edlove, identity, uuidv8, supabase, security, completion]
---

# EdLove Account UUIDv8: Authority Completion Record

> Historical evidence for the former side-ID writer. The [canonical cutover](2026-10-25-canonical-uuidv8-account-cutover.md)
> replaces this assignment mechanism with the immutable UUIDv8 account primary key.

## Corrected defect

The initial writer migration admitted `current_user = 'postgres'`. That was not
an attribute-level authority boundary: a direct `postgres` database connection
could update `public.users.edlove_id` without calling the assignment function.
It is superseded by migration `20261023103000_edlove_account_id_writer_role_hardening.sql`.

## Final write authority

`edlove_identity_writer` is a `NOLOGIN NOINHERIT BYPASSRLS` role. It has only
the table columns and validator execution required by
`private.assign_edlove_account_id(uuid, uuid)`, and owns that security-definer
function. Supabase retains a managed administrative membership for `postgres`,
but it has no `SET ROLE` option; the required invariant is that the direct
server role cannot assume the writer identity. The Sanctuary `postgres`
database connection is granted only `EXECUTE` on the private function.

The `users.edlove_id` trigger permits a non-null mutation only where
`current_user = 'edlove_identity_writer'`, which occurs inside that function.
Thus a direct Sanctuary `postgres` update fails, while the specific assignment
call succeeds. `anon`, `authenticated`, and `service_role` retain neither
private-schema usage nor function execution.

The database administrator remains a trusted infrastructure boundary: an
administrator able to alter roles, triggers, or function ownership can change
any database policy. This design prevents ordinary direct DML and Data API
paths from bypassing the assignment seam; it does not claim to constrain a
database administrator with DDL authority.

## Completion criteria and evidence

| Requirement | Required proof | Status |
|---|---|---|
| No canonical-ID/auth mutation | `users.id`, auth mappings, and auth migrations unchanged | Scoped raw delta reviewed; no rewrite present |
| ID shape and uniqueness | Profile validator, check, partial unique index | Deployed and previously live-checked |
| Client write denial | Direct `postgres`, `anon`, `authenticated`, service-role attempts fail | Direct-`postgres` update rejected in a live rollback proof; client roles have neither schema usage nor execution privilege |
| Server-only write | Private function succeeds under its non-login owner | Live rollback proof succeeded without retaining an ID |
| No accidental rollout | Assigned count remains zero until an operator starts backfill | Live count: 281 users, 0 assigned |
| Assignment semantics | Existing value idempotency, missing/deleted denial, collision budget three | G1 focused tests: 16 Sanctuary assertions passed |
| Backfill safety | Route-unattached keyset batches, persisted operator checkpoint, rollback disables callers only | G1 focused tests; documented operational controls |
| Types | No client/ZenStack model exposes this server-only raw-persistence field; linked Supabase generation is checked but has no committed repository target | Confirmed; no hand editing |
| Production rollout | First batch requires explicit operator authorization and records its cursor/metrics | Deliberately deferred; not a prerequisite for a dark-schema persistence phase |

## Controlled future backfill

Backfill remains disabled by absence of an exposed route or scheduled job. Before
an operator starts it, classify the 281 existing `public.users` records, set a
small batch size, persist only the returned cursor after each successful batch,
and record attempted/succeeded/already-present/collision/failure counters. A
rollback disables the caller or job; it never clears `edlove_id` values or
rewrites canonical identifiers.

## Type-surface decision

`edlove_id` deliberately remains outside `@repo/schema` and generated ZenStack
models. The only supported access is Sanctuary's raw, parameterized private
persistence seam; adding it to a client/policy model would broaden the field's
surface without a read-use case. `supabase gen types typescript --linked` was
run successfully for the linked schema, but this repository has no committed
Supabase-generated type target. Generated artifacts were therefore not edited
by hand. The repository's current ZenStack generator itself fails before
emission with `fileExists` undefined; that pre-existing tool failure is not
used to justify source/generated drift.
