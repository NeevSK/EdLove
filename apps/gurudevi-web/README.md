# Gurudevi Web (Next.js)

**URL**: `platform.gurudevi.edlove.org` → `gurudevi.app` (Marketing + Sanctuary)

This is the **canonical web platform** for Gurudevi — the unified browser experience that includes both public marketing and authenticated sanctuary. It uses Next.js 16 with the App Router and shares core business logic with the mobile app via `@repo/core` and `@repo/ui`.

## Platform Unification

This app is consolidating two separate web surfaces:

- **Public marketing** (from `apps/gurudevi-marketingWeb`): Philosophy, capabilities, FAQ, privacy
- **Authenticated sanctuary** (currently here): The browser-based product experience

Per ADR [`2026-09-12-gurudevi-web-canonical-platform.md`](../../docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md), this app will become the single canonical browser implementation. The Astro-based marketing site (`apps/gurudevi-marketingWeb`) will be migrated here and then deprecated.

See the implementation plan: [`2026-09-26-gurudevi-web-implementation-plan.md`](../../docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md)

## What This App Is

- **Marketing routes** (`app/(marketing)`): Public landing, support, documentation
- **Sanctuary routes** (`app/(sanctuary)`): Authenticated product experience
- **Shared contracts**: Uses the same Supabase, ZenStack authorization, and design tokens as mobile

## Tech Stack

- Framework: Next.js 16 (App Router)
- Styling: Tailwind CSS v4
- Auth: Supabase SSR
- State: React Query + Server Components
- Sharing: `@repo/core`, `@repo/ui`, `@repo/self`

## Development

### Prerequisites

- Node.js 22.x or later
- pnpm 9.x or later

### Quick Start

```bash
# From monorepo root
pnpm install

# Navigate to app
cd apps/gurudevi-web

# With Doppler (team)
doppler run -- pnpm dev

# Without Doppler (contributors)
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
pnpm dev
```

### Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start local development server at `localhost:3000` |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run linting (Biome + ESLint) |
| `pnpm check-types` | TypeScript type checking |
| `pnpm test:g1:auth-callback` | G1 boundary tests for auth flows |
| `pnpm test:e2e` | G4 browser E2E tests with Playwright |

## Architecture Notes

- **No React Native imports**: This is a pure web app — do not import React Native components
- **Semantic HTML**: Build with browser-native behavior and accessibility
- **Shared contracts**: Only platform-neutral validation, repositories, and design tokens are shared
- **Viewport**: Design from 360-430px phone viewport upward; desktop enhancement must not alter primary phone journey

## Documentation

- **Context**: See `CONTEXT.md` in this directory
- **Mobile web guide**: `apps/gurudevi-mobile/docs/web/WEB_GUIDE.md`
- **Platform readiness**: `docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md`

## Security & Authorization

- Uses the same Supabase project as mobile (via `NEXT_PUBLIC_SUPABASE_URL`)
- Authorization via ZenStack policies (`@repo/policies`) + Cedar runtime
- JWT verification on server routes via Supabase SSR
- See `docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md` for full model

## Related Apps

- **Mobile app**: `apps/gurudevi-mobile` (React Native/Expo)
- **Marketing site**: `apps/gurudevi-marketingWeb` (Astro) — ⚠️ **DEPRECATED**, migrating here
- **Sanctuary API**: `apps/sanctuary-api` (Node.js/Hono)
- **EdLove web**: `apps/edlove-web` (Astro) — Separate ecosystem site, not Gurudevi product
