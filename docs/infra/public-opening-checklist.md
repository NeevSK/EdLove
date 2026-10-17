---
title: "Polymath Platform & Gurudevi Public Opening Checklist"
status: "active"
created: 2026-10-11
updated: 2026-10-14
author: "Naveen"
scribe: "Antigravity"
tags: [public-opening, open-source, security, release-gate, contributors, nextjs16, seo]
---

# Polymath Platform & Gurudevi Public Opening Checklist

This is the active preflight ledger for opening the repository (`NeevSK/EdLove`) to the public on GitHub and accepting external contributions. It ensures high craft, zero data leakages, rigorous test evidence, and search engine discoverability.

---

## 1. Stop-Ship Verification Gates

- [x] **Tracked Ignored & Sensitive Files Sanitized**:
  - `apps/gurudevi-mobile/supabase/.temp/*` untracked from Git index (removing project ref `qzoawolfkuwiuyaoiybz` and pooler URLs).
  - Test device dumps and UI screenshots (`apps/gurudevi-mobile/temp/device-*`) untracked from Git index.
  - Hardened [`.gitignore`](file:///c:/x/.gitignore) with `**/.temp/` and `apps/gurudevi-mobile/supabase/.temp/`.
- [x] **Web Platform Architecture Certified (Next.js 16.4 over TanStack Start)**:
  - Formally accepted ADR: [`docs/decisions/2026-10-14-web-platform-standardization-nextjs-16-over-tanstack-start.md`](file:///c:/x/docs/decisions/2026-10-14-web-platform-standardization-nextjs-16-over-tanstack-start.md).
  - Standardized all web surfaces on Next.js 16.4.0 with Turbopack, rejecting dual-metaframework fragmentation.
  - Verified `experimental.useOffline: true`, `staleTimes: { dynamic: 0 }`, and route-scoped `credentialless` COOP/COEP headers.
- [x] **Web Search Engine Optimization (SEO) & AI Discovery (`apps/edlove-web`)**:
  - Dynamic XML Sitemap: [`apps/edlove-web/app/sitemap.ts`](file:///c:/x/apps/edlove-web/app/sitemap.ts) indexing all 223 routes (200 Innovations, 6 Cosmos Paradigms, Pedagogy Canon, Ceylon Research Atlas).
  - Dynamic Robots Configuration: [`apps/edlove-web/app/robots.ts`](file:///c:/x/apps/edlove-web/app/robots.ts) explicitly allowing `Googlebot`, `Bingbot`, `ClaudeBot`, `GPTBot`, and `PerplexityBot`.
  - Canonical `metadataBase: new URL('https://edlove.org')` with rich OpenGraph and Twitter cards in [`apps/edlove-web/app/layout.tsx`](file:///c:/x/apps/edlove-web/app/layout.tsx).
- [x] **Graceful Explore Subdomain Routing**:
  - Host routing proxy (`apps/gurudevi-web/lib/host-routing.ts`) recognizes `explore.gurudevi.app` as the sole public Explore entry point. Legacy `/explore/*` paths and direct `/explore-internal/*` access return 404, while the host proxy routes the public host to its internal implementation.
- [x] **Test Decoupling & Evidence Level G1 Verification**:
  - `apps/gurudevi-web`: **42/42 test suites, 188/188 tests passed** (15.9s).
  - `apps/edlove-web`: **2/2 test suites, 13/13 tests passed** (611ms).
- [x] **Production Bundling (G4 Turbopack Engine)**:
  - `apps/edlove-web`: **223 static pages** generated cleanly via Turbopack in **10.4s** (`force-static` SSG).
  - `apps/gurudevi-web`: **80 routes** compiled and optimized in **1.5s** (hybrid SSG + dynamic SSR sanctuary).
- [x] **Repository Identity, Provenance & Academic Citation**:
  - Root [`README.md`](file:///c:/x/README.md) overhauled with transparent "open craft" posture, dual-engine framing (EdLove Epistemic Commons vs Gurudevi Sanctuary Engine), and interactive maps.
  - Academic citation file [`CITATION.cff`](file:///c:/x/CITATION.cff) created at root.
- [ ] **Release Candidate Checkpoint Committed & Pushed**:
  - Working tree on `terrain/version-hops` staged and committed.
  - Remote branch pushed and default branch (`main-dev`) fast-forwarded/aligned.
- [ ] **GitHub Security & Visibility Flip**:
  - Private Vulnerability Reporting enabled in GitHub Settings.
  - Repository visibility flipped to Public.

---

## 2. Evidence-Based Verification Log

```text
G1 boundary / Vitest mock engine - apps/gurudevi-web: 42/42 suites, 188/188 passed.
G1 boundary / Vitest mock engine - apps/edlove-web: 2/2 suites, 13/13 passed.
G4 platform bundler / Turbopack engine - Next.js 16.4.0: 303 total routes compiled across both web applications with 0 errors.
Proves: Monorepo package resolution, host routing proxy contracts, markdown content rendering, and APCA/WCAG contrast calculation.
Does not prove: Real physical device offline SQLite synchronization, native OS back-navigation, or live network packet loss.
```

---

## 3. External Actions Requiring Explicit Approval

Under monorepo governance, the following actions require explicit founder sign-off:

1. **Commit & Push Release Candidate**:
   - Commit the working tree on `terrain/version-hops` and push to `origin/terrain/version-hops`.
2. **Promote / Align Default Branch**:
   - Merge or fast-forward `origin/main-dev` so visitors to `github.com/NeevSK/EdLove` see the latest verified code.
3. **Toggle Repository Visibility**:
   - Flip repository visibility from Private to Public in GitHub Settings.
4. **Enable Private Security Reporting**:
   - Turn on Private Vulnerability Reporting in GitHub Security Settings.
