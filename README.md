---
title: "Polymath Platform (EdLove / Gurudevi)"
status: "active"
created: 2025-11-03
updated: 2026-10-04
author: "Naveen"
scribe: "opencode"
tags: [platform, monorepo]
---

# Polymath Platform (EdLove / Gurudevi)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-58.0.3-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor_Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

> **Transparent Hosted — MIT open source, hosted production.** Code is public for audit at this repo (`LICENSE` MIT). Production runs hosted at `platform.gurudevi.edlove.org` (Expo 57 + Supabase Cloud + PowerSync Cloud + EAS). Self-host is dev-only/edge-case — you get community + curated library network benefits on our hosted stack. See ADR [2026-08-25-transparent-hosted-oss.md](./docs/decisions/2026-08-25-transparent-hosted-oss.md).

A single monorepo for the EdLove education ecosystem:

- **EdLove**: the umbrella foundation/house for education philosophy + ecosystem coordination.
- **Gurudevi**: the flagship "Education Ecology Support System" product (mobile-first).

## Architecture — Current (Source of Truth)

### Apps (What to Build In)

| App | Purpose | Framework | Status |
|-----|---------|-----------|--------|
| **`apps/gurudevi-mobile`** | **Native iOS/Android** — the flagship mobile app | Expo 58 (React Native 0.88, New Architecture) | ✅ Active |
| **`apps/gurudevi-web`** | **Unified Web Platform** — Marketing + Sanctuary | Next.js 16.4 (Turbopack, Tailwind v4) | ✅ **Primary web target** |
| `apps/gurudevi-marketingWeb` | Legacy marketing site | Astro/Svelte | ⚠️ **Deprecated → gurudevi-web** |
| `apps/edlove-web` | EdLove Epistemic Commons (`edlove.org`) | Next.js 16.4 (SSG 223 routes, Turbopack) | ✅ Active |
| `apps/sanctuary-api` | Sanctuary API & Verification Engine | Node.js/Hono/oRPC | ✅ Active |

### Domain Packages (Shared Logic)

| Package | Purpose |
|---------|---------|
| `@repo/core` | Platform spine: auth, tenancy, permissions, contracts, API clients |
| `@repo/classroom` | Classroom domain: attendance, gradebook, reflect, workspace |
| `@repo/ui` | React Native / NativeWind primitives (tokens, not web components) |
| `@repo/ui/tokens` | Design tokens (colors, spacing, motion) — platform-neutral |
| `@repo/ui/web` | **Web-only components** (built in gurudevi-web, extracted after proven) |

### Key Boundaries (Non-Negotiable)

| Rule | Enforcement |
|------|-------------|
| **No RN Web imports in `gurudevi-web`** | Build browser-native components in `apps/gurudevi-web` |
| **No `@repo/ui` web components in Next.js** | Use `@repo/ui/tokens` for design values; build web components in `gurudevi-web` |
| **No Expo/React Native/PowerSync in `gurudevi-web`** | Use `@repo/core/web-auth`, `@repo/core/web-authorized-entry` for auth |
| **Shared logic only via `@repo/*` packages** | Hooks, schemas, API clients, pure logic in `@repo/core`, `@repo/classroom` |
| **RN Web (`*.web.tsx`) is migration source only** | Being retired — see [implementation plan](./docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md) |

### Deployment Targets

| Target | URL | App |
|--------|-----|-----|
| **Production Web** | `gurudevi.app` / `platform.gurudevi.edlove.org` | `gurudevi-web` (Next.js) |
| **Production Mobile** | App Store / Play Store | `gurudevi-mobile` (Expo + EAS) |
| **Marketing** | `gurudevi.edlove.org` | `gurudevi-web` (unified) |
| **API** | `api.gurudevi.edlove.org` | `sanctuary-api` |

---

## Where to Start (Internal/Dev)

