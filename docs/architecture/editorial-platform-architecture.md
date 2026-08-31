---
title: "EdLove and GuruDevi Editorial Platform Architecture"
status: "draft"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [architecture, editorial, astro, markdown, multilingual, distribution]
---

# EdLove and GuruDevi Editorial Platform Architecture

## Decision boundary

The public websites remain separate Astro applications and deployments. The
editorial contract, validation rules, event vocabulary, and operational model
are shared. Brand presentation and publication navigation remain local to each
site.

Current canonical surfaces are:

- `https://edlove.org/journal/...`
- `https://gurudevi.edlove.org/journal/...`

The existing EdLove Markdown/MDX collections and the existing GuruDevi Astro
marketing site are the starting points.

The provider-neutral contracts now live in `packages/editorial` and are
published as `@repo/editorial` for both Astro applications. This package owns
editorial types, delivery state transitions, idempotency keys, safe dry-run
adapter behavior, and the supported LinkedIn Posts API request builder; it
does not own provider credentials.

## Logical model

```text
Publication
  -> Work
      -> Version (language, slug, body, metadata)
          -> Contribution (author, translator, editor)
          -> Rights record
          -> Distribution records
```

The first implementation may represent these records as typed frontmatter and
repository files. A later CMS or database may provide the same logical model;
it must not change canonical URL or attribution rules accidentally.

## Minimum metadata

Each work/version should support publication, title, slug, summary, author(s),
language, topics, status, publish/update dates, hero media, canonical URL,
related works, source information, license, and distribution policy.

Translations should carry a stable work identifier, a source-version link, and
a review status. Only approved translations may enter public indexes, feeds,
or alternate-language links. External republications should carry rights
metadata rather than being treated as ordinary original articles.

## Rendering responsibilities

Each site is responsible for its own brand shell, navigation, typography, and
article presentation. Shared validation should guarantee the data required for:

- canonical and alternate-language links
- Open Graph and social metadata
- Article JSON-LD
- sitemap and RSS entries
- accessible article structure
- related content

Journal frontmatter now carries the first version of the shared contract:
`workId`, `contentKind`, `authorId`, language, source, rights agreement,
translation linkage, and distribution policy. Rights evidence itself remains
private metadata and must not be rendered into public pages.

## Publishing events

Publishing should emit an `article.published` event containing a stable work
identifier, version identifier, publication, language, canonical URL, and
distribution policy. An asynchronous worker may then create social, newsletter,
or search-index jobs.

The event must be idempotent. Each downstream delivery needs its own status and
retry record so one channel cannot block or duplicate another.

The current package includes an in-memory ledger and deterministic dispatch
orchestration for tests and local dry runs. A production ledger still needs a
server-side persistence adapter (for example, a protected API/database
boundary) before live social publishing is enabled.

The reviewed persistence boundary is represented by the pending
`20260831090000_editorial_control_plane.sql` migration. It keeps rights
evidence, author records, lifecycle events, and delivery state server-owned;
`anon` and `authenticated` clients receive no direct table privileges. The
public Astro sites continue rendering reviewed Git-backed content until the API
read/write path is implemented and the migration is explicitly applied.

## Security and governance

Public rendering must never expose private contributor details, permission
evidence, unpublished drafts, or internal editorial comments. Contributor
submission and publishing authority must be separate capabilities.

No production secrets, social tokens, or rights documents belong in the Git
repository. Secrets remain in the existing environment/secrets workflow.

## Distribution capability matrix

| Channel | Current mode | Operational rule |
| --- | --- | --- |
| LinkedIn | live adapter available | Requires an approved app permission, account URN, versioned API header, and secret-managed token. |
| Medium | manual/import/RSS | Medium is not issuing new integration tokens, so do not build a new token-based publisher; use the canonical URL, import flow, or RSS. See [Medium API/Importing](https://help.medium.com/hc/en-us/articles/213480228-API-Importing). |
| Substack | manual/newsletter workflow | Keep the canonical article and newsletter copy in the ledger; send through the approved Substack publication workflow until a supported API contract is verified. |
| Facebook/Meta | dry-run adapter | Enable only after the exact Page/Instagram surface, permissions, app review, and response contract are verified for the target account. |

The LinkedIn implementation follows the current [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
request shape and records the returned post identifier in the delivery ledger.

## Migration path

1. Add journal schemas and routes to both Astro sites.
2. Extract only genuinely duplicated validation and metadata logic.
3. Add RSS, sitemap, structured data, OG generation, and analytics.
4. Add publication events and a delivery ledger.
5. Add public author profiles and reviewed translation routes.
6. Add social/newsletter adapters.
7. Add a CMS or contributor portal only when Git is a demonstrated workflow
   bottleneck.
