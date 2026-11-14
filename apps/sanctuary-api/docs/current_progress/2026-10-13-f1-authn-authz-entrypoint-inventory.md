---
title: "F1 Authn, Authz, Tenant Isolation, and Entrypoint Inventory"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [f1, authn, authz, tenant-isolation, entrypoints, security, audit]
---

# F1 Authn, Authz, Tenant Isolation, and Entrypoint Inventory

## Scope and evidence status

This is the first F1 inventory pass over the current Hono app registration, API middleware, oRPC context, policy middleware, route families, tests, and public entrypoints. It is G0 static/source evidence. It is not a production proxy configuration review, penetration test, or complete route-by-route authorization proof.

## Entrypoint matrix

| Family | Current entrypoint | Authentication/authority path | Current status | Required action |
| --- | --- | --- | --- | --- |
| Health | `/health/live`, `/health/ready` | Public by design | Intended public operational surface | Confirm response minimization and monitoring policy |
| API native RPC | `/api/*` native mounts | API JWT middleware → request DB → active bond; oRPC context → double gate/Cedar | Strong shared path, but two context builders exist | Compare contexts and produce route-family coverage |
| API OpenAPI reads | `/api/openapi/*` | Same API middleware; read-only oRPC filter | Reuses router but separate handler | Verify identical scope/errors/caching |
| AI chat | `/api/ai/*` | API JWT middleware plus AI POA/feature gate | Separate Hono route and error/streaming path | Canonical AI error/stream/operation semantics |
| Durable agents | `/api/durable-agents/*`, `/api/inngest` | API middleware plus route/worker checks | Separate Hono route and worker system | Prove event authenticity, repair, and worker auth |
| PowerSync/ad rewards | `/api/powersync/*`, `/api/ad-rewards/*` | API middleware plus handler checks | Mixed native/direct routes | Verify idempotency, tenant scope, and error mapping |
| WhatsApp | `/webhooks/whatsapp` | Provider verification/HMAC path | Outside `/api/*` middleware | Independent signature, dedupe, rate/abuse and receipt audit |
| PayHere | `/payments/payhere-webhook` | Provider signature/merchant checks | Outside `/api/*` middleware | Independent replay, lock, receipt and error audit |
| Development diagnostics | `/dev/diagnostics` | No visible auth/production guard in inspected registration | **P0 concern**: described as development-only but mounted unconditionally | Disable outside development or add explicit authenticated/internal boundary before deployment |
| API documentation | `/doc`, `/ui`, `/reference` | Public | Intentional discovery surface | Confirm production data/schema exposure policy |

## Authentication findings

### Observed strengths

- API bearer tokens are cryptographically verified rather than trusted from caller identity headers.
- Production startup requires issuer, audience, and signature verification configuration.
- Expiry, not-before, supported algorithm, subject, JWKS/static-key paths, and bounded verification cache are implemented.
- Anonymous/onboarding paths are explicitly recognized rather than accidentally falling through protected procedures.

### Open assurance questions

- Is the configured proxy guaranteed to strip/overwrite trusted client headers before the rate limiter sees them?
- How quickly do key rotation and token revocation take effect across process-local caches?
- Are webhook/provider credentials rotated and monitored under the same operational owner as JWT keys?
- Are development/test identity shortcuts impossible in every production build/runtime configuration?
- Is `/dev/diagnostics` unreachable or rejected in production deployment, including alternate runtime entrypoints?

## Authorization findings

### Observed strengths

- Active bond/scope is resolved from server-side user preferences and relationship data.
- oRPC contracts are required to carry policy metadata by contract conversion.
- `doubleGateMiddleware` rejects anonymous procedures, missing policy metadata, and failed Cedar authorization.
- Classroom/resource facts are derived from database records for several resource types.
- The request-scoped database is created with the authenticated principal.

### Coherence risks

- `parseORPCContext` and `buildORPCContextFromHono` duplicate context resolution with different call sites and failure behavior.
- Hono POA and oRPC double-gate derive related policy facts independently.
- Non-oRPC routes (AI, durable agents, webhooks, payments, diagnostics) do not automatically receive oRPC policy metadata coverage.
- `context.principal` contains arrays such as classroom IDs and child IDs whose completeness is not globally proven for every role.
- Direct handlers use broad database typing, making it harder to prove that every query is scoped and every output is redacted.

## F1 required artifacts

1. One canonical request-principal/context contract or an explicit, tested adapter for each protocol.
2. Route-family policy matrix covering native RPC, OpenAPI, AI, agents, sync, webhooks, payments, and diagnostics.
3. Server-derived actor/scope matrix for teacher, principal, student, parent/guardian, anonymous, former role, and operator.
4. Production/non-production entrypoint policy, with `/dev/diagnostics` resolved before any protected release.
5. Proxy trust contract for rate-limit and correlation headers.
6. Negative tests for forged IDs, stale roles, tenant crossing, receipt lookup, account switching, and provider replay.
7. Evidence report distinguishing mocked policy checks from real database/identity/proxy behavior.

## F1 gate

**Status: not passed.** The core API path has meaningful controls, but route-family parity and the unconditional development diagnostics entrypoint prevent a coherent foundation claim. No protected new door should rely on “the API is authenticated” as a substitute for this inventory.

## Verification boundary

This inventory is static/source evidence from the current repository. It does not prove deployment routing, reverse-proxy behavior, production environment selection, key rotation, revocation latency, or exploit resistance. Those require INT/AUTHZ/FAIL evidence and an independent security challenge.

## Approved diagnostics containment addendum

The unconditional diagnostics finding above is historical baseline. On 2026-10-13 the human explicitly approved development-only registration. `src/core/app.ts` now registers `/dev/diagnostics` only for resolved `NODE_ENV=development`, retaining the existing handler and mobile development caller. G1 / Vitest boundary evidence in `dev-diagnostics.test.ts` covers production/test/unset absence, preserved development scratch output, and existing malformed-body behavior with filesystem/database substitutes. The combined identity/sync/diagnostics selection yielded 25/25 tests across four files.

This closes the demonstrated unconditional-registration gap, not F1: deployment environment correctness, proxy trust, authority-context parity, tenant-negative coverage and independent review remain open. See the [reconciled foundation gate](../decisions/2026-10-13-horizontal-foundation-gate.md) for current stage status and the installed-dependency verification blocker.
