---
title: "Sanctuary API"
status: "active"
created: 2026-08-20
updated: 2026-10-15
author: "Naveen"
scribe: "Antigravity"
tags: [apps, sanctuary-api, hono, orpc, openapi]
---

# Sanctuary API

The sovereign backend and verification service for the EdLove & Gurudevi Sanctuary ecosystem. Built with **Node.js**, **Hono**, and **oRPC**, providing type-safe RPC contracts, OpenAPI schemas, and telemetry for the mobile and web clients.

---

## Capabilities & Architecture

- **Protocol**: oRPC contract-first RPC with OpenAPI 3.1 documentation (`@orpc/server`, `@orpc/openapi`).
- **Framework**: Hono with `@hono/node-server` and Bun compatibility.
- **Verification & Settlement**: Cryptographic assignment receipt settlement, media upload policy enforcement, and permission snapshot verification.
- **AI Gateway**: Unified multi-provider AI pipeline supporting TanStack AI and Vercel AI SDK (Anthropic, Gemini, OpenAI, DeepSeek).
- **Observability**: Distributed OpenTelemetry tracing (`@opentelemetry/api`, OTLP exporter), Pino logging, and Sentry error tracking.
- **Background Jobs**: Inngest workflow orchestration for asynchronous sync and settlement tasks.

---

## Quick Start

```bash
# From monorepo root
pnpm install

# Run with Doppler secrets injection (team)
pnpm --filter @repo/sanctuary-api dev

# Run without Doppler (local fallback)
pnpm --filter @repo/sanctuary-api dev:no-doppler
```

---

## Commands

Run from `apps/sanctuary-api`:

| Command | Action |
|---------|--------|
| `pnpm dev` | Start development server with file watch |
| `pnpm build` | Bundle production server to `dist/` using tsup |
| `pnpm start` | Run production bundle |
| `pnpm test` | Run G1 Vitest test suite |
| `pnpm test:integration` | Run G3 integration tests |
| `pnpm lint` | Run Biome linter |

---

## Security & Secrets

Secrets are managed via Doppler (`gurudevi-mobile:dev`) and runtime injection. No private keys, database URLs, or API tokens are committed to source control. See [SECURITY.md](../../SECURITY.md) for vulnerability disclosure.
