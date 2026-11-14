---
title: "API Authority and Durable Operation Foundation"
status: "active"
created: 2026-10-30
updated: 2026-11-01
author: "Naveen"
scribe: "Codex"
tags: [api, security, cedar, database, idempotency, outbox, verification]
---

# Authority and durable operation foundation

The horizontal foundation now composes credential verification, live canonical
account/session checks, scoped Cedar decisions, account-scoped SQL, shared request
budgets and durable operation/effect primitives. The production contract admits only the read-only foundation procedures
`identity.session` and `identity.scopes`. Synthetic capabilities exercise mutation
and effect mechanisms; no teacher, principal,
bot or AI feature is thereby implemented. New migrations were executed only in
disposable databases; repository configuration is not a deployed system.

## Current evidence checkpoint — 2026-11-01

`pnpm --filter @repo/sanctuary-api test:database` completed **G2 / 3 files / 48
scenarios passed** against a randomly named disposable PostgreSQL database via
the configured Supabase pooler. The fixture applied the actual canonical identity
resolver and selected operation, effect, budget and RLS migrations; synthetic
ES256 signing keys, a minimal Auth schema and the isolated test capability remain
substitutions. The test and hook ceilings are 60 seconds for this remote-pooler
scenario; server-side statement and lock deadlines are unchanged. Earlier 20
second failures occurred with PostgreSQL sessions idle between queries rather
than blocked on database locks. This is G2 foundation evidence, not a hosted Auth
ceremony, full migration-chain, production capacity or deployment claim. The run
report is `reports/run-apps_sanctuary-api-foundation_database-report.txt`.

## Responsibility and authority

| Layer | Responsibility and limit |
| --- | --- |
| Zod v4 | Boundary validation; valid input does not prove permission |
| Canonical UUIDv8 | Immutable account identity; not a credential or role grant |
| Credential verifier | JOSE signature, configured issuer/audience/algorithm, expiry, role and required claims |
| Identity ledger/session | Current Supabase binding, live session/not_after, credential bans/deletion and account deletion |
| Cedar/ReBAC | Action/resource decisions from server-derived Bond and resource facts; missing facts/policy deny |
| ZenStack policies | Existing ORM data predicates remain authoritative for ORM access; this change does not replace them |
| PostgreSQL RLS | Account-scoped SQL runs under authenticated role and transaction-local verified claims |
| Privileged operation SQL | Explicit server-owned transaction; caller must reauthorize and scope every resource read/write |
| Drizzle/PowerSync | Mobile data/sync mechanisms; local policy and queues cannot grant server authority |

The old parity check wrongly required a same-named ORM model for every Cedar
resource. Six resources now have explicit SQL authorities in
`packages/policies/src/authorizationAuthorities.json`. The gate verifies referenced
table creation, RLS activation, revokes and declared owner policies. All other
Cedar, ORM and snapshot checks remain. SQL source classification is not live
privilege certification. UserRewards remains legacy and unadmitted; its RLS
activation preserves owner policies rather than aliasing it to a different reward
model. Receipt/outbox migrations now explicitly grant service_role while revoking
direct client roles.

## Authentication and scoped decisions

`API_AUTHENTICATION=required` composes the platform into the Node host. Configure
`DATABASE_URL`, `AUTH_ISSUER`, `AUTH_JWKS_URL` and `AUTH_AUDIENCE` through secret/
environment injection. Issuer and JWKS must be HTTPS with the same origin. The
verifier permits ES256/RS256 only; no shared-secret fallback or subject-as-account
fallback exists. Render declares required mode. Disabled mode serves transport health only; the production identity procedures
reject missing authenticated context. Bun local entry refuses required mode.

The signed `canonical_account_id` must match the live credential binding and the
registered account UUIDv8 profile. Neither client account IDs nor fabricated
in-process identity objects pass the factory's identity admission. Supabase
`session_id` must identify the credential's current session. Deleted/banned users,
missing sessions, expired not_after and deleted accounts fail closed. Supabase
inactivity cleanup timing is not inferred from row existence; hosted Auth
ceremonies and all project session settings need separate verification.

JWKS fetch has a three-second timeout and a 60-second cache. Readiness refreshes
stale keys. Cached key removal can lag for that window; a cached structurally valid
set does not prove current issuer availability or a matching usable key for every
token. Session/binding checks remain live. PostgreSQL queries use bounded statement,
lock and connection timeouts; AbortSignal checks do not forcibly cancel pg queries.
Readiness coalesces concurrent callers into one probe per platform instance. Each
caller may stop waiting independently; a five-second server deadline fails the
probe closed. Its slot remains occupied until all underlying database and key
checks actually settle, so timed-out work cannot accumulate through repeated
health calls. Successful results are not cached. This does not limit authentication
traffic, distributed instances or edge traffic.

