---
title: "Sanctuary API Production Hardening Guide"
status: "active"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "opencode"
tags: [production, hardening, resilience, observability, constraint-driven]
---

# Sanctuary API Production Hardening Guide

> **Purpose**: Comprehensive guide for hardening Sanctuary API for production. Implements battle-tested patterns for constraint-driven products (edu/fintech/healthcare). Each phase is independently deployable and verifiable.

---

## Phase Overview

| Phase | Focus | Deliverables | Verification |
|-------|-------|--------------|--------------|
| **Phase 1** | Core Resilience | Request validation, Circuit breaker, Dedupe, Idempotency | All tests pass, latency p95 < 200ms |
| **Phase 2** | Operational Excellence | Runbooks, Canary deploy, Audit logging | Deploy succeeds, rollback < 30s |
| **Phase 4** | Observability | Golden signals, Correlation IDs, Dashboards | Sentry/PostHog/OTel integrated |
| **Phase 5** | Constraint-Driven | Idempotency, Audit, Feature flags | Audit trail complete, flags work |
| **Phase 5** | Testing & Chaos | Contract tests, Integration, Chaos | 150+ tests pass, chaos survives |

---

## Phase 1: Core Resilience (Week 1)

### 1.1 Request Validation at Edge
**Goal**: Fail fast on invalid input before Cedar/DB

**Implementation**:
- Add `@orpc/server/plugins/request-validation` to RPCHandler
- Validates Zod schemas before Cedar authorization
- Returns 400 with detailed Zod errors

**Files**:
- `apps/sanctuary-api/src/core/app.ts` - Add plugin to RPCHandler
- `packages/core/src/api/orpcClient.ts` - Client-side validation (optional)

### 1.2 Circuit Breaker for External Dependencies
**Goal**: Prevent cascade failures from AI, payment, email services

**Implementation**:
- `packages/core/src/lib/circuit-breaker.ts` - Reusable class
- Apply to: AI routes, payment webhooks, email sending
- Config: 5 failures → open, 30s timeout, half-open probe

**Files**:
- `packages/core/src/lib/circuit-breaker.ts`
- `apps/sanctuary-api/src/ai/routes.ts` - Wrap AI calls
- `apps/sanctuary-api/src/core/routes/payhereWebhook.ts` - Wrap payments

### 1.3 Request Deduplication
**Goal**: Prevent thundering herd on repeated GET requests

**Implementation**:
- Add `@orpc/client/plugins/dedupe` to RPCLink
- Dedupe identical GET requests within 100ms window
- Configurable per procedure

**Files**:
- `packages/core/src/api/orpcClient.ts` - Add DedupeLinkPlugin

### 1.4 Idempotency Keys (Enforce Everywhere)
**Goal**: Every mutation is safely retryable

**Implementation**:
- Enforce idempotency key on ALL mutations (not just PowerSync)
- `packages/core/src/lib/idempotency.ts` - Reusable helper
- Middleware extracts `Idempotency-Key` header
- Store in `idempotency_keys` table with TTL

**Files**:
- `packages/core/src/lib/idempotency.ts`
- `apps/sanctuary-api/src/core/middleware/idempotency.ts` (new)
- Database migration for `idempotency_keys` table

---

## Phase 2: Operational Excellence (Week 2)

### 2.1 Runbook-Driven Development
**Goal**: Every feature ships with operational documentation

**Implementation**:
- `docs/runbooks/` directory with templates
- CI check: PR must include runbook for new features
- Runbook includes: rollback, health checks, debugging, contacts

**Files**:
- `docs/runbooks/template.md` - Template
- `docs/runbooks/grading-system.md` - Example
- `docs/runbooks/ai-assistant.md` - Example
- `docs/runbooks/offline-sync.md` - Example
- `.github/workflows/pr-check.yml` - CI check

### 2.2 Canary Deployment with Automated Rollback
**Goal**: Safe deployments with automatic rollback

**Implementation**:
- GitHub Actions workflow with canary steps
- Metrics-based rollback (error rate > 1%, p95 > 500ms)
- Progressive traffic: 5% → 25% → 100%

**Files**:
- `.github/workflows/deploy-canary.yml`
- `scripts/health-check.ts` - Automated health verification

### 2.3 Audit Logging for Sensitive Operations
**Goal**: Immutable audit trail for compliance

**Implementation**:
- `packages/core/src/lib/audit-log.ts` - Reusable logger
- Middleware captures: user, action, resource, before/after, requestId, traceId
- Dual write: PostgreSQL (immutable) + PostHog (analytics)
- Covers: auth, payments, grading, user management, sensitive reads

**Files**:
- `packages/core/src/lib/audit-log.ts`
- `apps/sanctuary-api/src/core/middleware/audit.ts` (new)
- Database migration for `audit_logs` table

---

## Phase 3: Observability (Week 3)

### 3.1 Golden Signals Dashboard
**Goal**: Four key metrics per service visible in Grafana

**Metrics**:
- **Latency**: p50, p95, p99 per procedure
- **Traffic**: RPS per procedure
- **Errors**: Rate by procedure and error code
- **Saturation**: DB pool, CPU, memory, Cedar eval time

**Files**:
- `grafana/dashboards/sanctuary-api.json` - Dashboard JSON
- `grafana/alerts/rules.yml` - Alert rules

