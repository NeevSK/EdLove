---
title: "Canonical UUIDv8 Account Cutover"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Codex"
tags: [identity, uuidv8, authentication, database, api, verification]
---

# Canonical UUIDv8 Account Cutover

## Decision and authorization

The broader [identity/auth/decoupling plan reconciliation](2026-10-25-identity-auth-and-decoupling-plan-reconciliation.md)
records which related plans still govern unfinished work. This ledger proves
only the account cutover's named implementation and evidence boundaries.

On 2026-10-25 the user explicitly authorized breaking the pre-production legacy
account architecture and making EdLove UUIDv8 canonical in the database and API.
There is no production compatibility requirement for this cutover. This replaces
the previously proposed nullable `users.edlove_id` adoption sequence; the
[authentication authority](../architecture/authentication-and-sovereign-identity.md)
and [UUID specification](../architecture/edlove-sovereign-uuidv8-specification.md)
remain the governing references with their updated account policy.

The implementation keeps Supabase's credential subject unchanged. Domain
ownership uses `public.users.id`, an immutable EdLove Identity/account UUIDv8.
No email, role, tenant or permission is inferred from UUID bits.

## Implemented changes

- `20261025010000_canonical_uuidv8_accounts.sql` creates the database issuer and
  private transactional logical clock. It uses CSPRNG entropy, retains time on
  a small clock rollback, and raises on rollback beyond 30 seconds.
- The migration creates a transaction-local old/new account map, promotes an
  already assigned EdLove handle, rewrites domain foreign keys and identified
  unbound UUID/text ownership columns, then rebuilds the foreign keys. Composite
  account FKs fail explicitly rather than being guessed. The local schema
  supplied 201 root account/credential foreign-key constraints, including
  partitioned parents.
- Domain references to `auth.users` become references to `public.users`.
  Business policies and functions resolve `public.get_my_id()`; credential
  binding policies continue to use `auth.uid()`. The old nullable side-ID,
  private assignment SQL operations/queues, and scheduled worker registration
  are retired. Historical migration files remain chronological evidence.
- New Auth provisioning creates the canonical account and binding in one
  transaction. Existing provider subjects are never copied into account keys.
  Profile metadata refresh remains supported; an account ID cannot be changed
  by a later profile or Auth update.
- `canonical_account_access_token_hook` issues a server-owned
  `canonical_account_id` claim. It preserves `sub` and is callable only by the
  Auth service role. Local Supabase configuration enables it. The hook must
  also be enabled in any separately deployed environment; old tokens require
  refresh and are not a reason to restore a subject-as-account fallback.
- Sanctuary's resolver and shared identity/bootstrap schemas reject an account
  outside the registered UUIDv8 account profile. The generated ZenStack User
  model uses the database default. Shadow-account creation consumes the
  returned canonical ID instead of generating UUIDv4 in JavaScript.
- `20261025011000_user_profile_contract_convergence.sql` supplies the ten
  missing profile fields selected by the actual generated User model. Real
  ORM tests exposed this schema drift; mocks had not.
- Browser authorized entry now calls the declared read-only OpenAPI identity
  route. Both native and HTTP identity-bootstrap paths are admitted without an
  already selected scope. Optional SQL name fields are normalized to the
  response contract, and absent onboarding completion remains false.
- PowerSync validates the signed canonical claim against its account-bound
  connector; sync streams filter by that claim rather than the credential
  subject. Browser Self writes use the verified canonical claim. Capability
  hydration compares the resolved credential subject to the session, while
  reading entitlements for the separate canonical account. Guest-transfer
  domain writes resolve the canonical account after checking the conversion's
  credential subject; remote transfer remains governed by its existing policy.
- Every oRPC call now evaluates authorization. The previous mutable
  `__doubleGatePermitted` context flag could let a subsequent resource call reuse
  an earlier allow decision. Existing parent/teacher denial tests exposed and
  now reject that behavior.