- Ecosystem navigator: [apps/00_ECOSYSTEM_INDEX.md](./apps/00_ECOSYSTEM_INDEX.md)
- Openness/licensing: [2026-08-25-transparent-hosted-oss.md](./docs/decisions/2026-08-25-transparent-hosted-oss.md)
- Branch pipeline: [docs/infra/git-branching-model.md](./docs/infra/git-branching-model.md)
- Root config map: [docs/engineering/root-configuration-map.md](./docs/engineering/root-configuration-map.md)
- Documentation SOP: [apps/gurudevi-mobile/docs/docs-sop.md](./apps/gurudevi-mobile/docs/docs-sop.md)
- Doppler toolchain: [docs/infra/doppler-toolchain.md](./docs/infra/doppler-toolchain.md)

### App Contexts (Read Before Working)

- [apps/gurudevi-web/CONTEXT.md](./apps/gurudevi-web/CONTEXT.md) — **Primary web app**
- [apps/gurudevi-mobile/README.md](./apps/gurudevi-mobile/README.md) — Native mobile
- [apps/edlove-web/CONTEXT.md](./apps/edlove-web/CONTEXT.md) — EdLove foundation
- [apps/sanctuary-api/CONTEXT.md](./apps/sanctuary-api/CONTEXT.md) — API

## Project Status

**Gurudevi** is in active development toward v1.0. The platform is feature-complete for core classroom workflows (attendance, assignments, wellbeing, community, library) but production deployment and operational hardening are ongoing.

### What's Working
- ✅ Mobile app (React Native 0.88 / Expo 58) with native new-architecture support
- ✅ **Web platform (Next.js 16.4 Turbopack) — unified marketing + sanctuary at `gurudevi.app`**
- ✅ EdLove Epistemic Commons (`edlove.org`) — 223 SSG static routes & AI crawler index
- ✅ Sanctuary API (Node.js/Hono/oRPC) with OpenAPI spec
- ✅ Local-first sync via PowerSync (offline support)
- ✅ Multi-tenant authorization via ZenStack + Cedar policies
- ✅ Cross-school community and curated library

### What's In Progress
- 🚧 Production deployment to `platform.gurudevi.edlove.org`
- 🚧 Web migration: Classroom workspace canvas, Reflect, Guardian (see [implementation plan](./docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md))
- 🚧 Staging/production environment isolation
- 🚧 Operational hardening (monitoring, alerts, rollback procedures)

### What's Planned
- 📋 iOS support (currently Android-first)
- 📋 Docker-based self-hosting option (roadmap, not v1)
- 📋 Federated library federation (Tier 1 Hub Pull, Tier 2 Curated Publish)

### Contributing Areas
See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and contribution guidelines.
- Toolchain authority and CI/free-first integrations: [docs/infra/doppler-toolchain.md](./docs/infra/doppler-toolchain.md) and [docs/infra/github-student-pack-toolchain.md](./docs/infra/github-student-pack-toolchain.md)
- Testing and performance lanes: [docs/infra/testing-and-performance-toolchain.md](./docs/infra/testing-and-performance-toolchain.md)

Web migration plan: [docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md](./docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md)

## Repo layout

- `apps/*`: end-user applications (websites + mobile app + web app build)
- `packages/*`: shared domain packages (Gurudevi pillars + shared core/ui/tooling)

## Quick commands

```bash
pnpm install
pnpm dev                  # Doppler-injected (team)
pnpm build
pnpm lint
pnpm check-types
pnpm audit:secrets
```

Without Doppler (contributors / edge-case self-host dev):

```bash
cp apps/gurudevi-mobile/.env.example apps/gurudevi-mobile/.env.local
# fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# → for local DB: `supabase start` then paste API URL + publishable key (supabase/config.toml:54321)
pnpm --filter gurudevi-mobile dev:no-doppler
```

This repo uses `pnpm` workspaces + `turbo` to orchestrate tasks across apps/packages.
Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md) · Security: [SECURITY.md](./SECURITY.md) · License: [LICENSE](./LICENSE).

