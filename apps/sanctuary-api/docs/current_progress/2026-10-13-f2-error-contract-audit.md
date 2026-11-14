---
title: "F2 Error, Contract, Timeout, and Observability Boundary Audit"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [f2, errors, contracts, timeout, cancellation, observability, audit]
---

# F2 Error, Contract, Timeout, and Observability Boundary Audit

## Audit scope

F2 asks whether an expected failure travels coherently from domain/application logic to a client and operator, and whether a defect is separated from a recoverable business failure. Inspected: `SovereignError`, error normalization, Hono `onError`, oRPC middleware/contracts, Hono timeout/rate-limit middleware, AI routes, webhook routes, durable-agent routes, direct response paths, and focused tests.

This is G0 static evidence plus previously executed G1 boundary tests. It is not a streaming runtime, cancellation, provider, production log-redaction, or client-compatibility proof.

## Intended horizontal boundary

```text
domain/application failure
  → canonical typed error or defect
  → declared oRPC error when procedure transport
  → protocol adapter (Hono/RFC 9457, stream, webhook, provider)
  → stable client action + structured operator evidence
```

The boundary must preserve: stable code/type, category, safe message, retryability, operation/receipt ID, conflict/version metadata where safe, request/trace correlation, and redacted diagnostics. Cause, stack, SQL, tokens, provider payloads, and raw prompts remain server-side.

## Current inventory

| Path | Current mechanism | Finding |
| --- | --- | --- |
| Hono outer app | `app.onError` + `normalizeError` + `application/problem+json` | Good outer fallback; cannot repair an already-started stream |
| oRPC procedures | `ORPCError`, `toORPCError`, middleware and contract metadata | Typed path exists, but declared procedure error maps are not visibly universal |
| Domain/application | Mixed `SovereignError`, `ORPCError`, raw `Error`, and message-based normalization | Expected failures and defects remain mixed |
| AI chat | Custom validation/circuit/provider handling; streamed response | Separate stream and persistence failure semantics; response completion is not a domain receipt |
| AI student-potential | Direct JSON `{ error: ... }` responses and custom 503 | Bypasses canonical error envelope |
| WhatsApp | Direct text responses and background handling | Provider protocol is intentionally different but lacks shared operation/error semantics |
| PayHere/ads | Direct text responses, provider-specific statuses | Protocol adapter needed; not comparable to ordinary client errors without mapping |
| Durable agents | Direct JSON status/error responses and worker raw errors | Run state exists; error category/retry/repair semantics are not one contract |
| Health | Direct JSON readiness/liveness | Correctly protocol-specific, but readiness coverage is narrow |
| Timeout | Hono `timeout` races `next()` | Does not automatically cancel underlying DB/fetch/worker work |
| Rate limit | Custom JSON `RATE_LIMITED` response | Needs canonical code/retry metadata alignment with oRPC/problem details |
| Logging | Pino/logger, OTel, Sentry, direct `console.*` | Structured infrastructure exists, but route-level content/redaction policy is not universal |

## Critical findings

### E1 — Error vocabulary is not singular

`SovereignError`, `ORPCError`, `HTTPException`, direct JSON, direct text, and raw `Error` are all active. Clients may need transport-specific parsing rather than one stable machine contract. This blocks cross-door capability behavior.

**Gate:** define canonical codes/categories and adapters; do not require one wire format for provider/webhook protocols, but require one semantic mapping.

### E2 — Retryability is not encoded consistently

The shared error type has agent actions and some retry guidance, but many direct errors and ORPC errors do not expose stable retryability, `Retry-After`, operation IDs, or conflict metadata. A client cannot safely distinguish “retry,” “refresh,” “reauthenticate,” “wait,” and “do not retry” across all routes.

**Gate:** every error category maps to client action and operator action. Human messages are never machine protocol.

### E3 — Domain errors and defects are mixed

Raw errors remain in agent workers, AI/provider code, scope resolution, configuration, and legacy handlers. Message-based normalization is useful migration protection but is not a durable taxonomy.

**Gate:** classify expected errors, dependency failures, conflicts, and defects at the application boundary. Effect remains optional; the semantic separation is mandatory.

### E4 — Streaming has a separate failure boundary

Hono’s outer `onError` cannot rewrite a response after streaming begins. AI streams therefore need explicit stream error events/callbacks, final status semantics, usage/persistence failure policy, and reconnect/replay guidance.

**Gate:** define what the client knows if the stream drops before/after provider generation, persistence, usage logging, or domain proposal creation.

### E5 — Timeout is not cancellation

The installed Hono timeout middleware races the downstream promise. It does not, by itself, prove that database, fetch, model, or worker work stopped. A timed-out mutation can therefore complete after the caller sees failure.

**Gate:** every mutation that can outlive a request needs operation state, cancellation where supported, or an unknown/receipt/reconciliation path.

### E6 — Direct protocol paths need explicit adapters

Direct JSON/text responses are not automatically defects: webhooks and provider handshakes have protocol obligations. The problem is that the current distinction is implicit. AI, agents, diagnostics, health, and provider paths need a declared protocol class, redaction rule, correlation rule, and failure contract.

**Gate:** classify each direct path as `client-api`, `stream`, `provider-webhook`, `health`, `internal`, or `development`; reject undeclared response dialects in review.

## F2 remediation tasks

