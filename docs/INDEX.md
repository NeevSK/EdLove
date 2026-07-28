---
title: "Documentation Index"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [docs, index, changelog]
---

# Documentation Index

## Directory Structure

- **`Core/`** — Core package/app logic, route details, middleware
- **`architecture/`** — System design, data engines, security models, tech stack, testing standards
- **`current_progress/`** — Active plans, task lists, current implementations
- **`decisions/`** — Architecture Decision Records (ADRs)
- **`infra/`** — CI/CD, builds, developer workflow, code quality
- **`RN Terrain/`** — React Native specific documentation
- **`../native-capabilities/`** — Platform-wide Rust, UniFFI, Expo-module, Nitro, testing, and native-boundary standards

## Core Docs

| Document | Description |
|---|---|
| [Core/developer-playbook.md](Core/developer-playbook.md) | Master strategy: project hygiene, quality gates, guardrails |
| [Core/onboarding.md](Core/onboarding.md) | Onboarding API — contracts, handlers, client, tests |

## Architecture Docs

| Document | Description |
|---|---|
| [architecture/architecture-guidelines.md](architecture/architecture-guidelines.md) | Layered topology, golden rules of dependencies |
| [architecture/architecture-deep-dive.md](architecture/architecture-deep-dive.md) | Philosophy of restraint, sovereignty rules |
| [architecture/tech-stack-and-standards.md](architecture/tech-stack-and-standards.md) | Tech stack details, CORS config, standards |
| [architecture/zenstack-schema-architecture.md](architecture/zenstack-schema-architecture.md) | ZenStack v3 patterns, schema/database split, runtime Zod |

## Decisions (ADRs)

| Document | Description |
|---|---|
| [decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md](decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md) | Docs authority hierarchy, feature rollout vs authz |
| [decisions/2026-06-26-route-onboarding-through-api.md](decisions/2026-06-26-route-onboarding-through-api.md) | Route onboarding through Sanctuary API |

## Current Progress

| Document | Description |
|---|---|
| [current_progress/2026-06-20-feature-rollout-implementation-plan.md](current_progress/2026-06-20-feature-rollout-implementation-plan.md) | Feature rollout implementation plan & phases |
| [current_progress/2026-06-09-oxlint-eslint-hybrid-checklist.md](current_progress/2026-06-09-oxlint-eslint-hybrid-checklist.md) | Lint tooling checklist |
| [current_progress/2026-06-26-onboarding-api-routing.md](current_progress/2026-06-26-onboarding-api-routing.md) | Onboarding API routing — task list, decisions, known issues |

## Infra Docs

| Document | Description |
|---|---|
| [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) | Dependency migration process — general pattern for any package |
| [infra/version-management.md](infra/version-management.md) | Version management tooling analysis & recommendation |
| [infra/developer-workflow-guide.md](infra/developer-workflow-guide.md) | Developer workflow |
| [infra/git-branching-model.md](infra/git-branching-model.md) | Git branching strategy |
| [infra/code-quality-workflow.md](infra/code-quality-workflow.md) | Code quality and audit workflow |
| [infra/code-checkers.md](infra/code-checkers.md) | Available checkers and commands |

## Changelog

### 2026-07-18

- **Added**: `MIGRATION-GUIDE.md` — General dependency migration process grounded in archaeology findings
- **Added**: `infra/version-management.md` — Version management tooling analysis: migrate from `@changesets/cli` to pnpm native versioning (v11.13.0)

### 2026-06-26

- **Added**: `Core/onboarding.md` — Onboarding API contracts, handlers, client, and test documentation
- **Added**: `decisions/2026-06-26-route-onboarding-through-api.md` — ADR for routing onboarding through Sanctuary API
- **Added**: `current_progress/2026-06-26-onboarding-api-routing.md` — Current progress tracker for onboarding API routing work
- **Added**: `INDEX.md` — Central documentation index with directory structure and changelog
- **Created**: `architecture/tech-stack-and-standards.md` — Tech stack configuration reference (CORS, etc.)
- **Added**: `architecture/zenstack-schema-architecture.md` — ZenStack v3 patterns, schema/database split, runtime Zod factory, agent skills
- **Installed**: 9 ZenStack agent skills from `zenstackhq/skills` via `npx skills add` — schema-modeling, access-control, querying, crud-server, db-migration, project-setup, migrate-from-prisma, migrate-from-v2, plugin-dev
- **Synced**: Workspace skills via `scripts/sync-skills.mjs` — propagated to Antigravity, Codex, and copilot-instructions.md
