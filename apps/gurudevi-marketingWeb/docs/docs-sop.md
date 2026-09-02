---
title: "Gurudevi Marketing Web Documentation SOP"
status: "active"
created: 2026-09-01
updated: 2026-09-01
author: "Naveen"
scribe: "Antigravity"
tags: [standards, documentation, gurudevi-marketingWeb]
---

# Gurudevi Marketing Web Documentation SOP

This document establishes the official standard for creating, maintaining, and organizing technical documentation for `apps/gurudevi-marketingWeb`.

---

## 1. Directory Structure

All documentation must reside within `apps/gurudevi-marketingWeb/docs/`:

```text
apps/gurudevi-marketingWeb/docs/
├── docs-sop.md                     # This document (rules and guidelines)
├── INDEX.md                        # Central index and registry
├── Core/                           # Brand identity, sanctuary tokens, journal policies
├── architecture/                   # Route structure, server adapter, analytics
├── decisions/                      # ADRs (Architecture Decision Records)
└── current_progress/               # Active implementation plans & task lists
    └── old_docs/                   # Archived plans
```

---

## 2. Document Naming Convention

* **Reference Guides (Living)**: Flat kebab-case without dates (e.g. `apps/gurudevi-marketingWeb/docs/Core/editorial-and-media-guidelines.md`).
* **Point-in-Time / RFCs (Historical)**: Date-prefixed `YYYY-MM-DD-title.md` (e.g. `apps/gurudevi-marketingWeb/docs/current_progress/2026-09-01-rich-media-foraging-and-architecture.md`).

---

## 3. Mandatory YAML Frontmatter

Every markdown file in `docs/` must begin with:

```yaml
---
title: "Document Title"
status: "active" | "draft" | "superseded" | "deprecated"
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: "Naveen"
scribe: "Antigravity"
tags: [marketing, editorial, sanctuary]
---
```
