---
title: "Documentation Index"
status: "active"
created: 2026-06-26
updated: 2026-10-04
author: "Naveen"
scribe: "Antigravity"
tags: [docs, index, changelog]
---

# Documentation Index

This index lists all design specifications, plans, guides, decisions, and workflow checklists for the Polymath Platform, organized by functional area according to the workspace documentation SOP.

> **Local-only:** Rust research notes, FFI runbooks (chronicle, inline-module SOP,
> git guidelines), and the `spike-rust-inline` experiment live in the gitignored
> `rust-lab/` folder at the repo root. They are intentionally untracked.

## Directory Structure

- **`Core/`** — Core product logic, guides, execution playbooks
- **`architecture/`** — System topologies, database models, permission structures, security reviews
- **`current_progress/`** — Active plans, migration paths, linting setups, implementation checklists
- **`decisions/`** — ADRs (Architecture Decision Records)
- **`infra/`** — Git workflows, CI/CD, build tools, local runlog histories
- **`files/fundamental/`** — General/fundamental architecture, design philosophy, UX, and transport patterns
- **`files/specialized/`** — Specialized domain-specific audits and app/tab implementations

---

## 📘 Core Docs & Guides

These files document core logic, user journeys, developer playbooks, and execution guides.

| Document | Description |
|---|---|
| [architecture/2026-09-15-workspace-classroom-domain-authority.md](architecture/2026-09-15-workspace-classroom-domain-authority.md) | Canonical Workspace/Classroom perspective inventory, scope/task semantics, shared plumbing, canvas persistence, Explore rules, and migration sequence |
| [current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md](current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md) | Canonical Self feature ledger with source/evidence denominators, platform status, and migration actions |
| [current_progress/2026-09-15-gurudevi-library-domain-authority.md](current_progress/2026-09-15-gurudevi-library-domain-authority.md) | Canonical Library capability ledger with source/evidence denominators and browser/native delivery status |
| [Core/developer-playbook.md](Core/developer-playbook.md) | Master strategy: project hygiene, quality gates, and code standards |
| [Core/onboarding.md](Core/onboarding.md) | Onboarding API contracts, route onboarding definitions, and testing |
| [Core/local-first-architecture-principles.md](Core/local-first-architecture-principles.md) | Event-sourcing as source of truth, Cynefin classification, boundary-condition design |
| [Core/gurudevi-sanctuary-your-guide.md](Core/gurudevi-sanctuary-your-guide.md) | Developer onboarding guide and setup checklist for Gurudevi Sanctuary |
| [Core/editorial-publishing-vision.md](Core/editorial-publishing-vision.md) | Vision and principles for the EdLove and GuruDevi publications |
| [Core/editorial-publishing-future-directions.md](Core/editorial-publishing-future-directions.md) | Future direction for distribution, translation, curation, and contributors |
| [current_progress/old_docs/gurudevi-registry-agent-execution-guide.md](current_progress/old_docs/gurudevi-registry-agent-execution-guide.md) | Archived — registry refactor execution guide (superseded) |
| [current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md](current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md) | Archived — sanctuary permission refactor execution guide (superseded) |
| [current_progress/2026-08-30-sanctuary-api-implementation-handoff.md](current_progress/2026-08-30-sanctuary-api-implementation-handoff.md) | Current Sanctuary API implementation status, release blockers, and next-agent handoff |

---

## 🏛️ Architecture & Security Docs

These files outline security models, data lifecycle policies, platform topologies, and architecture reviews.