| ID | Task | Evidence |
| --- | --- | --- |
| F2-01 | Define canonical error code/category/retryability catalogue | G0 schema and mapping table |
| F2-02 | Declare oRPC procedure errors for the selected capability and representative route families | G0/G1 contract inspection |
| F2-03 | Map canonical errors to Hono RFC 9457 problem details | G1 response assertions |
| F2-04 | Define stream-specific error/completion/reconnect semantics | G0/G2 stream scenario; runtime later |
| F2-05 | Define timeout/cancellation/unknown-operation policy | G0/G2 failure contract |
| F2-06 | Audit direct JSON/text routes and assign protocol class | G0 inventory |
| F2-07 | Add operation/receipt/correlation fields where mutations can outlive requests | G0/G1 then INT |
| F2-08 | Define logging/redaction allow-list for content, secrets, IDs, prompts, provider errors | G0 policy + G1 redaction tests |
| F2-09 | Replace message parsing as primary classification; retain migration fallback only with telemetry | G1 classification tests |
| F2-10 | Run representative read/validation/auth/policy/conflict/dependency/timeout/stream failures | G2 scenario evidence |

## F2 gate

### Empirical addendum: converter and client seams

On 2026-10-13 a read-only `pnpm exec tsx -e` probe in the API package constructed a route using the actual `toORPCContract` converter, with a declared Zod input and response schema. Inspected metadata was:

```json
{"hasInput":true,"hasOutput":false,"errorCodes":[]}
```

The installed `@orpc/contract` package is 1.15.4. Its implementation records `.output(...)` as `outputSchema` and `.errors(...)` as `errorMap`. The repository converter creates route/meta/input but does not map `responses` to `.output(...)` or declared errors. This contradicts earlier broad descriptions of automatic contract-level output validation. It does not prove that every router is unvalidated: native `~orpc` procedures are passed through and individual handlers may validate/map their DTOs. Those paths require separate coverage.

| ID | Grounded finding | Consequence and next bounded task |
| --- | --- | --- |
| E7 | `src/core/orpc.ts` drops response schemas in the converted route branch | Add converter characterization first: input, successful output, status selection, nullable/204 response, malformed output and extra sensitive field. Specify a compatibility-preserving mapping before changing it. Do not claim schema existence equals execution validation. |
| E8 | `toORPCError` returns only status-derived code, safe message, and data containing code/request ID | Category, retry timing, resolution advice and operation identity are not preserved. An error's `instance` may be absent; mapping does not inject the current request ID. Specify safe data for declared errors and trace error paths outside the handler catch. |
| E9 | `packages/core/src/api/orpcClient.ts` uses `createORPCClient<any>` | Shared client existence is not proof of inferred contract types. Establish a browser/native-neutral contract aggregate and type evidence before claiming end-to-end typing. The old documentation points to `orpc.contract.ts`, which was absent in the inspected tree. |
| E10 | RPC retry defaults allow two retries outside development for status >=500, 429 or 408; 503 is always excluded | Policy does not distinguish reads from unsafe writes, or real dependency 503 from synthetic offline 503. Establish operation-aware retry plus total deadline; transport dedupe of GETs is not mutation idempotency. This observation identifies a policy risk, not a reproduced duplicate. |
| E11 | `authenticatedSovereignFetch` maps AbortError and network failures to synthetic offline 503 | Explicit user cancellation becomes indistinguishable from offline/unreachable. Define cancellation separately, and retain unknown-commit state for an interrupted write. |
| E12 | `lib/sync/errorClassifier.ts` defaults unmatched errors to TRANSIENT and parses messages/codes | Default permits treating malformed/forbidden/defect failures as retry candidates. A targeted caller search found tests but no production `classifyError(...)` invocation; do not claim a live retry storm. Establish actual upload/outbox ownership before adopting this helper. |

**Evidence classification:** local contract-construction probe using installed packages, no network/database/provider substitutions or effects. Proves the inspected converter metadata for the supplied route. Does not prove full route coverage, production wire output, exploitability, safe retries, or client/device execution.

A second read-only tsx probe called the real `classifyError` helper with oRPC-shaped errors. BAD_REQUEST/400, FORBIDDEN/403, CONFLICT/409 and UNAUTHORIZED/401 all returned TRANSIENT. The code chooses `error.code` before `error.status`, so a symbolic code masks the numeric status; message heuristics then fail for the tested safe messages. This proves helper incompatibility for these inputs only. No production caller was found by the targeted search.

### Protocol correction

Native oRPC errors must retain oRPC's error encoding. Hono `onError` does not automatically reserialize errors already handled by the RPC handler. RFC 9457 applies to ordinary HTTP API adapters, not an unconditional rewrite of every oRPC response. Provider handshakes and streamed failures retain protocol-specific adapters. Coherence means one semantic catalogue with tested projections—not one JSON envelope imposed on incompatible protocols.

**Status: not passed.** The API has an error-handling substrate and passing sanitization tests, but it does not yet have one coherent horizontal error contract across all active transports and asynchronous boundaries.

Protected vertical implementation may proceed only in design or private test mode until F2-01 through F2-05 are accepted for the selected capability.

## Verification boundary

This audit is static/source evidence plus focused G1 tests previously run for sanitization/security boundaries. It does not prove streaming behavior, cancellation, provider delivery, client compatibility, log redaction in production, or defect classification completeness.
