---
title: "Documentation Index"
status: "active"
created: 2026-06-26
updated: 2026-08-11
author: "Naveen"
scribe: "Antigravity"
tags: [docs, index, changelog]
---

# Documentation Index

This index lists all design specifications, plans, guides, decisions, and workflow checklists for the Polymath Platform, organized by functional area according to the workspace documentation SOP.

## Directory Structure

- **`Core/`** — Core product logic, guides, execution playbooks
- **`architecture/`** — System topologies, database models, permission structures, security reviews
- **`current_progress/`** — Active plans, migration paths, linting setups, implementation checklists
- **`decisions/`** — ADRs (Architecture Decision Records)
- **`infra/`** — Git workflows, CI/CD, build tools, local runlog histories

---

## 📘 Core Docs & Guides

These files document core logic, user journeys, developer playbooks, and execution guides.

| Document | Description |
|---|---|
| [Core/developer-playbook.md](Core/developer-playbook.md) | Master strategy: project hygiene, quality gates, and code standards |
| [Core/onboarding.md](Core/onboarding.md) | Onboarding API contracts, route onboarding definitions, and testing |
| [Core/local-first-architecture-principles.md](Core/local-first-architecture-principles.md) | Event-sourcing as source of truth, Cynefin classification, boundary-condition design |
| [Core/gurudevi-sanctuary-your-guide.md](Core/gurudevi-sanctuary-your-guide.md) | Developer onboarding guide and setup checklist for Gurudevi Sanctuary |
| [current_progress/old_docs/gurudevi-registry-agent-execution-guide.md](current_progress/old_docs/gurudevi-registry-agent-execution-guide.md) | Archived — registry refactor execution guide (superseded) |
| [current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md](current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md) | Archived — sanctuary permission refactor execution guide (superseded) |

---

## 🏛️ Architecture & Security Docs

These files outline security models, data lifecycle policies, platform topologies, and architecture reviews.

| Document | Description |
|---|---|
| [architecture/architecture-guidelines.md](architecture/architecture-guidelines.md) | Layered topology, golden rules of dependencies, workspace boundaries |
| [architecture/architecture-deep-dive.md](architecture/architecture-deep-dive.md) | Philosophy of restraint, sovereignty rules |
| [architecture/tech-stack-and-standards.md](architecture/tech-stack-and-standards.md) | Tech stack details, CORS configurations, environment conventions |
| [architecture/zenstack-schema-architecture.md](architecture/zenstack-schema-architecture.md) | ZenStack v3 patterns, schema/database split, runtime Zod validation |
| [architecture/gurudevi-data-state-lifecycle.md](architecture/gurudevi-data-state-lifecycle.md) | State management lifecycle, offline-first syncing, caching flow |
| [architecture/gurudevi-registry-architecture.md](architecture/gurudevi-registry-architecture.md) | Technical architecture of the Gurudevi package registry |
| [architecture/gurudevi-sanctuary-permission-architecture.md](architecture/gurudevi-sanctuary-permission-architecture.md) | Security blueprint, access control rules, policy enforcement points (superseded — see identity-app-device-lifecycle) |
| [architecture/2026-06-19-sanctuary-authorization-final-architecture.md](architecture/2026-06-19-sanctuary-authorization-final-architecture.md) | Final architecture spec for the Sanctuary authorization framework |
| [architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md](architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md) | Mechanics guide for PowerSync local sync state engine |
| [architecture/2026-06-22-gurudevi-architecture-draft-1.md](architecture/2026-06-22-gurudevi-architecture-draft-1.md) | Preliminary draft 1 for the Gurudevi mobile application structure |
| [architecture/2026-07-23-architecture-analysis.md](architecture/2026-07-23-architecture-analysis.md) | Architecture audit and vulnerability analysis report |
| [architecture/2026-07-23-docs-grounded-architecture-analysis.md](architecture/2026-07-23-docs-grounded-architecture-analysis.md) | Document-grounded architecture review and gap analysis |
| [architecture/2026-07-24-cedar-benchmark-sop-architecture.md](architecture/2026-07-24-cedar-benchmark-sop-architecture.md) | Performance benchmark and SOP for Cedar-based policy evaluation |
| [architecture/2026-07-24-expo-57-rust-inline-module-chronicle.md](architecture/2026-07-24-expo-57-rust-inline-module-chronicle.md) | Technical chronicle detailing inline Kotlin/Rust JNI bridge integrations |
| [architecture/2026-07-24-permission-refactor-review-report.md](architecture/2026-07-24-permission-refactor-review-report.md) | Post-refactor review report for permission systems |
| [architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md](architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md) | Evidence-backed comparison of the imported exploration corpus against current code, schema, migrations, and UI |
| [files new/README.md](files%20new/README.md) | Preserved imported exploration evidence archive and reading boundary |
| [architecture/production-software-landscape.md](architecture/production-software-landscape.md) | Full-stack mental map of production web + mobile software — for non-coders |

---

## ⚖️ Architecture Decision Records (ADRs)

Records documenting the rationale behind core design and architecture choices.

| Document | Description |
|---|---|
| [decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md](decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md) | Docs authority hierarchy, feature rollout limits vs authorization |
| [decisions/2026-06-26-route-onboarding-through-api.md](decisions/2026-06-26-route-onboarding-through-api.md) | ADR outlining why onboarding routes through the Sanctuary API |
| [decisions/2026-07-28-gurudevi-authz-decision-record.md](decisions/2026-07-28-gurudevi-authz-decision-record.md) | ADR for mobile client authorization rules and PDP configuration |
| [decisions/2026-08-09-doppler-secrets-management-adoption.md](decisions/2026-08-09-doppler-secrets-management-adoption.md) | ADR for adopting Doppler as centralized secrets management across dev/staging/prod/next environments |

---

## 🚀 Active Plans & Current Progress

Checklists, active feature roadmaps, migration paths, and lint configuration plans.

| Document | Description |
|---|---|
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
| [infra/rust-git-guidelines.md](infra/rust-git-guidelines.md) | Rust & Git Integration Guide & SOP for beginners |
| [infra/expo-57-rust-inline-module-sop.md](infra/expo-57-rust-inline-module-sop.md) | Step-by-step SOP for Kotlin inline modules with JNI Rust |
| [infra/2026-07-24-physical-device-deployment-log.md](infra/2026-07-24-physical-device-deployment-log.md) | Live runlog for physical hardware builds and USB debugging |
| [infra/doppler-secrets-management-guide.md](infra/doppler-secrets-management-guide.md) | Comprehensive guide for Doppler secrets management integration across dev/staging/prod/next environments |
| [infra/doppler-day-to-day-usage-guide.md](infra/doppler-day-to-day-usage-guide.md) | Daily usage reference for Doppler CLI commands, workflows, troubleshooting, and best practices |

---

## Changelog

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