- JWT admission requires valid subject/expiry/time claims, denies external
  OAuth client grants at the first-party boundary, and no longer accepts
  synthetic UUID bearer identities on a development server. Test harness
  identities remain test-only.

## Verification and limitations

| Evidence | Result | What it proves and excludes |
|---|---|---|
| G1 / Vitest 5.0.5 Node, complete Sanctuary suite | 763 assertions passed; six inherited skips, no new skips | Existing API contracts and denial/recovery assertions under their configured database/service substitutions. Not a hosted API or database proof. |
| G2 / PostgreSQL 17.6 + pgTAP, migration fixture | 28 assertions passed | A provider-coupled seeded schema rekeys atomically; assigned handles survive; domain FKs and private data follow; owner reads and other-account denial work; new-account creation, immutability, hook grants, unique issuance and clock failure behave as asserted. |
| G2 / Vitest + actual local PostgreSQL, synthetic RSA issuer | Five integration scenarios passed | Real resolver SQL, production-mode HTTP identity route/context/DTO, rejection of an unbound subject, generated ORM UUIDv8 defaults with transaction rollback, and 20 concurrent issuance transactions. JWT signing keys are synthetic; no real hosted issuer or browser/device ceremony. |
| G1 / Vitest, focused shared Core contracts | 56 assertions passed across seven files | Canonical normalization, browser entry mapping, UUID vectors, account-bound PowerSync behavior, and guest handoff guards under named mocks. No deployed sync service. |
| G1 / Vitest browser boundaries | 29 assertions passed across five files | Entry, Self request serialization, callback/signout/deletion contracts with substituted network/auth boundaries. No real Google/OTP login. |
| G3 / native Jest/Expo + React Native Testing Library 14 | Two assertions passed | Actual capability-provider mounting accepts a distinct credential/account pair and withholds hydration after a credential switch. Auth/store boundaries and native bridges are substituted; no physical device. |
| G0 / TypeScript | Core, Sanctuary API and browser checks succeeded during implementation | Static compatibility of the checked source. Not runtime or deployment proof. |
| G4 / Next.js 16.4.2 Turbopack | Production build succeeded, including TypeScript and 88 generated pages | Browser platform build compatibility; no authenticated browser/provider journey is implied. |

The PostgreSQL rehearsal uses isolated databases created from the running local
schema, never the shared database's account data. The source had zero accounts;
the scenario deliberately supplies two legacy accounts and one existing
side-ID. Extension-owned seed data and extension ACLs were excluded during
clone restoration; the test explicitly installs the required test role grants.
This is application schema/migration evidence, not a hosted Supabase role audit.

The real integration runner disables the normal global mock setup and refuses
a non-local URL or a database name without `test`. Set
`CANONICAL_ACCOUNT_TEST_DATABASE_URL` through the environment, then run:

```text
pnpm --filter @repo/sanctuary-api test:g2:canonical-account-pg
```

Its database must first contain the cutover migrations and seeded fixture. The
SQL fixture is
`apps/gurudevi-mobile/supabase/tests/migrations/canonical_uuidv8_accounts.test.sql`;
it takes psql variable `cutover_migration` and starts from the pre-cutover schema.
It requires a disposable test database because the migration commits its rekey.

The native provider test is part of `jest.native.config.cjs` and can be run with:

```text
pnpm --filter gurudevi-mobile exec jest --config jest.native.config.cjs --testMatch **/canonical-capability-hydration.native.jest.test.tsx --runInBand
```

ZenStack 3.9.8's ordinary generation command failed with TypeScript 7.1's removed
compiler API (`sys.fileExists`). Generation succeeded using the already installed
TypeScript 6.0.3 compiler API through a process-local Node resolution hook;
the workspace compiler pin and dependencies were not changed. Generated schema,
model and input files were formatted with the repository formatter and reviewed.

## Gates still open

- The full native application typecheck fails in existing entry/editorial and
  Community DTO/type seams. The new provider test's own missing Jest-module
  import was corrected to the harness's configured global types. Mounted
  native tests pass; full mobile compilation is not claimed.

