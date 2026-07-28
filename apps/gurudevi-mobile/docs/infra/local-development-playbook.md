---
title: "🛡️ Gurudevi Local Development & Architecture Playbook"
status: "active"
created: 2026-05-22
updated: 2026-05-22
author: "Naween"
tags: [reorganized]
---

# 🛡️ Gurudevi Local Development & Architecture Playbook

This document serves as the permanent developer guide for running and testing the **Sovereign Architecture** locally. It documents our decoupled pipeline (Client ➔ Hono API ➔ Supabase DB) and provides high-performance, selective startup commands.

---

## 1. The Architecture Pipeline

```
  [ Client Web/Mobile ] (Port 8081)
          │
          │ (REST API / RPC Client with Supabase JWT)
          ▼
   [ Hono API Gateway ] (Port 3000)   <--- Zero-Trust authorization (Cedar + ZenStack)
          │
          │ (Prisma Client)
          ▼
  [ Supabase Postgres ] (AP-South Cloud)
```

1. **Authentication (Direct-to-Supabase):** Login requests directly query the Supabase Auth service in the cloud to secure a cryptographic JSON Web Token (JWT).
2. **Business Operations (Strict Hono Pipeline):** Reads/writes travel to your local Hono API at `http://localhost:3000/api`. Hono checks permissions offline in WebAssembly, authorizes the transaction, and executes the database query.

---

## 2. Selective Startup: Avoiding "Too Many Web Apps" 🚫

In a large monorepo, running `pnpm dev` from the root starts *every single application* (marketing sites, analytics, docs portals, etc.), which is slow and memory-intensive.

To boot **only** the Mobile/Web Client and the Hono API together, use these two streamlined approaches:

### Approach A: The Selective Turbo Command (Single Terminal) 🚀
Run this command from the **root directory**. Turborepo will start only these two targets, ignore the heavy marketing and document apps, and stream their logs in a single window:

```powershell
pnpm exec turbo run dev --filter=gurudevi-mobile --filter=@repo/sanctuary-api
```

---

### Approach B: The Dual Terminal Setup (Best for Detailed Debugging) 🛠️
Run these in separate terminal tabs in your editor:

* **Terminal 1: Start the Client App (Expo CLI / Web Bundle)**
  ```powershell
  pnpm --filter=gurudevi-mobile start -c
  ```
  *(Launches user interface on port `8081`)*

* **Terminal 2: Start the Hono API Gateway**
  ```powershell
  pnpm --filter=@repo/sanctuary-api dev
  ```
  *(Launches Hono server on port `3000`)*

---

## 3. How to Test Your Endpoints Locally

### 1. The Swagger UI Console (Visual Playground)
With the Hono API server running, open your web browser to:
👉 **`http://localhost:3000/ui`**

You will get a fully interactive API console automatically synchronized with your Zod code schemas. You can use it to compose requests, test validation boundaries, and view server responses in real time.

### 2. Custom REST Playground
We have pre-configured a developer HTTP script filled with active PowerShell `Invoke-RestMethod` and native `curl` templates:
👉 **`apps/sanctuary-api/scratch/api_test.http`**

Simply copy any request command line from this file and paste it into your active terminal tab to test permission-blocking rules immediately.

### 3. Automated In-Memory Tests
To verify all authorization middleware and JWT parsers in milliseconds without spawning socket listeners:
```powershell
pnpm --filter=@repo/sanctuary-api test
```

---

## 4. Troubleshooting: Supabase Connection
If you see `net::ERR_NAME_NOT_RESOLVED` or `TypeError: Failed to fetch` warnings:
1. It usually means the Supabase cloud instance has gone to sleep due to inactivity.
2. In this case, wait 60 seconds for the database VM to wake up and restore its DNS records, then refresh your browser page.
