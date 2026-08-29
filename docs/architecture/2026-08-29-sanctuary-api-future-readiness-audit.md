---
title: "Sanctuary API Future-Readiness Audit"
status: "active"
created: 2026-08-29
updated: 2026-08-29
author: "Naveen"
scribe: "Codex"
tags: [api, architecture, security, ai, audit, sanctuary]
---

# Sanctuary API Future-Readiness Audit

## Decision summary

Sanctuary API has the right foundation and should be consolidated rather than
re-platformed: Hono hosts transport concerns; oRPC plus Zod provides the
first-party contract boundary; Cedar/ZenStack provide authorization and data
enforcement; OpenTelemetry, Sentry, Pino, PostHog, Vitest, and OpenAPI are
already present. Do not add a competing server framework, validator, logger,
or AI framework.

The material risk is that several transport paths emit different error bodies,
some error details can disclose internal authorization or provider information,
the OpenAPI adapter intentionally omits mutations, and the composition/test
gates do not presently agree. These are delivery and contract-consistency
issues, not missing-library issues.

## Evidence snapshot (2026-08-29)

| Area | Evidence | Assessment |
| --- | --- | --- |
| Contracts | `pnpm run audit:api-contracts`: 194 active routes / 35 sources; 0 findings | Strong typed coverage inventory |
| Typed errors | `pnpm run audit:api-errors`: pass | Core handler taxonomy is present |
| Authorization | quality audit: 49 resources / 5 actions parity pass | Strong, but error disclosure needs tightening |
| Data boundaries | quality audit: 0 direct Supabase calls in Sanctuary; 22 legacy Core and 60 other first-party findings | Migration boundary remains incomplete |
| Composition | quality audit failed: expected 37 native mounts, found 38 | Release gate is stale or implementation drifted |
| Tests | default API run: 5 files / 42 tests failed; the self integration suite calls an absent `localhost:3000` despite a missing database prerequisite | Do not make a production-readiness claim until the harness and product failures are separated and fixed |
| API description | Hono emits OpenAPI 3.1 at `/doc`; oRPC OpenAPI filter hides mutations | Documentation is not a complete public executable contract |

## Contract and error comparison

The existing `SovereignError` model already has the useful shape: RFC 9457
members plus a stable code, category, human message, agent action, and request
instance. The API does not yet enforce that shape at every adapter. `app.onError`
returns normalized details for uncaught errors, but `HTTPException`, rate limit,
feature-gate, POA, oRPC, AI, webhook, and not-found paths can return distinct
JSON bodies or raw messages.

Adopt one **wire** failure contract for every non-success API response:

```json
{
  "type": "https://api.gurudevi.edlove.org/problems/validation-failed",
  "title": "Request could not be processed",
  "status": 400,
  "detail": "Correct the highlighted fields and try again.",
  "instance": "request-id",
  "code": "VALIDATION_FAILED",
  "errors": [{ "pointer": "/email", "code": "invalid_format", "message": "Enter a valid email address." }],
  "retryable": false
}
```

`type`, `status`, `code`, field pointers, retryability, `Retry-After`, and the
opaque request ID are the machine/AI contract. `title`, `detail`, and field
messages are the human contract: safe, short, localized, and recovery-oriented.
Do not create separate "AI errors" or ask models to parse prose. Keep stack
traces, database/provider messages, policy names, resource-existence details,
tenant IDs, secrets, and PII only in redacted logs/traces/Sentry.

Use the following durable vocabulary: `validation-failed`,
`authentication-required`, `operation-not-permitted`, `resource-not-found`,
`conflict`, `precondition-failed`, `rate-limited`, `dependency-unavailable`,
and `internal-error`. Map domain errors to it centrally and exhaustively. A
403 must not reveal a Cedar action/subject; a provider failure must not expose
the provider response; a 500 must never return raw `Error.message`.

This follows [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html),
[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), and OWASP guidance on
[REST errors](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html).

## AI and agent boundary

Keep AI as an explicit adapter, never a privileged escape hatch. Every tool or
agent operation must share the same Zod-derived input/output schema, identity,
active scope, Cedar decision, idempotency policy, trace context, audit event,
and normalized problem contract as a human client. Tool calls should return
schema-conformant `structuredContent`; tool execution failures should be
marked as tool errors so agents can correct inputs, while transport/protocol
failures remain transport errors. This is consistent with the
[MCP tool specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).

AI-generated content remains untrusted draft data. Bound input/output size,
tool permissions, external URL access, tokens/cost, retention, and retries.
Require citations/evidence provenance where product-facing claims are made and
human approval before a high-impact or irreversible write.

## Architecture gaps and priorities

### P0 — normalize every external failure

- Introduce one transport-level problem factory and content type
  `application/problem+json`; route HTTPException, oRPC, Zod, feature flag,
  rate-limit, AI, webhook, and unknown errors through it.
