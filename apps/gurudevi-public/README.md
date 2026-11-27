# Gurudevi Public — Canonical Marketing, Journal & Public Portal

> [!NOTE]
> **Repository Status: Stalled (2026-11-27)**  
> Active development on this repository is paused indefinitely because the primary maintainer is unavailable (bus factor).

> **Live Production**: [gurudevi.app](https://gurudevi.app)  
> *(Authenticated workspaces & Explore showroom live in `apps/gurudevi-web` at [sanctuary.gurudevi.app](https://sanctuary.gurudevi.app) and [explore.gurudevi.app](https://explore.gurudevi.app))*

`apps/gurudevi-public` is the static public face of **Gurudevi Sanctuary**. It delivers marketing pages, institutional overviews, educational journal entries, legal policies, and AI agent discoverability with zero trackers and zero client-side hydration overhead.

---

## 🏛️ Architecture & Tech Stack

Per ADR [`docs/decisions/2026-11-12-web-stack-astro-vite.md`](../../docs/decisions/2026-11-12-web-stack-astro-vite.md), the public portal is built on **Astro 7.4**:

* **Static Site Generation (SSG)**: Pre-rendered HTML at build time for instant page loads and optimal SEO.
* **React 19 Islands**: Interactive components only where necessary via `@astrojs/react`.
* **TypeScript 7.1 Content Mappers**: Native content collections mapped through `@astrojs/ts-content-mapper`.
* **Styling**: Tailwind CSS v4 using `@tailwindcss/vite` and `@repo/ui` design tokens.
* **Deployment**: Static asset hosting on Cloudflare Pages.

---

## 🚀 Running Locally

```bash
# Start development server on port 4321
pnpm --filter apps-gurudevi-public dev

# Typecheck and sync content collections
pnpm --filter apps-gurudevi-public check-types

# Production build
pnpm --filter apps-gurudevi-public build

# Preview build locally
pnpm --filter apps-gurudevi-public preview
```

---

## 🛡️ Standards & Governance

* **Zero Surveillance**: Zero trackers, analytics pixels, or fingerprinting.
* **Accessible Typography**: Strict APCA contrast standards and semantic HTML5 landmarks.
* **Agent Transparency**: Public `llms.txt` and machine-readable architectural manifests for respectful AI discovery.
