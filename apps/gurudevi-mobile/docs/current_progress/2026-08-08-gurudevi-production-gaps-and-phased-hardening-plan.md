---
title: "Gurudevi Production Gaps and Phased Web Hardening Plan"
status: "active"
created: 2026-08-08
updated: 2026-08-08
author: "Codex"
tags: [gurudevi, production, web, seo, accessibility, security, dependencies, ux]
---

# Gurudevi Production Gaps and Phased Web Hardening Plan

## Purpose

This document records the gap audit for the Gurudevi marketing site, EdLove publishing site, and Gurudevi Expo web surface. It turns the audit into an executable sequence so that functional code can mature into a trustworthy, elegant, mobile-first public experience.

## Current assessment

The applications have a functioning technical foundation, but they are not yet production-polished. The largest unfinished areas are exact brand assets, mobile interaction quality, SEO verification, legal/trust content, privacy-safe analytics, link integrity, accessibility, performance, and hosting proof.

The current temporary Gurudevi SVG mark is an approximation. It is not an exact vector trace of the supplied PNG and must not be treated as the final brand asset.

## Phase 0 — Evidence and constraints

- Preserve the existing dirty worktree and unrelated changes.
- Treat `E:\gurudevi\Gurudevi-logo.png` as the visual source of truth.
- Keep Expo SDK 57 and the repository's sacred native dependency pins unchanged during web dependency refreshes.
- Use stable dependency versions for production sites; avoid TypeScript release candidates.
- Keep EdLove as the canonical home for research and philosophical intellectual property.
- Do not choose the `/app` hosting topology until preview tests prove assets, refresh, OAuth, QR links, service workers, and cache isolation.

## Phase 1 — Immediate trust and discoverability foundation

### Dependency hygiene

- Refresh Astro, Astro integrations, Svelte, Tailwind, TypeScript, linting, testing, and other safe web dependencies.
- Do not bulk-upgrade Expo/native packages.
- Run web builds, type-checks, and dependency audits after the update.
- Record any package that remains pinned for compatibility.

### SEO and metadata

- Use one canonical metadata implementation per site.
- Normalize canonical URLs to the configured production origin plus pathname, without query strings or fragments.
- Add verified Open Graph/Twitter image assets and ensure every referenced image exists.
- Add `Article`, `Research`, `Essay`, `FieldNote`, `BreadcrumbList`, and `Organization` structured data where appropriate.
- Make preview/staging deployments `noindex`.
- Validate robots, sitemap, canonical, redirects, Open Graph, feeds, and alternate-language links after deployment.

### Link integrity

- Remove `#` placeholder links.
- Centralize branded destinations, social links, support addresses, canonical URLs, and app URLs.
- Add automated internal/external link checks.
- Confirm old domains and route variants have deliberate redirect or canonical behavior.

### Trust and privacy

- Reconcile analytics behavior with privacy claims.
- Do not initialize PostHog without a configured public key and appropriate consent policy.
- Expand privacy policies with controller identity, data categories, purposes, retention, legal basis, vendors, children/student safeguards, rights, deletion, contact, and jurisdiction.
- Add usable Terms of Use for each public site.
- Add baseline security headers and review public API endpoints for authentication, rate limiting, and abuse controls.

## Phase 2 — Brand and mobile-first experience

- Perform exact logo tracing and create clean brand variants.
- Decide whether the wordmark uses a licensed font or outlined SVG artwork while preserving live accessible text.
- Redesign the marketing homepage around 360px, 390px, and 430px widths first.
- Verify touch targets, focus states, menu focus trap, safe areas, reduced motion, and Sinhala/Tamil wrapping.
- Optimize font and image loading for low-bandwidth connections.
- Test real devices before desktop refinement.

## Phase 3 — Publishing and content quality

- Complete EdLove article layouts with reading progress, table of contents, related work, authorship, dates, licenses, sources, canonical attribution, and RSS/Atom.
- Add a small number of reviewed initial publications rather than placeholder volume.
- Distinguish research, philosophical interpretation, product vision, founder statements, and early observations.
- Link Gurudevi summaries to canonical EdLove sources.

## Phase 4 — Hosting and operational proof

- Build independent preview deployments for marketing and Expo web.
- Compare separate subdomains with the `/app` path using measured tests.
- Verify deep-link refresh, OAuth callback URLs, QR links, manifest scope, service-worker scope, cache isolation, and rollback.
- Add monitoring, error reporting, uptime checks, deployment metadata, and rollback instructions.
- Only then finalize DNS, redirects, and public canonical hosts.

## Definition of production-ready

- All public routes render correctly on mobile and desktop.
- No placeholder links, unsupported statistics, missing social images, or contradictory privacy claims remain.
- Search Console accepts the canonical model and sitemap.
- Privacy, terms, account deletion, support, and attribution are usable and accurate.
- Builds, type-checks, lint, link checks, accessibility checks, and critical browser flows pass.
- Hosting topology has preview evidence and rollback procedures.

## Current implementation log

- Documentation and architecture decisions: completed.
- Centralized Gurudevi links and zero-state statistics: completed.
- Initial EdLove article route and feed foundation: completed.
- Exact logo tracing: pending.
- SEO asset, canonical, metadata, security-header, and reduced-motion foundation: completed.
- Source PNG logo is now used in the marketing header/footer; exact SVG tracing remains a separate brand-fidelity task.
- First-draft Privacy Policy and Terms of Use pages, account deletion guidance, and opt-in analytics consent: completed pending legal review.
- Gurudevi definition synchronized across marketing `llms.txt`, marketing knowledge JSON, mobile `robots.txt`/`llms.txt`, mobile metadata, and welcome/consent surfaces.
- Shared public destinations and support contacts centralized for mobile/shared UI, profile, library, QR/deep-link utilities, form builder, and marketing pages.
- Live Search Console verification and deployment checks: pending.
- Dependency refresh: Phase 1 in progress.
