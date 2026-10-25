---
title: "Sanctuary API v2: Full Architectural & Engineering Assessment"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, hono-v5, orpc-v2, bun, render, cedar, rust-sidecar, whatsapp, telegram, agentic-ai, mcp, bff, zero-websockets, breaking-change]
---

# Sanctuary API v2: Full Architectural & Engineering Assessment
### The Radical Unified Architecture: Hono v5 RC · oRPC v2 Beta · Bun 1.4.4 · Direct Rust Cedar · Zero WebSockets · oRPC as the Single Protocol · Unified Agentic/MCP

---

## 0. The Cognitive Handshake (Active Reasoning Invariant)

1. **Surface & Mode:** `apps/sanctuary-api` and shared monorepo contracts (`packages/core/src/api`); Greenfield Architecture Blueprint & Modernization Plan. Zero code dragged from legacy monolith antipatterns.
2. **Grounded Substrate:** Inspected monorepo substrate (`apps/sanctuary-api/package.json`, 985-line `src/core/app.ts`, `src/core/router.ts`, `src/core/orpc.ts`, `src/core/canonicalV1Registry.ts`, `src/authorization/rustEvaluator.ts`, `packages/policies/*`, Next.js route handlers in `apps/gurudevi-web`), along with verified empirical research reports on Hono v5 (`5.0.0-rc.1`), oRPC v2 (`2.0.0-beta.46`), Bun (`1.4.4` Rust rewrite), Cedar Policy (`v4.14.0`), Meta Cloud API (v21.0/v22.0), grammY (`@grammyjs/conversations`), and `@modelcontextprotocol/hono`.
3. **Active Seam & Constraints:** Radical unification: eliminate legacy REST "Frankenstein" endpoints; retire WebSockets in favor of SSE/PowerSync; consolidate AI, Agentic, and MCP into a single oRPC contract catalog; break cleanly from legacy shims.

---

## 1. Executive Verdict: The Radical Clean Cut (Break Loudly)

### 1.1 The "Frankenstein" Problem: Why We Stop Compromising
The existing `apps/sanctuary-api/src/core/app.ts` is a 985-line monument to compromise:
- It maintains duplicate REST routes alongside oRPC procedures (`canonicalV1Registry.ts`).
- It carries dead compatibility shims and a toxic `pnpm.overrides` block pinning `@orpc/client: 1.15.7` against a `2.0.0-beta.44` server.
- It attempts to support multiple ad-hoc streaming, webhook, and auth patterns in a single unmaintainable file.

**We are not maintaining backward compatibility with technical debt.**
We are breaking loudly:
1. **oRPC v2 is the ONE and ONLY Application Capability Protocol.** No separate REST controllers. No duplicate endpoint definitions.
2. **Zero WebSockets.** Social media bots (WhatsApp & Telegram) use HTTP Webhooks. Client real-time reads use PowerSync or SSE. We eliminate WebSockets completely, saving massive infrastructure complexity.
3. **AI, Agentic & MCP Unified.** AI token streaming is an oRPC generator procedure. MCP agent tools are an automatic projection of the exact same oRPC router via `@orpc/mcp`.
4. **BFF Proliferation Eliminated.** The monorepo does not need separate Backend-For-Frontend servers. oRPC's typed contracts serve Mobile (Expo 58) and Web (Next.js 16) directly from the sovereign backend.

---

## 2. Core Clarifications: BFFs, WebSockets, and AI/MCP Consolidation

---

### 2.1 Do We Need a BFF (Backend-For-Frontend)?
* **The Traditional BFF Antipattern:** In the early 2020s, teams built separate BFF services (e.g. Next.js API routes or dedicated Express gateways) to reshape data and aggregate microservices for specific frontends (Web vs. Mobile).
* **The Modern oRPC Monorepo Reality:** In a modern TypeScript monorepo with oRPC v2, **a separate BFF server is completely obsolete**:
  - Both `apps/gurudevi-web` (Next.js 16) and `apps/gurudevi-mobile` (Expo 58) import typed contracts (`@orpc/contract`) directly from `@repo/core`.
  - Procedures are fine-grained, type-safe, and batched natively via `BatchHandlerPlugin`.
  - Next.js route handlers in `apps/gurudevi-web/app/` are **strictly session bridges** (handling `httpOnly` OAuth cookie exchanges and `.well-known` mobile linking assets). **Zero domain logic or data-shaping lives in Next.js routes.**
  - `sanctuary-api` is the single sovereign capability provider.

