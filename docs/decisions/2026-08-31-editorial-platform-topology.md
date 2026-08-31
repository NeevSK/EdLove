---
title: "Editorial Platform Topology for EdLove and GuruDevi"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [adr, edlove, gurudevi, editorial, publishing, architecture]
---

# Editorial Platform Topology for EdLove and GuruDevi

## Decision

EdLove and GuruDevi will use shared editorial infrastructure while remaining
separate publications, websites, analytics identities, and social identities.

The canonical article lives on the appropriate first-party website. Medium,
LinkedIn, Substack, Facebook, newsletters, and other platforms are downstream
distribution channels.

## Context

EdLove already contains a Markdown/MDX content system, while GuruDevi has a
separate Astro marketing application. The brands have related goals but
different editorial responsibilities. A single blended blog would make
ownership, voice, SEO, and social distribution ambiguous.

The system also needs a future path for translations, external sources, guest
authors, and larger contributor participation.

## Consequences

Positive consequences:

- Shared validation and publishing automation without brand blending
- Clear canonical URLs and attribution
- Independent analytics and social audiences
- A gradual path from Git-backed content to a CMS
- Explicit support for rights, translations, and contributors

Costs and constraints:

- Two sites need coordinated metadata and release checks
- Social integrations require an asynchronous delivery ledger
- Editorial governance must be designed before opening submissions
- Translation and rights records add operational work

## Rejected alternatives

### One blended public blog

Rejected because publication identity, tone, canonical ownership, and audience
would become unclear.

### Separate infrastructure with no shared contract

Rejected because schemas, SEO behavior, accessibility, distribution, and rights
handling would drift and be duplicated.

### Database-first CMS

Deferred because the current Git-backed Markdown workflow is already present and
provides versioning, review, and rollback with less operational complexity.

## Review trigger

Revisit this decision when non-technical contributors, scheduled publishing,
translation volume, or distribution volume makes repository-based authoring a
material bottleneck.
