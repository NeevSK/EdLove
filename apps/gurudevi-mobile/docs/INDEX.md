---
title: "Gurudevi Mobile Documentation Vault Index"
status: "active"
created: 2026-06-10
updated: 2026-08-04
author: "Naveen"
scribe: "Antigravity"
tags: [index, portal]
---

# Gurudevi Mobile Documentation Vault Index

Welcome to the documentation vault for `gurudevi-mobile`. This file serves as the entry point and index for all system documentation.

---

## Feature lifecycle authority — read first

These documents are the current authority for capability inventory, rollout, stale-flag governance, and retirement. Older Supabase/RPC feature-flag documents remain historical and must not be used as implementation guidance.

1. [Feature Lifecycle Management](./architecture/feature-lifecycle-management.md) — continuously maintained source of truth.
2. [Lifecycle Audit and Consolidated Plan](./architecture/2026-07-26-feature-flag-lifecycle-audit-and-plan.md) — dated implementation evidence.
3. [Feature Lifecycle Decision](./decisions/004-feature-lifecycle-management.md) — current architecture boundary.
4. [Legacy Schema Retirement Runbook](./architecture/2026-07-26-feature-flag-schema-retirement-runbook.md) — production-only retirement procedure.
5. [New Capability and Feature Flag Checklist](./architecture/NEW_FEATURE_CHECKLIST.md) — onboarding procedure for developers and agents.
6. [Feature Gate Order and Context Ownership](./decisions/005-feature-gate-order-and-context-ownership.md) — authorization, entitlement, rollout, and offline boundaries.
7. [Feature Access: Local and Server Architecture](./architecture/2026-07-26-feature-access-local-server-architecture.md) — bootstrap context, authority boundaries, and enforcement parity.
8. [Entity-Bond and Policy Parity Foundation](./architecture/2026-07-26-entity-bond-policy-parity-feature-spec.md) — canonical bond scope, ZenStack/Cedar vocabulary, and offline authority rules.
9. [Identity, App, Device, and Account Lifecycle](./architecture/identity-app-device-lifecycle.md) — authoritative app/user/device topology, guest conversion, onboarding, citizenship, institutional joining, and entitlement boundaries.
10. [Feature Lifecycle Future Work](./architecture/feature-lifecycle-future-work.md) — remaining production control-plane, legacy-schema, and governance work.
11. [Capability Policy Composition Guide](./architecture/capability-policy-composition-guide.md) — how capacity, school type, citizenship, entitlement, platform, and rollout criteria are assigned to the correct authority.
12. [GrowthBook Cloud Rollout Record](./architecture/2026-08-04-growthbook-cloud-rollout.md) — live control-plane state: 12 flags created, SDK wiring verification, audit result, client key, follow-ups.
13. [GrowthBook Key Naming (ADR-012)](./decisions/012-growthbook-key-naming-ssot.md) — canonical `gurudevi.<domain>.<feature>` key convention, SSOT manifest, and rollout plan.

## Platform-wide native capability work

1. [Native Capabilities](../../../native-capabilities/README.md) — middle-out architecture, capability contracts, testing/error/debugging standards, mental models, and roadmap for Rust/UniFFI, Expo modules, and Nitro.

## Reliability and observability authority — read before Effect or telemetry work

1. [Observability and Error Handling Guide](./Core/observability-and-error-handling-guide.md) — day-to-day developer and agent rules.
2. [Effect, PostHog, Sentry, and OpenTelemetry Boundary](./decisions/2026-07-26-effect-observability-boundary.md) — why each system exists, what it owns, and what is intentionally deferred.
3. [Sanctuary API Observability and OpenTelemetry Plan](../../sanctuary-api/docs/architecture/2026-07-26-observability-and-tracing-plan.md) — backend-first tracing scope and mobile deferral criteria.
4. [Effect and OpenTelemetry Coherence and Coverage Audit](./architecture/2026-07-26-effect-otel-coherence-and-coverage-audit.md) — evidence-based coverage matrix, coherence rules, gaps, and completion definition.
5. [Effect and OpenTelemetry Production Roadmap](./Core/effect-otel-production-roadmap.md) — living implementation order, exit gates, and review rules.
6. [Product Analytics and PostHog Contract](./architecture/2026-07-26-product-analytics-posthog-spec.md) — canonical product dimensions, event vocabulary, privacy boundaries, and PostHog ownership.
7. [Product Analytics Developer Guide](./architecture/product-analytics-guide.md) — practical rules for adding product events.
8. [Effect-TS Coding Guide](./Core/effect-ts-coding-guide.md) — Effect patterns and anti-patterns.
9. [Product Analytics Future Work](./architecture/product-analytics-future-work.md) — remaining privacy, event-quality, dashboard, and offline-verification work.

