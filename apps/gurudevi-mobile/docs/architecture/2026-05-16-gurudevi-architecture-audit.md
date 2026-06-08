---
title: "Sovereign Monorepo Architecture Audit"
status: "active"
created: 2026-05-20
updated: 2026-05-20
author: "Naween"
tags: [reorganized]
---

# Sovereign Monorepo Architecture Audit (2026-05-16)

This report provides a definitive mapping of the Sovereign monorepo's package structure, dependency hierarchy, and database access patterns.

---

## 1. LIST ALL PACKAGES

| Package Name | Purpose | Key Dependencies |
| :--- | :--- | :--- |
| **`@repo/core`** | Central logic, API contracts, CASL composition, and identity management. | `@repo/database`, `@repo/schema`, `@casl/ability`, `hono` |
| **`@repo/schema`** | Source of truth for ZenStack models and data-layer policies. | `@zenstackhq/orm`, `@zenstackhq/zod`, `zod` |
| **`@repo/database`**| Database client factory (Kysely + ZenStack integration). | `@repo/schema`, `kysely`, `pg` |
| **`@repo/ui`** | Shared UI components (React Native + Gluestack v3). | `gluestack-ui`, `lucide-react-native` |
| **`@repo/classroom`**| Classroom domain (Screens, Hooks, and Components). | `@repo/core`, `@repo/ui`, `@repo/analytics`, `@repo/self` |
| **`@repo/self`** | Personal wellbeing domain (Mood logs, Fire Journal). | `@repo/core`, `@repo/ui` |
| **`@repo/community`**| Social and feed domain (Groups, Posts, Reactions). | `@repo/core`, `@repo/ui` |
| **`@repo/admin`** | Institutional management domain (Staff, School Pulse). | `@repo/core`, `@repo/ui`, `@repo/people` |
| **`@repo/library`** | Resource management domain (Collections, Search). | `@repo/core`, `@repo/ui` |
| **`@repo/form-builder`**| Standalone engine for dynamic JSON-driven forms. | `zod`, `react` |
| **`@repo/database`**| Kysely-driven DB client and migrations. | `kysely`, `pg`, `@repo/schema` |
| **`@repo/platform-mcp`**| MCP server for Sovereign integration. | `@modelcontextprotocol/sdk` |
| **`@repo/scripts`** | Tooling for refactoring and cycle detection. | `zx`, `dependency-cruiser` |
| **`@repo/types-shim`**| Cross-platform type shims for Native/Web parity. | `typescript` |
| **`sanctuary-api`** | Hono API Gateway (Deno/Node compatible). | `@repo/core`, `@repo/database`, `hono` |
| **`gurudevi-mobile`**| Expo-based primary mobile application. | `@repo/core`, `@repo/ui`, `@repo/classroom`, etc. |

---

## 2. DEPENDENCY GRAPH

```mermaid
graph TD
    API[sanctuary-api] --> Core[@repo/core]
    Mobile[gurudevi-mobile] --> Core
    Mobile --> UI[@repo/ui]
    Mobile --> DomainPackages[Domain Packages: classroom, self, etc.]
    DomainPackages --> Core
    DomainPackages --> UI
    Core --> Database[@repo/database]
    Core --> Schema[@repo/schema]
    Database --> Schema
```

---

## 3. DATABASE LAYER CLARITY

### Actual Client
The system uses **ZenStackClient (v3)** as an abstraction layer over **Kysely**.
- **Query Builder**: Kysely.
- **ORM Provider**: ZenStack (handling ReBAC enforcement and Zod generation).
- **Driver**: `pg` (PostgreSQL Pool).

### Location
- Client Initialization: `packages/database/src/client.ts`.
- Policy Logic: `packages/schema/schema.zmodel`.

### Access Patterns
1.  **ReBAC Pattern (Server)**: The API Gateway (`sanctuary-api`) injects a ZenStack-enhanced Kysely client into the request context. All queries are automatically filtered by the policies defined in `.zmodel`.
2.  **Auth/Realtime Pattern (Client)**: The mobile app uses the **Supabase SDK** directly for Authentication (AuthN) and Realtime subscriptions, bypassing the ZenStack layer for these specific concerns.
3.  **Local Pattern (Offline)**: Mobile storage uses **MMKV** (KeyValue) and **SQLite** (Relational) via the `SyncManager`, which queues mutations for later replay against the ReBAC API.

---

## 4. CONCERN MAPPING

| Concern | Package | Primary File / Path |
| :--- | :--- | :--- |
| **Database Access** | `@repo/database` | `src/client.ts` |
| **Schema Definition** | `@repo/schema` | `schema.zmodel` |
| **Access Control (Data)**| `@repo/schema` | `schema.zmodel` (`@@allow` rules) |
| **Access Control (BFF)** | `@repo/core` | `src/logic/permissions/abilities/` |
| **Business Logic** | `@repo/core` | `src/logic/managers/` and `src/api/handlers/` |
| **CASL Abilities** | `@repo/core` | `src/logic/permissions/composer.ts` |
| **Type Definitions** | `@repo/schema` | `src/generated/zod/` (Auto-generated) |
| **Domain Types** | `@repo/core` | `src/types/` |
| **API Contracts** | `@repo/core` | `src/api/*.contract.ts` (ts-rest) |

---

## 5. DRIFT DETECTION

The following concerns are duplicated or split across multiple packages, creating a risk of architectural drift:

1.  **Access Control (Split)**: Logic is bifurcated between `@@allow` rules in `@repo/schema` (which Prisma/Kysely uses) and CASL rules in `@repo/core` (which the UI uses). If a rule is updated in one but not the other, the UI will either show buttons that fail (403) or hide buttons the user is authorized to use.
2.  **Schema Validation (Duplicated)**: Data validation occurs in `schema.zmodel` (ZenStack) but is often re-defined or extended via manual Zod schemas in `@repo/core/src/logic/schemas/`.
3.  **Identity Resolution (Distributed)**: The logic for determining "Who is this user?" exists in `composer.ts` (Core logic), `resolveIdentity.ts` (API Handler), and `useAuthStore` (Client state).
4.  **SQL vs ZenStack (Legacy)**: Legacy RLS policies in `apps/gurudevi-mobile/supabase/migrations/` reference a `role` column, while the modern `@repo/schema` uses `bonds`. This is the most dangerous point of drift.

---

**Audit Status: COMPLETED**
*The monorepo follows a strict "Core-Out" dependency model, but the split between Data-layer (ZenStack) and App-layer (CASL) access control requires manual synchronization.*
