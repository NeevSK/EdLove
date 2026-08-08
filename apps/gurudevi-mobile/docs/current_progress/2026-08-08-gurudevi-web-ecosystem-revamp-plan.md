---
title: "Gurudevi Web Ecosystem Revamp Plan"
status: "active"
created: 2026-08-08
updated: 2026-08-08
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, web, marketing, mobile-first, hosting, education-ecology]
---

# Gurudevi Web Ecosystem Revamp Plan

## Purpose

Gurudevi is a sanctuary and education ecology support system for Sri Lanka. Teachers remain the first-class design beneficiary, while the product is intentionally polycentric and holonic: educational interventions must connect teachers, students, principals, administrators, schools, and communities without reducing any role to a subordinate data source.

This plan covers the marketing web overhaul, honest statistics, brand materialization, configurable links, EdLove publishing integration, and a measured hosting decision.

## Product model

The five pillars are:

- **Self** — wellbeing, reflection, energy, and identity.
- **Workspace** — the former Classroom pillar at a higher abstraction level:
  - teachers use the **Classroom workspace**;
  - principals and administrators use the **School workspace**;
  - students use the **Learning Studio**.
- **Library** — shared knowledge and learning resources.
- **Community** — relationships, collaboration, and collective practice.
- **Profile** — identity, roles, boundaries, permissions, and context switching.

Learning Studio includes learning, practice, creation, reflection, collaboration, and student-owned progress; it is not an assignment-only dashboard.

## Delivery sequence

1. Establish the copy, link, stats, and content contracts.
2. Redesign and verify the marketing site mobile-first at 360px, 390px, and 430px widths.
3. Materialize the supplied logo and generated typeface reference without shipping an image as a font.
4. Add the EdLove article metadata and reading surface.
5. Prove root-host and `/app` Expo deployment behavior before changing production DNS.

## Acceptance criteria

- All public Gurudevi statistics are honest zero-state values.
- Social, EdLove, Intuitui Labs, app, and founder links come from centralized configuration.
- Marketing copy explains the connected ecology while preserving teacher-first support.
- Mobile browsers receive a first-class experience with accessible navigation and no hover dependency.
- EdLove remains the canonical home for philosophical and research intellectual property.
- Hosting topology is selected from measured proof of subdomain and `/app` behavior.

## Verification

- Marketing build, type-check, lint, route, link, SEO, accessibility, and performance checks.
- Mobile menu keyboard/focus/scroll-lock checks.
- Sinhala/Tamil/English wrapping checks.
- Expo root-host export and `/app` proof checks.
- OAuth, QR/deep-link, manifest, service-worker, and refresh/deep-link checks.
- EdLove article frontmatter, canonical, attribution, RSS, sitemap, and license checks.

## Related documents

- [Gurudevi copy and content guide](../../../gurudevi-marketingWeb/docs/Core/gurudevi-copy-and-content-guide.md)
- [Web hosting topology ADR](../decisions/2026-08-08-gurudevi-web-hosting-topology.md)
- [EdLove content ownership and publishing ADR](../../../edlove-web/docs/decisions/2026-08-08-gurudevi-edlove-content-ownership-and-publishing.md)
