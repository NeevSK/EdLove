---
title: "Effect and OpenTelemetry Production Roadmap"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [effect-ts, opentelemetry, observability, roadmap, production-guidance]
---

# Effect and OpenTelemetry Production Roadmap

This is the living implementation guide for completing the Effect and OpenTelemetry adoption without turning either technology into a universal abstraction.

## Phase 0 — Freeze the contract

Before adding more instrumentation:

- Keep Effect v3 aligned with the current React Native compatibility decision.
- Keep Sentry responsible for operational errors and PostHog responsible for product analytics.
- Keep OTel backend-first and runtime-neutral for the shared Hono app.
- Require sanitized, low-cardinality telemetry attributes.
- Treat source-map upload failure as a visible release warning, not a build blocker.

Exit gate: the coherence audit and this roadmap are linked from the relevant indexes and reviewed as the source of truth.

## Phase 1 — Finish API tracing proof

Implement in this order:

1. Select the production runtime for the first release path: Node is preferred for automatic instrumentation; Bun remains a supported Hono runtime.
2. Deploy or select an OTLP collector/backend and configure endpoint authentication through secrets.
3. Add a real trace smoke test from an API request to the collector.
4. Add safe outbound spans for owned database/Supabase and AI transport boundaries. Do not instrument blindly if the client library leaks payloads or duplicates server spans.
5. Attach request ID and trace ID to Sentry API errors through the existing telemetry boundary.
6. Add dashboards and alerts for API error rate, p95 latency, exporter health, and trace ingestion—not for raw span volume alone.

Exit gate: a trace is searchable end-to-end, exporter outage is harmless, and no sensitive attributes appear in an exported span.

## Phase 2 — Complete Effect coherence

Use a risk-based adoption matrix:

| Priority | Candidates | Effect requirement |
|---|---|---|
| P0 | Auth/session lifecycle, device account operations, sync credentials, permission snapshot refresh | Typed failure, bounded retry/timeout, boundary test, Sentry once |
| P1 | High-value Supabase mutations, external APIs, audit side effects, AI orchestration | Typed adapter errors and structured concurrency where multiple operations compose |
| P2 | Complex multi-step domain workflows | Effect composition only when it reduces failure ambiguity or coordination cost |
| Never by default | Leaf UI, simple queries, presentational state, stable Promise ports | Keep existing Promise/TanStack Query contract |

For every migration, record:

- typed error names and causes;
- retry safety and timeout policy;
- cancellation/cleanup behavior;
- Sentry reporting owner and duplicate suppression;
- Promise-facing compatibility boundary;
- tests for success and failure.

Exit gate: no adopted Effect workflow bypasses the shared boundary helpers, and no fire-and-forget failure disappears silently.

## Phase 3 — Add metrics and structured operational logs

Only after traces are reaching the backend:

- Add low-cardinality API counters and latency histograms.
- Keep PostHog event names out of OTel metrics.
- Keep structured logs correlated by request ID and trace ID.
- Define retention and sampling separately for normal traffic, errors, and high-cost AI routes.

Exit gate: operators can answer what failed, where latency accumulated, and whether the problem is application, dependency, or telemetry infrastructure.

## Phase 4 — Mobile correlation decision

Do not install a mobile OTel SDK automatically. Reassess only when all are measurable:

- bundle-size increase;
- battery and startup impact;
- offline queue behavior;
- privacy review;
- API `traceparent` propagation through the actual networking client;
- release/source-map compatibility.

If the evidence is unfavorable, keep mobile Sentry plus API-side OTel and correlate through request IDs rather than forcing client spans.

## CI and review gates

Add or maintain these checks:

- reject `Effect.promise` in application/package source;
- reject direct Sentry/PostHog SDK imports outside approved adapters;
- require telemetry tests for new Effect boundaries;
- run focused OTel tests in API CI;
- validate source-map upload independently and non-blockingly;
- run typecheck, lint, and duplication checks without claiming repository health when unrelated baseline failures remain.

## Practical decision rule

Implement another slice only when it improves one of these measurable outcomes:

1. a failure becomes typed and exhaustively handled;
2. a request/dependency relationship becomes traceable;
3. an operational alert becomes actionable;
4. a privacy boundary becomes stronger;
5. a user-facing error becomes safer and clearer.

Otherwise, document the case and leave the existing simpler abstraction in place.
