---
title: "Sanctuary API Comprehensive Audit & Modernization Plan"
status: "active"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "opencode"
tags: [api, audit, modernization, orpc, observability, tanstack-query]
---

# Sanctuary API Comprehensive Audit & Modernization Plan

## Executive Summary

This document captures the complete audit of the Sanctuary API (`apps/sanctuary-api`) as of August 2026, identifying critical architectural debt, integration gaps, and a phased modernization plan to achieve an elegant, production-ready, observable API with first-class frontend integration.

---

## 1. Current State Audit

### 1.1 Architecture Overview

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| **Runtime** | Hono (OpenAPIHono) | 4.12.33 | ✅ Modern |
| **Primary Transport** | oRPC (native) | 1.14.x | 🟡 Partial (11/37 domains) |
| **Legacy Transport** | SovereignContract + Hono | Custom | 🟡 26 domains still legacy |
| **Authorization** | JWT (Supabase) + Cedar WASM | 4.x | ✅ Dual-gate |
| **Database** | Supabase PostgreSQL + ZenStack v3 | 3.x | ✅ RLS enforced |
| **Offline-First** | PowerSync | Latest | ✅ Active |
| **AI** | Multi-provider (Vercel AI SDK + custom) | 7.x | ✅ Working |
| **Observability** | OpenTelemetry (manual) | 0.221.x | 🟡 Basic only |
| **Error Tracking** | Sentry | Not integrated | ❌ Missing |
| **Analytics** | PostHog | Not integrated | ❌ Missing |
| **Feature Flags** | GrowthBook | Not integrated | ❌ Missing |

### 1.2 The "Frankenstein" Problem (Critical)

**Two parallel contract systems coexist:**

```typescript
// LEGACY: 26 domains still use this
// packages/core/src/api/<domain>.contract.ts
export const domainContract = {
  procedure: {
    method: 'post',
    path: '/domain/procedure',
    request: { body: Schema },
    responses: { 200: { schema: Schema, description: '' } },
    metadata: { policy: { action: 'read', subject: 'Domain' } },
  },
} as const satisfies SovereignContract;

// NATIVE: Only 11 domains migrated
// packages/core/src/api/<domain>.orpc.contract.ts
export const domainORPCContract = {
  procedure: {
    method: 'post',
    path: '/domain/procedure',
    metadata: { policy: { action: 'read', subject: 'Domain' } },
    request: { body: Schema },
    responses: { 200: { schema: Schema, description: '' } },
  },
};
```

**Consequences:**
- Handlers duplicated across `core/handlers/` (legacy) and native implementations
- Mobile app uses **raw `fetch()`** with manual headers instead of typed client
- Tests exercise both systems inconsistently
- OpenAPI generation splits between legacy adapter and native oRPC
- No single source of truth for API contracts

### 1.3 Frontend Integration Gap (Critical)

**Mobile app (`apps/gurudevi-mobile`) makes raw HTTP calls:**

```typescript
// screens/DurableAgentsScreen.tsx - CURRENT (BROKEN)
const response = await fetch(`${API_BASE}/api/durable-agents/runs?limit=8`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// NO typed client usage in ANY screen - only in tests!
```

**Missing:**
- `registerTokenResolver()` / `registerActiveBondIdResolver()` never called
- No `@orpc/tanstack-query` integration for caching, retry, deduping
- No SSR support for streamed queries
- 404s from wrong paths (Hono routes vs oRPC procedures)

### 1.4 Observability Gaps

| Feature | Current | Required | Gap |
|---------|---------|----------|-----|
| **Distributed Tracing** | Manual OTel middleware | `@orpc/opentelemetry` auto-instrumentation | No procedure-level spans |
| **Structured Logging** | `console.log` / `console.error` | Pino + `@orpc/pino` | No log correlation |
| **Error Tracking** | None | Sentry | Zero production visibility |
| **Metrics** | None | Prometheus/OpenTelemetry | No SLI/SLO |
| **Feature Flags** | Custom in `@repo/core` | GrowthBook | No progressive rollout |
| **Analytics** | None | PostHog | No product insights |