| Document | Description |
|---|---|
| [architecture/safe-exploration-and-reversible-work-model.md](architecture/safe-exploration-and-reversible-work-model.md) | Canonical platform and safety plan: web Explore, mobile Guest, account Safe Try, independent rollout and presentation controls, and selected-record Keep |
| [architecture/dependency-intelligence-graph.md](architecture/dependency-intelligence-graph.md) | Living specification for the Supabase-backed mobile dependency release-history, compatibility, evidence, query, and operational system. |
| [architecture/2026-09-20-mutation-pipeline-optimizations-and-low-end-efficiency.md](architecture/2026-09-20-mutation-pipeline-optimizations-and-low-end-efficiency.md) | Mutation pipeline optimizations, TanStack DX architecture, zero-thrash state transitions, and low-end device efficiency strategies |
| [architecture/architecture-guidelines.md](architecture/architecture-guidelines.md) | Layered topology, golden rules of dependencies, workspace boundaries |
| [architecture/architecture-deep-dive.md](architecture/architecture-deep-dive.md) | Philosophy of restraint, sovereignty rules |
| [architecture/tech-stack-and-standards.md](architecture/tech-stack-and-standards.md) | Tech stack details, CORS configurations, environment conventions |
| [architecture/zenstack-schema-architecture.md](architecture/zenstack-schema-architecture.md) | ZenStack v3 patterns, schema/database split, runtime Zod validation |
| [architecture/zod-4-5-capabilities.md](architecture/zod-4-5-capabilities.md) | Zod 4.5 capabilities, AOT schema compilation (`z.compile()`), `@zod/mini`, and ZenStack integration |
| [architecture/vite-vitest-capabilities-matrix.md](architecture/vite-vitest-capabilities-matrix.md) | Vite 7/8 (Rolldown, Environment API) & Vitest 4/5 (benchmarks, vi.when, AST cache) capabilities matrix & integration blueprints |
| [architecture/ui-runtime-testing-standard.md](architecture/ui-runtime-testing-standard.md) | Canonical UI evidence hierarchy: contracts, boundary harnesses, real runtime, browser/Metro runtime, recovery scenarios, and device smoke |
| [architecture/gurudevi-data-state-lifecycle.md](architecture/gurudevi-data-state-lifecycle.md) | State management lifecycle, offline-first syncing, caching flow |
| [architecture/gurudevi-registry-architecture.md](architecture/gurudevi-registry-architecture.md) | Technical architecture of the Gurudevi package registry |
| [architecture/gurudevi-repository-registry-boundary.md](architecture/gurudevi-repository-registry-boundary.md) | Canonical distinction between implementation repositories and capability registries |
| [current_progress/2026-08-31-gurudevi-registry-implementation-audit.md](current_progress/2026-08-31-gurudevi-registry-implementation-audit.md) | Entry-by-entry registry implementation, rendering, routing, and evidence audit |
| [architecture/gurudevi-sanctuary-permission-architecture.md](architecture/gurudevi-sanctuary-permission-architecture.md) | Security blueprint, access control rules, policy enforcement points (superseded — see identity-app-device-lifecycle) |
| [architecture/2026-06-19-sanctuary-authorization-final-architecture.md](architecture/2026-06-19-sanctuary-authorization-final-architecture.md) | Final architecture spec for the Sanctuary authorization framework |
| [architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md](architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md) | Mechanics guide for PowerSync local sync state engine |
| [architecture/2026-06-22-gurudevi-architecture-draft-1.md](architecture/2026-06-22-gurudevi-architecture-draft-1.md) | Preliminary draft 1 for the Gurudevi mobile application structure |
| [architecture/2026-07-23-architecture-analysis.md](architecture/2026-07-23-architecture-analysis.md) | Architecture audit and vulnerability analysis report |
| [architecture/2026-07-23-docs-grounded-architecture-analysis.md](architecture/2026-07-23-docs-grounded-architecture-analysis.md) | Document-grounded architecture review and gap analysis |
| [architecture/2026-07-24-cedar-benchmark-sop-architecture.md](architecture/2026-07-24-cedar-benchmark-sop-architecture.md) | Performance benchmark and SOP for Cedar-based policy evaluation |
| [architecture/2026-07-24-permission-refactor-review-report.md](architecture/2026-07-24-permission-refactor-review-report.md) | Post-refactor review report for permission systems |
| [architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md](architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md) | Evidence-backed comparison of the imported exploration corpus against current code, schema, migrations, and UI |
| [Core/data-state-ownership-map.md](Core/data-state-ownership-map.md) | Per-domain source-of-truth map across the six storage layers (Zustand, TanStack Query, MMKV, PowerSync, Supabase, Postgres) with agent read/write rules |
| [Core/agent-observability-contract.md](Core/agent-observability-contract.md) | Agent-queryable observability contract: signal-by-destination, single-line-JSON log events, correlation flow, enforcement boundaries |
| [files/README.md](files/README.md) | Preserved imported exploration evidence archive and reading boundary |
| [architecture/production-software-landscape.md](architecture/production-software-landscape.md) | Full-stack mental map of production web + mobile software — for non-coders |
| [architecture/2026-08-29-sanctuary-api-future-readiness-audit.md](architecture/2026-08-29-sanctuary-api-future-readiness-audit.md) | Comparative implementation, contract, documentation, and future-readiness audit for Sanctuary API |
| [architecture/2026-08-29-sanctuary-api-adversarial-security-audit.md](architecture/2026-08-29-sanctuary-api-adversarial-security-audit.md) | Stop-ship authorization, payment, contract, AI, and verification audit of Sanctuary API |
| [architecture/negentropy-reward-economy-and-ad-center-vision.md](architecture/negentropy-reward-economy-and-ad-center-vision.md) | Vision, philosophy, tokenomics, and strategy nuances for the Negentropy Reward Economy & Ad Center |
| [architecture/editorial-platform-architecture.md](architecture/editorial-platform-architecture.md) | Technical model, metadata, events, and migration path for editorial publishing |

