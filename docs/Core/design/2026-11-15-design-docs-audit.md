---
title: "Design docs audit: what lived outside the repo, and where it is now"
status: "active"
created: 2026-11-15
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [docs, audit, worlds, floor, rooms]
---

# Design docs audit, 15 Nov 2026

Neev asked whether the docs and pages made in the Gurudevi project threads were in the repo, or left only on claude.ai where the context could be lost. This lists every one, where it was, and where it is now. All repo branches were searched (`git grep` for each doc's title and key sentences across every remote branch).

**Result:** none of the 15 claude.ai pages were in the repo on any branch. The three Markdown docs in the project's shared folder were already in the repo, identical, on `integrate/worlds-and-upstream` and the #151 branch. Everything is now in this branch.

## claude.ai pages

| Page | Made | Was in repo | Now |
|---|---|---|---|
| [World Model mind map and scene lab](https://claude.ai/artifact/Hd9ig5vE7Q5VcNdKrnUpjH) | 26 Oct | No | `docs/Core/design/prototypes/2026-10-26-world-model-mind-map.html` |
| [Living Sky](https://claude.ai/artifact/GrMqM4tZEqQqn25sGRJ2Qu) (prototype) | 26 Oct | No | `docs/Core/design/prototypes/2026-10-26-living-sky.html` |
| [World Atelier](https://claude.ai/artifact/NsvcH2ixJxNGyVQ6JQwa33) | 26 Oct | No | `docs/Core/design/prototypes/2026-10-26-world-atelier.html` |
| [App shell: tabs, header and FAB](https://claude.ai/artifact/Jz28DGj9tNBtBEzaqK5Hcn) | 26 Oct | No | `docs/Core/design/2026-10-26-app-shell-tabs-header-and-fab.md` |
| [Mobile: living worlds plan](https://claude.ai/artifact/Fk9nwKvrmYDC6za3Ae2fzy) | 10 Nov | No | `docs/current_progress/2026-11-10-mobile-living-worlds-plan.md` |
| [Shell Designs](https://claude.ai/artifact/RJ2wvrEALKBMX1mtc1gJf9) | 11 Nov | No | `docs/Core/design/prototypes/2026-11-11-shell-designs.html` |
| [Floor System](https://claude.ai/artifact/Qf71ycHDVzzCwFcCNx7nXp) (two tabs) | 12 Nov | No | `docs/architecture/2026-11-12-floor-system.md` and `…-component-catalogue.md` |
| [Floor Patterns](https://claude.ai/artifact/EREdoSNyw8Wfd1GSgpvbKp) (playground) | 12 Nov | No | `docs/Core/design/prototypes/2026-11-12-floor-patterns.html` |
| [Floor Arranging](https://claude.ai/artifact/Nh8Nk1Fpie9hxbHbzLRRxy) (drag-and-drop prototype Neev rejected) | 12 Nov | No | `docs/Core/design/prototypes/2026-11-12-floor-arranging.html` |
| [Mobile rooms catch-up plan](https://claude.ai/artifact/S9VpTLGx5eJkzoB7puHcCr) | 12 Nov | No | `docs/current_progress/2026-11-12-mobile-rooms-catch-up-plan.md` |
| [Layout systems: what exists](https://claude.ai/artifact/Kx7w7KfwomZYYttW3pArgR) | 13 Nov | No | `docs/architecture/2026-11-13-layout-systems-mobile-and-web.md` |
| [Layout history: day one to one system](https://claude.ai/artifact/MiDUdq3GZopYLS9Dv3zwF9) | 13 Nov | No | `docs/architecture/2026-11-13-layout-history-day-one-to-one-system.md` |
| [Shared rules audit](https://claude.ai/artifact/WHUGeegKrrC3nwdYnu3p5q) | 13 Nov | No | `docs/architecture/2026-11-13-shared-rules-audit.md` |
| [Sanctuary lists and terms (AppCatalog decision)](https://claude.ai/artifact/Md3ELVJZDmXvjcrogbuSRm) | 14 Nov | Partly: its result is in `docs/architecture/room-catalogs.md` on the #151 branch | `docs/decisions/2026-11-14-appcatalog-is-the-one-list.md` |
| [Living worlds elsewhere](https://claude.ai/artifact/EvVAWKsy7co32QsFetCK7r) | 15 Nov | No | `docs/Core/design/2026-11-15-living-worlds-elsewhere.md` |

Each copied doc starts with a note naming its claude.ai page. The pages stay where they are; the repo copy is the version of 15 Nov 2026. Two things could not be exported as they are: the interactive mind map inside the Floor System page (the doc points to the page), and the mobile plan and app shell pages' date and mention chips, which became plain text.

## Project shared folder (`gurudevi-ui/`)

| File | Was in repo | Now |
|---|---|---|
| `living-world-vision.md`, `ui-vision-timeline.md`, `world-model.md` | Yes, identical, as `docs/Core/design/2026-10-26-*.md` on `integrate/worlds-and-upstream` and the #151 branch | Unchanged; `world-model` now points to the reference |
| `gurudevi-living-sky.html`, `atelier/gurudevi-world-atelier.html`, `floor-patterns.html` | No | The published versions are in `docs/Core/design/prototypes/` (they are newer than the shared-folder copies) |
| Screenshots (`*.png` in `gurudevi-ui/`, `atelier/`, `ground/`, `states/`, `shared-rules/`) | No | `docs/Core/design/screens/` (worlds, atelier, ground, states, shared-rules) |
| `shared-rules/audit.py` | Yes, identical, as `scripts/shared-rules/audit.py` on the #151 branch | Unchanged |
| `shared-rules/shots.js` | No | `docs/Core/design/screens/shared-rules/shots.js` |
| `patches/*.patch` (14 Nov) | Their changes are committed on the #151 branch | Not copied: they were transport for code that is already in git |

## Project memory notes

The project's memory (notes the project's agents keep between threads) held Neev's design decisions, which were not written anywhere in the repo. They are now in `docs/decisions/2026-11-15-living-worlds-design-decisions-log.md`. The notes about branches, PRs and thread status are not copied: git and the PRs already hold that.

## Was there real documentation for the worlds?

No. There were vision and model docs from 26 Oct, and an AppCatalog reference from 14 Nov, but no current reference for the worlds system as built (twelve worlds, `resolveScene`, the ground every screen stands on, verger's stage tiers, World Behind Screens, fonts, motion, the floor and one main screen per tab). It is now `docs/Core/design/worlds-reference.md`, written from the code on the #151 branch.

## Marked superseded (not deleted)

- `docs/Core/design/2026-10-22-worlds-foundation.md`: the first components and six worlds. Current state is in the reference.
- `docs/Core/design/2026-10-26-world-model.md`: kept for its reasoning; current behaviour is in the reference.
- `docs/architecture/2026-10-28-living-worlds-real-integration-master-spec.md`: an earlier integration plan; current state is in the reference.

Nothing was deleted.
