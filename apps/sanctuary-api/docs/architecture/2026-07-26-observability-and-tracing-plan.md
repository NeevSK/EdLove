---
title: "Sanctuary API Observability and OpenTelemetry Plan"
status: "implemented"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [observability, opentelemetry, tracing, sentry, api]
---

# Sanctuary API Observability and OpenTelemetry Plan

## Decision

The API is the first OpenTelemetry target. The mobile app does not need a second tracing SDK until the API can accept and propagate trace context reliably.

## Current baseline

- Hono supplies request IDs through `hono/request-id`.
- Request timing is already measured with Hono timing middleware.
- Error responses include the request ID through the existing error normalizer.
- AI calls have a separate Foglamp integration when the Vercel AI SDK is enabled.
- Product analytics remain PostHog-owned; operational failures remain Sentry-owned.

## Implemented milestone

The API now has a small runtime-neutral tracing adapter at the Hono boundary that:

1. Extracts incoming W3C `traceparent` when present.
2. Creates a server span for each `/api/*` request.
3. Adds only low-cardinality attributes: route, method, status, request ID, runtime, and duration.
4. Redacts authorization headers, request bodies, user names, school IDs, student IDs, and message content.
5. Provides a safe `fetchWithTrace` boundary for outbound HTTP calls; the current API JWKS call uses it, while SDK-owned Supabase/AI transports remain separate instrumentation follow-ups.
6. Exports through an environment-selected OTLP endpoint with bounded batching and graceful no-op behavior when unset.

## Runtime alignment

The shared Hono app uses `@opentelemetry/api`, `sdk-trace-base`, and OTLP/HTTP. It does not import Node-only auto-instrumentation, so the same middleware remains usable from the Node and Bun entrypoints. Node additionally installs the async-local-storage context manager; Bun keeps explicit propagation through `fetchWithTrace` because context-manager behavior must be validated against the deployed Bun version.

The Node entrypoint is the preferred production runtime for automatic HTTP/database instrumentation. Bun is supported for the Hono boundary and manual outbound propagation, without claiming automatic Node instrumentation coverage.

## Configuration

```text
OTEL_SERVICE_NAME=sanctuary-api
OTEL_SERVICE_VERSION=1.0.0       # optional; APP_VERSION is also accepted
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otel-collector.example/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=redacted
OTEL_TRACES_SAMPLER_ARG=0.10     # 10% parent-based ratio is recommended initially
OTEL_SDK_DISABLED=false          # set true for an emergency kill switch
```

When the endpoint is absent, tracing is disabled. Export timeout is three seconds, batching is bounded to 64 spans, and export failures are logged without changing the API response.

## Completion criteria

- A trace can be followed from an API request through at least one downstream HTTP operation; the JWKS fetch uses `fetchWithTrace`.
- No sensitive request data appears in spans or exporter payloads.
- Unconfigured or unavailable OTLP export never breaks a user request.
- API errors log the request ID and current trace ID when available; Sentry remains the operational error owner at the application boundary.
- A release runbook explains sampling, retention, alert ownership, and rollback.

## Release runbook

1. Configure the OTLP endpoint and credentials as deployment secrets, never in source control.
2. Start with 10% sampling for production and 100% sampling only for short diagnostic windows.
3. Alert on exporter health and API error rate separately; an exporter outage must not page as an API outage by itself.
4. Retain traces according to the collector/backend policy, with shorter retention for high-volume AI routes.
5. Roll back by setting `OTEL_SDK_DISABLED=true` or removing the endpoint; this leaves Sentry and PostHog unaffected.

## Explicitly deferred

- React Native OpenTelemetry instrumentation.
- Full database query text capture.
- User identifiers as span attributes.
- Replacing PostHog funnels or Sentry exception tracking with OTel logs.
- Node-only automatic instrumentation for the Bun entrypoint.
