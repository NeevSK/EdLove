# @repo/sanctuary-api — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Gurudevi backend API — Hono, @orpc, OpenTelemetry, AI SDK, Cedar authorization.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/database](../stack-map.md#repodatabase) | core | Data-access layer — ZenStack ORM + Postgres, schema-driven queries. |
| [@repo/policies](../stack-map.md#repopolicies) | domain | Authorization policy domain — Cedar WASM decision engine (permissions as data). |

## External deps (37 direct)

```text
@ai-sdk/anthropic
@ai-sdk/google
@ai-sdk/openai
@growthbook/growthbook
@hono/bun
@hono/node-server
@hono/swagger-ui
@hono/zod-openapi
@modelcontextprotocol/server
@opentelemetry/api
@opentelemetry/context-async-hooks
@opentelemetry/core
@opentelemetry/exporter-trace-otlp-http
@opentelemetry/resources
@opentelemetry/sdk-trace-base
@opentelemetry/semantic-conventions
@orpc/client
@orpc/contract
@orpc/mcp
@orpc/openapi
@orpc/server
@scalar/hono-api-reference
@sentry/node
@supabase/server
@tanstack/ai
@tanstack/ai-anthropic
@tanstack/ai-gemini
@tanstack/ai-openai
ai
dotenv
foglamp
hono
inngest
pino
pino-pretty
posthog-node
zod
```

## Dev tooling (8)

```text
@biomejs/biome
@vitest/coverage-v8
cross-env
tsdown
tsup
tsx
typescript
vitest
```

## Coupling notes

Binds core (contracts) + database (ZenStack) + policies (Cedar). Web/mobile talk to it; keep contracts in @repo/core.

