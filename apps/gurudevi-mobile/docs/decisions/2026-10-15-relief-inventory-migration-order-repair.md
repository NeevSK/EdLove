---
title: "Relief and Inventory Migration Order Repair"
status: "active"
created: 2026-10-15
updated: 2026-10-15
author: "Naveen"
scribe: "Codex"
tags: [migration, bootstrap, compatibility, foundation]
---

# FEATURE SPEC: Relief and inventory migration order

## Blast Zone: RED

The user explicitly approved ordering repair with a compatibility plan. No remote
migration history changes, deployment, table deletion or data reset are authorized.

## Target File

Rename `supabase/migrations/20240319000000_relief_and_inventory.sql` to
`supabase/migrations/20260503174100_relief_and_inventory.sql`, preserving its SQL.

## Reuses

The existing baseline creates schools, users and classrooms. March identity
migrations provide `get_my_id()`. Migration `20260503174000` provides
`resonance.enable_resonance()`. Existing Supabase CLI applies the ordered chain.

## Does NOT

Does not weaken RLS, remove the relief/inventory capability, stub temporal helpers,
rewrite the baseline, skip a failed migration or claim the entire chain is sound.
Does not change the later inventory reconciliation migrations or runtime API.

## Complexity Budget

One file rename, zero SQL-line changes. No new helper functions or runtime logic.

## Evidence and dependency order

The isolated PostgreSQL 17.11 bootstrap fails at the old migration with SQLSTATE
42P01 because schools do not exist yet. The new position is after all identified
DDL/helper dependencies and before the August inventory alterations. Subsequent
fresh-bootstrap errors remain separate defects, not permission to waive them.

## Existing deployment compatibility

Renaming a file changes the CLI migration ID even though its SQL is unchanged.
Before deploying, inspect the target's migration ledger and schema with an
authorized operator. This has not been done for any remote database.

- Neither ID recorded: apply the ordered migration normally after prerequisites.
- Old ID recorded: verify that both tables, expected columns, RLS policies and
  temporal helpers/history triggers really exist and match the old SQL. Confirm
  that the recorded old statements match the renamed file. Only then may an
  authorized operator reconcile the old ID to the new ID using the supported
  migration-repair workflow. This is ledger reconciliation, not SQL replay.
- New ID recorded: verify correspondence; do not replay or repair automatically.
- Both IDs recorded, missing objects, modified statements or partial application:
  stop and reconcile the discrepancy explicitly. `IF NOT EXISTS` on tables does
  not make unguarded policy creation safe to replay.

Do not automatically mark the new ID applied, delete ledger rows, or run a repair
against a linked project. Back up ledger/schema evidence before any approved
reconciliation. The SQL is retained in Git under its new position and recoverable
from the old path/history; existing remote databases are unchanged by this edit.

## Acceptance

Verify rename identity in raw Git diff; retry the fresh local chain against only
`gurudevi_foundation_test` at loopback port 55432. Inspect migration ledger and
database objects independently. A later failure means bootstrap remains open.

## Approved follow-up: existing policy replacement

After the rename, the baseline and first RLS repair applied. The next migration,
`20260211193000_fix_rls_recursion_v2.sql`, failed with SQLSTATE 42710 because its
SELECT policy name already exists from the baseline. The user separately approved
adding exactly the missing `DROP POLICY IF EXISTS` immediately before that policy
is recreated. Its replacement predicate, role, command and RLS-enabled state stay
unchanged. The CLI runs the replacement inside its migration transaction.

Blast zone remains RED. Reuse the existing replacement SQL; add one drop statement,
no new policy behavior or helper. Already-applied remote v2 migrations must not be
replayed just to obtain this source-level fresh-install repair. No remote ledger
or schema is changed by this local rehearsal.

The user also approved three identical-predicate replacement repairs in
`20260216000001_fix_runtime_errors.sql`: add matching `DROP POLICY IF EXISTS`
before the mood-log INSERT, SELECT and UPDATE policy creations. The immediately
preceding consolidated migration already creates those exact owner-only policies.
This is three additional statements, with no predicate, role or grant change.

## Local rehearsal result

The local ledger independently reports 19 applied migrations through
`20260228105056`. The current failure is the next group-message migration's
reference to the not-yet-created membership `status` column. These repairs have
advanced the actual canonical chain, not a copied subset. They have not yet
proven the relocated May migration executes or the full chain bootstraps.

The renamed file's SHA-256 before and after is
`5BDFFC7E6BA487B8CB7FD337591D520106D6F15EEF31FC15908CC9F6A1A73FAB`.
Raw diffs confirm four approved policy-drop additions with unchanged replacement
bodies. No row deletion, RLS disabling or migration-history repair was performed.

## FEATURE SPEC: Existing wellbeing RLS regression

Blast zone: AMBER test-only addition. Target:
`supabase/tests/database/private_wellbeing_rls.test.sql`.
Reuse installed mood-log RLS and Supabase auth triggers, pgTAP and the existing
local PostgreSQL instance. Budget: one transactional SQL test under 150 lines.
Do not change production policies, add grants to make assertions pass, bypass RLS
for security assertions or claim this tests authenticated API transport. Fixture
setup is privileged; assertions switch to the non-owner authenticated role.
All fixtures and test-only extension installation roll back on completion.

The first 17-case real run returned 16 successes and one assertion failure:
anonymous SELECT did not throw. Catalog evidence confirms `anon` has a table
SELECT grant. Correct the test to require zero visible private rows, not a missing
grant: RLS filtering is a valid confidentiality mechanism. This changes the test's
mechanism assumption, not its privacy requirement; no grants or policies change.
Add owner update/delete positives so isolation cannot pass solely by blocking all
writes. Independent queries after the first run found zero fixture accounts,
zero fixture moods and no persisted pgTAP installation.

## Approved prerequisite: membership status

The user approved bringing the exact later membership status definition forward
into `20260228105057_group_messages.sql`, before its active-member policies.
Blast zone: RED. Add only `status TEXT DEFAULT 'active'` with its existing
active/pending/banned CHECK and `IF NOT EXISTS`; no grants, predicates or table
removals. This reuses the definition from `20260302093414` and leaves that later
idempotent declaration intact. Existing deployments are not replayed or repaired.

## Approved search migration ordering repair

The user separately approved moving unchanged
`20260302000000_versatile_search.sql` to
`20260302094049_versatile_search.sql`. This RED-zone repair places search after
`20260302094048_library_alignment_v3.sql`, which renames `library_items`, supplies
the `title`/`url`/`type`/`subject` target columns and creates the vector extension
and embedding column. Search remains before later staff/library migrations.
No search SQL, grants, policies, table data or unrelated migration is removed.

The isolated chain stops at the old search ID with `42P01`; its ledger remains
22 through `20260228110000`. Acceptance requires a byte-identical move and a
fresh local CLI attempt without skipping or marking failed migrations applied.
A later dependency failure keeps the full bootstrap gate open.

Existing deployments require the same explicit ledger reconciliation discipline:
if neither ID is recorded, apply in the repaired order. If the old ID is recorded,
an authorized operator must verify the search-vector column, trigger/function,
GIN index and `search_library` function against the unchanged SQL and capture the
ledger/schema evidence before separately authorized supported migration repair.
If the new ID is recorded, verify correspondence without replay. If both are
recorded, objects differ, or application is partial, stop for reconciliation.
No remote query, automatic ledger mutation or remote deployment is authorized
by this local file move.
