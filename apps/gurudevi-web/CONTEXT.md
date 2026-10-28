# Gurudevi Web Context

## Purpose

`gurudevi-web` is Gurudevi's canonical browser application. It replaces the
need to maintain a separate marketing site and React Native Web surface over
time; it does not replace the native iOS and Android app.

## Product surfaces

- `gurudevi.app` (or `localhost:3000` / `public.localhost:3000`): Canonical public marketing website, stories, and school adoption (`app/(marketing)`).
- `sanctuary.gurudevi.app` (or `sanctuary.localhost:3000`): Authenticated product surface for educators, students, and administrators (`app/(sanctuary)`), guarded by Supabase session refresh in `proxy.ts`.
- `explore.gurudevi.app` (or `explore.localhost:3000`): Public guest showroom for exploring the 11 Cultural Worlds, diurnal scenes, and floor clearings.

Host routing is enforced at the edge/proxy level in `lib/host-routing.ts` and `proxy.ts`. Local testing uses standard RFC 6761 `.localhost` subdomains without modifying system hosts files.

## Architecture

- Next.js App Router with semantic HTML and CSS.
- Route groups isolate public marketing in `(marketing)` from future product
  work in `(sanctuary)` without changing public URLs.
- Design mobile-first at 360–430 px, then enhance for wider screens.
- Share domain contracts, validation, API clients, and design tokens with native
  only when they are platform-neutral. Do not share React Native UI JSX or
  introduce React Native Web here.

## Related decisions

- `docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md`
- `docs/current_progress/2026-09-12-gurudevi-web-migration-plan.md`