---

## ⚖️ Architecture Decision Records (ADRs)

Records documenting the rationale behind core design and architecture choices.

| Document | Description |
|---|---|
| [decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md](decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md) | Docs authority hierarchy, feature rollout limits vs authorization |
| [decisions/2026-06-26-route-onboarding-through-api.md](decisions/2026-06-26-route-onboarding-through-api.md) | ADR outlining why onboarding routes through the Sanctuary API |
| [decisions/2026-07-28-gurudevi-authz-decision-record.md](decisions/2026-07-28-gurudevi-authz-decision-record.md) | ADR for mobile client authorization rules and PDP configuration |
| [decisions/2026-08-09-doppler-secrets-management-adoption.md](decisions/2026-08-09-doppler-secrets-management-adoption.md) | ADR for adopting Doppler as centralized secrets management across dev/staging/prod/next environments |
| [decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md](decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md) | ADR for the Expo orchestrator agent toolchain: typed agent API surface, MCP + Doppler routing, visual editing (OSS primary / custom fallback), Inngest + Eve orchestration layering |
| [decisions/2026-08-24-openness-and-reuse-strategy.md](decisions/2026-08-24-openness-and-reuse-strategy.md) | ADR — extracted-project openness (rn-terrain/trube-art); superseded for monorepo by 2026-08-25 |
| [decisions/2026-08-24-license-tradeoffs.md](decisions/2026-08-24-license-tradeoffs.md) | ADR — MIT vs Apache/MPL/GPL/CC-BY tradeoffs (monorepo MIT, rn-terrain MIT+CC-BY) |
| [decisions/2026-08-25-transparent-hosted-oss.md](decisions/2026-08-25-transparent-hosted-oss.md) | **ADR — Transparent Hosted OSS** (supersedes 2026-08-24 for monorepo): MIT public, hosted production, dev-only self-host seams |
| [decisions/2026-08-31-rewarded-ad-center-policy-and-compliance.md](decisions/2026-08-31-rewarded-ad-center-policy-and-compliance.md) | ADR — Rewarded Ad Center compliance, app store policies, COPPA gating, ATT consent, and SSV cryptographic security governance |
| [decisions/2026-08-31-editorial-platform-topology.md](decisions/2026-08-31-editorial-platform-topology.md) | ADR for shared editorial infrastructure and separate EdLove/GuruDevi publications |
| [decisions/2026-09-10-guest-local-first-lease.md](decisions/2026-09-10-guest-local-first-lease.md) | Mobile-only Guest local-first lease, cloud-write boundary, and account claim/migration checkpoint |
| [decisions/2026-09-10-entry-route-authority.md](decisions/2026-09-10-entry-route-authority.md) | Mobile route authority; names the visitor path Continue as Guest and keeps anonymous identity local-only |
| [decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md](decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md) | Functional migration source, Sanctuary information architecture, and navigation-variant evaluation |
| [decisions/2026-09-14-gurudevi-sanctuary-spatial-language-and-domain-transitions.md](decisions/2026-09-14-gurudevi-sanctuary-spatial-language-and-domain-transitions.md) | Domain canvas atmospheres, spatial language, light, and browser transition contract |
| [decisions/2026-09-14-sanctuary-explore-access-and-persistence.md](decisions/2026-09-14-sanctuary-explore-access-and-persistence.md) | Public web Explore boundary; clarifies mobile-only Guest and excludes web Guest continuity |
| [decisions/2026-09-14-gurudevi-browser-unified-canvas-foundation.md](decisions/2026-09-14-gurudevi-browser-unified-canvas-foundation.md) | DRY browser CanvasFrame foundation and real-product-first implementation order |
| [decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md](decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md) | Canonical shared canvas model, domain-owned floor authority, and rejection of one generic renderer |
| [decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md](decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md) | Cross-platform authority for domain-local task workbenches, restoration, and temporal context |
| [decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md](decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md) | Mandatory shared platform contracts and readiness gates before broad domain migration |
| [decisions/2026-09-15-gurudevi-migration-execution-discipline.md](decisions/2026-09-15-gurudevi-migration-execution-discipline.md) | Evidence coverage, change control, authority, and delegation rules for the migration |
| [decisions/2026-09-15-community-domain-functional-authority.md](decisions/2026-09-15-community-domain-functional-authority.md) | Canonical Community capability ledger with source/evidence denominators and migration status |
| [decisions/2026-09-15-gurudevi-account-destinations-functional-authority.md](decisions/2026-09-15-gurudevi-account-destinations-functional-authority.md) | Canonical Profile, Notifications, Settings, and account-lifecycle capability ledger |

