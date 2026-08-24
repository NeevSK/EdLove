---
title: "WEB PLATFORM STATUS"
status: "active"
created: 2026-04-18
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, edlove-web, historical]
---

# WEB PLATFORM STATUS
## Cross-Site Migration Snapshot | April 17, 2026

**Scope**: `apps/edlove-web`, `apps/intuitui-web`, `apps/neevsk-web`, `apps/gurudevi-marketingWeb`  
**Out of Scope**: `apps/gurudevi-mobile` except where shared package boundaries affected web builds  
**Purpose**: Give future sessions a reliable, current baseline for what was upgraded, what is healthy, and what still needs care.

---

## EXECUTIVE SUMMARY

As of **April 17, 2026**:

- `edlove-web` is upgraded onto the Astro 6 line and is in a good baseline state.
- `intuitui-web` is upgraded and healthy.
- `neevsk-web` is upgraded, including content-layer migration work required by newer Astro.
- `gurudevi-marketingWeb` is substantially healed and passes `astro check`, but local Windows Vercel adapter packaging still fails at the symlink step.

The most important architectural lesson from this migration is:

**Broad barrel imports from shared cross-platform packages are dangerous for web builds.**

They tend to pull in React Native, Expo, NativeWind, or mobile-only dependencies even when the web app only needs a tiny subset of functionality.

---

## VERSION BASELINE

## CURRENT DOMAIN BASELINE

These sites are currently hosted as EdLove subdomains and all metadata, sitemap, and machine-readable endpoint work should follow that reality unless explicitly updated later.

- `edlove-web` -> `https://edlove.org`
- `intuitui-web` -> `https://intuituilabs.edlove.org`
- `neevsk-web` -> `https://neevsk.edlove.org`
- `gurudevi-marketingWeb` -> `https://gurudevi.edlove.org`

Important rule for future sessions:

- do not assume future standalone domains unless the user explicitly confirms a production move
- if standalone domains are adopted later, update site metadata helpers, Astro `site` config, sitemap references, and AI-orientation files together

---

### Web Stack Baseline

- `astro`: `^6.1.7`
- `svelte`: `^5.55.4`
- `@astrojs/svelte`: `^8.0.5`
- `@astrojs/check`: `^0.9.8` where used
- `@tailwindcss/vite`: `^4.1.18`
- `typescript`: `^5.9.x`

### React Baseline

The monorepo already pins React-related versions via root overrides aligned with the current mobile stack. That means:

- Web React usage should stay aligned with the repo-wide React version.
- Do not casually leapfrog React versions inside a single app while `gurudevi-mobile` still shares the same root dependency policy.

---

## CURRENT APP STATUS

### `edlove-web`

**Status**: Healthy baseline plus Phase 1 AI-native foundations implemented

What is true now:

- Astro dependencies were upgraded onto the Astro 6 line.
- `astro build` passes.
- `astro check` passes with only non-blocking hints.
- The site now emits:
  - canonical metadata
  - Open Graph and Twitter metadata
  - JSON-LD via a shared layout helper
  - `robots.txt`
  - `llms.txt`
  - `knowledge.json`
  - `sitemap-index.xml`
- Content collections were migrated to Astro 6's loader-based content config so machine-readable endpoints are populated from real content.

Current risk level:

- Low

---

### `intuitui-web`

**Status**: Healthy baseline

What is true now:

- Astro and Svelte were upgraded successfully.
- `astro check` passes.
- `astro build` passes.

Current risk level:

- Low

---

### `neevsk-web`

**Status**: Healthy after migration work

What is true now:

- Astro and Svelte were upgraded successfully.
- Astro content configuration was migrated to the newer content-layer structure.
- `astro check` passes.
- `astro build` passes.

Current risk level:

- Low to medium

---

### `gurudevi-marketingWeb`

**Status**: Mostly healed, final local deployment packaging issue remains

What is true now:

- Astro and Svelte were upgraded successfully.
- Vercel adapter wiring was added.
- `astro check` passes.
- The site can now complete the main Astro build and prerender phases.

What still fails:

- local Windows Vercel adapter packaging

Observed failure:

- the `@astrojs/vercel` packaging phase tries to create symlinks under `.vercel/output`
- on the current Windows environment this throws `EPERM`

Interpretation:

- this is no longer primarily an Astro migration problem
- it is now a local platform packaging issue

Current risk level:

- Medium

---

## SHARED PACKAGE LESSONS

The migration surfaced a structural problem that will matter for all future web work:

### Problem

Shared packages like `@repo/ui` and `@repo/core` expose large root barrels that mix:

- web-safe utilities
- framework-neutral logic
- React hooks
- React Native components
- Expo integrations
- runtime-specific helpers

For Astro and static-first websites, this is fragile.

### Principle going forward

Prefer **narrow subpath imports** over broad package barrels.

Examples of the better pattern:

- `@repo/core/forms/form-manager`
- `@repo/core/utils/validators`
- `@repo/ui/components/SanctuaryButton`
- `@repo/ui/gluestack`

Do not default to:

- `@repo/core`
- `@repo/ui`

unless the app truly needs the whole exported surface and that surface is guaranteed web-safe.

---

## RECOMMENDED NEXT STEPS

### Immediate

1. Verify `gurudevi-marketingWeb` packaging in CI or Linux-like environment
2. Reduce remaining broad shared imports in web-facing routes
3. Clean up remaining non-blocking warnings
4. Replicate the `edlove-web` AI-native foundation pattern into the other web apps

### Near-Term

1. Add stronger structured data coverage across all sites
2. Add clearer sitemap and machine-readable content surfaces
3. Create per-site AI-native readiness checklists

---

## RELATIONSHIP TO AI-NATIVE WORK

This migration matters for AI-native ambitions because:

- AI-friendly websites need reliable, crawlable, server-rendered content
- accidental client-only or mobile-only dependencies make pages less machine-readable
- static-first and semantic-first architecture is the best foundation for future AI-native layers

In other words:

**The upgrade work was not separate from the AI-native goal. It was foundational to it.**

---

## SEE ALSO

- [19_AI_NATIVE_WEB_ROADMAP.md](./19_AI_NATIVE_WEB_ROADMAP.md)

---

**Status**: Active  
**Last Updated**: April 17, 2026
