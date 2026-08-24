---
title: "Gurudevi API Implementation Plan"
status: "active"
created: 2026-08-14
updated: 2026-08-14
author: "Naveen"
scribe: "opencode"
tags: [docs, architecture]
---

# Gurudevi API Implementation Plan

Status: active
Date: 2026-08-14
Owner: Sanctuary API migration

## Objective

Make the API a coherent, production-operable, agent-ready platform boundary:
typed contracts, explicit authorization, safe errors, idempotent writes,
durable workers, observable execution, realistic verification, and a clean
presentation-only marketing web application.

“Complete” does not mean that tests are green. A slice is complete only when
static architecture evidence, behavior evidence, deployment evidence, and
operational evidence agree.

## Architecture target

```text
mobile / admin clients
        |
        v
Sanctuary API (Hono + oRPC)
  contract -> auth/policy -> use case -> repository/SQL -> normalized result
        |                         |
        |                         +--> audit / metrics / trace
        v
PowerSync upload boundary + Supabase/Postgres
        |
        v
Inngest events -> Sanctuary workers -> durable run/event records

Marketing web: presentation, content, and public marketing only
```

## Phases and gates

### Phase 0 — Baseline and ownership (complete)

- Inventory active routes, contracts, handlers, clients, and direct database
  access.
- Define Sanctuary as the canonical product API owner.
- Classify intentional realtime, local-first, telemetry, and compatibility
  exceptions instead of treating every database call as an HTTP migration.
- Save inventories and the boundary backlog.

Gate: route, contract, composition, and data-boundary inventories are current.

### Phase 1 — Contract and composition foundation (complete)

- Keep shared input/output contracts in `packages/core`.
- Keep the Sanctuary composition root thin.
- Separate isolated concerns such as health, payments, AI, and durable agents
  from native oRPC registration.
- Normalize public errors and reject raw handler errors.

Gate: `pnpm run audit:api-quality` passes with only explicitly documented
warnings.

### Phase 2 — Product-domain migration (mostly complete)

- Migrate real product surfaces slice by slice: forms, Student Potential,
  history, longitudinal views, mapping, School Forest, and classroom settings.
- Derive actors from authenticated context and enforce school/classroom scope.
- Remove corresponding client-side direct database calls only after the server
  path is behaviorally observed.

Gate: each slice has a contract, policy decision, migration source, handler
behavior check, and client boundary proof.

### Phase 3 — Worker consolidation (in progress)

- Sanctuary owns durable-agent requests, provider calls, evidence reads,
  human-review promotion, and run/event persistence.
- Move attendance, classroom, grading, wellbeing, and supported sync workers
  from marketing into Sanctuary.
- Use event names as stable public identifiers, but validate payloads at the
  consumer boundary as well as the producer boundary.
- Make every side effect idempotent before enabling retries.
- Configure bounded retries, concurrency, rate limits, and failure handling.

Gate: staging Inngest delivery, duplicate-event replay, failure/retry behavior,
and persistence checks pass; only then delete marketing worker source.

The concrete release checklist is maintained in
`docs/architecture/WORKER_PARITY_MATRIX.md`. It records side effects and
explicitly blocks inferred SQL when an authoritative schema is missing.

### Phase 4 — Verification depth (in progress)

Build a matrix for every mutation family:

| Scenario | Required evidence |
| --- | --- |
| valid request | handler or route behavior check |
| unauthenticated | 401/anonymous rejection |
| wrong role | 403/fail-closed decision |
| cross-school/classroom | scoped denial |
| malformed input | stable validation error |
| database/provider failure | normalized safe error plus trace/correlation ID |
| duplicate request/event | same durable outcome, no duplicate side effect |
| timeout/retry | bounded retry and terminal failure record |

Coverage reports are a signal, not the gate. Add Vitest V8 coverage after the
provider is installed, but enforce critical-path branch coverage and scenario
presence rather than a repository-wide vanity percentage.