### 3.2 Correlation IDs Everywhere
**Goal**: End-to-end traceability

**Implementation**:
- `requestId` (UUID v4) generated at edge
- `traceId` (W3C) propagated via OTel
- Included in: logs, errors, Sentry, PostHog, audit logs, response headers

**Files**:
- `apps/sanctuary-api/src/core/middleware/correlation.ts` (new)
- Update existing middleware to propagate

### 3.3 Sentry + PostHog + OTel Integration
**Goal**: Three-pillar observability

**Sentry**: Error tracking + performance
**PostHog**: Product analytics + feature flag tracking
**OTel**: Distributed tracing

**Files**:
- Update `apps/sanctuary-api/src/core/app.ts` with all three
- Verify sampling: 10% traces, 100% errors

---

## Phase 4: Constraint-Driven Patterns (Week 4)

### 4.1 Idempotency Enforcement Everywhere
**Goal**: Every mutation is safely retryable

**Implementation**:
- Header: `Idempotency-Key: <uuid>` required on all POST/PUT/PATCH/DELETE
- Middleware validates, stores, returns cached result on replay
- Applied to: all oRPC mutations, PowerSync, webhooks

### 4.2 Structured Feature Flag Rollout
**Goal**: Safe, gradual feature releases

**Implementation**:
- GrowthBook flags with targeting rules
- Internal fallback for backward compatibility
- Rollout stages: internal → pilot (10%) → opt-in (5%) → 100%
- Kill switch: disable in < 1 second

### 4.3 Audit Trail for Sensitive Operations
**Goal**: Immutable audit trail for compliance

**Coverage**:
- Authentication events (login, logout, MFA)
- Payment operations
- Grading/assessment changes
- User management (create, delete, role changes)
- Sensitive data access (student records, guardian data)

---

## Phase 5: Testing & Chaos Engineering (Week 5)

### 5.1 Contract Tests for Every Procedure
**Goal**: Input/output validation at contract level

**Implementation**:
- Every oRPC procedure has contract test
- Validates: input schema, output schema, error codes, auth
- Runs in CI on every PR

### 5.2 Integration Tests with Real Dependencies
**Goal**: Test against real DB, real Cedar, real Supabase

**Implementation**:
- Testcontainers for PostgreSQL
- Real Supabase project for CI
- Real Cedar WASM/Rust evaluator

### 5.3 Chaos Engineering
**Goal**: Verify resilience under failure

**Experiments**:
- Kill DB primary → verify failover
- Kill Cedar evaluator → verify fallback
- Network partition → verify offline queue
- CPU saturation → verify circuit breakers

---

## Implementation Order (Dependencies)

```
Phase 1.1 (Request Validation) 
    ↓
Phase 1.2 (Circuit Breaker) ← independent
Phase 1.3 (Dedupe) ← independent
Phase 1.4 (Idempotency) ← depends on 1.1
    ↓
Phase 2.1 (Runbooks) ← independent
Phase 2.2 (Canary) ← depends on 1.1, 1.2
Phase 2.3 (Audit) ← depends on 1.4
    ↓
Phase 3.1 (Golden Signals) ← depends on 3.2
Phase 3.2 (Correlation IDs) ← independent
Phase 3.3 (Sentry/PostHog/OTel) ← depends on 3.2
    ↓
Phase 4.1 (Idempotency) ← already done in 1.4
Phase 4.2 (Feature Flags) ← depends on 3.3
Phase 4.3 (Audit) ← depends on 2.3
    ↓
Phase 5.1 (Contract Tests) ← depends on 1.1
Phase 5.2 (Integration Tests) ← depends on 2.2
Phase 5.3 (Chaos) ← depends on 2.2, 3.1
```

---

## Quick Start Commands

```bash
# Phase 1: Core Resilience
pnpm add @orpc/server/plugins/request-validation @orpc/client/plugins/dedupe
pnpm add @orpc/client/plugins/retry  # for retry logic

# Phase 2: Operational
mkdir -p docs/runbooks
# Create runbook template and CI check

# Phase 3: Observability
pnpm add @sentry/node @sentry/profiling-node posthog-node

# Phase 4: Constraint-Driven
# Already have GrowthBook, need rollout config

# Phase 5: Testing
pnpm add -D @vitest/coverage-v8 testcontainers
```

---

## Verification Checklist Per Phase

| Phase | Must Pass |
|-------|-----------|
| **Phase 1** | All existing tests + new validation tests + circuit breaker tests |
| **Phase 2** | Canary deploy works, rollback < 30s, audit logs written |
| **Phase 3** | Dashboards show data, correlation IDs in all logs |
| **Phase 4** | Idempotency works, flags rollout/rollback, audit trail complete |
| **Phase 5** | 150+ tests pass, chaos experiments survive |

---

## Rollback Plan Per Phase

| Phase | Rollback Action |
|-------|-----------------|
| **Phase 1** | Disable plugins via env var, remove middleware |
| **Phase 2** | Revert workflow, disable audit middleware |
| **Phase 3** | Disable OTel/Sentry/PostHog via env vars |
| **Phase 4** | Disable flags, remove audit middleware |
| **Phase 5** | Revert test configs, disable chaos |

---

*This document is the master plan. Each phase has detailed implementation guide in `docs/implementation/phase-{1-5}.md`*