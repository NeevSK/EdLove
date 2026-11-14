---
title: "Local Isolated Foundation Integration Environment"
status: "active"
created: 2026-10-15
updated: 2026-10-16
author: "Naveen"
scribe: "Codex"
tags: [integration, postgres, isolation, local, evidence]
---

# Local foundation integration environment

## Earlier library repair proposal — superseded by 2026-10-16 approval

The next blocked migration is `20260302094048_library_alignment_v3.sql`.
The baseline and isolated catalog define `library_items.file_url`, not
`resource_url`; neither defines `resource_type`. The failed transaction left
the original table and columns intact, with canonical ledger 27.

The earlier bounded proposal was to rename the actual baseline `file_url` to `url`,
preserving its values, and introduce nullable `type TEXT` without inventing a
classification for historical rows. The later search predicate already accepts
an absent type filter; typed filtering must not falsely classify unknown rows.
The user subsequently approved this exact correction. Do not add a guessed
default such as document/resource, drop data, bypass a migration, or mark failed
work applied. Already-recorded remote migrations are outside scope.

At that earlier checkpoint, acceptance still required a rollback rehearsal
with preserved URL/null type and a resumed local CLI chain. The missing
assignments SELECT policy is a separate authority design decision, not resolved
by this library repair.

## Library repair status at ledger 27 — prior checkpoint

The user approved renaming the existing `library_items.file_url` to `url` and
adding nullable `type TEXT`, with no fabricated default for historical rows.
At that checkpoint this source repair was not yet implemented or applied. The
CLI's prior attempt stopped at `resource_url` with 42703; baseline/catalog columns were
`id`, `school_id`, `uploader_id`, `title`, `description`, `file_url`,
`thumbnail_url`, `created_at`. The failed migration rolled back without adding
`resource_url` or `resource_type`.

The submissions RLS correction was applied before that failure. The isolated
ledger is now 27 through `20260302093635`; no further migration has applied.
Assignment SELECT RLS is still unresolved. The submissions fixture assumes its
RLS migration is unapplied and cannot be repeated at ledger 27 without a revised
fixture-state decision. No remote migration history was changed.

## Current approved submissions-authority checkpoint — 2026-10-16

The user approved the three submissions RLS join correction. Source now joins
the assignment/classroom authority for the affected predicates. A rollback-only
G2 / PostgreSQL 17.11 fixture at
`apps/gurudevi-mobile/supabase/tests/migrations/submissions_assignment_authority.test.sql`
reports 8/13 assertions passing and 5 failing. All five student-behavior checks
pass; teacher-positive access remains blocked because real assignment rows lack
repository RLS policies or a migration. Do not treat this as a full security pass.

The fixture ran in the existing `gurudevi-foundation-test-20261015` container.
Post-run cleanup found no fixture seed rows, fixture policies or pgTAP objects;
the approved migration source `20260302093635_submissions_rls_fixed.sql` matches
its host/container copy (SHA-256
`1FC3722F077F3B5E509CCD06B26883E78A7D1F2579754EB0BDC1CB7F9C18792A`).
At this fixture checkpoint the ledger was 26 through `20260302093454`; the
following CLI attempt supersedes that state. Earlier approval-pending wording
below records the prior state, not current approval.

## Earlier local migration-chain attempt — 2026-10-16, superseded below

Interactive Bash supplied `PGPASSWORD` from the named local container's child
environment; no secret value was printed or placed in a URL/config file. Supabase
CLI 2.119.0 used the explicit loopback target `127.0.0.1:55432/gurudevi_foundation_test`,
the mobile workdir, `--skip-vault --include-all`, first in dry-run and then with
`--yes`. The apply exited 1 after the approved submissions RLS migration applied.
Independent query: ledger count 27, maximum `20260302093635`.

Next, `20260302094048_library_alignment_v3.sql` failed with PostgreSQL 42703:
`resource_url` does not exist. `library_items` currently has `id`, `school_id`,
`uploader_id`, `title`, `description`, `file_url`, `thumbnail_url`, and
`created_at`. The failed DDL rolled back; neither `resource_url` nor
`resource_type` exists. The user has since approved the bounded `file_url` to
`url` rename and nullable `type TEXT` addition with no fabricated default; source
implementation was pending at that checkpoint. No remote history was touched.
The prior submissions fixture requires an unapplied RLS migration and cannot
be rerun as-is at ledger 27; resolve fixture-state design before repeating. No
repository assignment RLS policy was found, so that authorization question
remains open.