---

## 📅 Recent Documentation Updates (Chronological Feed)

| Date | Document | Category | Status | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **2026-08-04** | [GrowthBook Cloud Rollout Record](./architecture/2026-08-04-growthbook-cloud-rollout.md) | Architecture / Feature Flags | `active` | Created the 12 `gurudevi.*` flags in the live project (production + dev, all disabled), verified the SDK wiring against the GrowthBook quickstart, wired `sdk-...` client key, and confirmed zero control-plane drift via the strict audit. |
| **2026-07-28** | [Production Readiness, oRPC Migration & PDPA Compliance Analysis](./current_progress/2026-07-28-production-readiness-and-compliance-analysis.md) | Current Progress | `active` | Evaluation of gurudevi-mobile production gaps, a detailed oRPC backend/client migration pattern, and a PDPA user consent & local cache cleaning compliance strategy. |
| **2026-07-17** | [React Native Gesture Handler v3 Evolution Analysis & Gurudevi Mobile Migration Plan](./current_progress/2026-07-17-rngh-v3-comprehensive-migration-plan.md) | Current Progress | `active` | Evolution analysis of RNGH v2.x and v3.0 releases with a step-by-step hooks API migration plan for the mobile project. |
| **2026-07-17** | [Gluestack UI Evolution Analysis & Gurudevi Mobile Migration Plan](./current_progress/2026-07-17-gluestack-comprehensive-migration-plan.md) | Current Progress | `active` | Comparative analysis of Gluestack v2, v3, and v5 changelogs with a concrete cleanup plan for the mobile project. |
| **2026-07-17** | [Gurudevi Quality Constellation Brainstorm & Plan](./current_progress/2026-07-17-gurudevi-quality-constellation-plan.md) | Current Progress | `active` | Brainstorm mapping the quality constellation tools, monorepo diseases, and structural boundaries. |
| **2026-07-17** | [Gurudevi Quality Constellation Adversarial Critique](./decisions/2026-07-17-gurudevi-quality-constellation-critique.md) | Decisions / Security | `active` | Detached adversarial critique exposing 7 defects in the quality constellation brainstorm. |
| **2026-07-17** | [Gurudevi Quality Constellation & TS7 Compatibility Chronicle](./decisions/2026-07-17-gurudevi-quality-constellation-chronicle.md) | Decisions | `active` | Comprehensive chronicle of the Quality Constellation brainstorm, post-hoc linting critique, TS7 compatibility resolution, and toolchain complexity analysis. |
| **2026-07-14** | [React Native Web Sustainability and Gurudevi Web Capability Plan](./current_progress/2026-07-14-react-native-web-sustainability-plan.md) | Current Progress / Architecture | `active` | Separates React Native Web rendering from Gurudevi-owned browser capabilities and defines now/future work, including Web Push. |
| **2026-07-16** | [Icon Layer Fishbone Cleanup Plan](./current_progress/2026-07-16-icon-layer-fishbone-cleanup-plan.md) | Current Progress | `active` | Fishbone analysis of Lucide imports, bridge usage, Babel rewriting, and the migration plan for shared icons. |
| **2026-07-14** | [Gluestack UI v5 and Styling Subsystem Migration Report](./infra/2026-07-14-gluestack-v5-migration-report.md) | Infrastructure | `active` | Technical report detailing Gluestack UI v5 & NativeWind v5 changes, cssInterop bypasses, and long-term actions. |
| **2026-06-26** | [Route Flow Implementation Checklist](./current_progress/2026-06-26-route-flow-implementation-checklist.md) | Current Progress | `draft` | Execution checklist for the route and onboarding cleanup. |
| **2026-06-26** | [Developer Sandbox Console & Onboarding Parser](./architecture/2026-06-26-developer-sandbox-console.md) | Architecture | `active` | Canonical hidden dev shortcut contract for onboarding name-step templates. |
| **2026-06-26** | [Test Strategy: Jest vs Vitest for Gurudevi Mobile](./current_progress/2026-06-26-test-strategy-jest-vs-vitest.md) | Current Progress | `draft` | Which test seam to use for route helpers, state machines, and Expo screen mounts. |
| **2026-06-26** | [Logout and Bootstrap Contract](./current_progress/2026-06-26-logout-bootstrap-contract.md) | Current Progress | `draft` | Canonical logout sequence and the public-entry reset behavior. |
| **2026-06-26** | [Multi-Account Contract](./current_progress/2026-06-26-multi-account-contract.md) | Current Progress | `draft` | Multi-account as a first-class capability, even before the UI surface exists. |
| **2026-06-26** | [Canonical Account State Model](./current_progress/2026-06-26-canonical-account-state-model.md) | Current Progress | `draft` | The shared state ladder for guest, auth, onboarding, ready, and multi-account. |
| **2026-06-26** | [Route Flow Fishbone Analysis](./current_progress/2026-06-26-route-flow-fishbone-analysis.md) | Current Progress | `draft` | Persistent analysis of the route, identity, onboarding, and permission spaghetti. |
| **2026-06-26** | [Route Flow Proposed Solution](./current_progress/2026-06-26-route-flow-proposed-solution.md) | Current Progress | `draft` | Proposed cleanup plan for a single canonical entry flow across web and mobile. |
| **2026-06-26** | [Welcome, Auth, Guest, and Onboarding Flow](./architecture/2026-06-26-welcome-auth-onboarding-flow.md) | Architecture | `active` | Canonical public-entry flow for welcome, guest, auth, onboarding, and app entry sequencing. |
| **2026-06-26** | [Auth and Onboarding Highway Boundaries](./architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md) | Architecture | `active` | Canonical auth bootstrap, shared route helpers, secure session storage, and onboarding state machine rules. |
| **2026-06-12** | [AI Assistant Hono Migration & Sovereign Architecture](../../sanctuary-api/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md) | Architecture | `active` | Migrated AI Assistant's orchestrator from Supabase Edge Functions to Hono with Hexagonal architecture, enclave decryption, rate-limiting, and failovers. |
| **2026-06-12** | [Hexagonal Ports & Adapters Rollout](../../../packages/core/docs/architecture/2026-06-12-hexagonal-ports-adapters-rollout.md) | Architecture | `active` | Defined ports and concrete adapters for Telemetry (PostHog), Gating/Flags (Supabase/GrowthBook), and Authorization (Cedar). |
| **2026-06-12** | [Web-Only Payments & Hexagonal Entitlements](./decisions/2026-06-12-web-only-payments-and-entitlements.md) | Decisions | `active` | Architectural decision to bypass native Google/Apple payments, processing subscriptions on the web and syncing entitlements offline. |
| **2026-06-12** | [Decoupled TanStack Table and Virtual Integration](./decisions/2026-06-12-decoupled-tanstack-table-and-virtual-integration.md) | Decisions | `active` | Architectural decision to decouple TanStack Table logic from Web & Native virtualized renderers. |
| **2026-06-12** | [React Query and TanStack Pacer Integration](./decisions/2026-06-12-react-query-pacer-integration.md) | Decisions | `active` | Architectural decision to combine React Query and TanStack Pacer to throttle PowerSync sync streams and debounce search queries. |
| **2026-06-14** | [PowerSync Web / Native Boot Boundary](./architecture/2026-06-14-powersync-web-native-boot-boundary.md) | Architecture | `active` | Documents the web-native provider split, Expo Router boot order, and browser-safe PowerSync fallback rules. |
| **2026-06-11** | [Mobile Bundle Size Optimization Execution Report](./infra/2026-06-11-mobile-bundle-optimization-report.md) | Infrastructure | `active` | Report detailing audit, leak plugging, and tree-shaking optimizations resulting in a 1.28 MB reduction in bundle size. |
| **2026-06-10** | [Monorepo Upgrade and Navigation Purge Execution Report](./infra/2026-06-10-monorepo-upgrade-and-cleanup-execution.md) | Infrastructure | `active` | Report detailing the execution of Expo SDK 56 alignment, safe major updates, React Navigation removal, and navigation check flag purging. |
| **2026-06-10** | [Dependency Alignment and Upgrade Testing Playbook](./infra/2026-06-10-dependency-alignment-and-upgrade-testing.md) | Infrastructure | `active` | Testing playbook for peer dependency compatibility checks, automatic alignment checks, and rollback spike workflows. |
| **2026-06-10** | [Expo Router Migration and Major Dependencies Audit](./infra/2026-06-10-migration-and-major-dependency-audit.md) | Audits | `active` | Deep-dive review of Expo Router transfer, Expo version mismatch, major updates list, and gesture handler risks. |
| **2026-06-10** | [Gurudevi Mobile and Shared Packages Dependency Audit](./infra/2026-06-10-dependency-audit.md) | Audits | `active` | Deep-dive audit of outdated dependencies in gurudevi-mobile and supporting shared packages using taze. |
| **2026-06-10** | [Offline Security & Resilience Blueprint](./architecture/offline-security-and-resilience.md) | Security | `active` | Threat model, SubtleCrypto dynamic key verification, and dual-PDP fail-safe boundaries. |
| **2026-06-10** | [Offline Gating and Authorization](./decisions/2026-06-10-offline-authorization-and-gating.md) | Security / Sync | `active` | Layered Cedar WASM and signed permission snapshots for native write safety. |
| **2026-06-10** | [POA Client-Side Proxy Unentanglement](./decisions/2026-06-10-poa-proxy-unentanglement.md) | Security / Arch | `active` | Removing redundant client-side POA proxy in favor of database and Hono PEP middleware. |
| **2026-06-09** | [Oxlint and ESLint Hybrid Integration Guide](./infra/oxlint-and-eslint-hybrid-guide.md) | Infrastructure | `active` | Pipeline setup for Oxlint + ESLint hybrid strategy and Biome format-only configurations. |
| **2026-06-09** | [React Compiler and ESLint Guidance](./infra/react-compiler-and-eslint-guide.md) | Infrastructure | `active` | Aligning ESLint 9 configuration and React Compiler for React 19.2/RN 0.85 stack. |
| **2026-06-09** | [Gurudevi UI Development Guide](./Core/ui-development-guide.md) | UI / Layout | `active` | Zero-legacy screen architecture, hook contracts, caching levels, and quality checklists. |
| **2026-06-09** | [Agent Offline Strategy Briefing](./agent/agent-briefing-offline-strategy-framework.md) | Agent / Sync | `active` | Feature-level decision trees and guided implementation checklists for offline-first. |
| **2026-06-09** | [Sanctuary API and Backend Spec](./Core/sanctuary-api-and-backend-spec.md) | Backend | `active` | Hono routing, ZenStack Zod v4 validation, and MCP integration. |
| **2026-06-09** | [Web-Native Compatibility Guide](./Core/web-native-compatibility-guide.md) | Compatibility | `active` | Metro resolutions, native package shims, and responsive layout shells. |
| **2026-06-09** | [Offline-Online Synchronization Spec](./Core/offline-online-sync-spec.md) | Sync | `active` | PowerSync queue flow, idempotency keys, LWW conflict resolution, and soft deletes. |
| **2026-05-31** | [Navigation Architecture](./architecture/navigation-architecture.md) | Navigation | `active` | Mobile route structuring and transition specifications. |
| **2026-05-31** | [Sovereign Agent Skills](./architecture/2026-05-31-sovereign-agent-skills.md) | Agent / AI | `active` | Skills framework and tool integrations. |
| **2026-05-27** | [Pre-Migration Progress Tracker](./current_progress/2026-05-27-pre-migration-progress-tracker.md) | Progress | `active` | Tracking milestones before the major monorepo migration. |
| **2026-05-27** | [Pre-Migration Operationalization Plan](./current_progress/2026-05-27-pre-migration-operationalization-plan.md) | Progress | `active` | Step-by-step rollout plan for database and runtime updates. |
| **2026-05-27** | [Pre-Migration Caveats & Memory](./current_progress/2026-05-27-pre-migration-caveats-memory.md) | Progress | `active` | Important quirks, learnings, and gotchas identified. |
| **2026-05-27** | [Responsive Shell & Layout Spec](./architecture/gurudevi-responsive-shell-layout-spec.md) | UI / Layout | `active` | Tablet/Web responsive shell behaviors and grids. |
| **2026-05-27** | [Ground Truth Audit 2](./architecture/2026-05-27-ground-truth-audit-2.md) | Audits | `active` | Deep-dive verification of configuration and schemas. |
| **2026-05-27** | [Expo Router Audit 2](./architecture/2026-05-27-expo-router-audit-2.md) | Audits | `active` | Routing patterns and dynamic parameters stability. |
| **2026-05-25** | [CJS to ESM Native Guide](./architecture/cjs-to-esm-native-guide.md) | Standards | `active` | Transition path from CommonJS modules to Native ES Modules. |
| **2026-05-20** | [Offline IAM & Write Safety Audit](./architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md) | Security | `active` | Data write integrity and role authorization safety. |
| **2026-05-18** | [Offline Authorization Architecture](./architecture/2026-05-18-gurudevi-offline-authorization-architecture.md) | Security | `active` | Locally cached RBAC rules execution pattern. |
| **2026-05-06** | [Sovereign ReBAC Developer Guide](./architecture/2026-05-06-sovereign-rebac-developer-guide.md) | Security | `active` | Relationship-Based Access Control integration instructions. |

