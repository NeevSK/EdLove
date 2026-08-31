---
title: "Editorial Publishing Operations Guide"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [editorial, publishing, operations, rights, social, translation]
---

# Editorial Publishing Operations Guide

## Article lifecycle

```text
Idea -> Draft -> Editorial review -> Rights review -> Scheduled -> Published
  -> Distributed -> Measured -> Updated, corrected, or withdrawn
```

No external distribution should occur before the canonical article is
published or deliberately marked as an approved announcement.

## Pre-publication checklist

- Correct publication: EdLove or GuruDevi
- Clear title, summary, author, topic, and publication date
- Originality and source attribution checked
- Permission or license recorded for external work and media
- Language and translation status recorded
- Canonical URL and related content selected
- Accessible headings, links, images, and alt text checked
- Social image and channel variants reviewed
- Sensitive claims, personal information, and safeguarding risks checked

## Rights and attribution

Every external work must be classified as curated, licensed, or commissioned.
Keep the source URL, rights holder, permission evidence, license, allowed
channels, expiry date, and takedown contact where applicable.

Rights agreements are managed through the protected editorial API. Each
agreement has a stable reference, evidence record, permitted publications and
distribution channels, expiry, and takedown contact. A licensed submission may
reference only an existing agreement; creating or changing agreements is an
editorial-admin operation.

Author profiles are managed through the same protected desk. Profiles carry a
stable ID, display name, biography, optional attribution name, website, and
social links, allowing guest authors, translators, curators, and editors to be
credited without exposing private account identity.
During review, an editor may assign one of these profiles to the submission;
the assignment is persisted separately from the authenticated submitter and is
the attribution source for the later canonical work.

Corrections and takedowns should be possible without deleting the historical
record of what happened.

Contributor submissions enter as `submitted`. Editors move them through
`in_review` and, where needed, `rights_review`; only an approved submission may
be converted into a public work. Rejection and withdrawal are recorded as
states, not destructive deletion. Submitter identity is derived from the
authenticated session, while reviewer identity is recorded by the server.
The API requires curated, licensed, and translated submissions to pass through
`rights_review` before approval; licensed submissions must also carry a rights
agreement reference. This rule is enforced server-side, independent of the
client UI.
Translated submissions must additionally identify their source editorial
version, preserving lineage even when the source URL later changes.
For licensed work, submission is accepted only when the referenced agreement
permits the selected publication; approval also rejects missing, disallowed, or
expired agreements.
The authenticated mobile Editorial workspace provides the contributor form,
submission history, and admin review queue over the protected API procedures.
Its composer stores enriched Markdown as the submission body, so headings,
lists, emphasis, links, and source text remain portable and reviewable. The
app also captures publication, content kind, language, source URL, and rights
agreement reference before the request reaches the server.
Unsent drafts are persisted locally under the authenticated user’s scoped
storage key and can be explicitly discarded. Local recovery is only a
convenience: it does not create a server submission, bypass review, or expose
the draft through public routes.
The review queue returns the submitted Markdown body and provenance evidence
to the authorized contributor or editor, and the mobile desk renders the body
with the same enriched Markdown renderer used for authoring. Editors can
therefore inspect the actual submission before choosing an approval transition.

## Social distribution policy

Distribution is selected per article and per brand account. A post should
normally contain a useful hook, a clear link, correct attribution, and campaign
parameters. Channel-specific formatting is preferred to blind cross-posting.

Failures must be visible and retryable. A failed LinkedIn post must not make the
article look unpublished, and a retry must not create an accidental duplicate.

The protected API procedures at `/admin/editorial/events` and
`/admin/editorial/deliveries` persist these facts in the server-owned ledger.
The delivery procedure enforces idempotency-key ownership and the permitted
state transitions. The current channel adapters remain dry-run until provider
accounts, permissions, and secrets are configured.
The editorial desk can read the delivery ledger by channel, account, attempt
count, external URL, and failure reason, which makes retry and incident review
visible to editors.
It can also read the canonical event history, including the work/version pair
and event payload, so a delivery is always interpreted in the context of the
publication event that produced it.
When a rights agreement supplies permitted channels, the dispatcher intersects
delivery with that scope and records excluded channels as `skipped`; rights
cannot be widened by a distribution configuration alone.

LinkedIn has a live request builder in `@repo/editorial`; enable it only after
the account URN, approved permission, API version, and secret-managed token
have been configured. Medium uses manual/import/RSS because new integration
tokens are not currently issued. Substack and Meta remain manual or dry-run
until their target account and supported API permissions are verified.

## AI and crawler policy

Public journal content is intended to be discoverable for search and real-time
reference. The sites express `search=yes, ai-input=yes, ai-train=no` through
`robots.txt`. This is a usage signal, not a security boundary; private or
unpublished material must be protected by authentication, authorization, or
`noindex` controls.

The application owns the initial `robots.txt` files. If Cloudflare managed
robots or AI Crawl Control is enabled, verify the served result and document
which layer is authoritative. Do not enable a blocking or monetization policy
without checking its effect on search crawlers, article feeds, and approved
distribution workflows.

## Translation operations

Translations should identify the source version and the translator/reviewer.
Use `draft` or `in_review` while work is being checked; only `approved` may be
public. The sites automatically exclude unapproved translations from indexes,
feeds, and `hreflang` links.
Publishers should be able to leave one language in draft while the source and
other translations remain public. Language pages should expose alternate
language links and should not claim a translation exists when it does not.

## Corrections and withdrawal

For factual corrections, retain the article URL and show an appropriate update
note. For rights or safety issues, unpublish the affected representation,
record the reason and authority, and withdraw downstream distributions where
possible.
