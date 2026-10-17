---
title: "ADR: Web Platform Standardization on Next.js 16.4 over TanStack Start"
status: accepted
date: 2026-10-14
owners: [Naveen, Polymath Architecture & Platform Team]
tags: [nextjs, tanstack-start, architecture, offline-first, web, decision-record, anti-island-law]
---

# ADR: Web Platform Standardization on Next.js 16.4 over TanStack Start

## 1. Context & Problem Statement

As the Polymath Platform matured toward its public open repository release in October 2026, the architecture team evaluated whether to migrate interactive web subdomains—specifically the authenticated teacher haven (`sanctuary.gurudevi.app`) or the capability showroom (`explore.gurudevi.app`)—to **TanStack Start** (which released v1.0 on October 13, 2026) or a pure client-side Vite SPA.

The core motivations for this exploration were:
1. Minimizing server-side rendering (SSR) hydration friction on heavy, offline-first classroom workspace canvases.
2. Exploring TanStack Router's fine-grained client-side loader primitives and search-param state synchronization.
3. Decoupling client-centric local SQLite/PowerSync synchronization from Vercel/Next server lifecycle assumptions.

However, introducing a secondary meta-framework into an established 450,000-line pnpm monorepo carries substantial architectural weight.

---

## 2. Options Considered

### Option A: The Dual-Metaframework Split (TanStack Start for Sanctuary + Next.js for EdLove/Marketing)
* Migrate `sanctuary.gurudevi.app` and `explore.gurudevi.app` to TanStack Start + Vite.
* Keep `edlove.org` and `gurudevi.app` marketing on Next.js.
* **Critique**: Violates the **Anti-Island Law** (AGENTS.md Section 1). Forces the monorepo to maintain two parallel build pipelines (Turbopack + Vite/Rollup), introduces dual-instance React symlink resolution hazards (`resolve.dedupe`), doubles CI dependency cache sizes, and fragments developer cognitive load. Furthermore, TanStack Start v1.0 was released on October 13, 2026—adopting it immediately for critical institutional software introduces bleeding-edge ecosystem risk.

### Option B: Unified Standardization on Next.js 16.4.0 (Selected)
* Standardize all web surfaces on **Next.js 16.4.0** with Turbopack, React 19.3.0, and Tailwind v4.
* Leverage Next.js 16's newly verified physical substrate capabilities to solve the exact pain points that previously tempted teams toward pure client SPAs.
* Specialize each surface by rendering mode rather than framework fragmentation.

---

## 3. Grounded Technical Rationale (The Next.js 16.4 Advantage)

Direct inspection of the installed `next@16.4.0` substrate in `apps/gurudevi-web/node_modules/next/` and empirical benchmarking revealed five decisive affordances:

1. **`experimental.useOffline: true` (`next/offline`)**:
   Next.js 16 introduces native browser connectivity state management via `OfflineProvider` with `startTransition` and `useOptimistic`. When a rural teacher's network drops mid-action, the framework intercepts failed network requests, pauses route navigation, and initiates stepped backoff retries (500ms → 1s → 2s → 3s max cap). This completely eliminates unhandled `TypeError: Failed to fetch` route crashes.

2. **`staleTimes: { dynamic: 0, static: 300 }`**:
   The primary friction point of using Next.js for offline-first local-first applications was the client-side router cache holding onto stale route snapshots after local data mutations. In Next.js 16.4, dynamic routes default to `dynamic: 0`, ensuring that client cache invalidation is instant and reliable.

3. **Origin Private File System (OPFS) & SharedArrayBuffer Headers**:
   By injecting route-scoped headers in `next.config.ts`:
   ```typescript
   {
     source: '/(sanctuary|workspace|self|explore-internal)/:path*',
     headers: [
       { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
       { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' }
     ]
   }
   ```
   WebAssembly SQLite (PowerSync web worker) gains access to `SharedArrayBuffer` and OPFS without security errors, operating at physical disk I/O throughput in the browser. Using `credentialless` prevents blocking third-party media on public marketing pages.

4. **Multi-Surface Specialization within a Single Engine**:
   Next.js 16 cleanly supports the divergent requirements of our entire web topology:
   - **`edlove.org` (`apps/edlove-web`)**: Pure SSG (`force-static`). 223 pages pre-rendered via Turbopack in **10.4s** for maximum SEO and AI crawler discoverability (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
   - **`gurudevi.app` (`apps/gurudevi-web`)**: Hybrid SSG/SSR for fast TTFB marketing and school economics.
   - **`explore.gurudevi.app`**: Pre-rendered semantic SSR snapshots with JSON-LD schema, hydrating into a zero-auth in-memory sandbox.
   - **`sanctuary.gurudevi.app`**: Dynamic authenticated haven with heavy canvases isolated via `dynamic(..., { ssr: false })`, protected by `useOffline`.

5. **Build Velocity & Monorepo Coherence**:
   With `transpilePackages: ['@repo/core', '@repo/classroom', '@repo/self', '@repo/ui']`, Turbopack compiles all 80 Gurudevi web routes in **1.5s**, sharing contracts directly from TypeScript source with zero intermediate build artifacts.

---

## 4. The Decision

1. **Standardize on Next.js 16.4.0**: Both `apps/gurudevi-web` and `apps/edlove-web` will exclusively use Next.js 16.4.0 with Turbopack.
2. **Reject Meta-Framework Fragmentation**: TanStack Start will not be introduced into the monorepo for isolated subdomains. TanStack libraries (`@tanstack/react-query`, `@tanstack/react-pacer`) continue to be used as modular libraries inside our Next.js client layers where appropriate.
3. **Graceful Subdomain Routing**: The host routing proxy (`apps/gurudevi-web/proxy.ts` and `lib/host-routing.ts`) routes requests across `gurudevi.app`, `sanctuary.gurudevi.app`, and `explore.gurudevi.app`. Legacy `/explore/*` routes are retired and return 404, preventing an unauthenticated path from becoming an accidental compatibility surface.

---

## 5. Consequences & Invariants

* **Positive**:
  - Zero dual-bundler maintenance overhead; Turbopack remains the sole web bundler.
  - Zero risk of dual-instance React 19 bugs or lockfile deduplication churn.
  - Sub-second hot-reloads and rapid CI builds (10.4s for 223 pages).
  - Consistent developer mental model across all public and authenticated web properties.
* **Negative / Trade-offs**:
  - Heavy client components in the sanctuary must continue to be explicitly wrapped in `dynamic(..., { ssr: false, loading: () => <Skeleton /> })` to avoid SSR window access exceptions.
* **Invariants**:
  - Never introduce an isolated meta-framework into a package without a monorepo-wide RFC.
  - Never remove `transpilePackages` or route-scoped COOP/COEP headers from `next.config.ts`.
  - All native mobile pins (Expo 58, React Native 0.88, Reanimated 4.7.1, Nitro 0.37.1) remain strictly protected and frozen.