---

## 🚀 Active Plans & Current Progress

Checklists, active feature roadmaps, migration paths, and lint configuration plans.

| Document | Description |
|---|---|
| [current_progress/2026-09-26-dependency-intelligence-graph-implementation-plan.md](current_progress/2026-09-26-dependency-intelligence-graph-implementation-plan.md) | Active phased implementation plan for persistent dependency intelligence, continuous evidence intake, and upgrade-gate integration. |
| [current_progress/2026-06-20-feature-rollout-implementation-plan.md](current_progress/2026-06-20-feature-rollout-implementation-plan.md) | Feature rollout implementation steps and release milestones |
| [current_progress/2026-06-09-oxlint-eslint-hybrid-checklist.md](current_progress/2026-06-09-oxlint-eslint-hybrid-checklist.md) | Hybrid lint setup status and tool migration checklist |
| [current_progress/2026-06-26-onboarding-api-routing.md](current_progress/2026-06-26-onboarding-api-routing.md) | Routing progress, schema updates, task checklists, and blockers |
| [current_progress/2026-06-22-gurudevi-powersync-web-plan.md](current_progress/2026-06-22-gurudevi-powersync-web-plan.md) | Integration roadmap for running PowerSync in web environments |
| [current_progress/2026-07-14-gurudevi-native-deps-migration.md](current_progress/2026-07-14-gurudevi-native-deps-migration.md) | Roadmap for migrating and consolidating native dependencies |
| [current_progress/2026-07-23-permission-feature-cleanup-plan.md](current_progress/2026-07-23-permission-feature-cleanup-plan.md) | Plan for removing dead authorization paths and permission codes |
| [current_progress/2026-07-28-expo-file-system-migration-plan.md](current_progress/2026-07-28-expo-file-system-migration-plan.md) | Migration checklist for updating expo-file-system legacy APIs |
| [current_progress/2026-07-28-gurudevi-local-pdp-implementation-plan.md](current_progress/2026-07-28-gurudevi-local-pdp-implementation-plan.md) | Staged implementation plan for local policy evaluation engines |
| [current_progress/2026-08-09-doppler-implementation-plan.md](current_progress/2026-08-09-doppler-implementation-plan.md) | 6-phase implementation plan for Doppler secrets management integration across dev/staging/prod/next environments |
| [current_progress/2026-08-10-gurudevi-edlove-exploration-integration-plan.md](current_progress/2026-08-10-gurudevi-edlove-exploration-integration-plan.md) | Gurudevi-first phased program for integrating the imported exploration corpus into the Edlove platform |
| [current_progress/2026-08-10-live-supabase-inspection.md](current_progress/2026-08-10-live-supabase-inspection.md) | Read-only linked Supabase structural, RLS, grants, and advisor inspection |
| [current_progress/2026-09-07-ui-primitives-production-hardening-plan.md](current_progress/2026-09-07-ui-primitives-production-hardening-plan.md) | Phased production hardening of owned UI primitives, accessibility contracts, `cn` composition, and Vitest 5 verification |
| [current_progress/2026-09-14-gurudevi-web-migration-restart-handoff.md](current_progress/2026-09-14-gurudevi-web-migration-restart-handoff.md) | Active restart handoff, hybrid shell-and-slice plan, and multi-agent operating model for the Gurudevi Next.js migration |
| [current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md](current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md) | Active browser Sanctuary implementation sequence for account and web Explore adapters; excludes web Guest and links to Safe Try plan |
| [current_progress/2026-09-14-gurudevi-domain-canvas-port-map.md](current_progress/2026-09-14-gurudevi-domain-canvas-port-map.md) | Evidence-backed map of each domain floor, configurable furniture, and browser migration order |
| [current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md](current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md) | Canonical Self feature-layer ownership, compatibility inventory, and cross-platform migration gates |
| [current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md](current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md) | 7-phase production setup plan for the Expo 57 app orchestrator: foundation contracts, agent tooling/MCP, visual editing with OSS-primary/custom-fallback, Inngest + Eve orchestration, ship pipeline, Doppler-first secrets |
| [current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md](current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md) | Active, phased implementation plan for Sanctuary API contract, error, AI-tool, composition, and operations readiness |
| [current_progress/2026-08-31-ad-center-phased-implementation-plan.md](current_progress/2026-08-31-ad-center-phased-implementation-plan.md) | 5-phase execution plan for the Negentropy Ad Center (database schema, AdMob SSV webhook, native plugins, domain hooks, and profile UI) |
| [current_progress/2026-08-31-editorial-publishing-implementation-plan.md](current_progress/2026-08-31-editorial-publishing-implementation-plan.md) | Phased implementation plan for EdLove and GuruDevi journal foundations, distribution, translations, rights, and contributors |