---

## 📁 Document Categories

### 📋 Product Specification & Vision Vault (Product Manager)
*   [SOP (Documentation Rules)](./docs-sop.md) - Format, frontmatter, and naming conventions.
*   [Educational Ecology and Philosophy](./Core/educational-ecology-philosophy.md) - Concentric circles, holons, polycentric governance theory.
*   [Domain Context and User Roles](./Core/domain-and-users.md) - User perspectives, active bonds, and role mappings.
*   [Product Footprint: Web vs Mobile](./Core/product-footprint-web-vs-mobile.md) - Feature allocations across native mobile, platform web, and marketing site.
*   [Complete PRD](./Core/GURUDEVI_COMPLETE_PRD.md) - Living product requirements specification.
*   [Gurudevi Foundation V4](./Core/gurudevi_foundation_v4.md) - Core values and foundation specifications.

### 📐 Technical Architecture & Specifications Vault (Solution Architect)
*   [Technical Stack](./Core/tech-stack.md) - Expo 56, RN 0.85, Hono, Supabase, and local storage.
*   [Workspace and Navigation Philosophy](./Core/workspace-navigation-philosophy.md) - Five ecological circles, workspace dynamics, and Expo Router.
*   [Technical Architecture and Constraints](./Core/technical-architecture-constraints.md) - Multi-tenant RLS, offline-first sync (PowerSync), device boundaries.
*   [Identity and Access Management (IAM)](./Core/identity-and-access-management.md) - Cedar-style ReBAC, active bonds, offline attributes, and device trust.
*   [Auth and Onboarding Highway Boundaries](./architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md) - Canonical auth bootstrap helpers, route gating, secure session storage, and onboarding state rules.
*   [Security and Data Integrity](./Core/security-and-data-integrity.md) - PostgreSQL RLS, explicit sovereignty grants (ADR-002), Ed25519-signed authorization artifacts.
*   [Offline-Online Synchronization Spec](./Core/offline-online-sync-spec.md) - PowerSync queue execution, idempotency verification, Last-Write-Wins, and soft deletes.
*   [Web-Native Compatibility Guide](./Core/web-native-compatibility-guide.md) - Platform resolutions, native package web shims, and layout responsive shells.
*   [Sanctuary API and Backend Spec](./Core/sanctuary-api-and-backend-spec.md) - Dynamic Hono route schemas, ZenStack Zod v4 validation, and MCP hosts.
*   [Project Map](./Core/project-map.md) - Scope and module mapping of the project.
*   [Navigation Architecture](./architecture/navigation-architecture.md) - App screens and routing map.
*   [UI Color Doctrine](./architecture/ui-color-doctrine.md) - The design system palette and theme standards.
*   [Local Development Playbook](./infra/local-development-playbook.md) - Getting started locally.
*   [Testing Strategy](./infra/testing-strategy.md) - Unit, integration, and UI test setups.
*   [UI Development Guide](./Core/ui-development-guide.md) - Zero-legacy screen architecture, hook contracts, caching levels, and quality checklists.
*   [Gurudevi Tools & Tricks](./Core/gurudevi_tools_tricks_v2.md) - Tips for development efficiency.

