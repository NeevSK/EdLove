---
title: "EdLove and GuruDevi Editorial Publishing Implementation Plan"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [edlove, gurudevi, editorial, implementation, roadmap]
---

# EdLove and GuruDevi Editorial Publishing Implementation Plan

## Objective

Create a durable publishing foundation for two separate publications with
shared editorial rules: EdLove for philosophy, research, and field work;
GuruDevi for product practice, people, schools, and platform updates.

The first implementation remains Git-backed Markdown/MDX in the existing Astro
applications. A CMS, contributor portal, and external social APIs are later
phases, activated only when the editorial workload justifies them.

## Phases

### Phase 0 — Documentation and boundaries

Status: complete

- Define the shared-infrastructure/separate-publications decision.
- Define ownership, attribution, rights, language, and editorial principles.
- Define future distribution and contributor directions.

### Phase 1 — First-party journal foundations

Status: complete

- Add typed journal collections to EdLove and GuruDevi.
- Add publication-specific journal indexes and article detail routes.
- Add draft filtering and publication dates.
- Add canonical URLs, Article JSON-LD, Open Graph metadata, and RSS feeds.
- Add language and translation-ready fields without claiming translations exist.
- Add one representative article per publication to verify the workflow.
- Publish the initial crawler/content-use policy and update machine-readable
  orientation files.

Exit criteria:

- Both sites build successfully.
- Draft articles never appear in public indexes or feeds.
- Every article has a stable canonical URL and attribution.
- Existing library and marketing routes remain intact.
- Public journal content is discoverable for search/reference while training
  use is explicitly reserved.

### Phase 2 — Shared editorial contract and quality checks

Status: complete

- Extract genuinely duplicated metadata types and validation into a shared
  package only after the two implementations stabilize.
- Add frontmatter validation for rights, source, language, and social policy.
- Add checks for duplicate slugs, missing descriptions, invalid dates, and
  accidental cross-publication duplication.
- Add a repository check command: `pnpm run check:editorial`.
- Add preview documentation and content review checklists to CI.

### Phase 3 — Distribution event pipeline

Status: foundation complete; live integration planned

- Emit an idempotent `article.published` event.
- Add a delivery ledger with per-channel status, retry, external URL, and
  withdrawal state.
- Add channel adapters for LinkedIn, Medium, Substack/newsletters, and Meta
  surfaces as accounts and API permissions become available.
- Generate channel-specific excerpts, images, links, and UTM parameters.
- Implement the provider-neutral event, delivery, idempotency, and dry-run
  adapter contracts in `@repo/editorial`.
- Implement deterministic dispatch orchestration that records processing,
  skipped, published, and failed outcomes without claiming a dry-run post was
  sent.

The current adapters intentionally run in dry-run mode. Provider credentials,
account approval, and a production persistence adapter are required before any
external post is sent.

### Phase 4 — Multilingual publishing

Status: foundation ready; integration planned

- Model translations as versions of one work.
- Add English, Sinhala, and Tamil routes with `hreflang` metadata.
- Add translator/reviewer attribution and translation status.
- Add a human review gate before a translation becomes public.
- Add public author profile records and stable author URLs to both sites.
- Add `translationStatus` metadata, public filtering, and `hreflang` links so
  Sinhala and Tamil versions can be reviewed before publication.

### Phase 5 — Curation, licensing, and guest contributions

Status: workflow foundation implemented; production deployment integration pending

- Add curated-link, licensed-republication, and guest-contribution types.
- Record rights holder, permission, license, allowed channels, and expiry.
- Add contributor profiles, Markdown submission intake, editorial review, revisions,
  corrections, and takedown workflows.
- Add typed rights-agreement and contribution records plus the server-owned
  persistence migration and app-native Markdown intake/review UI.
- Add protected API procedures for idempotent event and delivery persistence;
  direct provider calls remain gated on deployment configuration while
  contributor intake is available through the authenticated mobile workspace.
- Add authenticated contributor submission and admin review procedures with
  server-derived submitter identity and explicit review-state transitions.

### Phase 6 — CMS and editorial operations at scale

Status: planned

- Introduce a browser-based CMS or contributor portal when Git authoring is a
  demonstrated bottleneck.
- Preserve the same canonical URL, metadata, rights, and publication event
  contracts.
- Add scheduling, embargoes, newsletters, search, and performance dashboards.

## Scope discipline

Do not add a database-backed CMS, social API credentials, or public submissions
to Phase 1. Those choices create operational and legal surfaces that should be
introduced alongside the workflows that need them.

## Verification

For each implementation phase, run the touched app's typecheck, lint, tests,
and production build. Review content and test changes separately from code
changes. Run the repository anti-slop checks before merging implementation
work.