---

## 🛠️ Infra, Workflows & Logs

CI/CD setups, developer workflow scripts, versioning plans, and build diagnostics.

| Document | Description |
|---|---|
| [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) | General dependency migration playbook (monorepo root) |
| [infra/version-management.md](infra/version-management.md) | Version management analysis (changesets vs pnpm native) |
| [infra/developer-workflow-guide.md](infra/developer-workflow-guide.md) | Standard local coding environment runbook and tips |
| [infra/git-branching-model.md](infra/git-branching-model.md) | Branch naming structures, merge strategies, PR templates |
| [infra/code-quality-workflow.md](infra/code-quality-workflow.md) | Pre-commit/pre-push hooks setup, commitlint standards |
| [infra/code-checkers.md](infra/code-checkers.md) | Code quality scripts catalog and run flags |
| [infra/2026-07-24-physical-device-deployment-log.md](infra/2026-07-24-physical-device-deployment-log.md) | Live runlog for physical hardware builds and USB debugging |
| [infra/doppler-secrets-management-guide.md](infra/doppler-secrets-management-guide.md) | Comprehensive guide for Doppler secrets management integration across dev/staging/prod/next environments, including CLI setup, CI/CD integration, and app-specific configuration patterns. |
| [infra/production-readiness-program.md](infra/production-readiness-program.md) | Cross-platform production-readiness checklist for mobile, API, web, data, sync, security, and operations |
| [infra/oss-public-release-security-checklist.md](infra/oss-public-release-security-checklist.md) | P0 release gate and security/privacy/legal checklist for flipping the repo public and accepting external contributions, mapped to OpenSSF OSPS Baseline |
| [infra/oss-public-release-devops-checklist.md](infra/oss-public-release-devops-checklist.md) | CI/CD, installability, cross-platform portability, release engineering, and contributor-onboarding checklist for public/OSS release |
| [infra/developer-environment-and-distribution-plan.md](infra/developer-environment-and-distribution-plan.md) | Plan for making the monorepo installable and contributable on Windows, macOS, and Linux: tiered toolchain paths, WSL2 mechanics, single-source toolchain versioning, and the Phase 0–5 fix sequence |
| [current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md](current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md) | 7-phase production setup plan for the Expo 57 app orchestrator: foundation contracts, agent tooling/MCP, visual editing with OSS-primary/custom-fallback, Inngest + Eve orchestration, ship pipeline, Doppler-first secrets |
| [current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md](current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md) | Active, phased implementation plan for Sanctuary API contract, error, AI-tool, composition, and operations readiness |
| [current_progress/2026-08-31-ad-center-phased-implementation-plan.md](current_progress/2026-08-31-ad-center-phased-implementation-plan.md) | 5-phase execution plan for the Negentropy Ad Center (database schema, AdMob SSV webhook, native plugins, domain hooks, and profile UI) |
| [current_progress/2026-08-31-editorial-publishing-implementation-plan.md](current_progress/2026-08-31-editorial-publishing-implementation-plan.md) | Phased implementation plan for EdLove and GuruDevi journal foundations, distribution, translations, rights, and contributors |
| [current_progress/2026-09-20-future-hardening-roadmap.md](current_progress/2026-09-20-future-hardening-roadmap.md) | Future hardening roadmap, completed milestones (OWASP, deep links, outbox, hexagonal decoupling), and remaining verification goals |
| [current_progress/2026-09-20-offline-mutation-hardening-and-hexagonal-decoupling.md](current_progress/2026-09-20-offline-mutation-hardening-and-hexagonal-decoupling.md) | Architectural report on the completed zero-legacy Hexagonal Supabase migration, multi-tenant outbox hardening, and Effect-TS v4 facade alignment |