### 1.5 Test Reality (from `2026-07-30-orpc-test-audit.md`)

- **85 passing tests** - but ALL mocked (no real DB, no real Cedar, no real runtime)
- **0 real integration tests** - no PostgreSQL, no Cedar sidecar, no Expo device
- **Mobile contract tests** - only 4/4 passing after fixing import issues
- **PowerSync tests** - mock oRPC client, no real HTTP serialization

---

## 2. Web Best Practices Research (August 2026)

### 2.1 oRPC Ecosystem - Modern Plugins Available

| Plugin | Purpose | Why We Need It |
|--------|---------|----------------|
| `@orpc/tanstack-query` | Type-safe TanStack Query integration | Caching, retry, deduping, SSR, optimistic updates |
| `@orpc/opentelemetry` | Auto-instrumentation for OTel | Procedure-level spans, context propagation |
| `@orpc/pino` | Structured logging integration | Log correlation with traces |
| `@orpc/client/plugins/retry` | Automatic retry with backoff | Resilience for flaky networks |
| `@orpc/client/plugins/batch` | Combine multiple requests | Reduce RTT for bulk operations |
| `@orpc/server/plugins/batch` | Server-side batch handling | Single transaction for batched writes |
| `@orpc/server/plugins/request-validation` | Validate input on server | Fail fast on bad requests |
| `@orpc/server/plugins/response-compression` | Compress responses | Bandwidth savings |
| `@orpc/server/plugins/cors` | CORS handling | Proper cross-origin support |
| `@orpc/server/plugins/get-method-csrf-protection` | CSRF for GET | Security hardening |

### 2.2 Hono Best Practices (from hono.dev)

1. **Middleware order**: Security → Body limits → CORS → Auth → Rate limit → Logging → Tracing
2. **Use `hc` (Hono Client)** for type-safe RPC calls
3. **Runtime-agnostic**: Same code on Node, Bun, Edge, Workers
4. **OpenAPIHono** for automatic spec generation

### 2.3 OpenTelemetry Semantic Conventions (Stable)

- Service name: `sanctuary-api`
- HTTP attributes: `http.request.method`, `http.route`, `http.response.status_code`
- Sampling: 10% parent-based for production
- Redact: auth headers, PII, message content

### 2.4 TanStack Query v5 Patterns

- `queryOptions` / `mutationOptions` for type-safe hooks
- `skipToken` for conditional queries
- `streamedOptions` / `liveOptions` for SSE
- `infiniteOptions` for pagination
- SSR: cancel streams on server, `refetchOnMount: 'always'` on client
- Custom serializers for non-JSON types (Date, BigInt)

---

## 3. Modernization Plan

### Phase 1: Immediate Fixes (Week 1) - Stop the Bleeding

#### 1.1 Fix Mobile Integration
- Register token/bond resolvers in `SanctuaryProvider.tsx`
- Replace ALL `fetch()` calls with typed oRPC client
- Fix route mismatches causing 404s

#### 1.2 Add Missing Dependencies
```json
{
  "@orpc/tanstack-query": "^1.0.0-beta",
  "@orpc/opentelemetry": "^1.0.0-beta",
  "@orpc/pino": "^1.0.0-beta",
  "@orpc/client": "^1.0.0-beta",
  "@orpc/server": "^1.0.0-beta",
  "pino": "^9.x",
  "pino-pretty": "^11.x"
}
```

#### 1.3 Enable Request Validation & Retry
- Add `@orpc/server/plugins/request-validation`
- Add `@orpc/client/plugins/retry` with exponential backoff

### Phase 2: Observability Modernization (Week 2)

#### 2.1 Auto-Instrument oRPC with OpenTelemetry
```typescript
// In RPCHandler
import { ORPCInstrumentation } from '@orpc/opentelemetry';

const rpcHandler = new RPCHandler(router, {
  plugins: [new ORPCInstrumentation()],
});
```

