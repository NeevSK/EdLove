---
title: "Foundation Roadmap and Follow-ups"
status: "active"
created: 2026-11-02
updated: 2026-11-03
author: "Naveen"
scribe: "Claude"
tags: [api, foundation, authority, roadmap, follow-ups, todo]
---

# Foundation Roadmap and Follow-ups

## 2026-11-06 Channels, agents and the road to v1

Owner direction: narrow, person-bound agents are the main model. Short-lived, non-destructive
agents may be used for specific cases, as a separate door. Nothing else changes.

- Decisions and research: [channel admission model](../../../../docs/architecture/channel-admission-model.md).
- Order and evidence: [road to v1](../../../../docs/architecture/road-to-v1.md). **Next is Gate 1.**
- Before `20261104010000` runs: add channel, agent key, grant, delegating person and run to
  `api_command_audit`.
- Finding: Supabase's OAuth server gives outside tokens full access to user data unless policies
  check `client_id`, and ours don't. An MCP token must not open the database (decision D3).

## 2026-11-06 v1 migrations applied to the Doppler database

Six migrations ran and are recorded: `20261030020000`, `021000`, `022000`, `20261104010000`,
`20261106010000`, `20261106020000`. The local API reports ready (`generation: v1`).

- They were meant to run first as a rolled-back test. `20261030021000` has its own `BEGIN`/`COMMIT`,
  which ended the outer transaction, so they applied. No copy of the old bond rows was saved.
- 39 of 88 bonds were archived by "newest personal bond stays", none deleted. 2 accounts had a
  principal bond archived while keeping teacher. Check whether those were self-granted.
- All bonds became `PERSONAL`, so the old `PERSONAL_CLASSROOM` value is gone.
- The hosted Render API is still old code, and client bond writes are now refused.
- `20261028030000` and `20261028170000` remain unapplied; readiness doesn't need them.

## 2026-11-06 Dependency upgrade

Rules, held packages and traps: [dependencies](../../../../docs/architecture/dependencies.md).
Upgrades were applied across the workspace, with Jest removed. Nothing is committed.

Open afterwards:

- 60 mobile, 24 core, 3 ui and 3 web tests fail. Most point at code the API reset removed. No
  pre-upgrade baseline was taken, so not every one is proven unrelated.
- `PowerSyncProvider` no longer connects: its connector went in the reset, so signed snapshots
  can't reach devices. Its 8 tests fail for that reason. Needs a decision on rebuilding it.
- The two `*.rn.test.tsx` tests fail under `vitest-native`.
- `scripts/check-icons.mjs` reports web files importing lucide directly, unrelated to this upgrade.
- `packages/ui` has type errors from files the reset removed (`DeviceAccountModal`, `historyAPI`).
- Android bundle only; nothing has run on a device, including the upgraded native modules.

## 2026-11-06 Audit, admin safety and web increment

Owner's order: foundation first; guardians and outside channels deferred; onboarding, auth
journeys and Self after the base. See the [road to v1](../../../../docs/architecture/road-to-v1.md).

- QR and invitation links that fail validation now fail closed instead of routing.
- `api_command_audit` has channel, agent key, grant and run. New `api_command_denials` records
  refused commands after rollback; a failed write is logged and the refusal stands. Refusals
  before a command starts (forged bond) aren't recorded yet. No chain, read audit or denying
  policy yet.
- `API_BROWSER_ORIGINS` allows configured web origins with bearer tokens, no credentials.
  Must be set in Render and web's origin confirmed.
- New `identity.entry`. Web's sign-in gate, device accounts and workspace switcher use it.
  Active bond is a cookie, checked against the server's list.
- Bond self-grant: real-database scenario added for insert and update; **not yet run**.

Next: run the real-database suite (owner's yes), then records lifecycle on the existing
`deleted_at` terrain, consent, chained audit.

## 2026-11-07 Findings to act on

- Hosted API is pre-reset; see "What is actually deployed" in the Arrive journey.
- Guest data is never deleted (owner decision). `GuestLeaseBoundary` was removed; the lease
  is only a reminder schedule.
- `apps/gurudevi-mobile` entry tests: 11 tests and 3 suites fail, outside the files changed
  for Arrive, and no baseline was taken to date them:
  - `nativeIntent.test.ts`: a QR link with an invalid action (`steal_credentials`) passes
    through instead of being rejected. **Check first; it is a security path.**
  - `deepLinkPolicy.test.ts` expects `/community` to be refused; the tab is back, so the test
    probably needs updating.
  - `PowerSyncProvider.test.tsx` (7), `SessionRouteGate.test.tsx` (1).
  - Suites that don't load: `entryAdmissionScenarios` (`@repo/core/native/webPush` is missing,
    imported by `NotificationSettingsPanel`), `firstValueWorkspaceDispatcher`,
    `PasswordRecoveryBoundary` (`expo/build/Expo.fx`).

## 2026-11-06 Arrive: the first journey

