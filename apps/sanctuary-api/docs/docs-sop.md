---
title: "Sanctuary API Documentation SOP"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [standards, documentation]
---

# Sanctuary API Documentation SOP (Standard Operating Procedure)

This document establishes the official standard for creating, maintaining, and organizing technical documentation across the Sanctuary API gateway (`apps/sanctuary-api`).

---

## 1. Directory Structure

All documentation must be placed in one of the following subdirectories under `apps/sanctuary-api/docs/` based on its purpose:

```text
docs/
├── docs-sop.md                 # This document (rules and guidelines)
├── INDEX.md                    # Central index and chronological changelog
├── architecture/               # System design, data engines, security models, schemas, tech stack, and standards
├── decisions/                  # ADRs (Architecture Decision Records)
├── current_progress/           # Active plans, task lists, current implementations
│   └── old_docs/               # Timeframe-based historical archives
├── infra/                      # CI/CD, builds, release checklists, environment setup
└── Core/                       # Core package/app logic, route details, middleware
```

---

## 2. Document Naming Convention

We use a dual-naming convention to keep references clean while ensuring chronological visibility:

### A. Static Reference Documents
* **Purpose**: General guides, playbooks, specifications, and files that are continuously updated as the source of truth.
* **Naming**: Flat kebab-case without dates.
* **Example**: `/docs/architecture/tech-stack-and-standards.md`, `/docs/architecture/testing-standards.md`

### B. Point-in-time / Historical Documents
* **Purpose**: Audit reports, progress plans, architectural proposals (RFCs), and ADRs.
* **Naming**: Prefix with the creation date `YYYY-MM-DD-file-title.md`.
* **Example**: `/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md`

---

## 3. Mandatory YAML Frontmatter

Every markdown file must start with a YAML block. Copy and customize this template for every new file:

```yaml
---
title: "Document Title"
status: "active" | "draft" | "superseded" | "deprecated"
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: "Naveen" # Primary author
scribe: "Antigravity" # Agent scribe (if generated/maintained by AI)
tags: [api, architecture]
superseded_by: "relative/path/to/newer-doc.md" # Optional
---
```