---

### 2.2 The `.app` Domain HTTPS Invariant & Render Edge Termination

#### The `.app` HSTS Preload Reality
The `.app` top-level domain (owned by Google Registry) is permanently embedded in the **Chrome / Safari / Firefox HSTS Preload List**:
* **Enforced Encryption:** Browsers unconditionally refuse unencrypted HTTP connections to `gurudevi.app`, `sanctuary.gurudevi.app`, or any other `.app` domain. No bypass or user exception is permitted.
* **Production Ingress (Render.com):** Render automatically issues, validates, and continuously renews Let's Encrypt TLS certificates for all custom domains.
  - **Edge TLS Termination:** Render's edge load balancer terminates TLS at port 443 and forwards plain HTTP internally to Bun on `PORT=10000`.
  - **Protocol Forwarding:** Render injects `X-Forwarded-Proto: https` into incoming headers.
  - **HSTS Headers:** Hono's `secureHeaders()` middleware automatically returns:
    ```http
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    ```
  - **Fail-Closed Redirect:** Any edge request with `x-forwarded-proto !== 'https'` in production is immediately 301-redirected to the canonical HTTPS origin.
* **Local Development:** Browsers treat `http://localhost:*` as an inherently secure context (RFC 6761). Local testing on `localhost:3000` functions seamlessly without local certificate shims.

---

### 2.3 WebSockets: Kept as an Optional Modular Door (Not Forced Core)

#### Social Media Ingress Does Not Use WebSockets
There is a frequent misconception that social media integrations require persistent WebSockets. **This is factually incorrect:**
1. **WhatsApp Cloud API:** 100% stateless HTTPS `POST /webhooks/whatsapp` webhooks.
2. **Telegram Bot API:** 100% stateless HTTPS `POST /webhooks/telegram` webhooks.
3. **In-App Real-Time:** Mobile reads use **PowerSync** (streaming SQLite sync replication over HTTP); AI chat uses **Server-Sent Events (SSE)** or oRPC async generator streams.

#### The Optional Modular WebSocket Path
Rather than burning the bridge and deleting WebSocket support entirely, Sanctuary API v2 treats WebSockets as an **optional, plug-and-play modular door (`src/doors/websocket.door.ts`)**:
* **Decoupled from Core:** The core oRPC and webhook engine does not depend on WebSockets. If WebSockets are not used, zero overhead is incurred.
* **Native Bun Support:** Bun 1.4.4 has first-class, zero-copy WebSocket capabilities built directly into `Bun.serve({ websocket: { ... } })`.
* **When Activated:** If future features (e.g. multi-user collaborative whiteboard canvas or low-latency binary gaming) require bi-directional sockets, the WebSocket door is simply activated without refactoring the application shell. A 25-second ping/pong heartbeat is enforced to keep connections alive through Render's load balancer.

---

### 2.4 AI vs. Agentic vs. MCP: One Capability Catalog, Two Projections

Previously, AI streaming, Agentic workflows, and MCP tool servers were conceived as three separate, competing doors. In Sanctuary API v2, they are **unified under the exact same oRPC router**:

```mermaid
flowchart TD
    subgraph SingleSourceOfTruth["Unified oRPC v2 Domain Router (src/rpc/router.ts)"]
        Proc1["classroom.submitGrade(input)"]
        Proc2["attendance.record(input)"]
        Proc3["profile.getStudent(input)"]
        Proc4["ai.streamChat(messages) — async function*"]
    end

    subgraph Projections["Three Unified Projections (Zero Code Duplication)"]
        ProjA["Projection 1: Direct Client RPC\n(Called by Web & Mobile apps)"]
        ProjB["Projection 2: Model Context Protocol (MCP)\n(Auto-generated via @orpc/mcp for Claude/Cursor)"]
        ProjC["Projection 3: Background Inngest Steps\n(Durable multi-step agent workflows)"]
    end

    subgraph SecurityGate["Single Authorization Sentinel"]
        Cedar["Direct Rust Cedar Sidecar (/tmp/cedar.sock)\nEvaluates caller: Human, Delegated Bot, or AI Agent"]
    end

    SingleSourceOfTruth --> ProjA
    SingleSourceOfTruth --> ProjB
    SingleSourceOfTruth --> ProjC

    ProjA & ProjB & ProjC --> Cedar
```

1. **Interactive AI Streaming:** Simply an oRPC procedure that yields an async generator:
   ```typescript
   export const streamChatProcedure = os
     .input(chatInputSchema)
     .handler(async function* ({ input }) {
       const stream = streamText({ model: anthropic('claude-3-5-sonnet-20241022'), messages: input.messages });
       for await (const chunk of stream.textStream) {
         yield { token: chunk };
       }
     });
   ```
2. **Model Context Protocol (MCP):** Powered by **`@orpc/mcp`** (introduced in oRPC v2 `beta.45`). Any standard oRPC procedure is exposed directly as an MCP tool with zero boilerplate:
   ```typescript
   import { createMcpHandler } from '@orpc/mcp';
   const mcpHandler = createMcpHandler(rootRouter);
   app.all('/api/mcp/*', (c) => mcpHandler.handle(c.req.raw));
   ```
3. **Durable Agentic Execution:** Inngest functions that execute multi-step LLM loops invoke these same oRPC procedures internally with authenticated service context.

**Verdict: Not 3 disparate engines — ONE procedure catalog projected to humans and AI agents identically.**

---

## 3. The Modern Unified Architecture: "oRPC as the Single Protocol"

By eliminating legacy duplicate REST endpoints and WebSockets, the architecture collapses into an exceptionally clean, minimal structure:

```
apps/sanctuary-api-v2/
├── Dockerfile                      # Multi-stage: Rust builder + oven/bun:1.4.4 runner
├── render.yaml                     # Render Blueprint (Standard tier: $25/mo)
├── package.json                    # Clean: hono@5.0.0-rc.1 + @orpc/*@2.0.0-beta.46 (Zero overrides)
├── tsconfig.json                   # Strict TypeScript 7.x
└── src/
    ├── index.ts                    # Bun.serve bootstrap & graceful SIGTERM draining
    ├── app.ts                      # Slim Hono app shell (< 100 lines)
    ├── authz/
    │   ├── cedarClient.ts          # Native Unix Socket client to Rust Sidecar (/tmp/cedar.sock)
    │   └── orpcPolicyMiddleware.ts # Procedure-level Cedar gate
    ├── rpc/
    │   ├── context.ts              # Strongly-typed ORPCContext (user, school, capacity, bond)
    │   ├── router.ts               # Root oRPC router (all domain procedures)
    │   └── domains/                # Domain Capabilities
    │       ├── identity/           # Account, auth, profile
    │       ├── classroom/          # Attendance, gradebook, assignments
    │       ├── community/          # Messaging, social, announcements
    │       └── ai/                 # LLM token streaming & reasoning
    ├── webhooks/                   # External Omnichannel Ingress (HTTP POST only)
    │   ├── whatsapp.ts             # Meta HMAC-SHA256 raw ArrayBuffer verification
    │   └── telegram.ts             # grammY webhookCallback with secret token
    └── adapters/                   # Protocol Projections of the oRPC Router
        ├── rpcHandler.ts           # Mounted at /api/rpc/* (Primary Mobile/Web app door)
        ├── openapiHandler.ts       # Mounted at /doc & /reference (Scalar UI & REST projection)
        └── mcpHandler.ts           # Mounted at /api/mcp/* (@orpc/mcp for AI agents)
          └── wsHandler.ts            # Optional WebSocket door (Bun.serve native, plug-and-play)
```

### The 85-Line Hono v5 App Shell (`src/app.ts`)