`resolveScope` loads active date-bounded Bonds. Initial authoritative scope support
is SCHOOL and PERSONAL; other entity types deny until their mappings are supplied.
Principal PERSONAL scope denies explicitly. This does not create a principal
workspace or a new institutional/commercial rule. `authorize` reloads the Bond and
identity and obtains resource facts through a server-owned resolver, never HTTP
attributes. A policy engine failure returns unavailable, distinct from denial.

When supplied an active transaction client, identity/scope checks hold shared locks
on supporting account, credential, binding, session and Bond rows through commit.
An autocommit read cannot provide this guarantee. Authority validity uses the
current database clock rather than transaction-start time and is rechecked after
locks are acquired, so expiry during a wait is not accepted. Isolated PostgreSQL
scenarios cover session and Bond expiry in an open transaction and Bond expiry
while waiting for a row lock. This establishes validity at the check, not through
an arbitrarily long mutation or its commit; each capability must specify any final
recheck and lock its own authoritative resource facts. Obtain locks consistently
and keep transactions short; deadlock/lock timeout is a failure, not permission
to continue or blindly retry external work.

## Data access and request budgets

`withAccountData` starts one transaction, revalidates/locks the identity, installs
verified claims with transaction-local settings and switches to authenticated role.
Existing `public.get_my_id()` resolves the canonical account. This helper permits
writes but has no operation identity or receipt; it is not admitted as a durable
business-command boundary. A COMMIT error reports an uncertain outcome without
promising a recovery key. Commit/rollback clears claims and role before pool reuse.
A privileged connection does not gain this protection merely because a JWT was
verified elsewhere. OperationStore's
server-owned writes are a different seam and must carry explicit authorization
and resource constraints; they are not automatically protected by an ORM plugin.

The internal `executeAccountCommand` composes a verified active scope, a
mutation-capable Cedar action, a capability-owned scope derivation and the existing
receipt transaction. It runs the mutation with authenticated RLS claims, stages
bounded effects, verifies the database role is restored and flushes them before
commit. It reauthorizes and checks scope at each operation checkpoint. Isolated
PostgreSQL scenarios exercise RLS denial, replay, forged scope, action denial,
rollback and pooled-role cleanup using a synthetic capability. A real Node socket
scenario injects a lost COMMIT acknowledgment and verifies same-key replay with one
mutation, receipt and effect; it does not reproduce a real network partition. The
capability callback and raw SQL client are trusted server code, not a sandbox: admission must
prove its policy and locks cover the actual records and effects. No business command
is admitted by this mechanism. `withAccountData` remains write-capable and must not
be used as a substitute for durable-command admission. The host constructs a
request-context view exposing security and `executeAccountCommand`, without the
general helper or raw operation store. This reduces accidental access, but trusted
server modules can still import other facilities; future capability admission must
review those dependencies and verify its actual transaction and policy boundaries.
The composition audit checks the current native handler's explicit context shape;
it is not a proof of authorization or a sandbox for trusted code.

Required-mode readiness probes schema/control-table presence, resolver, relevant
grants/RLS, a Cedar self-check and the JWKS cache. It returns 503 on missing or
unsafe control-table configuration. It remains foundation readiness with two identity procedures and zero
business capabilities, not exhaustive schema validation or production assurance.

PostgreSQL enforces one fixed-minute budget per canonical account across instances.
`API_ACCOUNT_REQUESTS_PER_MINUTE` defaults to 120. Fixed windows allow boundary
bursts and are not a universal cost limiter. Untrusted proxy/IP headers never
become identity. Edge abuse protection, endpoint cost budgets and deployment
capacity need their actual consumers. Node bounds connections separately.
Runtime maintenance deletes at most 1000 budget rows older than ten minutes per
minute, using SKIP LOCKED; this is ephemeral control metadata, not receipt retention.

## Receipt and effect execution

`OperationStore.execute` validates JSON, fingerprints normalized scope/capability/
payload, and uses one PostgreSQL transaction for receipt reservation, mutation,
outbox insertion and committed result. It reauthorizes before receipt access and
again after locking and after mutation immediately before commit. Matching committed
work replays its result; changed payload/
scope conflicts; historical pending/failed work requires explicit recovery.
Callback work must be database-only, never a provider call inside the transaction.
The final authorization callback runs inside the same transaction; if it denies,
the receipt, mutation and outbox roll back together. Real PostgreSQL evidence covers
expiry during synthetic work. This narrows the expiry window but cannot guarantee
that time does not pass between the last check and COMMIT. The capability must
lock its own mutable authority and resource facts and define its release rules.

