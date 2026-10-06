---
title: "Gurudevi Web Implementation Plan"
status: active
created: 2026-09-26
updated: 2026-09-26
tags: [gurudevi, nextjs, implementation, phases]
---

# Gurudevi Web Implementation Plan

## Decisions (Locked)

| Decision | Resolution | Rationale |
|----------|------------|-----------|
| Offline persistence (web) | **Deferred** — no IndexedDB/PowerSync Web in Phase 1-2 | Simplifies slice; mobile handles offline; web can add later |
| `.lk` domain | **Sibling** — `gurudevi.lk` mirrors `gurudevi.app` via redirect/config | Canonical remains `.app`; `.lk` ready when entity incorporated |
| Auth session (web) | **Shorter** — 7 days default, "Remember me" extends to 30 days | Web higher risk; matches industry practice; mobile stays 30d |

---

## Phase 1: Web Platform Ports — Complete Auth Boundary (Week 1)

**Exit:** User signs in → reaches sanctuary → signs out, entirely in Next.js, verified by Playwright on 360-430px viewport.

### Tasks

| # | Task | Acceptance |
|---|------|------------|
| 1.1 | Add Playwright config with mobile viewport project | `pnpm test:e2e` runs headless |
| 1.2 | E2E: Landing → Sign In → Sanctuary → Sign Out | 5 specs pass on mobile viewport |
| 1.3 | E2E: Keyboard navigation + focus visibility | Tab order, focus rings, skip links work |
| 1.4 | E2E: Return navigation (back button, deep links) | Browser back/forward restores state |
| 1.5 | Harden `browserAuth.ts` — refresh rotation, error surfaces | No silent failures; errors map to `ErrorState` |
| 1.6 | Add `AuthProvider` context for sanctuary route group | `useSession()` available in all sanctuary pages |
| 1.7 | Update auth session: 7d default, "Remember me" → 30d | Cookie max-age reflects choice |
| 1.8 | Deploy to Vercel preview; validate on real phone | Manual smoke test passes |

---

## Phase 2: First Product Slice — Self Journal (Week 1-2)

**Exit:** Self Journal at feature parity with mobile on phone browser; intentional desktop enhancement; G2/G3 tests for happy + 1 failure path. **No offline.**

### Tasks

| # | Task | Acceptance |
|---|------|------------|
| 2.1 | Wire `SelfJournalFloor` → `selfJournal.ts` + `selfApiClient.ts` | Real entries load/create/update/delete |
| 2.2 | Add loading (`BrandPulse`), empty (`BrandedEmptyState`), error (`ErrorState`) | All 3 states render correctly |
| 2.3 | Optimistic create + rollback on failure | Immediate UI update; toast on failure |
| 2.4 | G2 test: create → read → update → delete flow | Vitest + MSW mocks Supabase |
| 2.5 | G3 test: Playwright — full journey on phone viewport | Real Supabase; screenshots match mobile |
| 2.6 | Desktop enhancement: two-column layout ≥768px | CSS grid; no mobile regression |
| 2.7 | Document slice pattern in `SLICE_PATTERN.md` | Next slice starts from template |

---

## Phase 3: Public Consolidation (Week 2-3)

**Exit:** `gurudevi.app` serves all public pages from gurudevi-web; Astro site redirected. `.lk` configured as sibling.

### Tasks

| # | Task | Acceptance |
|---|------|------------|
| 3.1 | Audit `gurudevi-marketingWeb` pages vs current `(marketing)` routes | Gap list documented |
| 3.2 | Migrate missing pages | All URLs render; metadata preserved |
| 3.3 | Redirect map: old Astro URLs → new Next.js routes | 301 redirects in `next.config.ts` |
| 3.4 | Sitemap + robots + SEO parity | `pnpm build` generates correct XML |
| 3.5 | Analytics consent + PostHog migration | Events fire on both old/new |
| 3.6 | Configure `.lk` as sibling (same content, hreflang) | Both domains serve; canonical points to `.app` |
| 3.7 | Deploy to `gurudevi.app` preview; stakeholder review | Sign-off to cut DNS |
| 3.8 | Cut DNS: `gurudevi.app` → Vercel; redirect `.edlove.org` | Zero-downtime switch |

---

## Phase 4: Protected Migration & Cutover (Week 3-4)

**Exit:** `sanctuary.gurudevi.app` live; Metro web retired; all sanctuary journeys migrated.

### Tasks

| # | Task | Acceptance |
|---|------|------------|
| 4.1 | Priority migration: Workspace → Library → Explore → Community → Profile | Each slice follows `SLICE_PATTERN.md` |
| 4.2 | Host routing: `sanctuary.gurudevi.app` → `(sanctuary)` route group | Subdomain rewrites work; cookies scoped |
| 4.3 | PowerSync Web integration for real-time sync (if needed) | Multi-tab sync; conflict resolution |
| 4.4 | Observability: Sentry + PostHog + Web Vitals on sanctuary | Dashboards show session health |
| 4.5 | Rollback flag: route sanctuary → Metro web | `EXPO_PUBLIC_SANCTUARY_WEB=legacy` works |
| 4.6 | Load test: 100 concurrent sanctuary sessions | <2s p95 TTI; no 5xx |
| 4.7 | Retire Metro web build from EAS/CI | `expo export -p web` removed |

---

## Cross-Cutting Quality Gates

| Gate | Command | Evidence | When |
|------|---------|----------|------|
| Types | `pnpm check-types` | G0 | Every commit |
| Lint | `pnpm lint` | G0 | Every commit |
| Unit (G1) | `pnpm test:g1:auth-callback` | G1 | Pre-push |
| E2E (G4) | `pnpm test:e2e` | G4 | Pre-merge |
| Bundle | `pnpm build` + analyze | G0 | Weekly |
| Accessibility | `pnpm test:e2e --grep a11y` | G4 | Per slice |

---

## Phase 1 Start: Immediate Next Steps

1. **Playwright config + mobile project** (Task 1.1)
2. **5 Auth E2E specs** (Task 1.2)
3. **Keyboard/focus specs** (Task 1.3)
4. **Navigation specs** (Task 1.4)
5. **AuthProvider + session config** (Tasks 1.5-1.7)