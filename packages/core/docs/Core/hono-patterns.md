## 1. The "Sovereign Port" Pattern (Hexagonal)
To prevent framework lock-in, we define our API as a **Pure Port** (a framework-agnostic Zod definition). This ensures that if Hono ever hits a bus, the core logic remains untouched.

### The Port (Definition)
```typescript
import { type SovereignContract } from './contract';

export const educationalContract: SovereignContract = {
  getById: {
    method: 'get',
    path: '/educational/classrooms/{id}',
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { schema: ClassroomSchema, description: 'Success' } },
    metadata: { authority: { action: 'read', subject: 'Classroom' } },
  },
};
```

### The Adapter (Hono implementation)
```typescript
import { adaptToHono } from './contract';
import { educationalContract } from './educational.contract';

// Transform the pure Port into Hono-ready routes
const honoRoutes = Object.values(educationalContract).map(adaptToHono);
```

---

## 2. ZenStack Integration (The Law Layer)
We use the official ZenStack Hono adapter to inject the **UserContext** and enforce the ZModel policies.

```typescript
import { ZenStackMiddleware } from '@zenstackhq/server/hono';
import { getClient } from '../db'; // Your Prisma client factory

app.use('/api/*', async (c, next) => {
  const user = c.get('user'); // Injected by Auth middleware
  return ZenStackMiddleware({
    getEnhancedPrisma: () => getClient(user),
  })(c, next);
});
```

---

## 3. Sovereign Error Handling
Hono routes should never leak raw implementation details. Use the `normalizeError` utility in the global error handler.

```typescript
import { normalizeError } from '../logic/utils/errorNormalizer';

app.onError((err, c) => {
  const sovereignError = normalizeError(err, c.req.header('x-request-id'));
  return c.json(sovereignError.details, sovereignError.details.status);
});
```

---

## 4. Agentic Sight (MCP)
To expose your Hono API to AI agents, use the `hono/mcp` bridge. This should be isolated to a specific gateway or restricted routes.

```typescript
import { mcp } from 'hono/mcp';

// This automatically turns your /api routes into MCP Tools
app.use('/mcp/*', mcp({
  endpoint: '/mcp',
  name: 'Gurudevi API',
  version: '2026.1.0',
}));
```

---

## 5. End-to-End Type Safety (RPC)
The UI (Sanctuary) should use the Hono Client (`hc`) to interact with the API. This provides a "Shared Brain" between the frontend and backend.

```typescript
// frontend/api.ts
import { hc } from 'hono/client';
import type { AppType } from '../../packages/core/src/api';

const client = hc<AppType>('https://api.gurudevi.org');

// Fully typed!
const res = await client.api.lessons[':id'].$get({
  param: { id: '123' }
});
```

---

## 6. Development Workflow
1.  **Define Schema**: Update `schema.zmodel` if new entities are needed.
2.  **Create Route**: Define the OpenAPI route with Zod validation.
3.  **Implement Handler**: Write the business logic, relying on the `ZenStack` client for policy enforcement.
4.  **Verify**: Check the live OpenAPI docs at `/doc` or `/ui` (Swagger/Scalar).
5.  **Agent Sync**: Ensure the new route is picked up by the MCP bridge for AI diagnostic support.

---

## 7. Anti-patterns (The Forbidden Path 🚫)
To maintain a high-resilience Sovereign API, avoid these common mistakes:

*   **Manual Type Casting**: Never use `as unknown as T`. Hono's inference is 100% reliable. If the types don't match, your Zod schema or route definition is the problem.
*   **Bypassing the Law (ZenStack)**: Never use the raw `prisma` client inside a Hono handler. This bypasses all RLS and `@@allow` policies. Always use the `c.get('db')` enhanced client.
*   **Schema Leakage**: Never return raw database objects directly. Always map them through an OpenAPI-aware Zod schema to ensure sensitive fields (like internal IDs or debug flags) never leave the Sanctuary.
*   **Non-Descriptive Paths**: Since AI agents rely on path names and descriptions for "Sight," avoid generic paths like `/process` or `/data`. Use semantic paths like `/lessons/publish` or `/student/onboard`.
*   **Middleware Business Logic**: Middleware is for **Context** (Auth, Errors, DB Injection). Never put business logic (like calculating a grade) inside a middleware. Keep that in the route handler.
