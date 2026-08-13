---
title: "Gurudevi Observability and Error Handling Guide"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Naveen"
scribe: "Codex"
tags: [observability, error-handling, sentry, posthog, effect-ts, developer-guide]
---

# Gurudevi Observability and Error Handling Guide

## Daily rule

Use PostHog for intentional product behavior and Sentry for operational failure. If an operation is an Effect workflow, keep its failure typed until the boundary, then report it once and convert it to the application error contract.

## Choosing the system

```text
Did the user intentionally do something we want to measure? → PostHog
Did the application fail or behave unexpectedly?            → Sentry
Do multiple backend services need one request trace?         → OpenTelemetry
Does the workflow need typed errors/retry/cancellation?      → Effect
```

## Error handling checklist

1. Define a narrow error type for expected domain or infrastructure failures.
2. Use `Effect.tryPromise` when wrapping fallible I/O.
3. Apply retry and timeout only where the operation is safe to repeat.
4. Use `runEffect(effect, code)` at Promise-facing boundaries.
5. Use `fireAndForget(fn, label)` only for best-effort side effects.
6. Include operation, boundary, code, status, and correlation context in Sentry data.
7. Treat the telemetry gateway as a privacy boundary: identity and educational IDs, email, names, messages, and nested records are removed before third-party delivery.
8. A production mobile release remains publishable if the optional Sentry source-map upload fails; CI emits a warning and preserves the build artifact, but the release must be followed up because Sentry stack traces may remain unmapped.

## CI runtime and Sentry version contract

- Node is pinned to `22.23.2` in `.nvmrc`, the root `engines` range, EAS profiles, and every GitHub Actions workflow through `actions/setup-node`.
- The mobile Sentry stack is intentionally compatibility-aligned with the current Expo 57 / React Native 0.86 graph: `@sentry/react-native` `8.18.0`, `@sentry/cli` `3.6.0`, and `@sentry/browser` `10.64.0`.
- The Android build and manual upload workflows try Sentry's debug-ID upload mode first and fall back to release/dist mode. The upload command returns a failure when both modes fail, while the surrounding job is non-blocking and reports a GitHub warning.
- The CI token must be scoped for CI/source-map work (`org:ci`, plus `org:read` for CLI access). Never print the token or upload user data as release metadata.
9. Never include access tokens, raw session metadata, student records, or unredacted payloads.
10. Translate the failure into a safe user-facing message separately from the diagnostic report.

## Analytics checklist

Analytics events should describe stable product actions such as `attendance_recorded` or `screen_viewed`. Event names must be documented, properties must be allow-listed, and analytics must not be used as an error log.

## OpenTelemetry boundary

OpenTelemetry is now implemented at the Sanctuary API Hono boundary. It creates privacy-safe server spans, accepts W3C trace context, and propagates context through the shared `fetchWithTrace` helper. Node and Bun use the same portable implementation; Node has stronger async context support, while Bun remains explicitly propagated. Mobile instrumentation remains deferred because browser/React Native client instrumentation is still an experimental compatibility area for this Expo application. The API plan and runbook live in `apps/sanctuary-api/docs/architecture/2026-07-26-observability-and-tracing-plan.md`.

The Effect migration is now clear of `Effect.promise` in `packages/core/src`. Keep it that way: wrap fallible I/O with the shared `tryPromise` helper (or `Effect.tryPromise({ try, catch })` when a local error type is required), and do not add new `Effect.promise` calls for operations that can reject.

## Agent instructions

Before changing a RED-zone file, write or update the relevant feature specification and ask for human review of the proposed diff. Reuse the existing Sentry gateway, PostHog port, Effect helpers, and API error contract. Do not create a new telemetry singleton or add reporting directly to screens.
