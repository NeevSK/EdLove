---
title: "Gurudevi Canonical Web Migration Plan"
status: active
created: 2026-09-12
tags: [gurudevi, nextjs, migration, web]
---

# Gurudevi Canonical Web Migration Plan

## Outcome

`apps/gurudevi-web` becomes the single browser application for Gurudevi. Public visitors use `gurudevi.app`; signed-in visitors use `sanctuary.gurudevi.app`. The current Astro marketing site and Expo Metro web build remain operational until their replacement journeys are accepted.

## Phase 0: foundation

- Create the Next.js application with public and sanctuary boundaries.
- Establish mobile-first global styles, metadata, linting, and type-checking.
- Record the domain and renderer decision in the ADR.

Exit: `gurudevi-web` builds independently and its `/`, `/about`, and `/sanctuary` routes are intentional, accessible foundations rather than copied product screens.

## Phase 1: web platform ports

- Audit `@repo/core` imports and extract platform ports before importing shared logic into the web app.
- Implement the browser auth/session adapter and one explicit sign-in journey.
- Add phone-browser Playwright coverage for landing, sign-in, return navigation, keyboard use, and focus visibility.

Exit: one user can reach and leave a real authenticated web boundary without the Expo web runtime.

## Phase 2: first product slice

- Choose one primary sanctuary journey with real data and error/offline states.
- Build it with semantic HTML, CSS, and shared contracts only.
- Compare the 360-430 px browser journey against the corresponding native journey.

Exit: the slice proves visual and task parity on phone browsers and intentional enhancement on desktop.

## Phase 3: public consolidation

- Migrate public pages from `apps/gurudevi-marketingWeb` into the public route group.
- Preserve redirects, metadata, sitemap, analytics consent, and content ownership.
- Redirect `gurudevi.edlove.org` to `gurudevi.app` after production acceptance.

Exit: one repository deploys all public Gurudevi web pages.

## Phase 4: protected migration and cutover

- Migrate remaining product journeys in priority order.
- Add host routing for `sanctuary.gurudevi.app`.
- Redirect `platform.gurudevi.edlove.org` only after equivalent routes, authentication, observability, and rollback behavior are live.
- Retire the Metro web deployment last, not the mobile Expo application.

## Non-goals

- Do not rename `apps/gurudevi-mobile`.
- Do not remove React Native Web files before replacement journeys are accepted.
- Do not introduce StyleX, a second component library, or a PWA/offline rewrite during the foundation phase.
