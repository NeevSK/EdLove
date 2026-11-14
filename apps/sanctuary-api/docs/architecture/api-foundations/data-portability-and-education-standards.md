---
title: "Data Portability and Education Standards"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [api, interoperability, portability, standards, lms, erp, export]
---

# Data Portability and Education Standards

People and institutions must be able to take their data out of Gurudevi and move to
another system, and other education systems must be able to exchange data with
Gurudevi through common standards. No lock-in. This document maps each kind of data to
the standard or open format it should travel in.

It adds the portability view to the standards table in
[dependencies and evidence](dependencies-and-evidence.md#lms-standards-are-another-layer)
and the boundary rules in
[interoperability and operation semantics](interoperability-and-operation-semantics.md#standards-at-the-correct-boundary).
First-party clients keep native oRPC; standards are adapters at the edge over the same
owned capabilities, never a second implementation.

## Two directions

| Direction | Who uses it | Example |
| --- | --- | --- |
| **Export / import** | A person or institution leaving or joining | A student takes their achievements to a university; a school moves its rosters to another system |
| **Live exchange** | Another system talking to Gurudevi | A ministry system reads enrolment; an external quiz tool launches inside a classroom |

Export comes first: it's needed for trust and law, and it needs no partner.

## Mapping data to formats

| Data | Owner | Standard or format | Notes |
| --- | --- | --- | --- |
| Achievements, badges, milestones | Journey / Rewards | Open Badges 3.0 (verifiable credentials) | Final since June 2024 |
| A learner's whole record | Journey | Comprehensive Learner Record (CLR) 2.0 | Publicly available since March 2025 |
| Rosters, classes, enrolments, grades between institutions | Institution ops / Learning | OneRoster 1.2 | Listed as Final on 1EdTech's specifications page |
| Launching external learning tools | Learning | LTI 1.3 / LTI Advantage | Only if we host or embed external tools |
| Assessments and question banks | Learning | QTI | Import and export of quizzes |
| Course content packages | Library / Learning | Common Cartridge | Moving courses between systems |
| Learning activity streams | Learning | xAPI or Caliper | Only with an approved purpose; minimise and set retention first |
| Competency frameworks | Learning | CASE | If schools align to published frameworks |
| Wellbeing, journals, notes | Wellbeing | Open JSON with a manifest and schema version | No education standard fits; keep it simple and documented |
| AI memory and agent history | AI and agents | Open JSON (newline-delimited) with a manifest | No adopted standard exists as of 2026-11; watch the Portable Memory proposal |
| Files and media | Files | Original files plus a manifest | Never re-encode a person's originals for export |
| Everything else | Owner | JSON matching the v1 contract shapes, with schema version | Our own contract is the fallback format |

Status sources, checked 2026-11-02: [1EdTech specifications](https://www.1edtech.org/specifications),
[1EdTech standards roadmap](https://www.1edtech.org/standards/roadmap). The
specifications page lists older version rows than the roadmap and announcements do,
so **verify the exact version and conformance requirements on 1EdTech's pages before
implementing any of these**. No certification is claimed.

AI memory portability: there is no ratified standard. MacPaw Research published an open
proposal in July 2026
([Portable Memory](https://research.macpaw.com/publications/portable-memory)), and
vendor import tools are one-time and lossy. Our rule stays simple: a person's memories
with Gurudevi's AI are person-owned records, exportable in an open, documented format,
and deletable like any other person-owned data.

## Export as a platform service

- One `exports` service builds archives for a person or an institution. Each domain
  supplies a function that turns its facts into the agreed format. Domains don't build
  their own export screens.
- An export job is a durable operation: requested, built, available for a limited
  time, then deleted. Requesting and downloading are audited.
- A person's export includes what they own and what institutions hold about them that
  the law entitles them to. An institution's export includes its institutional records,
  not people's personal data.
- Archives carry a manifest: the formats, their versions, the schema version of every
  record, and checksums.

## Our API as an example for others

- Clean contracts: owner, then subdomain, then verb; strict schemas; typed errors.
- A published, generated description for partners (OpenAPI 3.2 is current) produced
  from the same contracts when an approved partner surface exists, not hand-written.
- Problem Details ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)) for errors on
  partner HTTP surfaces only.
- Every live-exchange surface has a named consumer before it is built.

## Decisions for the owner

- Which export formats ship first (suggested: our JSON with manifest for everything,
  then Open Badges 3.0 and CLR 2.0 for achievements).
- Whether Gurudevi hosts external tools (LTI), or only exports.
- Which institutions or ministry systems need OneRoster exchange, and when.
