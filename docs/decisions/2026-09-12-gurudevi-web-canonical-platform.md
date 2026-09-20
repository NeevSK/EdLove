---
title: "ADR: Gurudevi Canonical Web Platform"
status: accepted
date: 2026-09-12
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, web, nextjs, architecture, domains]
---

# ADR: Gurudevi Canonical Web Platform

## Decision

Gurudevi will have one canonical browser implementation at `apps/gurudevi-web`, built with Next.js App Router. It owns both public marketing and the authenticated sanctuary. `apps/gurudevi-mobile` remains the Android and iOS Expo application and will not be renamed.

React Native Web is not the target runtime for new Gurudevi web work. The existing Metro web build is a legacy surface during migration and will be retired only after equivalent browser journeys have been accepted in the canonical web app.

## Product and domain model

| Surface | Canonical destination | Purpose |
| --- | --- | --- |
| Public Gurudevi | `https://gurudevi.app` | Marketing, learning, trust, and entry into the product |
| Authenticated Gurudevi | `https://sanctuary.gurudevi.app` | The browser sanctuary for signed-in people |
| Native Gurudevi | Android and iOS apps | Device-native Gurudevi experience |

`gurudevi.edlove.org` and `platform.gurudevi.edlove.org` become redirect-only legacy entrances once the appropriate destinations are live. `apps/edlove-web` remains separate because it is the wider EdLove editorial and ecosystem site.

### Domain Consolidation & Country-Code TLD (.lk) Strategy

- **Active Canonical Runtime (Production)**: 100% standardized on `gurudevi.app` (`https://gurudevi.app` for public marketing & content, `https://sanctuary.gurudevi.app` for authenticated web workspace).
- **Official Contact Emails**: Standardized as `support@gurudevi.app`, `gratitude@gurudevi.app`, `institutional@gurudevi.app`.
- **Future Country-Code TLD Milestone (`gurudevi.lk`)**: Sri Lanka country-code domain (`gurudevi.lk`) is preserved as an archived future institutional milestone when local entity incorporation and funding allow. There are zero active runtime dependencies on `.lk`. All active code and configuration strictly target `gurudevi.app`.


## Why

The existing web target already contains a substantial platform-specific renderer: 155 `.web.*` source files, direct DOM screens, browser storage adapters, and browser-specific interaction work. Continuing to add compatibility layers would preserve two renderers without giving the browser renderer full ownership of browser semantics.

The product is mobile-first, not mobile-only. On a phone browser, Gurudevi must preserve the same journey, hierarchy, language, and visual rhythm as the native application. On wider screens, it may use the browser's extra space and input capabilities deliberately.

## Architecture boundaries

Shared across web and mobile:

- domain contracts, validation, permissions, translation, and API clients;
- repository ports and platform-neutral business logic;
- brand assets and design-token source values.

Deliberately separate:

- UI trees, screens, layouts, navigation, forms, scrolling, and focus behavior;
- browser and device capability adapters;
- web CSS and native styling/animation implementations.

No shared UI JSX is a migration goal. Experience parity is required; renderer parity is not.

## Implementation principles

- Semantic HTML and browser-native controls own the web surface.
- The web design starts at 360-430 px wide, then earns desktop enhancement.
- The public site and sanctuary can share one repository while maintaining separate route layouts and performance budgets.
- No production page may present a simulated authentication or data experience as complete.
- `sanctuary.gurudevi.app` DNS and host routing are configured only when deployment infrastructure is ready; `/sanctuary` is the temporary foundation route.

## Consequences

This creates an intentional second UI implementation. The cost is accepted because the repository already carries most of that cost implicitly. The migration must be incremental, journey-led, and backed by phone-browser Playwright coverage before legacy Metro routes are retired.