Canonical fingerprinting preserves own JSON keys such as `__proto__`; regression
tests cover a collision exposed during this work. Receipt keys are operation IDs,
not payload hashes or newly minted account IDs. A COMMIT response failure raises
`OperationOutcomeUnknown`; recover with the same key rather than assuming rollback.
Isolated PostgreSQL scenarios inject faults immediately before and after COMMIT and
check same-key recovery. A separate real Node loopback scenario disconnects a client
after a synthetic operation commits and checks replay with one mutation and effect.
These checks do not simulate a real database network partition or establish client
key persistence; each admitted command and client needs its own recovery contract.
No universal retention/expiry policy was invented. Existing account-delete cascade
remains; result/payload retention needs each capability's privacy requirements.

Outbox claim joins a committed receipt with matching account, capability and scope.
Workers use SKIP LOCKED, bounded attempts, leases and lock-token fencing. Lease
scheduling uses conservative monotonic deadlines derived from database time,
not assumed host clock synchronization. Acknowledgement and retry are fenced by
database time. Permanent authorization denial is distinct from a transient
authority outage, which backs off.

`dispatchDueEffects` runs a bounded poll for explicitly registered handlers and
reauthorizes every attempt. The dispatcher claims one effect immediately before each attempt; it does not
consume leases while effects wait in a local batch. The poll excludes already
claimed IDs and bounds expired-attempt cleanup. Claims order due pending work by
availability and expired recovery work by lease expiry, preventing an old unresolved
item from always jumping ahead based on its original creation time. This is not a
fairness or throughput guarantee under overload; the CASE order may require a sort
and needs representative query-plan and capacity evidence. No provider handlers or automatic
delivery loop are admitted. If a provider accepts a send but the database
acknowledgment fails, the poll reports uncertainty and retains the lease rather
than marking the send failed. An exception after dispatch begins likewise reports
uncertainty and retains its lease because the provider may already have accepted
work. Cancellation before dispatch can back off without sending. Either uncertain
lease can be reclaimed after expiry. The dispatcher identifies reclaimed work and
requires the handler to reconcile it before any further send: accepted work is
acknowledged using a provider reference; retry requires an explicit handler decision;
unresolved, malformed or unavailable recovery stays uncertain. The decision is not
proof of provider guarantees: admission still requires evidence of provider-specific
idempotency or reconciliation. Reconciliation-only claims do not consume delivery
attempts. Expired final attempts retain the existing failed/repair-needed state and
need an authorized repair path before provider admission. Provider acknowledgment
is not final delivery.

## Verification and operation

Use the package's `test` (G1), `test:socket` (G2) and `test:database` (G2) commands.
The database runner requires explicit caller opt-in:

```powershell
$env:API_DATABASE_CREATE_ACK = 'create-isolated-database'
pnpm --filter @repo/sanctuary-api test:database
```

The configured connection needs CREATE DATABASE authority for this test tool.
It creates a random `pjc_api_foundation_*` database, runs minimal auth fixtures,
the actual identity resolver and selected receipt/outbox/budget/RLS migrations,
then drops that database. It does not migrate application rows in the supplied
database. Each test also checks the actual connected database name before writing.
The runner logs the temporary database name for recovery after interruption;
hard process termination can prevent cleanup. Never run historical test configs
that drop/recreate public against the shared dev/prod connection.

G2 exercises real PostgreSQL, Cedar and native SDK, with synthetic keys/JWKS,
minimal Auth schema and in-memory HTTP for composed cases. Separate loopback tests
exercise actual Node sockets. Hosted sign-in/refresh/revocation ceremonies, the
complete migration stream, real deployment login grants, provider delivery, proxy/
container operation and R1 are unverified. CI uses disposable PostgreSQL 17.6 and
fixture roles; its declaration is not proof that a remote job has run.

Continue with the [runtime checkpoint](runtime-foundation.md),
[operation semantics](interoperability-and-operation-semantics.md) and PJC
`journey:api.secure_operations`. No interface or linked test alone proves a feature.

## Admitted native foundation procedures

`createV1Client` exposes `identity.session()` and `identity.scopes()` from the shared
Zod/oRPC contract and actual production router. Both require a verified credential.
Session output is only canonical `accountId` and JWT `expiresAt` (Unix seconds);
provider subject, tokens and profile contents are not returned. Scope output lists
only active, time-valid own Bonds, ordered by ID. Admission labels describe current
resolver support, not permission for every action. Unsupported scopes are visible
without becoming grants; principal PERSONAL is denied. Empty scope lists are valid.
No account minting, role assignment, workspace setup, mutation or provider delivery
is exposed by these read-only procedures. The source gate rejects unreviewed
procedure names and disconnected handlers; adding a business capability requires
its own contract, authority and behavior evidence.