---

## 🛠️ Infra, Workflows & Logs

CI/CD setups, developer workflow scripts, versioning plans, and build diagnostics.

| Document | Description |
|---|---|
| [architecture/route-intent-policy.md](architecture/route-intent-policy.md) | Canonical public-link, QR, auth-callback, web/mobile handoff, recovery, refactor, and evidence policy for Expo 57 and Next.js 16 |
| [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) | General dependency migration playbook (monorepo root) |
| [infra/version-management.md](infra/version-management.md) | Version management analysis (changesets vs pnpm native) |
| [infra/developer-workflow-guide.md](infra/developer-workflow-guide.md) | Standard local coding environment runbook and tips |
| [infra/git-branching-model.md](infra/git-branching-model.md) | Branch naming structures, merge strategies, PR templates |
| [infra/code-quality-workflow.md](infra/code-quality-workflow.md) | Pre-commit/pre-push hooks setup, commitlint standards |
| [infra/code-checkers.md](infra/code-checkers.md) | Code quality scripts catalog and run flags |
| [infra/2026-07-24-physical-device-deployment-log.md](infra/2026-07-24-physical-device-deployment-log.md) | Live runlog for physical hardware builds and USB debugging |
| [infra/doppler-secrets-management-guide.md](infra/doppler-secrets-management-guide.md) | Comprehensive guide for Doppler secrets management integration across dev/staging/prod/next environments, including CLI setup, CI/CD integration, and app-specific configuration patterns. |
| [infra/production-readiness-program.md](infra/production-readiness-program.md) | Cross-platform production-readiness checklist for mobile, API, web, data, sync, security, and operations |
| [infra/release-environments-runbook.md](infra/release-environments-runbook.md) | Dev/preview/staging/production promotion, Doppler, Android, iOS posture, and rollback |
| [infra/critical-infra-vs-use-cases.md](infra/critical-infra-vs-use-cases.md) | Which capabilities must be foundational and which can be added by use case |
| [infra/doppler-day-to-day-usage-guide.md](infra/doppler-day-to-day-usage-guide.md) | Daily usage reference for Doppler CLI commands, workflows, troubleshooting, and best practices |
| [infra/android-local-and-cloud-build-guide.md](infra/android-local-and-cloud-build-guide.md) | Android local/cloud build runbook, zero-quota APK generation, and native C++ compilation explanation |
| [infra/2026-08-15-android-build-log.md](infra/2026-08-15-android-build-log.md) | Execution chronicle and diagnostics log for local and cloud Android builds |
| [infra/2026-09-05-wsl-android-build-architecture-sop.md](infra/2026-09-05-wsl-android-build-architecture-sop.md) | WSL2 Android Native Build Architecture SOP: first-principles, low-friction Windows-Linux bridge without duplicate SSD storage |
| [infra/2026-09-19-custom-domain-cloudflare-vercel-sop.md](infra/2026-09-19-custom-domain-cloudflare-vercel-sop.md) | Standard Operating Procedure (SOP) for configuring custom domains registered via third-party registrars, managed by Cloudflare DNS, and hosted on Vercel's global edge network (`intuituilabs.studio`). |
| [infra/editorial-operations-guide.md](infra/editorial-operations-guide.md) | Editorial lifecycle, rights, translation, social, and correction guidance |

---

## Changelog

### 2026-10-04

- **Updated**: `architecture/safe-exploration-and-reversible-work-model.md` — compared against the existing Explore, Guest, rollout, and sandbox authorities; added independent feature-availability and Simple/Full presentation controls, foundation-first Safe Try sequencing, and v1 selected-new-record Keep rules.
- **Updated**: `architecture/safe-exploration-and-reversible-work-model.md` — confirmed web-only Explore, mobile-only Guest, account-holder Safe Try on both platforms, current stack readiness, research references, and ordered implementation phases.
- **Updated**: `current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md`, `decisions/2026-09-14-sanctuary-explore-access-and-persistence.md`, and the September 10 Guest/entry ADRs — clarified web-only Explore, mobile-only Guest, and aligned Safe Try with the canonical plan.
- **Updated**: `decisions/2026-09-10-entry-route-authority.md` — reserves Explore terminology for web and names the mobile entry “Continue as Guest.”

