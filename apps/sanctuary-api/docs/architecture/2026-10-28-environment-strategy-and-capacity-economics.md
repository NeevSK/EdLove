---
title: "Environment Strategy, Capacity Economics & Disaster Recovery"
status: "active"
created: 2026-10-28
updated: 2026-10-28
author: "Naveen"
scribe: "Antigravity"
tags: [environment, economics, capacity, staging, recovery, disaster-recovery, security]
---

# Environment Strategy, Capacity Economics & Disaster Recovery

## Executive Summary

To operate a production-grade infrastructure with **$0 monthly cloud spend**, every compute and storage resource must be allocated according to strict economic limits. This document defines the tripartite environment model (Prod, Staging, Dev), the 750-hour compute budget arithmetic, database isolation, security transport boundaries, and disaster recovery runbooks.

---

## 1. The 750-Hour Compute Budget Arithmetic

Render allocates a **shared pool of 750 free instance hours per calendar month** across all free web services in an account.

$$\text{Monthly Hours in 30 Days} = 30 \times 24 = 720 \text{ hours}$$
$$\text{Monthly Hours in 31 Days} = 31 \times 24 = 744 \text{ hours}$$

> [!WARNING]
> **The Dual-Warm Hazard**:
> If an operator deploys two web services (e.g. `prod` and `staging`) and runs keep-alive heartbeats on both:
> $$\text{Total Compute Consumed} = 720 \times 2 = 1,440 \text{ hours}$$
> By **Day 15 or 16 of the month**, the 750 free hours are 100% depleted. Render will **immediately suspend all free services across the entire account** until the first day of the following month.

---

## 2. Tripartite Environment Strategy

| Dimension | Production (`prd`) | Staging (`stg`) | Development (`dev`) |
| :--- | :--- | :--- | :--- |
| **Compute Target** | Render Free Service (Singapore) | Render Free Service (Singapore) | Localhost (Node.js / Docker) |
| **Lifecycle State** | **Warm 24/7** | **On-Demand Sleep** | Ephemeral / Interactive |
| **Keep-Alive Heartbeat** | Active (10-minute cron) | **DISABLED** (spins down after 15m) | None |
| **Compute Consumption** | ~720 hours / month | ~20–30 hours / month (active test time) | 0 hours |
| **Database Binding** | Supabase Project 1 (Prod) | Supabase Project 2 (Staging) | Local PostgreSQL / Supabase Dev |
| **Doppler Config** | `gurudevi-mobile:prd` | `gurudevi-mobile:stg` | `gurudevi-mobile:dev` |
| **Public URL** | `sanctuary-api-tpj7.onrender.com` | `sanctuary-api-stg.onrender.com` | `localhost:3000` |
| **Monthly Cost** | **$0.00** | **$0.00** | **$0.00** |

---

## 3. Storage & Database Partitioning Strategy

Supabase allows **2 free projects** per organization on the Free Tier:

### Project 1: Production Database
- Dedicated to the warm `sanctuary-api` production instance.
- Supavisor connection pooler enabled in **Transaction Mode** (port `6543`).
- Automatic daily backups.
- Strict Row-Level Security (RLS) and immutable UUIDv8 canonical accounts.

### Project 2: Staging Database
- Dedicated to CI integration pipelines, automated E2E tests, and manual PR reviews.
- Allows destructive migrations, schema experimentation, and test seed data without endangering production.

---

## 4. Security & Transport Hardening

1. **HTTPS Redirection & HSTS**:
   Enforced in [`apps/sanctuary-api/src/core/transportSecurity.ts`](file:///c:/x/apps/sanctuary-api/src/core/transportSecurity.ts). In production, non-TLS connections are rejected with `HTTP 400 Bad Request`.
2. **CORS Boundary**:
   Strict regex matching on `^([a-z0-9-]+)\.gurudevi\.app$`. External cross-origin requests from arbitrary origins are blocked at the edge.
3. **PostgreSQL-Backed Rate Limiter**:
   Guards `/api/*` routes at **100 requests / minute per IP**. Bucket states are pruned automatically every 60 seconds.
4. **In-Process Authorization**:
   Cedar authorization policies are loaded into WebAssembly linear memory on boot. Requests are authorized in $<1\text{ms}$ with zero network calls.

---

## 5. Disaster Recovery & Rollback Runbook

If a faulty deployment or breaking change reaches production:

### Step 1: Immediate Rollback to Previous Deployment
Deployments on Render are immutable Docker images. You can roll back instantly to the prior healthy build ID:
```powershell
# List recent deploys
render deploys list --service srv-dbgndsvlk1mc73914n0g

# Roll back to specific healthy deployment
render deploys rollback <PRIOR_DEPLOY_ID> --service srv-dbgndsvlk1mc73914n0g
```

### Step 2: Emergency Service Restart
To purge memory leaks or reset the connection pool without a rebuild:
```powershell
render services restart srv-dbgndsvlk1mc73914n0g
```

### Step 3: Database Pool Drain Recovery
If PostgreSQL exhausts connection pool slots during a traffic spike:
1. In Supabase Dashboard $\rightarrow$ **Settings** $\rightarrow$ **Database** $\rightarrow$ **Connection Pooling**:
   - Verify `Pool Mode` is set to `Transaction` (not `Session`).
   - Confirm `Default Pool Size` is set to 15 (conserves max DB connections).
2. The `/health/ready` probe will return `HTTP 503` if the database fails, triggering alerts in Better Stack.
