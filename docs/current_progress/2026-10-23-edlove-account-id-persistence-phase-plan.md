---
title: "EdLove Account UUIDv8 Persistence: Next-Phase Plan"
status: "superseded"
created: 2026-10-23
updated: 2026-10-25
superseded_by: "2026-10-25-canonical-uuidv8-account-cutover.md"
author: "Naveen"
scribe: "Codex"
tags: [plan, edlove, uuidv8, supabase, identity, migration, verification]
---

# EdLove Account UUIDv8 Persistence: Next-Phase Plan

> Superseded as the active implementation plan by
> [Canonical UUIDv8 Account Cutover](2026-10-25-canonical-uuidv8-account-cutover.md).
> This remains the historical record of the 2026-10-23 UUIDv8 dark-schema
> design and implementation state.

## Outcome

Persist one EdLove UUIDv8 account identifier for each eligible existing or new
`public.users` account, without changing `public.users.id`, Supabase subjects,
`auth_identities`, foreign keys, session behavior, or authorization decisions.

The new identifier is an additive cross-product handle. Until a later phase
explicitly authorizes it, `public.users.id` remains the canonical account key
for every existing query, policy, relation, and token claim.

## Non-negotiable invariants

- An account has at most one non-null `edlove_id`; it is never reassigned.
- Only the Sanctuary API issuer mints `Identity/account` UUIDv8 values.
- The database validates UUIDv8 profile-v1 shape and uniqueness; application
  retry never substitutes UUIDv4, UUIDv7, or a weak random value.
- Provider subjects remain opaque values in `public.auth_identities`; no email,
  phone, device, or provider subject may select or merge an account.
- The identifier has no authorization, tenancy, lifecycle, or credential
  meaning. APIs must not authorize from parsed UUID fields.
- Rollback disables assignment/reads at the API boundary. It does not delete
  assigned values, rewrite existing IDs, or remove the schema without a later
  human-approved retirement plan.

## Scope boundary

### Deliver

1. A shared profile-v1 fixture consumed by TypeScript and Postgres tests.
2. A database validator for UUID syntax, IETF variant, version 8, registered
   domain/subtype, and approved mint origins.
3. An additive nullable `public.users.edlove_id uuid` column with profile check
   and uniqueness enforcement.
4. A server-only, idempotent assignment service around the existing issuer.
5. Controlled backfill, observability, and rollout/rollback controls.
6. Regenerated database types and focused API/database evidence.

### Explicit non-goals

- No `public.users.id` rewrite, new foreign key, or `auth.users` change.
- No new Supabase Auth provider, session, passkey, RLS, or client flow.
- No client-side minting, SQL default/trigger minting, or UUID embedded in JWTs.
- No cross-product lookup API exposed to browsers or external channels.
- No deletion of historical UUIDv4/v7 paths.

## Architecture and write protocol

```text
verified provider subject
        │
        ▼
auth_identities ──> public.users.id (existing canonical account)
                            │
                            │ server-only idempotent assignment
                            ▼
                   public.users.edlove_id (new UUIDv8, nullable + unique)
                            │
                            ▼
                 future cross-product resolution only
```

The assignment service follows this protocol inside the account write boundary:

1. Reject a missing, deleted, or malformed canonical account reference.
2. Read the account’s existing `edlove_id`. If present, return it unchanged;
   this is the idempotent success path.
3. Mint an `Identity/account` ID through `createEdloveUuidV8Issuer` using the
   deployment’s explicit mint origin and operational rollback reporter.
4. Perform a conditional update: set `edlove_id` only where the canonical ID
   matches and `edlove_id IS NULL`; return the stored value.
5. If another worker assigned first, return that value. If a unique collision
   occurs, retry a newly minted candidate at most three times, emitting a
   collision event each time. Exhaustion is a typed, sanitized failure.
6. Do not emit success telemetry until the transaction commits.

The database uniqueness constraint is final authority. The service does not
pre-check an identifier with a separate query, because that creates a race.

## Server-write authority

The active migration ledger grants broad table privileges on `public.users` to
`authenticated` and retains an own-profile `FOR UPDATE` policy. RLS limits
which row a client may update; it does not make `edlove_id` column-owned by the
server. Therefore, adding the column before an attribute-level write boundary
would let a client choose a syntactically valid UUIDv8 value. That violates the
issuer invariant even if the profile check and unique index are correct.

The server-owned writer is `private.assign_edlove_account_id(uuid, uuid)`. It
is a `SECURITY DEFINER` function with an empty search path, owned by the
non-login `edlove_identity_writer` role. The `private` schema grants no access
to `PUBLIC`, `anon`, `authenticated`, or `service_role`. Sanctuary's protected
direct `DATABASE_URL` connection is granted execution on this function only;
it cannot `SET ROLE` to the writer identity. The public-column trigger permits a
non-null `edlove_id` write only while this function is executing as
`edlove_identity_writer`.