### 2026-09-19

- **Added**: `infra/2026-09-19-custom-domain-cloudflare-vercel-sop.md` — Complete runbook & SOP for custom domain wiring, Cloudflare DNS configuration, Vercel edge deployment, SSL/TLS certificate automation, and local dev tooling setup (`intuituilabs.studio`).

### 2026-09-15

- **Added**: `decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md` — canonical active-task, restoration, and temporal-horizon architecture for mobile and web.
- **Added**: `current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md` — Self feature contract, registry ownership, delivery evidence, and migration control matrix.
- **Added**: `decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md` and `decisions/2026-09-15-gurudevi-migration-execution-discipline.md` — platform readiness gates and migration execution discipline.

### 2026-09-14

- **Added**: `current_progress/2026-09-14-gurudevi-web-migration-restart-handoff.md` - restart checkpoint, phased hybrid migration plan, and Terra/Luna coordination rules for the canonical Gurudevi Next.js web application.
- **Added**: `decisions/2026-09-14-sanctuary-explore-access-and-persistence.md` - authoritative public Explore and persistence model, separating local exploration from guest cloud, accounts, and developer sandbox tooling.
- **Added**: `current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md` - real-product-first implementation sequence for the shell, domain floors, and later persistence adapters.
- **Added**: `current_progress/2026-09-14-gurudevi-domain-canvas-port-map.md` - source-grounded port map for Self, Workspace, Library, Community, and Profile.

### 2026-09-05

- **Added**: `infra/2026-09-05-wsl-android-build-architecture-sop.md` — First-principles architecture and SOP for robust, fast local Android builds in WSL2 with ccache and zero duplicate storage.

### 2026-08-31

- **Added**: `decisions/2026-08-31-rewarded-ad-center-policy-and-compliance.md` — ADR for Rewarded Ad Center compliance, app store policies, COPPA gating, ATT consent, and SSV cryptographic security governance.
- **Added**: `architecture/negentropy-reward-economy-and-ad-center-vision.md` — Vision, philosophy, tokenomics, and strategy nuances for the Negentropy Reward Economy & Ad Center.
- **Added**: `current_progress/2026-08-31-ad-center-phased-implementation-plan.md` — 5-phase execution plan for the Negentropy Ad Center (database schema, AdMob SSV webhook, native plugins, domain hooks, and profile UI).
- **Added**: `Core/editorial-publishing-vision.md` and `Core/editorial-publishing-future-directions.md` — Editorial vision and future direction for EdLove and GuruDevi.
- **Added**: `architecture/editorial-platform-architecture.md` — Shared editorial contract, publication model, metadata, and publishing events.
- **Added**: `infra/editorial-operations-guide.md` — Editorial lifecycle, rights, translation, social distribution, and correction guidance.
- **Added**: `decisions/2026-08-31-editorial-platform-topology.md` — ADR for shared infrastructure with separate publications.
- **Added**: `current_progress/2026-08-31-editorial-publishing-implementation-plan.md` — Phased implementation plan for implementing the editorial platform.

### 2026-08-29

- **Added**: `architecture/2026-08-29-sanctuary-api-future-readiness-audit.md` — comparative source, contract, documentation, and modern-practice audit for Sanctuary API.
- **Added**: `current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md` — staged remediation plan with verification gates and dependency policy.
- **Added**: `architecture/2026-08-29-sanctuary-api-adversarial-security-audit.md` — source-grounded stop-ship security audit of authorization, workers, payments, contracts, and AI boundaries.

### 2026-08-15

- **Added**: `infra/android-local-and-cloud-build-guide.md` — Android local & cloud build guide covering custom native C++ compilation (RNGH v3, Skia, MMKV Nitro, OP-SQLite), zero-quota EAS local builds, direct Gradle workflows, and CI timeout remediation.
- **Added**: `infra/2026-08-15-android-build-log.md` — Execution chronicle and diagnostics log capturing local Android environment verification, Gradle task evaluation, and Windows CMake/Ninja behavior.

### 2026-08-13

