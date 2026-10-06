---
title: "Environment Topology, Dependency Promotion, and Production-Safety Guide"
status: "active"
created: 2026-09-28
author: "Naveen"
scribe: "Codex"
tags: [architecture, environments, staging, production, testing, operations]
---

# Environment Topology, Dependency Promotion, and Production-Safety Guide

## Purpose

This guide gives the platform one understandable way to operate local tests,
staging, and production without creating a full copy of every external system.
It is a dependency-management plan, not a requirement to provision all
services today.

The immediate safety problem is that the currently linked managed Supabase
database is production-equivalent for writes. The immediate scaling problem is
configuration sprawl: Supabase, Sanctuary API, web/mobile apps, PowerSync,
hosting, telemetry, flags, push, email, and AI providers can each have their
own credentials and failure modes.

The answer is **progressive environment promotion**: introduce a dependency
into an environment only when an owned user journey requires real evidence for
that dependency. Production remains a protected destination, never the default
test environment.

## Non-negotiable boundary

Production is for real users and controlled operational assurance. It is not
a shared development, migration-experiment, seed-data, or integration-test
database.

| Activity | Local disposable | Isolated staging | Production |
| --- | --- | --- | --- |
| Schema reset and seed data | Allowed | Never by reset; use controlled migration only | Prohibited |
| Synthetic test accounts | Allowed | Allowed, with a visible `e2e` namespace | Prohibited unless a narrowly approved production smoke account is necessary |
| API integration test | Required first target | Selected smoke target | Prohibited |
| Browser/device journey | Optional | Selected high-value journeys | Release-only, controlled and non-destructive |
| Manual SQL / dashboard schema edit | Prohibited | Prohibited | Prohibited |
| Tracked migration | Allowed to validate | Required before production | Explicitly approved promotion only |

An R1 production check may read health/telemetry or exercise a deliberately
non-destructive, approved smoke path. It cannot substitute for local or
staging test evidence, and it never uses arbitrary real-user accounts.

## Intended topology

```text
                           tracked migrations + config contract
                                         |
        +--------------------------------+--------------------------------+
        |                                |                                |
 Local disposable                   Isolated staging                  Production
 Supabase CLI + Docker              separate cloud project             separate cloud project
 local API process                  staging API/deployment              production API/deployment
 synthetic local identity           synthetic e2e identity              real identities/data
 resettable                         migration + smoke target             protected promotion target
```

The affordable baseline is one production project, one separate staging
project, and local Supabase for integration tests. Local is the test tier; a
third hosted cloud project is not required merely to run tests.