### 📐 System Architecture Specs
*   [Responsive Shell & Layout Spec](./architecture/gurudevi-responsive-shell-layout-spec.md) - Shell behavior standard.
*   [Inngest V4 Core Shell](./architecture/INNGEST_V4_CORE_SHELL.md) - Background events engine.
*   [Durable Agents R&D Guide](./architecture/DURABLE_AGENTS_RND_GUIDE.md) - Agent systems framework.
*   [FlashList Patterns](./Core/flash-list-patterns.md) - Infinite scrolling optimization patterns.
*   [Bootstrap and Entrypoint Standard](./architecture/bootstrap-and-entrypoint-standard.md) - Startup sequence flow.
*   [Protocol-Oriented Authority (POA) SSOT](./architecture/poa-authority-ssot.md) - Core authorization specifications.

### 🏛️ Architecture Decision Records (ADRs)
*   [Gurudevi Quality Constellation Adversarial Critique](./decisions/2026-07-17-gurudevi-quality-constellation-critique.md) - Detached critique of the quality constellation brainstorm containing 7 identified defects.
*   [Gurudevi Quality Constellation & TS7 Compatibility Chronicle](./decisions/2026-07-17-gurudevi-quality-constellation-chronicle.md) - Chronicle of the entire Quality Constellation brainstorm, TS7 resolution, and adversarial critique of the quality gate.
*   [Icon Bridge Contract](./decisions/2026-07-16-icon-bridge-contract.md) - Canonical icon import contract that keeps Lucide implementation details behind `@repo/ui/icons`.
*   [Web-Only Payments & Hexagonal Entitlements](./decisions/2026-06-12-web-only-payments-and-entitlements.md) - Bypassing native IAP store fees via secure web checkout systems and power-syncing subscription entitlements.
*   [Decoupled TanStack Table and Virtual Integration](./decisions/2026-06-12-decoupled-tanstack-table-and-virtual-integration.md) - Decoupling table data models and logic from platform viewports and virtualization renderers.
*   [React Query and TanStack Pacer Integration](./decisions/2026-06-12-react-query-pacer-integration.md) - Combining React Query and TanStack Pacer to throttle database synchronization invalidation loops and manage task timing.
*   [Offline Gating and Authorization](./decisions/2026-06-10-offline-authorization-and-gating.md) - Layered Cedar WASM evaluation and signed snapshot fallback for local Drizzle write security.
*   [POA Client-Side Proxy Unentanglement](./decisions/2026-06-10-poa-proxy-unentanglement.md) - Removing redundant client-side POA proxy in favor of database and Hono PEP middleware.

