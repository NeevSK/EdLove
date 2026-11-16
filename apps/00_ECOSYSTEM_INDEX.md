---
title: "EdLove Web Ecosystem Index"
status: "active"
created: 2026-02-12
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [apps, 00_ECOSYSTEM_INDEX.md]
---

# EdLove Web Ecosystem Index

Welcome to the EdLove ecosystem monorepo.

This ecosystem consists of one main "House" (EdLove.org) and several satellites/subdomains.
Each application is independent but philosophically connected.

## Navigator

### 1) The Main House

- App: `edlove-web`
- Stack: Astro 7.4 (Svelte, Tailwind v4)
- Identity: Educational Transformation Epistemic Commons (`edlove.org`)
- Status: Active production

### 2) Satellites

#### Gurudevi Public Site
- App: `gurudevi-public`
- Stack: Astro 7.4 (React 19 islands, Tailwind v4)
- Identity: Public marketing, journal, SEO, legal (`gurudevi.app`)
- Status: Active production (replaces legacy `gurudevi-marketingWeb`)

#### Gurudevi Platform (Web App)
- App: `gurudevi-web`
- Stack: Vite 8.3.5 SPA (`spa/` with `@tanstack/react-router`, Tailwind v4)
- Identity: Canonical browser app for authenticated sanctuary workspaces (`sanctuary.gurudevi.app`) and Explore showroom (`explore.gurudevi.app`).
- Status: Active production

#### Gurudevi Mobile
- App: `gurudevi-mobile`
- Stack: Expo 58 / React Native 0.88
- Identity: Operational engine (teachers, principals, students)
- Context: [gurudevi-mobile/README.md](./gurudevi-mobile/README.md)
- Relation: Primary mobile client; pillar packages live under `../packages/*`.

#### Sanctuary Verification API
- App: `sanctuary-api`
- Stack: Node.js / Hono / oRPC v2
- Identity: Central verification engine, cryptographic receipts, OpenAPI contracts, and distributed sync coordination.

> `intuitui-web` (Systems Intelligence Studio) and `neevsk-web` (Personal Digital
> Archive) were extracted into standalone private repos:
> [NeevSK/intuitui-web](https://github.com/NeevSK/intuitui-web),
> [NeevSK/neevsk-web](https://github.com/NeevSK/neevsk-web).

---

## Agent instructions

1. Always identify which app you are working on.
2. Read that app's `CONTEXT.md` (or `gurudevi-mobile/README.md`) before starting major work.
3. Respect the design constraints defined in the context docs.

---

Last updated: 20 March 2026

