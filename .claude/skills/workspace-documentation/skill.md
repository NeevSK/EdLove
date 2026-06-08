---
name: "workspace-documentation"
description: "Use when creating, modifying, organizing, or archiving any documentation (.md files) in the workspace to ensure strict adherence to the project SOP and directory structures."
---

# Workspace Documentation Skill & SOP

This skill enforces the official standard for creating, maintaining, and organizing technical documentation (.md files) across all applications in the repository.

## When to Use
- Whenever you are asked to write a specification, plan, audit report, guide, or readme.
- Whenever you are asked to clean up, reorganize, or index the documentation folders.

## Rules & Workflow

### 1. App Isolation (Strict Boundaries)
- **App-Specific Docs**: Must reside in the app's own documentation folder (e.g. `apps/gurudevi-mobile/docs/`). Never place app-specific specifications at the root.
- **Root/Ecosystem Docs**: Root `docs/` is reserved strictly for global, platform-wide playbooks, deployment constraints, or monorepo tools.

### 2. Dual-Naming Convention

To ensure chronological clarity and prevent link breakage, use this naming convention:

| Category | Naming Convention | Description | Example |
| :--- | :--- | :--- | :--- |
| **Reference Guides** | Static Kebab-case | Continuously updated source-of-truth playbooks. Keep filenames static to avoid breaking links. | `/docs/architecture/ui-color-doctrine.md` |
| **Point-in-Time Docs** | Date Prefix (`YYYY-MM-DD-title.md`) | Audits, progress logs, RFCs, ADRs. Naturally sorts chronologically. | `/docs/architecture/2026-06-08-audit-report.md` |

### 3. Mandatory YAML Frontmatter
Every single markdown file in the workspace must start with a YAML block:

```yaml
---
title: "Clean Document Title"
status: "active" | "draft" | "superseded" | "deprecated"
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: "Name"
tags: [reorganized, architecture]
superseded_by: "relative/path/to/newer-doc.md" # Optional
---
```

### 4. Lifecycle & Archiving
- Do not delete historical documents if they contain contextual history. Instead, set `status: superseded` in the YAML block, link to the replacement, and keep them in their context folder.
- Move transient/finished implementation plans to the app's `current_progress/old_docs/` folder, structured by timeframe (e.g., `old_docs/2026-Q1/`).
