---
title: "oRPC v2 Beta: Temporal-Grounded Architectural Research Report"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Antigravity"
tags: [orpc, rpc, openapi, mcp, typescript, architecture, research]
---

# oRPC v2 Beta — Temporal-Grounded Research Report

**Research Date:** 2026-10-25 | **Codebase Context:** `apps/sanctuary-api` pinned at `2.0.0-beta.44`

---

## 1. Exact Latest Version (npm Live Registry — Ground Truth)

| Package | Beta dist-tag | Latest (Stable v1) |
|---|---|---|
| `@orpc/server` | **2.0.0-beta.46** | 1.16.1 |
| `@orpc/client` | **2.0.0-beta.46** | 1.16.1 |
| `@orpc/contract` | **2.0.0-beta.46** | 1.16.1 |
| `@orpc/openapi` | **2.0.0-beta.46** | 1.16.1 |
| `@orpc/tanstack-query` | **2.0.0-beta.46** | 1.16.1 |

> **Source:** Live npm registry query executed 2026-10-25  
> **GitHub:** https://github.com/middleapi/orpc (maintainer: `@dinwwwh`)

**Beta timeline:**
- v2 beta started: 2026-06-21 (beta.1)
- beta.44: 2026-10-16 (current codebase pin)
- beta.45: 2026-10-22
- beta.46: 2026-10-24 (latest verified release)

---

## 2. What Changed from v1 to v2

### 2.1 Package Renames
| v1 Package | v2 Package |
|---|---|
| `@orpc/react-query` | `@orpc/tanstack-query` |
| `@orpc/experimental-msw` | `@orpc/msw` |

### 2.2 Core Architectural Shift: Contract-First Separation
**The single biggest conceptual change in v2** is the explicit decoupling of contract definition from server implementation:

- **`oc` builder (`@orpc/contract`):** Pure schema-only layer. Defines input/output/error shapes and OpenAPI metadata. Zero runtime logic, zero DB code. Can be safely shared to frontend packages without dragging server code graphs into the client typechecker.
- **`os` / `implement(contract)` (`@orpc/server`):** Server-side only. Consumes the `oc`-defined contract and enforces TypeScript compatibility at compile time.

v1 allowed lazy implicit inference from handler return types (tying server-side code into client type graphs). v2 enforces an explicit boundary.

### 2.3 OpenAPI Routing Metadata Move
```typescript
// v1 style
os.route({ method: 'GET', path: '/users/{id}' }).input(...).output(...)

// v2 style — moved into .meta()
import { openapi } from '@orpc/openapi';
oc.meta(openapi({ method: 'GET', path: '/users/{id}' })).input(...).output(...)
```

### 2.4 Wire Format Breaking Change
The core RPC serialization format was overhauled. **A v1 client cannot communicate with a v2 server.** Deployments must be coordinated/atomic across both client and server.

### 2.5 Middleware Deduplication Removed
- **v1:** Middleware applied at both parent router and individual procedure level was auto-deduplicated.
- **v2:** No deduplication. Same middleware applied at two levels **runs twice**. Audit all middleware scoping carefully.

### 2.6 Error Handling Changes
- Client retry plugin no longer retries 4xx errors by default.
- Server falls back to HTTP 400 for error codes missing from `errorStatusMap`.
- `MalformedResponseError` replaces legacy `MALFORMED_ORPC_RESPONSE` `ORPCError`.
- Prototype pollution protection plugin **removed**.
- Contract builders (`oc`) now initialize from an empty error map (not pre-populated defaults).

---

## 3. New Features in v2

### 3.1 Streaming & SSE
Native, type-safe Server-Sent Events and async generator streaming:
```typescript
os.handler(async function* () {
  yield { event: 'connected' };
  yield { event: 'update', data: { id: 123 } };
});
```

### 3.2 Request Batching
`BatchHandlerPlugin` on server + batch link config on client:
```typescript
const rpcHandler = new RPCHandler(router, {
  plugins: [new BatchHandlerPlugin()],
});
```

### 3.3 OpenAPI 3.1 First-Class
`@orpc/openapi` generates fully compliant OpenAPI 3.1 specs. `OpenAPIHandler` also doubles as a REST adapter — procedures with `.meta(openapi({...}))` are callable over standard HTTP in addition to RPC.

### 3.4 Model Context Protocol (MCP) Integration
**New in beta.45:** `@orpc/mcp` provides native MCP tool integration. oRPC procedures can be exposed directly as MCP tools for AI agent consumption — same contract powering REST, RPC, and AI agent tool calls.

### 3.5 Effect-TS Integration
`effect/wrap` enhanced with discriminated options and context passing. Effect Schema integrates via **Standard Schema** compatibility — oRPC v2 natively supports the Standard Schema protocol.

---

## 4. Hono Adapter — How oRPC v2 Mounts on Hono

> **There is no separate `@orpc/hono` package.** Hono integration uses the Fetch API adapter (`@orpc/server/fetch`) since Hono is built on standard Fetch API `Request`/`Response` objects.

```typescript
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { RPCHandler } from '@orpc/server/fetch';
import { BatchHandlerPlugin, CORSPlugin } from '@orpc/server/plugins';

const rpcHandler = new RPCHandler(orpcRouter, {
  plugins: [
    new BatchHandlerPlugin(),
    new CORSPlugin({ allowHeaders: ['orpc-batch'] }),
  ],
});

// Mount via wildcard in Hono
app.all('/api/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: '/api',
  });
  return matched && response ? response : c.text('Not Found', 404);
});
```

---

## 5. Stability Assessment

**Rating: Conditionally Stable for Production (Green for core surface area, Amber for edge cases)**

* **Evidence for stability:** 46 beta releases over 4 months. The core handler pattern (`RPCHandler`, `OpenAPIHandler`, `BatchHandlerPlugin`) is solid.
* **Risks:** Wire format lock between client and server; silent middleware double-execution; requires removing the `@orpc/client: 1.15.7` pnpm override.
