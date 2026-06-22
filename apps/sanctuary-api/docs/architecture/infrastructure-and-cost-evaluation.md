---
title: "Infrastructure and Cost Evaluation"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [api, infra, cost, serverless]
---

# Infrastructure & Cost Evaluation: Sanctuary API Gateway

This document provides a comprehensive technical audit of the infrastructure, CPU/RAM profiles, and cost projections for the Sanctuary API gateway (`apps/sanctuary-api`). It evaluates both serverless (V8 edge & container-based) and persistent container setups, detailing how to maximize the "free runway" while maintaining strict security boundaries.

---

## 1. Workload Profiling & Resource Requirements

Based on our architecture (Hono, `@cedar-policy/cedar-wasm`, Zod, Kysely/PostgreSQL), here is the estimated resource profile per request:

| Component | CPU Cycle Impact | Memory Footprint | Runtime Impact |
| :--- | :--- | :--- | :--- |
| **Hono Router** | Very Low (< 1ms) | Miniscule (~15MB overhead) | Standard V8/Node bindings |
| **Zod v4 Schema** | Low (1–3ms) | Minimal | Validates incoming payloads in-memory |
| **Cedar WASM v4 Engine** | Moderate (3–8ms) | Medium (~30MB for WASM instantiation) | Initial compile overhead on container boot; fast cached lookups |
| **Supabase JWT Auth** | Low (< 1ms cached) | Minimal (1,000 entry FIFO cache) | Network-bound only on cache miss (JWKS call) |
| **Kysely DB Connection** | Network Bound | Dynamic (10–30 sockets per pool) | Connection pooling is critical for database scaling |

### Baseline Infrastructure Recommendations:
* **Memory Bounds**: 128MB to 256MB RAM per instance is the sweet spot. 
* **CPU Allocation**: 0.1 to 0.25 vCPU is sufficient for handling normal concurrent API traffic.
* **Database Sockets**: High-concurrency runs require transaction poolers (like Supabase PgBouncer or Neon Serverless) if running on distributed serverless nodes.

---

## 2. Deployment Topology Comparison

We compare the three primary infrastructure patterns for deploying this stack:

```mermaid
graph TD
    A[Sanctuary API Gateway] --> B[Option A: V8 Edge Isolates]
    A --> C[Option B: Container-Based Serverless]
    A --> D[Option C: Persistent VPS / Containers]
    
    B --> B1[Cloudflare Workers / Deno]
    C --> C1[Vercel Serverless / AWS Lambda]
    D --> D1[Railway / Fly.io / VPS]
```

### Option A: V8 Edge Isolates (Cloudflare Workers / Deno Deploy)
*   **How it Works**: The code is compiled into a single JS file and runs on V8 Isolates globally distributed.
*   **Infrastructure Fit**: High. Hono is natively optimized for WinterCG/Edge environments.
*   **Pros**:
    *   **Cold Starts**: Almost non-existent (typically < 5ms).
    *   **Cost**: Extremely cheap or free.
    *   **Scale**: Instantly scales to tens of thousands of concurrent requests.
*   **Cons**:
    *   **Database Constraints**: Cannot use standard PostgreSQL TCP connection pools (`pg`). Must use WebSocket-based drivers (like Neon Serverless driver) or HTTP proxies (Prisma Data Proxy / Supabase connection pooler).
    *   **WASM Limit**: Cloudflare Workers Free Tier enforces a **10ms CPU limit**. The Cedar WASM compiler runs at start, but complex policy lookups under high load might exceed 10ms CPU time if not carefully tuned.

### Option B: Container-Based Serverless (Vercel Serverless / AWS Lambda)
*   **How it Works**: Launches standard Node.js micro-containers on-demand.
*   **Infrastructure Fit**: Medium.
*   **Pros**:
    *   Full compatibility with Node.js modules (TCP sockets, standard `pg` pool).
    *   Very easy integration with Next.js/Expo projects.
*   **Cons**:
    *   **Cold Starts**: Node startup + WASM instantiation can take **500ms to 2.5s** on cold boot.
    *   **Connection Saturation**: Every concurrent micro-container spins up its own database connection, which can quickly saturate PostgreSQL's `max_connections`.
    *   **Licensing Constraint**: Vercel Hobby is strictly **non-commercial** (paused if limits are exceeded).

### Option C: Persistent Containers (Railway / Fly.io / VPS)
*   **How it Works**: A single or small set of persistent virtual machines (e.g. Bun/Node.js running continuously).
*   **Infrastructure Fit**: High.
*   **Pros**:
    *   **Singleton Pool Efficiency**: Our `sharedPool` connection pool persists in memory, minimizing socket allocation overhead.
    *   **Cache Persistence**: The JWT `tokenVerificationCache` persists fully, avoiding expensive remote JWKS lookups.
    *   **Zero Cold Starts**: Cedar WASM is compiled once at startup.
*   **Cons**:
    *   Higher baseline cost (requires continuous execution).

---

## 3. Vendor-Agnostic Setup & Free Runway Strategy

To avoid vendor lock-in and secure the longest free runway, we recommend the following setup:

### Phase 1: Local / Prototyping (100% Free)
*   **Core API**: Deploy on **Deno Deploy** (Free Tier: 1 Million requests/month) or **Cloudflare Workers** (Free Tier: 100,000 requests/day, no commercial restrictions).
*   **Database & Auth**: **Supabase** (Free Tier: 50,000 monthly active users, 500MB PostgreSQL DB, 500,000 Edge Function runs).

### Phase 2: Production Scale / Minimum Cost ($5–$15 / Month Total)
If traffic exceeds free tiers or CPU limitations on Edge runtimes block WASM execution:
*   **API Gateway**: Deploy to **Fly.io** or a **Hetzner VPS** ($4–$6/month). Running a single persistent container (using Bun or Node.js) avoids all cold starts, supports persistent database pools, and has no API limits.
*   **Alternative Serverless Upgrade**: Upgrading to **Cloudflare Workers Paid** ($5/month) lifts the CPU limit from 10ms to 50ms and includes 10 million requests.

---

## 4. Architectural Adaptations for Serverless (Verification)

If deploying the API on Serverless (Edge / Lambda) rather than a persistent container, ensure the following adaptations are in place:

1.  **Draining Pools on Inactivity**: Serverless lambdas are frozen between invocations. Standard pg connections might time out on the DB side while the container is frozen. Our dynamic database pool implementation handles this gracefully by closing idle connections when needed.
2.  **External Poolers**: Ensure the serverless connection string points to a **Transaction Pooler** (port `6543` in Supabase) to prevent socket leaks:
    ```env
    # Points to transaction pooler (pgbouncer) instead of direct database port
    DATABASE_URL="postgres://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
    ```