- Return `x-request-id` consistently and make `instance` an opaque request URI
  or request ID. Preserve `Retry-After` for 429/503.
- Replace policy/provider-specific messages in `core/orpcMiddleware.ts` and
  related handlers with safe public details; record diagnostic causes only in
  structured logs/traces.

### P0 — fail closed when authoritative scope is unavailable

- `core/app.ts` and `core/router.ts` can derive school/capacity and related
  scope from client headers when ZenStack is unavailable. Protected,
  authenticated requests must return a normalized 503 instead; headers may be
  hints only after server-side verification. Keep a separately declared,
  minimal bootstrap/public route exception list.

### P0 — restore verification truth

- Reconcile the 37-versus-38 native-route composition expectation before
  accepting future work. Either register the route in the inventory or remove
  the obsolete mount.
- Triage and repair the red API tests; an integration test skipped due to a
  missing database must use Vitest's explicit skip mechanism, not register as
  failed behavior.

### P1 — make the specification complete and executable

- Treat OpenAPI as a generated compatibility description, not a read-only
  showcase. Document request, success, failure, auth, pagination, idempotency,
  rate-limit, and webhook contracts for all supported external endpoints.
- Retain OAS 3.1 until the current Hono/oRPC generators demonstrably support
  OAS 3.2; do not upgrade merely because OAS 3.2 is newer.
- Generate contract/conformance tests which validate actual success and error
  bodies against the published schema and fail on undocumented routes.
- Verify the oRPC OpenAPI filter against the actual callable surface: a
  mutation probe reached the OpenAPI path despite the read-only filter comment.

### P1 — simplify only after the contract is stable

- Split `core/app.ts` into app assembly, transport middleware, identity/scope,
  error mapping, OpenAPI, and adapter mounts while preserving ordering with an
  integration lifecycle test.
- Replace `any`-based contract conversion and authorization metadata access
  incrementally with explicit types. Remove heuristic fallback route creation:
  contracts should be declared, not inferred from procedure names.
- Consolidate correlation middleware so W3C `traceparent` validation and
  propagation have one owner. Use OpenTelemetry HTTP/exception conventions;
  retain low-cardinality metrics separately from traces and logs.
- Replace `console` diagnostics that include JWT, actor, resource, or policy
  context with redacting structured Pino events and test the redaction rules.

### P2 — finish boundary and operational readiness

- Classify each remaining direct Supabase finding as migrate, local-first
  exception, or approved database/identity adapter with an owner and sunset
  date.
- Move in-process retention to the durable-work boundary for multi-instance
  deployment; add shutdown, health, dependency timeout, and recovery tests.
- Add SLO metrics/alerts for latency, failures, authorization denials, rate
  limiting, worker completion, sync lag, and AI provider/cost limits.

## Dependency decision

No package should be added in the first remediation phase. The API already has
overlapping AI SDK families (`ai`/AI SDK and TanStack AI) and multiple adapter
concerns. First choose one supported execution path per use case and measure
actual gaps. A future dependency proposal must demonstrate: a single schema
source shared with Zod/oRPC/OpenAPI, maintained runtime compatibility, safe
RFC-9457 mapping, telemetry/redaction support, license/CVE posture, startup
cost, incremental migration and rollback, focused tests, lockfile update, and
the required stack-map update. Do not introduce an error library, a new web
framework, or an OpenAPI generator without that comparison spike.

## Documentation audit

The existing `2026-08-13-sanctuary-api-production-architecture-review.md` and
`API_IMPLEMENTATION_PHASED_PLAN.md` are valuable historical baselines but are
not current enough to act as an implementation source of truth: the former
describes past fixes as a review and the latter says the API quality gate is
complete while it currently fails. This audit is the current comparative
assessment; the companion progress plan is the active execution document.

Documentation must remain source-linked. Update the route/contract inventories
from their generators, add the current error catalogue and adapter ownership,
and update `docs/INDEX.md` whenever this audit or its plan changes state.

API-local documentation also needs repair: its index contains obsolete absolute
workspace paths and links to missing documents; the local OpenAPI snapshot has
186 paths while the contract audit has 194 routes and lacks a generation/CI
drift gate. Mark outdated migration/audit checkpoints as superseded rather
than leaving them active, normalize unsupported document statuses, and add
frontmatter to the runbook template. Create stable API-local references for
the public error catalogue and API surface/versioning policy after the Phase 1
wire contract is accepted.

## Verification standard

Before declaring a phase complete, require the API composition, contracts,
error taxonomy, authorization parity, data-boundary, focused test, and
anti-slop gates to pass. Add negative tests asserting that 4xx/5xx responses
contain no stack, SQL, provider, policy, secret, or PII fields. Test malformed
content types/size limits, BOLA/property/function authorization, idempotency,
dependency timeouts, 202 operations, retry behavior, OpenAPI conformance, and
trace/redaction propagation.
