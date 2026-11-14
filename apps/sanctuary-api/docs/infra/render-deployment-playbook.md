---
title: "Sanctuary API Render Deployment Playbook"
status: "active"
created: 2026-10-25
updated: 2026-10-26
author: "Naveen"
scribe: "Antigravity"
tags: [sanctuary-api, infra, render, deployment, monorepo, sse, pnpm]
---

# Sanctuary API Render Deployment Playbook

This document establishes the official operational standard for deploying `apps/sanctuary-api` to **Render** within the polymath monorepo. It synthesizes our historical architecture audits ([Infrastructure & Cost Evaluation](../architecture/infrastructure-and-cost-evaluation.md), [Transport Security](../architecture/transport-security.md), [Environment Topology](../../../docs/architecture/environment-topology-and-promotion.md)) with real-world developer experience, monorepo nuances, and platform-specific pitfalls.

> **Note on Agent Skills:** The repo rejects the generic, handwaved `.agents/skills/render-deploy/skill.md`. All deployments must follow the empirical, verified commands and configuration contracts codified in this runbook.

The [2026-10-26 ingress admission record](../current_progress/2026-10-26-render-auth-ingress-admission.md)
records the verified transport implementation and remaining deployment gates.
Render deployment requires `SANCTUARY_TLS_TERMINATION=render` with the platform's
`RENDER=true` and `RENDER_SERVICE_ID` runtime markers. Application requests must
carry exactly `X-Forwarded-Proto: https`; the internal GET `/health/live` probe
is the sole HTTP exception. Direct deployment retains local TLS certificates.
Use `CF-Connecting-IP` for the public Render service's rate-limit identity;
the leftmost `X-Forwarded-For` value can be supplied by a caller. Actual edge
header handling, container build and public auth acceptance remain required.

---

## 1. Architectural Fit & Why Persistent Containers Matter

Our historical infrastructure audit (`infrastructure-and-cost-evaluation.md`) benchmarked `sanctuary-api` against V8 Edge Isolates (Cloudflare Workers), Container Serverless (Vercel), and Persistent Containers (Render/Fly/VPS). 

`sanctuary-api` requires a **persistent runtime** (Node.js or Bun) for four non-negotiable reasons:

1. **Cedar WASM JIT Overhead:** The Cedar Policy Engine (`@cedar-policy/cedar-wasm`) requires an initial WebAssembly compilation phase on startup (~30MB memory overhead). On serverless, this causes 500ms–2.5s cold starts; on a persistent Render instance, compilation happens once at boot.
2. **Singleton Database Connection Pools:** Kysely and ZenStack rely on a persistent `sharedPool` connection pool. Serverless micro-containers rapidly saturate PostgreSQL's `max_connections` limit; persistent instances maintain a controlled connection budget.
3. **JWT Verification Memory Cache:** `verifySupabaseJwt` maintains a high-velocity in-memory LRU cache of cryptographic keys and validated subjects, avoiding remote JWKS network calls on every request.
4. **Long-Running SSE Streams & Maintenance Loops:** Background retention routines ([startRetentionMaintenance](../../src/index.ts)) and Server-Sent Events ([eventsStreamRoutes](../../src/core/routes/eventsStream.ts)) require long-lived execution, which serverless functions terminate after 10–60 seconds.

---

## 2. The 6 Critical Render Pitfalls & Technical Countermeasures

### Pitfall 1: Reverse-Proxy Buffering of Server-Sent Events (SSE)
* **The Reality:** Render routes traffic through an Envoy/Nginx edge proxy. By default, HTTP reverse proxies buffer response bodies until a buffer fills up (typically 4KB–16KB). Real-time events, telemetry streams, and AI tokens will appear completely frozen, then suddenly burst to the client all at once.
* **The Countermeasure:** In streaming handlers, you **must** supply specific anti-buffering response headers:
  ```typescript
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform', // 'no-transform' forbids proxy compression
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',                  // Explicitly bypasses Nginx/Envoy proxy buffering
    },
  });
  ```
* **Keep-Alive Heartbeats:** Render's proxy automatically closes connections that stay silent for >60 seconds. Streaming handlers must emit an empty SSE comment ping every 20 seconds:
  ```typescript
  const heartbeat = setInterval(() => {
    controller.enqueue(new TextEncoder().encode(': ping\n\n'));
  }, 20000);
  ```

---

### Pitfall 2: The Monorepo Root Directory Trap (pnpm Workspaces)
* **The Reality:** In a monorepo, developers instinctively set Render’s **Root Directory** to `apps/sanctuary-api`. **This will immediately break your build.** `sanctuary-api` depends on sibling workspace packages (`@repo/core`, `@repo/database`, `@repo/policies`) and the root `pnpm-lock.yaml`. If you isolate the root directory, pnpm cannot resolve internal symlinks.
* **The Countermeasure:**
  - **Root Directory:** Always set to `.` (the monorepo root).
  - **Build Command:**
    ```bash
    npx pnpm install --frozen-lockfile && npx pnpm --filter @repo/sanctuary-api build
    ```
  - **Start Command:**
    ```bash
    node apps/sanctuary-api/dist/entry-node.js
    ```
  - **Build Filters:** To prevent deploying backend code when only mobile UI tokens in `apps/gurudevi-mobile` change, configure Render's `buildFilter` paths:
    - `apps/sanctuary-api/**`
    - `packages/core/**`
    - `packages/database/**`
    - `packages/policies/**`
    - `pnpm-lock.yaml`

---