### 📦 Platform, Infrastructure & Deployment Guides (Vercel, Cloudflare, Expo, PNPM, ESLint)
*   [Expo, EAS, and GitHub Build Verification Guide](./infra/expo-eas-build-verification-guide.md) - Low-bandwidth and full validation path for Expo configuration, Metro bundles, native Android builds, EAS, and GitHub runners.
*   [Gluestack UI v5 and Styling Subsystem Migration Report](./infra/2026-07-14-gluestack-v5-migration-report.md) - Report on the structural changes, immediate workarounds, and long-term migration vectors for Gluestack v5 and NativeWind v5.
*   [Mobile Bundle Size Optimization Execution Report](./infra/2026-06-11-mobile-bundle-optimization-report.md) - Report detailing audit, leak plugging, and tree-shaking optimizations resulting in a 1.28 MB reduction in bundle size.
*   [Monorepo Upgrade and Navigation Purge Execution Report](./infra/2026-06-10-monorepo-upgrade-and-cleanup-execution.md) - Report on Expo SDK 56 alignment, major version upgrades, and navigation cleanups.
*   [Dependency Alignment and Upgrade Testing Playbook](./infra/2026-06-10-dependency-alignment-and-upgrade-testing.md) - Diagnostic tools and step-by-step procedures for testing major version updates.
*   [Oxlint and ESLint Hybrid Integration Guide](./infra/oxlint-and-eslint-hybrid-guide.md) - Pipeline setup for Oxlint + ESLint hybrid strategy and Biome format-only configurations.
*   [React Compiler and ESLint Guidance](./infra/react-compiler-and-eslint-guide.md) - Configuration rules and auto-memoization checks.
*   [pnpm Guide](./infra/pnpm-guide.md) - Dependency management rules.
*   [Expo Development Paths](./infra/expo-development-paths.md) - Simulator and physical device flows.
*   [Expo SDK Deprecation Guide](./infra/expo-sdk-deprecation-guide.md) - Upgrading package APIs.
*   [Vercel Deployment](./infra/vercel-deployment.md) - Vercel hosting specs.
*   [Vercel Limits and Cloudflare R2](./infra/vercel-limits-and-r2.md) - Storage options.
*   [Cloudflare Deployment](./infra/cloudflare-deployment.md) - Cloudflare hosting rules.
*   [Gurudevi Web Ecosystem Revamp Plan](./current_progress/2026-08-08-gurudevi-web-ecosystem-revamp-plan.md) - Marketing, publishing, and hosting workstream.
*   [Gurudevi Production Gaps and Phased Web Hardening Plan](./current_progress/2026-08-08-gurudevi-production-gaps-and-phased-hardening-plan.md) - Dated gap audit and phased production-readiness workstream.
*   [Gurudevi Web Hosting Topology](./decisions/2026-08-08-gurudevi-web-hosting-topology.md) - Root, subdomain, and `/app` deployment decision study.
*   [Hosting Guide](./infra/hosting-guide.md) - General topology specs.

