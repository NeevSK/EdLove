---
title: "Sanctuary API: Sovereign Architecture Direction 2026"
status: "active"
created: 2026-06-25
updated: 2026-06-25
author: "Naveen"
scribe: "Antigravity"
tags: [api, architecture, strategy, ai, security, mcp]
---

# Sanctuary API: Sovereign Architecture Direction 2026

This is the living architectural strategy document for the Sanctuary API gateway — establishing the direction from current state toward a pristine, AI-ready, security-native backend.

---

## 1. Current State: What Is Solid

The foundation is already exceptional. Before identifying gaps, it's important to acknowledge the bedrock strengths:

| Component | Current State | Strength |
| :--- | :--- | :--- |
| **Sovereign Port Pattern** | Fully implemented | Routes defined as pure Zod contracts, zero Hono lock-in |
| **Cedar WASM Authorization** | Active (`@cedar-policy/cedar-wasm` v4+) | Route-level double-gate, DB-hydrated bond context |
| **ZenStack v3 + Kysely** | Active | Request-scoped DB clients, RLS enforcement via bond |
| **OpenAPI 3.1 Spec** | Auto-generated from contracts | Live at `/doc`, browsable via `/ui` and `/reference` |
| **Feature Flags** | GrowthBook snapshots + route middleware | GrowthBook is the rollout authority; API routes enforce mapped flags server-side |
| **Error Type System** | `SovereignError` + `normalizeError` | Structured, sanitized, Zod/RLS-aware |
| **Scalar + Swagger** | Both mounted | Modern dev DX at `/reference` |
| **Contract Coverage Audit** | `audit-poa-runtime.ts` | Compile-time coverage checks across 20+ modules |
| **Concurrent Tenant Isolation** | Vitest test suite, 50 parallel | Verified request-scoped DB isolation |
| **Dual Runtime** | Bun + Node.js entrypoints | WinterCG-aligned, zero platform lock-in |

---

## 2. The Four-Layer Sovereign Architecture

The pristine architecture organizes itself into exactly four concentric trust rings:

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: CRYPTOGRAPHIC IDENTITY GATE               │  ← JWT, JWKS, FIFO Cache
│  Layer 2: CEDAR POLICY ENFORCEMENT POINT (PEP)      │  ← Bond-hydrated WASM
│  Layer 3: ZOD SCHEMA VALIDATION GATE                │  ← Request shape
│  Layer 4: ZENSTACK V3 KYSELY DB EXECUTION           │  ← Row-level security
└─────────────────────────────────────────────────────┘
```

Every request must pass through all four layers in order. Nothing bypasses this chain.

---

## 3. Deviations to Fix (Priority Order)

### P0 — Critical

#### 3.1 Wire `normalizeError` into `app.onError`

**Current**: `app.onError` is a hardcoded stub returning a generic 500.  
**Problem**: RLS violations from ZenStack/Kysely, Zod errors that bubble out of handlers, and custom `SovereignError` instances all get flattened into the same undifferentiated message. Dev context is lost; error categories are invisible.  
**Fix**:
```typescript
// apps/sanctuary-api/src/core/app.ts
import { normalizeError } from '@repo/core/logic/utils/errorNormalizer';

