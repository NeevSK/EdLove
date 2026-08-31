---
title: "Editorial Publishing Future Directions"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [edlove, gurudevi, editorial, roadmap, multilingual, contributors]
---

# Editorial Publishing Future Directions

This document describes the direction beyond the first Git-backed publishing
implementation. It is deliberately evolutionary: future capabilities should
be added when the editorial workload justifies them.

## Distribution horizon

The canonical article may be adapted for LinkedIn, Medium, Substack,
Facebook, Instagram, newsletters, RSS, and future channels. Each channel gets
an intentional variant rather than an unedited copy of every article.

Distribution records should preserve the destination account, external URL,
publication status, canonical URL, campaign parameters, and withdrawal state.

## Language horizon

English, Sinhala, and Tamil should be modelled as versions of one work. A
translation has its own title, slug, metadata, reviewer, status, and publication
date while remaining linked to the source work.

The desired workflow is:

```text
Original published -> translation requested -> translated -> reviewed -> published
```

Machine assistance may help draft a translation, but it should not be the final
quality or cultural authority.

## External work and curation

The platform should support three distinct forms:

1. **Curation:** a link and a short original editorial note.
2. **Licensed republication:** the full work appears with explicit permission,
   attribution, license, and any expiry or takedown terms.
3. **Guest contribution:** a writer creates work specifically for EdLove or
   GuruDevi under an agreed contributor arrangement.

Arbitrary scraping or full-text republishing without permission is not a
publishing strategy.

## Contributor horizon

As participation grows, introduce submissions, author profiles, editorial
roles, review queues, comments, revisions, scheduling, rights agreements,
corrections, takedowns, and audit history.

Contributors should submit drafts; publishers should control what becomes
public. The system must support contributor, translator, editor, reviewer,
publisher, and administrator roles without giving every writer publishing
authority.

## Possible later capabilities

- Browser-based CMS backed by the canonical content repository
- Scheduled publishing and embargoes
- Translation management and glossary support
- Newsletter editions and subscriber segmentation
- Automated social-image variants
- Search across publications and languages
- Article performance and referral dashboards
- Contributor portal with rights and consent records
- Portable exports in Markdown, RSS, JSON, and EPUB-like formats

These are directions, not commitments. The current Markdown and Astro approach
should remain viable throughout the transition.
