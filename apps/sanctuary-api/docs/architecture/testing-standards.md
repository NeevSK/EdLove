---
title: "Sanctuary API Testing Standards & Integration Strategy"
status: "active"
created: 2026-06-20
updated: 2026-06-25
author: "Naveen"
scribe: "Antigravity"
tags: [api, testing, integration]
---

# Sanctuary API Testing Standards & Integration Strategy

This document details the automated testing standards, mock definitions, and verification strategies used across the Sanctuary API gateway (`apps/sanctuary-api`).

---

## 1. Test Framework & Setup

We use **Vitest** as our primary test runner due to its native ES module support and fast execution times.

* **Configuration**: Defined in [vitest.config.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/vitest.config.ts).
* **Test Isolation**: Each test file runs in an isolated context. Common test hooks, database mocks, and authorization bypasses are defined in [setup.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/src/__tests__/setup.ts).
* **Running Tests (Node)**: Run `pnpm run test` or `vitest run`.
* **Running Tests (Bun)**: Run `pnpm run test:bun` or `bun x vitest run`. Both engines successfully execute the Vitest suite in milliseconds.

---

## 2. API Gating Tests & Routing

To guarantee high performance and platform-agnostic testing, we avoid binding routes to local TCP sockets during testing.

* **Hono Request Simulation**: Use Hono's native `app.request()` routing to execute request/response pipelines in-memory.
* **Typing Checks**: Utilize `testClient` from `hono/testing` where possible to enforce compile-time path and request/response body contracts against server endpoints.

---

## 3. Core Testing Verticals

All updates to core routing, authorization engines, or data clients must include validation across the following verification scenarios:

### A. Privilege Escalation Prevention
* **Goal**: Validate that client headers cannot force unauthorized privileges.
* **Test Standard**: Mock active database bonds (e.g., scoping a user to `teacher`). Request an admin endpoint with `x-capacity: admin` and verify that the gateway rejects it with a `403 Forbidden` response.

### B. Cedar & Zod Double Gate Checks
* **Goal**: Verify that the Cedar access gate and Zod validation gates work correctly in sequence.
* **Test Standard**: 
  1. Test that users failing Cedar policies are rejected with `403 Forbidden` before Zod validation occurs.
  2. Test that users passing the Cedar authorization checks but submitting invalid request bodies (e.g., malformed UUID format or values out of bounds) are rejected with a structured `400 Bad Request` validation response containing the Zod errors.

### C. Absolute Tenant Isolation Under Load
* **Goal**: Ensure that ZenStack database clients are request-scoped and never leak connection details or tenant records between concurrent requests.
* **Test Standard**: Execute a concurrency integration test that fires **50 rapid parallel requests** to a protected Hono endpoint (e.g., `/api/identity/classroom-capacity-summary/:userId`) using different mocked user contexts and verify that request-scoped database instances never cross-contaminate data.

### D. Environmental Fault Injection
* **Goal**: Guarantee that database outages or connection string fluctuations do not throw unhandled panics that crash the Node/Bun event loops.
* **Test Standard**: Inject an invalid or offline `DATABASE_URL` (e.g., using a short connection timeout) into the request context, execute the endpoint, and confirm the global error boundary intercepts the rejection, returning a clean `500 Internal Server Error` envelope without exposing backend details.

---

## 4. ZenStack v3, Kysely, & Zod v4 Testing Strategy

With ZenStack v3 converting policy definitions to Kysely SQL generation internally and Zod v4 performing request shape validation, we enforce the following strategy:

### A. Type-Safe Client Validation (`testClient`)
Always use Hono's `testClient` for boundary validation. This avoids raw string path mapping errors and ensures body schemas match types defined in your contracts.

```typescript
import { testClient } from 'hono/testing';
import { app } from '../core/app';

const client = testClient(app);
// Endpoint schema contract errors will be caught at build/test compile time
const res = await client.api.grades.$post({
  json: { classroomId: 'c-1', studentId: 's-1', marks: 95 }
});
```

### B. Database Access Policy Simulation
Because ZenStack wraps the database client and resolves policies dynamically:
1. **Mock State Hydration**: Use hooks in `setup.ts` to mock active bonds and mock roles before dispatching requests.
2. **Kysely Level Interception**: Where required, verify that the database client returns correct structures when constraints or access rules are validated in the service layer.

---

## 5. Modern Interactive API Playground (Developer Experience)

We expose two interactive environments for developer manual testing:

1. **Scalar API Reference** (`/reference`): A premium, highly interactive client built as the modern successor to Swagger. It features a Postman-like HTTP client with full request history, auth headers, and dynamic code generation directly in-browser.
2. **Swagger UI** (`/ui`): Traditional Swagger client referencing the `/doc` OpenAPI 3.1 endpoint.
