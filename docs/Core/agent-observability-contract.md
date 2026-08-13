---
title: "Agent-Visible Observability Contract"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [core, observability, sentry, posthog, logging, agents, otel]
---

# Agent-Visible Observability Contract

When an app misbehaves, agents and humans must be able to query the same trail and
reach the same conclusion. This contract defines what is observable, where each
signal flows, and the exact shape of the structured log lines that both agents and
humans read.

It is enforced by `scripts/check-observability-boundaries.mjs`. Keep this document
consistent with that script — they are the same contract in two forms.

---

## 1. Signals by Destination

| Signal | Tool | Where it is owned | What it carries |
|---|---|---|---|
| Structured app/API logs | pino (`@repo/core/logic` → `packages/core/src/logic/utils/logger.ts`) | `logger` + `createChildLogger({schoolId, userId, module})` | Request/session-scoped diagnostics |
| Crash/error reporting | Sentry (native + browser adapters) | `packages/core/src/adapters/native/SentryTelemetryAdapter.*` + `web/SentryTelemetryAdapter.*`; registered first in `packages/core/src/native/bootstrap.ts` | Breadcrumbs, exceptions, user identity |
| Product analytics events | PostHog | gated on `EXPO_PUBLIC_POSTHOG_API_KEY` + `EXPO_PUBLIC_POSTHOG_ENABLED !== 'false'` + `isAnalyticsEnabled` flag | `app_started` and product events |
| Server tracing | OpenTelemetry | `apps/sanctuary-api/src/telemetry/otel.ts` (`otelMiddleware`, `getCurrentTraceId`) | Trace context per API request |

Ownership boundaries (enforced by `check-observability-boundaries.mjs`):
- Sentry SDKs may only be imported inside `packages/core/src/adapters/native|web/SentryTelemetryAdapter.*`, `__tests__`/`__mocks__`, `jest-setup`, `vitest.config`, `metro.config`, `src/shims`.
- PostHog SDKs may only be imported inside `packages/analytics/src` or tests.
- OpenTelemetry SDKs may only be imported inside `apps/sanctuary-api/src/telemetry/`.
- A runtime module must never mix Sentry + PostHog, or OpenTelemetry + Sentry/PostHog.

Consent: Sentry is only initialized after consent is granted, and revoked consent
calls `optOutTelemetry()` + `clearSentryUser()` (see `apps/gurudevi-mobile/app/_layout.tsx`).
Never log to Sentry/PostHog before consent.

---

## 2. Structured Log Contract (pino / single-line JSON)

Every diagnostic log line MUST be a single line of JSON with at least:

```jsonc
{
  "event": "domain.action.result",   // e.g. "orpc.procedure.ok"
  "requestId": "req_...",            // correlation across the whole request
  "traceId": "trace_...",            // present in sanctuary-api (otel)
  "userId": "..." ,                  // subject id (NOT raw session metadata)
  "level": "info",                   // pino level
  "time": "2026-08-13T...",          // ISO-8601 UTC
  "durationMs": 12                   // when timing is available
}
```

Rules:
1. `event` uses `domain.action.result` — never free-form messages.
2. Every event MUST include `requestId`; include `traceId` where available.
3. Include `userId` only when a real subject is resolved (never the raw JWT payload dump).
4. **Never log secrets, tokens, cipher keys, session objects, or PII.**
5. Use `logger` / `createChildLogger` from `@repo/core/logic` (single source), not ad-hoc `console.*`, for diagnostics that need to be queried later.
6. `console.error` is allowed at boundaries that already use it (e.g. sanctuary-api `app.onError`) — but the payload must still carry `requestId` and `traceId`.

Current server events (canonical examples — mirror these): `orpc.procedure` and
`orpc.authorization` (emitted by `doubleGateMiddleware` in
`apps/sanctuary-api/src/core/orpcMiddleware.ts`), and `[requestId] [trace=...] UNCAUGHT:`
in `apps/sanctuary-api/src/core/app.ts`.

---

## 3. Correlation Flow

1. Hono assigns `requestId` (`hono/request-id`) to every `/api/*` request.
2. `otelMiddleware` stamps `traceId`; `getCurrentTraceId()` re-exposes it in handlers and middleware.
3. The oRPC context carries both (`buildORPCContextFromHono` in `apps/sanctuary-api/src/core/router.ts`).
4. An agent investigating a failure takes the `requestId` from a client error and greps the log trail for that id; every hop on that request shares the same `requestId`.

---

## 4. Agent Rules

- **Investigate, never fabricate**: an agent claiming "the app is broken" must cite the `requestId`/`traceId` and the log lines that support it.
- **Query order**: server-side first (structured logs / OTel), then client (Sentry breadcrumbs), then product (PostHog) — in that order, cheapest to most expensive.
- **Do not add SDKs outside the allowed ownership set** in §1. If a signal cannot be produced inside an owned boundary, add it there or file it as a boundary violation — do not import Sentry/PostHog/OTel ad hoc.
- **New events**: register the `event` name here before shipping a new structured event.

---

## 5. Consumers

- Humans: `adb logcat`, Metro console, `pnpm --filter gurudevi-mobile dev`, `pnpm --filter sanctuary-api dev` (pino JSON on stdout).
- Agents: the in-repo MCP tooling (`packages/platform-mcp` Audit/Maintenance services) plus direct log-file greps. A dedicated MCP `debug_logs` reader may be added in Phase 2 of the orchestrator plan — it will read the SAME contract defined here.

---

## 6. Verification

- `pnpm run check:observability-boundaries` runs `scripts/check-observability-boundaries.mjs` (import ownership isolation).
- Grep gates: any new runtime log must match the single-line JSON shape above.
- Sentry/PostHog init must stay consent-gated; new product events go through `packages/analytics`.

## 7. References

- `scripts/check-observability-boundaries.mjs` — the enforced ownership rules
- `packages/core/src/logic/utils/logger.ts` — pino logger + `createChildLogger`
- `packages/core/src/native/bootstrap.ts` — telemetry adapter registration order
- `apps/gurudevi-mobile/app/_layout.tsx` — consent-gated Sentry/PostHog init
- `apps/sanctuary-api/src/telemetry/otel.ts` — OTel middleware + `getCurrentTraceId`
- `apps/sanctuary-api/src/core/orpcMiddleware.ts` — canonical structured events