#### 2.2 Add Pino Structured Logging
```typescript
import pino from 'pino';
import { PinoIntegration } from '@orpc/pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
```

#### 2.3 Integrate Sentry for Error Tracking
- Add `@sentry/node` and `@sentry/profiling-node`
- Capture unhandled exceptions with trace context

### Phase 3: Contract Unification (Week 3-6)

#### 3.1 Migrate Remaining 26 Domains to Native oRPC
Priority order (from checkpoint):
1. `mapping` - geospatial features
2. `privacy` - consent/ledger
3. `rewards` - gamification
4. `inventory/resource-needs` - ERP
5. `temporal/history` - audit trails
6. Library temporal/edit/delete operations

#### 3.2 Establish Single Contract Source
```
packages/core/src/api/<domain>.orpc.contract.ts  ← ONLY SOURCE
         ↓ (auto-generated via toORPCContract in orpc.ts)
apps/sanctuary-api/src/core/handlers/<domain>.ts  ← Implementation
         ↓
packages/core/src/api/<domain>.ts  ← Shared client export
```

#### 3.3 Remove Legacy Code
- Delete `SovereignContract` files after verification
- Remove `adaptToHono` adapter from `serverAdapter.ts`
- Update `server.ts` barrel exports

### Phase 4: Elegant Data Fetching for Mobile (Week 4-5)

#### 4.1 Create Typed oRPC + TanStack Query Client
```typescript
// packages/core/src/api/orpcClient.ts (NEW)
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { RetryLinkPlugin, BatchLinkPlugin } from '@orpc/client/plugins';

const link = new RPCLink<ClientContext>({
  url: SOVEREIGN_API_URL,
  plugins: [
    new RetryLinkPlugin({ default: { retry: 3, retryDelay: (o) => o.lastEventRetry ?? 1000 } }),
    new BatchLinkPlugin({
      groups: [
        { condition: ({ context }) => context?.cache === 'force-cache', context: { cache: 'force-cache' } },
        { condition: () => true, context: {} },
      ],
    }),
  ],
});

export const orpcClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(orpcClient);
```

#### 4.2 Mobile Usage Pattern
```tsx
// screens/LibraryScreen.tsx
import { orpc } from '@repo/core/api/orpcClient';
import { useQuery } from '@tanstack/react-query';

function LibraryScreen() {
  const { data, isLoading } = useQuery(
    orpc.library.resources.queryOptions({
      input: { schoolId: activeSchoolId },
      staleTime: 60_000,
    })
  );
}
```

#### 4.3 SSR Support for Streamed Queries
- Server: cancel streams on success
- Client: `refetchOnMount: 'always'` for streamed/live queries
- Custom serializer for Date/BigInt in query keys

### Phase 5: Production Hardening (Week 5-7)

#### 5.1 Dependency Alignment
| Package | Current | Target | Action |
|---------|---------|--------|--------|
| `@orpc/*` | Mixed | Latest beta | Upgrade together |
| `@hono/*` | 4.12.x | Latest | Upgrade |
| `@opentelemetry/*` | 0.221.x | Latest stable | Upgrade |
| `zod` | 4.4.3 | 4.x latest | Upgrade |
| `vitest` | 4.1.8 | Latest | Upgrade |
| `@tanstack/react-query` | Check | 5.x latest | Verify/Upgrade |

#### 5.2 Add Production Features
- Circuit breaker for AI calls
- Request deduplication plugin
- Response compression plugin
- Rate limit headers plugin

#### 5.3 Security Hardening
- `@orpc/server/plugins/get-method-csrf-protection`
- Per-procedure request size limits
- Audit logging for sensitive mutations

### Phase 6: Documentation & DX (Week 6-8)

#### 6.1 Generate OpenAPI Spec from Native oRPC
```typescript
// scripts/generate-api-docs.ts
import { OpenAPIGenerator } from '@orpc/openapi';
import { orpcRouter } from '../apps/sanctuary-api/src/core/router';

const spec = await new OpenAPIGenerator(orpcRouter, {
  info: { title: 'Sanctuary API', version: '2026.1.0' },
}).generate();
```

