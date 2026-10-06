# Deprecation Notice: Gurudevi Marketing Web

**Status**: Deprecated — Migrating to `apps/gurudevi-web`
**Deprecation Date**: 2026-10-02
**Target**: Complete migration to Next.js canonical platform

## Why This App Is Being Deprecated

Per ADR [`2026-09-12-gurudevi-web-canonical-platform.md`](../../docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md), Gurudevi will have one canonical browser implementation at `apps/gurudevi-web`, built with Next.js App Router. This decision was made because:

1. **Single source of truth**: Having two web implementations (Astro + Next.js) creates maintenance overhead
2. **Semantic HTML ownership**: Next.js allows the web surface to fully own browser semantics
3. **Unified deployment**: One deployment pipeline for both marketing and authenticated experiences
4. **Feature parity**: Easier to maintain consistent UX across public and authenticated surfaces

## Migration Plan

The marketing content from this Astro site is being migrated to `apps/gurudevi-web` under the `(marketing)` route group. See the implementation plan: [`2026-09-26-gurudevi-web-implementation-plan.md`](../../docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md)

### Phase 3: Public Consolidation (Week 2-3)

**Exit**: `gurudevi.app` serves all public pages from gurudevi-web; Astro site redirected.

- Audit marketing pages vs current `(marketing)` routes
- Migrate missing pages to Next.js
- Configure redirect map: old Astro URLs → new Next.js routes
- Sitemap + robots + SEO parity
- Analytics consent + PostHog migration
- Deploy to `gurudevi.app` preview; stakeholder review
- Cut DNS: `gurudevi.app` → Vercel; redirect `.edlove.org`

## For Contributors

**Do not** make changes to this app. All new marketing/web work should go to `apps/gurudevi-web`.

If you need to update marketing content:
1. Check if the page already exists in `apps/gurudevi-web/app/(marketing)`
2. If yes, update it there
3. If no, create it in `apps/gurudevi-web/app/(marketing)` following the existing pattern

## Historical Context

This Astro-based marketing site served Gurudevi well during early development. Its separation from the authenticated web was a deliberate boundary during the mobile-first phase. As the platform matures toward a unified web presence, consolidating into a single Next.js app simplifies the architecture and improves maintainability.

## Related Documentation

- ADR: [`2026-09-12-gurudevi-web-canonical-platform.md`](../../docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md)
- Implementation Plan: [`2026-09-26-gurudevi-web-implementation-plan.md`](../../docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md)
- New Home: [`apps/gurudevi-web/README.md`](../gurudevi-web/README.md)