### 🛡️ Security, ReBAC & Audits
*   [Expo Router Migration and Major Dependencies Audit](./infra/2026-06-10-migration-and-major-dependency-audit.md) - Deep-dive review of Expo Router transfer status, Expo mismatches, major updates list, and gesture handler risks.
*   [Gurudevi Mobile and Shared Packages Dependency Audit](./infra/2026-06-10-dependency-audit.md) - Deep-dive audit of outdated dependencies in gurudevi-mobile and shared libraries using taze.
*   [Offline Security & Resilience Blueprint](./architecture/offline-security-and-resilience.md) - Security controls, keys configuration, and system threat mitigation model.
*   [Auth and Onboarding Highway Boundaries](./architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md) - Same canonical auth/onboarding contract, listed here for security review and bootstrap visibility.
*   [Offline Authorization Architecture](./architecture/2026-05-18-gurudevi-offline-authorization-architecture.md) - Offline RBAC rule caches.
*   [Sovereign ReBAC Developer Guide](./architecture/2026-05-06-sovereign-rebac-developer-guide.md) - Relationship-Based Access Control logic.
*   [Offline IAM & Write Safety Audit](./architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md) - Data write validation report.
*   [Actor x Resource matrix Permission Audit](./architecture/2026-05-16-gurudevi-actor-resource-permission-matrix-audit.md) - Permission structures.
*   [Ground Truth Audit 2](./architecture/2026-05-27-ground-truth-audit-2.md) - General workspace audit.