#### 6.2 Create Frontend Integration Guide
- Typed client usage patterns
- TanStack Query best practices
- Offline-first with PowerSync
- Error handling strategies

#### 6.3 Migration Tracker
- Per-domain status: Legacy → Native → Verified → Removed
- Links to decision records
- Test coverage per domain

---

## 4. New Dependencies Explained

### 4.1 `@orpc/tanstack-query` - The Game Changer

**What it does:** Bridges oRPC procedures to TanStack Query with full type safety.

```typescript
// Before: Manual fetch, no caching, no retry, no deduping
const response = await fetch('/api/library/resources', { headers });
const data = await response.json();

// After: One line, full features
const { data } = useQuery(orpc.library.resources.queryOptions({ input: { schoolId } }));
```

**Features enabled:**
- ✅ Automatic caching (staleTime, gcTime)
- ✅ Automatic retry with exponential backoff
- ✅ Request deduplication (same query = 1 network call)
- ✅ Optimistic updates with rollback
- ✅ Infinite pagination (`infiniteOptions`)
- ✅ Streaming/SSE support (`streamedOptions`, `liveOptions`)
- ✅ SSR hydration with custom serializers
- ✅ Typesafe error handling (`isInferableError`)
- ✅ Query invalidation by key patterns

### 4.2 `@orpc/opentelemetry` - Zero-Config Distributed Tracing

**What it does:** Automatically creates spans for every oRPC procedure and middleware.

```typescript
// Before: Manual span creation in middleware
const span = tracer.startSpan('procedureName');
// ... 200 lines of manual instrumentation

// After: One line in RPCHandler
plugins: [new ORPCInstrumentation()],
```

**Automatic spans for:**
- Each procedure execution (input/output attributes)
- Each middleware (with `name` property for readability)
- Client→server context propagation (W3C traceparent)
- Abort signals for streaming procedures

### 4.3 `@orpc/pino` - Structured Logging with Trace Correlation

**What it does:** Integrates Pino logger with oRPC context, automatically adding trace IDs.

```typescript
// Logs automatically include: traceId, spanId, procedureName, duration
logger.info({ procedure: 'library.resources' }, 'Request completed');
```

### 4.4 `@orpc/client/plugins/retry` - Resilience

**Configuration:**
```typescript
new RetryLinkPlugin({
  default: {
    retry: 3,
    retryDelay: (options) => options.lastEventRetry ?? Math.min(1000 * 2 ** options.attempt, 30000),
    shouldRetry: (options) => options.error?.status >= 500 || options.error?.code === 'TIMEOUT',
  },
}),
```

### 4.5 `@orpc/client/plugins/batch` - Performance

**Client-side batching:** Groups multiple procedures into single HTTP request.
**Server-side:** `BatchHandlerPlugin` executes in single transaction.

---

## 5. Breaking Changes Required

| Change | Impact | Migration |
|--------|--------|-----------|
| Remove `SovereignContract` | All legacy handlers | Migrate domain-by-domain |
| Remove `adaptToHono` | OpenAPI generation | Use native oRPC OpenAPI |
| Change mobile `fetch()` → typed client | All screens | Incremental per screen |
| New TanStack Query keys | Cache invalidation | `queryClient.invalidateQueries({ queryKey: orpc.domain.key() })` |
| OTel attribute changes | Dashboards | Update Grafana/DataDog queries |

---

## 6. Verification Checklist

### Phase 1 Complete When:
- [ ] Mobile builds without raw `fetch()` in screens
- [ ] All screens use `orpc.<domain>.<procedure>` pattern
- [ ] No 404s in mobile network tab
- [ ] Auth headers auto-attached via resolvers

### Phase 2 Complete When:
- [ ] OTel traces show procedure-level spans
- [ ] Pino logs correlate with trace IDs
- [ ] Sentry captures errors with trace context
- [ ] 10% sampling in production works

