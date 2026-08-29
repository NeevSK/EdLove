---
title: "UI Package Documentation Index"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "Antigravity"
tags: [ui, package, index]
---

# UI Package Documentation Index

This index structures all interface guides, accessibility (a11y) governance, state management specs, and UI widget inventories for `@repo/ui`.

## Directory Structure

- **`Core/`** — State management guides and state-quality UX standards
- **`architecture/`** — Component media consumption layout models, widget inventories, and accessibility governance specs
- **`current_progress/`** — A11y remediations progress plans and state hardening checklists

---

## 📘 Core Guides

| Document | Description |
|---|---|
| [Core/state-management-guide.md](Core/state-management-guide.md) | Standard developer guidelines on local and global UI state management |
| [Core/state-quality-ux-standards.md](Core/state-quality-ux-standards.md) | UI state verification checks and UX standards |

---

## 🏛️ Architecture Specs

| Document | Description |
|---|---|
| [architecture/media-consumption-architecture.md](media-consumption-architecture.md) | Specifications for audio/video rendering and consumption layouts |
| [architecture/ui-inventory.md](ui-inventory.md) | Registry of all active UI components, screens, and design tokens |
| [architecture/a11y-governance.md](a11y-governance.md) | Core rules for keeping layouts accessible to screen readers |
| [architecture/source-owned-nativewind-ui.md](architecture/source-owned-nativewind-ui.md) | Source-owned NativeWind/shadcn-style component architecture |
| [architecture/semantic-tokens.md](architecture/semantic-tokens.md) | Semantic token roles and NativeWind usage rules |

---

## 🚀 Active Plans & Roadmaps

| Document | Description |
|---|---|
| [current_progress/2026-04-23-a11y-remediations-draft.md](current_progress/2026-04-23-a11y-remediations-draft.md) | Remediation plan details for addressing identified layout a11y gaps |
| [current_progress/tasks.md](tasks.md) | Checklist of active UI design tasks and bugfixes |
| [current_progress/state-hardening-registry.md](state-hardening-registry.md) | Registry tracking component state hardening and test status |
| [architecture/source-owned-nativewind-ui-roadmap.md](architecture/source-owned-nativewind-ui-roadmap.md) | Phased implementation roadmap for the source-owned UI system |

The development-only mobile reference surface is available at `/ui-showcase`.
It demonstrates the source-owned form, selection, overlay, and tab contracts
together.