## Latest continuation and current blocker — 2026-10-16

The approved library correction now has a rollback-only G2 / PostgreSQL 17.11
rehearsal: 10/10 assertions for exact DDL and preservation of existing URL data;
this admin-role fixture is not authorization evidence. Migration source
`20260302094048_library_alignment_v3.sql` SHA-256
`56C4E646974658122B058CD0B45BA631FFE6612D5F33B192F65295AF5C3B25F4` matches
host and container copies.

After dry-run, Supabase CLI 2.119.0 applied `20260302094048` (library alignment),
`20260302094049` (versatile search), and `20260302094129` (staff support).
Independent catalog query confirms canonical ledger count 30, max
`20260302094129`. The next `20260302110000` fails with 42704 because
`public.user_growth_state` does not exist. Repository search found its only
`CREATE TABLE` in `archive/master_baseline.sql:619`; do not assume a migration
reorder or edit. A database worker is investigating read-only. No remote change,
reset, skipped migration or fabricated grant occurred.

The submissions authority rollback fixture depended on an unapplied historical
migration and cannot be rerun unchanged against ledger 30. Its earlier 8/13
result remains the only recorded fixture result; assignment SELECT RLS remains
unresolved. The successful library rehearsal proves schema/data preservation,
not authorization or full-chain bootstrap. Production helper settlement and
receipt recovery, then web/native operation acceptance, remain subsequent gates.

Current application-boundary evidence is G1 / Vitest: four API files, 44/44
across sync, HTTP privacy, oRPC middleware and domain-error projection; API G0
TypeScript exits 0. Core assignment replay/browser-safe transport is G1 22/22
under mocked fetch/account guards, with web G0 TypeScript exit 0. These mocked
checks do not prove browser UI completion or real database settlement.

## Current ORM/API contract and environment checkpoint — 2026-10-15

A reproduced library selection had **13/23** passing and 10 failing because the
strict generated ORM model was being used as the API read schema, omitting
existing nested resource/creator and virtual fields. The approved correction is
explicit strict read DTOs in the API contract, with typed virtual mode separated
from stored UUIDs; existing write inputs, authorization and behavior stay intact.
Three missing fields were added to the virtual-collection projection in one
handler file; two ORM-mock return branches use truthful fixtures. No assertion
was weakened. Initial focused G1 / Vitest was **27/27**. The latest native and
OpenAPI path selection is G1 / Vitest, two files, **28/28**, with database/Auth
mocked. API G0 TypeScript exits 0; scoped Biome across five files and the parent's
diff check exit 0. The existing read-only GET parity test passes without exposure
changes. Nearby identity/error selection is green; community still has 3 failing
cases, leaving the combined selection at **52/55**.

Read-only WSL CLI 2.119.0 inspection confirmed support for `db push`,
`--db-url`, `--include-all`, `--skip-vault`, `--dry-run`, and the mobile workdir.
No migration command was executed: secure local URL transport still needs
operator resolution, including the PowerShell/WSL distinction for
`$LOCAL_DB_URL`. Full-chain/RLS repair remains awaiting explicit user approval;
no database writes were made.

Read-only audits confirmed the migration ledger remains at 26. The existing
production `settleAssignmentSubmission` function is identified, but actual ORM
settlement verification is blocked on receipt-schema prerequisites.

The web G4 audit emitted the Next sign-in route and reported completed build
phases, but the child exit code and logs were not retained. This is not an
independent build-success, native-pollution, or deployment verification.

## Community and runtime delegate availability audit — 2026-10-15

The earlier `apps/sanctuary-api/src/__tests__/community.orpc.test.ts` baseline
was 4/7. The current regression selection is G1 / Vitest, eight files, 83
assertions: 82 pass and one fails; `community.orpc.test.ts` is 6/7. A seven-line
`GroupMember.create` mock branch accepts `data: Record<string, unknown>` and
corrects the invalid-UUID fixture without adding `any`; the parent reviewed the
raw hunk, with no deletions or other branch changes, and scoped diff check exits
0. This limited fixture result is verified. The other seven files (library,
identity and error coverage) pass. The remaining `createComment` assertion still
fails because actual ZenStack comment/upvote delegates are absent; no production
persistence fix has been made.