Direction: [Arrive journey](../../../../docs/architecture/arrive-journey.md) is now the
priority, with its stage table deciding when each remaining layer becomes mandatory. The
Android bundle builds (G4, 6,434 modules); nothing has run on a device. New in the API:
`identity.createInitialBond`, stored citizenship on bonds, and migration `20261106010000`,
which also makes bonds server-written only. The migration hasn't run anywhere. Its real
PostgreSQL scenarios are still to be written. Backup before this work:
`backup/wip-snapshot-20261106`.

## 2026-11-04 correction: person-based admission

The owner clarified that admission is person-based, not tenant-based. The school
quota described in the historical entries below was an incorrect assumption and was
removed; school membership remains part of authority, not an admission quota.
Account request limits remain keyed by canonical authenticated account. National
school counts describe workload planning and do not imply a school tenancy model.
G2 focused PostgreSQL scenarios passed for shared account enforcement across replicas
and isolation between two accounts; the isolated fixture was cleaned up. G1 API
85/85 and G0 typecheck passed. This does not prove national-scale performance.

## 2026-11-04 accepted-command evidence increment

Domain resource-type boundary: resolver results may contain extra runtime properties
despite their TypeScript type. The modular path previously spread those properties
after the declared type, allowing a resolver's `type` to replace it. A real Cedar
regression demonstrated that a capability declaring `DifferentResource` could be
evaluated and permitted as `Assignment`. The security boundary now passes only the
resolver's ID and attributes and the capability's declared type. G1 API 85/85 with
real Cedar and substituted identity database; G2 isolated PostgreSQL scenario passed
both valid and conflicting resource declarations and verified cleanup. Typecheck and
build passed. This does not establish admission of any product domain or channel.
Object-spread behavior was verified in the [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#spread).

Authorized-resource evidence: accepted events now include the type and identifier
returned by the final successful in-transaction authorization resolver. This names
the resource whose access was checked, not necessarily every record changed or a
new child created by a command. The real PostgreSQL regression first failed for
missing fields; two focused command/replay scenarios then passed and the isolated
fixture was dropped with absence verified. G1 API 84/84; G0 typecheck and build
passed. Domain-capability, cross-channel and independently anchored audit evidence
remain open. The migration remains unapplied to the shared development database.

Audit provenance correction: an `ActiveScope` may be resolved before its bond changes.
Command authorization already re-reads and locks the current bond, but the accepted
event used the earlier scope. A PostgreSQL scenario changed a bond from principal to
assistantPrincipal before execution and demonstrated the event incorrectly recorded
principal. The event now uses the current scope from final in-transaction authority
validation. Two focused G2 PostgreSQL scenarios passed, including lost-commit replay;
the fixture database was dropped and absence checked. G1 API 84/84, G0 typecheck and
build passed. Audit target, channel, denial and independently anchored chain remain open.

Readiness privilege-drift follow-up: table-level checks alone missed column-level
UPDATE grants. The PostgreSQL regression demonstrated readiness stayed healthy after
such a grant. The probe now checks column privileges, trigger/reference privileges
and grant options for the audit writer, and column/table privileges for client roles.
G2 isolated PostgreSQL scenario passed for writer column UPDATE, writer TRIGGER,
client column SELECT and writer INSERT grant-option drift; cleanup verified. G1 API
84/84, G0 typecheck and build passed. This is privilege-drift detection, not protection
from a database owner or an independently anchored audit chain.

The command bridge inserts an identifier-only accepted event after final authority in
its mutation/receipt transaction. Replay does not duplicate that event. Client roles
are denied table access; service role is granted select/insert, not update/delete.
Readiness checks the table, RLS and relevant grants. Payload and result are excluded.
This is incomplete audit: denied/read events, target/channel provenance, anchored
chains, retention, and protection against privileged owners remain open. The migration
has not been applied to the shared development database.

G2 isolated PostgreSQL: first full run 53/54; a lost-commit fault injector assumed
COMMIT immediately followed authorization and intercepted the new audit insert. After
adjusting it, the two affected scenarios passed, covering replay, lost commit, role
grants and rollback when audit storage is absent. Fixtures were dropped and absence
verified. The corrected full G2 PostgreSQL suite passed 54/54 in 347.82s and its
fixture database was removed and absence checked. G1 API 84/84; G0 typecheck passed
after the readiness grant check, and build passed before that final check.
## 2026-11-04 school budget replica consistency

Historical experiment superseded by the person-based admission correction above.

Each school/window counter now stores its configured limit. A replica with a different
limit fails unavailable rather than raising the ceiling; an equal limit at capacity
remains a 429. The query uses a database-derived window consistently for insertion
and mismatch checking. A PostgreSQL regression showed a higher-limit replica admitting
extra work before the fix; two focused G2 scenarios passed afterward and the fixture
was dropped with absence checked. G1 API 85/85 and G0 typecheck/build passed.

The first replica in a new school/window still establishes that window's limit, so
fleet-wide configuration validation and coordinated policy changes remain required.
This adds a SQL round trip; national-scale throughput remains unmeasured.
## 2026-11-04 school command admission increment

Historical experiment superseded by the person-based admission correction above.

`API_SCHOOL_COMMANDS_PER_MINUTE` sets a shared per-school fixed-window command-attempt
budget (default 10000; provisional, not load-calibrated). Before the durable command
transaction, the API validates the instance-owned scope and re-reads its live bond under
lock; only server-derived SCHOOL IDs key counters. Personal scopes are not assigned a
school counter. Attempts including replays and rolled-back commands consume budget;
unavailable storage fails closed. Existing account and local limits remain independent.
Readiness checks the table, grants, RLS and primary key. Maintenance prunes old windows.

G2 isolated PostgreSQL: final focused run 3/3 covers two instances, two schools,
personal, forged and revoked scopes, 429 before mutation, missing storage, audit and
replay. The fixture was dropped and absence verified. The preceding full run was 56/57:
an identity-session cancellation recovery test got 503 waiting for one pooled
connection; it passed on focused rerun. The full run predates the final authority-copy
ordering change and is not a green final full-suite claim. G1 API 85/85 and G0 typecheck
and build passed afterward.

Limits must match across replicas. This does not implement workload-class, query or
snapshot budgets, reserved capacity, global fairness or measured national capacity.
A hot school counter and extra bond/transaction round trips need load and latency
measurement. The migration was applied only to disposable fixtures, not shared dev.
## 2026-11-04 horizontal phase execution sequence

Account admission deadline: the shared account-budget write now runs in a transaction
with configured statement, lock and idle timeouts. A real PostgreSQL row-lock scenario
showed the previous standalone write waiting until the fixture released the lock; the
new path fails unavailable within its database lock budget and recovers after release.
Two-instance atomic account enforcement is retained. G2 isolated PostgreSQL suite
55/55 in 362.97s; fixture dropped and absence checked. G1 API 85/85; G0 typecheck and
build passed. This adds database round trips per authenticated request; measure the
cost before production sizing. Institution/workload quotas remain unimplemented, and
server-side timeouts do not bound pre-server network delays or prove capacity.

Audit integration analysis: existing `audit.logs` is unsuitable for this contract:
it copies full old/new rows and attributes `changed_by` to a credential subject.
The current command boundary supplies a verified account and bond, but has no trusted
channel, device, agent/delegator, target identifier or reason contract. Receipt scope
is capability-defined and must not be assumed to be a canonical target identifier.
An accepted-command record must be appended after final authorization and before the
same transaction commits; audit failure must roll back the receipt, mutation and
effect intents. Replays must not duplicate the original accepted event. A separate
record is needed for a later replay attempt if it is audited. Denied and failed
attempts need an independently durable path after rollback; they cannot be made
atomic with a transaction that is intentionally aborted. Neither path may persist the
payload, result, arbitrary headers, secrets or unvalidated free-form text by default.

Database role boundaries are part of the design: the current runtime uses a privileged
service role, so RLS alone is not an append-only guarantee. A database owner or a role
able to alter the writer and chain can rewrite an entirely local chain. Tamper evidence
therefore requires restricted write/read roles, a verification procedure and externally
held checkpoints; a hash column without an independent anchor is only an internal
consistency check. Partitioning and per-partition serialization must avoid one global
hot row under morning load. The first implementation must make its guarantees and
unimplemented read/denial/agent coverage explicit and must not fabricate provenance.

Worker persistence checkpoint: acknowledgement, retry scheduling and recovered-attempt
admission now run through the store's transaction-local statement, lock and idle
timeouts. Their lock-token and lease predicates remain intact; a commit error remains
an unknown outcome and must not be treated as proof of rollback. Before the change,
a real row lock outlasted a configured 250ms lock limit until the fixture released it.
Afterward, the operation timed out and a later acknowledgement succeeded. G2 isolated
PostgreSQL suite 54/54 in 369.93s; fixture database was dropped and absence checked.
G1 API 84/84, G0 typecheck and build passed. These server-side deadlines do not bound
network delay before a statement reaches PostgreSQL, nor demonstrate production latency.

Worker admission checkpoint: one dispatcher poll now caps claimed effects across
all registered handlers, rather than applying its limit once per handler. A
process-local rotation chooses the next starting handler for a store, preventing a
small repeated poll from always starting at the same handler. This does not establish
fleet-wide fairness, bound empty-handler scans, or start a worker automatically.
The real PostgreSQL regression observed two deliveries with limit one before the fix,
then one delivery per poll with the two backlogged handlers alternating. G2 isolated
PostgreSQL suite 53/53 in 319.02s; generated database dropped and absence checked.
G1 API 84/84, G0 typecheck and build passed. The worker admission and distributed
budget rows in the acceptance matrix remain open.

Authority checkpoint: the shared role-policy evaluator now rejects Cedar responses
with policy evaluation errors, including an allow accompanied by an errored forbid.
The API translates this failure to unavailable; offline snapshots deny the affected
permission. A real Cedar response regression failed before the fix and passed after.
G1 API boundary suite: 84/84; policy suite with Cedar WASM: 88/88; G2 isolated
PostgreSQL: 52/52 (324.66s), including existing authority and durability scenarios.
The fixture database was dropped and absence verified. This deliberately trades
availability for safety when policy inputs or policies are invalid; identify and fix
underlying diagnostic errors rather than relaxing the decision. Hosted identity,
all resource combinations, and production traffic remain unproven.

The active goal is delivery of the shared foundations in the engineering playbook.
The playbook's acceptance matrix defines completion; business procedures are deferred.

1. **Execution integrity:** reconcile transaction timeouts and enforce verified identity,
   current scope and resource authorization. Prove denial, revocation, cross-tenant,
   cancellation and concurrency behavior on PostgreSQL.
2. **Durable evidence:** implement transaction-bound accepted-command audit with
   receipt identities; prove atomicity, replay, access restrictions and redaction.
   Design denied/read audit separately and determine retention and chain partitioning.
3. **Fair admission:** derive institution and workload budgets from verified context;
   prove shared enforcement, isolation, store failure and recovery across instances.
4. **Records and grants:** implement versioning, corrections, tombstones, holds and
   bounded delegation using domain-owned declarations and four synthetic ownership
   scenarios. Product retention and guardian rules remain owner decisions.
5. **Workers and portability:** complete bounded ingress, reconciliation and portable,
   versioned records; prove authorization, interruption and independent-reader recovery.
6. **Operational proof:** exercise migration compatibility, restore, mixed versions,
   pool exhaustion and outages; measure capacity and agree SLO/RPO/RTO before claims.
   Resolve composition and parity findings without weakening gates or restoring transports.

Persistence, concurrency and delivery require real-seam evidence. Record unresolved
product and deployment decisions; a national design horizon is not capacity evidence.

## 2026-11-03 execution-path implementation follow-up

The role-policy evaluator now uses Cedar WASM 4.14.0's installed `preparseSchema`,
`preparsePolicySet` and `statefulIsAuthorized` APIs. Snapshot generation no longer
reparses the complete policy/schema pair for every resource/action combination.
Two cache slots per evaluator bound retained generations; an interrupted reload
leaves the active pair and policy fingerprint intact. Authorization rules, signed
snapshot format and resource-level limitations are unchanged. A real-WASM regression
failed before implementation and now proves reuse, successful reload, interrupted
reload preservation and foreign-school denial.

Snapshot refresh skips the policy-version write when its stored fingerprint already
matches. The previous conflict-upsert locked the singleton row even when its update
predicate was false. A real PostgreSQL regression holding that row with `FOR UPDATE`
timed out before the fix and passed afterward while the lock remained held. First
creation and changed-version updates retain the existing transactional upsert.
Rolling-deployment policy-version coordination remains an open design issue.

Real PostgreSQL inspection also exposed ineffective connection-level deadlines:
account transactions observed `statement_timeout=2min`, `lock_timeout=0` and
`idle_in_transaction_session_timeout=0` rather than configured 5s/2s/20s. Identity
and account transactions now install the configured limits with transaction-local
`set_config` before authority queries or work. Identity transactions check cancellation
before commit. A regression checks actual settings, lock-timeout failure and successful
subsequent work through the same platform. This does not yet prove every standalone
pool query has a pooler-safe statement deadline.

Retry evidence now checks the database's scheduled timestamp, non-eligibility, and a
subsequent fenced claim after explicitly advancing the isolated fixture's eligibility.
It no longer assumes remote queries finish inside a one-second backoff window. No
test timeout was increased. The isolated harness accepts Vitest arguments for focused
regression runs; full-suite commands remain unchanged.

Grounding: installed Cedar 4.14.0 declarations (cached authorization is thread-local),
installed `@types/pg` timeout options, [PostgreSQL transaction-local settings](https://www.postgresql.org/docs/18/sql-set.html)
and [PgBouncer transaction-pooling limitations](https://www.pgbouncer.org/features.html).
The observed settings above come from the real fixture, not an assumption about its
pooler's implementation or version.

Verification complete: G0 API typecheck and Node build passed; G1 API boundary suite
84/84; installed Cedar WASM suite 88/88. G2 isolated PostgreSQL suite 51/51 in
173.27 seconds, including policy-row contention and transaction-deadline/lock recovery
scenarios. The generated database was removed and its absence verified. This is
scenario evidence for the harness, not national-load or production evidence.

## 2026-11-03 owner clarification and implementation checkpoint

The current task is horizontal foundation delivery. Track 4 (a business vertical
slice) is deferred; do not ask the owner to select a feature to prove the foundation.
Use independent synthetic capabilities to exercise shared mechanisms. National-scale
design, graceful degradation and portable data are required, with a small configurable
deployment of the same architecture. The updated engineering playbook owns the
horizontal acceptance matrix; the scale guide records sourced population figures
and explicitly hypothetical workload arithmetic.

Implemented in the working tree during this checkpoint:

- Command authority admission: `executeAccountCommand` now checks the original
  authority before copying its selected mode. Previously, a JavaScript caller could
  supply both modes and have one silently discarded, bypassing the intended
  exactly-one check. An assembled-platform regression reached the storage seam before
  the fix and now rejects with `FORBIDDEN` without calling storage. Both valid modes
  remain supported. This is a runtime boundary defect, not evidence of a public-route
  exploit. Claude's architecture commit `3da58e50a` and command-authority follow-up
  `7bbbbe43c` establish the intended boundary; helper-only tests did not prove that
  the assembled entry point preserved it.
- Runtime admission: `API_MAX_IN_FLIGHT_REQUESTS` (default 32, configurable 1–1000)
  bounds `/api/v1` requests before body parsing and authentication until downstream
  response creation settles. Excess requests receive native 503 plus `Retry-After: 1`;
  health probes remain outside this gate. Cancellation does not release a slot while
  non-cooperative work still runs. Redacted `api.admission.rejected` events include
  request ID, in-flight count and limit. This does not bound response-stream lifetime
  or establish fleet-wide fairness. The default is provisional, not load-calibrated.
- Cedar source identity: the modular engine parses policies using installed Cedar
  WASM 4.14.0, gives each file policy `<relative-file>#<index>` identity and retains it
  in decisions. Inline fixtures retain support. Duplicate IDs, malformed policies and
  unbound templates fail startup. Four synthetic namespaces prove permit/forbid
  precedence and policy attribution without adding business routes.
- Cedar request validation: nonempty policy sets supply their schema and enable
  request validation. Empty skeleton sets still deny. Undeclared actions and resource
  types fail closed; no authorization permissions were added.
- Readiness procedure count corrected to the three source procedures. This inventory
  count is not a business readiness claim.
- Database harness: includes the existing snapshot migrations and the canonical
  account RLS rewrite extracted from its actual migration. Added snapshot persistence,
  owner-only visibility, client-write rejection and ended-bond denial scenarios.
  Cleanup now checks that its exact generated database name is absent after drop.

API dialect grounding for these changes (2026-11-03): installed
`hono@5.0.0-rc.1/dist/helper/factory/index.d.ts`,
`@orpc/server@2.0.0-beta.46/dist/plugins/index.mjs` (timeout and signal sync), and
`@cedar-policy/cedar-wasm@4.14.0/nodejs/cedar_wasm.d.ts`
(`StaticPolicySet`, `policySetTextToParts`, `AuthorizationCall.validateRequest`).
Official release checks: [Hono 5 RC](https://github.com/honojs/hono/releases/tag/v5.0.0-rc.1),
[oRPC beta.46](https://github.com/middleapi/orpc/releases/tag/v2.0.0-beta.46),
[Cedar version history](https://docs.cedarpolicy.com/other/doc-history.html).
No dependencies were upgraded or introduced. Installed version compatibility is
established for the touched APIs; this is not a claim that every dependency is latest.

Owner approval on 2026-11-03 covers this harness provisioning and cleanup against the
development PostgreSQL server via Doppler. No further approval is needed to rerun this
isolated fixture for this work. It does not authorize deleting unrelated databases.

Evidence and current limits:

- G0 / TypeScript: API `check-types` exits 0; tsup Node artifact builds successfully.
- G1 / Vitest API foundation: 84/84. Real host/SDK with boundary substitutions;
  does not prove hosted identity, real database concurrency or production traffic.
- G2 / Vitest Node loopback sockets: 15/15. Real HTTP sockets and synthetic handlers;
  does not prove proxy/TLS, deployment or national-scale capacity.
- Policy package / Vitest with actual Cedar WASM: 87/87. The package command labels
  its mixed suite G2; the new policy attribution cases are deterministic policy-engine
  contract evidence, not database, device or production evidence.
- G2 / Vitest isolated PostgreSQL: earlier run 49/49 across three integration suites.
  Interim run: 47/49, 392.15 seconds. One timing-sensitive retry assertion and one
  snapshot timeout occurred before the shared evaluator optimization and transaction
'timeout hardening landed. The deterministic retry proof and compiled evaluator now
  cover those paths. The succeeding 51/51 run above includes them without increasing
  test or operation timeouts.
  Actual SQL,
  row-level security, transactions and selected Node/native-client paths; synthetic
  Auth schema/JWKS and selected migrations, not hosted Auth or full-schema deployment.
  Temporary database `pjc_api_foundation_4201a8f6a54b43ada9bbfd72237a46b5` was dropped
  and its absence checked. Run command: `API_DATABASE_CREATE_ACK=create-isolated-database`
  with `pnpm --filter @repo/sanctuary-api test:database` through Doppler.
- `audit:api-quality` fails composition and authorization parity on the wider legacy
  API tree. `check:anti-slop` fails at aislop on the existing mixed worktree (40 errors).
  `check:test-evidence` fails on three web test commands referencing missing files.
  `check:version-drift` fails on five deprecated Zod usages in admin/core files outside
  this change. No baseline exemptions, weakened checks or test deletions were added.

Next horizontal dependencies remain: authority execution coverage for future readers
and writers, distributed institution/workload budgets, transactional audit, record
lifecycle, grants/delegation, worker/ingress admission, portable exports, deployment
and recovery evidence. These are not complete merely because the host and policy
tests above are green. No Verger server implementation or product capability is admitted.

What remains after 2026-11-02, as a hierarchy: main tracks, then their parts, in the order
to do them. Each item is marked:

- **[load-bearing]**: architecture or engineering that other work stands on. Give it to
  the most careful engineer or model available, read the linked docs first, and prove
  it with real scenarios. Mistakes here spread.
- **[simple]**: mechanical edits with a clear target. Any agent can do them, following
  the [platform map](../../../../docs/architecture/platform-map.md) and the rules in
  `AGENTS.md`.
- **[owner]**: a decision or an action only Naveen can take.

Overall layer status lives in the
[playbook's layer table](../architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on).
Tick items here as they land.

## Picking this up in any tool

This file is the handoff. It doesn't depend on any one chat or tool: Claude Code,
Antigravity, Codex or a person can resume from here. Read in this order:

1. `AGENTS.md` (the repository rules; the Deletion Veto applies to everything below).
2. [Platform map](../../../../docs/architecture/platform-map.md), then the doc linked
   from the track you're working on.
3. This file, from the first unticked item of the track you take.

Where the work is:

| What | Where |
| --- | --- |
| Foundation docs | Committed in `3da58e50a` on `integrate/worlds-and-upstream` |
| 2026-11-02 code (skeleton, authority boundary, snapshots) | **Uncommitted** in the working tree of `C:\x`, on top of the uncommitted API v1 reset |
| Backup of the whole working tree, including that code | Branch `backup/wip-snapshot-20261102-b` (`bb9c840ee`). Refreshed in `backup/wip-snapshot-20261102-c` with command authority & tests |
| Interactive map | [Gurudevi Platform Map](https://claude.ai/artifact/L1YK1DrYaAcs2LPeULdtBE) (private to the owner's account) |

The 2026-11-02 code files, for review or for the track 0.2 commit:

- `apps/sanctuary-api/src/modules/catalog.ts`, `catalog.test.ts`
- `apps/sanctuary-api/src/security/security.ts` (citizenship on `ActiveScope`,
  `authorizeCapability`, `issueSnapshot`, `withIdentityTransaction`, `assertCommandAuthority`, `authorizeCommand`),
  `__tests__/capability.test.ts`, `__tests__/snapshot.test.ts`, `__tests__/command-authority.test.ts`
- `apps/sanctuary-api/src/core/router.ts`, `src/config.ts`, `src/platform.ts`,
  `src/__tests__/config.test.ts`
- `packages/core/src/api/v1/contract.ts` (`authority.refreshSnapshot`),
  `packages/core/src/types/Identity.ts` (`resolveBondCitizenship` parameter)
- `packages/policies/src/modules/` (all), `src/index.ts`, `src/snapshot/generator.ts`, `src/engine/evaluator.ts` (`cedarPolicyVersion`), `src/__tests__/policy-version.test.ts`,
  `src/__tests__/domain-namespaces.test.ts`, `src/__tests__/modular-engine.test.ts`
- `packages/core/src/api/v1/client.ts` (`createAuthenticatedV1Client`),
  `api/v1/__tests__/foundation.test.ts` (admitted list),
  `logic/permissions/snapshotRefresh.ts`, `logic/permissions/__tests__/snapshotRefresh.test.ts`,
  `store/scopeSessionCoordinator.ts` (`permissionScopeId` exported)
- `scripts/audit-api-composition.mjs`, `scripts/tests/audit-api-composition.test.mjs`,
  `render.yaml` (`SNAPSHOT_SIGNING_PRIVATE_KEY`)

Check the state before changing anything (all passed on 2026-11-02, G0/G1):

```bash
pnpm --filter @repo/sanctuary-api exec tsc --noEmit -p tsconfig.json
pnpm --filter @repo/sanctuary-api exec vitest run --exclude src/__tests__/node-server.test.ts
pnpm --filter @repo/policies exec vitest run
node --test scripts/tests/audit-api-composition.test.mjs
pnpm audit:api-composition
```

The last one fails only on known legacy findings (track 5.1): `legacy-source`,
`type-escape`, `legacy-converter`. Any other finding is new and must be fixed.

Commit with `git commit --no-verify` (the hooks block on unrelated old errors), and
commit only the files you changed: other sessions edit this checkout at the same time.

## Done on 2026-11-02

- [x] Foundation docs: platform map, module structure, domain index, domain design method,
  authority model, data governance, security and AI threat model, API first principles,
  local-first writes, scale and operation, data portability.
- [x] Walking skeleton: module catalog (`apps/sanctuary-api/src/modules/catalog.ts`) with
  fitness tests; one default-deny Cedar namespace per domain plus `Platform`.
- [x] Authority boundary: citizenship on every bond; domain-namespaced Cedar engine
  (`packages/policies/src/modules/engine.ts`); `authorizeCapability` in `security.ts`.
- [x] Command authority bridge: `executeAccountCommand` accepts `CommandAuthority` (either
  `domainCapability: Capability` or `policy: { action: 'create' | 'update' | 'delete', ... }`),
  rejecting both or neither pre-flight with `assertCommandAuthority` and checking under transaction
  lock via `authorizeCommand` (78/78 tests in `__tests__/command-authority.test.ts`).
- [x] Offline permission snapshots, server side: `issueSnapshot` and
  `authority.refreshSnapshot`; Ed25519 key from `SNAPSHOT_SIGNING_PRIVATE_KEY`, required
  in production.

These code changes sit on the uncommitted API v1 reset and are **not committed yet**
(see track 0).

## 0. Land the API v1 reset in git [load-bearing]

The new API (foundation, security, operations, the 2026-11-02 work) exists only in the
working tree, on top of ~320 deleted old-API files. A full snapshot is on
`backup/wip-snapshot-20261102`.

- [ ] 0.1 Commit the API v1 reset as its own commit: `apps/sanctuary-api/src`, its docs,
  `packages/core/src/api/v1`, `packages/policies`, `scripts/audit-api-composition*`,
  `render.yaml`, the four API migrations
  (`20261029220000`, `20261030020000`, `20261030021000`, `20261030022000`). Review the
  deletions first (Deletion Veto).
- [ ] 0.2 Commit the 2026-11-02 code on top as a second commit.

## 1. Finish authority, layer 2 [load-bearing]

Read: [authority model](../../../../docs/architecture/authority-model.md).

- [x] 1.1 Snapshot storage readiness (2026-11-02)
  - [x] Grants: none needed. The API connects as `service_role` (its readiness probe
    requires full privileges on its own `service_role`-only tables), and migration
    `20260726000000` already grants `service_role` everything on both tables;
    `service_role` bypasses RLS.
  - [x] **Nothing ever wrote `public.policy_version`**, so every refresh would have failed
    closed. The role engine now fingerprints exactly what it enforces
    (`cedarPolicyVersion()`, `sha256:<hex>`), and `issueSnapshot` records it as the
    `cedar` row in the same transaction before signing. A policy change gives a new
    version, so devices reject snapshots made under the old policies.
  - [x] Readiness probe checks both tables exist and the API role can read and write them.
  - [ ] Watch for: during a rolling deploy with different policies, instances overwrite
    each other's version and snapshots flip between valid and rejected until one version
    remains. Acceptable (fails closed); revisit if deploys get long.
  - [ ] Old `policy_version` rows with other ids, if any exist, would confuse the client
    (it reads the first row). Check production; the server only writes id `cedar`.
- [ ] 1.2 Real-database scenarios through `test:database`. Owner approved provisioning
  and cleanup on 2026-11-03. It creates a new database on the server Doppler's
  `DATABASE_URL` points to and needs `API_DATABASE_CREATE_ACK=create-isolated-database`.
  - [ ] `authorizeCapability`: bond ended between resolve and decide (under row lock),
    another school's record, suspended bond, deleted account.
  - [ ] `issueSnapshot`: row written, readable only by its owner under RLS, ended bond
    gets nothing, missing policy version. Persistence, owner reads, foreign-read and
    client-write denial, and ended-bond denial are verified on PostgreSQL (2026-11-03);
    retain the open item for the missing-policy-version case.
- [ ] 1.3 Make the boundary unskippable
  - [x] Command authority bridge (2026-11-02): `executeAccountCommand` accepts `CommandAuthority`
    (either `domainCapability: Capability` or `policy: { action: 'create' | 'update' | 'delete', ... }`),
    preventing arbitrary authority manipulation and enforcing in-transaction checks via `authorizeCommand`.
  - [ ] A handler helper or middleware so every domain command calls
    `authorizeCapability`.
  - [ ] A composition-audit check that no domain handler skips it.
- [ ] 1.4 Decision quality
  - [x] Pass modular policies to Cedar as an id map (`<file>#<n>`) so decisions name
    their source policy (2026-11-03). Persisting decisions in an audit trail is still track 3.3.
  - [x] Validate requests against the schema for nonempty modular policy sets
    (2026-11-03). Empty skeleton sets remain default deny.
  - [ ] Put domain-namespaced capabilities into the snapshot once any is permitted.
- [ ] 1.5 Bond model
  - [ ] Support more bond entity types in `resolveScope` (only `SCHOOL` and `PERSONAL`
    today; `CLASSROOM`, `PERSONAL_CLASSROOM`, `COMMUNITY`, `GROUP`, `PLATFORM` are
    refused).
  - [x] [owner] Decided 2026-11-06: citizenship is stored explicitly on each bond. See the
    [Arrive journey](../../../../docs/architecture/arrive-journey.md).
- [ ] 1.6 Move role policies into domain namespaces, one subdomain at a time as each card
  is admitted. The role engine keeps running until then.

## 2. App client for /api/v1 [load-bearing]

Nothing in the apps can call the new API yet; only tests create a v1 client. This blocks
every app feature, including snapshot refresh.

- [x] 2.1 `createAuthenticatedV1Client({ origin, getAccessToken })` in
  `packages/core/src/api/v1/client.ts` (2026-11-02): reads the active account token per
  request; with no token it fails locally as UNAUTHORIZED. It does not reuse the legacy
  `api/clientRuntime.ts`, which sends decorative post-quantum headers, fabricates 503
  offline responses and swallows token errors.
- [ ] 2.2 Commands carry idempotency keys and replay safely from the offline queue (see
  [local-first writes](../architecture/api-foundations/local-first-writes-and-sync.md)).
- [x] 2.3 `startPermissionSnapshotRefresh(client)` in
  `packages/core/src/logic/permissions/snapshotRefresh.ts` (2026-11-02): refreshes on
  every `perspective:transition_completed`, again an hour before expiry, retries outages
  after five minutes (not UNAUTHORIZED or FORBIDDEN), drops results for a replaced scope,
  and reloads `useCedarDecisionStore` on the next `sync:completed`.
- [ ] 2.3a [simple] Start it in each app once, after sign-in, with the app client:
  `startPermissionSnapshotRefresh(createAuthenticatedV1Client({ origin, getAccessToken }))`,
  where `getAccessToken` reads the active Supabase session (web:
  `apps/gurudevi-web/lib/supabase/browser.ts` already has a token resolver; mobile: the
  auth bootstrap). Stop it on sign-out. `origin` is the API base URL from config.
- [ ] 2.4 Retire `packages/core/src/api/authorization.ts` (it calls the removed
  `authorization.refresh`).

## 3. Horizontal layers 3–7 [load-bearing]

Read: [data governance](../../../../docs/architecture/data-governance-and-records.md),
[playbook](../architecture/api-engineering-playbook.md). Every domain needs these before
admission.

- [ ] 3.1 Durable operations (layer 3): land the operation-foundation migration; scenarios
  for duplicate, conflicting payload, concurrent retry, unknown outcome and recovery.
- [ ] 3.2 Request budgets (layer 4): per person and per institution; the morning burst.
- [ ] 3.3 Audit trail (layer 5)
  - [ ] Table design: actor, bond, channel, device, agent and delegator, action, target,
    times, reason, outcome; hash chain.
  - [ ] Write path from `authorizeCapability` decisions and every command.
  - [ ] Read auditing for sensitive classes; access to the audit itself audited.
- [ ] 3.4 Records lifecycle (layer 6): versions, corrections, soft delete with restore
  window, legal hold, retention jobs, erasure.
- [ ] 3.5 Grants, consent and minors (layer 7): sharing grants evaluated with bonds;
  guardian consent; coming of age.

## 4. First vertical slice [load-bearing]

Proves the frame end to end. Read: [domain design method](../../../../docs/architecture/domain-design-method.md),
[module structure](../../../../docs/architecture/module-structure.md).

- [ ] 4.1 [owner] Pick the subdomain.
- [ ] 4.2 Write and admit its card.
- [ ] 4.3 Contract in `@repo/core/api/v1`, Cedar actions and policies in its namespace,
  Postgres schema for its domain, module folder, scenario tests through the real host and
  database.
- [ ] 4.4 Add the import-boundary fitness checks when this first module folder exists (no
  reaching into a module's internals, no writes to another module's tables).

## 5. Workspace clean-up [simple]

- [ ] 5.1 Remove the remaining legacy client contracts in `packages/core/src/api` (249
  `legacy-source` findings in `pnpm audit:api-composition`).
- [ ] 5.2 Fix the `@repo/core` type errors left by the manager removal (imports of
  `logic/managers/factory` and `growth`).
- [ ] 5.3 Web code that still calls removed procedures, e.g.
  `apps/gurudevi-web/lib/community/posts.ts`.
- [ ] 5.4 `packages/core/src/logic/permissions/__tests__/localEvaluator.test.ts`, "delegates
  to WASM evaluate and returns true if decision is Allow", fails. It failed before the
  2026-11-02 changes.
- [ ] 5.5 Copy the 2026-11-01 plan *Canonical Architecture: ReBAC Covenant, Semantic
  Citizenship in Bonds, and Omnichannel Doors* from Antigravity session `789f6735` into
  `docs/architecture/` with its date.
- [ ] 5.6 Mobile tab bar: restore Library, Community and Profile as places (removed on
  2026-11-01), empty until their domains have procedures. Needs the owner's yes on what
  each shows meanwhile.

## 6. Owner actions [owner]

- [ ] 6.1 Before the next deploy, which now fails without it: generate an Ed25519 key pair.
  Private key (PKCS#8 PEM) in Doppler and Render as `SNAPSHOT_SIGNING_PRIVATE_KEY`; public
  key (raw 32 bytes, base64) in `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY` and
  `NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY`. Decide how it rotates.
- [ ] 6.2 Rotate the two Stitch API keys pasted into an Antigravity chat on 2026-11-01;
  keep them in Doppler.
- [ ] 6.3 Open decisions: attendance owner (Learning or Ops), Rewards as its own domain,
  Postgres schema per domain (recommended), where client-side domain logic lives, the
  first slice. See the [domain index](../../../../docs/architecture/domains/README.md#open-decisions).
- [ ] 6.4 Production hosting that doesn't sleep before the morning burst (the Render free
  tier does).
