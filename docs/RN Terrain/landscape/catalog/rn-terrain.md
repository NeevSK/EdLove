# RN Terrain suite — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · 4 members in this monorepo

RN Terrain is the orientation layer: maps the ecosystem (external landscape) and this monorepo (stack-map).

## Suite members

| Package | Purpose | External deps |
| :--- | :--- | :--- |
| [@rn-terrain/cli](../stack-map.md#rn-terraincli) | rn-eval CLI — render RN Terrain vitality verdicts for any package from the terminal. | cac, chalk, consola |
| [@rn-terrain/core](../stack-map.md#rn-terraincore) | RN Terrain intelligence core — vitality scoring, versions, vendor signals (Supabase-backed). | @supabase/supabase-js, dotenv, semver, zod |
| [@rn-terrain/mcp](../stack-map.md#rn-terrainmcp) | MCP server exposing terrain intelligence to AI coding agents. | @modelcontextprotocol/sdk |
| [@rn-terrain/vscode](../stack-map.md#rn-terrainvscode) | VS Code extension — package intelligence/compat hover cards straight in package.json. | — |

## Related documents

- `landscape/` — ecosystem giants this project stands on (external map)
- `stack-map.md` — this monorepo (internal map)
- `catalog/*.md` — per-app dependency footprints