### Phase 3 Complete When:
- [ ] 0 `SovereignContract` files remain
- [ ] 0 `adaptToHono` usages remain
- [ ] All 37 domains native oRPC
- [ ] TypeScript compiles clean

### Phase 4 Complete When:
- [ ] Mobile uses TanStack Query for all data
- [ ] Offline mutations queue via PowerSync → oRPC batch
- [ ] SSR works for streamed queries
- [ ] Optimistic updates for mutations

### Phase 5 Complete When:
- [ ] All deps on latest compatible versions
- [ ] Circuit breaker on AI calls
- [ ] Request deduping active
- [ ] Response compression enabled

### Phase 6 Complete When:
- [ ] OpenAPI spec generates from native router
- [ ] Frontend guide published
- [ ] Migration tracker 100% green

---

## 7. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mobile breakage during migration | High | High | Feature flag per domain, incremental rollout |
| oRPC beta instability | Medium | Medium | Pin versions, test in staging first |
| TanStack Query v5 migration | Low | Medium | Already on v5? Verify |
| Real DB test infrastructure | High | High | Provision test Supabase project |
| Team learning curve | Medium | Medium | Pair programming, docs, examples |

---

## 8. Success Metrics

- **Zero raw `fetch()`** in mobile screens
- **100% native oRPC** contracts
- **< 100ms p95** API latency (with batching)
- **99.9% uptime** with proper observability
- **< 5min MTTR** with Sentry + OTel
- **Zero 404s** from frontend
- **100% test coverage** on critical paths

---

## Appendix: File Inventory

### Legacy Contracts (26 - TO MIGRATE)
- `agent.contract.ts`
- `admin.contract.ts`
- `community.contract.ts`
- `classroomNotes.contract.ts`
- `dailyContent.contract.ts`
- `decisionJournal.contract.ts`
- `erp.contract.ts`
- `founder.contract.ts`
- `forms.contract.ts`
- `guardian-assessment.contract.ts`
- `growth.contract.ts`
- `educational.contract.ts`
- `grading.contract.ts`
- `guardian.contract.ts`
- `history.contract.ts`
- `identity.contract.ts`
- `inventory.contract.ts`
- `journalEntries.contract.ts`
- `library.contract.ts`
- `longitudinal.contract.ts`
- `mapping.contract.ts`
- `presence.contract.ts`
- `onboarding.contract.ts`
- `operations.contract.ts`
- `pro.contract.ts`
- `privacy.contract.ts`
- `principalWorkspace.contract.ts`
- `schoolForest.contract.ts`
- `profile.contract.ts`
- `sacredMissions.contract.ts`
- `self.contract.ts`
- `teacherInsights.contract.ts`
- `studentPotential.contract.ts`
- `sync.contract.ts`
- `thuthimal.contract.ts`
- `tracking.contract.ts`
- `warmMirror.contract.ts`
- `workspaceLayout.contract.ts`

### Native oRPC Contracts (11 - DONE)
- `admin.orpc.contract.ts`
- `agent.orpc.contract.ts`
- `announcements.orpc.contract.ts`
- `attendance.orpc.contract.ts`
- `community.orpc.contract.ts`
- `educational.orpc.contract.ts`
- `grading.orpc.contract.ts`
- `guardian-assessment.orpc.contract.ts`
- `messaging.orpc.contract.ts`
- `principalNotes.orpc.contract.ts`
- `social.orpc.contract.ts`

### Key Implementation Files
- `apps/sanctuary-api/src/core/app.ts` - Hono app, middleware, routing
- `apps/sanctuary-api/src/core/router.ts` - oRPC router assembly
- `apps/sanctuary-api/src/core/orpc.ts` - oRPC context, contract conversion
- `apps/sanctuary-api/src/core/orpcMiddleware.ts` - Double-gate middleware
- `apps/sanctuary-api/src/telemetry/otel.ts` - Manual OTel setup
- `packages/core/src/api/clientRuntime.ts` - Token/bond resolvers
- `packages/core/src/api/dataGateway.ts` - Local-first read/write
- `apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx` - Auth/sync setup