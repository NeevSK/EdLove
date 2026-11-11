---
title: "System model (C4, LikeC4)"
status: "active"
created: 2026-11-11
updated: 2026-11-11
author: "Naveen"
scribe: "Claude"
tags: [architecture, c4, likec4, mcp, sbom, latency, reference]
---

# System model

`gurudevi.c4` is the system as a [C4](https://c4model.com) model written in
[LikeC4](https://likec4.dev): people, apps, services, stores, outside services, and every link
between them, with versions, regions and state. Diagrams, agent queries and reports all come
from this one file, so update it when a hop changes.

## What it holds

| View | Shows |
| --- | --- |
| `index` | The landscape: people, Gurudevi, Supabase, PowerSync, GrowthBook, Doppler |
| `dataPath` | The data path in both directions, including the frozen direct table reads |
| `device` | Inside the mobile app: feature gate, local database, snapshot, device secrets |

Links carry tags for their measured state: `broken` (apps → API: Render runs the pre-v1 build),
`frozen` (direct table reads, ratchets `supabaseFromSites` and `directRpcAndRealtimeSites`),
`held` (the device upload queue, until a domain capability accepts writes).

## Commands

| Task | Command |
| --- | --- |
| Check syntax, semantics and layout drift | `pnpm exec likec4 validate docs/architecture/model` |
| Browse the diagrams locally | `pnpm exec likec4 start docs/architecture/model` |
| Export the model as JSON | `pnpm exec likec4 export json docs/architecture/model -o <file>` |
| Ask questions as an agent | the `likec4` MCP server in `.mcp.json` (20 tools: paths, incomers, outgoers, tags, views) |
| Measure every hop live | `doppler run --project gurudevi-mobile --config dev -- node scripts/probe-hops.mjs` → `reports/hops/` |
| Bill of materials | `syft scan file:pnpm-lock.yaml -o cyclonedx-json=<file>` (CycloneDX 1.7) |

Example agent question, answered by `find-relationship-paths` from `gurudevi.mobile` to
`supabase.postgres`: two paths, one through the frozen direct table API and one through the API
link tagged broken.

## What is measured and what is not

`probe-hops.mjs` measures from the machine that runs it: Postgres (connect and query), Supabase
Auth, the table API, JWKS, PowerSync, the Render API and GrowthBook, each with the version it
reports and where it resolves. It can't see server-to-server hops: Render (Singapore) → Postgres
(Mumbai) and Postgres → PowerSync (Tokyo). Those need timing from inside the API (a
`Server-Timing` header with database time per request) and PowerSync's replication lag from
`pnpm dlx powersync@0.10.3 fetch status`.

`k6`, for load and the morning burst, is not installed: its Windows installer needs
administrator approval.
