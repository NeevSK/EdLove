---
title: "Core Package Documentation Index"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "Antigravity"
tags: [core, package, index]
---

# Core Package Documentation Index

This index organizes all developer guides, hexagonal patterns, api strategies, architectural governance documents, and migration roadmaps for the `@repo/core` package.

## Directory Structure

- **`Core/`** — Core coding patterns, developer guides, and engine conventions
- **`architecture/`** — System designs, ports/adapters specifications, and service boundaries
- **`current_progress/`** — Active roadmaps, api cleanup plans, and package refactoring checklists

---

## 📘 Core Guides

| Document | Description |
|---|---|
| [Core/hono-patterns.md](Core/hono-patterns.md) | Standard coding patterns and middleware usage protocols for Hono |
| [Core/sovereign-development-patterns.md](Core/sovereign-development-patterns.md) | Architectural standards and development patterns for sovereign endpoints |
| [Core/tanstack-query-guide.md](Core/tanstack-query-guide.md) | Developer guidelines for TanStack Query integrations and caching strategies |

---

## 🏛️ Architecture Specs

| Document | Description |
|---|---|
| [architecture/architecture-governance.md](architecture/architecture-governance.md) | Governance principles and package relationship boundaries |
| [architecture/hono-sovereignty.md](hono-sovereignty.md) | Decoupling Hono logic from local platform boundaries |
| [architecture/sovereign-api-strategy.md](sovereign-api-strategy.md) | Strategic framework for exposed core API layers |
| [architecture/sovereign-infrastructure.md](sovereign-infrastructure.md) | Core infrastructure configurations and package bounds |
| [architecture/sovereign-push-notifications.md](sovereign-push-notifications.md) | Architecture blueprint for offline and online push notification flows |
| [architecture/data-odyssey.md](data-odyssey.md) | Data synchronization topologies and local schemas mapping |
| [architecture/2026-06-12-hexagonal-ports-adapters-rollout.md](architecture/2026-06-12-hexagonal-ports-adapters-rollout.md) | Rollout specification for ports and adapters architectural layer |
| [architecture/tasks.md](architecture/tasks.md) | Architecture-related tasks and specifications checklist |

---

## 🚀 Active Plans & Roadmaps

| Document | Description |
|---|---|
| [current_progress/2026-05-16-api-migration-roadmap.md](current_progress/2026-05-16-api-migration-roadmap.md) | Roadmap for migrating legacy API boundaries to hexagonal structures |
| [current_progress/2026-05-16-api-purge-implementation-plan.md](current_progress/2026-05-16-api-purge-implementation-plan.md) | Implementation steps to purge unused endpoints and schemas |
| [current_progress/2026-05-16-api-purge-tasks.md](current_progress/2026-05-16-api-purge-tasks.md) | Task list for the API purge execution |
| [current_progress/2026-05-08-hexagonal-roadmap.md](current_progress/2026-05-08-hexagonal-roadmap.md) | Core implementation phases for ports & adapters patterns |
| [current_progress/2026-05-07-identity-audit.md](current_progress/2026-05-07-identity-audit.md) | Audit report of user credentials, permissions, and session attributes |
| [current_progress/2026-05-16-identity-contract-and-migration-plan.md](current_progress/2026-05-16-identity-contract-and-migration-plan.md) | Migration plan for identity management systems |
| [current_progress/domain-api-healing-plan.md](current_progress/domain-api-healing-plan.md) | Staged plan for fixing boundary leaks in package APIs |