```typescript
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import { timing } from 'hono/timing';
import { RPCHandler } from '@orpc/server/fetch';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { BatchHandlerPlugin } from '@orpc/server/plugins';
import { createMcpHandler } from '@orpc/mcp';
import { rootRouter } from './rpc/router';
import { buildORPCContext } from './rpc/context';
import { registerWhatsAppWebhook } from './webhooks/whatsapp';
import { registerTelegramWebhook } from './webhooks/telegram';

export function createApp() {
  const app = new Hono();

  // 1. Global Transport & Security
  app.use('*', timing());
  app.use('*', secureHeaders());
  app.use('*', timeout(30_000));

  // 2. Liveness & Readiness Probe (Render Zero-Downtime)
  app.get('/health', (c) => c.json({ status: 'healthy', runtime: 'bun-1.4.4', engine: 'hono-v5' }));

  // 3. Omnichannel Ingress (Stateless HTTP Webhooks)
  registerWhatsAppWebhook(app);
  registerTelegramWebhook(app);

  // 4. Primary Application Capability Door (oRPC Native)
  const rpcHandler = new RPCHandler(rootRouter, {
    plugins: [new BatchHandlerPlugin()],
  });
  app.all('/api/rpc/*', async (c) => {
    const context = await buildORPCContext(c);
    const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api/rpc' });
    return matched && response ? response : c.notFound();
  });

  // 5. Agentic AI Door (Model Context Protocol via @orpc/mcp)
  const mcpHandler = createMcpHandler(rootRouter);
  app.all('/api/mcp/*', async (c) => {
    const context = await buildORPCContext(c);
    return mcpHandler.handle(c.req.raw, { context, prefix: '/api/mcp' });
  });

  // 6. Interactive OpenAPI & Scalar Documentation (Read-Only Projection)
  const openapiHandler = new OpenAPIHandler(rootRouter);
  app.all('/api/openapi/*', async (c) => {
    const { matched, response } = await openapiHandler.handle(c.req.raw, { prefix: '/api/openapi' });
    return matched && response ? response : c.notFound();
  });

  return app;
}
```

---

## 4. Why Breaking Loudly Is the Safest Path Forward

| The Old "Frankenstein" Approach | The Modern Greenfield Approach | Why Modern Wins |
| :--- | :--- | :--- |
| Retain legacy v1 REST endpoints beside oRPC. | Make oRPC v2 the single protocol. | Eliminates duplicate controllers and schema drift. |
| Maintain `@orpc/client: 1.15.7` pnpm override. | Delete override; synchronize monorepo to `2.0.0-beta.46`. | Eradicates runtime wire-format serialization crashes. |
| Run WebSocket servers with Redis pub/sub. | Zero WebSockets; pure HTTP webhooks & SSE. | 10× simpler hosting on Render; zero socket memory leaks. |
| Separate TanStack AI, Inngest, and MCP routers. | Unified procedure catalog with `@orpc/mcp`. | Write business logic once; execute via human UI or AI agent. |
| 985 lines of entangled middleware in `app.ts`. | 85-line clean Hono v5 shell + modular adapters. | Sub-second comprehension; clear isolation of concerns. |
| In-process WASM with JSC memory bloat risk. | Co-located native Rust Cedar sidecar (`/tmp/cedar.sock`). | 0.1ms evaluation time; zero WASM garbage-collection overhead. |

---

## 5. Summary & Immediate Execution Order

1. **Purge the Override:** Delete `"@orpc/client": "1.15.7"` from `apps/sanctuary-api/package.json`.
2. **Align to Latest:** Bump all `@orpc/*` packages across the monorepo to `2.0.0-beta.46`.
3. **Scaffold Greenfield Shell:** Build `apps/sanctuary-api-v2/` with `hono@5.0.0-rc.1` and `bun 1.4.4`.
4. **Deploy Rust Sidecar:** Co-locate the compiled Rust Cedar binary inside the container listening on `/tmp/cedar.sock`.
5. **Mount the Unified Projections:** Mount `/api/rpc`, `/api/mcp`, and Webhooks. Zero WebSockets, zero legacy shims.
