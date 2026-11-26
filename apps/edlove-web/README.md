---
title: "EDLOVE.ORG"
status: "active"
created: 2026-02-02
updated: 2026-10-15
author: "Naveen"
scribe: "Antigravity"
tags: [apps, edlove-web, astro, ssg, education-commons]
---

# EDLOVE.ORG

> **"The digital sanctuary for educational transformation."**

This is the codebase for **[edlove.org](https://edlove.org)** — the epistemic commons and public foundation of the EdLove ecosystem. It embodies "Education as Care Work" and serves as a public knowledge hub for educational research, innovations, and pedagogical philosophy.

---

## 🌟 The Philosophy

This project is driven by a deep philosophical commitment. Before contributing, please read the core foundation documents:

- **[01-philosophy.md](../../docs/edlove/Core/01-philosophy.md)**: The "Why" — Education as care work, topological invariants, and non-extractive learning.
- **[02-design.md](../../docs/edlove/Core/02-design.md)**: The "How" — Organic protocols, tactile typography, and cinematic realism.
- **[readme-strategic-docs.md](../../docs/edlove/Core/readme-strategic-docs.md)**: The Map — Navigation guide to strategic architecture and ecosystem documents.

---

## 🗺️ Documentation Constellation

Authoritative ecosystem documentation lives in the monorepo's `docs/` directory:

| Document | Purpose |
|----------|---------|
| **[readme-strategic-docs.md](../../docs/edlove/Core/readme-strategic-docs.md)** | Master map of all core strategic documents |
| **[01-philosophy.md](../../docs/edlove/Core/01-philosophy.md)** | Core principles and invariants |
| **[02-design.md](../../docs/edlove/Core/02-design.md)** | Design system, voice, and aesthetic guidelines |
| **[edlove-master-design-document-v2.md](../../docs/edlove/Core/edlove-master-design-document-v2.md)** | Comprehensive design specification |
| **[quantitative-ui-ux-quality-gate.md](../../docs/edlove/Core/quantitative-ui-ux-quality-gate.md)** | APCA contrast and WCAG3 visual accessibility gate |
| **[public-opening-checklist.md](../../docs/infra/public-opening-checklist.md)** | Public release preflight checklist |

---

## 🛠️ Architecture & Tech Stack

Per ADR [`2026-11-12-web-stack-astro-vite.md`](../../docs/decisions/2026-11-12-web-stack-astro-vite.md), the public web properties are built with **Astro 7.4** with Svelte, Tailwind CSS v4, and TypeScript 7.1 content mappers:

- **SSG Static Generation**: Pre-rendered static routes (Educational Innovations, Cosmos Paradigms, Pedagogy Canon, Ceylon Research Atlas).
- **Search Engine & AI Discovery**:
  - Dynamic XML Sitemap (`https://edlove.org/sitemap-index.xml`) via `@astrojs/sitemap`
  - Dynamic Robots Configuration (`/robots.txt`) indexing for Googlebot, Bingbot, Applebot, DuckDuckBot, ClaudeBot, GPTBot, and PerplexityBot.
- **Universal Accessibility**: Strict APCA/WCAG contrast compliance via `@repo/editorial` and `@intuitui-labs/a11y-gate`.

---

## 🏗️ Project Structure

```text
apps/edlove-web/
├── src/
│   ├── components/       # Astro and Svelte interactive components
│   ├── content/          # Typed content collections (cosmos, library, journal)
│   ├── layouts/          # Astro page layouts
│   ├── pages/            # Astro static route pages
│   └── styles/           # Tailwind v4 theme styling
├── public/               # Static assets & icons
└── tests/                # Unit and integration test suites
```

---

## 🚀 Development Commands

Run these from the `apps/edlove-web` directory:

| Command | Action |
|---------|--------|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Start development server |
| `pnpm build` | Build static production bundle |
| `pnpm test` | Run G1 boundary tests |
| `pnpm check-types` | TypeScript type-check |

---

## Open Source & Community

This project is part of the EdLove ecosystem monorepo, released under the MIT License. See the root [LICENSE](../../LICENSE) file for details.

For contributor guidelines, see the root [CONTRIBUTING.md](../../CONTRIBUTING.md). Security issues should be reported according to [SECURITY.md](../../SECURITY.md).

---

*"Education born from Love, built with Love."*