### Pitfall 3: The 30-Day Free Database Trap & Socket Exhaustion
* **The Reality:** Render offers a "Free PostgreSQL" instance, but it **strictly expires and deletes all data after 30 days**. Furthermore, free tiers enforce a hard limit of ~20 connections, causing immediate crashes when multiple requests arrive.
* **The Countermeasure:**
  - **Do NOT use Render's Free PostgreSQL for persistent data.**
  - **Option A (Zero-Cost Managed):** Connect to a free **Supabase** or **Neon** PostgreSQL database. They do not expire after 30 days and provide connection pooling (PgBouncer).
  - **Option B (Paid Render DB):** If using Render Managed PostgreSQL ($7/mo Starter tier), use the internal DNS address (`postgres://...render.internal:...`) to eliminate public internet routing latency.

---

### Pitfall 4: 512MB RAM OOM (Out-Of-Memory) Hard Kills
* **The Reality:** Render's Starter web service ($7/mo) provides 512MB RAM. During peak compilation or high concurrency, Node.js’s V8 default memory ceiling (~2GB–4GB) will let the process grow until the Linux kernel abruptly sends a `SIGKILL`. The app crashes without a stack trace.
* **The Countermeasure:** Constrain the V8 heap in Render’s environment variables:
  ```bash
  NODE_OPTIONS="--max-old-space-size=460"
  ```
  This forces V8 to trigger garbage collection aggressively before crossing 460MB, keeping the process safely within the 512MB cgroup limit.

---

### Pitfall 5: Zero-Downtime Health Check Deadlocks
* **The Reality:** Render checks your service's `healthCheckPath` before switching traffic over. If your health check route connects to the database, and the cloud database pool takes 10 seconds to establish a TLS handshake on container startup, Render marks the new deployment as dead and rolls back.
* **The Countermeasure:** 
  - Ensure the liveness check (`GET /health/live`) only checks internal event-loop responsiveness.
  - Deep dependency diagnostics should live on a secondary route (e.g. `/health/ready`).

---

### Pitfall 6: Ephemeral File System & Secret Management
* **The Reality:** Containers on Render have ephemeral disks. Any file written to local disk is lost upon redeploy or restart. Furthermore, secrets must never be committed to repository config files.
* **The Countermeasure:**
  - Files, avatar uploads, and media must use direct presigned uploads to S3, Cloudflare R2, or Supabase Storage.
  - Secrets (`DATABASE_URL`, `SUPABASE_JWT_SECRET`, `SENTRY_DSN`) must be injected via Render’s encrypted Environment Dashboard or synchronized via Doppler CLI.

---

## 3. Render Dashboard Configuration Reference

When configuring the service manually in the Render Web Console:

| Setting | Configuration Value | Reason |
| :--- | :--- | :--- |
| **Service Type** | Web Service | Exposes public HTTPS endpoint |
| **Environment** | Node | Standard Node runtime environment |
| **Region** | Frankfurt (EU) or Singapore (Asia) | Closest to your database region |
| **Branch** | `main` | Production branch |
| **Root Directory** | `.` | Preserves monorepo workspace resolution |
| **Build Command** | `npx pnpm install --frozen-lockfile && npx pnpm --filter @repo/sanctuary-api build` | Builds monorepo dependencies and emits `dist/entry-node.js` |
| **Start Command** | `node apps/sanctuary-api/dist/entry-node.js` | Runs production Node entrypoint |
| **Instance Type** | Starter ($7/mo) or Free (for staging) | Starter provides 24/7 uptime without 50s cold sleeps |
| **Health Check Path**| `/health/live` | Implemented in [apps/sanctuary-api/src/core/routes/health.ts](../../src/core/routes/health.ts) |

### Required Environment Variables

```ini
NODE_ENV=production
SANCTUARY_TLS_TERMINATION=render
PORT=10000
NODE_OPTIONS=--max-old-space-size=460
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=verify-full
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_PUBLISHABLE_KEY=[DOPPLER_VALUE]
SUPABASE_JWT_ISSUER=https://[PROJECT_REF].supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated
POWERSYNC_URL=[AUTHORIZED_ENVIRONMENT_ENDPOINT]
POWERSYNC_SIGNING_JWK=[DOPPLER_PRIVATE_JWK]
BYOK_ENCRYPTION_SECRET=[DOPPLER_SECRET_AT_LEAST_32_CHARACTERS]
RATE_LIMIT_STORE=postgres
RATE_LIMIT_TRUSTED_PROXY_HEADER=CF-Connecting-IP
SENTRY_DSN=https://...
```

---

## 4. Verification & Smoke Testing Runbook

Once deployed, run these empirical checks:

1. **Verify Liveness:**
   ```bash
   curl --fail --include "$SANCTUARY_DEV_API_URL/health/live"
   # Expected: status 200
   ```

2. **Verify SSE Unbuffered Streaming:**
   ```bash
   curl -N https://sanctuary-api.onrender.com/api/events
   # Expected: Immediate chunk delivery without initial 16KB buffering lag
   ```

3. **Verify oRPC Procedure Dispatch:**
   ```bash
   curl -X POST https://sanctuary-api.onrender.com/api/echoes.ping \
     -H "Content-Type: application/json" \
     -d '{"message":"ping"}'
   ```

4. **Verify HTTPS Transport & CORS Gate:**
   Ensure incoming cross-origin requests from `https://gurudevi.app` return authorized headers according to [transportSecurity.ts](../../src/core/transportSecurity.ts).
