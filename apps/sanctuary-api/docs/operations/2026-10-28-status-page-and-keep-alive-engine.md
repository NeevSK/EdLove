---
title: "Status Page and Automated Keep-Alive Engine"
status: "active"
created: 2026-10-28
updated: 2026-10-28
author: "Naveen"
scribe: "Antigravity"
tags: [status, uptime, keep-alive, monitoring, render, betterstack]
---

# Status Page and Automated Keep-Alive Engine

## Executive Summary

On Render's Free Web Service tier, instances spin down into a dormant cold state after **15 minutes** of idle inactivity. When traffic arrives, the cold boot latency is approximately **50 seconds**. 

To eliminate cold boots while maintaining **$0 spend**, we implemented a dual-vector solution:
1. An in-app status dashboard in `apps/gurudevi-web` (`/status` and `status.gurudevi.app`).
2. An automated keep-alive heartbeat engine running every 10 minutes via GitHub Actions and Better Stack Uptime.

---

## 1. Keep-Alive Heartbeat Mechanics

```
┌────────────────────────────────┐         Every 10 mins         ┌────────────────────────────────┐
│   GitHub Actions Heartbeat     ├──────────────────────────────►│    Render Free Web Service     │
│ (.github/workflows/keep-alive) │                               │   (sanctuary-api Singapore)    │
└────────────────────────────────┘                               └───────────────┬────────────────┘
                                                                                 │
┌────────────────────────────────┐         Every 3 mins                          │ 200 OK (55ms)
│      Better Stack Uptime       ├───────────────────────────────────────────────┤ (Resets 15m idle timer)
│ (status.betterstack.com CNAME) │                                               │
└────────────────────────────────┘                                               ▼
                                                                 ┌────────────────────────────────┐
                                                                 │   Result: ZERO COLD BOOTS      │
                                                                 │   Instance stays warm 24/7     │
                                                                 └────────────────────────────────┘
```

### GitHub Actions Workflow Specification
Located at [`.github/workflows/keep-alive-sanctuary.yml`](file:///c:/x/.github/workflows/keep-alive-sanctuary.yml) and configured by [`.github/keep-alive-config.json`](file:///c:/x/.github/keep-alive-config.json):
- **Trigger**: Cron `*/10 * * * *` (every 10 minutes) + manual `workflow_dispatch`.
- **Target**: Configured in `.github/keep-alive-config.json` (`https://sanctuary-api-tpj7.onrender.com/health/live`).
- **Configuration & Pause Control**:
  - To **pause** the automated heartbeat (to allow the Render container to sleep and conserve the 750 free instance hours per month), simply edit `.github/keep-alive-config.json`:
    ```json
    {
      "enabled": false,
      "service": "sanctuary-api",
      "targetUrl": "https://sanctuary-api-tpj7.onrender.com/health/live",
      "intervalMinutes": 10
    }
    ```
  - The workflow reads this file on every run. When `enabled: false`, it logs:
    `⏸️ Sanctuary API Keep-Alive Heartbeat is currently PAUSED` and exits without hitting Render.
  - Alternatively, set a GitHub repository variable `SANCTUARY_KEEP_ALIVE_ENABLED=false` to pause without a git commit.
  - Manual bypass: Trigger via `gh workflow run keep-alive-sanctuary.yml -f force=true` to test wake-up even while paused.

---

## 2. In-App Status Dashboard (`/status`)

Located at [`apps/gurudevi-web/app/(marketing)/(info)/status/page.tsx`](file:///c:/x/apps/gurudevi-web/app/(marketing)/(info)/status/page.tsx) and [`StatusDashboard.tsx`](file:///c:/x/apps/gurudevi-web/app/(marketing)/(info)/status/StatusDashboard.tsx):

### Monitored Subsystems
1. **Sanctuary API Edge Gateway**: Probed via `/health/live` (monitors container runtime and Hono routing).
2. **PostgreSQL Database & Pool**: Probed via `/health/ready` (executes `SELECT 1` and inspects `api_rate_limit_buckets` table).
3. **Cedar Authorization Engine**: Evaluates in-process WASM status.
4. **Interactive API Docs**: Probed via `/doc` (OpenAPI 3.1 contract schema).
5. **Rate Limiting Engine**: Displays active 100 req/min bucket protection.

### Interactive Features
- **Probe Now Button**: Triggers an on-demand browser-to-edge synthetic probe.
- **Auto-Refresh Toggle**: Re-probes every 30 seconds automatically.
- **Latency Histogram**: Displays a 10-probe historical chart of response latencies.
- **CORS Support**: Whitelisted under [`resolveAllowedCorsOrigin`](file:///c:/x/apps/sanctuary-api/src/core/transportSecurity.ts) for `*.gurudevi.app`.

---

## 3. Dedicated Domain Binding (`status.gurudevi.app`)

### Option A: Better Stack Uptime (Zero Maintenance - Recommended)
1. In Better Stack, go to **Uptime** $\rightarrow$ **Monitors** $\rightarrow$ **Add Monitor**:
   - URL: `https://sanctuary-api-tpj7.onrender.com/health/live`
   - Check frequency: `3 minutes`
2. Go to **Status Pages** $\rightarrow$ **Create Status Page**:
   - Attach the monitor created above.
   - Set custom domain to `status.gurudevi.app`.
3. In Cloudflare DNS:
   - Type: `CNAME`
   - Name: `status`
   - Target: `status.betterstack.com`
   - Proxy status: `DNS only` (or Proxied depending on SSL mode).

### Option B: Direct Web Platform Route
In Cloudflare DNS:
- Type: `CNAME`
- Name: `status`
- Target: `cname.vercel-dns.com` (pointing to `gurudevi-web`).
Next.js route rewrites map `status.gurudevi.app` to `/status`.
