---
title: "EDLOVE.ORG"
status: "active"
created: 2026-02-02
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [apps, edlove-web]
---

# EDLOVE.ORG

> **"The digital sanctuary for educational transformation."**

This is the codebase for **edlove.org** â€” the public face of the EdLove ecosystem. It is built to be not just a website, but an experience that embodies "Education as Care Work."

---

## ðŸŒŸ The Philosophy

This project is driven by a deep philosophical commitment. Before contributing, please read the core documents:

- **[01_PHILOSOPHY.md](Docs/01_PHILOSOPHY.md)**: The "Why". Education as care work, topological invariants.
- **[02_DESIGN.md](Docs/02_DESIGN.md)**: The "How". Cinematic realism, organic protocols, the "Malick effect".
- **[00_INDEX.md](Docs/00_INDEX.md)**: The Map. Start here to navigate the entire documentation constellation.

---

## ðŸ—ºï¸ Documentation Constellation

All documentation for this project lives in the `Docs/` directory.

| Document | Purpose |
|----------|---------|
| **[00_INDEX.md](Docs/00_INDEX.md)** | **Start Here.** The master map of all docs. |
| **[01_PHILOSOPHY.md](Docs/01_PHILOSOPHY.md)** | Core principles and "topological invariants". |
| **[02_DESIGN.md](Docs/02_DESIGN.md)** | Design system, voice, and aesthetic guidelines. |
| **[03_TECH.md](Docs/03_TECH.md)** | Technical stack, architecture, and build guide. |
| **[04_Domain_I.md](Docs/04_Domain_I.md)** | The "Paradigm Cosmos" domain. |
| **[05_Domain_II.md](Docs/05_Domain_II.md)** | The "Sri Lanka" domain. |
| **[06_Domain_III.md](Docs/06_Domain_III.md)** | The "Gurudevi" domain. |
| **[10_ROADMAP.md](Docs/10_ROADMAP.md)** | Timeline and execution plan. |

---

## ðŸ› ï¸ Development

This project is built with **Astro**, **Svelte 5**, and **Tailwind CSS v4**.

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (Preferred package manager)

### Commands

Run these from the `apps/edlove-web` directory:

| Command | Action |
|---------|--------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start local development server at `localhost:4321` |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build locally |

---

## ðŸ—ï¸ Project Structure

```text
/
â”œâ”€â”€ public/           # Static assets
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ assets/       # Processed assets (images, fonts)
â”‚   â”œâ”€â”€ components/   # Reusable UI components (Astro/Svelte)
â”‚   â”œâ”€â”€ layouts/      # Page layouts
â”‚   â””â”€â”€ pages/        # File-based routing
â”œâ”€â”€ Docs/             # ðŸ“– The Constellation (Documentation)
â””â”€â”€ package.json
```

---

*"Education born from Love, built with Love."*
