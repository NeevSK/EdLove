---
title: "Sanctuary API Future-Readiness Implementation Plan"
status: "active"
created: 2026-08-29
updated: 2026-08-29
author: "Naveen"
scribe: "Codex"
tags: [api, plan, security, ai, testing, sanctuary]
---

# Sanctuary API Future-Readiness Implementation Plan

## Purpose

Execute the remediation priorities in
`docs/architecture/2026-08-29-sanctuary-api-future-readiness-audit.md` without
re-platforming Sanctuary API or weakening an existing quality gate.

## Phase 0 — establish a truthful baseline

1. Reproduce the failing composition assertion and the failing API tests in
   isolation; classify each as implementation regression, stale assertion,
   missing test prerequisite, or test harness defect.
2. Correct the composition inventory only after verifying the 38th route's
   intended ownership and protocol.
3. Publish a machine-readable route matrix with owner, protocol, auth mode,
   Cedar policy, input/output/error schemas, idempotency, rate-limit class,
   async semantics, and deprecation status.

Exit gate: `audit:api-quality`, `audit:api-contracts`, `audit:api-errors`, and
the relevant API test groups all pass; the matrix is generated or verified in
CI.

## Phase 1 — one safe external error boundary

1. Define a strict `ApiProblem` schema and centralized converter in the
   Sanctuary transport layer.
2. Make all HTTP non-success responses use `application/problem+json`; retain
   compatibility only through an explicit versioned adapter with a sunset date.
3. Map Zod, HTTPException, oRPC, SovereignError, authorization, rate limit,
   feature flag, AI/provider, webhook, and unknown exceptions to stable
   problem types/codes.
4. Put safe human copy in `title`/`detail`; expose structural machine fields
   (`code`, field pointers, retryability, request ID) without agent-specific
   prose.
5. Redact and log the original cause with trace/request identifiers. Remove
   external policy, provider, database, and stack details.
6. Make server-side scope resolution a hard dependency for protected routes;
   reject unavailable ZenStack/authority context with the normalized 503 rather
   than accepting client authority headers.

Exit gate: exhaustive mapper unit tests; transport tests for every adapter;
negative leak tests; 429/503 `Retry-After`; no raw error string reaches a
client.

## Phase 2 — complete contracts and AI tool safety

1. Declare errors, security schemes, response headers, pagination,
   idempotency, limits, and operations in OpenAPI. Keep OAS 3.1 until the
   generator toolchain is proven compatible with a newer target.
2. Add OpenAPI linting and response conformance tests. Mutation operations
   must be documented rather than silently omitted where they are externally
   supported.
3. Create an explicit agent/MCP adapter that reuses Zod schemas and returns
   validated structured output. It must use the ordinary identity, Cedar,
   audit, idempotency, and problem boundaries.
4. Require bounded AI input/output, retry/cost limits, provider error mapping,
   provenance for product claims, and human promotion for high-impact writes.
5. Make the AI circuit breaker a shared provider-keyed dependency rather than
   a per-request object, and validate all AI request content before it reaches
   a provider.

Exit gate: generated specification validates; representative success and
failure responses conform; tool outputs conform to their output schemas;
authorization and leak-negative tests pass.

## Phase 3 — compose and operate deliberately

1. Extract `core/app.ts` into small composition modules with a single ordered
   middleware registry and a route-slice registry.
2. Replace inferred/fallback contracts and broad `any` at the transport edge
   incrementally, beginning with procedure metadata and error mapping.
3. Consolidate trace/correlation ownership and validate W3C trace headers;
   add OpenTelemetry HTTP/exception spans plus redacted structured logs.
4. Add low-cardinality metrics, dashboards, alerts, dependency health checks,
   graceful shutdown, and durable scheduling for retention/background work.

Exit gate: middleware-order integration test; trace/redaction test; staging
smoke test; dashboards and runbook reviewed by the deployment owner.

## Documentation workstream (in parallel with Phases 1–2)

1. Repair `apps/sanctuary-api/docs/INDEX.md` to use repository-relative links
   and reference only extant documents.
2. Add stable API-local `api-error-contract.md` and
   `api-surface-and-versioning.md` references after the schemas are accepted.
3. Make the OpenAPI snapshot explicitly generated, expose a package script,
   and add a CI route-count/spec-diff check.
4. Mark stale migration/comprehensive-audit checkpoints superseded with links
   to this audit and plan; normalize statuses and runbook frontmatter to the
   documentation SOP.

## Phase 4 — retire transitional boundaries

1. Resolve each direct-Supabase inventory item as migrated, approved exception,
   or sunset path with an owner and date.
2. Remove only the compatibility paths whose client migration and production
   observation prove they are unused.
3. Run the required quality gates and update the stack map for every accepted
   dependency change.

Exit gate: no unclassified data-boundary findings; migration smoke evidence;
rollback path; `pnpm run check:anti-slop` passes for changed files.

## Dependency policy

Do not add packages before Phases 0–2 demonstrate a concrete gap. If a package
is proposed, write a short comparison record covering schema reuse, runtime
compatibility, error mapping, security maintenance, performance, observability,
incremental adoption, rollback, and overlap with current Hono/oRPC/Zod/AI SDK
capabilities. Follow the repository stack-map process after any dependency
change.