- `check:anti-slop` stops at the native sentinel's findings in the existing
  dirty UI tree. `check:version-drift` also identifies deprecated symbols in
  pre-existing changed files; the touched identity contract's datetime calls
  were updated to the installed Zod API. No quality gate was disabled.
- `check:test-evidence` reports unclassified test scripts in `verger-core` and
  `verger-android`. They were not changed as part of this cutover.
- PowerSync CLI 0.10.0 cannot validate the stream against the linked instance
  because that instance is not provisioned. No cloud deployment was performed.
  The signed-claim connector contract is tested; deployed replication remains
  an explicit operational gate.
- Device-evidence attestation validates the repository's baseline fixture; it
  does not establish G5 evidence for this auth change.
- No hosted schema, Auth setting, cloud sync deployment, physical-device
  ceremony or production traffic was changed or verified. External OAuth is
  still disabled and requires its own consent/client isolation admission.

The final SQL replay additionally asserts that an editorial submission's
account owner follows the rekey while its independent author key is preserved.
The new account issuer is not an authenticated-client RPC. The baseline
device-evidence command and native seam scan passed; neither supplies physical
auth evidence. Workspace-wide `git diff --check` reports existing whitespace in
the runtime-performance index and push audit report; the scoped owned diff
passes whitespace checks.

## Supabase, Neon and PowerSync compatibility audit — 2026-10-25

The local [Supabase platform readiness audit](../../apps/gurudevi-mobile/docs/infra/2026-10-22-supabase-platform-evolution-and-gurudevi-readiness.md)
is the October 22 baseline. Its hosted migration counts and ACL inventory are
dated observations, not a fresh hosted audit. The current implementation does
not establish complete hosted compatibility.

| Boundary | Current conclusion | Remaining proof |
| --- | --- | --- |
| UUIDv8 / Supabase | Domain account UUIDv8 is separate from `auth.users.id` and JWT `sub`. The custom token hook adds `canonical_account_id`; it does not replace required Supabase claims. Local PostgreSQL migration/hook and API scenarios are recorded above. | Enable the hook on the target hosted project; exercise actual anonymous, OTP/social, refresh, deletion and account-switch ceremonies. |
| Supabase changelog | The announced October 30 new-object change concerns explicit Data API grants; direct ORM connections are unaffected by that change. Existing object grants remain. The migration grant gate now passes, after correcting its misclassification of `private.*` as `public.private`. | Reconcile actual hosted migration history; test intended grants and RLS denials under real roles. The static checker is deliberately bounded, not a SQL parser or complete exposure audit. Review the readiness audit's TLS/runtime and managed-schema items before release. |
| Neon database | The adapter uses the Postgres/ZenStack client. UUIDv8 itself does not couple account keys to the database vendor. | No Neon runtime is verified. Supabase-specific `auth.users` triggers, role grants, helper functions, hooks and extension dependencies prevent treating the full migration history as portable. Replacing the database host requires a target-specific schema/bootstrap and credential-binding provisioning path. |
| Neon authentication | Current Neon Auth is managed Better Auth, a different credential/session system. It is not an enabled alternate verifier here. | A future switch needs real issuer/signature/audience verification, provider bindings, lifecycle/link/recovery flows and client integration. No JWT-payload decoding substitute is admitted. |
| PowerSync | Sync Streams filter account-owned data with `auth.parameter('canonical_account_id')`. The earlier `auth.jwt()` expression was incorrect and has been corrected against current official documentation. Client credential checks still compare the provider subject and signed canonical claim separately. | CLI validation remains blocked: linked instance `69f985158d064eb85ee933e0` is not provisioned. Verify publication/replica identity, server query validation, two-account isolation, revoked membership, account switch/cache clearing, offline upload/retry and reconnect before calling sync operational. |