This deliberately does not make an RPC available to browsers, mobile clients,
or authenticated PostgREST sessions. A client-settable custom setting is not
an authority proof and is not used. Deployment must still prove that the
Sanctuary database connection is a protected server credential and that an
authenticated Data API request cannot write `edlove_id`.

## Implementation record — 2026-10-23

- **Shared vectors:** `packages/core/src/logic/utils/edloveUuidV8ProfileV1Vectors.ts`
  is now the TypeScript fixture for the exact account vector and negative
  profile cases. Core parsing/encoding and the Sanctuary issuer consume the
  positive vector.
- **Database validation:** migration
  `20261023100000_edlove_account_uuid_v8_validator.sql` adds only the immutable
  `is_edlove_account_uuid_v8_profile_v1(uuid)` validator. Its pgTAP rehearsal
  checks the canonical vector, version/variant/domain/subtype/origin failures,
  nullable semantics, and the non-RPC function privilege boundary.
- **Dark schema:** migration `20261023101000_edlove_account_id_dark_schema.sql`
  adds the nullable `users.edlove_id` column, profile check, partial unique
  index, and a fail-closed trigger. Until the production writer role is proven,
  every non-null insert or mutation is rejected; existing account/profile
  writes that do not name `edlove_id` remain unchanged.
- **Assignment service:** Sanctuary API has a conditional-update service that
  reads before minting, returns an existing value unchanged, serializes the
  competing update with `FOR UPDATE`, and retries only SQLSTATE `23505`, at most
  three times.
- **Backfill runner:** Sanctuary API has a route-unattached, bounded runner
  using canonical UUID keyset pagination (`id > cursor`, never offset). It
  fetches one lookahead row, returns a cursor only after every selected account
  resolves, and intentionally propagates an assignment failure so an operator
  cannot checkpoint past an unprocessed account.
- **Deployed dark schema:** the validator and nullable column are deployed to
  the linked Supabase project. At deployment inspection it contained 281
  `public.users` rows; all remain `edlove_id IS NULL`. No assignment or
  backfill has run.
- **Server writer:** migration `20261023102000_edlove_account_id_server_writer.sql`
  introduced the private write function. Its initial `postgres` trigger bypass
  was too broad and is superseded by
  `20261023103000_edlove_account_id_writer_role_hardening.sql`, which establishes
  the non-login writer-role boundary. Neither migration creates a public RPC or
  invokes assignment automatically.

## Work packages and exit gates

| Package | Work | Exit gate |
|---|---|---|
| A. Preconditions | Inspect migration history, `users` policies/views, generated types, account-write paths, table size, migration engine, and the actual API database role. Capture migration order/drift before writing SQL. | A reviewed impact set, a named migration sequence, and a tested server-only attribute-write guard; no unresolved schema drift. |
| B. Shared vectors | Move the profile-v1 vector and negative cases into a stable fixture consumed by core and database tests. | TypeScript and Postgres tests prove identical accepted/rejected bytes. |
| C. Database validator | Add a tightly scoped immutable Postgres validation function; verify UUID bytes, registry domain/subtype/origin, and reject test/reserved values at the production account column. | G1 SQL tests cover exact vector, wrong version/variant, reserved domain, invalid subtype/origin, and null handling. |
| D. Additive schema | Add nullable `users.edlove_id`; attach the validator check; create unique lookup enforcement and a comment describing non-authoritative semantics. | Existing rows remain unchanged; duplicate and invalid writes fail; generated types reflect the nullable field. |
| E. Assignment service | Add an API persistence port/service using the server-only issuer, conditional update, bounded collision retry, and typed sanitised errors. | G1 tests prove idempotency, concurrent winner behavior, collision retry/exhaustion, deleted/missing account denial, and no provider-subject input. |
| F. Backfill | Run only through the assignment service in bounded, resumable batches ordered by `users.id`; retain checkpoint/audit records outside the identifier itself. | Dry run reports eligibility; live batch is rate-limited, resumable, and has no duplicate/changed existing assignment. |
| G. Read introduction | Permit server-internal diagnostic resolution by `edlove_id` only after backfill coverage and privacy review. Keep all authorization keyed by canonical account ID. | G2 proves canonical and EdLove ID resolve to the same active account without altering authorization. |
| H. Rollout | Use a server-controlled write flag, monitor metrics, then increase batch rate. Keep reads disabled until coverage and error gates are met. | R1 window records zero unexpected uniqueness/validator failures and a tested disable path. |

## Migration design

The implementation will use new, timestamped migration files in
`apps/gurudevi-mobile/supabase/migrations/`; it will not edit old migrations.
The SQL design is deliberately split:

1. **Authority migration:** introduce the reviewed server-only attribute-write
   guard before the column becomes writable. It must not weaken or replace an
   existing profile policy.
2. **Validator migration:** profile function plus test-visible comment. It must
   not grant privileges or alter RLS.
3. **Column migration:** nullable `edlove_id uuid`, a check accepting `NULL` or
   the profile validator, and unique enforcement for non-null values.
4. **Type regeneration:** generated database types updated only after local SQL
   verification.

Before selecting the unique-index statement, package A records the live table
size, lock budget, and deployment path. A regular transactional unique index
is preferred when safe. If operational evidence requires `CREATE INDEX
CONCURRENTLY`, it must be a separate migration reviewed against the actual
Supabase deployment path: non-transaction migrations have different failure
and branch-deployment behavior.

No default, minting trigger, or `NOT NULL` constraint is added in this phase.
That prevents the database from minting IDs outside the API’s CSPRNG/clock
policy and keeps rollout reversible by disabling writes. A guard trigger may
be used only after the authority precondition above is met; it enforces who may
write, never generates an identifier.

## Backfill and operations

- **Eligibility:** accounts with `deleted_at IS NULL` and `edlove_id IS NULL`.
  Soft-deleted accounts are not backfilled.
- **Ordering:** stable canonical UUID order with a persisted cursor/checkpoint;
  never offset pagination.
- **Batch size/rate:** configured by environment and initially conservative;
  each batch is independently committed and resumable.
- **Idempotency:** reprocessing a canonical account returns its existing value.
- **Metrics:** assignment attempted/succeeded/already-present, conditional-update
  lost race, unique collision/retry/exhaustion, clock rollback, entropy failure,
  validator rejection, backfill lag, and missing-ID coverage.
- **Audit:** record only canonical account ID, EdLove ID, origin, actor/service,
  timestamp, outcome code, and correlation ID. Do not log provider subjects or
  credential metadata.
- **Kill switch:** disable new assignment/backfill through server configuration;
  preserve already assigned values and investigate from audit records.

## Security and privacy review

`edlove_id` is durable but not secret. It exposes issuance time at millisecond
granularity and must not be accepted as a bearer credential or embedded in
public URLs without a separate privacy decision. Existing RLS policies remain
the row-access guard; before any client projection is added, review whether
column exposure is necessary and use server-selected fields or column-level
security where it is not.

The new column does not change the provider-to-account resolution query. The
resolver continues to use `(provider, provider_user_id) -> users.id`, then may
return `edlove_id` only to a server-internal caller explicitly authorized to
receive it.

## Verification matrix

| Level | Evidence | Proves | Does not prove |
|---|---|---|---|
| G0 | Core vector/parser tests; API and generated-type static checks | Contract and type shape. | Database runtime or concurrency. |
| G1 | Postgres validator/constraint tests; service tests with repository controls | Profile enforcement, retries, idempotency, and sanitized failures. | Hosted Supabase behavior or real contention. |
| G2 | Stateful account assignment/backfill-resume scenario | Canonical and EdLove handles remain one account without changing auth mapping. | Browser/mobile journeys. |
| G3/G4 | API mount and generated-client contract check | Server route boundary and schema/client compatibility. | Physical devices or production load. |
| R1 | Staged production backfill/monitoring window | Operational safety under real database/provider traffic. | Permanent future-provider compatibility. |

## Stop conditions

Stop and return to architecture review if any condition occurs:

- migration history differs from the deployed project or account schema is not
  deterministically reproducible;
- the direct API database role or a server-only `edlove_id` attribute guard
  cannot be verified against an authenticated client request;
- generated SQL would alter `users.id`, `auth_identities`, a foreign key, RLS,
  or an existing trigger outside the stated impact set;
- a test requires weak entropy, client minting, encoded authorization data, or
  an unbounded retry loop;
- the chosen unique-index strategy cannot meet the production lock/deployment
  constraints;
- an existing account has multiple conflicting non-null values;
- any caller requests EdLove ID as an authentication or authorization substitute.

## Rollback policy

1. Disable the server write/backfill flag.
2. Keep the nullable column, check, index, and assigned values intact.
3. Continue current `users.id` and provider-subject resolution unchanged.
4. Diagnose from metrics/audit records, fix forward, and resume only with a new
   approval record.

Dropping the column, validator, index, or assigned values is outside this phase
and requires explicit human approval under the deletion veto.

## Sources

- [EdLove Sovereign UUIDv8 Specification](../architecture/edlove-sovereign-uuidv8-specification.md)
- [EdLove Identity Convergence Program](../architecture/edlove-identity-convergence-program.md)
- [Step 1 UUIDv8 foundation plan](2026-10-23-edlove-uuidv8-foundation-implementation-plan.md)
- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase local development workflows](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
