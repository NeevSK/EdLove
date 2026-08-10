---
title: "Tech Stack and Standards"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, tech-stack, cors, standards]
---

# Tech Stack and Standards

## CORS Configuration

The Sanctuary API (`apps/sanctuary-api/src/core/app.ts:258-270`) uses a dynamic CORS origin strategy:

- **Development**: Any `http://localhost` or `https://localhost` origin (any port) is allowed
- **Production**: Restricted to `https://platform.gurudevi.edlove.org`
- **Fallback**: Unknown origins return `null` (no CORS headers)

### Implementation

```typescript
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return null;
    if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
      return origin;
    }
    const allowedOrigins = ['https://platform.gurudevi.edlove.org'];
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-school-id', 'x-capacity', ...],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));
```

### Adding a Production Origin

Add the URL to the `allowedOrigins` array in the CORS middleware config in `apps/sanctuary-api/src/core/app.ts`.

---

## Database & Validation Stack

### ZenStack v3.8.0

- **Schema definition & ReBAC enforcement**: `packages/schema/schema.zmodel` (49 models, `@@allow`/`@@deny` policies)
- **ORM codegen**: `plugin orm` generates types at `packages/schema/src/generated/orm/`
- **Policy plugin**: `plugin policy` (no `output` dir) registered for compile-time ReBAC attribute resolution
- **Runtime client**: `packages/database/src/client.ts` → `createZenStackDb(user)` returns Kysely client with policy enforcement

### Zod v4.3.6

- **Runtime Zod factory** (V3 pattern): `createSchemaFactory(schema)` from `@zenstackhq/zod` in `packages/schema/src/index.ts`
- No V2-style `plugin zod` codegen — Zod schemas generated at runtime from ORM metadata
- `@repo/core` uses Zod directly for API contract validation (ts-rest + `@hono/zod-openapi`)

### Valibot (Edge Functions & Serverless)

- **Purpose**: Used in bundle-size and start-time critical environments like Supabase Edge Functions or Cloudflare Workers.
- **Why**: Standard Zod is heavy and non-tree-shakable. Valibot uses a modular, functional API design that tree-shakes to under 1KB for simple schemas.
- **Interoperability**: Both Zod and Valibot conform to the **Standard Schema** interface specification, preventing library/framework integration conflicts.
- **SOP**: Never write manual runtime type guards (`typeof x === 'string' && ...`) for complex payloads. Use Zod in main workspace packages and Valibot in edge functions.

### Package Split

```
@repo/schema (L0, kernel) → ORM metadata + Zod factories
@repo/database (L1, client) → ZenStackClient + Kysely + pg pool
```

See [zenstack-schema-architecture.md](zenstack-schema-architecture.md) for full details.

