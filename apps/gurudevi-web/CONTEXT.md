# Gurudevi Web Context

## Purpose

`gurudevi-web` is Gurudevi's canonical browser application. It replaces the
need to maintain a separate marketing site and React Native Web surface over
time; it does not replace the native iOS and Android app.

## Product surfaces

- `gurudevi.app` is the canonical public website.
- `sanctuary.gurudevi.app` is reserved for the future authenticated product.
- Until host-based routing is configured in deployment, the sanctuary is
  represented by the temporary `/sanctuary` route.

The app currently has an intentionally minimal public foundation and an honest
sanctuary placeholder. It has no authentication, production data, or deployment
configuration yet.

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