Read-only source inspection confirms `packages/database/src/client.ts` returns
`ZenStackClient(schema)`, and `packages/schema/schema.zmodel` defines `GroupMember`
mapped to `community_group_members` with UUID identity. In contrast,
`CommunityComment` and `CommunityCommentUpvote` are absent from the ZModel and
generated client. `apps/sanctuary-api/src/core/handlers/community.ts` calls those
delegates through `context.db as any`; legacy SQL tables and
`packages/core/src/adapters/supabase/communityRepository.ts` exist, but that
repository is not wired into API context. This is a real persistence and typed
adapter gap; a mock change cannot make comments/upvotes functional. Await a
typed-model mapping or port decision before implementation. No new tables or
policy loosening are approved, and no production edits have been made. The ledger
remains 26 and migration-specific RLS repair still awaits explicit approval; no
database changes were made.

Implementation path remains undecided pending root approval: (A) map the
existing comment/upvote tables as typed ZenStack models, relations and policies
after explicit approval, or (B) wire the existing typed Supabase repository
through API context. Do not infer either path from the test mock branch. No
assertion or production behavior has been accepted as fixed.

The wider read-only audit compared handler delegate calls with the actual
generated runtime metadata in `packages/schema/src/generated/orm/schema.ts`,
exported by `@repo/schema`; a `~schema.prisma` file is not authoritative for this
runtime. Six delegate families are absent: `communityComment` and
`communityCommentUpvote` in
`apps/sanctuary-api/src/core/handlers/community.ts` (lines 310/321/335/358 and
345/347/350); `directConversation` and `directMessage` in
`apps/sanctuary-api/src/core/handlers/messaging.ts` (35/49/64/68 and 73/86);
`principalNote` in `apps/sanctuary-api/src/core/handlers/principalNotes.ts`
(29/37/46/63/75); and `userBlock` in
`apps/sanctuary-api/src/core/handlers/social.ts` (67/73/79/88/99).
Mocked delegate tests do not establish these calls work against
`createZenStackDb`, which returns `ZenStackClient(schema)`.

This is an ORM availability/model-coherence gap, not evidence of an authorization
exploit. Existing SQL and the Supabase repository back comments/upvotes, but the
repository is not wired to API context; the backing `userBlock` table remains
unverified. The audit explicitly excludes false positives: `Notification`,
`InventoryRequest`, `ThoughtRecord`, `LearningReflection`, `MappingTopology`,
`CollectionNodeEvent`, `SanctuaryManifesto` and `ManifestoEndorsement` are present
in runtime metadata. No schema changes, migrations or route hiding are approved.
Latest broad default API run, from the `apps/sanctuary-api` directory:
`node node_modules/vitest/vitest.mjs run --exclude 'src/__tests__/integration/**'`.
G1 / Vitest with database, provider and Auth substituted: **83 files, 552
assertions; 77 files passed, 6 failed; 527 passed, 25 failed; no skips or
test-load errors**. Generic model mocks may produce false-green coverage for the
delegate families listed above. Failures: one AI stream `RUN_FINISHED` usage
shape; one community `createComment`; one sync output; eight downstream
validation; nine media 404s at `/api/media/registerWallpaperAsset` and
`deleteWallpaperAsset`; and five layout-sync 404s at
`/api/sync/patchWorkspaceLayout`. The route 404 root cause is under read-only
investigation; no implementation is approved. Earlier focused results (including
28/28 and 82/83) remain historical, not overall API acceptance. API G0
`node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` exits 0.
No source, schema, migration or database changes were made for this baseline.

## Identity ownership upgrade rehearsal — 2026-10-15

Latest hostile extension: **G2 / PostgreSQL 17.11 + pgTAP/TAP::Harness 37/37**.
Adds explicit column grants (including PUBLIC inheritance), a permissive write
policy, and exact migration execution against an ambiguous historical mapping.
The upgrade refuses atomically; historical mapping/grants remain unchanged.
The normal upgrade then denies client writes despite those legacy permissions.
No production migration change was needed. Rollback cleanup independently shows
no fixture table/accounts/extension/Auth column; prior checkpoints below are
historical. pg_read_file is used only by the local superuser test harness to run
the exact copied SQL inside pgTAP's exception subtransaction, not by the API.

