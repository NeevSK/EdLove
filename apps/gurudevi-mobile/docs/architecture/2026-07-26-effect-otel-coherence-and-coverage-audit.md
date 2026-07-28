---
title: "Effect and OpenTelemetry Coherence and Coverage Audit"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [effect-ts, opentelemetry, observability, coverage, architecture, audit]
---

# Effect and OpenTelemetry Coherence and Coverage Audit

## Executive decision

Do not start another broad migration round. The foundation is usable, but the system is not yet fully coherent or fully covered. The next round should be a bounded hardening round driven by the gaps below.

The target architecture is:

```text
Fallible workflow       → Effect typed failure
Boundary conversion     → APIError / SovereignError
Operational failure     → Sentry through ITelemetry
Product behavior        → PostHog through IAnalyticsPort
Cross-service timing    → OpenTelemetry traces
User-facing state        → TanStack Query / UI state
```

These systems are complementary. None should become a universal event bus or replace another system's ownership.

## Evidence-based current state

| Area | Implemented evidence | Coverage assessment | Decision |
|---|---|---|---|
| Effect primitives | Shared `tryPromise`, `runEffect`, and `fireAndForget` helpers in `packages/core/src/utils/effect.ts` | Strong at adopted core boundaries | Keep and standardize |
| Effect source hygiene | No `Effect.promise` remains in `packages/` or `apps/` TypeScript source | Strong negative invariant | Add CI guard |
| Effect adoption | Effect imports exist in 16 core files, concentrated in auth, sync, API, growth, and device workflows | Partial by design; not every async function is Effect | Expand by risk, not file count |
| Promise API boundaries | UI and public ports still expose Promise APIs | Intentional and correct for incremental adoption | Preserve compatibility |
| Typed error boundary | Effect failures convert at Promise/UI boundaries and report through Sentry gateway | Partial coverage; every adopted workflow needs a tested boundary | Add boundary checklist |
| Sentry | Native/web adapters, safe-data filtering, duplicate suppression, source-map workflow | Operational error path is established | Add trace correlation where useful |
| Product analytics | PostHog gateway and adapter-level sanitization | Established, but event taxonomy is a separate product-governance concern | Do not mix with OTel |
| API OTel bootstrap | Runtime-neutral provider, OTLP/HTTP, sampling, batching, kill switch | Implemented for Hono API | Configure collector before production claim |
| API OTel request spans | `/api/*` spans with route/method/status/request ID/runtime/duration | Implemented and tested | Keep attributes allow-listed |
| OTel propagation | W3C extraction and `fetchWithTrace`; JWKS fetch uses it | Partial downstream coverage | Instrument remaining owned transports |
| OTel mobile | No React Native/browser OTel SDK | Intentionally deferred | Do not add yet |
| OTel metrics/logs | No unified OTel metrics/log pipeline | Missing | Add only after trace backend is operational |
| Collector/backend | No repository-owned collector deployment or alert configuration | Missing operational proof | Required before production rollout |
| Full repository verification | Focused tests pass; repository-wide typecheck has unrelated alias/schema failures | Verification baseline is not green | Track separately; do not hide it |

## Coherence rules

### Error ownership

1. Expected domain and infrastructure failures are typed inside Effect.
2. A boundary converts the failure once into the application error contract.
3. Sentry receives operational failures once, with sanitized context.
4. PostHog receives intentional product events only.
5. OTel records timing and dependency relationships, not user narratives or educational payloads.

### Correlation ownership

- `requestId` is the human-readable API correlation value.
- `traceparent`/`tracestate` carry distributed trace context.
- `x-trace-id` is a response diagnostic value, not a product identifier.
- Sentry issue context may include request/trace correlation, but must not turn trace IDs into analytics dimensions.

### Privacy ownership

Every telemetry path must use an allow-list for attributes. Never add raw headers, request bodies, query strings, tokens, email addresses, names, student IDs, school IDs, message content, or unrestricted metadata to spans, analytics, or Sentry context.

## Coverage gaps that matter

### P0 — production proof

- Configure and test the OTLP collector/backend, authentication, retention, and alert ownership.
- Prove exporter outage does not change an API response or create noisy application alerts.
- Add a release smoke test that verifies a real trace reaches the collector.
- Resolve the repository-wide typecheck baseline so observability changes are not validated in a partially broken graph.

### P1 — coherence hardening

- Add owned outbound spans for Supabase/database and AI transport boundaries where the runtime/library supports safe hooks.
- Add trace correlation to the API's Sentry error adapter rather than only console logs.
- Standardize Effect boundary tests: success, typed failure, retry/timeout, cancellation where relevant, and exactly-once reporting.
- Add a CI invariant that rejects new `Effect.promise` source usage and direct Sentry/PostHog SDK imports outside adapters.

### P2 — deliberate expansion

- Add backend request/error metrics after trace storage and sampling are stable.
- Define product analytics event contracts separately from operational telemetry.
- Re-evaluate mobile trace propagation only after bundle size, battery, offline buffering, and privacy tests exist.

## Non-goals

- Rewriting every Promise-returning API into Effect.
- Adding Effect to leaf UI components, simple CRUD screens, or Zustand state.
- Adding React Native OTel instrumentation merely to claim numerical coverage.
- Capturing SQL text or AI prompts/completions by default.

## Completion definition

The system can claim coherent production observability when P0 is complete, P1 is substantially complete, and each new workflow declares its Effect boundary, error owner, telemetry destination, correlation behavior, privacy allow-list, and tests.
