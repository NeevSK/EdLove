---
title: "Gurudevi Web Hosting Topology Decision"
status: "draft"
created: 2026-08-08
updated: 2026-08-08
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, hosting, expo-web, cloudflare, routing, architecture]
---

# Gurudevi Web Hosting Topology Decision

## Decision status

Draft. No production DNS or OAuth change is authorized by this document alone.

## Options

### Separate subdomains

Marketing uses `gurudevi.edlove.org`; Expo web uses a dedicated host such as `app.gurudevi.edlove.org`. Expo can retain `baseUrl: "/"`, making assets, SPA fallback, OAuth, QR links, rollback, and caching simpler.

### Shared domain with `/app`

Marketing uses `gurudevi.edlove.org`; Expo uses `gurudevi.edlove.org/app/*`. This provides one branded host but requires proof of Expo base-path behavior, asset rewriting, SPA fallback, OAuth callbacks, QR links, service-worker scope, cache isolation, and route collision prevention.

### Combined build

Astro SSR/API behavior and Expo static export share one artifact. This is not preferred because release, cache, rollback, and build failures become coupled.

## Required proof

Before selecting `/app`, verify in preview:

- `/app/` and `/app/` refresh correctly;
- authentication and OAuth callbacks return to the correct path;
- `/app/ai` and representative deep links survive refresh;
- all JavaScript, CSS, images, fonts, and manifests resolve;
- marketing routes are not intercepted by the app fallback;
- QR/deep links and Android intent filters remain correct;
- service-worker and cache scopes do not overlap incorrectly.

The final ADR will record measured results and the chosen topology. Until then, the existing deployment remains the rollback path.