Latest strengthened repeat: **30/30**, including a phone-only insert performed
as the real supabase_auth_admin database role and successful profile phone sync.
A permissive legacy read policy remains in the fixture to verify the restrictive
binding fence cannot be bypassed by permissive policy OR-composition. The earlier
28/28 checkpoint below remains historical. Independent cleanup checks again show
no fixture account/mapping/Auth phone column/pgTAP extension and ledger 26 unchanged.

The approved roll-forward source is
`20261015150000_server_owned_auth_identity.sql`. It is **not applied** to the
canonical ledger or any remote database. Its guarded rollback fixture is
`supabase/tests/migrations/auth_identity_ownership.test.sql` under the mobile app.
The incomplete ledger lacks identity/profile columns; the fixture explicitly
prepares those prerequisites, including phone/is_anonymous columns missing from
this database image's old auth.users layout. This is not an installed Auth service.

The fixture requires the isolated database name and refuses an already-present
auth_identities table before setup. Bootstrap needs the container's local
supabase_admin role because postgres does not own auth.users. Security assertions
then switch to non-owner authenticated/anon roles and verify no RLS bypass.
Copy only the two exact source files to matching paths inside the named container
before each run (Podman does not automatically see Windows edits), then run:

```powershell
wsl.exe -d Ubuntu -- prove --norc --verbose --exec "podman exec -i gurudevi-foundation-test-20261015 psql -X -U supabase_admin -d gurudevi_foundation_test -qAt -v ON_ERROR_STOP=1 -f" /mnt/c/x/apps/gurudevi-mobile/supabase/tests/migrations/auth_identity_ownership.test.sql
```

G2 scenario / PostgreSQL 17.11, pgTAP/TAP::Harness: **28/28**. Covers real grants,
RLS reads, denied client mapping writes, restricted function execution, a genuinely
decoupled account, phone-only SQL provisioning, untrusted metadata privilege
denial, mapped-profile updates without duplication, deleted-account refusal and
repeat migration. Initial strengthened tests exposed an equal-ID fixture and
were fixed by preparing an explicitly different synthetic application account;
the assertions were retained. No mapping/account data from outside the fixture
was deleted. All prerequisite DDL/data and the migration roll back together.

The wrong-database negative exits nonzero before fixture setup. Independent
post-run inspection must confirm no auth_identities table, fixture subjects,
pgTAP extension or added Auth phone column remains. The last verified canonical
ledger is still 26 through 20260302093454. Copied SQL source files remain inside
the disposable container; they contain no credentials or user data.

Does not prove the complete migration chain, production/custom role grants,
GoTrue signup/OTP delivery, real signed API-to-database integration, historical
mapping integrity or deployment compatibility. Review pre-existing mappings
created while direct client writes were allowed; do not silently relink, merge
or delete ambiguous accounts. Coordinate migration/API/client rollout: the old
direct-upsert client flow is intentionally restricted, not supported by an alias.

## Current state

The user authorized preparing a local isolated test environment. The database
runtime is running; application bootstrap is **not ready**. Do not substitute
this instance's existence for completed integration tests.

| Resource | Verified value |
| :--- | :--- |
| Host runtime | Ubuntu WSL, rootless Podman 5.7.0 |
| Container and dedicated volume | `gurudevi-foundation-test-20261015` |
| Purpose label | `io.gurudevi.purpose=foundation-integration-test` |
| Database | `gurudevi_foundation_test` |
| Published address | `127.0.0.1:55432` only |
| Cached image | `public.ecr.aws/supabase/postgres:17.11.0.002` |
| Image ID | `e671c63f6ad3a3bc0503d26bb6641bb2b8eddaabbfe1782ba56b7d2c0243b6d8` |
| Engine query | PostgreSQL 17.11, x86_64 Linux |
| CLI used for migration attempt | WSL Supabase 2.119.0 |

Windows also has repository-local Supabase CLI 2.120.0 via `pnpm exec supabase`;
absence from the Windows PATH does not mean the CLI or WSL tools are absent.
No Docker Desktop installation or dependency upgrade was required.

