---
title: "License Tradeoffs and Per-Project Licensing"
status: "accepted"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "ox-alpha"
tags: [licensing, open-source, adr, mit, apache, mpl, cc-by]
---

# ADR: License Tradeoffs and Per-Project Licensing

## Status

**Accepted**

## Context

Extracted projects need licenses before they can go public. The monorepo
already ships an MIT `LICENSE`. RN Terrain's June strategy doc
(`2026-06-02-rn-terrain-open-source-strategy.md`) already picked **MIT** for
code and **Creative Commons Attribution 4.0** for the Conceptual Topology
philosophy documents. This ADR records *why* those choices are right and what
the alternatives would have bought.

## Decision

| Project | License | Rationale |
|---|---|---|
| Monorepo (private) | MIT (existing) | Unchanged; irrelevant while private |
| `rn-terrain` (code) | **MIT** | Matches June strategy; maximal adoption for a tool whose moat is data + community, not code |
| `rn-terrain` docs / Conceptual Topology | **CC-BY-4.0** | Content license; share freely with attribution — protects authorship of the intellectual framework |
| `trube-art` (code) | **MIT** | Visual library; adoption beats control |

## Tradeoff analysis

### MIT
- **Grants:** use, modify, sell, sublicense — keep copyright notice.
- **Get:** maximum adoption; zero friction; what the RN ecosystem expects.
- **Lose:** no patent grant (theoretical risk), forks can go closed.
- **Right when:** you want your tool/library used everywhere and your moat is
  something other than the code (data, community, brand).

### Apache-2.0
- **Adds over MIT:** explicit patent grant, trademark clause, NOTICE file,
  contribution terms baked in.
- **Costs:** slightly heavier compliance; some contributors find it formal.
- **Right when:** corporate/legal-heavy ecosystems or patent-laden domains
  (compilers, ML runtimes). Overkill for a solo-dev CLI and a Skia art library.

### MPL-2.0 (copyleft, file-level)
- **Adds over MIT:** changes to licensed *files* must stay open.
- **Get:** fork-protection with permissive linking.
- **Costs:** scares off some commercial adopters; awkward in RN bundling
  contexts; more licensing questions than answers for a small project.

### GPL/AGPL
- **Get:** strongest copyleft — forks must open up.
- **Costs:** many companies forbid it entirely; kills the community flywheel
  that RN Terrain's strategy depends on. Wrong tool here.

### CC-BY-4.0 (not a code license)
- **For:** documents, frameworks, datasets — the Conceptual Topology essays.
- **Key property:** attribution travels forever ("Always credit Neev").
- **Never use for code:** no patent/patent-adjacent protections, not designed
  for software semantics.

## Why permissive fits *this* portfolio specifically

RN Terrain's own strategy names the defense against closed forks: the event
log is the moat, the community trust follows the original, and forks start at
reputation zero. That argument only works if the license lets everyone in —
hence MIT. The same logic applies to trube-art: its value is craft and brand,
not secrecy of source.

If a future extracted package ever carries real patent exposure (e.g., native
FFI work from `docs/Advanced Rust CPP`), revisit Apache-2.0 for that repo only.

## Consequences

- Each extracted repo gets an MIT `LICENSE` at root; philosophy/docs folders
  carry a CC-BY-4.0 notice where applicable.
- No NOTICE files required under MIT; README attribution lines recommended.
- npm publishing later uses the same license field as the repo.

## References

- Openness strategy: [2026-08-24-openness-and-reuse-strategy.md](./2026-08-24-openness-and-reuse-strategy.md)
- Prior art: `choosealicense.com` (MIT, Apache-2.0, MPL-2.0, CC-BY-4.0 pages)
