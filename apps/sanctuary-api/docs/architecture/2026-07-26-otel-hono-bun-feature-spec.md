---
title: "Hono and Bun OpenTelemetry tracing feature specification"
status: "implemented"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [observability, opentelemetry, hono, bun, node]
---

# FEATURE SPEC: Hono and Bun OpenTelemetry tracing

## Blast Zone: AMBER

## Target Files

- `apps/sanctuary-api/src/telemetry.ts`
- `apps/sanctuary-api/src/core/app.ts`
- `apps/sanctuary-api/src/telemetry/`
- `apps/sanctuary-api/src/__tests__/telemetry.test.ts`

## Reuses

- Hono `requestId()` middleware and `c.get('requestId')` request context.
- Existing `normalizeError` and Sentry error boundary.
- Existing Foglamp bootstrap for Vercel AI SDK observability.
- W3C trace context through `@opentelemetry/api`.

## Does

- Creates one server span for `/api/*` Hono requests.
- Extracts incoming W3C `traceparent` and injects trace context into outbound `fetch` through a reusable helper.
- Exports OTLP/HTTP traces only when explicitly configured.
- Keeps export failures isolated from request handling.
- Redacts identity, tenant, authorization, body, query, and content data from span attributes.
- Supports the shared Hono app under Node and Bun without importing Node-only SDK modules.

## Does Not

- Add OpenTelemetry browser or React Native instrumentation.
- Replace Sentry error reporting or PostHog product analytics.
- Capture request bodies, full URLs, SQL text, user IDs, school IDs, or message content.
- Enable Node auto-instrumentation in the Bun/edge-compatible entrypoint.

## Complexity Budget

- Middleware and helpers: max 180 lines total, cognitive complexity < 15 per function.
- No changes to `apps/gurudevi-mobile/app/_layout.tsx` or `packages/core/src/logic/`.

## Acceptance Criteria

1. Configured OTLP endpoint receives a server span with service identity, method, route, status, request ID, runtime, and duration.
2. Incoming `traceparent` becomes the parent context when valid; malformed context is ignored safely.
3. Outbound helper injects `traceparent` and `tracestate` without exposing credentials or sensitive data; the JWKS transport uses this helper.
4. OTLP unset, unavailable, or failing never changes the API response.
5. Tests verify propagation, redaction, status/error handling, disabled mode, and exporter failure isolation.
