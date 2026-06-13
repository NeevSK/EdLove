---
title: "Gurudevi Mobile Documentation Vault Index"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [index, portal]
---

# Gurudevi Mobile Documentation Vault Index

Welcome to the documentation vault for `gurudevi-mobile`. This file serves as the entry point and index for all system documentation.

---

## 📅 Recent Documentation Updates (Chronological Feed)

| Date | Document | Category | Status | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **2026-06-12** | [AI Assistant Hono Migration & Sovereign Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/sanctuary-api/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md) | Architecture | `active` | Migrated AI Assistant's orchestrator from Supabase Edge Functions to Hono with Hexagonal architecture, enclave decryption, rate-limiting, and failovers. |
| **2026-06-12** | [Hexagonal Ports & Adapters Rollout](file:///c:/Users/Naween/projects/polymath-platform/packages/core/docs/architecture/2026-06-12-hexagonal-ports-adapters-rollout.md) | Architecture | `active` | Defined ports and concrete adapters for Telemetry (PostHog), Gating/Flags (Supabase/GrowthBook), and Authorization (Cedar). |
| **2026-06-12** | [Web-Only Payments & Hexagonal Entitlements](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-web-only-payments-and-entitlements.md) | Decisions | `active` | Architectural decision to bypass native Google/Apple payments, processing subscriptions on the web and syncing entitlements offline. |
| **2026-06-12** | [Decoupled TanStack Table and Virtual Integration](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-decoupled-tanstack-table-and-virtual-integration.md) | Decisions | `active` | Architectural decision to decouple TanStack Table logic from Web & Native virtualized renderers. |
| **2026-06-12** | [React Query and TanStack Pacer Integration](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-react-query-pacer-integration.md) | Decisions | `active` | Architectural decision to combine React Query and TanStack Pacer to throttle PowerSync sync streams and debounce search queries. |
| **2026-06-11** | [Mobile Bundle Size Optimization Execution Report](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-11-mobile-bundle-optimization-report.md) | Infrastructure | `active` | Report detailing audit, leak plugging, and tree-shaking optimizations resulting in a 1.28 MB reduction in bundle size. |
| **2026-06-10** | [Monorepo Upgrade and Navigation Purge Execution Report](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-monorepo-upgrade-and-cleanup-execution.md) | Infrastructure | `active` | Report detailing the execution of Expo SDK 56 alignment, safe major updates, React Navigation removal, and navigation check flag purging. |
| **2026-06-10** | [Dependency Alignment and Upgrade Testing Playbook](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-alignment-and-upgrade-testing.md) | Infrastructure | `active` | Testing playbook for peer dependency compatibility checks, automatic alignment checks, and rollback spike workflows. |
| **2026-06-10** | [Expo Router Migration and Major Dependencies Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-migration-and-major-dependency-audit.md) | Audits | `active` | Deep-dive review of Expo Router transfer, Expo version mismatch, major updates list, and gesture handler risks. |
| **2026-06-10** | [Gurudevi Mobile and Shared Packages Dependency Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-audit.md) | Audits | `active` | Deep-dive audit of outdated dependencies in gurudevi-mobile and supporting shared packages using taze. |
| **2026-06-10** | [Offline Security & Resilience Blueprint](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/offline-security-and-resilience.md) | Security | `active` | Threat model, SubtleCrypto dynamic key verification, and dual-PDP fail-safe boundaries. |
| **2026-06-10** | [Offline Gating and Authorization](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md) | Security / Sync | `active` | Layered Cedar WASM and signed permission snapshots for native write safety. |
| **2026-06-10** | [POA Client-Side Proxy Unentanglement](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-10-poa-proxy-unentanglement.md) | Security / Arch | `active` | Removing redundant client-side POA proxy in favor of database and Hono PEP middleware. |
| **2026-06-09** | [Oxlint and ESLint Hybrid Integration Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/oxlint-and-eslint-hybrid-guide.md) | Infrastructure | `active` | Pipeline setup for Oxlint + ESLint hybrid strategy and Biome format-only configurations. |
| **2026-06-09** | [React Compiler and ESLint Guidance](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/react-compiler-and-eslint-guide.md) | Infrastructure | `active` | Aligning ESLint 9 configuration and React Compiler for React 19.2/RN 0.85 stack. |
| **2026-06-09** | [Gurudevi UI Development Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/ui-development-guide.md) | UI / Layout | `active` | Zero-legacy screen architecture, hook contracts, caching levels, and quality checklists. |
| **2026-06-09** | [Agent Offline Strategy Briefing](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/agent/agent-briefing-offline-strategy-framework.md) | Agent / Sync | `active` | Feature-level decision trees and guided implementation checklists for offline-first. |
| **2026-06-09** | [Sanctuary API and Backend Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/sanctuary-api-and-backend-spec.md) | Backend | `active` | Hono routing, ZenStack Zod v4 validation, and MCP integration. |
| **2026-06-09** | [Web-Native Compatibility Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/web-native-compatibility-guide.md) | Compatibility | `active` | Metro resolutions, native package shims, and responsive layout shells. |
| **2026-06-09** | [Offline-Online Synchronization Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/offline-online-sync-spec.md) | Sync | `active` | PowerSync queue flow, idempotency keys, LWW conflict resolution, and soft deletes. |
| **2026-05-31** | [Navigation Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/navigation-architecture.md) | Navigation | `active` | Mobile route structuring and transition specifications. |
| **2026-05-31** | [Sovereign Agent Skills](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-31-sovereign-agent-skills.md) | Agent / AI | `active` | Skills framework and tool integrations. |
| **2026-05-27** | [Pre-Migration Progress Tracker](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-progress-tracker.md) | Progress | `active` | Tracking milestones before the major monorepo migration. |
| **2026-05-27** | [Pre-Migration Operationalization Plan](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-operationalization-plan.md) | Progress | `active` | Step-by-step rollout plan for database and runtime updates. |
| **2026-05-27** | [Pre-Migration Caveats & Memory](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-caveats-memory.md) | Progress | `active` | Important quirks, learnings, and gotchas identified. |
| **2026-05-27** | [Responsive Shell & Layout Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/gurudevi-responsive-shell-layout-spec.md) | UI / Layout | `active` | Tablet/Web responsive shell behaviors and grids. |
| **2026-05-27** | [Ground Truth Audit 2](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-27-ground-truth-audit-2.md) | Audits | `active` | Deep-dive verification of configuration and schemas. |
| **2026-05-27** | [Expo Router Audit 2](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-27-expo-router-audit-2.md) | Audits | `active` | Routing patterns and dynamic parameters stability. |
| **2026-05-25** | [CJS to ESM Native Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/cjs-to-esm-native-guide.md) | Standards | `active` | Transition path from CommonJS modules to Native ES Modules. |
| **2026-05-20** | [Offline IAM & Write Safety Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md) | Security | `active` | Data write integrity and role authorization safety. |
| **2026-05-18** | [Offline Authorization Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md) | Security | `active` | Locally cached RBAC rules execution pattern. |
| **2026-05-06** | [Sovereign ReBAC Developer Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-rebac-developer-guide.md) | Security | `active` | Relationship-Based Access Control integration instructions. |

---

## 📁 Document Categories

### 📋 Product Specification & Vision Vault (Product Manager)
*   [SOP (Documentation Rules)](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/docs-sop.md) - Format, frontmatter, and naming conventions.
*   [Educational Ecology and Philosophy](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/educational-ecology-philosophy.md) - Concentric circles, holons, polycentric governance theory.
*   [Domain Context and User Roles](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/domain-and-users.md) - User perspectives, active bonds, and role mappings.
*   [Product Footprint: Web vs Mobile](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/product-footprint-web-vs-mobile.md) - Feature allocations across native mobile, platform web, and marketing site.
*   [Complete PRD](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/GURUDEVI_COMPLETE_PRD.md) - Living product requirements specification.
*   [Gurudevi Foundation V4](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/gurudevi_foundation_v4.md) - Core values and foundation specifications.

### 📐 Technical Architecture & Specifications Vault (Solution Architect)
*   [Technical Stack](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/tech-stack.md) - Expo 56, RN 0.85, Hono, Supabase, and local storage.
*   [Workspace and Navigation Philosophy](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/workspace-navigation-philosophy.md) - Five ecological circles, workspace dynamics, and Expo Router.
*   [Technical Architecture and Constraints](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/technical-architecture-constraints.md) - Multi-tenant RLS, offline-first sync (PowerSync), device boundaries.
*   [Identity and Access Management (IAM)](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/identity-and-access-management.md) - Cedar-style ReBAC, active bonds, offline attributes, and device trust.
*   [Security and Data Integrity](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/security-and-data-integrity.md) - PostgreSQL RLS, explicit sovereignty grants (ADR-002), HMAC signatures.
*   [Offline-Online Synchronization Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/offline-online-sync-spec.md) - PowerSync queue execution, idempotency verification, Last-Write-Wins, and soft deletes.
*   [Web-Native Compatibility Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/web-native-compatibility-guide.md) - Platform resolutions, native package web shims, and layout responsive shells.
*   [Sanctuary API and Backend Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/sanctuary-api-and-backend-spec.md) - Dynamic Hono route schemas, ZenStack Zod v4 validation, and MCP hosts.
*   [Project Map](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/project-map.md) - Scope and module mapping of the project.
*   [Navigation Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/navigation-architecture.md) - App screens and routing map.
*   [UI Color Doctrine](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/ui-color-doctrine.md) - The design system palette and theme standards.
*   [Local Development Playbook](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/LOCAL_DEVELOPMENT_PLAYBOOK.md) - Getting started locally.
*   [Testing Strategy](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/TESTING_STRATEGY.md) - Unit, integration, and UI test setups.
*   [UI Development Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/ui-development-guide.md) - Zero-legacy screen architecture, hook contracts, caching levels, and quality checklists.
*   [Gurudevi Tools & Tricks](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/gurudevi_tools_tricks_v2.md) - Tips for development efficiency.

### 📐 System Architecture Specs
*   [Responsive Shell & Layout Spec](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/gurudevi-responsive-shell-layout-spec.md) - Shell behavior standard.
*   [Inngest V4 Core Shell](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/INNGEST_V4_CORE_SHELL.md) - Background events engine.
*   [Durable Agents R&D Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/DURABLE_AGENTS_RND_GUIDE.md) - Agent systems framework.
*   [FlashList Patterns](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/flash-list-patterns.md) - Infinite scrolling optimization patterns.
*   [Bootstrap and Entrypoint Standard](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/bootstrap-and-entrypoint-standard.md) - Startup sequence flow.
*   [Protocol-Oriented Authority (POA) SSOT](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/poa-authority-ssot.md) - Core authorization specifications.

### 🏛️ Architecture Decision Records (ADRs)
*   [Web-Only Payments & Hexagonal Entitlements](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-web-only-payments-and-entitlements.md) - Bypassing native IAP store fees via secure web checkout systems and power-syncing subscription entitlements.
*   [Decoupled TanStack Table and Virtual Integration](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-decoupled-tanstack-table-and-virtual-integration.md) - Decoupling table data models and logic from platform viewports and virtualization renderers.
*   [React Query and TanStack Pacer Integration](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-12-react-query-pacer-integration.md) - Combining React Query and TanStack Pacer to throttle database synchronization invalidation loops and manage task timing.
*   [Offline Gating and Authorization](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md) - Layered Cedar WASM evaluation and signed snapshot fallback for local Drizzle write security.
*   [POA Client-Side Proxy Unentanglement](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/2026-06-10-poa-proxy-unentanglement.md) - Removing redundant client-side POA proxy in favor of database and Hono PEP middleware.


### 📦 Platform, Infrastructure & Deployment Guides (Vercel, Cloudflare, Expo, PNPM, ESLint)
*   [Mobile Bundle Size Optimization Execution Report](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-11-mobile-bundle-optimization-report.md) - Report detailing audit, leak plugging, and tree-shaking optimizations resulting in a 1.28 MB reduction in bundle size.
*   [Monorepo Upgrade and Navigation Purge Execution Report](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-monorepo-upgrade-and-cleanup-execution.md) - Report on Expo SDK 56 alignment, major version upgrades, and navigation cleanups.
*   [Dependency Alignment and Upgrade Testing Playbook](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-alignment-and-upgrade-testing.md) - Diagnostic tools and step-by-step procedures for testing major version updates.
*   [Oxlint and ESLint Hybrid Integration Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/oxlint-and-eslint-hybrid-guide.md) - Pipeline setup for Oxlint + ESLint hybrid strategy and Biome format-only configurations.
*   [React Compiler and ESLint Guidance](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/react-compiler-and-eslint-guide.md) - Configuration rules and auto-memoization checks.
*   [pnpm Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/pnpm-guide.md) - Dependency management rules.
*   [Expo Development Paths](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/expo-development-paths.md) - Simulator and physical device flows.
*   [Expo SDK Deprecation Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/expo-sdk-deprecation-guide.md) - Upgrading package APIs.
*   [Vercel Deployment](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/vercel-deployment.md) - Vercel hosting specs.
*   [Vercel Limits and Cloudflare R2](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/vercel-limits-and-r2.md) - Storage options.
*   [Cloudflare Deployment](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/cloudflare-deployment.md) - Cloudflare hosting rules.
*   [Hosting Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/hosting-guide.md) - General topology specs.

### 🛡️ Security, ReBAC & Audits
*   [Expo Router Migration and Major Dependencies Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-migration-and-major-dependency-audit.md) - Deep-dive review of Expo Router transfer status, Expo mismatches, major updates list, and gesture handler risks.
*   [Gurudevi Mobile and Shared Packages Dependency Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-audit.md) - Deep-dive audit of outdated dependencies in gurudevi-mobile and shared libraries using taze.
*   [Offline Security & Resilience Blueprint](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/offline-security-and-resilience.md) - Security controls, keys configuration, and system threat mitigation model.
*   [Offline Authorization Architecture](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md) - Offline RBAC rule caches.
*   [Sovereign ReBAC Developer Guide](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-rebac-developer-guide.md) - Relationship-Based Access Control logic.
*   [Offline IAM & Write Safety Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md) - Data write validation report.
*   [Actor x Resource matrix Permission Audit](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-actor-resource-permission-matrix-audit.md) - Permission structures.
*   [Ground Truth Audit 2](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/2026-05-27-ground-truth-audit-2.md) - General workspace audit.

### 🤖 Sovereign Agent Frameworks & Prompt Lenses (AI Assistant)
*   [Agent Prompt Lens](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/agent/AGENT_PROMPT_LENS.md) - Definitive rules for AI coding agents regarding UI patterns, code plans, and constraints.
*   [Agent Briefing: Offline Strategy Framework](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/agent/agent-briefing-offline-strategy-framework.md) - Discovery questions and checklists for offline-first feature implementation.
*   [Master Protocol](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/agent/MASTER_PROTOCOL.md) - Core behavioral rules and collaboration guidelines for AI assistants.
*   [Agent Resonance](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/agent/AGENT_RESONANCE.md) - Three-dimensional checks for code resonance (vertical, horizontal, diagonal).

### 📅 Current Progress & Plans
*   [Pre-Migration Progress Tracker](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-progress-tracker.md) - Plan status tracker.
*   [Pre-Migration Operationalization Plan](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-operationalization-plan.md) - Operational rollout stages.
*   [Classroom Teacher Implementation Plan](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/current_progress/2026-05-22-classroom-teacher-implementation-plan.md) - Teacher UI feature milestones.