The current measured baseline is 39.59% statements, 31.94% branches, 40.11%
functions, and 41.41% lines across the current Sanctuary source set, with 154
API tests passing. The suite
passes its deliberately modest initial floor (35/25/35/35), but the report
shows important uncovered surfaces—durable agents, AI routes, mapping,
longitudinal, forms, and several mutation handlers. Student Potential now has
route-level valid, denial, persistence, and malformed-input scenarios. These
figures remain a signal, not a production claim; scenario-driven expansion and
staging evidence are still required.

Gate: structural audits + focused unit tests + route/integration probes +
production-like smoke checks all pass.

### Phase 5 — Data delivery and release safety (pending)

- Reconcile local/linked migration state through the normal release process.
- Never rewrite remote migration history from a review worktree.
- Add migration checks to CI and require schema evidence for every new route.
- Verify RLS, grants, indexes, constraints, and rollback/forward procedures.

Gate: staging schema matches the reviewed migration set and smoke checks run
against that schema.

### Phase 6 — Operations and deprecation (pending)

- Emit correlation-aware traces, metrics, structured logs, and audit events.
- Define SLOs for API latency/error rate, worker completion, provider failure,
  and sync lag.
- Add retention/cleanup for durable runs and worker events.
- Remove legacy proxies and partially migrated clients.
- Keep marketing web presentation-only and independently deployable.

Gate: dashboards, alerts, runbooks, deployment markers, and rollback procedure
exist before production declaration.

## 2026 practice decisions

- Use OpenTelemetry signal separation: traces for causal request/workflow
  context, metrics for SLOs, and structured logs/audit records for searchable
  events.
- Use durable step boundaries for worker side effects; retries must not replay
  unsafe writes.
- Use explicit idempotency keys at both API mutation and event-consumer layers.
- Treat AI output as bounded draft data with evidence references and human
  promotion, never as an implicit privileged write.
- Keep agent-facing contracts and operational metadata machine-readable so an
  implementation agent can discover ownership, policy, errors, and verification
  requirements without relying on tribal knowledge.

## Current blockers and decisions required later

1. Migration history drift must be reconciled through deployment ownership.
   The 2026-08-14 audit reports 164 local migration files versus 166 linked
   records: local migrations `20260812000000`, `20260813000003`,
   `20260813000004`, `20260813010000`, `20260813020000`, `20260814000000`,
   `20260814010000`, `20260814020000`, `20260814030000`, `20260814040000`,
   `20260814050000`, and `20260814060000` are not applied remotely, while
   remote-only records `20260812202318` and `20260812202325` are absent locally.
   The teacher-notes and decision-journal schema is authored but not deployed.
2. The five historical classroom tables need schema confirmation before any
   new routes are added.
3. School Forest, feature-tracking, Warm Mirror, and Presence API methods are
   now migrated behind Sanctuary; realtime channel membership is explicitly
   isolated as a client adapter. Continue against the remaining 22 legacy Core
   findings.
4. Generic worker payloads and mutation semantics need staging replay evidence
   before marketing deletion.
   Queued mutations now carry a required authenticated `actorId`; journal and
   decision writes enforce actor ownership, and attendance writes enforce
   classroom/school teaching authority before execution.
   Direct worker-callback checks now cover actor rejection, terminal outcome
   recording, and duplicate replay; they do not replace staging delivery or
   real-database evidence.
5. Sanctuary worker outcomes now persist `completed` and `failed` states with
   retry-safe idempotency-key upserts; staging must still prove the database
   constraint, retry behavior, and side-effect replay semantics.
6. The main quality workflow now runs the API structural gate, worker parity
   audit, and Sanctuary API coverage thresholds. Migration-state reconciliation
   remains a separate release gate until local and linked histories converge.

## Working commands

```bash
pnpm run audit:api-quality
pnpm --filter @repo/sanctuary-api test
pnpm exec tsc --noEmit -p apps/sanctuary-api/tsconfig.json
pnpm exec tsc --noEmit -p packages/core/tsconfig.json
```

## External references

- [Inngest error handling and retries](https://www.inngest.com/docs/guides/error-handling)
- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)
- [Vitest coverage](https://vitest.dev/guide/coverage)
- [Hono error handling](https://hono.dev/docs/api/hono)
