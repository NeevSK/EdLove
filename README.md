---
title: "EdLove & Gurudevi Sanctuary"
status: "active"
created: 2025-11-03
updated: 2026-10-15
author: "Naveen"
scribe: "Antigravity"
tags: [edlove, gurudevi, sanctuary, offline-first, education-commons]
---

# EdLove & Gurudevi Sanctuary

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-58.0.3-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react)](https://reactnative.dev/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor_Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

> **"Education born from Love, built with Love."**
> 
> **Transparent Hosted — MIT open source, hosted production.** Code is public for audit at this repository (`LICENSE` MIT). Production runs hosted at `edlove.org` and `gurudevi.app` (Next.js 16 + Expo 58 + Supabase + PowerSync + EAS). Self-hosting is supported for local development and offline environments. See ADR [2026-08-25-transparent-hosted-oss.md](./docs/decisions/2026-08-25-transparent-hosted-oss.md).

---

## The Dual-Engine Ecosystem

EdLove is a civic and educational software constellation dedicated to **Education as Care Work**, non-extractive learning, and local-first institutional sovereignty:

1. **EdLove Epistemic Commons (`edlove.org`)**: The philosophical foundation, global educational innovations archive, and open research atlas. Built as a high-velocity static knowledge commons with zero trackers and open AI discoverability.
2. **Gurudevi Sanctuary (`gurudevi.app`)**: An offline-first digital haven and operational ecology for teachers, principals, students, and families. Designed for high resilience on fragile network connections, zero surveillance, and joyful classroom practice.

---

## Architecture & Topology

### Applications (`apps/`)

| Application | Purpose | Framework / Runtime | Status |
| :--- | :--- | :--- | :--- |
| [**`apps/edlove-web`**](./apps/edlove-web) | **EdLove Epistemic Commons (`edlove.org`)** — 223 pre-rendered SSG routes, 200 Innovations Archive, 6 Cosmos Paradigms, Ceylon Research Atlas | Next.js 16.4 (SSG, Turbopack, Tailwind v4) | ✅ Active |
| [**`apps/gurudevi-web`**](./apps/gurudevi-web) | **Gurudevi Unified Platform (`gurudevi.app`)** — Canonical browser sanctuary + marketing, host-routing proxy, in-browser WASM SQLite (OPFS) | Next.js 16.4 (Hybrid SSG/SSR, Turbopack) | ✅ **Primary Web Target** |
| [**`apps/gurudevi-mobile`**](./apps/gurudevi-mobile) | **Gurudevi Mobile** — Operational flagship for teachers, students, and principals | Expo SDK 58 (React Native 0.88, New Architecture) | ✅ Active |
| [**`apps/sanctuary-api`**](./apps/sanctuary-api) | **Sanctuary Verification Engine** — Cryptographic receipts, OpenAPI, distributed telemetry | Node.js / Hono / oRPC | ✅ Active |
| `apps/gurudevi-marketingWeb` | Legacy marketing site (Astro) | Astro / Svelte | ⚠️ **Deprecated → gurudevi-web** |

### Shared Domain Packages (`packages/`)

| Package | Purpose |
| :--- | :--- |
| [`@repo/core`](./packages/core) | **Ecosystem Spine**: Auth, tenancy, permissions, capabilities, offline resilience, and API clients |
| [`@repo/classroom`](./packages/classroom) | **Classroom Domain**: Attendance, gradebook, reflect, classroom canvas, and practice definitions |
| [`@repo/self`](./packages/self) | **Self Sanctuary**: Wellbeing, mindfulness, journaling, and personal reflection |
| [`@repo/community`](./packages/community) | **Relational Space**: Inter-school trust networks, announcements, and peer connections |
| [`@repo/library`](./packages/library) | **Curated Library**: Curated pedagogical resources, readers, and media |
| [`@repo/ui`](./packages/ui) | **Design Primitives**: Platform-neutral design tokens, motion primitives, and accessible components |

---

## Core Invariants & Boundaries

- **Zero Data Enclosure**: Student and teacher data is strictly private. No behavioural ad trackers, zero surveillance, and local-first encryption.
- **Offline-First by Design**: Primary classroom workflows function fully without internet. Local changes sync deterministically via PowerSync SQLite when connectivity is restored.
- **Browser-Native Web**: `apps/gurudevi-web` is built browser-native in Next.js 16 with semantic HTML and route-scoped OPFS/SharedArrayBuffer headers (`COOP: same-origin`, `COEP: credentialless`).
- **Sacred Native Pins**: Native mobile dependencies (Expo 58, React Native 0.88, Reanimated 4.7.1, Nitro 0.37.1) are pinned to ensure deterministic New Architecture builds.

---

## Quick Start

### Prerequisites
- Node.js `22.x` (managed via `.nvmrc`)
- pnpm `9.x` or later

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/NeevSK/EdLove.git
cd EdLove

# Install dependencies across all workspaces
pnpm install

# Start development with Doppler secrets injection (team)
pnpm dev

# Or start individual surfaces
pnpm --filter edlove-web dev        # EdLove Commons (localhost:4321 / 3000)
pnpm --filter gurudevi-web dev      # Gurudevi Sanctuary (localhost:3000)
pnpm --filter gurudevi-mobile dev   # Mobile Expo Dev Server
```

### Local Development Without Doppler

To develop locally without Doppler, use the provided `.env.example` templates:

```bash
# Gurudevi Mobile local setup
cp apps/gurudevi-mobile/.env.example apps/gurudevi-mobile/.env.local
pnpm --filter gurudevi-mobile dev:no-doppler

# Gurudevi Web local setup
cp apps/gurudevi-web/.env.example apps/gurudevi-web/.env.local
pnpm --filter gurudevi-web dev
```

---

## Quality & Verification Gates

```bash
pnpm run lint          # Run Biome & ESLint across monorepo
pnpm run check-types   # TypeScript strict compilation check
pnpm run audit:secrets # Verify zero unencrypted secrets in workspace
pnpm run test          # Execute Vitest test suites
```

---

## Community & Governance

We welcome contributors who share our commitment to civic technology and education as care work:

- **Contributing Guide**: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- **Code of Conduct**: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- **Security & Vulnerability Reporting**: [`SECURITY.md`](./SECURITY.md)
- **Academic Citation**: [`CITATION.cff`](./CITATION.cff)
- **License**: Released under the [MIT License](./LICENSE).

---

*"Education born from Love, built with Love."*
