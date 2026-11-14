---
title: "Horizontal Foundation Audit: First Evidence Pass"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [audit, foundation, authn, authz, errors, evidence, current-progress]
---

# Horizontal Foundation Audit: First Evidence Pass

## Audit status

This is the first static/source-grounded pass against the horizontal foundation. It is not a penetration test, production certification, load test, restore drill, or independent security sign-off. Findings distinguish source existence from runtime proof.

## Grounded scope

Inspected `apps/sanctuary-api/src`, `packages/core/src/api`, API middleware/routes, JWT verifier, error normalizer, rate limiter, health routes, classroom-note contract/handler/domain adapter, tests, package manifests, and current architecture records.

## Inventory evidence

| Measure | Observed count | Interpretation |
| --- | ---: | --- |
| Shared API contract files | 63 | Broad typed surface; not proof of uniform lifecycle |
| API handler modules | 40 | Large modular surface; direct handler access remains material |
| API test files | 54 | Useful coverage exists; evidence level varies by test/double |
| Contract files with policy metadata search hit | 57 | Search indicator, not complete policy proof |
| Contract files with idempotency terminology search hit | 8 | Idempotency is not yet a universal mutation contract |
| Direct Hono JSON/text response search hits | 41 | Several route families bypass shared typed response semantics |
| Raw `throw new Error` search hits in API/AI/agents/core | 22 | Expected failures and defects are not fully typed at source |
| `any` search hits across inspected API/core API | 652 | Type boundary debt increases review/authorization uncertainty |
| Transaction-related search hits | 52 | Mentions do not prove every critical multi-write operation is atomic |

Counts are discovery signals, not health scores. Search terms can overcount comments/types and undercount indirect abstractions.

## Area findings

### Authn — substantial mechanism, incomplete assurance

**Observed:** asymmetric JWT verification, issuer/audience/expiry/not-before checks, JWKS/static-key paths, bounded verification cache, production configuration assertions, anonymous/onboarding exceptions.

**Gaps:** process-local caches and key refresh behavior need operational proof; development/test identity bypass must remain impossible in production; webhooks/providers/workers have separate authentication paths; session revocation/device trust is not one universal API contract.

**Status:** amber. F1 required.

### Authz and tenant isolation — strong intent, duplicated execution

**Observed:** active-bond resolution, classroom relationship derivation, explicit policy metadata, Cedar/Rust evaluator option, ZenStack request-scoped DB, double-gate middleware, server-derived author checks.

**Gaps:** Hono POA and oRPC double-gate construct related context separately; non-oRPC routes do not inherit oRPC policy metadata; direct handlers use broad `any` DB access; client headers remain a potential confusion surface even when comments say they are not authoritative; route-wide tenant isolation is not proven.

**Status:** amber/red for new protected doors. F1 required.

### Error and contract boundary — present but fragmented

**Observed:** `SovereignError`, normalizer, RFC-style problem details, oRPC error mapping, sanitized unknown errors, request IDs, direct boundary tests.

**Gaps:** ORPC/Hono/direct JSON/text/streaming/webhook paths do not share one client error vocabulary; raw errors remain; retryability/operation IDs/conflict versions are not universal; streaming failures require explicit callbacks; global `onError` cannot repair a response after a stream has begun.

**Status:** amber/red for cross-door capabilities. F2 required.

### Validation and typing — broad schemas, weak edges

**Observed:** Zod/oRPC contracts and output schemas exist across much of the surface.

**Gaps:** transformed schemas use passthrough behavior; AI route declares `z.any()` at its policy route; 652 `any` search hits in the inspected surfaces; direct webhook/AI routes have custom parsing and response envelopes.

**Status:** amber. F0/F2 required.

### Data integrity and durability — local strengths, non-uniform guarantees

**Observed:** PowerSync upload has durable idempotency; several contracts accept idempotency keys; lifecycle/event tables and worker ledgers exist; domain ports exist for classroom notes.

**Gaps:** only 8 contract files visibly advertise idempotency; classroom-note API handler writes note and lifecycle event separately; no universal operation receipt; external provider acceptance and domain commit are not one shared lifecycle; worker dispatch repair remains unproven.

**Status:** red for protected new mutations. F3 required.

### Resilience and operations — controls exist, proof is partial

**Observed:** body limits, timeouts, rate limiting, OTel hooks, Sentry hooks, liveness/readiness routes, production rate-limit configuration assertions.

**Gaps:** rate-limit key trust/fairness and middleware ordering need proof; timeout does not automatically cancel underlying work; readiness checks do not establish worker/outbox, auth-key, provider, restore, or queue health; graceful drain and operator recovery evidence are not universal.

**Status:** amber/red for service guarantees. F4/F5 required.

### Security and privacy — good controls, incomplete field discipline

**Observed:** sanitized public errors, JWT verification, policy evaluator, secure headers, body limits, privacy modes for AI, no client-header authority claim in key paths.

**Gaps:** raw content/log/provider redaction is not a single enforceable contract; secret rotation/revocation and operator succession are not proven; shared device/offline cached data and receipt lookup need capability-specific evidence.

**Status:** amber. F1/F4/F5 required.

## First-pass gate

**Foundation state: do not begin broad protected vertical implementation.** Continue documentation/design and bounded foundation remediation. The classroom-note slice remains the proving capability, but its implementation is blocked until F1–F3 and named F4/F5 controls are accepted.

## Priority remediation backlog

| Priority | Work | Gate |
| --- | --- | --- |
| P0 | Route-family authn/authz inventory and one canonical request principal/context | F1 |
| P0 | Canonical error vocabulary and transport mapping, including direct/streaming routes | F2 |
| P0 | Mutation classification, receipt, idempotency, transaction/outbox matrix | F3 |
| P0 | Classroom-note atomicity/replay design before implementation | F3 |
| P1 | Strictness/passthrough/`any` boundary audit and AI route schema | F0/F2 |
| P1 | Rate-limit trust/fairness and timeout cancellation evidence | F4 |
| P1 | Redaction, operation correlation, queue/worker/readiness health | F4 |
| P1 | Crash/restore/replay/revocation/shared-device scenarios | F5 |
| P2 | Independent security challenge and production-like restore/load evidence | F5 |

## Verification boundary

This audit is G0 static/source evidence plus previously executed G1 boundary tests for error sanitization/security boundaries. It does not prove production authn/authz, transaction atomicity, device behavior, provider delivery, restore, load capacity, or security clearance.
