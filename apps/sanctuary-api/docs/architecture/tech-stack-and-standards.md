---
title: "Sanctuary API Tech Stack & Architecture Standards"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [api, architecture, standards]
---

# Sanctuary API Tech Stack & Architecture Standards

This document specifies the technical stack, runtime constraints, and architectural standards for the Sanctuary API gateway (`apps/sanctuary-api`).

---

## 1. Core Runtime & WinterCG(WinterTC)) Alignment

The Sanctuary API is built to be a platform-agnostic, runtime-flexible gateway. It targets standard runtime environments (Bun, Node.js) and retains structural alignment with WinterCG environments (e.g., Cloudflare Workers, Vercel Edge).

### Constraints & Guidelines
* **Universal Standard APIs**: Avoid native Node.js-specific modules (e.g., `node:crypto`, `node:fs`). Instead, use universal, browser-compatible standard globals like `globalThis.crypto.subtle` for cryptographic signatures and hashes (e.g., MD5 calculation for webhook payloads).
* **Decoupled Server Adaptability**: The core application logic is isolated in [app.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/src/core/app.ts) using `OpenAPIHono` without hardcoded server startup calls. Dedicated entrypoint files wrap this core app for different runtimes:
  - **Bun / Edge Native Entrypoint**: [index.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/src/index.ts) exports a standard `{ fetch: app.fetch, port }` default export, allowing Bun and Edge runtimes to boot natively.
  - **Node.js Server Entrypoint**: [entry-node.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/src/entry-node.ts) launches the app using the `@hono/node-server` adapter.
  - Run Node: `pnpm run dev` or `pnpm run start`
  - Run Bun: `pnpm run dev:bun` or `pnpm run start:bun`

---

## 2. Server Framework & Route Definitions

We use Hono along with `@hono/zod-openapi` to declare strongly typed, self-documenting routing schemas.

* **Schema Contracts**: API schemas are shared from the `@repo/core/api/server` contract definition and bound dynamically using Hono adapters.
* **OpenAPI Specs**: Endpoints are defined using standard OpenAPI specification blocks, enabling automated client generation and live API playgrounds at `/ui`.

---

## 3. Authoritative Identity & Cryptographic Gating

Access control is divided into identity verification and relationship authorization.

### JWT Cryptographic Verification
* **Supabase JWTs**: Incoming `Authorization: Bearer <JWT>` headers are verified using asymmetric cryptographic keys fetched from the Supabase JWKS endpoints.
* **Bounded FIFO Caching**: Validated JWT tokens are cached in `tokenVerificationCache` to avoid repeated remote signature verifications. To prevent memory exhaustion under continuous load, the cache must be strictly capped (default: 1,000 entries) and managed via a First-In-First-Out (FIFO) eviction strategy.
* **Outbound Latency Safeguard**: JWKS fetches must incorporate a strict timeout signal (e.g., `AbortSignal.timeout(4000)`) to prevent socket hangs during authentication outages.

### Cedar WASM Authorization Middleware (PEP)
* **Authoritative Engine**: Route-level relationship-based access control (ReBAC) is enforced via `@cedar-policy/cedar-wasm` v4+.
* **Dual Gate Ordering**: The Cedar middleware (Policy Enforcement Point) executes *before* endpoint Zod body validators.
* **Decision Casing**: Cedar WASM v4 returns lowercase decisions (`allow` / `deny`). Policies must be evaluated against lowercase casing variants to guarantee compatibility.
* **Context Resolution**: Client security headers (e.g. `x-capacity`, `x-school-id`) are verified against hydrated database bonds to prevent privilege escalation.

---

## 4. Dynamic Data Connection & Database Pool Lifecycle

Data tier access is anchored by Supabase (PostgreSQL with RLS), compiled via ZenStack v3, and queried using Kysely.

* **Connection Pool Singleton**: Maintain a shared database pool singleton (`sharedPool`) globally to prevent socket exhaustions under high concurrency.
* **Dynamic Connection Strings**: Support dynamic database connection switches (via request contexts or changed environment variables) safely. When a database connection URL changes, the previous connection pool must be asynchronously drained (`pool.end()`) to avoid orphaned backend connections.
* **ReBAC Context Enrichment**: ZenStack clients are scoped to the active request context user to enforce PostgreSQL Row-Level Security (RLS) policies automatically.

---

## 5. Security & Error Boundaries

* **Dynamic CORS Domains**: Whitelist specific origin origins dynamically (e.g. `http://localhost:8081` and `https://gurudevi-platform.com`) instead of exposing raw wildcard (`*`) settings.
* **Global Error Boundaries**: All routes are wrapped inside `app.onError`. If an unhandled exception or database failure occurs:
  1. Print the logs with the request identifier internally for debugging.
  2. Return a standardized JSON envelope (`{ error: 'Internal Server Error', message: 'An unexpected error occurred.' }`) with a HTTP `500` status.
  3. **Strict Policy**: Never leak raw SQL query logs, transaction details, stack traces, or schema information to client interfaces.