app.onError((err, c) => {
  const requestId = c.res.headers.get('x-request-id') ?? 'unknown';
  const sovereign = normalizeError(err, requestId);
  console.error(`[${requestId}] UNCAUGHT:`, sovereign.details);
  return c.json(sovereign.toClientSafe(), sovereign.details.status as any);
});
```

#### 3.2 Export `AppType` from Gateway Entrypoints

**Current**: Neither `index.ts` (Bun) nor `entry-node.ts` (Node) exports the app's inferred type.  
**Problem**: `createSovereignClient<AppType>()` defined in `contract.ts` cannot be fully type-safe without this export. The Expo mobile client and any future web client are flying blind without compile-time contract enforcement.  
**Fix**: Add to `apps/sanctuary-api/src/index.ts`:
```typescript
export { app } from './core/app';
export type AppType = typeof app;
```

---

### P1 — High Priority

#### 3.3 Feature Flags at the API Gateway Level — Implemented

The Sanctuary API now evaluates GrowthBook through `featureFlag.factory.ts` and applies the route map in `apps/sanctuary-api/src/core/app.ts` before route handlers. Disabled routes return `503 Service Unavailable` with a structured feature-disabled response. The remaining lifecycle work is control-plane archival, not gateway enforcement.

```
Request → JWT Gate → Cedar PEP → [Feature Flag Gate] → Zod → Handler
```

#### 3.4 Hono MCP Bridge for Agentic Sight

**Current**: Documented in `HONO_PATTERNS.md` as a desired capability. Not yet mounted.  
**Problem**: AI agents (including Antigravity, internal analysis tools, and future Gurudevi Assistant) cannot introspect API capabilities programmatically. They rely on natural language descriptions of the API rather than a machine-readable capability registry.  
**Direction**:
```typescript
import { mcp } from 'hono/mcp';
app.use('/mcp/*', mcp({
  endpoint: '/mcp',
  name: 'Sanctuary API',
  version: '2026.1.0',
  description: 'Sovereign educational platform API gateway with Cedar WASM authorization.',
}));
```
This single route transforms your entire OpenAPI-registered endpoint registry into **MCP Tools** that any compliant AI agent can discover and call with proper parameters.

---

### P2 — Architecture Direction

#### 3.5 Zero-Knowledge Proof (ZKP) Identity Verification

**Current**: Identity is verified via Supabase JWTs (JWKS asymmetric crypto). Extremely secure, but the credential itself (the JWT) is a complete disclosure token — it reveals the user ID and expiry to every intermediate.  
**Direction for 2026**: 
- Introduce **selective disclosure proofs** for privacy-critical endpoints (e.g., guardian viewing student data, therapist accessing mood logs).
- Pattern: Use **zk-SNARKs via `snarkjs`** or a hosted ZKP service (e.g., Reclaim Protocol, Rarimo). The client generates a proof that "this user is a member of school X" without disclosing the user ID to the endpoint handler.
- **Implementation surface**: Add a `verifyZKProof(proof, publicSignals)` helper in a new `zkp.ts` module alongside `jwt.ts`. Gate specific sensitive contract routes with an additional `zkpGate` middleware.
- **Realistic 2026 Entry Point**: Start with **Semaphore** (a privacy-preserving group membership proof). When a teacher requests classroom data, instead of exposing their full JWT, they present a Semaphore group membership proof anchored to the school's Merkle tree. The API verifies the proof, not the identity.

#### 3.6 Structured Observability via OpenTelemetry

**Current**: Logging is `console.log` and `console.error` — ephemeral and unsearchable.  
**Direction**: 
- Integrate `@opentelemetry/api` with a minimal Hono OpenTelemetry middleware.
- Each request automatically creates a trace span carrying: `requestId`, `userId`, `cedarpolicy.action`, `route.path`, `db.table`.
- **Zero infrastructure cost to start**: Export to `console` in development, switch to Axiom or Grafana Tempo in production via an environment variable.

#### 3.7 SSE / Streaming for AI Inference Endpoints

**Current**: AI routes exist (`aiRouter` in `src/ai/routes`) but are mounted with standard request/response handlers.  
**Direction**: For AI inference endpoints that stream LLM tokens, migrate to Hono's native `streamSSE`:
```typescript
import { streamSSE } from 'hono/streaming';
app.post('/api/ai/chat', streamSSE(async (stream) => {
  for await (const chunk of llmResponseStream) {
    await stream.writeSSE({ data: chunk.text, event: 'token' });
  }
  await stream.writeSSE({ data: '[DONE]', event: 'end' });
}));
```
This is fully WinterCG-compliant and works on Bun, Node.js, and edge environments without any adapter change.

---

## 4. Elegant 2026 API Architecture Blueprint

```
                    ┌──────────────────────────────────────────────────┐
                    │              SANCTUARY API GATEWAY               │
                    │                                                  │
 Client Request     │  ┌──────────────────────────────────────────┐   │
 ──────────────────►│  │  Middleware Pipeline (per /api/* request) │   │
                    │  │                                           │   │
                    │  │  1. GlobalLogger (OTel span creation)     │   │
                    │  │  2. CORS + x-request-id                  │   │
                    │  │  3. JWT CryptoGate (JWKS + FIFO Cache)   │   │
                    │  │  4. ZenStack DB Injection (per-request)  │   │
                    │  │  5. Cedar PEP (bond-hydrated, per-route) │   │
                    │  │  6. Feature Flag Gate (per-route)        │   │
                    │  │  7. [Optional] ZKP Gate (sensitive routes)│   │
                    │  │  8. Zod Body/Query Validation             │   │
                    │  │  9. Route Handler                        │   │
                    │  │                                           │   │
                    │  └──────────────────────────────────────────┘   │
                    │                                                  │
                    │  ┌────────────────┐  ┌──────────────────────┐   │
                    │  │ /doc (OpenAPI) │  │ /mcp (Agentic Sight) │   │
                    │  └────────────────┘  └──────────────────────┘   │
                    │  ┌────────────────┐  ┌──────────────────────┐   │
                    │  │ /ui (Swagger)  │  │ /reference (Scalar)  │   │
                    │  └────────────────┘  └──────────────────────┘   │
                    └──────────────────────────────────────────────────┘
```

---

## 5. Anti-Pattern Enforcement (Forbidden Path 🚫)

The following deviations must be rejected in any code review:

| Anti-Pattern | Symptom | Why It Is Forbidden |
| :--- | :--- | :--- |
| **Axios in Tests** | `import axios from 'axios'` in test files | Bypasses in-memory routing; loses type-safety; creates TCP socket binding |
| **Raw Prisma in Handlers** | `db.$queryRaw(...)` without ZenStack wrapper | Bypasses RLS policies; opens tenant data leak surface |
| **Wildcard CORS** | `Access-Control-Allow-Origin: *` | Permits cross-origin credential theft |
| **Schema Leakage** | Returning raw DB objects from handlers | Exposes internal field names, relation keys, debug metadata |
| **Business Logic in Middleware** | Grade calculation in `poa()` | Couples authorization to domain logic; untestable |
| **Missing `AppType` on Call Site** | `hc('url')` without `hc<AppType>('url')` | Silently untyped RPC calls; runtime errors only |
| **Client Feature Flag Only** | Flag checked in Expo screen, not in API | API still processes disabled feature requests |

---

## 6. Implementation Priority Matrix

| Priority | Item | Effort | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | Wire `normalizeError` into `app.onError` | 30 min | High |
| **P0** | Export `AppType` from gateway entrypoints | 5 min | Critical for type-safe RPC |
| **P1** | Feature flag middleware in pipeline | 1 day | Closes API/client feature parity gap |
| **P1** | Mount MCP bridge (`/mcp`) | 2 hrs | Enables agentic introspection |
| **P2** | OpenTelemetry structured tracing | 1 day | Replaces console.log; searchable traces |
| **P2** | SSE streaming for AI inference routes | 1 day | AI token streaming |
| **P3** | ZKP selective disclosure for sensitive routes | 1-2 weeks | Privacy-native identity |
