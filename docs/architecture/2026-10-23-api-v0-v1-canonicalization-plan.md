---
title: "API v0 Compatibility and v1 Canonicalization Plan"
status: "draft"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, versioning, orpc, migration, bff, compatibility]
---

# API v0 Compatibility and v1 Canonicalization Plan

## Decision

The platform will separate its product API versions from library versions:

```text
/api/*       v0 compatibility surface
/api/v1/*    canonical platform capability surface
/web-bff/*   optional web-only adapter; never a second domain authority
```

`v1` is the first stable product API contract. It may be implemented with oRPC
v2 APIs internally, but it is not named after the oRPC major version. This keeps
the external product contract stable if an implementation library changes.

This is a phased migration plan. It does not authorize removing, moving, or
renaming current `/api` routes until a per-operation caller inventory,
characterization evidence, migration, and explicit deletion approval exist.

## Bounding triad

1. **Surface & mode:** API versioning and top-down consolidation across
   Sanctuary API, core clients, web, mobile, and direct integrations;
   Maintain-mode planning.
2. **Grounded substrate:** the vision-versus-reality audit, current Hono route
   composition, native oRPC router, legacy contract adapter, direct client
   facades, direct Supabase callers, and the activity-event decision.
3. **Active seam & constraints:** hold current behavior behind v0 while v1
   establishes one capability model; avoid two business implementations, a
   general BFF, mass rewrite, or unapproved deletion.

## Version contract

### v0: `/api/*`

v0 is the existing compatibility boundary. It includes the native route shape
already used by current web/mobile clients and the dedicated protocol paths that
must remain reachable while callers are migrated.

Rules:

- preserve current behavior, error expectations, and active callers;
- no new ordinary protected domain capability begins in v0;
- security repairs and production correctness fixes remain allowed in v0;
- every v0 operation is classified by Gate A before a v1 replacement is planned;
- v0 is not an undocumented permanent default: it receives a visible
  compatibility/deprecation state per operation.

### v1: `/api/v1/*`

v1 is the only destination for new first-party domain commands and queries once
the v1 kernel exists. A v1 capability is a product commitment, not a route name.

Every protected v1 capability must have:

1. a domain owner and capability identifier;
2. typed input, output, expected failures, and policy metadata;
3. one server-derived request authority context;
4. a lifecycle class: read, draft, proposal, commit, or external effect;
5. idempotency/replay/conflict rules where it changes durable truth;
6. an operation receipt and repair semantics where a caller can lose a response;
7. explicit audit, product activity, and telemetry emission decisions;
8. privacy class, retention owner, and offline policy;
9. G0/G1/G2+ evidence appropriate to its risk.

OpenAPI remains a selective read-only projection of v1 capabilities; it is not a
parallel mutation authority. SSE, webhooks, file transfer, and streaming remain
specialized transport adapters with their own lifecycle and authority rules.

### BFF: `/web-bff/*`

A web BFF is optional and narrow. It may provide cookie/session translation,
server-side rendering aggregation, web cache policy, SEO/image concerns, and
browser-specific protocol adaptation.

It may not:

- write authoritative domain data directly;
- derive or override authorization independently of the v1 authority context;
- query Supabase directly for protected domain behavior when a v1 capability
  exists;
- become an alternate schema, repository, or workflow engine.

The normal dependency direction is:

```text
web UI → web BFF where justified → /api/v1 capability → application/domain
mobile UI ───────────────────────→ /api/v1 capability → application/domain
AI/channel/webhook adapter ──────→ /api/v1 capability → application/domain
```

## Target v1 kernel

The kernel is deliberately small. It is shared machinery that every protected
capability consumes; it is not a new generic framework.