- **Added**: `Core/data-state-ownership-map.md` — per-domain source-of-truth map across the six storage layers with agent read/write rules.
- **Added**: `Core/agent-observability-contract.md` — agent-queryable observability contract (structured log events, correlation flow, boundaries).
- **Added**: `current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md` — 7-phase production setup plan for the Expo 57 app orchestrator (foundation contracts, agent tooling/MCP, visual editing with OSS-primary/custom-fallback, Inngest + Eve orchestration, ship pipeline, Doppler-first secrets).
- **Added**: `decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md` — ADR recording the orchestrator agent toolchain decisions (typed agent API surface, MCP + Doppler routing, visual-editor decision gate, Inngest + Eve layering).

### 2026-08-11

- **Updated**: `architecture/gurudevi-data-state-lifecycle.md` — corrected gate order to Cedar → entitlement (ADR-005).
- **Superseded**: ADR-009 gate order in `architecture/2026-06-22-gurudevi-architecture-draft-1.md` — Cedar now evaluates before entitlement.
- **Archived**: `gurudevi-registry-agent-execution-guide.md` and `gurudevi-sanctuary-agent-execution-guide.md` moved to `current_progress/old_docs/` with superseded frontmatter (refactor complete).
- **Updated**: `Core/gurudevi-sanctuary-your-guide.md` — gate order, honest state (refactor shipped), doc-set paths, frontmatter.
- **Added**: `Core/local-first-architecture-principles.md` — extracted engineering content from personal exploration docs (event-sourcing, Cynefin, boundary conditions).
- **Fixed**: Broken absolute-path links in `Core/developer-playbook.md` and `current_progress/2026-06-20-feature-rollout-implementation-plan.md`; WANDERER → THIRD_CLASS in `Core/onboarding.md`.

### 2026-08-09

- **Added**: `docs/docs-sop.md` — Root-level documentation SOP for the monorepo following the same standards as app-specific SOPs.
- **Added**: `infra/doppler-secrets-management-guide.md` — Comprehensive guide for Doppler secrets management integration across dev/staging/prod/next environments, including CLI setup, CI/CD integration, and app-specific configuration patterns.
- **Added**: `decisions/2026-08-09-doppler-secrets-management-adoption.md` — ADR for adopting Doppler as centralized secrets management with detailed alternatives analysis and implementation consequences.
- **Added**: `current_progress/2026-08-09-doppler-implementation-plan.md` — Comprehensive 6-phase implementation plan with detailed tasks, timelines, and success metrics for Doppler integration.
- **Added**: Doppler CLI configuration files (`doppler.yaml`) across the monorepo root and all major apps/packages for automated project/config setup.

### 2026-07-28

- **Reorganized**: Moved 20+ loose markdown files from the `docs/` root directory into structured subdirectories (`Core/`, `architecture/`, `decisions/`, `current_progress/`, `infra/`) following the repository naming and lifecycle conventions in `docs-sop.md`.
- **Added**: `infra/rust-git-guidelines.md` — Rust & Git integration guide and SOP for beginners.
- **Added**: `architecture/production-software-landscape.md` — Full-stack mental map of production web + mobile software for non-coders.

### 2026-07-18

- **Added**: `MIGRATION-GUIDE.md` — General dependency migration process grounded in archaeology findings.
- **Added**: `infra/version-management.md` — Version management tooling analysis: migrate from `@changesets/cli` to pnpm native versioning (v11.13.0).

### 2026-06-26

- **Added**: `Core/onboarding.md` — Onboarding API contracts, handlers, client, and test documentation.
- **Added**: `decisions/2026-06-26-route-onboarding-through-api.md` — ADR for routing onboarding through Sanctuary API.
- **Added**: `current_progress/2026-06-26-onboarding-api-routing.md` — Current progress tracker for onboarding API routing work.
- **Added**: `INDEX.md` — Central documentation index with directory structure and changelog.
- **Created**: `architecture/tech-stack-and-standards.md` — Tech stack configuration reference (CORS, etc.).
- **Added**: `architecture/zenstack-schema-architecture.md` — ZenStack v3 patterns, schema/database split, runtime Zod factory, agent skills.
- **Installed**: 9 ZenStack agent skills from `zenstackhq/skills` via `npx skills add` — schema-modeling, access-control, querying, crud-server, db-migration, project-setup, migrate-from-prisma, migrate-from-v2, plugin-dev.
- **Synced**: Workspace skills via `scripts/sync-skills.mjs` — propagated to Antigravity, Codex, and copilot-instructions.md.