On a free hosted plan, staging may be paused after inactivity. Treat that as a
known operational limitation: a paused staging environment is unavailable and
must be resumed deliberately; it is not a reason to point tests at production.
See [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## Explore, guest, and developer sandbox are different sessions

Gurudevi already has an accepted product model for this. The public `/explore`
experience is the real user-facing practice space; it is not the engineering
local-test sandbox, staging, or a new server-side production sandbox realm.
The controlling record is
[`2026-09-14-sanctuary-explore-access-and-persistence.md`](../decisions/2026-09-14-sanctuary-explore-access-and-persistence.md).

| Session | Identity and persistence | Safe user purpose | Prohibited by default |
| --- | --- | --- | --- |
| **Explore** | No Supabase identity. Versioned baseline fixtures plus a private, namespaced browser/device-local adapter. | Immediate public practice, discovery, and local creation. | API writes, cloud records, outbox items, PowerSync, background sync, paid/provider effects, and silent discarded-success behavior. |
| **Guest local-first** | Explicit anonymous identity with a fifteen-day device-local lease; eligible records may later be claimed by an account. | A deliberate temporary local journey, chiefly the mobile model. | Cloud writes, shared records, foreground mutation draining, feature hydration, and PowerSync before a real account exists. |
| **Guest cloud** | Future explicit anonymous Supabase identity with a separately approved capability policy. | Possible future cross-device trial. | Broad rollout or inferred access merely because `/explore` was opened. |
| **Account** | Authenticated durable identity and server-authorized data. | Sync, sharing, collaboration, billing, and durable work. | Access beyond its server-authorized scope. |
| **Developer sandbox** | Development-only gated tooling with scoped real accounts or fixtures. | Engineering and QA setup. | Public UI, production navigation, or a replacement for Explore. |

```text
same domain canvas and feature commands
                |
       session + data capability port
       /              |              \
Explore-local   guest-local/cloud    account server/sync
```

`/explore` therefore gives real users a safe place to "dance around" without
requiring a separate database project per person. Its local adapter must apply
the change truthfully, retain it in the active local namespace, and allow reset.
It must never pretend a discarded cloud mutation succeeded.

### Delivery order for `/explore`

1. Reuse one real domain canvas and command contract; do not build a separate
   demo UI tree.
2. Attach the browser/device-safe Explore local adapter, versioned baseline
   fixtures, local mutation application, reset, and conversion export.
3. Prove no auth, API-write, outbox, or PowerSync request occurs in Explore.
4. Swap only the adapter when the same feature is rendered for an account.
5. Decide Guest cloud independently; it is neither a prerequisite nor a
   shortcut for public Explore.

Mobile must follow the same capability model, while preserving its accepted
guest local-first lease where that explicit session is admitted. PowerSync stays
off for Explore and anonymous guest sessions. This does not weaken the separate
need for local and staging infrastructure tiers.

## Actual platform dependency map

| Dependency | Current repository evidence | First environment needed | Promotion trigger | Owner boundary |
| --- | --- | --- | --- | --- |
| Supabase database, Auth, Storage | local CLI config and migrations live under `apps/gurudevi-mobile/supabase`; Sanctuary API uses `DATABASE_URL` and Supabase JWT configuration | Local | Any database/auth/API integration proof | database + API |
| Sanctuary API | Node entrypoint, oRPC boundary, integration configuration requiring test DB/API/JWT | Local | API contract needs real persistence/auth | API |
| Web and mobile clients | public Supabase/API configuration and platform-specific runtime | Staging after API/auth baseline | browser/device journey is selected | client |
| PowerSync | `EXPO_PUBLIC_POWERSYNC_URL`; mobile provider; account lifecycle; feature flag defaults disabled | Deferred | selected journey requires real offline/sync behavior | sync/client/API |
| Doppler | existing `dev`, `stg`, and `prd` concepts and CI allowlist validation | All deployed tiers | new variable is introduced | platform |
| Hosting/build delivery | current CI maps preview/staging and production deployment paths | Staging | client smoke journey is selected | platform/client |
| Telemetry/Sentry/OTel | API and client configuration exist | Staging, then production | release observability is required | platform |
| GrowthBook, push, email, AI, payments | application integrations with provider credentials | Deferred | a selected journey depends on the provider | owning domain |

PowerSync is deliberately not an environment prerequisite for API integration
tests. The feature flag defaults off and the mobile provider has a guarded
disabled path. When an offline journey is selected, PowerSync becomes a
separate promotion slice with its own credentials, publication scope, account
switch/cleanup proof, and device evidence.

## Environment contract

The contract is a versioned inventory of **variable names, purpose, owner, and
allowed tiers**. It contains no secret values and no connection strings.

| Contract group | Examples | Required tiers | Guardrail |
| --- | --- | --- | --- |
| Environment identity | `EXPO_PUBLIC_APP_ENV`, deployment name | all | build must name its tier truthfully |
| Supabase public client | public URL, publishable key | local/staging/production clients | each URL must match that tier's project reference |
| API database and JWT verification | `DATABASE_URL`, `SUPABASE_URL`, JWT issuer/audience/public key | API tiers | issuer, audience, DB, and Supabase URL must describe one tier |
| Test-only API integration | `TEST_DATABASE_URL`, `TEST_API_URL`, `TEST_AUTH_TOKEN` | local only by default | reject production-like DB names, hosted production URLs, and mock tokens |
| PowerSync | public endpoint and service-side config | only after sync promotion | project/data source must match the corresponding Supabase tier |
| Operational providers | Sentry, OTel, flags, push, email, AI, payments | only when required | separate service credentials; never expose server secrets to clients |

`Doppler dev`, `Doppler stg`, and `Doppler prd` are secret-value containers;
they are not proof that targets are isolated. The contract must be checked at
startup and deployment so mismatched variables fail closed with a useful error.

## Minimal enforcement model

1. Maintain a committed environment manifest containing only non-secret
   project references, service URLs/domains, ownership, and status.
2. Maintain a schema/allowlist of required variable names per app and tier.
3. Validate at API/client startup that database, Supabase, JWT issuer, API URL,
   and optional PowerSync endpoint belong to the same declared tier.
4. Make integration scripts local-only by default. They must refuse a URL that
   is not an explicit local/test target and must never fall back to production.
5. Make staging smoke scripts require the `stg` manifest and synthetic test
   identity namespace.
6. Require an explicit promotion record for migrations and newly introduced
   external providers.

The existing `verify-doppler-config` command validates an allowlist shape. The
next enhancement is target-consistency validation, not another secrets system.

## Promotion workflow

### Phase A — establish the minimum safe boundary

1. Archive the unused assignment Supabase project and verify the archive
   locally before deletion.
2. Create one clean staging Supabase project under the primary owner account.
3. Record local, staging, and production project references in the environment
   manifest; do not commit secrets.
4. Point `stg` only to staging and `prd` only to production.
5. Run one Sanctuary API integration scenario against local Supabase with a
   generated synthetic identity. No mobile, web, PowerSync, or provider work
   is included in this phase.

### Phase B — prove the shared baseline

1. Apply tracked migrations to local, then staging.
2. Run API/auth success, deny, stale-scope, and cleanup scenarios locally.
3. Deploy the API to staging and run a synthetic-auth smoke journey.
4. Record failure/recovery behavior before the first production promotion.

### Phase C — promote optional dependencies one at a time

For each dependency, first answer: which user journey needs it, what fails
safely without it, which tier needs it now, and who owns rollback?

PowerSync is promoted only when an offline/sync journey is selected. Its slice
must prove publication boundaries, signed identity, account switch cleanup,
duplicate/idempotent upload behavior, offline recovery, and device behavior.

### Phase D — production release assurance

Promote only a reviewed migration/deployment that has its required lower-level
evidence. Production evidence then records health, telemetry, rollout, and
rollback; it is not an exploratory test run.

## The "do everything in production" decision

This approach appears simpler because it has one set of credentials. In fact,
it pushes complexity and risk into the least recoverable place.

| Short-term convenience | Production consequence |
| --- | --- |
| One database to remember | test rows, failed migrations, and accidental destructive writes become real-user incidents |
| One auth project | test callbacks, rate limits, identities, and JWT configuration can affect users |
| One storage bucket | test uploads pollute or overwrite real assets and retention policies |
| One PowerSync backend | test publication/configuration can replicate wrong data to user devices |
| One provider credential | test emails, pushes, payments, analytics, or AI usage become real external effects/cost |
| One deployment | no safe place to validate rollback, compatibility, or incident behavior |

The only acceptable production activity is a deliberately scoped R1 operation
with an owner, written safety boundary, telemetry, and rollback procedure. No
ordinary test command may discover production from an environment fallback.

## Operating model that stays manageable

Do not carry the configuration in memory. Keep these five small artifacts:

1. **Environment manifest:** target map and isolation status, no secrets.
2. **Secret contract:** names, owners, client/server visibility, required tier.
3. **Dependency registry:** one row per external service with status
   `not introduced`, `local`, `staging`, or `production`.
4. **Promotion record:** migration/provider change, evidence, rollback, and
   approver.
5. **Incident/runbook link:** health checks, pausing/resume procedure, and
   provider outage behavior.

Every change asks only: "Which row changes, which tier is affected, and what
is the narrowest proof?" If the answer is "all providers," the task is too
large and must be split.

## Explicit decisions still required

- Use one permanent isolated staging project as the second hosted free slot;
  local Supabase handles disposable test runs.
- Decide whether staging uses a deployed Sanctuary API before the first web or
  mobile smoke journey. The API-only local proof does not require this.
- Do not introduce a staging PowerSync instance until an offline/sync journey
  is selected and funded/operable.
- Configure branch protection for the existing evidence gate once its required
  CI status is agreed.

## Relationship to existing policy

This guide implements the isolation concern identified in
[`2026-09-17-supabase-shared-database-governance-handoff.md`](../infra/2026-09-17-supabase-shared-database-governance-handoff.md)
and the progressive evidence model in
[`production-evidence-governance.md`](./production-evidence-governance.md).
It does not authorize creating cloud resources, changing Doppler values,
deleting projects, or migrating production data. Those require a separate,
reviewed implementation task.
