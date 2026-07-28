---
title: "Effect, PostHog, Sentry, and OpenTelemetry Boundary"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [effect-ts, observability, sentry, posthog, opentelemetry, architecture]
---

# Effect, PostHog, Sentry, and OpenTelemetry Boundary

## Decision

Gurudevi keeps PostHog and Sentry as separate capabilities:

| Capability | System of record | Use it for | Do not use it for |
|---|---|---|---|
| Product analytics | PostHog through `IAnalyticsPort` | Feature usage, journeys, funnels, screen views, experiments | Exceptions, stack traces, secrets, raw educational records |
| Operational observability | Sentry through `ITelemetry` | Crashes, unexpected errors, breadcrumbs, releases, user-safe diagnostic context | Product funnels or arbitrary event tracking |
| Typed workflow control | Effect | Typed failures, retries, cancellation, concurrency, dependency injection | Replacing analytics or acting as a UI state library |
| Distributed tracing | OpenTelemetry | Sanctuary API request/downstream correlation and vendor-neutral traces | Immediate mobile dependency before Expo/React Native compatibility is proven |

## Why both PostHog and Sentry remain

They answer different questions. PostHog answers “what are people doing and where do they stop?” Sentry answers “what failed, for whom, in which release, and with what diagnostic context?” Combining them into one gateway would make event semantics ambiguous and increase the risk of sending personal or educational data to the wrong system.

## Privacy and adapter boundary

All third-party telemetry passes through a gateway or platform adapter. Scalar product dimensions may be retained, but identity and educational identifiers, names, email, messages, and nested records are removed by `sanitizeTelemetryData`. Sentry user correlation keeps only the internal user ID; email and display names are not sent. Native and web Sentry adapters both set `sendDefaultPii: false`.

The mobile shell injects the PostHog implementation into the core `IAnalyticsPort`. Direct feature calls use the core monitoring gateway, while the analytics package also sanitizes its own public adapter methods for server and legacy callers.

## Effect boundary

Effect is internal to domain and infrastructure workflows. At a UI, query, event-handler, or API boundary, `runEffect` converts the typed failure into `APIError` and reports the failure through the Sentry gateway. Fire-and-forget workflows report their failure and never silently discard it.

TanStack Query remains responsible for server-state loading/error UI. Effect should be used when a workflow has typed domain failures, retries, timeouts, cancellation, multiple dependent operations, or explicit dependency injection.

## Why OpenTelemetry is not yet a mobile prerequisite

OpenTelemetry is implemented for the API first, where cross-request and downstream correlation has the highest value. The shared Hono middleware is runtime-neutral for Node and Bun, and the API runbook defines sampling, privacy, exporter failure behavior, and rollback. React Native JavaScript instrumentation is still an evolving compatibility area for this Expo application. We will add mobile tracing only after validating bundle size, battery impact, privacy redaction, offline buffering, and trace propagation through the actual network stack.

## What we intentionally did not do

- We did not send product events to Sentry.
- We did not send exceptions to PostHog as analytics events.
- We did not introduce a second mobile tracing SDK before proving the existing Sentry path.
- We did not allow a missing or failed production source-map upload to be treated as a successful Sentry release.
- We did not make telemetry context an unrestricted serialization channel; nested payloads are intentionally dropped.
- We did not convert every Promise-returning port into an Effect API; public package boundaries remain Promise-based for incremental adoption.
- We did not add business logic to `app/_layout.tsx`.

## Verification contract

Every new Effect workflow must document its boundary, failure type, retry policy, and reporting behavior. Tests must cover the success path, typed failure path, cancellation where relevant, and the injected test layer where Layer DI is used.

## Enforcement

`pnpm run check:observability-boundaries` scans runtime source under `apps/` and `packages/` and fails when a provider SDK is imported outside its owned adapter:

- Sentry SDK imports belong to the core Sentry adapters and approved platform/test configuration.
- PostHog SDK imports belong to `packages/analytics` and its tests.
- OpenTelemetry SDK imports belong to the Sanctuary API telemetry module and its tests.
- Runtime modules may not import two provider SDKs directly. Composition happens through the core ports and monitoring gateways.

The check runs in both the repository `check-all` command and the pull-request quality/guard workflows. Platform configuration, test doubles, and boundary-check scripts are explicit exceptions because they configure or verify the adapters rather than emit product/runtime telemetry.
