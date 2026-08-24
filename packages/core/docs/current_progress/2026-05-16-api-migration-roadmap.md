---
title: "API Operationalization: The \"ts-rest Purge\" Roadmap ðŸš€"
status: "active"
created: 2026-05-16
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core, historical]
---

# API Operationalization: The "ts-rest Purge" Roadmap 🚀

## 1. Current Position (State of the Monorepo)
*   **Fragmentation**: We are split between legacy `ts-rest` contracts (Community, ERP, Grading) and modern `Hono/Zod-OpenAPI` ports (Identity, Educational).
*   **Infrastructure**: Domain logic is currently orchestrated client-side or in fragmented Supabase Edge Functions. This "Distributed Brain" approach is becoming hard to audit and maintain.

## 2. The Phased Migration

### Phase 1: The Contract Purge (BREAKING)
*   **Action**: Convert all `ts-rest` (`initContract`) files in `packages/core/src/api/*.contract.ts` to the `SovereignContract` or pure `Hono/Zod-OpenAPI` pattern.
*   **Target Domains**: `community`, `erp`, `grading`, `growth`, `guardian`, `library`, `operations`, `profile`, `self`.
*   **Goal**: Zero dependencies on `@ts-rest` in the core package.

### Phase 2: Centralized Port Collection
*   **Action**: Aggregate all migrated contracts into a single `masterContract` in `@repo/core/src/api/index.ts`.
*   **Goal**: A single source of truth for the entire platform's surface area, ready for server-side mounting.

### Phase 3: The Railway Gateway (`apps/sanctuary-api`)
*   **Action**: Create a new Hono server app.
    *   Inject the `masterContract`.
    *   Mount the `AuthorityInterceptor` as global middleware.
    *   Expose OpenAPI spec via `/doc` and `/swagger`.
    *   Deploy to Railway with `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
*   **Goal**: A "Real API" that replaces fragmented Edge Functions and provides a robust anchor for third-party services.

### Phase 4: Client Synchronization
*   **Action**: Update `gurudevi-mobile` and web apps to use the Hono `hc` client pointing to the Railway URL.
*   **Goal**: Remove client-side POA proxies and heavy Supabase-direct dependencies in the UI.

### Phase 5: The Agentic Leap (MCP)
*   **Action**: Enable SSE transport in the Railway Hono app to serve as an MCP Host.
*   **Goal**: Allow AI agents to securely interact with the platform using the same Zod contracts and POA policies.

---
*Last Updated: May 2026*