The image supplies `auth`/`storage` schemas, but this is a database container,
not a running Supabase Auth/API/Storage service stack. No API server, signed
identity or application schema is accepted as ready yet.

## Inspect and retain

Run from PowerShell:

```powershell
wsl.exe -d Ubuntu -- podman ps -a --filter name=gurudevi-foundation-test-20261015
wsl.exe -d Ubuntu -- podman port gurudevi-foundation-test-20261015
wsl.exe -d Ubuntu -- podman exec gurudevi-foundation-test-20261015 pg_isready -U postgres -d gurudevi_foundation_test
```

Creation used the existing cached image with `--pull=never`, a separately named
volume, loopback publishing and a password generated by OpenSSL in process
environment. No password was printed or written to tracked configuration.
Do not print container environment/inspect output containing credentials.
External provider credentials remain Doppler-owned.

The database owner was explicitly set to `postgres` by `supabase_admin` inside
this new instance so the migration role could create the migration history
schema. This is **bootstrap authority**, not the application security identity.
Tenant-isolation tests must use a deliberately non-owner, non-superuser role and
must check RLS/ORM behavior; admin queries cannot prove isolation.

To stop without deleting the data:

```powershell
wsl.exe -d Ubuntu -- podman stop gurudevi-foundation-test-20261015
wsl.exe -d Ubuntu -- podman start gurudevi-foundation-test-20261015
```

Neither command removes the container or volume. Do not run a general prune,
reset another development stack, use linked-project migration commands, or
delete this volume without checking its contents and obtaining approval.

## Verified bootstrap defect

A dry run enumerated the repository migration chain against the explicit local
database URL. Applying that chain with `--skip-vault` failed at its first file:

`20240319000000_relief_and_inventory.sql` references `public.schools`,
`public.classrooms`, `public.users` and later resonance helpers before the
2026 baseline and temporal infrastructure exist. The terminal migration command
exited 1 with `42P01: relation public.schools does not exist`.

After failure, independent database queries returned zero applied migration
records and zero public tables. No migration was skipped, marked applied,
renamed or edited. Existing development and production databases were untouched.

This describes the initial failure. Subsequently the user approved the
[ordering and compatibility repair](../../../gurudevi-mobile/docs/decisions/2026-10-15-relief-inventory-migration-order-repair.md):
the misdated file moved to `20260503174100` with byte-identical SQL. Separately
approved missing policy-replacement drops now allow the baseline/users/mood-log
migrations to advance. The approved membership `status` prerequisite repair then
advanced the ledger to 22 migrations through `20260228110000`. The current failure
is `42P01` in `20260302000000_versatile_search.sql`: `library_resources` is
referenced before `20260302094048_library_alignment_v3.sql` renames `library_items`.
This was the earlier checkpoint. The user subsequently approved moving the
unchanged search file to `20260302094049`; raw Git blob identity was verified.
The next CLI attempt applied four migrations and the independently queried ledger
now has **26 through `20260302093454`**. It stops at
`20260302093635_submissions_rls_fixed.sql`, whose three teacher predicates refer
to a nonexistent direct `submissions.classroom_id` rather than joining through
`assignments.classroom_id`. A separate repair approval has been requested; no
predicate change or skipped migration is implied. The moved search migration has
not yet been executed. Bootstrap is still incomplete; never describe the earlier
zero-table state as the current state after this progress.

## Remaining acceptance work

- Repair the fresh-install migration path while preserving existing deployment
  history; review the entire dependency chain, not just the first failure.
- Establish least-privilege application/test roles and verify installed policies.
- Repair the existing integration harness's non-UUID fixture identifiers,
  token-subject mismatch and retired request envelopes without relaxing assertions.
- Start an isolated API with a real signed local identity, explicit issuer and
  audience; do not enable opaque-token bypass as an integration substitute.
- Run actual ORM grade/audit rollback, duplicate/concurrency, receipt recovery and
  cross-tenant denial scenarios. Record real database evidence separately from
  G1 substituted-boundary results.

The existing integration suite still requires `TEST_DATABASE_URL`, `TEST_API_URL`
and `TEST_AUTH_TOKEN`; no placeholder values were installed to make that gate green.

## Real database privacy scenario

