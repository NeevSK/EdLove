---
title: "Sanctuary API Documentation Vault Index"
status: "active"
created: 2026-06-20
updated: 2026-06-25
author: "Naveen"
scribe: "Antigravity"
tags: [index, portal]
---

# Sanctuary API Documentation Vault Index

Welcome to the documentation vault for `sanctuary-api` (Sovereign API Gateway). This file serves as the entry point and index for all backend system documentation.

---

## 📅 Recent Documentation Updates (Chronological Feed)

| Date | Document | Category | Status | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **2026-06-26** | [Guest Session Lifecycle & POA Specification](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-26-guest-session-lifecycle.md) | Architecture | `active` | Architectural specification of the guest session lifecycle, showing sequence flow and explaining the PEP/PDP structure. |
| **2026-06-25** | [2026 Tools & Patterns Adoption Matrix](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-25-tools-adoption-matrix.md) | Architecture | `active` | Precision adoption decisions for Orama, PGlite, CRDTs, ONNX, Effect-TS, and 12 other 2026 patterns. Includes original additions: permission snapshot verification loop, idempotency keys, policy canary, and Orama offline index. |
| **2026-06-25** | [Sovereign API Architecture Direction 2026](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-25-sovereign-api-architecture-direction.md) | Architecture | `active` | Comprehensive strategy covering current alignment, P0-P3 priority fixes, ZKP identity, MCP agentic sight, feature flag gateway middleware, OTel tracing, and AI streaming. |
| **2026-06-25** | [Developer Onboarding Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/developer-onboarding-guide.md) | Architecture | `active` | Onboarding documentation covering gateway architecture, tech stack, codebase navigation, running the app, and local tools. |
| **2026-06-25** | [Testing Standards](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/testing-standards.md) | Architecture | `active` | Updated testing standards for ZenStack v3, Kysely, Zod v4, and Scalar API Reference integration. |
| **2026-06-25** | [Astro v6 to v7 Breaking Changes](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/infra/2026-06-25-astro-v6-to-v7-breaking-changes.md) | Infrastructure | `active` | Breakdowns of strict Rust HTML compilation, whitespace JSX-style compression, Vite 8 upgrade, and removed DB/Transitions APIs. |
| **2026-06-25** | [Astro v7 Upgrade Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/infra/astro-v7-upgrade-guide.md) | Infrastructure | `active` | Migration guide from Astro v6 to Astro v7 including Vite 8, Rust compiler strictness, Sätteri Markdown pipeline, and removed features. |
| **2026-06-20** | [Developer Sandbox Console](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/developer-sandbox-console.md) | Architecture | `active` | Document the Developer Sandbox Console & Inline Parser trigger flow, configuration parameters, and compile-time bundle security constraints. |
| **2026-06-20** | [Docs SOP](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/docs-sop.md) | Standards | `active` | Document rules, file formatting, lifecycle rules, and frontmatter requirements. |
| **2026-06-20** | [Infrastructure & Cost Evaluation](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/infrastructure-and-cost-evaluation.md) | Infrastructure | `active` | Evaluate API workload CPU/RAM profiling, V8 edge vs. Node container serverless capabilities, and long-run free tier strategies. |
| **2026-06-20** | [Tech Stack & Standards](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/tech-stack-and-standards.md) | Architecture | `active` | Platform-agnostic Hono standards, WinterCG alignment, Cedar WASM v4 authorization, ZenStack v3, Web Crypto, and CORS guidelines. |
| **2026-06-20** | [Testing Standards](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/testing-standards.md) | Architecture | `active` | Vitest configuration, Hono `testClient` integration, database fault injection testing, and multi-tenant rapid parallel concurrency checks. |
| **2026-06-12** | [AI Assistant Hono Migration & Sovereign Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md) | Architecture | `active` | Migrated AI Assistant's orchestrator from Supabase Edge Functions to Hono with Hexagonal architecture, enclave decryption, rate-limiting, and failovers. |

---

## 📁 Document Categories

### 📐 Technical Architecture & Specifications Vault
*   [Developer Onboarding Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/developer-onboarding-guide.md) - Service introduction, tech stack overview, workspace mapping, and DX workflows.
*   [Developer Sandbox Console](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/developer-sandbox-console.md) - Architecture, trigger flows, inline configurations, and tree-shaking security.
*   [Docs SOP](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/docs-sop.md) - Format, frontmatter, and naming conventions.
*   [Guest Session Lifecycle & POA Specification](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-26-guest-session-lifecycle.md) - Lifecycle, sequence diagram flow, and Proof of Authority (POA) explanation for guests.
*   [Infrastructure & Cost Evaluation](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/infrastructure-and-cost-evaluation.md) - Workload memory/CPU footprint audit, serverless adapters vs. persistent container comparison, and zero-cost scaling plans.
*   [Tech Stack & Standards](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/tech-stack-and-standards.md) - Sovereign API Gateway architecture using Hono, WinterCG targets, Cedar WASM v4, ZenStack v3, and database pooling rules.
*   [Testing Standards](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/testing-standards.md) - Integrated automated test strategies using Vitest, Hono test client, and safety validation boundaries.
*   [AI Hono Migration (2026-06-12)](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md) - Edge function migration and AI assistant routing structures.

### ⚙️ Infrastructure & Operations
*   [Astro v6 to v7 Breaking Changes](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/infra/2026-06-25-astro-v6-to-v7-breaking-changes.md) - Deep dive guide for breaking API changes, compiler updates, and configurations during migration.
*   [Astro v7 Upgrade Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/infra/astro-v7-upgrade-guide.md) - Migration checklist and breaking changes reference for upgrading to Astro v7.0.