| Kernel concern | v1 rule |
| --- | --- |
| Authority | One typed request context derives principal, active scope, policy facts, correlation, and trust inputs server-side. |
| Errors | One canonical failure vocabulary maps to native oRPC, RFC 9457-style HTTP responses, streaming terminal states, and safe logs. |
| Commit lifecycle | Durable writes define transaction, idempotency, conflict, receipt, and outbox/effect state. |
| Events | Audit, domain, product activity, and telemetry have distinct purpose and schemas. |
| Privacy | Every emitted event and projection has a privacy class, purpose, audience, and retention owner. |
| Observability | Request, operation, trace, and provider identifiers are correlated without leaking sensitive content. |
| Client access | First-party callers use the canonical v1 client/hook path; exceptions are documented. |

## Phases and gates

### Phase A — reality ledger and version constitution

**Goal:** know every live door before changing one.

**Outputs:** Gate A inventory, version policy, legacy/canonical disposition for
each operation, direct-boundary exception register, and documentation index.

**Exit gate:** no unknown protected route/client path remains in the scoped
inventory; one first proving capability is selected; no v1 route is mounted yet.

### Phase B — v1 kernel and proving capability

**Goal:** prove the capability model with one protected Classroom Learning
operation, preferably attendance batch or assignment submission.

**Outputs:** v1 authority context, contract, application service, receipt,
audit/event policy, outbox/effect behavior where necessary, first client, and
recovery tests.

**Exit gate:** the selected operation handles duplicate submission, lost client
response, scope change, authorization denial, dependency failure, and correction
without ambiguous success.

### Phase C — v1 mount and client admission

**Goal:** mount `/api/v1` only after Phase B proof, then direct new work to it.

**Outputs:** explicit v1 router registration, versioned client entry point,
route-level docs, migration guidance, and v0-to-v1 equivalence/intent tests.

**Exit gate:** a web or mobile v1 consumer completes the proving capability; v0
remains unchanged and monitored.

### Phase D — domain-by-domain migration

**Goal:** migrate coherent capability groups, not arbitrary file categories.

**Order:** identity/scope → classroom learning → self/wellbeing → community/
communication → platform operations.

**Per-domain exit gate:** callers are inventoried and moved; compatibility
behavior is characterized; direct boundary exceptions are either eliminated or
documented; receipts/events/privacy evidence exists for protected mutations.

### Phase E — v0 retirement by operation

**Goal:** retire only proven-unused v0 behavior.

**Required evidence:** zero remaining callers, migration notice/compatibility
window where relevant, v1 parity and recovery tests, operational monitoring,
and explicit human approval naming the exact route/contract/fallback to remove.

**Non-goal:** no “delete v0” milestone. Retirement is per operation, not a
single risky repository-wide event.

## Domain ownership model

| Domain | v1 owns | Examples |
| --- | --- | --- |
| Identity and scope | account, bond/capacity, permission, consent | select active scope, capability discovery |
| Classroom learning | educational durable truth | attendance, enrolment, submissions, grading |
| Self and wellbeing | person-owned private records | reflections, goals, wellbeing drafts |
| Community and communication | social/notice intent and delivery orchestration | groups, announcements, delivery state |
| Platform operations | cross-cutting operational records | receipts, audit infrastructure, outbox, event projections |

A repository, port, facade, or hook is justified only when it owns a stable rule
or a real replaceable boundary inside one of these domains. It is not justified
by a UI screen, one database table, or the existence of a feature ticket.

## Non-negotiables

- No new protected direct Supabase write outside an approved v1 application or
  transitional adapter boundary.
- No new generic `api: any` aliases for v1.
- No BFF-owned authorization or durable domain mutation.
- No route deletion without the Deletion Veto protocol.
- No vendor/package upgrade implied by this plan.
- No client cache/activity telemetry used as authority for a server commit.

## Relationship to existing documents

This plan operationalizes the 2026-10-23 vision-versus-reality audit and product
activity decision. Older Hono/oRPC migration records remain historical evidence;
the Gate A ledger must reconcile their claimed routes and versions with current
source before any document is marked superseded.

## Verification boundary

This is a design plan, not an implementation claim. It proves no v1 mount,
client, database transaction, BFF, or v0 compatibility behavior yet exists.