`supabase/tests/database/private_wellbeing_rls.test.sql` now exercises the installed
mood-log RLS with two accounts. Run against the explicit local instance from
PowerShell (the generated password stays in the child environment):

```powershell
wsl.exe -d Ubuntu -- bash -lc 'export PGPASSWORD=$(podman exec gurudevi-foundation-test-20261015 printenv POSTGRES_PASSWORD); export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=postgres PGDATABASE=gurudevi_foundation_test; prove --norc --verbose --exec "psql -X -qAt -v ON_ERROR_STOP=1 -f" /mnt/c/x/apps/gurudevi-mobile/supabase/tests/database/private_wellbeing_rls.test.sql'
```

The file refuses any database name other than `gurudevi_foundation_test` before
installing its transaction-local pgTAP extension or creating fixtures. The TAP
harness returns nonzero on a failed assertion; `psql ON_ERROR_STOP` also catches
SQL/setup failures. It does not depend on a hand-parsed success string.

**G2 scenario / PostgreSQL 17.11 + pgTAP 1.3.3 + TAP::Harness:** 19/19 assertions,
real database/storage, with identity claims injected through SQL. Fixture setup
uses the bootstrap role; security assertions verify they run as a non-owner
`authenticated` role without superuser/RLS bypass. Tests cover owner CRUD,
cross-account read/update/delete/insert denial, ownership-transfer denial and
missing/anonymous identity visibility. Application IDs are resolved from the
trigger-created profiles rather than assumed equal to provider subject IDs.

The initial test incorrectly expected anonymous SELECT to raise a grant error;
catalog inspection showed an existing SELECT grant. The corrected assertion
tests zero-row visibility under RLS, with no grant or policy modifications.

Independent post-run queries confirm zero fixture accounts/moods and zero
persisted pgTAP installations. The migration ledger remains at 19 entries through
`20260228105056`. This is **not** final-schema, API/JWT, ORM policy-plugin,
production or full tenant-isolation acceptance. Repeat after the entire migration
chain is repaired; do not aggregate these assertions into mocked API test counts.

Latest repeat at ledger 26: **G2 / PostgreSQL 17.11 + pgTAP/TAP::Harness: 19/19**.
The fixture still rolls back its data and extension installation. These results
exercise wellbeing policies only; they do not validate the failed submissions
policies, receipt storage, signed API identity, or the remaining migration chain.

Safety negative: running the same file against the `postgres` database in this
same isolated container exits nonzero before extension/fixture setup. This is an
expected guard refusal, not a failing privacy assertion or a production probe.

## Account-scoped submission-key upgrade rehearsal

The approved root correction is migration
`20261015130000_account_scoped_submission_idempotency.sql`, paired with the
AssignmentSubmission source schema and regenerated ORM metadata. It preserves
key values and assignment/student uniqueness while replacing global key
uniqueness with `(student_id, idempotency_key)` uniqueness. No remote migration
or canonical local-ledger application has been performed.

Run its dedicated rollback-only upgrade fixture:

```powershell
wsl.exe -d Ubuntu -- bash -lc 'export PGPASSWORD=$(podman exec gurudevi-foundation-test-20261015 printenv POSTGRES_PASSWORD); export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=postgres PGDATABASE=gurudevi_foundation_test; prove --norc --verbose --exec "psql -X -qAt -v ON_ERROR_STOP=1 -f" /mnt/c/x/apps/gurudevi-mobile/supabase/tests/migrations/submission_key_upgrade.test.sql'
```

**G2 scenario / PostgreSQL 17.11 + pgTAP 1.3.3 + TAP::Harness: 8/8.** This
privileged fixture refuses other database names and an already-recorded upgrade.
Because ledger 26 predates the key column, it prepares that legacy prerequisite
inside its transaction, includes the actual migration unchanged, checks old
global-key rejection and new account-scoped acceptance/conflicts, repeats the
migration, then rolls back. It is an upgrade-mechanism rehearsal, not a canonical
chain installation, RLS assertion or application-writer transaction test.

Independent post-run queries found zero fixture accounts/classrooms, zero
temporary key columns/constraints and zero pgTAP installations. The canonical
ledger remains **26 through `20260302093454`**. Real ORM rollback/concurrency,
application authority and eventual deployment lock/index-build costs remain open.
