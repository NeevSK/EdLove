---
title: "Testing Standards"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, testing, standards]
---

# Testing Standards

## Integration Tests for API Handlers

Integration tests for Sanctuary API handlers live in `apps/sanctuary-api/src/__tests__/` and use Hono's `app.request()` for in-process HTTP.

### Pattern

```typescript
import { app } from '../core/app.js';
import { setMockUserData, setMockActiveBond, setMockZenStackDbAvailable } from './setup';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const userToken = userId; // UUID triggers JWT bypass in test mode

beforeEach(() => {
  setMockZenStackDbAvailable(true);
  setMockActiveBond(null);
  setMockUserData(null);
});

it('should return 200 for valid request', async () => {
  setMockUserData({ id: userId, is_anonymous: false, ... });
  const res = await app.request('/api/identity/some-route', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  expect(res.status).toBe(200);
});
```

### Mock Infrastructure

- **`setMockUserData(data)`** — Configures mock user returned by `db.user.findUnique`
- **`setMockActiveBond(bond)`** — Configures mock bond returned by `db.bond.findFirst`
- **`setMockZenStackDbAvailable(bool)`** — Controls whether `canUseZenStackDb` returns true

Mock DB is a Proxy-based delegate at module scope, not a per-test mock. Per-test data is configured via the setters above.

### What to Cover

- Success path (200)
- Idempotent re-request (200)
- Invalid request body (400)
- Missing resource / auth (401, 404)
- Edge cases (missing capacity, empty collections)
- Error states (internal server error paths)

## POA Contract Tests

POA contract tests live alongside the contract they test (e.g., `packages/core/src/api/__tests__/onboarding-poa.test.ts`).

### What to Cover

- POA metadata assertions (action, subject match expected values)
- Route definition validity (method, path, response schema, request body)
- Contract shape (expected number of routes, required keys defined)
