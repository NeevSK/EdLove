---
title: "Sanctuary API Adversarial Security Audit"
status: "active"
created: 2026-08-29
updated: 2026-08-29
author: "Naveen"
scribe: "Codex"
tags: [api, security, authorization, ai, audit, sanctuary]
---

# Sanctuary API Adversarial Security Audit

## Scope and confidence

This review treats tests, contracts, OpenAPI, and documentation as claims that
must be disproved by tracing actual runtime paths. It is a source review, not
a production penetration test; it cannot prove that no further issue exists.
The findings below are confirmed from the currently checked-out source and are
not downgraded because a local audit script or mock-based test passes.

## Stop-ship findings

### Critical — durable-agent tenant boundary bypass

`createDurableAgentRoutes()` is mounted separately from the native oRPC routes
and does not pass through POA/Cedar/entitlement middleware. It checks only
that a user exists, takes school/classroom scope from the request body, and
uses a global user role in raw SQL rather than proving membership in that
school. The queued event preserves that client-controlled scope. Worker reads
then query student/classroom data from those supplied identifiers without
proving the student-classroom-school relationship.

Evidence: `apps/sanctuary-api/src/core/app.ts` mounts AI POA separately from
durable routes; `apps/sanctuary-api/src/core/routes/durableAgents.ts` handles
enqueue and read endpoints; `packages/core/src/api/durableAgents.contract.ts`
declares client-supplied scope; `apps/sanctuary-api/src/agents/studentSupport.ts`
reads the evidence. A user with a broadly privileged role can potentially
enqueue or retrieve another tenant's sensitive classroom/student material.

Required remediation: remove this bespoke authorization path. Make durable
operations native oRPC procedures or invoke the same authoritative context
resolver and Cedar decision; derive every school, classroom, and student from
verified membership and server-side relationship queries. Bind the verified
scope to queued events and reauthorize before worker execution and result read.

### High — sensitive durable-run results are overexposed

The durable run list/detail routes filter by school and return sensitive
student identifiers, evidence, drafts, actor/teacher IDs, and failure errors,
but do not apply a resource-level Cedar/relationship check. This is not a safe
read model for wellbeing or educational data.

Required remediation: add an explicit resource policy for each run/result,
minimize list fields, redact diagnostic failures, and test teacher/guardian/
student/cross-school denial matrices.

### High — JWT issuer/audience assurance is incomplete

The verifier claims standard-claim validation but verifies algorithm, time,
and subject without an exact `iss` or `aud` check. It also falls back to a
hard-coded JWKS project URL when configuration is absent. A deployment error
can therefore authenticate a token from an unintended authority.

Required remediation: require issuer, JWKS URL, and audience at production
startup; validate issuer/audience exactly; remove the hard-coded fallback;
redact token header/payload from logs.

### High — contracts can be guessed rather than declared

`core/orpc.ts` synthesizes missing members as POST routes with inferred
action/subject and no input/output schema. This bypasses the intended
schema-first/explicit-policy rule and turns a typo or missing contract into a
reachable route shape. Separately, `learningReflections` is in the router but
has no native mount, demonstrating that router inclusion is not reachability.

Required remediation: make missing members fail composition; require explicit
input/output/error/policy metadata; add a bidirectional test of contract ↔
router ↔ native mount ↔ adapter exposure.

### High — payment callback is not bound to a payment intent

The PayHere webhook upgrades `pricing_tier` using the supplied `order_id` as a
user identifier after verifying only the callback signature. It does not look
up a server-created immutable intent and compare merchant, amount, currency,
owner, status, or provider transaction ID before entitling the account.

Required remediation: model payment intents server-side; atomically consume a
verified provider transaction once; validate all immutable fields and retain a
reconciliation/audit record before changing entitlements.

## Material systemic weaknesses

- The authority source can fall back to client-controlled headers when the
  database context is unavailable. Protected requests must fail closed.
- Hono, oRPC, AI, rate limit, feature flag, and webhook paths emit different
  error envelopes; some include policy/provider diagnostic detail.
- Idempotency middleware is imported but not mounted. Its fallback store is
  process-local, optional, and does not enforce a body/path fingerprint.
- AI chat accepts unvalidated JSON, creates a circuit breaker per request,
  has no explicit message/token/concurrency budget, and records/logs sensitive
  content through several adapters.
- Console logging includes user/resource/policy and JWT diagnostic material;
  it is not covered by a proven redaction policy.
- API tests are not a trustworthy release oracle: the default command runs an
  integration suite against an absent localhost server, while current
  contract/audit scripts mainly validate declarations and local snapshots.
- The OpenAPI surface is stale/selective and a mutation probe reached the
  supposedly read-only OpenAPI adapter.
- `learningReflections` is registered in the router and claimed as mounted in
  a feature plan, while its client calls `/api/classroom/learning-reflections`;
  the native mount registry contains neither path and there is no route test.
- The contract audit's explicit source list omits live `journalEntries` and
  `rewards` router domains, so “194 routes / 0 findings” is incomplete rather
  than a full API coverage assertion.
- The checked-in OpenAPI snapshot advertises 15 paths under namespaces without
  a matching native mount, creating phantom external API coverage and likely
  404s for documented operations.

## Required verification before release

1. Add black-box cross-tenant tests for every ID source (path, query, body,
   cursor, nested bulk item, job ID) and for all async enqueue/read flows.
2. Run a real test database with per-test tenants and fail CI if it is absent;
   never silently substitute mock identities or localhost calls.
3. Fuzz malformed content types, oversized/deep payloads, error paths,
   idempotency races, retry/revocation races, and webhook replays.
4. Create OpenAPI and runtime route inventories from the deployed app and
   assert both directions of the mapping.
   Include contract-audit source coverage and client-path-to-mounted-handler
   coverage, not only contracts that happen to be imported by the script.
5. Red-team AI/tool endpoints for prompt injection, secret exfiltration,
   cross-tenant retrieval, excessive agency, SSRF, and cost exhaustion.
6. Verify production configuration and staging behavior for issuer/audience,
   database authority, shared rate limits, worker reauthorization, telemetry
   redaction, payment reconciliation, kill switches, and rollback.

The relevant practice baselines are OWASP API Top 10, OWASP GenAI Top 10,
[RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), and the
[MCP tool specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).
