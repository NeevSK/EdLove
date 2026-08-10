---
title: "Polymath Platform Documentation SOP (Standard Operating Procedure)"
status: "active"
created: 2026-08-09
updated: 2026-08-09
author: "Naveen"
scribe: "Antigravity"
tags: [standards, documentation]
---

# Polymath Platform Documentation SOP (Standard Operating Procedure)

This document establishes the official standard for creating, maintaining, and organizing technical documentation across the Polymath Platform monorepo. All developers and agents must adhere to these rules.

---

## 1. Directory Structure

All documentation must be placed in one of the following subdirectories under the root `docs/` folder based on its purpose:

```text
docs/
├── docs-sop.md                 # This document (rules and guidelines)
├── INDEX.md                    # Central index and chronological changelog
├── architecture/               # System design, data engines, security models, schemas
├── decisions/                  # ADRs (Architecture Decision Records)
├── current_progress/           # Active plans, task lists, current implementations
│   └── old_docs/               # Timeframe-based historical archives (e.g. Q1-2026)
├── infra/                      # CI/CD, builds, release checklists, environment setup
└── Core/                       # Core package/app logic, engine details, UI doctrine
```

---

## 2. Document Naming Convention

We use a dual-naming convention to keep references clean while ensuring chronological visibility:

### A. Static Reference Documents
* **Purpose**: General guides, playbooks, specifications, and files that are continuously updated as the source of truth.
* **Naming**: Flat kebab-case without dates.
* **Example**: `/docs/architecture/ui-color-doctrine.md`, `/docs/Core/ui-development-guide.md`

### B. Point-in-time / Historical Documents
* **Purpose**: Audit reports, progress plans, architectural proposals (RFCs), and ADRs.
* **Naming**: Prefix with the creation date `YYYY-MM-DD-file-title.md`.
* **Example**: `/docs/architecture/2026-05-16-gurudevi-architecture-audit.md`, `/docs/decisions/2026-05-16-agentic-mcp-implementation.md`

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
tags: [mobile, architecture]
superseded_by: "relative/path/to/newer-doc.md" # Optional
---
```

---

## 4. Lifecycle & Archiving Strategy

* **Active Documents**: Remain in their context directories and have `status: active`.
* **Superseded ADRs**: Keep in the `decisions/` directory to preserve structural history. Update the frontmatter:
  ```yaml
  status: "superseded"
  superseded_by: "decisions/2026-XX-XX-new-adr.md"
  ```
  And add a notice block at the top of the file linking to the replacement.
* **Transient Implementation Plans**: Once a feature is deployed and finalized, move the implementation file from `current_progress/` to `current_progress/old_docs/` to keep the active work environment clean.