### 🤖 Sovereign Agent Frameworks & Prompt Lenses (AI Assistant)
*   [Agent Prompt Lens](./agent/AGENT_PROMPT_LENS.md) - Definitive rules for AI coding agents regarding UI patterns, code plans, and constraints.
*   [Agent Briefing: Offline Strategy Framework](./agent/agent-briefing-offline-strategy-framework.md) - Discovery questions and checklists for offline-first feature implementation.
*   [Master Protocol](./agent/MASTER_PROTOCOL.md) - Core behavioral rules and collaboration guidelines for AI assistants.
*   [Agent Resonance](./agent/AGENT_RESONANCE.md) - Three-dimensional checks for code resonance (vertical, horizontal, diagonal).

### 📅 Current Progress & Plans
*   [React Native Gesture Handler v3 Evolution Analysis & Gurudevi Mobile Migration Plan](./current_progress/2026-07-17-rngh-v3-comprehensive-migration-plan.md) - Evolution analysis of RNGH v2.x and v3.0 releases with a step-by-step hooks API migration plan for the mobile project.
*   [Gluestack UI Evolution Analysis & Gurudevi Mobile Migration Plan](./current_progress/2026-07-17-gluestack-comprehensive-migration-plan.md) - Comparative analysis of Gluestack v2, v3, and v5 changelogs with a concrete cleanup plan for the mobile project.
*   [Gurudevi Quality Constellation Brainstorm & Plan](./current_progress/2026-07-17-gurudevi-quality-constellation-plan.md) - The active roadmap for integrating duplication checks, boundary enforcement, and layout decomposition.
*   [Pre-Migration Progress Tracker](./current_progress/2026-05-27-pre-migration-progress-tracker.md) - Plan status tracker.
*   [Pre-Migration Operationalization Plan](./current_progress/2026-05-27-pre-migration-operationalization-plan.md) - Operational rollout stages.
*   [Classroom Teacher Implementation Plan](./current_progress/2026-05-22-classroom-teacher-implementation-plan.md) - Teacher UI feature milestones.
