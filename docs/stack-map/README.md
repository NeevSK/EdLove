---
title: "Stack Map (platform-side)"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "NeevSK"
tags: [stack-map, generated, tooling]
---

# Stack Map

This folder holds the **generated architecture map** of the monorepo and its
tooling artifacts. It was renamed from `docs/RN Terrain/` on 2026-08-24 after
the RN Terrain project moved to its own repo.

The RN Terrain **project itself** — packages, CLI, MCP server, VS Code extension,
and its documentation vault — lives in [NeevSK/rn-terrain](https://github.com/NeevSK/rn-terrain).

| Path | What it is |
|---|---|
| `landscape/stack-map.md` | **Generated** master stack map (`node scripts/stack-map.mjs`). Never hand-edit. |
| `landscape/catalog/*.md` | **Generated** per-app dependency sheets. Orphans auto-pruned on regen. |
| `landscape/dependency-catalog.md` | **Generated** external dependency footprint (`pnpm run stack-map:deps`). |
| `landscape/stack-map-annotations.yaml` | **Curated source of truth** — edit this, then regenerate. |
| `landscape/dependency-annotations.yaml` | **Curated** external-dep annotations (sacred pins documented here). |
| `radar/` | Tracked technology-radar research: ADOPT/TRIAL/ASSESS/HOLD verdict records for considered dependencies. |

Workflow: edit annotation YAML → `pnpm run stack-map` → commit generated output.
See `AGENTS.md` for the full contract.