The audit found an authentication bypass in the former composite adapter:
Supabase rejection fell through to Neon/Databricks adapters that decoded JWTs
without signature verification (and accepted arbitrary `dapi` strings). The
composite now invokes only its explicitly configured verifier; unknown provider
configuration fails. Unimplemented Neon/Databricks auth ports throw named
configuration errors. This deliberately retires unsafe acceptance under the
user's approved pre-production break/fix policy. Database adapters remain separate.

PowerSync supports both Supabase and Neon Postgres. Its replicated read path
uses Sync Streams authorization independently of application RLS. Keeping
Supabase Auth while moving the database to Neon requires explicit Supabase JWKS
and accepted-audience configuration: the current `supabase: true` discovery
depends on a Supabase database URL. No service configuration was changed here.
Neon logical replication also keeps compute active; scale-to-zero cost
assumptions do not apply while that replication connection is open.

### Reconciled execution order

1. Keep canonical UUIDv8 `public.users.id`, provider-owned credential subjects,
   and server-owned provider bindings as the sole account contract. The former
   nullable side-ID/assignment plans are marked superseded. Retained old worker
   modules are unregistered and must not be run against the post-cutover schema.
2. Reconcile the hosted migration ledger, then rehearse the complete cutover and
   explicit grant/RLS contract in an isolated Supabase environment. The earlier
   cloned-schema rehearsal does not prove a fresh full-history bootstrap.
3. Exercise the real issuer/token-hook/API/client chain, including refresh,
   invalid signatures, deleted accounts, key rotation and session revocation.
   Review the API verifier's key/verified-token cache policy against the required
   revocation latency; JWT validity alone does not prove a live session.
4. Provision/validate the development PowerSync instance and prove replication,
   isolation and offline queue behavior against that actual deployment.
5. Finish credential linking/unlinking, recovery, recent-auth/MFA requirements,
   session/device management, abuse limits and operational alerts. Close the
   existing mobile compilation and quality-gate failures before release.
6. Admit external OAuth/OIDC separately with registered clients, redirect URI
   checks, PKCE, consent, client-aware scope/resource authorization, refresh-token
   handling and negative client-isolation tests. OAuth remains disabled today.

The [D1A API reconciliation plan](../architecture/2026-10-24-d1a-platform-domain-led-api-reconciliation-plan.md)
still governs capability ownership and v0/v1 admission. The account-key cutover
does not implement `/api/v1`, complete its capability ledger, or prove all API
families production-ready. Feed canonical account/lifecycle invariants into each
capability's DTOs, authorization and write/recovery tests rather than creating a
second identity authority during API versioning.

### Primary sources checked

Audit verification: G1 / API Vitest completed 113 files and 765 assertions,
with one file/six assertions retaining their existing skips. The focused
adapter/JWT rerun completed 32 assertions after the final adapter cleanup.
G1 / Node test runner completed three grant-checker fixture cases, including
continued rejection of ungranted public tables. These use substituted issuer
and database boundaries; they do not establish live provider or replication
behavior. G0 / API TypeScript succeeded; the migration grant gate succeeded.
The aggregate anti-slop gate remains red on existing native UI findings.
Raw owned diffs were inspected, including removed unsafe acceptance branches;
scoped whitespace checks succeeded. No hosted mutation was performed.

- [Supabase new-table grant change, April 28 / October 30, 2026](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- [Supabase custom access-token hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook).
- [Current Neon managed Better Auth](https://neon.com/docs/auth/overview).
- [PowerSync signed JWT parameters](https://docs.powersync.com/sync/streams/parameters).
- [PowerSync Supabase authentication discovery and explicit JWKS](https://docs.powersync.com/configuration/auth/supabase-auth).
- [PowerSync Neon integration and logical-replication constraints](https://docs.powersync.com/integrations/neon).

## Review boundary

The working tree contains extensive pre-existing concurrent changes. This
cutover preserves those edits. API fixture UUIDs were migrated without removing
assertions or adding skips. The account-key migration, client coupling fixes,
real-seam failures and their corrections are the owned delta; unrelated UI,
dependency, policy inventory and provider work is not claimed as this task's
delivery or evidence.
