# RN Terrain (platform-side)

The RN Terrain **project itself** — packages, CLI, MCP server, VS Code extension,
and its documentation vault (architecture, Core, current_progress, decisions,
INDEX) — lives in the standalone repo [NeevSK/rn-terrain](https://github.com/NeevSK/rn-terrain).

This folder now holds only platform-side artifacts:

| Path | What it is |
|---|---|
| `landscape/` | **Generated** stack map + dependency catalog (`node scripts/stack-map.mjs`). Source of truth for annotations: `landscape/stack-map-annotations.yaml`. Never hand-edit generated files. |
| `radar/` | Gitignored local scratch from radar tooling. |

Project documentation was removed from this repo on 2026-08-24 because it was
byte-identical to the vault already committed in `NeevSK/rn-terrain`.
