---
title: "AGENTS.md - EdLove Web (edlove.org)"
status: "active"
created: 2026-11-16
author: "Naveen"
scribe: "Antigravity"
tags: [edlove-web, astro, svelte, architecture, rules]
---

# AGENTS.md - EdLove Web (`edlove.org`)

> **PRIME DIRECTIVE: ASTRO 7.4 STATIC SITE (SSG) ARCHITECTURE**  
> `apps/edlove-web` is a zero-tracker, public epistemic commons built on **Astro 7.4**, Svelte islands, and Tailwind CSS v4.
> Next.js has been completely purged per ADR [`docs/decisions/2026-11-12-web-stack-astro-vite.md`](../../docs/decisions/2026-11-12-web-stack-astro-vite.md).

## Architectural Invariants
1. **SSG Pre-rendering**: All routes are pre-rendered statically with zero client-side hydration overhead unless interactive.
2. **TypeScript 7.1 Content Mappers**: Content collections (e.g. 200 Educational Innovations, Cosmos Paradigms, Pedagogy Canon) are strongly typed via Astro content collections (`src/content.config.ts`) and `@astrojs/ts-content-mapper`.
3. **Accessibility (APCA & WCAG3)**: Ensure high-contrast tactile typography and WCAG AAA compliance.
4. **Boundary Rules**: Do not import native/mobile packages (React Native, Expo, MMKV, PowerSync) into `apps/edlove-web`.
