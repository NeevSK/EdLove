---
title: "Reference-Project Reuse Strategy — Clean-Room Patterns from GPL-3.0 Projects"
status: "accepted"
created: 2026-08-27
updated: 2026-08-27
author: "Naveen"
scribe: "opencode"
tags: [licensing, open-source, mit, gpl, clean-room, adr, reference-projects]
---

# ADR: Reference-Project Reuse Strategy (Clean-Room Patterns)

## Status

**Accepted**

## Context

The monorepo is **transparent hosted MIT** (`2026-08-25-transparent-hosted-oss.md`):
code is public (MIT) for audit/trust, production runs on the hosted stack at
`platform.gurudevi.edlove.org`. Any code merged into this repository is therefore
released under MIT to the public.

Two GPL-3.0 open-source projects were researched as feature references:

| Project | Repo | License | What we want from it |
|---|---|---|---|
| **quirk** | `Flaque/quirk` | GPL-3.0 | Guided reflection exercises (thought record wizard), thinking-trap awareness, follow-up/spaced review, check-in rhythm, micro-lesson content rendering |
| **ReadAny** | `codedogQBY/ReadAny` | GPL-3.0 | Local-first reader domain (EPUB/PDF), annotation model (highlight/note/tag), RAG over a personal corpus, TTS queueing, reading analytics |

Both are **published under GPL-3.0**. GPL-3.0 is strong copyleft: **derivative works**
(distributing copies or substantial portions of the code, or linking in ways the FSF
treats as derivative) must be licensed GPL-3.0. Merging their code — verbatim or
lightly-modified — into the MIT monorepo would force the whole distribution down to
GPL-3.0 (or be license infringement). That conflicts directly with the transparent
hosted MIT posture.

Fuente of value in these projects is not the literal code: it is the **domain model and
interaction patterns** (a structured 7-step reflection; a taxonomy of thinking traps on
standard CBT literature; a local-first annotation schema; a chunk→embed→retrieve→ground
RAG pipeline). Those are ideas and techniques, not copyrightable expression. We can
research them freely, then author our own implementation.

## Decision

**Study the projects, reimplement the patterns. Never vendor or copy their code.**

1. **Research is unrestricted.** Reading repos, docs, screenshots, and architecture
   discussions to extract *what* a feature does (state model, steps, UX beats) is fine.
2. **Zero GPL code enters the monorepo.** No verbatim (or near-verbatim) file, function,
   string, or asset copy — with or without attribution. Our own authors write the
   implementation with the same stack (`PowerSync`, `drizzle-orm`, `@repo/ui`, `bioeme`).
3. **Public-domain grounding.** Where the source project itself derived domain content
   from the open literature (e.g., classic cognitive-distortion lists, spaced-repetition
   schedules), we author our own catalog/descriptions independently, with our own
   examples, and label the content for our own audience (students + teachers in the
   Gurudevi sanctuary vocabulary). No wholesale reproduction, even of "idea lists".
4. **Keep a research ledger.** Integration plans note `inspiration: quirk` /
   `inspiration: ReadAny` per feature. Attribution stays at the "inspired by" level,
   which is both honest and legally clean.
5. **Re-evaluate before adopting Off-the-Shelf deps.** If a later step wants a real
   third-party dependency (e.g., `sqlite-vec`, `foliate-js`, `webdav`), check **its**
   license independently and record it in the dependency catalog. A permissive dep is
   fine; a GPL dep is opted into deliberately or rejected.
6. **This covers downstream suggestions too.** RAG-over-curriculum, TTS accessibility,
   multi-backend sync, annotations, and knowledge-graph features are all built fresh once
   the direct features land.

## Why clean-room is *also* the product test

The monorepo's own quality rules (`AGENTS.md`, slop list) demand no dead abstractions,
no near-copy duplication, and honest types. A fresh implementation that goes through the
existing feature registry, `@repo/ui` motion tokens, and `@repo/core` data layer is
forced to integrate with what exists — a copy-paste would not. Clean-room, in this repo,
is not only the licensing answer; it is the integration answer.

## Scoped license risk (non-code)

- **Standard field vocabulary** (cognitive distortions, spaced repetition) is not
  copyrightable, but *specific expression* is. We write our own definitions/examples.
- **Data schemas** are generally not protectable as expression, but we author our own
  table/schema design aligned to PowerSync + drizzle conventions.
- **Screenshots/UX flows** observed via research inform behavior; our visuals use
  Gurudevi's own design tokens and components.

## Consequences

- No GPL license headers or notices will ever be required in this repo from these
  projects; but contributors must treat the "study, don't copy" rule as a hard gate.
- Feature plans referencing quirk/ReadAny mark `inspiration:` in their docs.
- If a future decision changes the monorepo to a copyleft license, this ADR must be
  revisited (the constraint then largely evaporates).
- Community contributors should be pointed at this ADR when proposing "just add the
  quirk code" style suggestions.

## References

- Transparent hosted posture: [2026-08-25-transparent-hosted-oss.md](./2026-08-25-transparent-hosted-oss.md)
- License tradeoffs (MIT chosen): [2026-08-24-license-tradeoffs.md](./2026-08-24-license-tradeoffs.md)
- Feature integration plan (priorities): `apps/gurudevi-mobile/docs/current_progress/2026-08-27-oss-pattern-integration-plan.md`
- Reference projects (study only): `Flaque/quirk` (GPL-3.0), `codedogQBY/ReadAny` (GPL-3.0)