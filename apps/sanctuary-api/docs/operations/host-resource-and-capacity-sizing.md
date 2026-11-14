---
title: "Sanctuary API Host Resource & Capacity Sizing Guide"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Antigravity"
tags: [operations, sizing, capacity, bun, node, infrastructure, hosting]
---

# Sanctuary API Host Resource & Capacity Sizing Guide

## 1. Overview & Architectural Sizing Drivers

This operational reference specifies the resource configurations (CPU, Memory, Networking, and Database pooling limits) required to host `@repo/sanctuary-api` stably under production and high-concurrency conditions.

The sizing requirements are governed by four internal subsystems:

1. **Cedar WASM JIT Overhead**: `@cedar-policy/cedar-wasm` allocates ~30–40 MB of persistent memory on container startup for compiled access-control policies.
2. **Database Connection Pooling**: Kysely and ZenStack maintain singleton connection pools. Without connection budgeting and PgBouncer transaction pooling, multiple API instances will rapidly exhaust PostgreSQL's `max_connections`.
3. **In-Memory JWT & Authority Cache**: `verifySupabaseJwt` maintains an LRU memory cache for active identities and cryptographic verification keys.
4. **Long-Lived HTTP Sockets & SSE Streams**: Real-time events (`/api/events`), real-time heartbeats, and AI token streams require sustained open file descriptors and anti-buffering reverse proxy configurations.

---

## 2. Resource Sizing Profiles Matrix

| Specification | **Tier 1: Staging / Dev (Minimum)** | **Tier 2: Production Standard ("Spacious & Stable")** | **Tier 3: Enterprise / High-Scale** |
| :--- | :--- | :--- | :--- |
| **vCPU** | 0.5 – 1 shared vCPU | **1 – 2 dedicated vCPUs** (or 2 shared) | 2 – 4 dedicated vCPUs |
| **RAM** | 1 GB | **2 GB** | 4 GB+ |
| **Runtime Engine** | Bun 1.4.4 or Node 24 | **Bun 1.4.4** (or Node 24 with 1.6 GB heap) | Bun 1.4.4 (Multi-instance) |
| **Sustained Req/s** | ~300 – 500 req/s | **2,500 – 5,000 req/s** | 10,000+ req/s (clustered) |
| **Concurrent SSE Sockets** | ~100 connections | **~1,000 connections** | ~5,000+ connections |
| **Hardware Examples** | Render Starter / Fly.io 1GB / VPS | **Render Standard ($25/mo) / Hetzner CPX21 / AWS t4g.medium** | Hetzner CPX31 / AWS c6g.xlarge |

### The 512 MB Container Risk Warning
> **Avoid 512 MB Containers in Production:** While Bun's base RSS memory is lean (~45 MB vs Node's ~90 MB), high concurrency bursts (such as a 50-worker spike handling 50k+ requests), Cedar WASM allocations, SSE client buffers, and JSON payload deserialization can drive memory usage to 600–700 MB. In a 512 MB cgroup environment, the Linux kernel triggers an abrupt `SIGKILL` (OOM) with zero diagnostic stack traces. **2 GB RAM provides safe operational headroom.**

---

## 3. Host System & OS-Level Tuning

### 3.1 File Descriptors (`ulimit -n`)
Because Sanctuary API handles concurrent SSE streams, database pool sockets, and external webhook integrations, configure the container/host open file limit:
```bash
ulimit -n 65535
```
In Docker (`docker run` or `docker-compose.yml`):
```yaml
ulimits:
  nofile:
    soft: 65535
    hard: 65535
```

### 3.2 Memory Limits & Garbage Collection Guardrails

#### Running on Node.js (V8)
In a 2 GB container, set V8's old-space threshold so garbage collection runs aggressively before hitting the container limit:
```bash
NODE_OPTIONS="--max-old-space-size=1600"
```

#### Running on Bun (JavaScriptCore)
Bun utilizes a unified JavaScriptCore heap and `mimalloc`/`tcmalloc` allocator. Enforce hard limits at the container level:
```yaml
deploy:
  resources:
    limits:
      memory: 2048M
      cpus: '2.0'
```

---

## 4. Database Connection Pool Architecture

Sanctuary API uses ZenStack + Kysely with PostgreSQL. Direct connection scaling fails if multiple instances each open unconstrained connection pools.

```
[Sanctuary API Instance 1] (Pool: 10 conns) ──┐
[Sanctuary API Instance 2] (Pool: 10 conns) ──┼──> [PgBouncer / Supabase Pooler (Port 6543)] ──> [PostgreSQL Core (Port 5432)]
[Sanctuary API Instance 3] (Pool: 10 conns) ──┘    (Transaction Mode: thousands of virtual queries)   (max_connections: 100)
```

1. **Transaction Pooling**: Always connect through a pooler (PgBouncer or Supabase connection pooler on port `6543`) rather than direct port `5432`.
2. **Pool Sizing Per Container**:
   - `max_connections_per_container = 10 to 15`
   - `idle_timeout = 20s`
3. **Socket Exhaustion Prevention**: If connecting to a managed DB (e.g., Neon or Supabase), ensure SSL mode is enabled (`sslmode=require`) with persistent pool reuse.

---

## 5. Reverse Proxy & Edge Ingress Configuration (Nginx / Envoy / Render / Cloudflare)

### 5.1 Anti-Buffering for Server-Sent Events (SSE) & AI Streaming
HTTP reverse proxies default to buffering streaming responses (up to 16 KB chunks). This causes real-time tokens and events to stall.

- **Mandatory Response Headers** (enforced in application code):
  ```typescript
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no'
  ```
- **Nginx Ingress Configuration**:
  ```nginx
  location /api/events {
      proxy_pass http://sanctuary_api_upstream;
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      proxy_buffering off;
      proxy_cache off;
      proxy_read_timeout 120s;
  }
  ```

### 5.2 Heartbeats & Idle Keep-Alive Timeouts
The edge proxy idle timeout must exceed the application's heartbeat interval (20s). Set edge proxy timeouts to **65–120 seconds** to prevent premature socket resets.

---

## 6. Health Probes & Zero-Downtime Deployment Invariants

Never bind deployment readiness to external third-party services on liveness routes:

| Probe Type | Endpoint | Purpose | Interval | Timeout | Failure Threshold |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Liveness** | `GET /health/live` | Tests internal event-loop responsiveness (no database queries). | 5s | 2s | 3 |
| **Readiness** | `GET /health/ready` | Tests live PostgreSQL pool connectivity before admission. | 15s | 5s | 2 |

---

## 7. Operational Checklist Before Promotion

- [ ] Host container provisioned with $\ge$ 1 GB RAM (Staging) or $\ge$ 2 GB RAM (Production).
- [ ] Runtime chosen: Bun 1.4.4 verified or Node 24 with `NODE_OPTIONS="--max-old-space-size=1600"`.
- [ ] Database URL points to transaction pooler (`:6543`) with `sslmode=require`.
- [ ] `ulimit -n` set to $\ge$ 65,535 in container environment.
- [ ] Reverse proxy configured with `proxy_buffering off` for `/api/events` and `/api/ai/*`.
- [ ] Liveness probe pointed strictly to `/health/live`.
- [ ] Secrets injected via Doppler (`gurudevi-mobile:dev` or `gurudevi-mobile:prd`), including `BYOK_ENCRYPTION_SECRET` ($\ge 32$ chars).
